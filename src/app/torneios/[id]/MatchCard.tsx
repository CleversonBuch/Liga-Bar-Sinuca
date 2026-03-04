'use client'

import { useState } from 'react'
import { assignTable, finishMatch, resetMatch, deleteMatch } from './actions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Trophy, Clock, Swords, RotateCcw, Trash2, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ConfirmModal } from '@/components/ConfirmModal'
import Image from 'next/image'

type Player = { id: string; name: string; nickname?: string; photo_url?: string }
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
    const [confirmId, setConfirmId] = useState<string | null>(null)

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
        setLoading(true)
        const res = await finishMatch(match.id, playerId, match.tournament_id)
        setLoading(false)
        setConfirmId(null)
        if (res.success) toast.success('Vitória confirmada!')
    }

    async function handleReset() {
        setLoading(true)
        const res = await resetMatch(match.id, match.tournament_id)
        setLoading(false)
        setConfirmId(null)
        if (res.success) {
            toast.success('Partida resetada.')
        } else {
            toast.error(res.error || 'Erro ao resetar.')
        }
    }

    async function handleDelete() {
        setLoading(true)
        const res = await deleteMatch(match.id, match.tournament_id)
        setLoading(false)
        setConfirmId(null)
        if (res.success) {
            toast.success('Partida apagada.')
        } else {
            toast.error(res.error || 'Erro ao apagar.')
        }
    }

    function PlayerAvatar({ player, isWinner }: { player?: Player, isWinner: boolean }) {
        if (!player) return (
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <User className="w-3 h-3 md:w-4 md:h-4 text-slate-500" />
            </div>
        )

        return (
            <div className={cn(
                "relative w-6 h-6 md:w-8 md:h-8 rounded-full border shrink-0 overflow-hidden",
                isWinner ? "border-emerald-500 ring-1 ring-emerald-500/50" : "border-white/10"
            )}>
                {player.photo_url ? (
                    <Image src={player.photo_url} alt={player.name} fill className="object-cover" sizes="32px" />
                ) : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center">
                        <span className="text-[8px] md:text-[10px] font-black uppercase text-white/50">
                            {player.nickname ? player.nickname.charAt(0) : player.name.charAt(0)}
                        </span>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className={cn(
            "relative bg-card/40 backdrop-blur-xl border rounded-2xl p-3 flex flex-col justify-between shadow-2xl overflow-hidden transition-all duration-300 group hover:-translate-y-0.5 min-h-[140px]",
            isFinished ? "border-emerald-500/20" :
                isActive ? "border-blue-500/30 ring-1 ring-blue-500/10" :
                    "border-white/5"
        )}>
            {/* Background Glow */}
            <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-10",
                isFinished ? "from-emerald-500/5 via-transparent to-transparent" :
                    isActive ? "from-blue-500/10 via-transparent to-transparent" :
                        "from-white/5 via-transparent to-transparent"
            )}></div>

            {/* Header Info */}
            <div className="flex justify-between items-center mb-3 relative z-10 gap-1">
                <Badge variant="outline" className="text-muted-foreground/80 border-white/5 bg-white/5 backdrop-blur-md px-1.5 py-0.5 font-black tracking-widest uppercase text-[8px] shadow-sm truncate max-w-[50%]">
                    {match.phase_name || `Fase ${match.phase}`}
                </Badge>

                {isFinished ? (
                    <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 font-black uppercase tracking-widest text-[8px] whitespace-nowrap">
                        Finalizada
                    </Badge>
                ) : match.is_bye ? (
                    <Badge className="bg-purple-500/10 text-purple-400 border border-purple-500/30 px-1.5 py-0.5 font-black uppercase tracking-widest text-[8px] whitespace-nowrap">
                        P. Livre (W.O)
                    </Badge>
                ) : isActive ? (
                    <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 font-black uppercase tracking-widest text-[8px] animate-pulse whitespace-nowrap">
                        Em Jogo
                    </Badge>
                ) : (
                    <div className="flex items-center text-[8px] text-amber-500 font-black uppercase tracking-widest bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-500/20 whitespace-nowrap">
                        Aguardando
                    </div>
                )}
            </div>

            {/* Players Area */}
            <div className="flex-1 flex flex-col justify-center space-y-1.5 relative z-10 w-full mb-2">

                {/* Jogador A */}
                <div className={cn(
                    "relative flex items-center p-2 rounded-xl border transition-all duration-300 w-full overflow-hidden",
                    match.winner?.id === match.player_a?.id ? "border-emerald-500/50 bg-emerald-500/10" : "border-white/5 bg-white/5"
                )}>
                    {match.winner?.id === match.player_a?.id && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 shadow-[0_0_10px_var(--color-emerald-500)]"></div>
                    )}

                    <div className="flex items-center gap-2 flex-1 min-w-0 pr-1 pl-1">
                        <PlayerAvatar player={match.player_a} isWinner={match.winner?.id === match.player_a?.id} />
                        <span className={cn(
                            "font-black text-xs md:text-sm truncate w-full",
                            match.winner?.id === match.player_a?.id ? "text-emerald-400" : "text-white"
                        )}>{match.player_a?.nickname || match.player_a?.name.split(' ')[0] || '---'}</span>
                    </div>

                    <div className="flex items-center shrink-0">
                        {match.winner?.id === match.player_a?.id && (
                            <Trophy className="w-3.5 h-3.5 text-emerald-500 mr-1" />
                        )}
                        {!isFinished && isOperator && match.player_a && !match.is_bye && (
                            <Button size="sm" variant="ghost" onClick={() => setConfirmId('winner_a')} disabled={loading} className="h-6 px-2 text-[8px] md:text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-emerald-950 border border-emerald-500/20 rounded-lg">
                                WIN
                            </Button>
                        )}
                    </div>
                </div>

                {/* VS Badge in Center */}
                {!match.is_bye && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] w-5 h-5 bg-background border border-white/10 rounded-full flex items-center justify-center z-20 shadow-xl pointer-events-none">
                        <span className="text-[6px] font-black text-slate-500 uppercase">VS</span>
                    </div>
                )}

                {/* Jogador B */}
                {match.is_bye ? (
                    <div className="flex items-center justify-center p-2 rounded-xl border border-white/5 bg-white/5 text-muted-foreground text-[9px] font-black tracking-widest uppercase italic opacity-60 h-10 w-full">
                        Passagem Livre
                    </div>
                ) : (
                    <div className={cn(
                        "relative flex items-center p-2 rounded-xl border transition-all duration-300 w-full overflow-hidden",
                        match.winner?.id === match.player_b?.id ? "border-emerald-500/50 bg-emerald-500/10" : "border-white/5 bg-white/5"
                    )}>
                        {match.winner?.id === match.player_b?.id && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 shadow-[0_0_10px_var(--color-emerald-500)]"></div>
                        )}

                        <div className="flex items-center gap-2 flex-1 min-w-0 pr-1 pl-1">
                            <PlayerAvatar player={match.player_b} isWinner={match.winner?.id === match.player_b?.id} />
                            <span className={cn(
                                "font-black text-xs md:text-sm truncate w-full",
                                match.winner?.id === match.player_b?.id ? "text-emerald-400" : "text-white"
                            )}>{match.player_b?.nickname || match.player_b?.name.split(' ')[0] || '---'}</span>
                        </div>

                        <div className="flex items-center shrink-0">
                            {match.winner?.id === match.player_b?.id && (
                                <Trophy className="w-3.5 h-3.5 text-emerald-500 mr-1" />
                            )}
                            {!isFinished && isOperator && match.player_b && (
                                <Button size="sm" variant="ghost" onClick={() => setConfirmId('winner_b')} disabled={loading} className="h-6 px-2 text-[8px] md:text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-emerald-950 border border-emerald-500/20 rounded-lg">
                                    WIN
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer / Assign Table OR Setup / Admin Actions */}
            <div className="flex items-center justify-between mt-auto w-full gap-1">
                {/* Table assignment is ONLY shown if Operator is assigning a table. If assigned and not operator, or finished, just hide entirely to save space */}
                {!match.is_bye && !isFinished && isOperator && (
                    <Select defaultValue={match.table?.id || 'none'} onValueChange={handleAssignTable} disabled={loading}>
                        <SelectTrigger className="w-full h-7 text-[8px] font-black uppercase tracking-widest bg-white/5 border-white/5 focus:ring-primary/50 rounded-lg">
                            <SelectValue placeholder="Designar Mesa" />
                        </SelectTrigger>
                        <SelectContent className="bg-card/95 backdrop-blur-3xl border-white/10 text-white font-bold rounded-xl">
                            <SelectItem value="none" className="text-[8px] uppercase font-black tracking-widest">S/ Mesa</SelectItem>
                            {allTables.filter(t => t.status !== 'maintenance').map(t => (
                                <SelectItem key={t.id} value={t.id} className="text-[8px] uppercase font-black tracking-widest">Mesa {t.number}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
                {!match.is_bye && !isFinished && !isOperator && match.table && (
                    <div className="w-full flex items-center justify-center gap-1.5 p-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary h-7">
                        <Swords className="w-3 h-3" />
                        <span className="text-[8px] font-black uppercase tracking-widest">
                            Mesa {match.table.number}
                        </span>
                    </div>
                )}

                {/* Super Admin Actions - Absolute Control (Push right) */}
                {isSuperAdmin && (
                    <div className="flex items-center gap-1 ml-auto shrink-0 mt-1">
                        {isFinished && (
                            <Button size="icon" variant="destructive" className="w-6 h-6 rounded-md shadow-lg opacity-50 hover:opacity-100" onClick={() => setConfirmId('reset')} disabled={loading} title="Resetar Partida">
                                <RotateCcw className="w-3 h-3" />
                            </Button>
                        )}
                        <Button size="icon" variant="destructive" className="w-6 h-6 rounded-md shadow-lg opacity-50 hover:opacity-100 bg-red-950/50 text-red-500 hover:bg-red-900 border border-red-900/50" onClick={() => setConfirmId('delete')} disabled={loading} title="Deletar Partida">
                            <Trash2 className="w-3 h-3" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Confirmation Modals */}
            <ConfirmModal
                isOpen={confirmId === 'winner_a' || confirmId === 'winner_b'}
                onClose={() => setConfirmId(null)}
                onConfirm={() => handleSetWinner(confirmId === 'winner_a' ? match.player_a!.id : match.player_b!.id)}
                title="Confirmar Vitória"
                description={`Declarar vitória para ${confirmId === 'winner_a' ? match.player_a?.name : match.player_b?.name}?`}
                variant="success"
                loading={loading}
            />

            <ConfirmModal
                isOpen={confirmId === 'reset'}
                onClose={() => setConfirmId(null)}
                onConfirm={handleReset}
                title="Resetar Partida"
                description="Os pontos serão revertidos."
                variant="destructive"
                loading={loading}
            />

            <ConfirmModal
                isOpen={confirmId === 'delete'}
                onClose={() => setConfirmId(null)}
                onConfirm={handleDelete}
                title="Apagar do Banco"
                description="CUIDADO: Partida removida permanentemente."
                variant="destructive"
                loading={loading}
            />
        </div>
    )
}
