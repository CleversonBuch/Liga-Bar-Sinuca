import { createClient } from '@/lib/supabase/server'
import { DollarSign, ArrowUpRight, ArrowDownRight, Activity, Wallet, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { isAdmin } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function FinanceiroPage() {
    const isAuthorized = await isAdmin()
    if (!isAuthorized) {
        redirect('/')
    }

    const supabase = await createClient()

    // Buscar torneios para agregar os fundos gerados
    const { data: tournaments, error } = await supabase
        .from('tournaments')
        .select('fund_monthly, fund_yearly, fund_bar, created_at, modality')
        .order('created_at', { ascending: false })

    if (error) {
        return <div className="p-10 text-center text-destructive bg-destructive/10 border border-destructive/20 rounded-2xl max-w-2xl mx-auto my-10 font-bold">Erro ao carregar dados financeiros.</div>
    }

    // Agregações
    const totalMonthlyFund = tournaments?.reduce((acc, t) => acc + (t.fund_monthly || 0), 0) || 0
    const totalYearlyFund = tournaments?.reduce((acc, t) => acc + (t.fund_yearly || 0), 0) || 0
    const totalBarFund = tournaments?.reduce((acc, t) => acc + (t.fund_bar || 0), 0) || 0

    // Caixa Total (Soma de tudo retido)
    const caixaTotal = totalMonthlyFund + totalYearlyFund + totalBarFund

    return (
        <div className="w-full text-foreground animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            <main className="max-w-7xl mx-auto p-6 md:p-10 space-y-10">

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative">
                    <div className="space-y-2 relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-2">
                            <TrendingUp className="w-3.5 h-3.5" /> Balanço Geral
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white drop-shadow-sm">
                            Gestão Financeira
                        </h1>
                        <p className="text-muted-foreground text-sm md:text-base font-medium max-w-xl">
                            Controle o caixa do estabelecimento, fundos acumulados de torneios e lucros do Bar de forma unificada.
                        </p>
                    </div>
                    <div className="flex gap-3 z-10 w-full md:w-auto">
                        <Button className="flex-1 md:flex-none border border-emerald-500/50 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-emerald-950 shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all rounded-full px-6 font-bold uppercase tracking-wide text-xs">
                            <ArrowUpRight className="w-4 h-4 mr-2" />
                            Reforço
                        </Button>
                        <Button className="flex-1 md:flex-none border border-destructive/50 bg-destructive/10 text-destructive-foreground hover:bg-destructive hover:text-white shadow-[0_0_15px_rgba(220,38,38,0.2)] hover:shadow-[0_0_20px_rgba(220,38,38,0.5)] transition-all rounded-full px-6 font-bold uppercase tracking-wide text-xs">
                            <ArrowDownRight className="w-4 h-4 mr-2" />
                            Sangria
                        </Button>
                    </div>
                </div>

                {/* Dashboards Financeiros (Cards) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Caixa Total */}
                    <div className="group relative bg-card/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl overflow-hidden hover:-translate-y-1 hover:shadow-3xl transition-all duration-500 hover:border-emerald-500/30">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-10"></div>
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1/2 rounded-r-full bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)] opacity-80 group-hover:opacity-100 transition-opacity"></div>

                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-emerald-500/10 ring-2 ring-emerald-500/20 rounded-xl relative shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                                <Wallet className="w-6 h-6 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                            </div>
                        </div>
                        <div className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-1">Caixa Total Bruto</div>
                        <div className="text-3xl font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">R$ {caixaTotal.toFixed(2)}</div>
                    </div>

                    {/* Fundo Mês */}
                    <div className="group relative bg-card/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl overflow-hidden hover:-translate-y-1 hover:shadow-3xl transition-all duration-500 hover:border-blue-500/30">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-10"></div>
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-blue-500/10 ring-2 ring-blue-500/20 rounded-xl">
                                <Activity className="w-6 h-6 text-blue-400" />
                            </div>
                        </div>
                        <div className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-1">Fundo 3 Bolinhas (Mês)</div>
                        <div className="text-2xl font-black text-white">R$ {totalMonthlyFund.toFixed(2)}</div>
                    </div>

                    {/* Fundo Anual */}
                    <div className="group relative bg-card/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl overflow-hidden hover:-translate-y-1 hover:shadow-3xl transition-all duration-500 hover:border-indigo-500/30">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-10"></div>
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-indigo-500/10 ring-2 ring-indigo-500/20 rounded-xl">
                                <Activity className="w-6 h-6 text-indigo-400" />
                            </div>
                        </div>
                        <div className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-1">Fundo Bola 8 (Anual)</div>
                        <div className="text-2xl font-black text-white">R$ {totalYearlyFund.toFixed(2)}</div>
                    </div>

                    {/* Lucro Bar */}
                    <div className="group relative bg-card/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl overflow-hidden hover:-translate-y-1 hover:shadow-3xl transition-all duration-500 hover:border-purple-500/30">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-10"></div>
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-purple-500/10 ring-2 ring-purple-500/20 rounded-xl">
                                <DollarSign className="w-6 h-6 text-purple-400" />
                            </div>
                        </div>
                        <div className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-1">Lucro Retido (Bar)</div>
                        <div className="text-2xl font-black text-white">R$ {totalBarFund.toFixed(2)}</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
                    {/* Extrato de Torneios */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                            Extrato de Entradas <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest">Torneios</span>
                        </h2>
                        <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                            {/* Desktop Table View */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left border-collapse relative z-10">
                                    <thead>
                                        <tr className="border-b border-white/10 bg-white/5">
                                            <th className="p-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Data</th>
                                            <th className="p-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Origem</th>
                                            <th className="p-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right leading-none">Fundo Mês</th>
                                            <th className="p-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right leading-none">Fundo Ano</th>
                                            <th className="p-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right leading-none">Lucro Bar</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tournaments?.map((t, index) => (
                                            <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                                <td className="p-5 text-sm font-medium text-slate-400">
                                                    {new Date(t.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="p-5 font-bold text-white group-hover:text-primary transition-colors uppercase italic text-sm">
                                                    Torneio {t.modality === '3_bolinhas' ? '3 Bolas' : 'Bola 8'}
                                                </td>
                                                <td className="p-5 text-right font-medium text-blue-400">R$ {(t.fund_monthly || 0).toFixed(2)}</td>
                                                <td className="p-5 text-right font-medium text-indigo-400">R$ {(t.fund_yearly || 0).toFixed(2)}</td>
                                                <td className="p-5 text-right font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">+ R$ {(t.fund_bar || 0).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden divide-y divide-white/5">
                                {tournaments?.map((t, index) => (
                                    <div key={index} className="p-5 space-y-4 hover:bg-white/5 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                                                    {new Date(t.created_at).toLocaleDateString()}
                                                </div>
                                                <div className="font-black text-white uppercase italic text-sm tracking-tight">
                                                    Torneio {t.modality === '3_bolinhas' ? '3 Bolas' : 'Bola 8'}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs font-black text-emerald-400 italic leading-none">+ R$ {(t.fund_bar || 0).toFixed(2)}</div>
                                                <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Lucro Bar</div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                                            <div>
                                                <div className="text-sm font-black text-blue-400 italic">R$ {(t.fund_monthly || 0).toFixed(2)}</div>
                                                <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-0.5">Fundo Mês</div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-indigo-400 italic">R$ {(t.fund_yearly || 0).toFixed(2)}</div>
                                                <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-0.5">Fundo Ano</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {tournaments?.length === 0 && (
                                <div className="p-12 text-center">
                                    <div className="inline-flex items-center justify-center p-4 rounded-full bg-white/5 mb-4 border border-white/10">
                                        <DollarSign className="w-8 h-8 text-muted-foreground/50" />
                                    </div>
                                    <p className="font-bold text-white text-lg">Nenhuma movimentação</p>
                                    <p className="text-muted-foreground text-sm mt-1">Nenhuma entrada financeira proveniente de torneios até o momento.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Ajustes Manuais */}
                    <div className="lg:col-span-1 space-y-6">
                        <h2 className="text-2xl font-black text-white tracking-tight">
                            Ajustes Manuais
                        </h2>
                        <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 text-center text-slate-400 shadow-2xl relative overflow-hidden">
                            {/* Subtle scanline background */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100%_4px] opacity-20 pointer-events-none"></div>

                            <div className="relative z-10 space-y-6">
                                <div className="mx-auto w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
                                    <Activity className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <p className="text-sm font-medium leading-relaxed">
                                    O histórico detalhado de sangrias e reforços de caixa manuais será listado aqui em breve.
                                </p>
                                <Button size="lg" className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl transition-all font-bold">
                                    Acessar Livro Caixa Livre
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    )
}
