import { getRankings } from './actions'
import { getAppSettings } from '@/app/settings/actions'
import { Trophy, Medal, Crown, ArrowLeft, Info } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RulesModal } from '@/components/RulesModal'

export default async function RankingPage(props: {
    searchParams: Promise<{ period?: string, tab?: string }>
}) {
    const searchParams = await props.searchParams
    const period = (searchParams.period as 'mes' | 'trimestre' | 'semestre' | 'ano') || 'mes'
    const activeTab = searchParams.tab || 'geral'
    const { rank3, rank8, general } = await getRankings(period)
    const appSettings = await getAppSettings()

    const renderRankingTable = (rankingList: any[], isGeneral = false) => {
        if (rankingList.length === 0) {
            return (
                <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl mt-4">
                    <p className="text-slate-500">Nenhum jogador pontuou neste ranking (neste mês/ano) ainda.</p>
                </div>
            )
        }

        const top3 = rankingList.slice(0, 3)

        // Auxiliar para a foto do pódio
        const renderPodiumPlayer = (entry: any, position: 1 | 2 | 3) => {
            if (!entry) return null
            const player = isGeneral ? entry.player : entry.player
            const points = entry.points

            const wins = player.wins || 0
            const matches = player.matches_played || 1
            const losses = matches - wins
            const winRate = ((wins / matches) * 100).toFixed(0)

            let containerClasses = ""
            let bgGradient = ""
            let borderClass = ""
            let ringClass = ""
            let Icon = null
            let rankText = ""

            // Estilos específicos baseados no PRD
            if (position === 1) {
                containerClasses = "order-first sm:order-none w-full sm:w-[320px] scale-100 sm:scale-110 z-20"
                bgGradient = "bg-gradient-to-b from-[#1A1800] to-[#F5B400]/20"
                borderClass = "border-[#F5B400] shadow-[0_0_30px_rgba(245,180,0,0.3)]"
                ringClass = "ring-4 ring-[#F5B400] shadow-[0_0_20px_rgba(245,180,0,0.5)]"
                Icon = Crown
                rankText = "🏆 PÓDIO"
            } else if (position === 2) {
                containerClasses = "w-1/2 sm:w-[260px] z-10"
                bgGradient = "bg-gradient-to-b from-[#0B1524] to-[#1E3A5F]/40"
                borderClass = "border-[#4A90E2] shadow-[0_0_20px_rgba(74,144,226,0.2)]"
                ringClass = "ring-4 ring-[#4A90E2]"
                Icon = Medal
                rankText = "🥈 2º LUGAR"
            } else {
                containerClasses = "w-1/2 sm:w-[260px] z-10"
                bgGradient = "bg-gradient-to-b from-[#2A1A14] to-[#6B3E2E]/40"
                borderClass = "border-[#CD7F32] shadow-[0_0_20px_rgba(205,127,50,0.2)]"
                ringClass = "ring-4 ring-[#CD7F32]"
                Icon = Medal
                rankText = "🥉 3º LUGAR"
            }

            return (
                <div className={`${containerClasses} flex flex-col items-center p-6 rounded-3xl border border-t-2 ${borderClass} ${bgGradient} backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 group relative overflow-hidden mt-4 sm:mt-0`}>

                    {/* Glow interno (Top) */}
                    <div className={`absolute top-0 w-3/4 h-1/2 bg-white/5 blur-3xl rounded-full pointer-events-none`} />

                    {/* Badge Topo */}
                    <div className="flex items-center gap-2 mb-4">
                        <span className={`text-[10px] sm:text-xs font-black tracking-widest uppercase ${position === 1 ? 'text-[#F5B400]' : position === 2 ? 'text-[#4A90E2]' : 'text-[#CD7F32]'}`}>
                            {rankText}
                        </span>
                    </div>

                    {/* Avatar */}
                    <div className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full ${ringClass} bg-[#0B0F1A] flex items-center justify-center mb-5 overflow-hidden z-20`}>
                        {player.photo_url ? (
                            <img src={player.photo_url} alt={player.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="font-black text-slate-400 text-3xl">{player.name.charAt(0)}</span>
                        )}
                        {/* Overlay Gradient on Image Bottom */}
                        <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-[#0B0F1A]/80 to-transparent" />
                    </div>

                    {/* Info */}
                    <div className="text-center w-full z-20">
                        <h3 className="font-black text-white text-lg sm:text-xl truncate px-2 mb-1" title={player.name}>
                            {player.name}
                        </h3>
                        {player.nickname && (
                            <p className={`text-xs sm:text-sm font-bold uppercase tracking-wider mb-4 ${position === 1 ? 'text-[#F5B400]' : position === 2 ? 'text-[#4A90E2]' : 'text-[#CD7F32]'}`}>
                                "{player.nickname}"
                            </p>
                        )}

                        {/* Separador */}
                        <div className="w-16 h-[2px] bg-white/10 mx-auto my-4 rounded-full" />

                        {/* Pontuação Principal Central */}
                        <div className="mb-4">
                            <span className={`font-black text-4xl sm:text-5xl drop-shadow-lg ${position === 1 ? 'text-[#F5B400]' : position === 2 ? 'text-white' : 'text-[#E6AB7A]'}`}>
                                {points}
                            </span>
                            <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">Pontos Totais</span>
                        </div>

                        {/* Estatísticas resumidas */}
                        <div className="flex items-center justify-center gap-3 sm:gap-4 mt-4 py-2 px-3 bg-black/40 rounded-xl border border-white/5 w-max mx-auto">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#00C853] animate-pulse" />
                                <span className="font-bold text-[#00C853] text-[10px] sm:text-xs">{wins} V</span>
                            </div>
                            <div className="w-px h-3 bg-white/20" />
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#FF5252]" />
                                <span className="font-bold text-[#FF5252] text-[10px] sm:text-xs">{losses} D</span>
                            </div>
                            <div className="w-px h-3 bg-white/20" />
                            <div className="font-black text-white text-[10px] sm:text-xs">
                                {winRate}%
                            </div>
                        </div>

                        {/* Títulos e Ganhos no Pódio */}
                        <div className="flex flex-col gap-2 mt-5 pt-4 border-t border-white/10 w-full max-w-[200px] mx-auto">
                            <div className="flex justify-between items-center bg-black/30 py-1.5 px-3 rounded-lg border border-white/5">
                                <div className="flex items-center gap-2">
                                    <Trophy className="w-3 h-3 text-amber-500" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Títulos</span>
                                </div>
                                <span className="text-xs font-black text-amber-500">{player.titles || 0}</span>
                            </div>
                            <div className="flex justify-between items-center bg-black/30 py-1.5 px-3 rounded-lg border border-white/5">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black text-emerald-500">$</span>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Ganhos</span>
                                </div>
                                <span className="text-xs font-black text-emerald-400">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(player.total_earnings || 0)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }

        return (
            <div className="space-y-12 mt-8">
                {/* Podio Container */}
                {top3.length > 0 && (
                    <div className="relative">
                        {/* Efeitos de Luz de Fundo do Pódio */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-full bg-[#F5B400]/5 blur-[120px] rounded-full pointer-events-none" />

                        <div className="flex flex-wrap sm:flex-nowrap items-end justify-center gap-4 sm:gap-6 px-2 relative z-10 w-full max-w-5xl mx-auto">
                            {/* Layout Flexbox com ordem condicional no CSS (order-first no 1º lugar no mobile) */}
                            {renderPodiumPlayer(top3[1], 2)}
                            {renderPodiumPlayer(top3[0], 1)}
                            {renderPodiumPlayer(top3[2], 3)}
                        </div>
                    </div>
                )}

                {/* ZONA DE ELITE (Tabela de todos os jogadores) */}
                {rankingList.length > 0 ? (
                    <div className="mt-16 w-full max-w-4xl mx-auto">
                        <div className="flex items-center gap-3 mb-6 px-2">
                            <span className="text-xl sm:text-2xl font-black text-white px-3 py-1 bg-[#1E3A5F] rounded-lg">⭐</span>
                            <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200 uppercase tracking-widest drop-shadow-md">
                                Zona de Elite
                            </h2>
                        </div>

                        <div className="space-y-3">
                            {rankingList.map((entry: any, index: number) => {
                                const player = isGeneral ? entry.player : entry.player
                                const points = entry.points

                                const wins = player.wins || 0
                                const matches = player.matches_played || 1
                                const losses = matches - wins
                                const winRate = ((wins / matches) * 100).toFixed(0)

                                // Cores especiais para top 3
                                let positionColor = "text-slate-500"
                                if (index === 0) positionColor = "text-[#F5B400] drop-shadow-[0_0_8px_rgba(245,180,0,0.5)]"
                                else if (index === 1) positionColor = "text-[#4A90E2] drop-shadow-[0_0_8px_rgba(74,144,226,0.5)]"
                                else if (index === 2) positionColor = "text-[#CD7F32] drop-shadow-[0_0_8px_rgba(205,127,50,0.5)]"

                                return (
                                    <div
                                        key={player.id}
                                        className="flex items-center bg-gradient-to-r from-[#0B1524] to-[#111A2C] border border-white/5 p-3 sm:p-4 rounded-2xl hover:bg-white/5 transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:border-emerald-500/20 group"
                                    >
                                        {/* Posição */}
                                        <div className={`w-10 sm:w-14 font-black text-xl sm:text-3xl text-center ${positionColor} mr-2 sm:mr-4`}>
                                            {index + 1}
                                        </div>

                                        {/* Avatar */}
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-slate-700 bg-slate-800 flex items-center justify-center flex-shrink-0 overflow-hidden mr-3 sm:mr-4">
                                            {player.photo_url ? (
                                                <img src={player.photo_url} alt={player.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="font-bold text-slate-400 text-sm sm:text-base">{player.name.charAt(0)}</span>
                                            )}
                                        </div>

                                        {/* Info Jogador */}
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-white text-sm sm:text-base truncate">{player.name}</div>
                                            {player.nickname ? (
                                                <div className="text-[10px] sm:text-xs font-black text-emerald-500 uppercase tracking-widest truncate">
                                                    "{player.nickname}"
                                                </div>
                                            ) : null}

                                            {/* Status Resumido Mobile */}
                                            <div className="sm:hidden flex flex-wrap gap-x-2 gap-y-1 mt-1.5">
                                                <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                                                    <span className="text-[#00C853]">{wins}V</span> | <span className="text-[#FF5252]">{losses}D</span> | {winRate}%
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Trophy className="w-2.5 h-2.5 text-amber-500" />
                                                    <span className="text-[9px] font-black text-amber-500">{player.titles || 0}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[10px] font-black text-emerald-500 leading-none">$</span>
                                                    <span className="text-[9px] font-black text-emerald-500">
                                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(player.total_earnings || 0)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Estatísticas (Desktop Elite Zone) */}
                                        <div className="hidden sm:flex items-center gap-3 px-4 text-xs font-bold text-slate-400">
                                            <div className="text-center min-w-[40px]">
                                                <span className="block text-[#00C853] text-sm">{wins}V</span>
                                            </div>
                                            <div className="w-px h-6 bg-slate-800" />
                                            <div className="text-center min-w-[40px]">
                                                <span className="block text-white text-sm">{winRate}%</span>
                                            </div>
                                            <div className="w-px h-6 bg-slate-800" />
                                            <div className="text-center px-2">
                                                <div className="flex items-center gap-1.5 justify-center">
                                                    <Trophy className="w-3 h-3 text-amber-500" />
                                                    <span className="text-amber-500 text-sm">{player.titles || 0}</span>
                                                </div>
                                                <span className="text-[8px] uppercase tracking-tighter text-slate-600 block mt-0.5">Títulos</span>
                                            </div>
                                            <div className="w-px h-6 bg-slate-800" />
                                            <div className="text-center px-2">
                                                <span className="block text-emerald-400 text-sm">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(player.total_earnings || 0)}
                                                </span>
                                                <span className="text-[8px] uppercase tracking-tighter text-slate-600 block mt-0.5">Ganhos</span>
                                            </div>
                                        </div>

                                        {/* Pontos Totais */}
                                        <div className="text-right pl-3 sm:pl-6 border-l border-white/5">
                                            <span className="block font-black text-emerald-400 text-lg sm:text-2xl leading-none shadow-emerald-400/20 drop-shadow-lg">
                                                {points}
                                            </span>
                                            <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-slate-500">
                                                Pontos
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ) : null}
            </div>
        )
    }

    return (
        <div className="w-full text-white animate-in fade-in duration-500 pb-10">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 md:p-8 space-y-6 md:space-y-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mt-4">
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white flex items-center justify-center md:justify-start gap-2">
                            Ranking Completo
                        </h1>
                        <p className="text-slate-500 text-xs mt-1 font-bold uppercase tracking-[0.2em]">{appSettings.app_name} Classificação Oficial</p>
                    </div>

                    {/* Seletor de Período Premium */}
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 backdrop-blur-xl">
                            {(['mes', 'ano'] as const).map((p) => (
                                <Link
                                    key={p}
                                    href={`/ranking?period=${p}&tab=${activeTab}`}
                                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${period === p
                                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                                        : 'text-slate-500 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {p === 'mes' ? 'Mensal' : 'Anual'}
                                </Link>
                            ))}
                        </div>

                        <RulesModal />
                    </div>
                </div>

                <Tabs defaultValue={activeTab} className="w-full">
                    <div className="flex justify-center mb-8">
                        <TabsList className="inline-flex w-auto max-w-full bg-slate-900/60 backdrop-blur-xl border border-white/5 p-1.5 rounded-2xl shadow-2xl overflow-x-auto no-scrollbar gap-1">
                            <Link href={`/ranking?period=${period}&tab=geral`} className="contents">
                                <TabsTrigger value="geral" className="text-slate-400 font-black text-[10px] sm:text-xs py-3 px-5 sm:px-8 rounded-xl data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all flex-shrink-0 uppercase tracking-widest">
                                    Geral
                                </TabsTrigger>
                            </Link>
                            <Link href={`/ranking?period=${period}&tab=rk_3`} className="contents">
                                <TabsTrigger value="rk_3" className="text-slate-400 font-black text-[10px] sm:text-xs py-3 px-5 sm:px-8 rounded-xl data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all flex-shrink-0 uppercase tracking-widest">
                                    3 Bolinhas
                                </TabsTrigger>
                            </Link>
                            <Link href={`/ranking?period=${period}&tab=rk_8`} className="contents">
                                <TabsTrigger value="rk_8" className="text-slate-400 font-black text-[10px] sm:text-xs py-3 px-5 sm:px-8 rounded-xl data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all flex-shrink-0 uppercase tracking-widest">
                                    Bola 8
                                </TabsTrigger>
                            </Link>
                        </TabsList>
                    </div>

                    <TabsContent value="geral" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                        {renderRankingTable(general, true)}
                    </TabsContent>

                    <TabsContent value="rk_3" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                        {renderRankingTable(rank3)}
                    </TabsContent>

                    <TabsContent value="rk_8" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                        {renderRankingTable(rank8)}
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    )
}
