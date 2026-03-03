'use client'

import { useState } from 'react'
import { Trophy, Medal, Crown } from 'lucide-react'

interface RankingTabsProps {
    rank3: any[]
    rank8: any[]
    general: any[]
    initialTab: string
}

export function RankingTabs({ rank3, rank8, general, initialTab }: RankingTabsProps) {
    const [activeTab, setActiveTab] = useState(initialTab)

    const tabs = [
        { id: 'geral', label: 'Geral' },
        { id: 'rk_3', label: '3 Bolas' },
        { id: 'rk_8', label: 'Bola 8' },
    ]

    const currentList = activeTab === 'geral' ? general : activeTab === 'rk_3' ? rank3 : rank8
    const isGeneral = activeTab === 'geral'

    return (
        <>
            {/* TABS SECTION */}
            <div className="flex justify-center mb-8">
                <div className="flex w-full bg-[#0F1C2E] border border-white/5 p-1 rounded-2xl gap-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 text-slate-500 font-black text-[10px] py-4 rounded-xl transition-all uppercase tracking-widest ${activeTab === tab.id
                                    ? 'bg-white/5 text-[#00E676] shadow-sm'
                                    : 'hover:text-white hover:bg-white/[0.02]'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* TAB CONTENT */}
            <div className="animate-in fade-in duration-300">
                {renderRankingList(currentList, isGeneral)}
            </div>
        </>
    )
}

function renderRankingList(rankingList: any[], isGeneral = false) {
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
                    {/* 🥇 CAMPEÃO */}
                    {top3[0] && (
                        <div className="relative group bg-gradient-to-b from-[#000000] to-[#F5B400]/20 border-2 border-[#F5B400] rounded-[2.5rem] p-8 shadow-[0_0_30px_rgba(245,180,0,0.15)] overflow-hidden">
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
                                        &quot;{top3[0].player.nickname}&quot;
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

                    {/* 🥈 VICE & 🥉 TERCEIRO */}
                    <div className="grid grid-cols-2 gap-4">
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
                                        {player.nickname && <span className="text-[#00C853] text-[9px] font-black uppercase tracking-widest truncate">&quot;{player.nickname}&quot;</span>}
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
