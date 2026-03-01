import { createClient } from '@/lib/supabase/server'
import { Trophy, Users, DollarSign, Swords, Medal, Target, LayoutDashboard, MonitorPlay, Sparkles, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getAppSettings } from '@/app/settings/actions'

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
    <div className="p-6 md:p-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Visão Geral
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-sm md:text-base font-medium max-w-lg">
            Monitoramento em tempo real dos torneios de {appSettings.app_name}.
          </p>
        </div>
        <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_var(--color-primary)]/30 transition-all rounded-full px-6 z-10" asChild>
          <Link href="/tv" target="_blank">
            <MonitorPlay className="w-5 h-5 mr-2" />
            Abrir Modo TV
          </Link>
        </Button>
      </div>

      {/* Bento Grid: Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Torneio Ativo */}
        <div className="group relative bg-card/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl overflow-hidden hover:border-emerald-500/30 transition-all duration-500 hover:-translate-y-1">
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
              <div className="text-4xl font-black text-white tracking-tighter drop-shadow-md">
                {activeTournament ? (activeTournament.modality === '3_bolinhas' ? '3 Bolinhas' : 'Bola 8') : 'N/A'}
              </div>
              <div className="text-muted-foreground text-xs font-bold uppercase mt-2 tracking-widest">Torneio Ativo</div>
            </div>
          </div>
        </div>

        {/* Card 2: Fundo Mensal */}
        <div className="group relative bg-card/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl overflow-hidden hover:border-blue-500/30 transition-all duration-500 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400 ring-1 ring-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
            <div>
              <div className="text-4xl font-black text-white tracking-tighter drop-shadow-md flex items-baseline gap-1">
                {fundMonthly.toFixed(2)} <span className="text-lg font-bold text-blue-400">R$</span>
              </div>
              <div className="text-muted-foreground text-xs font-bold uppercase mt-2 tracking-widest">Fundo Acumulado</div>
            </div>
          </div>
        </div>

        {/* Card 3: Jogadores */}
        <div className="group relative bg-card/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl overflow-hidden hover:border-purple-500/30 transition-all duration-500 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400 ring-1 ring-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <div>
              <div className="text-4xl font-black text-white tracking-tighter drop-shadow-md">
                {playersCount || 0}
              </div>
              <div className="text-muted-foreground text-xs font-bold uppercase mt-2 tracking-widest">Atletas Liga</div>
            </div>
          </div>
        </div>

        {/* Card 4: Próxima Partida */}
        <div className="group relative bg-card/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl overflow-hidden hover:border-amber-500/30 transition-all duration-500 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500 ring-1 ring-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <Swords className="w-6 h-6" />
              </div>
              {nextMatch?.table && (
                <span className="text-[10px] font-black px-2.5 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full uppercase tracking-widest">
                  Mesa {nextMatch.table.number}
                </span>
              )}
            </div>
            <div>
              <div className="text-2xl font-black text-white tracking-tight drop-shadow-md truncate h-9 flex items-center">
                {nextMatch ? `${nextMatch.player_a?.name} vs ${nextMatch.player_b?.name}` : 'Aguardando'}
              </div>
              <div className="text-muted-foreground text-xs font-bold uppercase mt-2 tracking-widest">Próximo Confronto</div>
            </div>
          </div>
        </div>
      </div>

      {/* Seção Inferior: Relatórios e Rankings */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Bloco Esquerdp: Estatísticas do Mês */}
        <div className="xl:col-span-1 space-y-4">
          <div className="flex items-center gap-3 px-1">
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Estatísticas Mensais
            </h2>
          </div>

          <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

            <div className="space-y-6 relative z-10">
              <div className="flex justify-between items-center group/item hover:bg-white/5 p-3 rounded-2xl transition-all -mx-3">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-muted-foreground">Torneios Realizados</span>
                </div>
                <span className="font-black text-2xl text-white">{tourneysThisMonth.length}</span>
              </div>
              <div className="w-full h-px bg-white/5"></div>

              <div className="flex justify-between items-center group/item hover:bg-white/5 p-3 rounded-2xl transition-all -mx-3">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-muted-foreground">Total Arrecadado</span>
                </div>
                <span className="font-black text-2xl text-emerald-400 tracking-tight">R$ {totalArrecadadoMes.toFixed(2)}</span>
              </div>
              <div className="w-full h-px bg-white/5"></div>

              <div className="flex justify-between items-center group/item hover:bg-white/5 p-3 rounded-2xl transition-all -mx-3">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-muted-foreground">Média de Jogadores</span>
                </div>
                <span className="font-black text-2xl text-white">
                  {tourneysThisMonth.length > 0 ? (tourneysThisMonth.reduce((acc, t) => acc + t.total_players, 0) / tourneysThisMonth.length).toFixed(1) : 0}
                </span>
              </div>
              <div className="w-full h-px bg-white/5"></div>

              <div className="flex justify-between items-center group/item hover:bg-white/5 p-3 rounded-2xl transition-all -mx-3">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-muted-foreground">Maior Prêmio Pago</span>
                </div>
                <span className="font-black text-2xl text-amber-400 tracking-tight">R$ {maxWinnerPrize.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bloco Direito: Ranking Top Listas */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-xl">
                <Medal className="w-5 h-5 text-amber-400" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Visão Geral dos Rankings</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            {/* Top 3 Bolinhas */}
            <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl flex flex-col relative overflow-hidden group hover:border-emerald-500/20 transition-all">
              <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex items-center gap-3 mb-8 relative z-10">
                <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full uppercase tracking-widest shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                  3 Bolinhas
                </span>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Top 3</span>
              </div>

              <div className="space-y-4 flex-1 relative z-10">
                {rank3?.map((r: any, i: number) => (
                  <div key={r.id} className="flex justify-between items-center p-3 rounded-2xl hover:bg-white/5 transition-all -mx-3 group/row">
                    <div className="flex items-center gap-4 truncate">
                      <span className={`w-6 text-center text-lg font-black ${i === 0 ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-orange-400' : 'text-slate-600'}`}>
                        {i + 1}
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-bold text-sm text-slate-300 ring-1 ring-white/10 group-hover/row:ring-emerald-500/30 transition-all shadow-inner">
                        {r.player.name.charAt(0)}
                      </div>
                      <span className={`font-bold text-base truncate ${i === 0 ? 'text-white' : 'text-slate-300'}`}>{r.player.name}</span>
                    </div>
                    <div className="flex items-baseline gap-1 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                      <span className="text-base font-black text-emerald-400">{r.points}</span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Pts</span>
                    </div>
                  </div>
                ))}
                {(!rank3 || rank3.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground text-sm font-medium">Nenhum ranking registrado.</div>
                )}
              </div>
            </div>

            {/* Top Bola 8 */}
            <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl flex flex-col relative overflow-hidden group hover:border-blue-500/20 transition-all">
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex items-center gap-3 mb-8 relative z-10">
                <span className="text-xs font-black text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full uppercase tracking-widest shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                  Bola 8
                </span>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Top 3</span>
              </div>

              <div className="space-y-4 flex-1 relative z-10">
                {rank8?.map((r: any, i: number) => (
                  <div key={r.id} className="flex justify-between items-center p-3 rounded-2xl hover:bg-white/5 transition-all -mx-3 group/row">
                    <div className="flex items-center gap-4 truncate">
                      <span className={`w-6 text-center text-lg font-black ${i === 0 ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-orange-400' : 'text-slate-600'}`}>
                        {i + 1}
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-bold text-sm text-slate-300 ring-1 ring-white/10 group-hover/row:ring-blue-500/30 transition-all shadow-inner">
                        {r.player.name.charAt(0)}
                      </div>
                      <span className={`font-bold text-base truncate ${i === 0 ? 'text-white' : 'text-slate-300'}`}>{r.player.name}</span>
                    </div>
                    <div className="flex items-baseline gap-1 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                      <span className="text-base font-black text-blue-400">{r.points}</span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Pts</span>
                    </div>
                  </div>
                ))}
                {(!rank8 || rank8.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground text-sm font-medium">Nenhum ranking registrado.</div>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
