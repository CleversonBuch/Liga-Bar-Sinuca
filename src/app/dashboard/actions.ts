'use server'

import { supabaseAdmin as supabase } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { unstable_cache } from 'next/cache'
import { revalidateTag } from 'next/cache'
import { isAdmin as checkIsAdmin } from '@/lib/auth'

async function _fetchDashboardData() {
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
            fundYearly += (t.fund_yearly || 0)

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
            .not('player_b_id', 'is', null)
            .order('created_at', { ascending: true })
            .limit(1)
            .single()
        nextMatch = data
    }

    // 5. Ranking Top 5 (do Mês Atual)
    const { data: top5Rank3 } = await supabase
        .from('rankings')
        .select('points, player:player_id(id, name, nickname)')
        .eq('modality', '3_bolinhas')
        .eq('year', currentYear)
        .eq('month', currentMonth)
        .order('points', { ascending: false })
        .limit(5)

    const { data: top5Rank8 } = await supabase
        .from('rankings')
        .select('points, player:player_id(id, name, nickname)')
        .eq('modality', 'bola_8')
        .eq('year', currentYear)
        .eq('month', currentMonth)
        .order('points', { ascending: false })
        .limit(5)

    // 6. Ranking Geral Top 5 (soma de ambas modalidades)
    const allPlayers: Record<string, { player: any; points: number }> = {}
        ;[...(top5Rank3 || []), ...(top5Rank8 || [])].forEach((entry: any) => {
            const pid = entry.player?.id
            if (!pid) return
            if (!allPlayers[pid]) {
                allPlayers[pid] = { player: entry.player, points: 0 }
            }
            allPlayers[pid].points += entry.points
        })
    // Also fetch any players that might be in one modality but not the other's top 5
    // For a more complete general ranking, we fetch ALL rankings for this month
    const { data: allRankThisMonth } = await supabase
        .from('rankings')
        .select('points, player_id, player:player_id(id, name, nickname)')
        .eq('year', currentYear)
        .eq('month', currentMonth)

    const generalMap: Record<string, { player: any; points: number }> = {}
        ; (allRankThisMonth || []).forEach((entry: any) => {
            const pid = entry.player?.id || entry.player_id
            if (!pid) return
            if (!generalMap[pid]) {
                generalMap[pid] = { player: entry.player, points: 0 }
            }
            generalMap[pid].points += entry.points
        })
    const generalTop5 = Object.values(generalMap)
        .sort((a, b) => b.points - a.points)
        .slice(0, 5)

    // 7. Event Banner Text
    let eventBannerText = ''
    try {
        const { data: settings } = await supabase
            .from('app_settings')
            .select('event_banner_text')
            .eq('id', 1)
            .single()
        eventBannerText = settings?.event_banner_text || ''
    } catch {
        // Column may not exist yet
    }

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
            rank3: top5Rank3 || [],
            rank8: top5Rank8 || [],
            general: generalTop5
        },
        eventBannerText
    }
}

// Cache de 30 segundos usando unstable_cache
export const getDashboardData = unstable_cache(
    _fetchDashboardData,
    ['dashboard-data'],
    { revalidate: 30, tags: ['dashboard', 'tournaments', 'matches', 'rankings', 'players'] }
)

// Server Action: Update Event Banner Text (Admin only)
export async function updateEventBanner(text: string) {
    const authorized = await checkIsAdmin()
    if (!authorized) {
        return { success: false, error: 'Acesso negado.' }
    }

    const client = await createClient()

    // Try to update the column - if it doesn't exist, we'll handle the error
    const { error } = await client
        .from('app_settings')
        .update({ event_banner_text: text, updated_at: new Date().toISOString() })
        .eq('id', 1)

    if (error) {
        console.error('Erro ao atualizar banner de evento:', error)
        return { success: false, error: error.message }
    }

    revalidateTag('dashboard', 'default')
    return { success: true }
}
