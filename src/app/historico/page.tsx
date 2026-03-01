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
            <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
                        Histórico
                    </h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium">TEMPORADAS E RESULTADOS ANTERIORES.</p>
                </div>

                {tournaments && tournaments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tournaments.map((t) => (
                            <div key={t.id} className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/80 rounded-2xl p-6 shadow-sm hover:border-amber-500/30 transition-all flex flex-col h-full group">
                                <div className="flex justify-between items-start mb-6 border-b border-slate-800/80 pb-4">
                                    <div className="flex items-center gap-4 text-center mx-auto">
                                        <div className="p-3 bg-slate-800/50 rounded-xl">
                                            <Trophy className="w-6 h-6 text-amber-500 drop-shadow-md" />
                                        </div>
                                    </div>
                                    <div className="absolute top-4 left-4">
                                        <span className="text-[10px] font-bold px-2 py-1 bg-slate-800 text-slate-400 border border-slate-700/50 rounded-md uppercase tracking-wider">
                                            Torneio {t.modality === '3_bolinhas' ? '3 Bolinhas' : 'Bola 8'}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-4 flex-1 text-center">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center font-bold text-xl text-slate-300 mb-3 group-hover:border-emerald-500/50 transition-colors">
                                            {t.winner?.name.charAt(0) || '?'}
                                        </div>
                                        <span className="text-[10px] text-amber-500 uppercase font-black tracking-widest mb-1">Campeão</span>
                                        <div className="font-black text-xl text-emerald-400">
                                            {t.winner?.name || 'Não Registrado'}
                                        </div>
                                        {t.winner?.nickname && <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mt-1">"{t.winner.nickname}"</div>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-sm pt-4 border-t border-slate-800/80 mt-4">
                                        <div className="flex flex-col items-center">
                                            <span className="text-xl font-black text-slate-300">{t.total_players}</span>
                                            <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 mt-1">Jogadores</span>
                                        </div>
                                        <div className="flex flex-col items-center border-l border-slate-800/80">
                                            <span className="text-xl font-black text-emerald-400">R$ {t.prize_winner.toFixed(2)}</span>
                                            <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 mt-1">Premiação</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-slate-800/80">
                                    <Button asChild variant="outline" className="w-full bg-slate-800/50 border-slate-700 hover:bg-slate-800 text-slate-300 font-bold uppercase text-[10px] tracking-widest h-10">
                                        <Link href={`/torneios/${t.id}`}>
                                            Visualizar Brackets
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-xl">
                        <Trophy className="w-16 h-16 text-slate-700 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-semibold text-white">Nenhum torneio finalizado no histórico.</p>
                        <p className="text-slate-400 mt-2">Os torneios aparecerão aqui após serem encerrados no painel de controle.</p>
                    </div>
                )}
            </main>
        </div>
    )
}
