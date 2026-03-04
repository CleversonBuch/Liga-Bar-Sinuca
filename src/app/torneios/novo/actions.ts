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
            // == ÁRVORE FIXA (SEQUENCIAL/PAREADO) ==
            // Solução matemática para chaves que não formam potência de 2
            // Parea todos os possíveis. Se ímpar, 1 jogador folga (W.O).
            const allMatches = []

            // Nós iniciais: cada jogador
            let nodes = shuffledPlayers.map(id => ({ type: 'player', id, byes: 0 }))
            let phase = 1

            while (nodes.length > 1) {
                // Ordena para que os nós que tiveram MENOS W.O sejam pareados primeiro
                // Aqueles que acabaram de ganhar W.O (mais byes) ficarão no topo e obrigatoriamente jogarão
                nodes.sort((a, b) => b.byes - a.byes)

                let nextNodes = []
                let i = 0

                while (i < nodes.length) {
                    if (i + 1 < nodes.length) {
                        // Partida Normal
                        const mId = crypto.randomUUID()
                        const m = {
                            id: mId,
                            tournament_id: tournamentId,
                            phase: phase,
                            phase_name: `Fase ${phase}`,
                            is_repescagem: false,
                            player_a_id: nodes[i].type === 'player' ? nodes[i].id : null,
                            player_b_id: nodes[i + 1].type === 'player' ? nodes[i + 1].id : null,
                            winner_id: null,
                            is_bye: false,
                            next_match_id: null,
                            loser_match_id: null,
                            score_a: 0,
                            score_b: 0,
                            // metadata temp para linkar next_match_id depois
                            _source_a: nodes[i],
                            _source_b: nodes[i + 1]
                        } as any
                        allMatches.push(m)

                        // O vencedor desta partida se torna o novo nó
                        nextNodes.push({ type: 'match', id: mId, byes: 0 })

                        // Linkar das rodadas anteriores para esta partida
                        if (nodes[i].type === 'match') {
                            const prev = allMatches.find(x => x.id === nodes[i].id)
                            if (prev) prev.next_match_id = mId
                        }
                        if (nodes[i + 1].type === 'match') {
                            const prev = allMatches.find(x => x.id === nodes[i + 1].id)
                            if (prev) prev.next_match_id = mId
                        }

                        i += 2
                    } else {
                        // Impar (W.O / Passagem Direta)
                        const n = nodes[i]
                        n.byes += 1

                        const mId = crypto.randomUUID()
                        const m = {
                            id: mId,
                            tournament_id: tournamentId,
                            phase: phase,
                            phase_name: `Fase ${phase}`,
                            is_repescagem: false,
                            player_a_id: n.type === 'player' ? n.id : null,
                            player_b_id: null,
                            winner_id: n.type === 'player' ? n.id : null,
                            is_bye: true, // W.O!
                            next_match_id: null,
                            loser_match_id: null,
                            score_a: 0,
                            score_b: 0,
                            _source_a: n
                        } as any
                        allMatches.push(m)

                        // O nó que "passou" se torna o adversário na próxima fase
                        // Carrega o contador de byes para o próximo nó
                        nextNodes.push({ type: 'match', id: mId, byes: n.byes })

                        if (n.type === 'match') {
                            const prev = allMatches.find(x => x.id === n.id)
                            if (prev) prev.next_match_id = mId
                        }

                        i++
                    }
                }
                nodes = nextNodes
                phase++
            }

            // Renomear fases (Semifinal e Final)
            const totalPhases = phase - 1
            allMatches.forEach(m => {
                if (m.phase === totalPhases) m.phase_name = 'Final'
                else if (m.phase === totalPhases - 1 && totalPhases > 2) m.phase_name = 'Semifinal'

                // Limpar campos temporários necessários para a DB
                delete m._source_a
                delete m._source_b
            })

            const { error: matchesError } = await supabase.from('matches').insert(allMatches)
            if (matchesError) return { success: false, error: 'Erro ao gerar árvore fixa customizada: ' + matchesError.message }

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
