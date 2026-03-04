'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { recomputePlayerStats } from '@/lib/integrity'

export async function getTournamentData(tournamentId: string) {
    const supabase = await createClient()

    // Buscar detalhes do torneio
    const { data: tournament, error: tError } = await supabase
        .from('tournaments')
        .select(`
      *,
      winner:winner_id(id, name, nickname)
    `)
        .eq('id', tournamentId)
        .single()

    if (tError) return { error: 'Desculpe, torneio não encontrado.' }

    // Buscar todas as partidas
    const { data: matches, error: mError } = await supabase
        .from('matches')
        .select(`
      *,
      player_a:player_a_id(id, name, nickname, photo_url),
      player_b:player_b_id(id, name, nickname, photo_url),
      winner:winner_id(id, name, nickname),
      table:table_id(id, number, name)
    `)
        .eq('tournament_id', tournamentId)
        .order('phase', { ascending: true })
        .order('created_at', { ascending: true })

    // Buscar mesas disponíveis para direcionamento manual se preciso
    const { data: tables } = await supabase
        .from('tables')
        .select('*')
        .order('number')

    return {
        tournament,
        matches: matches || [],
        tables: tables || [],
    }
}

// Designar mesa para uma partida
export async function assignTable(matchId: string, tableId: string, tournamentId: string) {
    const supabase = await createClient()
    await supabase.from('matches').update({ table_id: tableId }).eq('id', matchId)
    revalidatePath(`/torneios/${tournamentId}`)
    return { success: true }
}

// Finalizar partida e definir vencedor
export async function finishMatch(matchId: string, winnerId: string, tournamentId: string) {
    const supabase = await createClient()

    // 1. Atualiza a partida atual com o vencedor
    const { data: currentMatch } = await supabase
        .from('matches')
        .update({
            winner_id: winnerId,
            finished_at: new Date().toISOString()
        })
        .eq('id', matchId)
        .select('*')
        .single()

    if (!currentMatch) return { success: false, error: 'Match not found' }

    // 2. Lógica de progressão automática
    const { data: tournament } = await supabase.from('tournaments').select('format, bracket_type').eq('id', tournamentId).single()

    if (tournament && tournament.bracket_type === 'fixed') {
        if (currentMatch.next_match_id) {
            const { data: nextMatch } = await supabase.from('matches').select('id, player_a_id').eq('id', currentMatch.next_match_id).single()
            if (nextMatch) {
                if (!nextMatch.player_a_id) {
                    await supabase.from('matches').update({ player_a_id: winnerId }).eq('id', nextMatch.id)
                } else {
                    await supabase.from('matches').update({ player_b_id: winnerId }).eq('id', nextMatch.id)
                }
            }
        }
    }

    // Libera a mesa
    if (currentMatch.table_id) {
        await supabase.from('tables').update({ status: 'available' }).eq('id', currentMatch.table_id)
    }

    // 3. Atualizar stats de vitória/derrota
    if (currentMatch.player_a_id && currentMatch.player_b_id && !currentMatch.is_bye) {
        const loserId = currentMatch.player_a_id === winnerId ? currentMatch.player_b_id : currentMatch.player_a_id

        // Vencedor (Globais)
        const { data: wPlayer } = await supabase.from('players').select('wins, matches_played').eq('id', winnerId).single()
        if (wPlayer) {
            await supabase.from('players').update({
                wins: (wPlayer.wins || 0) + 1,
                matches_played: (wPlayer.matches_played || 0) + 1
            }).eq('id', winnerId)
        }

        // Perdedor (Globais)
        const { data: lPlayer } = await supabase.from('players').select('losses, matches_played').eq('id', loserId).single()
        if (lPlayer) {
            await supabase.from('players').update({
                losses: (lPlayer.losses || 0) + 1,
                matches_played: (lPlayer.matches_played || 0) + 1
            }).eq('id', loserId)
        }

        // Vidas/Eliminação no Torneio (tournament_players)
        const { data: tLoser } = await supabase.from('tournament_players').select('losses').eq('tournament_id', tournamentId).eq('player_id', loserId).single()
        if (tLoser) {
            const newLosses = (tLoser.losses || 0) + 1
            let newStatus = 'active'

            if (tournament?.format === 'double_elimination') {
                if (newLosses >= 2) newStatus = 'eliminated'
            } else {
                if (newLosses >= 1) newStatus = 'eliminated'
            }

            await supabase.from('tournament_players').update({
                losses: newLosses,
                status: newStatus
            }).eq('tournament_id', tournamentId).eq('player_id', loserId)
        }
    }

    revalidatePath(`/torneios/${tournamentId}`)
    return { success: true }
}

