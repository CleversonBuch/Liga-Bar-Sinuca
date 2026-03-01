'use client'

import { useState } from 'react'
import { HandCoins, Save, AlertCircle, CheckCircle2, Trash2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { updateFinancialSettings, resetSystemData } from '@/app/settings/actions'
import { toast } from 'sonner'
import { ConfirmModal } from './ConfirmModal'

interface FinancialSettingsFormProps {
    initialSettings: {
        prize_pool_winner_pct: number
        fund_monthly_pct: number
        fund_yearly_pct: number
        fund_bar_pct: number
    }
}

export function FinancialSettingsForm({ initialSettings }: FinancialSettingsFormProps) {
    const [loading, setLoading] = useState(false)
    const [resetLoading, setResetLoading] = useState(false)
    const [pcts, setPcts] = useState(initialSettings)
    const [showFirstConfirm, setShowFirstConfirm] = useState(false)
    const [showSecondConfirm, setShowSecondConfirm] = useState(false)

    const total = pcts.prize_pool_winner_pct + pcts.fund_monthly_pct + pcts.fund_yearly_pct + pcts.fund_bar_pct
    const isInvalid = total !== 100

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (isInvalid) return

        setLoading(true)
        const res = await updateFinancialSettings(pcts)
        setLoading(false)

        if (res.success) {
            toast.success('Distribuição financeira atualizada com sucesso!')
        } else {
            toast.error(res.error || 'Erro ao atualizar configurações.')
        }
    }

    const handleChange = (field: keyof typeof pcts, value: string) => {
        const numValue = parseFloat(value) || 0
        setPcts(prev => ({ ...prev, [field]: numValue }))
    }

    async function handleResetSystem() {
        setResetLoading(true)
        const res = await resetSystemData()
        setResetLoading(false)
        setShowSecondConfirm(false)

        if (res.success) {
            toast.success('Sistema resetado com sucesso! Tudo limpo.')
            window.location.reload() // Recarrega para limpar todos os estados e caches
        } else {
            toast.error(res.error || 'Erro ao resetar sistema.')
        }
    }

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group transition-all duration-500 hover:border-emerald-500/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-6 mb-8 relative z-10">
                <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 ring-1 ring-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    <HandCoins className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Distribuição Financeira Global</h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Parâmetros automáticos para novos torneios</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Premiação do Vencedor (%)</label>
                        <Input
                            type="number"
                            value={pcts.prize_pool_winner_pct}
                            onChange={(e) => handleChange('prize_pool_winner_pct', e.target.value)}
                            className="bg-slate-950 border-white/5 rounded-2xl h-12 font-black italic text-lg focus:ring-emerald-500/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Prêmio Mensal (%)</label>
                        <Input
                            type="number"
                            value={pcts.fund_monthly_pct}
                            onChange={(e) => handleChange('fund_monthly_pct', e.target.value)}
                            className="bg-slate-950 border-white/5 rounded-2xl h-12 font-black italic text-lg focus:ring-emerald-500/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Prêmio Anual (%)</label>
                        <Input
                            type="number"
                            value={pcts.fund_yearly_pct}
                            onChange={(e) => handleChange('fund_yearly_pct', e.target.value)}
                            className="bg-slate-950 border-white/5 rounded-2xl h-12 font-black italic text-lg focus:ring-emerald-500/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Lucro Bar (%)</label>
                        <Input
                            type="number"
                            value={pcts.fund_bar_pct}
                            onChange={(e) => handleChange('fund_bar_pct', e.target.value)}
                            className="bg-slate-950 border-white/5 rounded-2xl h-12 font-black italic text-emerald-400 text-lg focus:ring-emerald-500/50"
                        />
                    </div>
                </div>

                <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all duration-500 ${isInvalid ? 'bg-red-500/10 border-red-500/20 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]'}`}>
                    {isInvalid ? <AlertCircle className="w-5 h-5 flex-shrink-0" /> : <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
                    <div className="flex-1">
                        <div className="text-[10px] font-black uppercase tracking-widest mb-0.5">Total da Distribuição</div>
                        <div className="text-xl font-black italic">{total}%</div>
                        {isInvalid && <p className="text-[9px] font-bold uppercase tracking-tight mt-1 opacity-80">A soma deve ser exatamente 100%.</p>}
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={loading || isInvalid}
                    className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:grayscale transition-all text-sm italic"
                >
                    {loading ? 'Salvando...' : (
                        <>
                            <Save className="w-5 h-5 mr-2" />
                            Salvar Alterações
                        </>
                    )}
                </Button>
            </form>

            {/* Zona de Perigo */}
            <div className="mt-12 pt-8 border-t border-red-500/20 relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-red-500/10 rounded-xl text-red-500 ring-1 ring-red-500/20">
                        <AlertTriangle className="w-5 h-5 font-black uppercase tracking-tighter" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-red-500 uppercase tracking-widest italic">Zona de Perigo</h3>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">Ações irreversíveis do sistema</p>
                    </div>
                </div>

                <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 transition-all hover:bg-red-500/10">
                    <div className="space-y-1 text-center md:text-left">
                        <h4 className="text-xs font-black text-white uppercase tracking-widest italic">Zerar Todo o Sistema</h4>
                        <p className="text-[10px] text-slate-500 font-medium">Remove todos os torneios e partidas, mantendo apenas os jogadores.</p>
                    </div>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={() => setShowFirstConfirm(true)}
                        disabled={resetLoading}
                        className="w-full md:w-auto h-12 px-8 rounded-xl bg-red-950/40 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20 font-black uppercase tracking-widest text-[10px] transition-all hover:scale-105"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Zerar Sistema
                    </Button>
                </div>
            </div>

            {/* Modais de Confirmação Dupla */}
            <ConfirmModal
                isOpen={showFirstConfirm}
                onClose={() => setShowFirstConfirm(false)}
                onConfirm={() => {
                    setShowFirstConfirm(false)
                    setTimeout(() => setShowSecondConfirm(true), 100)
                }}
                title="Tem Certeza Absoluta?"
                description="Você está prestes a apagar todos os torneios e partidas do sistema. Os jogadores serão mantidos, mas as estatísticas deles voltarão a zero."
                variant="destructive"
            />

            <ConfirmModal
                isOpen={showSecondConfirm}
                onClose={() => setShowSecondConfirm(false)}
                onConfirm={handleResetSystem}
                title="ESTA AÇÃO É IRREVERSÍVEL!"
                description="ÚLTIMO AVISO: Todas as chaves, históricos e premiações serão perdidos para sempre. Deseja prosseguir mesmo assim?"
                confirmText="SIM, ZERAR TUDO AGORA"
                variant="destructive"
                loading={resetLoading}
            />
        </div>
    )
}
