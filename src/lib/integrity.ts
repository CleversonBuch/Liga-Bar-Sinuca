import { SupabaseClient } from '@supabase/supabase-js'

/**
 * Motor Central de Integridade do Sistema.
 * 
 * Recalcula TODOS os dados derivados (stats de jogadores, rankings, títulos)
 * a partir da fonte única da verdade: partidas e torneios.
 * 
 * Deve ser chamado após qualquer operação destrutiva:
 * - Exclusão de torneio
 * - Reset de partida
 * - Exclusão de partida
 * - Reset geral do sistema
 */

// ====================================
// 1. RECALCULAR STATS DOS JOGADORES
// ====================================
export async function recomputePlayerStats(supabase: SupabaseClient) {
    // Buscar TODAS as partidas finalizadas (não-BYE, com vencedor)
    const { data: matches } = await supabase
        .from('matches')
        .select('player_a_id, player_b_id, winner_id, is_bye')
        .not('winner_id', 'is', null)

    // Buscar todos os jogadores
    const { data: players } = await supabase.from('players').select('id')
    if (!players) return

    // Calcular wins/losses/matches_played para cada jogador
    const statsMap: Record<string, { wins: number; losses: number; matches_played: number }> = {}

    // Inicializar todos os jogadores com zero
    players.forEach(p => {
        statsMap[p.id] = { wins: 0, losses: 0, matches_played: 0 }
    })

    // Iterar sobre as partidas válidas
    matches?.forEach(m => {
        if (m.is_bye) return // BYEs não contam como partida real
        if (!m.player_a_id || !m.player_b_id) return // Partidas incompletas

        const winnerId = m.winner_id
        const loserId = m.player_a_id === winnerId ? m.player_b_id : m.player_a_id

        if (statsMap[winnerId]) {
            statsMap[winnerId].wins += 1
            statsMap[winnerId].matches_played += 1
        }
        if (statsMap[loserId]) {
            statsMap[loserId].losses += 1
            statsMap[loserId].matches_played += 1
        }
    })

    // Atualizar cada jogador no banco
    for (const [playerId, stats] of Object.entries(statsMap)) {
        await supabase.from('players').update({
            wins: stats.wins,
            losses: stats.losses,
            matches_played: stats.matches_played,
        }).eq('id', playerId)
    }
}

// ====================================
// 2. RECALCULAR RANKINGS
// ====================================
export async function recomputeRankings(supabase: SupabaseClient) {
    // 1. Limpar TODA a tabela de rankings
    await supabase.from('rankings').delete().not('id', 'is', null)

    // 2. Buscar todos os torneios FECHADOS
    const { data: closedTournaments } = await supabase
        .from('tournaments')
        .select('*')
        .eq('status', 'closed')

    if (!closedTournaments || closedTournaments.length === 0) return

    // Map para acumular pontos: chave = `${player_id}_${modality}_${year}_${month}`
    const rankingMap: Record<string, {
        player_id: string
        modality: string
        year: number
        month: number
        points: number
    }> = {}

    for (const tournament of closedTournaments) {
        // Determinar data de referência (usar closed_at ou created_at)
        const refDate = tournament.closed_at ? new Date(tournament.closed_at) : new Date(tournament.created_at)
        const year = refDate.getFullYear()
        const month = refDate.getMonth() + 1

        // Pontos por modalidade
        const isB8 = tournament.modality === 'bola_8'
        const pt1 = isB8 ? 100 : 80  // Campeão
        const pt2 = isB8 ? 70 : 60   // Vice
        const ptPart = 15              // Participação

        let winnerId = tournament.winner_id
        let runnerUpId = null

        // Calculate runnerUpId from the final match
        const { data: finalMatch } = await supabase
            .from('matches')
            .select('player_a_id, player_b_id, winner_id')
            .eq('tournament_id', tournament.id)
            .not('winner_id', 'is', null)
            .order('phase', { ascending: false })
            .limit(1)
            .single()

        if (finalMatch) {
            winnerId = finalMatch.winner_id
            runnerUpId = finalMatch.player_a_id === winnerId ? finalMatch.player_b_id : finalMatch.player_a_id
        }

        // Buscar todos os participantes desse torneio
        const { data: allMatches } = await supabase
            .from('matches')
            .select('player_a_id, player_b_id')
            .eq('tournament_id', tournament.id)

        const participants = new Set<string>()
        allMatches?.forEach(m => {
            if (m.player_a_id) participants.add(m.player_a_id)
            if (m.player_b_id) participants.add(m.player_b_id)
        })

        // Atribuir pontos a cada participante
        for (const pId of Array.from(participants)) {
            let earnedPoints = ptPart

            if (pId === winnerId) earnedPoints += pt1
            else if (pId === runnerUpId) earnedPoints += pt2

            const key = `${pId}_${tournament.modality}_${year}_${month}`
            if (!rankingMap[key]) {
                rankingMap[key] = {
                    player_id: pId,
                    modality: tournament.modality,
                    year,
                    month,
                    points: 0,
                }
            }
            rankingMap[key].points += earnedPoints
        }
    }

    // 3. Inserir todos os rankings de uma vez
    const rankingsToInsert = Object.values(rankingMap)
    if (rankingsToInsert.length > 0) {
        // Inserir em batches de 100 para evitar limites
        const batchSize = 100
        for (let i = 0; i < rankingsToInsert.length; i += batchSize) {
            const batch = rankingsToInsert.slice(i, i + batchSize)
            await supabase.from('rankings').insert(batch)
        }
    }
}

// ====================================
// 3. RECALCULAR TÍTULOS E GANHOS
// ====================================
export async function recomputeTitles(supabase: SupabaseClient) {
    // Buscar todos os jogadores
    const { data: players } = await supabase.from('players').select('id')
    if (!players) return

    // Buscar todos os torneios fechados
    const { data: closedTournaments } = await supabase
        .from('tournaments')
        .select('winner_id, prize_winner')
        .eq('status', 'closed')

    // Calcular títulos e ganhos por jogador
    const titleMap: Record<string, { titles: number; total_earnings: number; max_win_amount: number }> = {}

    players.forEach(p => {
        titleMap[p.id] = { titles: 0, total_earnings: 0, max_win_amount: 0 }
    })

    closedTournaments?.forEach(t => {
        if (t.winner_id && titleMap[t.winner_id]) {
            titleMap[t.winner_id].titles += 1
            const prize = t.prize_winner || 0
            titleMap[t.winner_id].total_earnings += prize
            titleMap[t.winner_id].max_win_amount = Math.max(titleMap[t.winner_id].max_win_amount, prize)
        }
    })

    // Atualizar cada jogador
    for (const [playerId, data] of Object.entries(titleMap)) {
        await supabase.from('players').update({
            titles: data.titles,
            total_earnings: data.total_earnings,
            max_win_amount: data.max_win_amount,
        }).eq('id', playerId)
    }
}

// ====================================
// ORQUESTRADOR PRINCIPAL
// ====================================
export async function recomputeSystemIntegrity(supabase: SupabaseClient) {
    await recomputePlayerStats(supabase)
    await recomputeRankings(supabase)
    await recomputeTitles(supabase)
}
