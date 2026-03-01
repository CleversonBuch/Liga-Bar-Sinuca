import { createClient } from '@/lib/supabase/server'
import { Swords, Calendar, DollarSign, Trophy, ArrowRight, Medal } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { isSuperAdmin, isAdmin } from '@/lib/auth'
import { TournamentActions } from './TournamentActions'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default async function TorneiosListPage() {
    const supabase = await createClient()
    const isSuper = await isSuperAdmin()
    const isOperator = await isAdmin()

    // Buscar todos os torneios com os finalistas
    const { data: tournaments, error } = await supabase
        .from('tournaments')
        .select(`
            *,
            winner:winner_id(name, nickname, photo_url),
            runner_up:runner_up_id(name, nickname, photo_url),
            third_place:third_place_id(name, nickname, photo_url)
        `)
        .order('created_at', { ascending: false })

    if (error) {
        return <div className="p-10 text-center text-destructive bg-destructive/10 border border-destructive/20 rounded-2xl max-w-2xl mx-auto my-10 font-bold">Erro ao carregar torneios: {error.message}</div>
    }

    // Agrupar por Mês
    const groupedTournaments: Record<string, any[]> = {}
    tournaments?.forEach(t => {
        const monthYear = format(parseISO(t.created_at), 'MMMM yyyy', { locale: ptBR })
        if (!groupedTournaments[monthYear]) groupedTournaments[monthYear] = []
        groupedTournaments[monthYear].push(t)
    })

    return (
        <div className="w-full text-foreground animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            <main className="max-w-7xl mx-auto px-4 md:px-10 py-6 md:py-10 space-y-8 md:space-y-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6 relative text-center md:text-left">
                    <div className="space-y-1.5 relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-1 mx-auto md:mx-0">
                            <Swords className="w-3.5 h-3.5" /> Competições
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white drop-shadow-sm">
                            Central de Torneios
                        </h1>
                        <p className="text-muted-foreground text-xs md:text-base font-medium max-w-xl">
                            Acompanhe disputas em tempo real e inicie novos torneios.
                        </p>
                    </div>
                    {isOperator && (
                        <Button size="lg" asChild className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_var(--color-primary)]/30 border-primary/50 transition-all rounded-full px-10 z-10 w-full sm:w-auto font-black uppercase tracking-widest text-xs h-12">
                            <Link href="/torneios/novo">
                                + Novo Torneio
                            </Link>
                        </Button>
                    )}
                </div>

                {/* Lista de Torneios Agrupados */}
                {Object.keys(groupedTournaments).length > 0 ? (
                    <div className="space-y-10 md:space-y-16">
                        {Object.entries(groupedTournaments).map(([month, monthTournaments]) => (
                            <div key={month} className="space-y-6">
                                {/* Separador de Mês */}
                                <div className="flex items-center gap-4 px-2">
                                    <h2 className="text-sm md:text-xl font-black text-white uppercase tracking-[0.3em] whitespace-nowrap opacity-80">
                                        {month}
                                    </h2>
                                    <div className="h-px w-full bg-gradient-to-r from-white/20 to-transparent"></div>
                                </div>

                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-8">
                                    {monthTournaments.map((t) => {
                                        const isClosed = t.status === 'closed'
                                        const dateObj = new Date(t.created_at)

                                        return (
                                            <Link href={`/torneios/${t.id}`} key={t.id} className={`group block relative bg-card/40 backdrop-blur-xl border rounded-[2rem] p-5 md:p-8 shadow-2xl overflow-hidden hover:-translate-y-1.5 transition-all duration-500 z-10
                                                ${!isClosed ? 'border-emerald-500/20 hover:border-emerald-500/50' : 'border-white/5 hover:border-amber-500/30'}
                                            `}>
                                                {/* Efeito de brilho de fundo no hover */}
                                                <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-10
                                                    ${!isClosed ? 'from-emerald-500/5 via-transparent to-transparent' : 'from-amber-500/5 via-transparent to-transparent'}
                                                `}></div>

                                                <div className="flex flex-col gap-6 relative z-10">

                                                    {/* Topo do Card: Ícone e Título */}
                                                    <div className="flex justify-between items-start gap-4">
                                                        <div className="flex items-center gap-3 md:gap-5">
                                                            <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center border ring-2 ring-offset-2 ring-offset-background/50 relative shrink-0
                                                                ${isClosed
                                                                    ? 'border-amber-500/30 bg-amber-500/10 ring-amber-500/5'
                                                                    : 'border-emerald-500/50 bg-emerald-500/10 ring-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]'}
                                                            `}>
                                                                {isClosed ? <Trophy className="w-6 h-6 md:w-8 md:h-8 text-amber-500 drop-shadow-md" /> : <Swords className="w-6 h-6 md:w-8 md:h-8 text-emerald-400 animate-pulse" />}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <h3 className="text-lg md:text-2xl font-black text-white tracking-tight group-hover:text-primary transition-colors truncate">
                                                                    {t.modality === '3_bolinhas' ? '3 Bolinhas' : 'Bola 8'}
                                                                </h3>
                                                                <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-muted-foreground mt-0.5">
                                                                    <span className="flex items-center gap-1">
                                                                        <Calendar className="w-3 h-3" />
                                                                        {dateObj.toLocaleDateString('pt-BR')}
                                                                    </span>
                                                                    <span>•</span>
                                                                    <span className="truncate">{t.format === 'all_vs_all' ? 'Liga' : 'Mata-Mata'}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col items-end gap-2 shrink-0">
                                                            {!isClosed && (
                                                                <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20 backdrop-blur-md">
                                                                    Ao Vivo
                                                                </span>
                                                            )}
                                                            {isClosed && (
                                                                <span className="px-2.5 py-1 bg-white/5 text-amber-500 text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-full border border-white/10">
                                                                    Final
                                                                </span>
                                                            )}
                                                            {isSuper && (
                                                                <TournamentActions tournamentId={t.id} />
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Mini Pódio (Aparece se encerrado) */}
                                                    {isClosed && (
                                                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-5 relative overflow-hidden">
                                                            {/* Glow de fundo pro Campeão */}
                                                            <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

                                                            <div className="flex flex-col sm:flex-row items-center gap-5 justify-between">
                                                                {/* Bloco Campeão */}
                                                                <div className="flex items-center gap-4 flex-1 w-full sm:w-auto">
                                                                    <div className="relative shrink-0">
                                                                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl border-2 border-amber-500 p-1 bg-slate-900 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                                                                            <div className="w-full h-full rounded-xl overflow-hidden bg-slate-800">
                                                                                {t.winner?.photo_url ? (
                                                                                    <img src={t.winner.photo_url} alt={t.winner.name} className="w-full h-full object-cover" />
                                                                                ) : (
                                                                                    <span className="flex items-center justify-center h-full text-lg font-black text-amber-500/50 uppercase">
                                                                                        {t.winner?.name?.[0] || '?'}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <div className="absolute -top-2 -left-2 bg-amber-500 text-amber-950 rounded-lg p-1 shadow-xl transform -rotate-12 border border-amber-300">
                                                                            <Trophy className="w-3 h-3 md:w-4 md:h-4" />
                                                                        </div>
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <div className="text-[8px] md:text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-0.5">Grande Campeão</div>
                                                                        <div className="font-black text-white text-base md:text-xl truncate tracking-tight uppercase leading-tight">{t.winner?.name || '---'}</div>
                                                                    </div>
                                                                </div>

                                                                <div className="h-10 w-px bg-white/10 hidden sm:block" />

                                                                {/* Outros Finalistas */}
                                                                <div className="flex gap-6 shrink-0 w-full sm:w-auto justify-between sm:justify-start pt-2 sm:pt-0 border-t border-white/5 sm:border-0">
                                                                    {/* Vice */}
                                                                    <div className="flex items-center gap-2.5">
                                                                        <div className="relative">
                                                                            <div className="w-9 h-9 md:w-11 md:h-11 rounded-full border border-slate-500 overflow-hidden bg-slate-800 opacity-80">
                                                                                {t.runner_up?.photo_url ? (
                                                                                    <img src={t.runner_up.photo_url} alt={t.runner_up.name} className="w-full h-full object-cover" />
                                                                                ) : (
                                                                                    <span className="flex items-center justify-center h-full text-[10px] font-bold text-slate-400">
                                                                                        {t.runner_up?.name?.[0] || '?'}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            <div className="absolute -top-0.5 -left-0.5 bg-slate-400 text-slate-950 rounded-full p-0.5 border border-slate-900">
                                                                                <Medal className="w-2.5 h-2.5 md:w-3 md:h-3" />
                                                                            </div>
                                                                        </div>
                                                                        <div className="min-w-0">
                                                                            <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-0.5">Vice</div>
                                                                            <div className="font-bold text-slate-300 text-[10px] md:text-xs truncate max-w-[80px]">{t.runner_up?.name || '---'}</div>
                                                                        </div>
                                                                    </div>

                                                                    {/* 3º Lugar */}
                                                                    <div className="flex items-center gap-2.5">
                                                                        <div className="relative">
                                                                            <div className="w-9 h-9 md:w-11 md:h-11 rounded-full border border-[#CD7F32]/50 overflow-hidden bg-slate-800 opacity-80">
                                                                                {t.third_place?.photo_url ? (
                                                                                    <img src={t.third_place.photo_url} alt={t.third_place.name} className="w-full h-full object-cover" />
                                                                                ) : (
                                                                                    <span className="flex items-center justify-center h-full text-[10px] font-bold text-[#CD7F32]/50">
                                                                                        {t.third_place?.name?.[0] || '?'}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            <div className="absolute -top-0.5 -left-0.5 bg-[#CD7F32] text-white rounded-full p-0.5 border border-slate-900">
                                                                                <Medal className="w-2.5 h-2.5 md:w-3 md:h-3" />
                                                                            </div>
                                                                        </div>
                                                                        <div className="min-w-0">
                                                                            <div className="text-[8px] font-bold text-[#CD7F32]/70 uppercase tracking-widest leading-none mb-0.5">3º Lugar</div>
                                                                            <div className="font-bold text-slate-300 text-[10px] md:text-xs truncate max-w-[80px]">{t.third_place?.name || '---'}</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Data Grid & Ações Inferiores */}
                                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2 border-t border-white/5 sm:border-0">
                                                        <div className="flex justify-between sm:justify-start items-center gap-4 md:gap-6">
                                                            <div className="flex flex-col">
                                                                <span className="text-[9px] md:text-[10px] text-muted-foreground font-black uppercase tracking-[0.15em]">Inscritos</span>
                                                                <span className="font-black text-white text-sm md:text-base">{t.total_players} <span className="text-[9px] text-slate-500 font-bold tracking-tighter">JOGADORES</span></span>
                                                            </div>
                                                            <div className="w-px h-6 md:h-8 bg-white/10" />
                                                            <div className="flex flex-col">
                                                                <span className="text-[9px] md:text-[10px] text-muted-foreground font-black uppercase tracking-[0.15em]">Prêmio 1º</span>
                                                                <span className="font-black text-emerald-400 text-sm md:text-base">R$ {t.prize_winner.toFixed(2)}</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-between sm:justify-end gap-3 group/btn sm:bg-white/5 sm:hover:bg-primary sm:py-2 sm:pl-6 sm:pr-2 sm:rounded-full transition-all duration-300">
                                                            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 sm:text-white sm:group-hover/btn:text-primary-foreground group-hover/btn:text-primary transition-colors">Ver Painel</span>
                                                            <div className="w-10 h-10 md:w-11 md:h-11 rounded-full border border-white/10 flex items-center justify-center bg-white/5 md:bg-transparent group-hover:bg-primary sm:group-hover:bg-white group-hover:text-primary-foreground sm:group-hover:text-primary group-hover:border-primary sm:group-hover:border-white group-hover:shadow-[0_0_15px_var(--color-primary)] transition-all duration-300">
                                                                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:translate-x-0.5" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-16 text-center bg-card/40 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl relative overflow-hidden">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                            <Trophy className="w-10 h-10 text-muted-foreground drop-shadow-md" />
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-tight mb-2">A temporada ainda não começou.</h2>
                        <p className="text-muted-foreground text-sm font-medium mb-8 max-w-sm mx-auto">Não há torneios registrados no sistema. Crie o primeiro torneio para gerar chaves e rankings.</p>
                        {isOperator && (
                            <Button size="lg" asChild className="bg-white/10 text-white hover:bg-white/20 border border-white/20 transition-all rounded-full px-8">
                                <Link href="/torneios/novo">
                                    Criar Primeiro Torneio
                                </Link>
                            </Button>
                        )}
                    </div>
                )}
            </main>
        </div>
    )
}
