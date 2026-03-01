import { Settings, ShieldAlert, Sliders } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getAppSettings } from '@/app/settings/actions'
import { FinancialSettingsForm } from '@/components/FinancialSettingsForm'

export default async function ConfiguracoesPage() {
    const appSettings = await getAppSettings()

    return (
        <div className="w-full bg-slate-950 text-white animate-in fade-in duration-500 min-h-screen">
            <main className="max-w-7xl mx-auto p-6 md:p-10 space-y-10">
                <div className="space-y-2">
                    <h1 className="text-3xl md:text-5xl font-black text-white flex items-center gap-4 uppercase italic tracking-tighter">
                        <Settings className="w-10 h-10 text-primary" />
                        Configurações
                    </h1>
                    <p className="text-slate-400 font-medium max-w-2xl">Gerencie os parâmetros globais da Liga Sinuca, repasses e políticas de acesso.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Regras de Torneio */}
                    <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 space-y-6 shadow-2xl relative overflow-hidden group hover:border-blue-500/20 transition-all duration-500">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

                        <div className="flex items-center gap-3 border-b border-slate-800 pb-6 mb-2 relative z-10">
                            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400 ring-1 ring-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                                <Sliders className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Regras de Torneio</h2>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Mecânicas e limites globais</p>
                            </div>
                        </div>

                        <div className="space-y-4 text-slate-400 relative z-10">
                            <p className="text-sm">Configurações de empate cruzado e limites de rodadas em desenvolvimento.</p>
                            <div className="flex items-center justify-between p-4 bg-slate-950/50 border border-white/5 rounded-2xl transition-all hover:bg-slate-950">
                                <span className="text-xs font-black uppercase tracking-widest">Mata-Mata Automático</span>
                                <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-500/30">ATIVADO</span>
                            </div>
                        </div>
                    </div>

                    {/* Distribuição Financeira Global */}
                    <FinancialSettingsForm initialSettings={appSettings} />

                    {/* Acesso & Auditoria */}
                    <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 space-y-6 shadow-2xl relative overflow-hidden group hover:border-amber-500/20 transition-all duration-500">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

                        <div className="flex items-center gap-3 border-b border-slate-800 pb-6 mb-2 relative z-10">
                            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500 ring-1 ring-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                                <ShieldAlert className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Acesso & Segurança</h2>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Auditoria e controle master</p>
                            </div>
                        </div>

                        <div className="space-y-6 relative z-10">
                            <p className="text-sm text-slate-400">Alteração da Senha Mestra (Operador) e Histórico de Logs do Banco de Dados.</p>
                            <Button variant="outline" className="w-full h-12 rounded-2xl bg-white/5 border-white/10 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest">
                                Ver Logs de Auditoria
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
