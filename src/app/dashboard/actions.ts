'use server'

import { createClient } from '@/lib/supabase/server'
import { unstable_cache } from 'next/cache'

async function _fetchDashboardData() {
    const supabase = await createClient()
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1

    // 1. Torneio Ativo
    const { data: activeTournament } = await supabase
        .from('tournaments')
        .select('*, winner:winner_id(id, name, nickname)')
        .in('status', ['open', 'in_progress'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    // 2. Fundos Acumulados do Ano e Mês Atuais
    // Para performance e precisão, buscamos todos os torneios deste ano.
    const startOfYear = new Date(currentYear, 0, 1).toISOString()
    const startOfNextYear = new Date(currentYear + 1, 0, 1).toISOString()

    const { data: tournamentsThisYear } = await supabase
        .from('tournaments')
        .select('id, created_at, fund_monthly, fund_yearly, entry_fee, total_players, prize_winner')
        .gte('created_at', startOfYear)
        .lt('created_at', startOfNextYear)

    let fundYearly = 0
    let fundMonthly = 0
    let totalArrecadadoMes = 0
    let maxWinnerPrize = 0
    let tourneysThisMonthCount = 0
    let totalPlayersThisMonth = 0

    if (tournamentsThisYear) {
        tournamentsThisYear.forEach(t => {
            // Acumulado Anual
            fundYearly += (t.fund_yearly || 0)

            // Acumulado Mensal e métricas do mês
            const tDate = new Date(t.created_at)
            if (tDate.getMonth() + 1 === currentMonth) {
                fundMonthly += (t.fund_monthly || 0)
                totalArrecadadoMes += ((t.entry_fee || 0) * (t.total_players || 0))
                maxWinnerPrize = Math.max(maxWinnerPrize, (t.prize_winner || 0))
                tourneysThisMonthCount++
                totalPlayersThisMonth += (t.total_players || 0)
            }
        })
    }

    // 3. Contagem de Jogadores Ativos na Liga
    const { count: playersCount } = await supabase
        .from('players')
        .select('*', { count: 'exact', head: true })

    // 4. Próxima Partida do Torneio Ativo
    let nextMatch = null
    if (activeTournament) {
        const { data } = await supabase
            .from('matches')
            .select('*, player_a:player_a_id(id, name, nickname), player_b:player_b_id(id, name, nickname), table:table_id(id, number, name)')
            .eq('tournament_id', activeTournament.id)
            .is('winner_id', null)
            .not('player_b_id', 'is', null) // Garante que não está aguardando adversário
            .order('created_at', { ascending: true })
            .limit(1)
            .single()
        nextMatch = data
    }

    // 5. Ranking Top 3 (do Mês Atual)
    const { data: top3Rank3 } = await supabase
        .from('rankings')
        .select('points, player:player_id(id, name, nickname)')
        .eq('modality', '3_bolinhas')
        .eq('year', currentYear)
        .eq('month', currentMonth)
        .order('points', { ascending: false })
        .limit(3)

    const { data: top3Rank8 } = await supabase
        .from('rankings')
        .select('points, player:player_id(id, name, nickname)')
        .eq('modality', 'bola_8')
        .eq('year', currentYear)
        .eq('month', currentMonth)
        .order('points', { ascending: false })
        .limit(3)

    return {
        activeTournament,
        nextMatch,
        playersCount,
        financials: {
            fundYearly,
            fundMonthly,
            totalArrecadadoMes,
            maxWinnerPrize,
            tourneysThisMonthCount,
            avgPlayersPerTournament: tourneysThisMonthCount > 0 ? (totalPlayersThisMonth / tourneysThisMonthCount) : 0
        },
        rankings: {
            rank3: top3Rank3 || [],
            rank8: top3Rank8 || []
        }
    }
}

// Cache de 30 segundos usando unstable_cache
export const getDashboardData = unstable_cache(
    _fetchDashboardData,
    ['dashboard-data'],
    { revalidate: 30, tags: ['dashboard', 'tournaments', 'matches', 'rankings', 'players'] }
)
