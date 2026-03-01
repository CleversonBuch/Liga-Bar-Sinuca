'use client'

import { Info, Trophy, Target, TrendingUp, Calendar, Swords } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function RulesModal({ trigger }: { trigger?: React.ReactNode }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm" className="gap-2 bg-white/5 border-white/10 hover:bg-white/10 rounded-full h-8 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <Info className="w-3.5 h-3.5" />
                        Como funciona?
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-md bg-slate-950 border-white/5 text-white overflow-hidden rounded-[2.5rem]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-xl">
                            <Swords className="w-5 h-5 text-primary" />
                        </div>
                        Regras e Pontuação
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    {/* Scoring System */}
                    <div className="space-y-3">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 border-b border-white/5 pb-2">Sistema de Pontos</h4>

                        <div className="grid grid-cols-1 gap-3">
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center gap-4">
                                <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                                    <Target className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <div className="font-black italic uppercase text-xs">3 Bolinhas</div>
                                    <div className="text-[10px] text-slate-400 mt-0.5">
                                        Campeão: <span className="text-white">95 pts</span> (80+15) <br />
                                        Vice: <span className="text-white">75 pts</span> (60+15) <br />
                                        Participação: <span className="text-white">15 pts</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center gap-4">
                                <div className="p-2.5 bg-blue-500/10 rounded-xl">
                                    <Target className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <div className="font-black italic uppercase text-xs">Bola 8</div>
                                    <div className="text-[10px] text-slate-400 mt-0.5">
                                        Campeão: <span className="text-white">115 pts</span> (100+15) <br />
                                        Vice: <span className="text-white">85 pts</span> (70+15) <br />
                                        Participação: <span className="text-white">15 pts</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Ranking Periods */}
                    <div className="space-y-3">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 border-b border-white/5 pb-2">Períodos do Ranking</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <Calendar className="w-3 h-3 text-primary" />
                                    <span className="font-bold text-[10px] uppercase italic">Mensal</span>
                                </div>
                                <p className="text-[9px] text-slate-500 leading-tight">Total de pontos acumulados no mês atual.</p>
                            </div>
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <TrendingUp className="w-3 h-3 text-primary" />
                                    <span className="font-bold text-[10px] uppercase italic">Anual</span>
                                </div>
                                <p className="text-[9px] text-slate-500 leading-tight">Soma de todos os meses da temporada vigente.</p>
                            </div>
                        </div>
                    </div>

                    {/* Tiebreaker */}
                    <div className="space-y-3 bg-primary/5 rounded-3xl p-5 border border-primary/10">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                            <Trophy className="w-3 h-3" />
                            Critérios de Desempate
                        </h4>
                        <ol className="space-y-1.5 list-decimal list-inside text-[10px] font-bold text-slate-300">
                            <li><span className="text-white">Pontuação Total</span> no período</li>
                            <li><span className="text-white">Total de Vitórias</span> em partidas</li>
                            <li><span className="text-white">Total de Títulos</span> conquistados</li>
                            <li><span className="text-white">Aproveitamento (%)</span> em partidas</li>
                        </ol>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
