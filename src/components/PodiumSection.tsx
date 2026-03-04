'use client'

import { Crown, Medal, Award } from 'lucide-react'

interface PodiumPlayer {
    player: {
        id: string
        name: string
        nickname?: string
        photo_url?: string
        wins?: number
        matches_played?: number
    }
    points: number
}

interface PodiumSectionProps {
    players: PodiumPlayer[]
}

export function PodiumSection({ players }: PodiumSectionProps) {
    const top3 = players.slice(0, 3)

    if (top3.length < 2) return null

    // Ordem visual: 2º | 1º | 3º
    const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean)
    const heights = [120, 160, 90] // 2º, 1º, 3º
    const delays = ['0.3s', '0.1s', '0.5s']
    const colors = [
        { bar: 'linear-gradient(180deg, #94A3B8 0%, #64748B 100%)', border: '#94A3B8', glow: 'rgba(148,163,184,0.2)', label: '2º', text: '#94A3B8' },
        { bar: 'linear-gradient(180deg, #F5B400 0%, #C48A00 100%)', border: '#F5B400', glow: 'rgba(245,180,0,0.35)', label: '1º', text: '#F5B400' },
        { bar: 'linear-gradient(180deg, #CD7F32 0%, #8B5A2B 100%)', border: '#CD7F32', glow: 'rgba(205,127,50,0.2)', label: '3º', text: '#CD7F32' },
    ]
    const icons = [
        <Medal key="2" className="w-5 h-5" />,
        <Crown key="1" className="w-6 h-6" />,
        <Award key="3" className="w-5 h-5" />,
    ]

    return (
        <section className="bg-gradient-to-br from-[#0F1C2E] to-[#0A1628] border border-white/5 rounded-[2.5rem] p-6 pt-8 shadow-2xl overflow-hidden mt-8">
            <div className="flex items-center justify-center gap-2 mb-8">
                <span className="text-2xl">🏆</span>
                <h2 className="text-white font-black text-lg uppercase italic tracking-tight">
                    Hall da Fama
                </h2>
                <span className="text-2xl">🏆</span>
            </div>

            {/* Podium Container */}
            <div className="flex items-end justify-center gap-3 px-2">
                {podiumOrder.map((entry, idx) => {
                    if (!entry) return null
                    const color = colors[idx]
                    const height = heights[idx]
                    const delay = delays[idx]
                    const icon = icons[idx]
                    const isChampion = idx === 1
                    const firstName = entry.player.name.split(' ')[0]

                    return (
                        <div
                            key={entry.player.id}
                            className="flex flex-col items-center flex-1 max-w-[130px]"
                        >
                            {/* Player Info (above bar) */}
                            <div className="flex flex-col items-center mb-3">
                                {/* Avatar */}
                                <div
                                    className="relative mb-2"
                                    style={{
                                        animation: `podium-rise 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay} both`,
                                    }}
                                >
                                    <div
                                        className={`rounded-full overflow-hidden bg-slate-900 flex items-center justify-center ${isChampion ? 'w-16 h-16 border-[3px]' : 'w-12 h-12 border-2'}`}
                                        style={{
                                            borderColor: color.border,
                                            boxShadow: `0 0 20px ${color.glow}`,
                                        }}
                                    >
                                        {entry.player.photo_url ? (
                                            <img
                                                src={entry.player.photo_url}
                                                alt={entry.player.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span
                                                className="font-black text-slate-600"
                                                style={{ fontSize: isChampion ? '1.25rem' : '0.875rem' }}
                                            >
                                                {entry.player.name.charAt(0)}
                                            </span>
                                        )}
                                    </div>
                                    {isChampion && (
                                        <div className="absolute -top-2 -right-1 w-6 h-6 bg-[#F5B400] rounded-full flex items-center justify-center shadow-lg podium-shimmer">
                                            <Crown className="w-3.5 h-3.5 text-black" />
                                        </div>
                                    )}
                                </div>

                                {/* Name */}
                                <p
                                    className={`font-black uppercase italic text-center truncate w-full leading-tight ${isChampion ? 'text-xs' : 'text-[10px]'}`}
                                    style={{ color: color.text }}
                                >
                                    {firstName}
                                </p>
                                {entry.player.nickname && isChampion && (
                                    <p className="text-[8px] text-[#F5B400]/60 font-bold uppercase tracking-widest truncate w-full text-center">
                                        &quot;{entry.player.nickname}&quot;
                                    </p>
                                )}
                            </div>

                            {/* Bar */}
                            <div
                                className="w-full rounded-t-2xl relative overflow-hidden"
                                style={{
                                    height: `${height}px`,
                                    background: color.bar,
                                    boxShadow: isChampion
                                        ? `0 0 30px ${color.glow}, inset 0 1px 0 rgba(255,255,255,0.3)`
                                        : `inset 0 1px 0 rgba(255,255,255,0.2)`,
                                    animation: `podium-rise 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay} both`,
                                }}
                            >
                                {/* Shimmer effect on champion bar */}
                                {isChampion && (
                                    <div
                                        className="absolute inset-0 podium-shimmer"
                                        style={{
                                            background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)',
                                            backgroundSize: '200% 100%',
                                        }}
                                    />
                                )}

                                {/* Bar content */}
                                <div className="flex flex-col items-center justify-center h-full relative z-10 px-2">
                                    {/* Position icon */}
                                    <div className="mb-1 opacity-80" style={{ color: isChampion ? '#000' : 'rgba(255,255,255,0.8)' }}>
                                        {icon}
                                    </div>

                                    {/* Position label */}
                                    <span
                                        className="font-black text-2xl italic leading-none"
                                        style={{ color: isChampion ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.5)' }}
                                    >
                                        {color.label}
                                    </span>

                                    {/* Points */}
                                    <div className="mt-2 flex flex-col items-center">
                                        <span
                                            className={`font-black italic leading-none ${isChampion ? 'text-xl' : 'text-lg'}`}
                                            style={{ color: isChampion ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.9)' }}
                                        >
                                            {entry.points}
                                        </span>
                                        <span
                                            className="text-[7px] font-bold uppercase tracking-widest mt-0.5"
                                            style={{ color: isChampion ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.4)' }}
                                        >
                                            pts
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Base line */}
            <div className="h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent mt-0 mx-4 rounded-full" />
        </section>
    )
}
