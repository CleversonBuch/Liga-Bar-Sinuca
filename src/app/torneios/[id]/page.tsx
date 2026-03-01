import { isAdmin } from '@/lib/auth'
import { getTournamentData, closeTournament } from './actions'
import { MatchCard } from './MatchCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trophy, Users, DollarSign, Calendar, Shuffle } from 'lucide-react'
import Link from 'next/link'
import { BracketView } from './BracketView'
import { isSuperAdmin } from '@/lib/auth'

export default async function TorneioPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const isOperator = await isAdmin()
    const isSuper = await isSuperAdmin()
    const { tournament, matches: rawMatches, tables: rawTables, error } = await getTournamentData(id)

    const matches = rawMatches || []
    const tables = rawTables || []

    if (error || !tournament) {
        return (
            <div className="min-h-screen bg-slate-950 text-white p-12 text-center">
                <h1 className="text-2xl font-bold text-red-500 mb-4">Erro ao carregar torneio</h1>
                <p className="text-slate-400 mb-8">{error}</p>
                <Button asChild><Link href="/">Voltar</Link></Button>
            </div>
        )
    }

    const isClosed = tournament.status === 'closed'

    // Logica do Botão Circular "Sortear Nova Fase"
    let canDrawNextPhase = false
    let currentLatestPhase = 1

    if (!isClosed && tournament.bracket_type === 'random' && matches.length > 0) {
        // Acha a fase mais alta
        currentLatestPhase = Math.max(...matches.map((m: any) => m.phase))

        // Pega as partidas dessa fase
        const latestPhaseMatches = matches.filter((m: any) => m.phase === currentLatestPhase)

        // Verifica se TODAS terminaram (tem winner_id)
        const allFinished = latestPhaseMatches.every((m: any) => m.winner_id !== null)

        // Se todas terminaram e ainda tem mais de 1 ganhador, habilita sortear a proxima
        if (allFinished) {
            const winnersCount = latestPhaseMatches.filter((m: any) => m.winner_id !== null).length
            if (winnersCount > 1) {
                canDrawNextPhase = true
            }
        }
    }

    return (
        <div className="w-full text-white animate-in fade-in duration-500 pb-24">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 md:p-8 space-y-6 md:space-y-10">
                <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6 text-center md:text-left pt-4">
                    <div className="space-y-1.5">
                        <div className="inline-flex items-center gap-2 text-emerald-500 justify-center md:justify-start w-full">
                            <Trophy className="w-8 h-8 md:w-10 md:h-10 drop-shadow-[0_0_10px_var(--color-primary)]" />
                            <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white uppercase italic">
                                Painel do Torneio
                            </h1>
                        </div>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2">
                            <p className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest border-r border-white/10 pr-3">
                                {tournament.modality === '3_bolinhas' ? '3 Bolinhas' : 'Bola 8'} • {tournament.format === 'all_vs_all' ? 'Liga' : 'Mata-Mata'}
                            </p>
                            {isClosed ? (
                                <Badge variant="destructive" className="font-black uppercase tracking-tighter text-[9px]">Encerrado</Badge>
                            ) : (
                                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50 font-black uppercase tracking-tighter text-[9px] animate-pulse">Ao Vivo</Badge>
                            )}
                        </div>
                    </div>

                    {isOperator && !isClosed && (
                        <form action={async () => {
                            'use server'
                            await closeTournament(tournament.id)
                        }} className="w-full sm:w-auto">
                            <Button type="submit" variant="destructive" className="w-full sm:w-auto font-black uppercase tracking-widest text-xs h-12 px-8 rounded-full shadow-lg shadow-destructive/20 border-destructive/50 transition-all hover:scale-105">
                                Encerrar Torneio
                            </Button>
                        </form>
                    )}
                </div>

                {/* Sumário Financeiro e Status */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    <div className="bg-white/5 border border-white/5 backdrop-blur-xl rounded-2xl p-4 md:p-6 flex flex-col md:flex-row md:items-center gap-3 md:gap-5 transition-all hover:bg-white/10">
                        <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500 w-fit"><Trophy className="w-5 h-5 md:w-6 md:h-6" /></div>
                        <div>
                            <div className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-0.5">Prêmio 1º</div>
                            <div className="text-lg md:text-2xl font-black text-white leading-tight">R$ {tournament.prize_winner.toFixed(2)}</div>
                        </div>
                    </div>
                    <div className="bg-white/5 border border-white/5 backdrop-blur-xl rounded-2xl p-4 md:p-6 flex flex-col md:flex-row md:items-center gap-3 md:gap-5 transition-all hover:bg-white/10">
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500 w-fit"><DollarSign className="w-5 h-5 md:w-6 md:h-6" /></div>
                        <div>
                            <div className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-0.5">Fundo Liga</div>
                            <div className="text-lg md:text-2xl font-black text-white leading-tight">R$ {(tournament.fund_monthly + tournament.fund_yearly).toFixed(2)}</div>
                        </div>
                    </div>
                    <div className="bg-white/5 border border-white/5 backdrop-blur-xl rounded-2xl p-4 md:p-6 flex flex-col md:flex-row md:items-center gap-3 md:gap-5 transition-all hover:bg-white/10">
                        <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500 w-fit"><Users className="w-5 h-5 md:w-6 md:h-6" /></div>
                        <div>
                            <div className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-0.5">Jogadores</div>
                            <div className="text-lg md:text-2xl font-black text-white leading-tight">{tournament.total_players}</div>
                        </div>
                    </div>
                    <div className="bg-white/5 border border-white/5 backdrop-blur-xl rounded-2xl p-4 md:p-6 flex flex-col md:flex-row md:items-center gap-3 md:gap-5 transition-all hover:bg-white/10">
                        <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500 w-fit"><Calendar className="w-5 h-5 md:w-6 md:h-6" /></div>
                        <div>
                            <div className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-0.5">Confrontos</div>
                            <div className="text-lg md:text-2xl font-black text-white leading-tight">{matches.length}</div>
                        </div>
                    </div>
                </div>

                {/* Visualização em Árvore (Apenas para Chave Fixa) */}
                {tournament.bracket_type === 'fixed' && tournament.format === 'single_elimination' && matches.length > 0 && (
                    <div className="pt-4">
                        <div className="flex items-center gap-3 mb-6 px-1">
                            <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                            <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">Chaveamento Oficial</h2>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl p-2 md:p-4 relative">
                            <BracketView matches={matches} />
                        </div>
                    </div>
                )}

                {/* Chaveamento / Partidas (Cards) */}
                <div className="pt-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-8 px-1">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                            <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">
                                {tournament.bracket_type === 'fixed' ? 'Lista de Confrontos' : 'Confrontos Gerados'}
                            </h2>
                        </div>

                        {/* Botão de Cortar/Sortear (Aparece somento no modo Random com fase completa) */}
                        {isOperator && canDrawNextPhase && (
                            <form action={async () => {
                                'use server'
                                // Chama o sorteio passando a fase atuall
                                const { drawNextPhase } = await import('./actions')
                                await drawNextPhase(tournament.id, currentLatestPhase)
                            }} className="w-full sm:w-auto">
                                <Button type="submit" className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-slate-950 font-black uppercase tracking-widest text-xs h-12 px-10 rounded-full shadow-xl shadow-amber-500/20 gap-2 transition-all hover:scale-105 border-t border-white/20">
                                    <Shuffle className="w-4 h-4" />
                                    Sortear Fase {currentLatestPhase + 1}
                                </Button>
                            </form>
                        )}
                    </div>

                    {matches.length === 0 ? (
                        <div className="bg-white/5 border border-white/10 p-16 text-center rounded-[2.5rem] backdrop-blur-xl">
                            <Trophy className="w-12 h-12 text-slate-700 mx-auto mb-4 opacity-50" />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Nenhuma partida registrada</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {matches.map((match: any) => (
                                <MatchCard
                                    key={match.id}
                                    match={match}
                                    allTables={tables}
                                    isOperator={isOperator}
                                    isSuperAdmin={isSuper}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
