'use client'

import { useState } from 'react'
import { assignTable, finishMatch, resetMatch, deleteMatch } from './actions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Trophy, Clock, Swords, RotateCcw, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Player = { id: string; name: string; nickname?: string }
type Table = { id: string; number: number; name?: string; status?: string }
type Match = {
    id: string
    tournament_id: string
    phase: number
    phase_name: string
    is_bye: boolean
    score_a: number
    score_b: number
    player_a?: Player
    player_b?: Player
    winner?: Player
    table?: Table
    finished_at?: string
}

export function MatchCard({ match, allTables, isOperator, isSuperAdmin }: { match: Match, allTables: Table[], isOperator: boolean, isSuperAdmin?: boolean }) {
    const [loading, setLoading] = useState(false)

    const isFinished = !!match.winner || !!match.finished_at
    const isWaiting = !isFinished && (!match.player_a || !match.player_b) && !match.is_bye
    const isActive = !isFinished && !isWaiting && !match.is_bye

    async function handleAssignTable(tableId: string) {
        if (tableId === 'none') return
        setLoading(true)
        const res = await assignTable(match.id, tableId, match.tournament_id)
        setLoading(false)
        if (res.success) toast.success('Mesa designada!')
    }

    async function handleSetWinner(playerId: string) {
        if (!window.confirm('Confirmar este jogador como vencedor da partida?')) return
        setLoading(true)
        const res = await finishMatch(match.id, playerId, match.tournament_id)
        setLoading(false)
        if (res.success) toast.success('Resultado salvo!')
    }

    async function handleReset() {
        if (!window.confirm('CUIDADO: Deseja realmente RESETAR esta partida? Os pontos de vitória/derrota serão revertidos.')) return
        setLoading(true)
        const res = await resetMatch(match.id, match.tournament_id)
        setLoading(false)
        if (res.success) {
            toast.success('Partida resetada.')
        } else {
            toast.error(res.error || 'Erro ao resetar.')
        }
    }

    async function handleDelete() {
        if (!window.confirm('CUIDADO MÁXIMO: Apagar esta partida do banco de dados? Isso pode quebrar a numeração de fases.')) return
        setLoading(true)
        const res = await deleteMatch(match.id, match.tournament_id)
        setLoading(false)
        if (res.success) {
            toast.success('Partida apagada.')
        } else {
            toast.error(res.error || 'Erro ao apagar.')
        }
    }

    return (
        <div className={cn(
            "relative bg-card/40 backdrop-blur-xl border rounded-[2rem] p-5 md:p-6 flex flex-col justify-between shadow-2xl overflow-hidden transition-all duration-300 group hover:shadow-3xl hover:-translate-y-1",
            isFinished ? "border-emerald-500/20 hover:border-emerald-500/40" :
                isActive ? "border-blue-500/30 ring-1 ring-blue-500/10 hover:border-blue-500/50" :
                    "border-white/5 hover:border-white/10"
        )}>
            {/* Background Glow */}
            <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-10",
                isFinished ? "from-emerald-500/5 via-transparent to-transparent" :
                    isActive ? "from-blue-500/10 via-transparent to-transparent" :
                        "from-white/5 via-transparent to-transparent"
            )}></div>

            {/* Header Info */}
            <div className="flex justify-between items-center mb-5 relative z-10">
                <Badge variant="outline" className="text-muted-foreground/80 border-white/5 bg-white/5 backdrop-blur-md px-2.5 py-1 font-black tracking-widest uppercase text-[9px] shadow-sm">
                    {match.phase_name || `Fase ${match.phase}`}
                </Badge>

                {isFinished ? (
                    <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)] px-2.5 py-1 font-black uppercase tracking-widest text-[9px]">
                        Finalizada
                    </Badge>
                ) : match.is_bye ? (
                    <Badge className="bg-purple-500/10 text-purple-400 border border-purple-500/30 px-2.5 py-1 font-black uppercase tracking-widest text-[9px]">
                        Vitória W.O
                    </Badge>
                ) : isActive ? (
                    <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)] px-2.5 py-1 font-black uppercase tracking-widest text-[9px] animate-pulse">
                        Em Jogo
                    </Badge>
                ) : (
                    <div className="flex items-center text-[9px] text-amber-500 font-black uppercase tracking-widest bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                        <Clock className="w-3 h-3 mr-1" />
                        Aguardando
                    </div>
                )}

                {/* Super Admin Actions - Absolute Control */}
                {isSuperAdmin && (
                    <div className="flex items-center gap-1.5 ml-2">
                        {isFinished && (
                            <Button size="icon" variant="destructive" className="w-7 h-7 rounded-full shadow-lg opacity-60 hover:opacity-100" onClick={handleReset} disabled={loading} title="Resetar Partida">
                                <RotateCcw className="w-3 h-3" />
                            </Button>
                        )}
                        <Button size="icon" variant="destructive" className="w-7 h-7 rounded-full shadow-lg opacity-60 hover:opacity-100 bg-red-950/50 text-red-400 hover:bg-red-900 border border-red-900/50" onClick={handleDelete} disabled={loading} title="Deletar Partida">
                            <Trash2 className="w-3 h-3" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Players Area */}
            <div className="flex-1 flex flex-col justify-center space-y-2 relative z-10">

                {/* VS Badge in Center */}
                {!match.is_bye && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 bg-background border border-white/10 rounded-full flex items-center justify-center z-20 shadow-xl pointer-events-none">
                        <span className="text-[8px] font-black text-muted-foreground uppercase opacity-50">VS</span>
                    </div>
                )}

                {/* Jogador A */}
                <div className={cn(
                    "relative flex items-center justify-between p-4 md:p-5 rounded-2xl border transition-all duration-300 overflow-hidden",
                    match.winner?.id === match.player_a?.id ? "border-emerald-500/50 bg-emerald-500/10 shadow-[inner_0_0_20px_rgba(16,185,129,0.1)]" : "border-white/5 bg-white/5 hover:bg-white/10"
                )}>
                    {match.winner?.id === match.player_a?.id && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 shadow-[0_0_10px_var(--color-emerald-500)]"></div>
                    )}

                    <span className={cn(
                        "font-black text-base md:text-lg truncate pr-2",
                        match.winner?.id === match.player_a?.id ? "text-emerald-400" : "text-white"
                    )}>{match.player_a?.name || '---'}</span>

                    <div className="flex items-center gap-2 shrink-0">
                        {!isFinished && isOperator && match.player_a && !match.is_bye && (
                            <Button size="sm" variant="ghost" onClick={() => handleSetWinner(match.player_a!.id)} disabled={loading} className="h-9 px-4 md:h-10 md:px-5 text-[10px] md:text-xs font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-emerald-950 border border-emerald-500/20 transition-all rounded-xl">
                                VENCEU
                            </Button>
                        )}
                        {match.winner?.id === match.player_a?.id && (
                            <div className="bg-emerald-500 p-2 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                                <Trophy className="w-4 h-4 text-emerald-950" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Jogador B */}
                {match.is_bye ? (
                    <div className="flex items-center justify-center p-4 md:p-5 rounded-2xl border border-white/5 bg-white/5 text-muted-foreground text-[10px] font-black tracking-widest uppercase italic opacity-60">
                        Passagem W.O
                    </div>
                ) : (
                    <div className={cn(
                        "relative flex items-center justify-between p-4 md:p-5 rounded-2xl border transition-all duration-300 overflow-hidden",
                        match.winner?.id === match.player_b?.id ? "border-emerald-500/50 bg-emerald-500/10 shadow-[inner_0_0_20px_rgba(16,185,129,0.1)]" : "border-white/5 bg-white/5 hover:bg-white/10"
                    )}>
                        {match.winner?.id === match.player_b?.id && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 shadow-[0_0_10px_var(--color-emerald-500)]"></div>
                        )}

                        <span className={cn(
                            "font-black text-base md:text-lg truncate pr-2",
                            match.winner?.id === match.player_b?.id ? "text-emerald-400" : "text-white"
                        )}>{match.player_b?.name || '---'}</span>

                        <div className="flex items-center gap-2 shrink-0">
                            {!isFinished && isOperator && match.player_b && (
                                <Button size="sm" variant="ghost" onClick={() => handleSetWinner(match.player_b!.id)} disabled={loading} className="h-9 px-4 md:h-10 md:px-5 text-[10px] md:text-xs font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-emerald-950 border border-emerald-500/20 transition-all rounded-xl">
                                    VENCEU
                                </Button>
                            )}
                            {match.winner?.id === match.player_b?.id && (
                                <div className="bg-emerald-500 p-2 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                                    <Trophy className="w-4 h-4 text-emerald-950" />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer / Table Assignment */}
            {!match.is_bye && (
                <div className="mt-6 pt-4 border-t border-white/5 relative z-10">
                    {(!isFinished && isOperator) ? (
                        <div className="flex items-center justify-between w-full bg-white/5 rounded-2xl p-2 border border-white/5">
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest px-3">Designar Mesa</span>
                            <Select defaultValue={match.table?.id || 'none'} onValueChange={handleAssignTable} disabled={loading}>
                                <SelectTrigger className="w-[130px] h-10 md:h-11 text-[10px] md:text-xs font-black uppercase tracking-widest bg-background/50 border-white/10 focus:ring-primary/50 rounded-xl">
                                    <SelectValue placeholder="Sem Mesa" />
                                </SelectTrigger>
                                <SelectContent className="bg-card/95 backdrop-blur-3xl border-white/10 text-white font-bold rounded-2xl">
                                    <SelectItem value="none" className="text-[10px] uppercase font-black tracking-widest">Nenhuma</SelectItem>
                                    {allTables.filter(t => t.status !== 'maintenance').map(t => (
                                        <SelectItem key={t.id} value={t.id} className="text-[10px] uppercase font-black tracking-widest">Mesa {t.number}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    ) : (
                        <div className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-white/5 border border-white/5">
                            <Swords className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {match.table ? `Mesa de Jogo: ${match.table.number}` : 'Mesa não registrada'}
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
