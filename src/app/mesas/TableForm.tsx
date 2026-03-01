'use client'

import { useState } from 'react'
import { addTable } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { PlusCircle } from 'lucide-react'

export function TableForm() {
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const result = await addTable(formData)

        setLoading(false)

        if (result.success) {
            toast.success('Mesa adicionada com sucesso!')
                ; (e.target as HTMLFormElement).reset()
        } else {
            toast.error(result.error || 'Erro ao adicionar a mesa.')
        }
    }

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl w-full max-w-md sticky top-24">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-purple-500/10 p-2 rounded-lg text-purple-500">
                    <PlusCircle className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-white">Nova Mesa</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-slate-300">Número da Mesa</Label>
                    <Input
                        name="number"
                        type="number"
                        min="1"
                        placeholder="Ex: 1"
                        required
                        className="bg-slate-950 border-slate-700 text-white focus-visible:ring-purple-500"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-slate-300">Nome (Opcional)</Label>
                    <Input
                        name="name"
                        placeholder="Ex: Mesa VIP"
                        className="bg-slate-950 border-slate-700 text-white focus-visible:ring-purple-500"
                    />
                </div>

                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                >
                    {loading ? 'Salvando...' : 'Adicionar Mesa'}
                </Button>
            </form>
        </div>
    )
}
