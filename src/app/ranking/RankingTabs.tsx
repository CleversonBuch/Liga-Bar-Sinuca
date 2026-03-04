'use client'

import { useState } from 'react'
import { Trophy, Medal, Crown, Award } from 'lucide-react'

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

// ————————————————————————————————————————————
// Podium colors & config
// ————————————————————————————————————————————
const PODIUM = [
    { // 1º — Ouro
        bg: 'bg-gradient-to-b from-[#1A1400] to-[#F5B400]/10',
        border: 'border-[#F5B400]/60',
        avatarBorder: 'border-[#F5B400]',
        accentText: 'text-[#F5B400]',
        glow: 'shadow-[0_0_20px_rgba(245,180,0,0.15)]',
        badgeBg: 'bg-[#F5B400]',
        badgeText: 'text-black',
        Icon: Crown,
        label: 'Líder',
    },
    { // 2º — Prata / Azul
        bg: 'bg-gradient-to-b from-[#0B1524] to-[#94A3B8]/10',
        border: 'border-[#94A3B8]/40',
        avatarBorder: 'border-[#94A3B8]',
        accentText: 'text-[#94A3B8]',
        glow: '',
        badgeBg: 'bg-[#94A3B8]',
        badgeText: 'text-black',
        Icon: Medal,
        label: 'Vice',
    },
    { // 3º — Bronze
        bg: 'bg-gradient-to-b from-[#2A1A14] to-[#CD7F32]/10',
        border: 'border-[#CD7F32]/40',
        avatarBorder: 'border-[#CD7F32]',
        accentText: 'text-[#CD7F32]',
        glow: '',
        badgeBg: 'bg-[#CD7F32]',
        badgeText: 'text-white',
        Icon: Award,
        label: '3º',
    },
]

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
        <div className="space-y-8">
            {/* 🏆 PÓDIO — layout clássico: 2º | 1º | 3º */}
            <div className="flex flex-col items-center">
                <h2 className="text-[#F5B400] font-black text-lg mb-5 flex items-center gap-2 uppercase italic tracking-tight">
                    <span className="text-xl">👑</span> PÓDIO <span className="text-xl">👑</span>
                </h2>

                {/* Grid: 2º | 1º (elevated) | 3º */}
                <div className="grid grid-cols-3 gap-2 w-full items-end">
                    {/* Render in visual order: 2nd, 1st, 3rd */}
                    {[1, 0, 2].map((rankIdx) => {
                        const entry = top3[rankIdx]
                        if (!entry) return <div key={rankIdx} />
                        const cfg = PODIUM[rankIdx]
                        const isChampion = rankIdx === 0
                        const player = entry.player
                        const wr = ((player.wins / (player.matches_played || 1)) * 100).toFixed(0)
                        const firstName = player.name.split(' ')[0]

                        return (
                            <div
                                key={player.id}
                                className={`
                                    ${cfg.bg} ${cfg.border} ${cfg.glow}
                                    border rounded-2xl flex flex-col items-center
                                    transition-transform active:scale-[0.97]
                                    ${isChampion ? 'p-3 pb-4 -mt-4 z-10' : 'p-2.5 pb-3'}
                                `}
                            >
                                {/* Badge / Icon */}
                                <div className={`w-6 h-6 rounded-full ${cfg.badgeBg} flex items-center justify-center mb-2 ${isChampion ? 'w-7 h-7 podium-shimmer' : ''}`}>
                                    <cfg.Icon className={`${isChampion ? 'w-4 h-4' : 'w-3.5 h-3.5'} ${cfg.badgeText}`} />
                                </div>

                                {/* Avatar */}
                                <div className={`
                                    rounded-full overflow-hidden bg-slate-900 flex items-center justify-center mb-2
                                    ${isChampion
                                        ? `w-16 h-16 border-[3px] ${cfg.avatarBorder}`
                                        : `w-12 h-12 border-2 ${cfg.avatarBorder}`
                                    }
                                `}>
                                    {player.photo_url ? (
                                        <img src={player.photo_url} alt={player.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className={`font-black text-slate-600 ${isChampion ? 'text-xl' : 'text-base'}`}>
                                            {player.name.charAt(0)}
                                        </span>
                                    )}
                                </div>

                                {/* Position label */}
                                <span className={`text-[8px] font-black uppercase tracking-widest ${cfg.accentText} mb-0.5`}>
                                    {cfg.label}
                                </span>

                                {/* Name */}
                                <h4 className={`font-black text-white uppercase italic text-center truncate w-full leading-tight ${isChampion ? 'text-xs' : 'text-[10px]'}`}>
                                    {firstName}
                                </h4>
                                {player.nickname && (
                                    <p className={`${cfg.accentText} font-bold uppercase tracking-widest truncate w-full text-center ${isChampion ? 'text-[8px]' : 'text-[7px]'}`}>
                                        &quot;{player.nickname}&quot;
                                    </p>
                                )}

                                {/* Points */}
                                <div className="mt-2 flex flex-col items-center">
                                    <span className={`font-black italic leading-none ${cfg.accentText} ${isChampion ? 'text-2xl' : 'text-lg'}`}>
                                        {entry.points}
                                    </span>
                                    <span className="text-slate-600 font-black text-[7px] uppercase tracking-widest mt-0.5">
                                        pontos
                                    </span>
                                </div>

                                {/* Separator */}
                                <div className="w-full h-px bg-white/5 my-2" />

                                {/* Stats row */}
                                <div className="flex justify-around w-full">
                                    <div className="text-center">
                                        <p className={`text-[#00C853] font-black italic ${isChampion ? 'text-sm' : 'text-xs'}`}>{player.wins || 0}</p>
                                        <p className="text-slate-600 font-black text-[6px] uppercase tracking-widest">V</p>
                                    </div>
                                    <div className="text-center">
                                        <p className={`text-[#FF5252] font-black italic ${isChampion ? 'text-sm' : 'text-xs'}`}>{(player.matches_played || 0) - (player.wins || 0)}</p>
                                        <p className="text-slate-600 font-black text-[6px] uppercase tracking-widest">D</p>
                                    </div>
                                    <div className="text-center">
                                        <p className={`text-white/80 font-black italic ${isChampion ? 'text-sm' : 'text-xs'}`}>{wr}%</p>
                                        <p className="text-slate-600 font-black text-[6px] uppercase tracking-widest">%</p>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* ⭐ ZONA DE ELITE */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-[#00E676] text-lg">⭐</span>
                    <h2 className="text-[#00E676] font-black text-lg uppercase italic tracking-tighter">
                        Zona de Elite
                    </h2>
                </div>

                <div className="space-y-2">
                    {others.map((entry, index) => {
                        const player = entry.player
                        const pos = index + 4
                        const wr = ((player.wins / (player.matches_played || 1)) * 100).toFixed(0)

                        return (
                            <div key={player.id} className="bg-[#0F1C2E] border border-white/5 rounded-xl p-3 flex items-center gap-3 group active:scale-[0.98] transition-transform">
                                <div className="w-7 h-7 flex items-center justify-center relative flex-shrink-0">
                                    <span className="text-xl font-black text-[#00C853]/20 italic absolute">{pos}</span>
                                    <span className="text-xs font-black text-white z-10 italic">{pos}</span>
                                </div>

                                <div className="w-9 h-9 rounded-full border border-white/10 overflow-hidden bg-slate-900 flex items-center justify-center flex-shrink-0">
                                    {player.photo_url ? (
                                        <img src={player.photo_url} alt={player.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-xs font-black text-slate-700 uppercase">{player.name.charAt(0)}</span>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className="text-white font-black text-xs uppercase truncate leading-none mb-1 italic">
                                        {player.name}
                                    </h4>
                                    <div className="flex items-center gap-1.5">
                                        {player.nickname && <span className="text-[#00C853] text-[8px] font-black uppercase tracking-widest truncate">&quot;{player.nickname}&quot;</span>}
                                        <span className="text-slate-500 text-[8px] font-black uppercase flex items-center gap-1">
                                            <span className="text-[#00C853]">{player.wins}V</span>
                                            <span className="text-[#FF5252]">{(player.matches_played || 0) - (player.wins || 0)}D</span>
                                            <span className="text-white/60">{wr}%</span>
                                        </span>
                                    </div>
                                </div>

                                <div className="text-right flex-shrink-0">
                                    <div className="text-lg font-black text-[#00E676] italic leading-none">{entry.points}</div>
                                    <div className="text-[7px] text-slate-600 font-bold uppercase tracking-widest mt-0.5">pts</div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
