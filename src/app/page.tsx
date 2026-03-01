import { createClient } from '@/lib/supabase/server'
import { Trophy, Users, DollarSign, Swords, Medal, Target, LayoutDashboard, MonitorPlay, Sparkles, TrendingUp, ArrowRight, Calendar, Info } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getAppSettings } from '@/app/settings/actions'
import { Card, CardContent } from "@/components/ui/card"
import { getRankings } from './ranking/actions'
import { RulesModal } from '@/components/RulesModal'

export default async function DashboardPage() {
  const supabase = await createClient()
  const appSettings = await getAppSettings()

  // 1. Torneio Ativo
  const { data: activeTournament } = await supabase
    .from('tournaments')
    .select('*, winner:winner_id(*)')
    .in('status', ['open', 'in_progress'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // 2. Fundos e Estatísticas
  const { data: tournaments } = await supabase.from('tournaments').select('*')
  const fundMonthly = tournaments?.reduce((acc, t) => acc + (t.fund_monthly || 0), 0) || 0
  const fundYearly = tournaments?.reduce((acc, t) => acc + (t.fund_yearly || 0), 0) || 0

  const thisMonth = new Date().getMonth() + 1
  const tourneysThisMonth = tournaments?.filter(t => {
    if (!t.created_at) return false
    const m = new Date(t.created_at).getMonth() + 1
    return m === thisMonth
  }) || []

  const totalArrecadadoMes = tourneysThisMonth.reduce((acc, t) => acc + (t.entry_fee * t.total_players), 0)
  const maxWinnerPrize = tourneysThisMonth.reduce((acc, t) => Math.max(acc, t.prize_winner || 0), 0)

  // 3. Jogadores Ativos
  const { count: playersCount } = await supabase.from('players').select('*', { count: 'exact', head: true })

  // 4. Rankings (Resumo)
  const { data: rank3 } = await supabase.from('rankings').select('*, player:player_id(*)').eq('modality', '3_bolinhas').order('points', { ascending: false }).limit(3)
  const { data: rank8 } = await supabase.from('rankings').select('*, player:player_id(*)').eq('modality', 'bola_8').order('points', { ascending: false }).limit(3)

  const { data: players } = await supabase.from('players').select('*')
  const generalRanking = players?.map(p => {
    const pts3 = rank3?.find(r => r.player_id === p.id)?.points || 0
    const pts8 = rank8?.find(r => r.player_id === p.id)?.points || 0
    return { player: p, points: pts3 + pts8 }
  }).sort((a, b) => b.points - a.points).slice(0, 5) || []

  // 5. Próxima Partida
  let nextMatch = null
  if (activeTournament) {
    const { data } = await supabase
      .from('matches')
      .select('*, player_a:player_a_id(*), player_b:player_b_id(*), table:table_id(*)')
      .eq('tournament_id', activeTournament.id)
      .is('winner_id', null)
      .not('player_b_id', 'is', null) // Garante que não está aguardando adversário
      .order('created_at', { ascending: true })
      .limit(1)
      .single()
    nextMatch = data
  }

  return (
    <div className="p-4 md:p-10 space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative pt-4">
        <div className="space-y-1 md:space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] md:text-xs font-black uppercase tracking-widest mb-1 md:mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Visão Geral
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white uppercase italic">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-xs md:text-base font-medium max-w-lg">
            Monitoramento em tempo real dos torneios de {appSettings.app_name}.
          </p>
        </div>
        <Button size="lg" className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_var(--color-primary)]/30 transition-all rounded-full px-8 py-6 md:py-4 z-10 font-black uppercase tracking-widest text-xs" asChild>
          <Link href="/tv" target="_blank">
            <MonitorPlay className="w-5 h-5 mr-2" />
            Modo TV
          </Link>
        </Button>
      </div>

      {/* Bento Grid: Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Card 1: Torneio Ativo */}
        <div className="group relative bg-white/5 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 shadow-2xl overflow-hidden hover:border-emerald-500/30 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 ring-1 ring-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <Trophy className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black px-2.5 py-1 bg-emerald-500/20 text-emerald-400 rounded-full uppercase tracking-widest border border-emerald-500/30 animate-pulse">
                Ao Vivo
              </span>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase italic">
                {activeTournament ? (activeTournament.modality === '3_bolinhas' ? '3 Bolinhas' : 'Bola 8') : 'Nenhum'}
              </div>
              <div className="text-muted-foreground text-[10px] font-black uppercase mt-1 tracking-widest">Torneio Ativo</div>
            </div>
          </div>
        </div>

        {/* Card 2: Fundo Mensal */}
        <div className="group relative bg-white/5 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 shadow-2xl overflow-hidden hover:border-blue-500/30 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400 ring-1 ring-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-black text-white tracking-tighter italic">
                {fundMonthly.toFixed(0)} <span className="text-sm font-black text-blue-400 uppercase">BRL</span>
              </div>
              <div className="text-muted-foreground text-[10px] font-black uppercase mt-1 tracking-widest">Prêmio Mensal</div>
            </div>
          </div>
        </div>

        {/* Card 3: Jogadores */}
        <div className="group relative bg-white/5 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 shadow-2xl overflow-hidden hover:border-purple-500/30 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400 ring-1 ring-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-black text-white tracking-tighter italic">
                {playersCount || 0}
              </div>
              <div className="text-muted-foreground text-[10px] font-black uppercase mt-1 tracking-widest">Atletas Liga</div>
            </div>
          </div>
        </div>

        {/* Card 4: Próxima Partida */}
        <div className="group relative bg-white/5 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 shadow-2xl overflow-hidden hover:border-amber-500/30 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500 ring-1 ring-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <Swords className="w-6 h-6" />
              </div>
              {nextMatch?.table && (
                <span className="text-[10px] font-black px-2.5 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full uppercase tracking-widest">
                  M{nextMatch.table.number}
                </span>
              )}
            </div>
            <div>
              <div className="text-lg md:text-xl font-black text-white tracking-tight truncate h-7 flex items-center uppercase italic">
                {nextMatch ? `${nextMatch.player_a?.name.split(' ')[0]} x ${nextMatch.player_b?.name.split(' ')[0]}` : 'Aguardando...'}
              </div>
              <div className="text-muted-foreground text-[10px] font-black uppercase mt-1 tracking-widest">Próximo Jogo</div>
            </div>
          </div>
        </div>
      </div>

      {/* Seção Inferior: Relatórios e Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Bloco Esquerdo: Estatísticas do Mês */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center gap-3 px-1">
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-lg font-black text-white tracking-widest uppercase italic">
              Performance Mensal
            </h2>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-center group/item hover:bg-white/5 p-3 rounded-2xl transition-all -mx-3">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Torneios Realizados</span>
                <span className="font-black text-xl text-white italic">{tourneysThisMonth.length}</span>
              </div>
              <div className="w-full h-px bg-white/5"></div>

              <div className="flex justify-between items-center group/item hover:bg-white/5 p-3 rounded-2xl transition-all -mx-3">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Arrecadado</span>
                <span className="font-black text-xl text-emerald-400 italic">R$ {totalArrecadadoMes.toFixed(0)}</span>
              </div>
              <div className="w-full h-px bg-white/5"></div>

              <div className="flex justify-between items-center group/item hover:bg-white/5 p-3 rounded-2xl transition-all -mx-3">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Média Pilotos</span>
                <span className="font-black text-xl text-white italic">
                  {tourneysThisMonth.length > 0 ? (tourneysThisMonth.reduce((acc, t) => acc + t.total_players, 0) / tourneysThisMonth.length).toFixed(1) : 0}
                </span>
              </div>
              <div className="w-full h-px bg-white/5"></div>

              <div className="flex justify-between items-center group/item hover:bg-white/5 p-3 rounded-2xl transition-all -mx-3">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Maior Prêmio</span>
                <span className="font-black text-xl text-amber-400 italic">R$ {maxWinnerPrize.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bloco Direito: Ranking Top Listas */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-xl">
                <Medal className="w-5 h-5 text-amber-400" />
              </div>
              <h2 className="text-lg font-black text-white tracking-widest uppercase italic">Ranking</h2>
            </div>
            <div className="flex items-center gap-2">
              <RulesModal />
              <Link href="/ranking" className="bg-white/5 border border-white/5 rounded-full px-4 h-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                Ver tudo <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top 3 Bolinhas */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-6 shadow-2xl flex flex-col relative overflow-hidden group hover:border-emerald-500/20 transition-all">
              <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex items-center gap-3 mb-6 relative z-10">
                <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full uppercase tracking-widest">
                  3 Bolinhas
                </span>
              </div>

              <div className="space-y-2 flex-1 relative z-10">
                {rank3?.map((r: any, i: number) => (
                  <div key={r.id} className="flex justify-between items-center p-2.5 rounded-2xl hover:bg-white/5 transition-all -mx-2 group/row border border-transparent hover:border-white/5">
                    <div className="flex items-center gap-3 truncate">
                      <span className={`w-5 text-center text-sm font-black ${i === 0 ? 'text-amber-400' : 'text-slate-500'}`}>
                        {i + 1}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center font-black text-xs text-slate-500 ring-1 ring-white/10 italic">
                        {r.player.name.charAt(0)}
                      </div>
                      <span className={`font-black text-sm truncate uppercase tracking-tight italic ${i === 0 ? 'text-white' : 'text-slate-400'}`}>{r.player.nickname || r.player.name}</span>
                    </div>
                    <div className="flex items-baseline gap-1 bg-white/5 px-2.5 py-1 rounded-xl border border-white/5">
                      <span className="text-xs font-black text-emerald-400 italic">{r.points}</span>
                    </div>
                  </div>
                ))}
                {(!rank3 || rank3.length === 0) && (
                  <div className="text-center py-8 text-slate-500 text-[10px] font-black uppercase tracking-widest">Aguardando dados...</div>
                )}
              </div>
            </div>

            {/* Top Bola 8 */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-6 shadow-2xl flex flex-col relative overflow-hidden group hover:border-blue-500/20 transition-all">
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex items-center gap-3 mb-6 relative z-10">
                <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full uppercase tracking-widest">
                  Bola 8
                </span>
              </div>

              <div className="space-y-2 flex-1 relative z-10">
                {rank8?.map((r: any, i: number) => (
                  <div key={r.id} className="flex justify-between items-center p-2.5 rounded-2xl hover:bg-white/5 transition-all -mx-2 group/row border border-transparent hover:border-white/5">
                    <div className="flex items-center gap-3 truncate">
                      <span className={`w-5 text-center text-sm font-black ${i === 0 ? 'text-amber-400' : 'text-slate-500'}`}>
                        {i + 1}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center font-black text-xs text-slate-500 ring-1 ring-white/10 italic">
                        {r.player.name.charAt(0)}
                      </div>
                      <span className={`font-black text-sm truncate uppercase tracking-tight italic ${i === 0 ? 'text-white' : 'text-slate-400'}`}>{r.player.nickname || r.player.name}</span>
                    </div>
                    <div className="flex items-baseline gap-1 bg-white/5 px-2.5 py-1 rounded-xl border border-white/5">
                      <span className="text-xs font-black text-blue-400 italic">{r.points}</span>
                    </div>
                  </div>
                ))}
                {(!rank8 || rank8.length === 0) && (
                  <div className="text-center py-8 text-slate-500 text-[10px] font-black uppercase tracking-widest">Aguardando dados...</div>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