// Botão Manual: "Sortear Próxima Fase" (Para Torneios bracket_type = 'random' ou Consolidações)
export async function drawNextPhase(tournamentId: string, currentPhase: number) {
    const supabase = await createClient()

    // 1. Pegar todos os jogadores ATIVOS no torneio
    const { data: activePlayers } = await supabase
        .from('tournament_players')
        .select('*')
        .eq('tournament_id', tournamentId)
        .eq('status', 'active')

    if (!activePlayers || activePlayers.length === 0) return { success: false, error: 'Nenhum jogador ativo encontrado.' }

    const totalPlayers = activePlayers.length

    // Se só sobrou 1, o Torneio ACABOU.
    if (totalPlayers === 1) {
        return { success: false, error: 'O Torneio já possui um vencedor indiscutível! Encerre o torneio no botão.' }
    }

    const nextPhase = currentPhase + 1
    const matchesToCreate = []

    // 2. Sistema Inteligente de BYE (Chapéu)
    let byePlayerId: string | null = null
    let playersToDraw = [...activePlayers]

    if (totalPlayers % 2 !== 0) {
        // Precisa de BYE
        // Regra 1: Não pode ter recebido BYE na fase anterior
        let eligibleForBye = playersToDraw.filter(p => p.last_bye_phase !== currentPhase)

        // Se incrivelmente TODOS receberam BYE na fase anterior (impossível matematicamente) ou não há elegíveis
        if (eligibleForBye.length === 0) eligibleForBye = playersToDraw

        // Regra 2: Menor número de BYEs totais
        const minByes = Math.min(...eligibleForBye.map(p => p.byes_received || 0))
        const candidates = eligibleForBye.filter(p => (p.byes_received || 0) === minByes)

        // Sorteia entre os candidatos empatados
        const chosenByeIndex = Math.floor(Math.random() * candidates.length)
        const byePlayer = candidates[chosenByeIndex]
        byePlayerId = byePlayer.player_id

        // Remove o jogador do sorteio principal
        playersToDraw = playersToDraw.filter(p => p.player_id !== byePlayerId)

        // Cria a partida de BYE
        matchesToCreate.push({
            tournament_id: tournamentId,
            phase: nextPhase,
            phase_name: `Fase ${nextPhase}`,
            player_a_id: byePlayerId,
            player_b_id: null,
            winner_id: byePlayerId, // Auto Vence
            is_bye: true,
            score_a: 0,
            score_b: 0
        })

        // Atualiza os stats do jogador no DB
        await supabase.from('tournament_players').update({
            byes_received: (byePlayer.byes_received || 0) + 1,
            last_bye_phase: nextPhase
        }).eq('id', byePlayer.id)
    }

    // 3. Sorteio Aleatório Normal para os Restantes
    playersToDraw.sort(() => Math.random() - 0.5)

    let playerIndex = 0
    while (playerIndex < playersToDraw.length) {
        matchesToCreate.push({
            tournament_id: tournamentId,
            phase: nextPhase,
            phase_name: `Fase ${nextPhase}`,
            player_a_id: playersToDraw[playerIndex].player_id,
            player_b_id: playersToDraw[playerIndex + 1].player_id,
            is_bye: false
        })
        playerIndex += 2
    }

    if (matchesToCreate.length > 0) {
        const { error } = await supabase.from('matches').insert(matchesToCreate)
        if (error) return { success: false, error: 'Erro ao gerar confrontos: ' + error.message }
    }

    revalidatePath(`/torneios/${tournamentId}`)
    return { success: true }
}

