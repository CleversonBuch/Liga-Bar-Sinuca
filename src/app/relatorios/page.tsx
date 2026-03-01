import { FileText, DownloadCloud } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function RelatoriosPage() {
    return (
        <div className="w-full bg-slate-950 text-white animate-in fade-in duration-500">
            <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-8 pb-20">
                <div className="pt-4">
                    <h1 className="text-3xl font-black text-white flex items-center gap-3 uppercase italic tracking-tighter">
                        <FileText className="w-8 h-8 text-blue-500" />
                        Relatórios
                    </h1>
                    <p className="text-slate-500 mt-1 font-bold text-[10px] uppercase tracking-widest">Gere extratos e exportações oficiais.</p>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-12 text-center text-slate-400 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="w-20 h-20 bg-blue-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 ring-1 ring-blue-500/20">
                            <FileText className="w-10 h-10 text-blue-500/50" />
                        </div>
                        <p className="text-xl font-black text-white uppercase italic tracking-widest">Em Desenvolvimento</p>
                        <p className="text-slate-500 mt-2 mb-8 text-sm font-medium max-w-sm mx-auto">Em breve você poderá exportar balanços mensais e rankings para impressão diretamente em PDF.</p>

                        <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-slate-500 rounded-full px-8 font-black uppercase text-[10px] tracking-widest h-12" disabled>
                            <DownloadCloud className="w-4 h-4 mr-2" />
                            Exportar PDF (Em breve)
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    )
}
