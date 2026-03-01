import { getRankings, getEvolutionData } from './actions'
import { getAppSettings } from '@/app/settings/actions'
import { Trophy, Medal, Crown, ArrowLeft, Info, Menu, Zap, Star, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RulesModal } from '@/components/RulesModal'
import { EvolutionChart } from '@/components/EvolutionChart'

export default async function RankingPage(props: {
    searchParams: Promise<{ period?: string, tab?: string }>
}) {
    const searchParams = await props.searchParams
    const period = (searchParams.period as 'mes' | 'ano') || 'mes'
    const activeTab = searchParams.tab || 'geral'
    const { rank3, rank8, general } = await getRankings(period)
    const evolutionData = await getEvolutionData()
    const appSettings = await getAppSettings()

    const renderRankingList = (rankingList: any[], isGeneral = false) => {
        if (rankingList.length === 0) {
            return (
                <div className="p-8 text-center bg-[#0F1C2E] border border-white/5 rounded-[2rem] mt-4">
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Aguardando dados oficiais...</p>
                </div>
            )
        }

        const top3 = rankingList.slice(0, 3)
        const others = rankingList.slice(3)

        return (
            <div className="space-y-10">
                {/* 🏆 SEÇÃO PÓDIO */}
                <div className="flex flex-col items-center">
                    <h2 className="text-[#F5B400] font-black text-xl mb-6 flex items-center gap-2">
                        👑 PÓDIO 👑
                    </h2>

                    <div className="w-full space-y-4">
                        {/* 🥇 CAMPEÃO (CENTRAL/MAIOR) */}
                        {top3[0] && (
                            <div className="relative group bg-gradient-to-b from-[#000000] to-[#F5B400]/20 border-2 border-[#F5B400] rounded-[2.5rem] p-8 shadow-[0_0_30px_rgba(245,180,0,0.15)] overflow-hidden animate-in fade-in zoom-in-95 duration-700">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#F5B400]/10 rounded-full blur-3xl -mr-10 -mt-10" />

                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="mb-4">
                                        <div className="w-10 h-10 bg-[#F5B400] rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(245,180,0,0.5)]">
                                            <Crown className="w-6 h-6 text-black" />
                                        </div>
                                    </div>

                                    <div className="relative mb-4">
                                        <div className="w-28 h-28 rounded-full border-4 border-[#F5B400] overflow-hidden shadow-[0_0_20px_rgba(245,180,0,0.3)] bg-slate-900 flex items-center justify-center">
                                            {top3[0].player.photo_url ? (
                                                <img src={top3[0].player.photo_url} alt={top3[0].player.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-4xl font-black text-slate-700">{top3[0].player.name.charAt(0)}</span>
                                            )}
                                        </div>
                                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#F5B400] text-black text-[10px] font-black px-3 py-1 rounded-full uppercase italic">
                                            Líder
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter text-center">
                                        {top3[0].player.name}
                                    </h3>
                                    {top3[0].player.nickname && (
                                        <p className="text-[#F5B400] font-black text-xs uppercase tracking-widest mt-1">
                                            "{top3[0].player.nickname}"
                                        </p>
                                    )}

                                    <div className="mt-6 flex flex-col items-center">
                                        <span className="text-5xl font-black text-[#F5B400] italic drop-shadow-[0_0_10px_rgba(245,180,0,0.3)]">
                                            {top3[0].points}
                                        </span>
                                        <span className="text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] mt-1">pontos</span>
                                    </div>

                                    <div className="w-full h-px bg-white/10 my-6" />

                                    <div className="flex justify-around w-full">
                                        <div className="text-center">
                                            <p className="text-[#00C853] font-black text-lg italic">{top3[0].player.wins || 0}</p>
                                            <p className="text-slate-600 font-black text-[8px] uppercase tracking-widest">Vitórias</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[#FF5252] font-black text-lg italic">{(top3[0].player.matches_played || 0) - (top3[0].player.wins || 0)}</p>
                                            <p className="text-slate-600 font-black text-[8px] uppercase tracking-widest">Derrotas</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-white font-black text-lg italic">{((top3[0].player.wins / (top3[0].player.matches_played || 1)) * 100).toFixed(0)}%</p>
                                            <p className="text-slate-600 font-black text-[8px] uppercase tracking-widest">Aproveit.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 🥈 VICE & 🥉 TERCEIRO (Lado a Lado) */}
                        <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-bottom-10 duration-1000 delay-200">
                            {/* VICE */}
                            {top3[1] && (
                                <div className="bg-gradient-to-b from-[#0B1524] to-[#1E3A5F]/40 border border-[#4A90E2]/40 rounded-[2rem] p-6 flex flex-col items-center">
                                    <div className="w-8 h-8 rounded-full bg-[#4A90E2] flex items-center justify-center mb-3">
                                        <Medal className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="w-16 h-16 rounded-full border-2 border-[#4A90E2] overflow-hidden mb-3 bg-slate-900 flex items-center justify-center">
                                        {top3[1].player.photo_url ? (
                                            <img src={top3[1].player.photo_url} alt={top3[1].player.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-xl font-black text-slate-700">{top3[1].player.name.charAt(0)}</span>
                                        )}
                                    </div>
                                    <h4 className="text-sm font-black text-white text-center truncate w-full uppercase italic">
                                        {top3[1].player.name.split(' ')[0]}
                                    </h4>
                                    <p className="text-xl font-black text-[#4A90E2] mt-2 italic">{top3[1].points}</p>
                                    <p className="text-[8px] text-slate-500 font-black uppercase mt-1 tracking-widest">PONTOS</p>
                                </div>
                            )}

                            {/* TERCEIRO */}
                            {top3[2] && (
                                <div className="bg-gradient-to-b from-[#2A1A14] to-[#6B3E2E]/40 border border-[#CD7F32]/40 rounded-[2rem] p-6 flex flex-col items-center">
                                    <div className="w-8 h-8 rounded-full bg-[#CD7F32] flex items-center justify-center mb-3">
                                        <Medal className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="w-16 h-16 rounded-full border-2 border-[#CD7F32] overflow-hidden mb-3 bg-slate-900 flex items-center justify-center">
                                        {top3[2].player.photo_url ? (
                                            <img src={top3[2].player.photo_url} alt={top3[2].player.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-xl font-black text-slate-700">{top3[2].player.name.charAt(0)}</span>
                                        )}
                                    </div>
                                    <h4 className="text-sm font-black text-white text-center truncate w-full uppercase italic">
                                        {top3[2].player.name.split(' ')[0]}
                                    </h4>
                                    <p className="text-xl font-black text-[#CD7F32] mt-2 italic">{top3[2].points}</p>
                                    <p className="text-[8px] text-slate-500 font-black uppercase mt-1 tracking-widest">PONTOS</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ⭐ ZONA DE ELITE */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[#00E676] text-xl">⭐</span>
                        <h2 className="text-[#00E676] font-black text-xl uppercase italic tracking-tighter">
                            Zona de Elite
                        </h2>
                    </div>

                    <div className="space-y-3">
                        {others.map((entry, index) => {
                            const player = entry.player
                            const pos = index + 4
                            const wr = ((player.wins / (player.matches_played || 1)) * 100).toFixed(0)

                            return (
                                <div key={player.id} className="bg-[#0F1C2E] border border-white/5 rounded-2xl p-4 flex items-center gap-4 group active:scale-[0.98] transition-transform">
                                    <div className="w-8 h-8 flex items-center justify-center relative">
                                        <span className="text-2xl font-black text-[#00C853]/20 italic absolute">{pos}</span>
                                        <span className="text-sm font-black text-white z-10 italic">{pos}</span>
                                    </div>

                                    <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden bg-slate-900 flex items-center justify-center flex-shrink-0">
                                        {player.photo_url ? (
                                            <img src={player.photo_url} alt={player.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-sm font-black text-slate-700 uppercase">{player.name.charAt(0)}</span>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-white font-black text-sm uppercase truncate leading-none mb-1 italic">
                                            {player.name}
                                        </h4>
                                        <div className="flex items-center gap-2">
                                            {player.nickname && <span className="text-[#00C853] text-[9px] font-black uppercase tracking-widest truncate">"{player.nickname}"</span>}
                                            <span className="text-slate-500 text-[9px] font-black uppercase flex items-center gap-1">
                                                <span className="text-[#00C853]">{player.wins}V</span>
                                                <span className="text-[#FF5252]">{(player.matches_played || 0) - (player.wins || 0)}D</span>
                                                <span className="text-white/60">{wr}%</span>
                                            </span>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="text-xl font-black text-[#00E676] italic leading-none">{entry.points}</div>
                                        <div className="text-[8px] text-slate-600 font-bold uppercase tracking-widest mt-1">pts</div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#081220] flex flex-col pb-20">
            {/* 🔝 HEADER FIXO SUPERIOR */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-[#0D1B2A] border-b border-white/5 z-50 px-4 flex items-center justify-between shadow-lg">
                <Button variant="ghost" size="icon" className="text-white">
                    <Menu className="w-6 h-6" />
                </Button>

                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden">
                        <div className="w-full h-full bg-black relative flex items-center justify-center">
                            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[10px] font-black italic">8</div>
                        </div>
                    </div>
                    <span className="font-black text-lg italic tracking-tighter text-white">
                        A.C.L.S <span className="text-[#00E676] drop-shadow-[0_0_8px_rgba(0,230,118,0.5)]">LIGA</span>
                    </span>
                </div>

                <div className="w-10" /> {/* Spacer */}
            </header>

            {/* MAIN CONTENT */}
            <main className="mt-16 px-4 py-8 space-y-8 animate-in fade-in duration-1000">
                {/* 📊 CARD – EVOLUÇÃO TOP 5 */}
                <section className="bg-gradient-to-br from-[#0F1C2E] to-[#12263A] border border-white/5 rounded-[2.5rem] p-6 shadow-2xl overflow-hidden">
                    <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-5 h-5 text-[#00E676]" />
                        <h2 className="text-white font-semibold text-base">Evolução Top 5</h2>
                    </div>

                    <EvolutionChart data={evolutionData} />
                </section>

                {/* PERIOD SELECTOR */}
                <div className="flex bg-[#0F1C2E] p-1.5 rounded-2xl border border-white/5 mx-auto w-max shadow-inner">
                    {(['mes', 'ano'] as const).map((p) => (
                        <Link
                            key={p}
                            href={`/ranking?period=${p}&tab=${activeTab}`}
                            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${period === p
                                ? 'bg-[#00C853] text-black shadow-lg shadow-[#00C853]/20'
                                : 'text-slate-500 hover:text-white'
                                }`}
                        >
                            {p === 'mes' ? 'Mensal' : 'Anual'}
                        </Link>
                    ))}
                </div>

                {/* TABS SECTION */}
                <Tabs defaultValue={activeTab} className="w-full">
                    <div className="flex justify-center mb-8">
                        <TabsList className="flex w-full bg-[#0F1C2E] border border-white/5 p-1 rounded-2xl gap-1">
                            <Link href={`/ranking?period=${period}&tab=geral`} className="flex-1">
                                <TabsTrigger value="geral" className="w-full text-slate-500 font-black text-[10px] py-4 rounded-xl data-[state=active]:bg-white/5 data-[state=active]:text-[#00E676] transition-all uppercase tracking-widest">
                                    Geral
                                </TabsTrigger>
                            </Link>
                            <Link href={`/ranking?period=${period}&tab=rk_3`} className="flex-1">
                                <TabsTrigger value="rk_3" className="w-full text-slate-500 font-black text-[10px] py-4 rounded-xl data-[state=active]:bg-white/5 data-[state=active]:text-[#00E676] transition-all uppercase tracking-widest">
                                    3 Bolas
                                </TabsTrigger>
                            </Link>
                            <Link href={`/ranking?period=${period}&tab=rk_8`} className="flex-1">
                                <TabsTrigger value="rk_8" className="w-full text-slate-500 font-black text-[10px] py-4 rounded-xl data-[state=active]:bg-white/5 data-[state=active]:text-[#00E676] transition-all uppercase tracking-widest">
                                    Bola 8
                                </TabsTrigger>
                            </Link>
                        </TabsList>
                    </div>

                    <TabsContent value="geral" className="mt-0 focus-visible:outline-none">
                        {renderRankingList(general, true)}
                    </TabsContent>

                    <TabsContent value="rk_3" className="mt-0 focus-visible:outline-none">
                        {renderRankingList(rank3)}
                    </TabsContent>

                    <TabsContent value="rk_8" className="mt-0 focus-visible:outline-none">
                        {renderRankingList(rank8)}
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    )
}