// Fechar Torneio inteiro
export async function closeTournament(tournamentId: string) {
    const supabase = await createClient()

    // 1. Busca infos do torneio
    const { data: tournament } = await supabase.from('tournaments').select('*').eq('id', tournamentId).single()
    if (!tournament) return { success: false }

    // 2. Busca o último jogo (final) para determinar Campeão e Vice (Simplificação heurística)
    const { data: finalMatch } = await supabase
        .from('matches')
        .select('*')
        .eq('tournament_id', tournamentId)
        .not('winner_id', 'is', null) // tem que ter vencedor
        .order('phase', { ascending: false }) // A fase mais alta é a final
        .limit(1)
        .single()

    const winnerId = finalMatch?.winner_id
    let runnerUpId = null
    if (finalMatch) {
        runnerUpId = finalMatch.player_a_id === winnerId ? finalMatch.player_b_id : finalMatch.player_a_id
    }

    // 2. Tentar achar o 3º lugar
    // Pode ser o vencedor de uma disputa de 3º lugar (mesma fase da final, mas sem next_match_id e não sendo a final)
    // No nosso sistema atual, se for Mata-Mata simples, talvez não tenha a disputa de 3º.
    // Vamos buscar a "fase mais alta" e ver se tem outra partida.
    let thirdPlaceId = null
    const { data: thirdMatch } = await supabase
        .from('matches')
        .select('winner_id')
        .eq('tournament_id', tournamentId)
        .eq('phase', finalMatch?.phase || 0)
        .not('id', 'eq', finalMatch?.id || '')
        .not('winner_id', 'is', null)
        .single()

    if (thirdMatch) {
        thirdPlaceId = thirdMatch.winner_id
    } else {
        // Se não tem disputa de 3º, o 3º lugar é quem perdeu para o Campeão na Semi-Final
        const { data: championSemiMatch } = await supabase
            .from('matches')
            .select('player_a_id, player_b_id, winner_id')
            .eq('tournament_id', tournamentId)
            .eq('phase', (finalMatch?.phase || 1) - 1)
            .or(`player_a_id.eq.${winnerId},player_b_id.eq.${winnerId}`)
            .single()

        if (championSemiMatch) {
            thirdPlaceId = championSemiMatch.winner_id === championSemiMatch.player_a_id
                ? championSemiMatch.player_b_id
                : championSemiMatch.player_a_id
        }
    }

    // Define os pontos básicos pela modalidade
    const isB8 = tournament.modality === 'bola_8'
    const pt1 = isB8 ? 100 : 80
    const pt2 = isB8 ? 70 : 60
    const ptPart = 15

    // 3. Busca todos os participantes desse torneio (baseado nas partidas iniciais)
    const { data: allMatches } = await supabase.from('matches').select('player_a_id, player_b_id').eq('tournament_id', tournamentId)
    const participants = new Set<string>()
    allMatches?.forEach(m => {
        if (m.player_a_id) participants.add(m.player_a_id)
        if (m.player_b_id) participants.add(m.player_b_id)
    })

    const year = new Date().getFullYear()
    const month = new Date().getMonth() + 1

    // 4. Atribuir pontos
    for (const pId of Array.from(participants)) {
        let earnedPoints = ptPart // Todo mundo ganha participação

        if (pId === winnerId) earnedPoints += pt1
        else if (pId === runnerUpId) earnedPoints += pt2

        // Insere ou atualiza no ranking do mês
        // Fazemos um select antes (Upsert no Supabase via RPC é melhor, mas manual aqui pra garantir)
        const { data: existing } = await supabase
            .from('rankings')
            .select('id, points')
            .eq('player_id', pId)
            .eq('modality', tournament.modality)
            .eq('year', year)
            .eq('month', month)
            .single()

        if (existing) {
            await supabase.from('rankings').update({ points: existing.points + earnedPoints }).eq('id', existing.id)
        } else {
            await supabase.from('rankings').insert([{
                player_id: pId,
                modality: tournament.modality,
                year, month,
                points: earnedPoints
            }])
        }

        // Atualiza estatísticas do jogador
        const { data: player } = await supabase.from('players').select('matches_played, titles, max_win_amount, total_earnings').eq('id', pId).single()
        if (player) {
            const isWinner = pId === winnerId
            const newTitles = isWinner ? (player.titles || 0) + 1 : player.titles
            const prize = isWinner ? (tournament.prize_winner || 0) : 0
            const newMax = Math.max(player.max_win_amount || 0, prize)
            const newTotalEarnings = (player.total_earnings || 0) + prize

            await supabase.from('players').update({
                titles: newTitles,
                max_win_amount: newMax,
                total_earnings: newTotalEarnings
            }).eq('id', pId)
        }
    }

    await supabase.from('tournaments').update({
        status: 'closed',
        winner_id: winnerId,
        runner_up_id: runnerUpId,
        third_place_id: thirdPlaceId,
        closed_at: new Date().toISOString()
    }).eq('id', tournamentId)

    revalidateTag('rankings', 'default')
    revalidatePath(`/torneios/${tournamentId}`)
    return { success: true }
}

