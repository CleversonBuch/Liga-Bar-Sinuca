import { Settings, ShieldAlert, Sliders, HandCoins } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ConfiguracoesPage() {
    return (
        <div className="w-full bg-slate-950 text-white animate-in fade-in duration-500">
            <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Settings className="w-8 h-8 text-slate-400" />
                        Configurações do Sistema
                    </h1>
                    <p className="text-slate-400 mt-1">Gerencie os parâmetros globais da Liga Sinuca, repasses e políticas de acesso.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                        <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-4">
                            <Sliders className="w-6 h-6 text-blue-500" />
                            <h2 className="text-xl font-bold">Regras de Torneio</h2>
                        </div>

                        <div className="space-y-4 text-slate-400">
                            <p>Módulo de configuração de empate cruzado e limites de rodadas em desenvolvimento.</p>
                            <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg">
                                <span>Partidas automáticas no Mata-Mata</span>
                                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">Ativado</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                        <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-4">
                            <HandCoins className="w-6 h-6 text-emerald-500" />
                            <h2 className="text-xl font-bold">Distribuição Financeira Global</h2>
                        </div>

                        <div className="space-y-4 text-slate-400">
                            <p>Taxas padrão injetadas automaticamente na criação de um torneio.</p>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center"><span className="text-white">Premiação do Vencedor</span><span className="font-bold">65%</span></div>
                                <div className="flex justify-between items-center"><span className="text-white">Fundo (3 Bolinhas Mensal)</span><span className="font-bold">20%</span></div>
                                <div className="flex justify-between items-center"><span className="text-white">Fundo (Bola 8 Anual)</span><span className="font-bold">10%</span></div>
                                <div className="flex justify-between items-center"><span className="text-white">Lucro Limpo (Bar)</span><span className="font-bold text-emerald-400">5%</span></div>
                            </div>
                            <Button variant="outline" className="w-full mt-4" disabled>Alterar Taxas</Button>
                        </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                        <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-4">
                            <ShieldAlert className="w-6 h-6 text-amber-500" />
                            <h2 className="text-xl font-bold">Acesso & Auditoria</h2>
                        </div>

                        <div className="space-y-4 text-slate-400">
                            <p>Alteração da Senha Mestra (Operador) e Histórico de Logs do Banco de Dados.</p>
                            <div className="flex gap-4">
                                <Button variant="default" className="bg-slate-800 text-white hover:bg-slate-700 flex-1">Ver Logs de Auditoria</Button>
                            </div>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    )
}
