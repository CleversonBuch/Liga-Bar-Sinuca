import { getAppSettings } from '@/app/settings/actions'
import { getDashboardData } from './actions'
import { isAdmin } from '@/lib/auth'
import { Trophy, Users, DollarSign, Swords, Medal, Crown, MonitorPlay, Sparkles, TrendingUp, ArrowRight, Wallet } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { EventBanner } from '@/components/EventBanner'

export default async function DashboardPage() {
  const appSettings = await getAppSettings()
  const data = await getDashboardData()
  const isOperator = await isAdmin()

  const { activeTournament, nextMatch, playersCount, financials, rankings, eventBannerText } = data

  return (
    <div className="p-4 md:p-10 space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative pt-4">
        <div className="space-y-1 md:space-y-2 relative z-10 w-full">
          <div className="flex justify-between w-full md:w-auto items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] md:text-xs font-black uppercase tracking-widest mb-1 md:mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Visão Executiva
            </div>
            {/* Desktop TV Button — Admin only */}
            {isOperator && (
              <Button size="sm" className="hidden md:flex bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_var(--color-primary)]/30 transition-all rounded-full px-8 z-10 font-black uppercase tracking-widest text-[10px]" asChild>
                <Link href="/tv" target="_blank">
                  <MonitorPlay className="w-4 h-4 mr-2" />
                  Modo TV
                </Link>
              </Button>
            )}
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white uppercase italic">
            Painel de Controle
          </h1>
          <p className="text-muted-foreground text-xs md:text-sm font-medium max-w-lg mt-2">
            Situação atual da {appSettings.app_name}. Torneios, caixa e classificações consolidadas em tempo real.
          </p>
        </div>
        {/* Mobile TV Button — Admin only */}
        {isOperator && (
          <Button size="lg" className="md:hidden w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_var(--color-primary)]/30 transition-all rounded-full py-6 z-10 font-black uppercase tracking-widest text-xs" asChild>
            <Link href="/tv" target="_blank">
              <MonitorPlay className="w-5 h-5 mr-2" />
              Acessar Modo TV
            </Link>
          </Button>
        )}
      </div>

      {/* BENTO GRID SUPERIOR */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-4 md:gap-6">

        {/* Card Destaque: Torneio Ao Vivo OU Event Banner */}
        <div className="md:col-span-4 lg:col-span-6">
          {activeTournament ? (
            <div className="group relative bg-gradient-to-br from-[#0F1C2E] to-[#0A121F] border border-white/10 rounded-[2.5rem] p-6 shadow-2xl overflow-hidden hover:border-[#00E676]/30 transition-all duration-500 h-full">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#00E676]/10 rounded-full blur-[80px] pointer-events-none -mr-10 -mt-20"></div>

              <div className="relative z-10 flex flex-col h-full justify-between min-h-[160px]">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-gradient-to-b from-[#00E676] to-[#00C853] rounded-2xl text-black ring-2 ring-[#00E676]/20 shadow-[0_0_20px_rgba(0,230,118,0.3)]">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-[#00E676]/10 border border-[#00E676]/30 rounded-full animate-pulse shadow-[0_0_15px_rgba(0,230,118,0.2)]">
                    <div className="w-2 h-2 rounded-full bg-[#00E676]" />
                    <span className="text-[10px] font-black text-[#00E676] uppercase tracking-[0.2em] leading-none mt-0.5">Ao Vivo</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase italic leading-none truncate">
                    {activeTournament.name}
                  </h3>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Modalidade:</span>
                    <span className="text-[#00E676] text-xs font-black uppercase italic tracking-widest bg-[#00E676]/10 px-2 py-1 rounded-md">
                      {activeTournament.modality === '3_bolinhas' ? '3 Bolinhas' : 'Bola 8'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <EventBanner
              initialText={eventBannerText}
              isAdmin={isOperator}
              hasActiveTournament={false}
            />
          )}
        </div>

        {/* Bloco Central (Vertical em mobile, 2 colunas no grid) */}
        <div className="md:col-span-2 lg:col-span-3 flex flex-col gap-4 md:gap-6">
          {/* ACCUMULATED YEARLY */}
          <div className="group flex-1 relative bg-gradient-to-br from-[#121A12] to-[#0D120D] border border-[#F5B400]/20 rounded-[2rem] p-5 shadow-2xl overflow-hidden hover:border-[#F5B400]/50 transition-all duration-500">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,180,0,0.1)_0%,transparent_60%)] pointer-events-none"></div>
            <div className="relative z-10 flex items-center justify-between h-full">
              <div>
                <h4 className="text-[10px] text-[#F5B400] font-black uppercase tracking-[0.2em] mb-1">Caixa Geral (Ano)</h4>
                <div className="text-2xl md:text-3xl font-black text-white tracking-tighter italic whitespace-nowrap">
                  <span className="text-sm text-white/50 mr-1">R$</span>{financials.fundYearly.toFixed(0)}
                </div>
              </div>
              <div className="p-3 bg-[#F5B400]/10 rounded-xl">
                <Wallet className="w-5 h-5 text-[#F5B400]" />
              </div>
            </div>
          </div>

          {/* ACCUMULATED MONTHLY */}
          <div className="group flex-1 relative bg-gradient-to-br from-[#0B1524] to-[#0A101A] border border-[#00C853]/20 rounded-[2rem] p-5 shadow-2xl overflow-hidden hover:border-[#00E676]/40 transition-all duration-500">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(0,230,118,0.1)_0%,transparent_60%)] pointer-events-none"></div>
            <div className="relative z-10 flex items-center justify-between h-full">
              <div>
                <h4 className="text-[10px] text-[#00E676] font-black uppercase tracking-[0.2em] mb-1">Caixa (Mês Atual)</h4>
                <div className="text-2xl md:text-3xl font-black text-white tracking-tighter italic whitespace-nowrap">
                  <span className="text-sm text-white/50 mr-1">R$</span>{financials.fundMonthly.toFixed(0)}
                </div>
              </div>
              <div className="p-3 bg-[#00E676]/10 rounded-xl">
                <DollarSign className="w-5 h-5 text-[#00E676]" />
              </div>
            </div>
          </div>
        </div>

        {/* Bloco Direito */}
        <div className="md:col-span-2 lg:col-span-3 flex flex-col gap-4 md:gap-6">
          {/* PRÓXIMO JOGO */}
          <div className="group flex-[1.5] relative bg-[#0F1C2E] border border-white/5 rounded-[2rem] p-5 shadow-2xl overflow-hidden">
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-[#FF5252]/10 rounded-xl text-[#FF5252]">
                    <Swords className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Próximo Jogo</span>
                </div>
                {nextMatch?.table && (
                  <span className="text-[9px] font-black px-2 py-0.5 bg-[#FF5252] text-black rounded-sm uppercase tracking-widest border border-white/20">
                    Mesa {nextMatch.table.number}
                  </span>
                )}
              </div>

              <div className="flex-1 flex flex-col justify-end">
                {nextMatch ? (
                  <>
                    <div className="text-lg md:text-xl font-black text-white tracking-tighter italic truncate text-right">
                      {nextMatch.player_a?.nickname || nextMatch.player_a?.name.split(' ')[0]}
                    </div>
                    <div className="text-center text-[#FF5252] font-black text-[10px] italic py-1">VS</div>
                    <div className="text-lg md:text-xl font-black text-slate-400 tracking-tighter italic truncate">
                      {nextMatch.player_b?.nickname || nextMatch.player_b?.name.split(' ')[0]}
                    </div>
                  </>
                ) : (
                  <div className="text-base font-black text-slate-500 italic uppercase">Aguardando chaveamento...</div>
                )}
              </div>
            </div>
          </div>

          {/* JOGADORES TOTAIS */}
          <div className="group flex-1 relative bg-white/5 border border-white/5 rounded-[2rem] p-5 shadow-2xl overflow-hidden flex items-center justify-between">
            <div>
              <div className="text-2xl font-black text-white italic">{playersCount || 0}</div>
              <h4 className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Atletas Ativos</h4>
            </div>
            <Users className="w-6 h-6 text-slate-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* SEÇÃO INFERIOR: Relatórios e Rankings Rápidos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Bloco Esquerdo: Estatísticas do Mês */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center gap-3 px-1">
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <TrendingUp className="w-5 h-5 text-[#4A90E2]" />
            </div>
            <h2 className="text-lg font-black text-white tracking-widest uppercase italic">Resumo do Mês</h2>
          </div>

          <div className="bg-[#0F1C2E] border border-[#4A90E2]/20 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#4A90E2]/10 rounded-full blur-[60px] pointer-events-none -mr-10 -mt-10"></div>

            <div className="space-y-1 relative z-10">
              {[
                { label: 'Torneios Realizados', value: financials.tourneysThisMonthCount, color: 'text-white', pulse: false },
                { label: 'Arrecadação Bruta', value: `R$ ${financials.totalArrecadadoMes.toLocaleString('pt-BR')}`, color: 'text-[#4A90E2]', pulse: false },
                { label: 'Média de Jogadores', value: financials.avgPlayersPerTournament.toFixed(1).replace('.0', ''), color: 'text-white', pulse: false },
                { label: 'Maior Prêmio (Mês)', value: `R$ ${financials.maxWinnerPrize.toLocaleString('pt-BR')}`, color: 'text-[#00E676]', pulse: true }
              ].map((stat, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-center py-4 px-2 hover:bg-white/5 rounded-2xl transition-all -mx-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                    <span className={`font-black text-xl italic ${stat.color} ${stat.pulse ? 'green-pulse' : ''}`}>{stat.value}</span>
                  </div>
                  {idx !== 3 && <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bloco Direito: Elite do Mês — Bola 8, 3 Bolinhas, Geral */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#F5B400]/10 rounded-xl">
                <Medal className="w-5 h-5 text-[#F5B400]" />
              </div>
              <h2 className="text-lg font-black text-[#F5B400] tracking-widest uppercase italic">Elite do Mês</h2>
            </div>
            <Link href="/ranking" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/5">
              Ver Classificação <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Bola 8 Preview (FIRST) */}
            <div className="bg-[#0F1C2E] border border-white/5 rounded-[2.5rem] p-5 shadow-2xl relative overflow-hidden flex flex-col">
              <h3 className="text-xs font-black text-center text-[#4A90E2] uppercase tracking-[0.2em] mb-4">Bola 8</h3>
              <div className="flex-1 space-y-2">
                {rankings.rank8.map((entry: any, i: number) => (
                  <div key={entry.player.id} className={`flex items-center gap-3 p-2.5 rounded-xl border ${i === 0 ? 'bg-gradient-to-r from-[#F5B400]/10 to-transparent border-[#F5B400]/30' : 'bg-black/20 border-white/5'}`}>
                    <div className="flex-shrink-0 w-5">
                      {i === 0 ? <Crown className="w-5 h-5 text-[#F5B400]" /> : i === 1 ? <Medal className="w-4 h-4 text-slate-300" /> : i === 2 ? <Medal className="w-4 h-4 text-[#CD7F32]" /> : <span className="text-[10px] font-black text-slate-500 italic pl-0.5">{i + 1}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-xs font-black uppercase italic truncate ${i === 0 ? 'text-[#F5B400]' : 'text-white'}`}>{entry.player.nickname || entry.player.name}</h4>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="text-base font-black italic text-[#4A90E2]">{entry.points}</div>
                    </div>
                  </div>
                ))}
                {rankings.rank8.length === 0 && <p className="text-center text-slate-500 text-xs font-black uppercase mt-6">Sem ranqueados</p>}
              </div>
            </div>

            {/* 3 Bolinhas Preview (SECOND) */}
            <div className="bg-[#0F1C2E] border border-white/5 rounded-[2.5rem] p-5 shadow-2xl relative overflow-hidden flex flex-col">
              <h3 className="text-xs font-black text-center text-[#00E676] uppercase tracking-[0.2em] mb-4">3 Bolinhas</h3>
              <div className="flex-1 space-y-2">
                {rankings.rank3.map((entry: any, i: number) => (
                  <div key={entry.player.id} className={`flex items-center gap-3 p-2.5 rounded-xl border ${i === 0 ? 'bg-gradient-to-r from-[#F5B400]/10 to-transparent border-[#F5B400]/30' : 'bg-black/20 border-white/5'}`}>
                    <div className="flex-shrink-0 w-5">
                      {i === 0 ? <Crown className="w-5 h-5 text-[#F5B400]" /> : i === 1 ? <Medal className="w-4 h-4 text-slate-300" /> : i === 2 ? <Medal className="w-4 h-4 text-[#CD7F32]" /> : <span className="text-[10px] font-black text-slate-500 italic pl-0.5">{i + 1}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-xs font-black uppercase italic truncate ${i === 0 ? 'text-[#F5B400]' : 'text-white'}`}>{entry.player.nickname || entry.player.name}</h4>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="text-base font-black italic text-[#00E676]">{entry.points}</div>
                    </div>
                  </div>
                ))}
                {rankings.rank3.length === 0 && <p className="text-center text-slate-500 text-xs font-black uppercase mt-6">Sem ranqueados</p>}
              </div>
            </div>

            {/* Geral Preview (THIRD) */}
            <div className="bg-[#0F1C2E] border border-white/5 rounded-[2.5rem] p-5 shadow-2xl relative overflow-hidden flex flex-col">
              <h3 className="text-xs font-black text-center text-[#F5B400] uppercase tracking-[0.2em] mb-4">Geral</h3>
              <div className="flex-1 space-y-2">
                {rankings.general.map((entry: any, i: number) => (
                  <div key={entry.player.id} className={`flex items-center gap-3 p-2.5 rounded-xl border ${i === 0 ? 'bg-gradient-to-r from-[#F5B400]/10 to-transparent border-[#F5B400]/30' : 'bg-black/20 border-white/5'}`}>
                    <div className="flex-shrink-0 w-5">
                      {i === 0 ? <Crown className="w-5 h-5 text-[#F5B400]" /> : i === 1 ? <Medal className="w-4 h-4 text-slate-300" /> : i === 2 ? <Medal className="w-4 h-4 text-[#CD7F32]" /> : <span className="text-[10px] font-black text-slate-500 italic pl-0.5">{i + 1}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-xs font-black uppercase italic truncate ${i === 0 ? 'text-[#F5B400]' : 'text-white'}`}>{entry.player.nickname || entry.player.name}</h4>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="text-base font-black italic text-[#F5B400]">{entry.points}</div>
                    </div>
                  </div>
                ))}
                {rankings.general.length === 0 && <p className="text-center text-slate-500 text-xs font-black uppercase mt-6">Sem ranqueados</p>}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