// ==========================================
// SUPER ADMIN ACTIONS (Poder Absoluto)
// ==========================================
import { isSuperAdmin } from '@/lib/auth'

export async function resetMatch(matchId: string, tournamentId: string) {
    const isSuper = await isSuperAdmin()
    if (!isSuper) return { success: false, error: 'Acesso negado. Apenas o Super Administrador pode resetar partidas.' }

    const supabase = await createClient()

    // Busca a partida atual para saber quem era o vencedor e reverter
    const { data: match } = await supabase.from('matches').select('*').eq('id', matchId).single()
    if (!match || !match.winner_id) return { success: false, error: 'Partida não finalizada ou não encontrada.' }

    const oldLoserId = match.player_a_id === match.winner_id ? match.player_b_id : match.player_a_id

    // 1. Reverter Status do Torneio (Vidas)
    if (oldLoserId) {
        const { data: tLoser } = await supabase.from('tournament_players').select('losses').eq('tournament_id', tournamentId).eq('player_id', oldLoserId).single()
        if (tLoser && tLoser.losses > 0) {
            await supabase.from('tournament_players').update({
                losses: tLoser.losses - 1,
                status: 'active'
            }).eq('tournament_id', tournamentId).eq('player_id', oldLoserId)
        }
    }

    // 2. Limpar o Vencedor da Partida Atual
    await supabase.from('matches').update({
        winner_id: null,
        finished_at: null
    }).eq('id', matchId)

    // 3. Recalcular stats globais dos jogadores (fonte única da verdade)
    await recomputePlayerStats(supabase)

    revalidateTag('rankings', 'default')
    revalidatePath(`/torneios/${tournamentId}`)
    revalidatePath('/ranking')
    revalidatePath('/jogadores')
    return { success: true }
}

export async function deleteMatch(matchId: string, tournamentId: string) {
    const isSuper = await isSuperAdmin()
    if (!isSuper) return { success: false, error: 'Acesso negado. Apenas o Super Administrador pode deletar partidas.' }

    const supabase = await createClient()

    const { error } = await supabase.from('matches').delete().eq('id', matchId)

    if (error) return { success: false, error: 'Erro ao excluir partida: ' + error.message }

    // Recalcular stats globais dos jogadores após exclusão
    await recomputePlayerStats(supabase)

    revalidateTag('rankings', 'default')
    revalidatePath(`/torneios/${tournamentId}`)
    revalidatePath('/ranking')
    revalidatePath('/jogadores')
    return { success: true }
}
