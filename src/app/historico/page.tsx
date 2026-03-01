import { createClient } from '@/lib/supabase/server'
import { History, Search, Trophy, Calendar } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function HistoricoPage() {
    const supabase = await createClient()

    const { data: tournaments } = await supabase
        .from('tournaments')
        .select('*, winner:winner_id(name, nickname)')
        .eq('status', 'closed')
        .order('closed_at', { ascending: false })

    return (
        <div className="w-full bg-slate-950 text-white animate-in fade-in duration-500">
            <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 pb-24">
                <div className="pt-4">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white uppercase italic">
                        Histórico
                    </h1>
                    <p className="text-slate-500 text-[10px] sm:text-xs mt-1 font-black uppercase tracking-[0.2em]">Temporadas e resultados de torneios encerrados.</p>
                </div>

                {tournaments && tournaments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tournaments.map((t) => (
                            <div key={t.id} className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-6 shadow-2xl hover:border-amber-500/30 transition-all flex flex-col h-full group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

                                <div className="flex justify-between items-center mb-6 relative z-10">
                                    <span className={`text-[10px] font-black px-3 py-1 bg-white/5 border border-white/10 rounded-full uppercase tracking-widest ${t.modality === '3_bolinhas' ? 'text-emerald-400' : 'text-blue-400'}`}>
                                        {t.modality === '3_bolinhas' ? '3 Bolas' : 'Bola 8'}
                                    </span>
                                    <div className="p-2 bg-amber-500/10 rounded-xl">
                                        <Trophy className="w-4 h-4 text-amber-500" />
                                    </div>
                                </div>

                                <div className="space-y-6 flex-1 text-center relative z-10">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="w-20 h-20 rounded-[2rem] bg-slate-900 border border-white/10 flex items-center justify-center font-black text-2xl text-slate-300 mb-4 group-hover:border-amber-500/30 transition-all shadow-inner italic">
                                            {t.winner?.name.charAt(0) || '?'}
                                        </div>
                                        <span className="text-[10px] text-amber-500 uppercase font-black tracking-[0.3em] mb-1">Campeão</span>
                                        <div className="font-black text-xl text-white uppercase tracking-tighter italic">
                                            {t.winner?.name || '---'}
                                        </div>
                                        {t.winner?.nickname && <div className="text-[10px] uppercase tracking-widest font-black text-emerald-500 mt-1 italic">"{t.winner.nickname}"</div>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5 mt-auto">
                                        <div className="flex flex-col items-center">
                                            <span className="text-xl font-black text-white italic">{t.total_players}</span>
                                            <span className="text-[9px] uppercase tracking-widest font-black text-slate-500 mt-1">Pilotos</span>
                                        </div>
                                        <div className="flex flex-col items-center border-l border-white/5">
                                            <span className="text-xl font-black text-emerald-400 italic">R$ {t.prize_winner.toFixed(0)}</span>
                                            <span className="text-[9px] uppercase tracking-widest font-black text-slate-500 mt-1">Prêmio</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 relative z-10">
                                    <Button asChild variant="outline" className="w-full bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white font-black uppercase text-[10px] tracking-widest h-12 rounded-2xl">
                                        <Link href={`/torneios/${t.id}`}>
                                            Ver Brackets
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-[3rem] p-16 text-center text-slate-400 shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-50"></div>
                        <Trophy className="w-16 h-16 text-slate-700 mx-auto mb-4 opacity-50 relative z-10" />
                        <p className="text-xl font-black text-white uppercase italic tracking-widest relative z-10">Vazio</p>
                        <p className="text-slate-500 mt-2 text-sm font-medium relative z-10">Os torneios aparecerão aqui após serem encerrados.</p>
                    </div>
                )}
            </main>
        </div>
    )
}
