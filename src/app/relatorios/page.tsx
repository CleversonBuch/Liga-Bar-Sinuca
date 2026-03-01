import { FileText, DownloadCloud } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function RelatoriosPage() {
    return (
        <div className="w-full bg-slate-950 text-white animate-in fade-in duration-500">
            <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <FileText className="w-8 h-8 text-blue-500" />
                        Relatórios e Exportações
                    </h1>
                    <p className="text-slate-400 mt-1">Gere extratos em PDF, planilhas de histórico e recibos de premiação.</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
                    <FileText className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                    <p className="text-lg font-semibold text-white">Módulo de Exportação em Desenvolvimento</p>
                    <p className="text-slate-400 mt-2 mb-6">Em breve você poderá exportar balanços mensais e rankings para impressão.</p>

                    <Button variant="outline" className="border-slate-700" disabled>
                        <DownloadCloud className="w-4 h-4 mr-2" />
                        Exportar Extrato Atual (Em breve)
                    </Button>
                </div>

            </main>
        </div>
    )
}
