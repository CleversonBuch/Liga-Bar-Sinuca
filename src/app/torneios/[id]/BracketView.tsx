'use client'

import { useRef, useState, useEffect } from 'react'
import { Trophy, Check, X } from 'lucide-react'

interface Match {
    id: string
    phase: number
    phase_name: string
    player_a?: { name: string; nickname?: string }
    player_b?: { name: string; nickname?: string }
    score_a: number
    score_b: number
    winner_id?: string
    is_bye: boolean
    player_a_id?: string
    player_b_id?: string
}

export function BracketView({ matches }: { matches: Match[] }) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [startX, setStartX] = useState(0)
    const [scrollLeft, setScrollLeft] = useState(0)

    if (!matches || matches.length === 0) return null

    // Group by phase
    const phases = [...new Set(matches.map(m => m.phase))].sort((a, b) => a - b)

    // Drag-to-scroll handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!scrollRef.current) return
        setIsDragging(true)
        setStartX(e.pageX - scrollRef.current.offsetLeft)
        setScrollLeft(scrollRef.current.scrollLeft)
    }

    const handleMouseLeave = () => {
        setIsDragging(false)
    }

    const handleMouseUp = () => {
        setIsDragging(false)
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !scrollRef.current) return
        e.preventDefault()
        const x = e.pageX - scrollRef.current.offsetLeft
        const walk = (x - startX) * 2 // Scroll speed
        scrollRef.current.scrollLeft = scrollLeft - walk
    }

    return (
        <div className="relative group">
            {/* Fade indicators */}
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-slate-900 to-transparent z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-slate-900 to-transparent z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />

            <div
                ref={scrollRef}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                className={`w-full overflow-x-auto pb-12 pt-16 custom-scrollbar select-none cursor-grab active:cursor-grabbing`}
            >
                <div className="flex min-w-max px-12 justify-center items-center" style={{ minHeight: '600px' }}>
                    {phases.map((phase, pIndex) => {
                        const phaseMatches = matches.filter(m => m.phase === phase)

                        return (
                            <div key={phase} className="flex flex-col justify-around min-w-[300px] w-[300px] relative mx-8 h-full">
                                {/* Phase Header */}
                                <div className="absolute -top-12 left-0 w-full text-center">
                                    <h3 className="font-black text-emerald-400 uppercase text-[10px] tracking-[0.2em] bg-slate-900/80 backdrop-blur-md border border-emerald-500/20 inline-block px-4 py-1.5 rounded-full shadow-2xl">
                                        {phaseMatches[0]?.phase_name || `Fase ${phase}`}
                                    </h3>
                                </div>

                                {phaseMatches.map((match, mIndex) => {
                                    const isFinal = pIndex === phases.length - 1
                                    const hasWinner = match.winner_id != null

                                    return (
                                        <div key={match.id} className="relative w-full py-4 px-2">

                                            {/* Connecting Lines for Tree */}
                                            {pIndex < phases.length - 1 && (
                                                <div className="absolute top-1/2 right-[-2.5rem] w-10 flex items-center z-0">
                                                    {/* Horizontal line OUT */}
                                                    <div className="h-[2px] w-full bg-gradient-to-r from-emerald-500/40 to-emerald-500/10"></div>

                                                    {/* Vertical connector */}
                                                    {mIndex % 2 === 0 && (
                                                        <div className="absolute top-1/2 right-0 w-[2px] bg-emerald-500/20"
                                                            style={{ height: 'calc(100% + 4.5rem)' }}></div>
                                                    )}
                                                </div>
                                            )}

                                            <div className={`bg-slate-900/60 backdrop-blur-md border ${hasWinner ? 'border-emerald-500/30' : 'border-slate-800'} rounded-2xl overflow-hidden shadow-2xl relative z-10 transition-all hover:scale-[1.02] hover:border-emerald-500/50 hover:shadow-emerald-500/10`}>

                                                {match.is_bye && (
                                                    <div className="absolute top-0 right-0 bg-amber-500 text-amber-950 text-[10px] font-black px-3 py-1 rounded-bl-xl shadow-lg z-20 uppercase tracking-tighter">BYE</div>
                                                )}

                                                {/* Player A */}
                                                <div className={`flex items-center justify-between p-4 border-b border-white/5 ${match.winner_id === match.player_a_id ? 'bg-emerald-500/10' : ''}`}>
                                                    <div className="flex flex-col truncate pr-3 flex-1">
                                                        <span className={`font-bold text-sm truncate uppercase tracking-tight ${match.winner_id === match.player_a_id ? 'text-emerald-400' : match.player_a ? 'text-slate-200' : 'text-slate-600'}`}>
                                                            {match.player_a ? match.player_a.name : 'Aguardando...'}
                                                        </span>
                                                        {match.player_a?.nickname && (
                                                            <span className="text-[10px] text-slate-500 font-medium truncate italic opacity-80">{match.player_a.nickname}</span>
                                                        )}
                                                    </div>
                                                    <div className={`font-black flex items-center justify-end min-w-[32px] text-right ${match.winner_id === match.player_a_id ? 'text-emerald-400' : 'text-slate-700'}`}>
                                                        {hasWinner ? (
                                                            match.winner_id === match.player_a_id ? (
                                                                <Check className="w-5 h-5 text-emerald-500" strokeWidth={3} />
                                                            ) : (
                                                                <X className="w-5 h-5 text-slate-700 opacity-50" strokeWidth={3} />
                                                            )
                                                        ) : (
                                                            <span className="text-xl tabular-nums">{match.score_a || 0}</span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Player B */}
                                                <div className={`flex items-center justify-between p-4 ${match.winner_id === match.player_b_id ? 'bg-emerald-500/10' : ''}`}>
                                                    <div className="flex flex-col truncate pr-3 flex-1">
                                                        <span className={`font-bold text-sm truncate uppercase tracking-tight ${match.winner_id === match.player_b_id ? 'text-emerald-400' : match.player_b ? 'text-slate-200' : 'text-slate-600'}`}>
                                                            {match.player_b ? match.player_b.name : 'Aguardando...'}
                                                        </span>
                                                        {match.player_b?.nickname && (
                                                            <span className="text-[10px] text-slate-500 font-medium truncate italic opacity-80">{match.player_b.nickname}</span>
                                                        )}
                                                    </div>
                                                    <div className={`font-black flex items-center justify-end min-w-[32px] text-right ${match.winner_id === match.player_b_id ? 'text-emerald-400' : 'text-slate-700'}`}>
                                                        {hasWinner ? (
                                                            match.winner_id === match.player_b_id ? (
                                                                <Check className="w-5 h-5 text-emerald-500" strokeWidth={3} />
                                                            ) : (
                                                                <X className="w-5 h-5 text-slate-700 opacity-50" strokeWidth={3} />
                                                            )
                                                        ) : (
                                                            <span className="text-xl tabular-nums">{match.score_b || 0}</span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Trophy for final */}
                                                {isFinal && hasWinner && (
                                                    <div className="absolute -right-4 -top-4 bg-amber-500 text-slate-950 p-2 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.4)] transform rotate-12 z-20 border-2 border-amber-300">
                                                        <Trophy className="w-6 h-6" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )
                    })}
                </div>
                <style dangerouslySetInnerHTML={{
                    __html: `
                    .custom-scrollbar::-webkit-scrollbar { height: 10px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.3); border-radius: 10px; margin: 0 40px; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.2); border-radius: 10px; border: 3px solid transparent; background-clip: content-box; }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 0.4); border: 2px solid transparent; background-clip: content-box; }
                `}} />
            </div>
        </div>
    )
}
