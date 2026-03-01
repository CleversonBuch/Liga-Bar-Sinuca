'use client'

import { useState } from 'react'
import { HandCoins, Save, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { updateFinancialSettings } from '@/app/settings/actions'
import { toast } from 'sonner'

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
    const [pcts, setPcts] = useState(initialSettings)

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
        </div>
    )
}
