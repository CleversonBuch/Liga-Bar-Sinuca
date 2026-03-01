'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getAppSettings } from '@/app/settings/actions'

export async function createTournament(formData: FormData) {
    const supabase = await createClient()

    const modality = formData.get('modality') as string
    const format = formData.get('format') as string
    const bracketType = formData.get('bracket_type') as string || null
    const entryFeeStr = formData.get('entry_fee') as string || '0'
    const entryFee = parseFloat(entryFeeStr)

    // Pegar todos os ids de jogadores selecionados (array)
    const playerIds = formData.getAll('player_ids') as string[]
    const totalPlayers = playerIds.length

    if (totalPlayers < 4) {
        return { success: false, error: 'O mínimo para iniciar o torneio é 4 jogadores.' }
    }

    // Cálculos financeiros baseados nas configurações globais
    const appSettings = await getAppSettings()

    const pctWinner = (appSettings.prize_pool_winner_pct || 65) / 100
    const pctMonthly = (appSettings.fund_monthly_pct || 20) / 100
    const pctYearly = (appSettings.fund_yearly_pct || 10) / 100
    const pctBar = (appSettings.fund_bar_pct || 5) / 100

    const totalArrecadado = entryFee * totalPlayers
    const prizePool = totalArrecadado
    const prizeWinner = (prizePool * pctWinner)
    const fundMonthly = (prizePool * pctMonthly)
    const fundYearly = (prizePool * pctYearly)
    const fundBar = (prizePool * pctBar)

    // 1. Criar o torneio
    const { data: tournament, error: insertError } = await supabase
        .from('tournaments')
        .insert([
            {
                modality,
                format,
                bracket_type: bracketType,
                entry_fee: entryFee,
                total_players: totalPlayers,
                total_prize_pool: prizePool,
                prize_winner: prizeWinner,
                fund_monthly: fundMonthly,
                fund_yearly: fundYearly,
                fund_bar: fundBar,
                status: 'ongoing'
            }
        ])
        .select('id')
        .single()

    if (insertError) {
        return { success: false, error: 'Erro ao registrar torneio: ' + insertError.message }
    }

    const tournamentId = tournament.id

    // 1.5. Registrar jogadores no torneio (Vidas, Status, Byes)
    const tPlayers = playerIds.map(id => ({
        tournament_id: tournamentId,
        player_id: id,
        status: 'active',
        losses: 0,
        byes_received: 0,
        last_bye_phase: 0
    }))

    const { error: tpError } = await supabase.from('tournament_players').insert(tPlayers)
    if (tpError) return { success: false, error: 'Erro ao registrar vidas dos jogadores: ' + tpError.message }

    // 2. Embaralhar jogadores
    let shuffledPlayers = [...playerIds]
    if (bracketType === 'random' || bracketType === 'fixed') {
        shuffledPlayers = shuffledPlayers.sort(() => Math.random() - 0.5)
    }

    // 3. Gerar Partidas
    if (format === 'single_elimination') {

        if (bracketType === 'fixed') {
            // == ÁRVORE FIXA PLENA (Potência de 2) ==
            const n = Math.pow(2, Math.ceil(Math.log2(totalPlayers)))
            const rounds = Math.log2(n)

            const allMatches = []
            const matchesByRound: any[][] = []

            // A. Criar as "caixas" de partidas para todas as rodadas
            for (let r = 0; r < rounds; r++) {
                const matchCount = n / Math.pow(2, r + 1)
                const roundMatches = []
                for (let i = 0; i < matchCount; i++) {
                    const isFinal = r === rounds - 1
                    const isSemi = r === rounds - 2
                    roundMatches.push({
                        id: crypto.randomUUID(),
                        tournament_id: tournamentId,
                        phase: r + 1,
                        phase_name: isFinal ? 'Final' : isSemi ? 'Semifinal' : `Fase ${r + 1}`,
                        is_repescagem: false,
                        player_a_id: null,
                        player_b_id: null,
                        winner_id: null,
                        is_bye: false,
                        next_match_id: null,
                        loser_match_id: null,
                        score_a: 0,
                        score_b: 0
                    })
                }
                matchesByRound.push(roundMatches)
            }

            // B. Ligar as partidas via next_match_id
            for (let r = 0; r < rounds - 1; r++) {
                for (let i = 0; i < matchesByRound[r].length; i++) {
                    const nextMatchIndex = Math.floor(i / 2)
                    matchesByRound[r][i].next_match_id = matchesByRound[r + 1][nextMatchIndex].id
                }
            }

            // C. Distribuir os jogadores de forma inteligente (Seeding)
            // Se temos totalPlayers < n, alguns jogos terão BYE.
            // Distribuímos 1 jogador por partida do Round 1 primeiro, depois os restantes.
            const m = n / 2 // Número de partidas na Fase 1
            for (let i = 0; i < m; i++) {
                const match = matchesByRound[0][i]
                match.player_a_id = shuffledPlayers[i] || null
                match.player_b_id = shuffledPlayers[i + m] || null

                // Se o player B ficou nulo, é um BYE "Chapeu"
                if (match.player_a_id && !match.player_b_id) {
                    match.is_bye = true
                    match.winner_id = match.player_a_id // O Player A passa direto
                }
            }

            // D. Propagar os BYEs para a Fase 2 (Efeito Dominó)
            for (let r = 0; r < rounds - 1; r++) {
                for (let i = 0; i < matchesByRound[r].length; i++) {
                    const match = matchesByRound[r][i]
                    if (match.winner_id && match.next_match_id) {
                        const nextMatchIndex = Math.floor(i / 2)
                        const nextMatch = matchesByRound[r + 1][nextMatchIndex]
                        const isPlayerA = i % 2 === 0
                        if (isPlayerA) nextMatch.player_a_id = match.winner_id
                        else nextMatch.player_b_id = match.winner_id
                    }
                    allMatches.push(match)
                }
            }
            // Adicionar a última rodada no array final
            matchesByRound[rounds - 1].forEach(m => allMatches.push(m))

            // E. Inserir todos de uma vez
            const { error: matchesError } = await supabase.from('matches').insert(allMatches)
            if (matchesError) return { success: false, error: 'Erro ao gerar árvore fixa: ' + matchesError.message }

        } else {
            // == SORTEIO FASE-A-FASE (Random Draw) ==
            const matchesToCreate = []
            let playerIndex = 0

            while (playerIndex < totalPlayers) {
                if (playerIndex + 1 < totalPlayers) {
                    matchesToCreate.push({
                        tournament_id: tournamentId,
                        phase: 1,
                        phase_name: 'Fase 1',
                        player_a_id: shuffledPlayers[playerIndex],
                        player_b_id: shuffledPlayers[playerIndex + 1],
                        is_bye: false
                    })
                    playerIndex += 2
                } else {
                    // Ímpar: Fica no chapéu pra Fase 1
                    const pId = shuffledPlayers[playerIndex]
                    matchesToCreate.push({
                        tournament_id: tournamentId,
                        phase: 1,
                        phase_name: 'Fase 1',
                        player_a_id: pId,
                        player_b_id: null,
                        winner_id: pId,
                        is_bye: true
                    })
                    break
                }
            }

            if (matchesToCreate.length > 0) {
                const { error: matchesError } = await supabase.from('matches').insert(matchesToCreate)
                if (matchesError) return { success: false, error: 'Erro ao gerar sorteio: ' + matchesError.message }
            }
        }
    } else if (format === 'double_elimination') {
        // == DUPLA ELIMINAÇÃO (Apenas Fase 1) ==
        // Todos jogam a Fase 1. Os perdedores irão para a repescagem depois (via finishMatch).
        const matchesToCreate = []
        let playerIndex = 0
        const n = Math.pow(2, Math.ceil(Math.log2(totalPlayers)))
        const m = n / 2 // Número ideal de partidas

        for (let i = 0; i < m; i++) {
            const pA = shuffledPlayers[i] || null
            const pB = shuffledPlayers[i + m] || null
            if (pA || pB) {
                matchesToCreate.push({
                    id: crypto.randomUUID(),
                    tournament_id: tournamentId,
                    phase: 1,
                    phase_name: 'Fase 1 (Principal)',
                    player_a_id: pA,
                    player_b_id: pB,
                    winner_id: (pA && !pB) ? pA : null, // BYE auto vence
                    is_bye: (pA && !pB),
                })
            }
        }

        if (matchesToCreate.length > 0) {
            const { error: matchesError } = await supabase.from('matches').insert(matchesToCreate)
            if (matchesError) return { success: false, error: 'Erro ao gerar 1ª Fase Dupla Eliminação: ' + matchesError.message }
        }

    } else if (format === 'all_vs_all') {
        // Todos contra todos
        const matchesToCreate = []
        for (let i = 0; i < totalPlayers; i++) {
            for (let j = i + 1; j < totalPlayers; j++) {
                matchesToCreate.push({
                    tournament_id: tournamentId,
                    phase: 1,
                    phase_name: 'Grupos',
                    player_a_id: shuffledPlayers[i],
                    player_b_id: shuffledPlayers[j],
                    is_bye: false
                })
            }
        }
        if (matchesToCreate.length > 0) {
            const { error: matchesError } = await supabase.from('matches').insert(matchesToCreate)
            if (matchesError) return { success: false, error: matchesError.message }
        }
    }

    return { success: true, url: `/torneios/${tournamentId}` }
}
