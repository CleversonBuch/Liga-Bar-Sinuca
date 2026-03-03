'use server'

import { createClient } from '@/lib/supabase/server'
import { unstable_cache } from 'next/cache'

// Função auxiliar genérica de desempate
function sortRanking(a: any, b: any) {
    // 1. Pontuação Total
    if (b.points !== a.points) return b.points - a.points

    const pA = a.player || {}
    const pB = b.player || {}

    // 2. Vitórias Totais
    const winsA = pA.wins || 0
    const winsB = pB.wins || 0
    if (winsB !== winsA) return winsB - winsA

    // 3. Títulos 
    const titlesA = pA.titles || 0
    const titlesB = pB.titles || 0
    if (titlesB !== titlesA) return titlesB - titlesA

    // 4. Aproveitamento (Win Rate)
    const matchesA = pA.matches_played || 1 // Evita div/0
    const matchesB = pB.matches_played || 1
    const wrA = (winsA / matchesA) * 100
    const wrB = (winsB / matchesB) * 100
    if (wrB !== wrA) return wrB - wrA

    return 0
}

function getMonthsForPeriod(period: string, currentMonth: number): number[] {
    if (period === 'trimestre') {
        const quarter = Math.floor((currentMonth - 1) / 3)
        return [quarter * 3 + 1, quarter * 3 + 2, quarter * 3 + 3]
    } else if (period === 'semestre') {
        const semester = Math.floor((currentMonth - 1) / 6)
        return [semester * 6 + 1, semester * 6 + 2, semester * 6 + 3, semester * 6 + 4, semester * 6 + 5, semester * 6 + 6]
    } else if (period === 'ano') {
        return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    }
    return [currentMonth]
}

async function _fetchRankings(period: 'mes' | 'trimestre' | 'semestre' | 'ano' = 'mes') {
    const supabase = await createClient()
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1

    const monthsToFetch = getMonthsForPeriod(period, currentMonth)

    // Buscar Rankings de 3 Bolinhas no período
    let { data: rawRank3 } = await supabase
        .from('rankings')
        .select('*, player:player_id(*)')
        .eq('modality', '3_bolinhas')
        .eq('year', currentYear)
        .in('month', monthsToFetch)

    // Buscar Rankings de Bola 8 no período
    let { data: rawRank8 } = await supabase
        .from('rankings')
        .select('*, player:player_id(*)')
        .eq('modality', 'bola_8')
        .eq('year', currentYear)
        .in('month', monthsToFetch)

    // Agregador de pontos por jogador
    function aggregateRanking(rawList: any[]) {
        const map: Record<string, any> = {}

        rawList?.forEach(entry => {
            if (!map[entry.player_id]) {
                map[entry.player_id] = {
                    ...entry,
                    points: 0
                }
            }
            map[entry.player_id].points += entry.points
        })

        return Object.values(map)
    }

    const rank3 = aggregateRanking(rawRank3 || [])
    const rank8 = aggregateRanking(rawRank8 || [])

    // Buscar Jogadores para calcular o Geral
    const { data: players } = await supabase.from('players').select('*')

    // Buscar participações em torneios para contar quantos torneios o jogador jogou
    const { data: tPlayers } = await supabase.from('tournament_players').select('player_id')
    const tCountMap: Record<string, number> = {}
    if (tPlayers) {
        tPlayers.forEach(tp => {
            tCountMap[tp.player_id] = (tCountMap[tp.player_id] || 0) + 1
        })
    }

    // Injetar o número de torneios jogados
    rank3.forEach(r => {
        if (r.player) r.player.tournaments_played = tCountMap[r.player.id] || 0
    })
    rank8.forEach(r => {
        if (r.player) r.player.tournaments_played = tCountMap[r.player.id] || 0
    })

    // Aplicar a ordenação avançada nas modalidades
    const sortedRank3 = rank3.sort(sortRanking)
    const sortedRank8 = rank8.sort(sortRanking)

    // Consolidar Ranking Geral
    const generalRanking = players?.map(p => {
        p.tournaments_played = tCountMap[p.id] || 0
        const pts3 = rank3?.find(r => r.player_id === p.id)?.points || 0
        const pts8 = rank8?.find(r => r.player_id === p.id)?.points || 0
        return {
            player: p,
            points: pts3 + pts8
        }
    }).filter(item => item.points > 0).sort(sortRanking)

    return {
        rank3: sortedRank3,
        rank8: sortedRank8,
        general: generalRanking || []
    }
}

export const getRankings = unstable_cache(
    _fetchRankings,
    ['rankings'],
    { revalidate: 30, tags: ['rankings'] }
)

async function _fetchEvolutionData() {
    const supabase = await createClient()
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1

    // Buscar ranking geral do mês atual diretamente (sem chamar getRankings)
    const { data: rawRank3 } = await supabase
        .from('rankings')
        .select('player_id, points, player:player_id(id, name, nickname)')
        .eq('modality', '3_bolinhas')
        .eq('year', currentYear)
        .eq('month', currentMonth)

    const { data: rawRank8 } = await supabase
        .from('rankings')
        .select('player_id, points, player:player_id(id, name, nickname)')
        .eq('modality', 'bola_8')
        .eq('year', currentYear)
        .eq('month', currentMonth)

    // Consolidar general ranking para encontrar top 5
    const pointsMap: Record<string, { id: string, name: string, points: number }> = {}
        ;[...(rawRank3 || []), ...(rawRank8 || [])].forEach((entry: any) => {
            if (!pointsMap[entry.player_id]) {
                const p = entry.player
                pointsMap[entry.player_id] = {
                    id: entry.player_id,
                    name: p?.nickname || p?.name || '?',
                    points: 0
                }
            }
            pointsMap[entry.player_id].points += entry.points
        })

    const top5Players = Object.values(pointsMap)
        .sort((a, b) => b.points - a.points)
        .slice(0, 5)

    if (top5Players.length === 0) return []

    // Buscar rankings dos últimos 4 meses para esses 5 jogadores
    const months = []
    for (let i = 3; i >= 0; i--) {
        let m = currentMonth - i
        let y = currentYear
        if (m <= 0) {
            m += 12
            y -= 1
        }
        months.push({ month: m, year: y })
    }

    const { data: history } = await supabase
        .from('rankings')
        .select('player_id, points, month, year')
        .in('player_id', top5Players.map(p => p.id))
        .in('month', months.map(m => m.month))
        .in('year', months.map(m => m.year))

    // Formatar para o Recharts
    const labels = ["Mês -3", "Mês -2", "Mês -1", "Atual"]

    const chartData = months.map((m, index) => {
        const dataPoint: any = { name: labels[index] }

        top5Players.forEach(p => {
            const pts = history
                ?.filter(h => h.player_id === p.id && h.month === m.month && h.year === m.year)
                .reduce((acc, curr) => acc + curr.points, 0) || 0

            dataPoint[p.name] = pts
        })

        return dataPoint
    })

    return chartData
}

export const getEvolutionData = unstable_cache(
    _fetchEvolutionData,
    ['evolution-data'],
    { revalidate: 60, tags: ['rankings'] }
)

