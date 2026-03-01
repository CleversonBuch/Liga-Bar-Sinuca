'use client'

import { useState } from 'react'
import { deleteTable, toggleTableStatus } from './actions'
import { Button } from '@/components/ui/button'
import { Trash2, Wrench, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmModal } from '@/components/ConfirmModal'
import { cn } from '@/lib/utils'

export function TableListActions({ tableId, currentStatus, isSuperAdmin, className }: { tableId: string, currentStatus: string, isSuperAdmin: boolean, className?: string }) {
    const [loading, setLoading] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    async function handleDeleteConfirmed() {
        setLoading(true)
        const result = await deleteTable(tableId)
        setLoading(false)
        setShowDeleteConfirm(false)

        if (result.success) {
            toast.success('Mesa removida.')
        } else {
            toast.error(result.error || 'Erro ao remover.')
        }
    }

    async function handleToggle() {
        setLoading(true)
        const result = await toggleTableStatus(tableId, currentStatus)
        setLoading(false)

        if (result.success) {
            toast.success('Status da mesa atualizado.')
        } else {
            toast.error(result.error || 'Erro ao atualizar.')
        }
    }

    return (
        <div className={className || "flex justify-end gap-2"}>
            {/* Ocupada não tem botão manual, geralmente o sistema que dita. Aqui só alternamos Livre x Manutenção */}
            {currentStatus !== 'occupied' && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggle}
                    disabled={loading}
                    className={cn(
                        "font-black uppercase tracking-widest text-[9px] px-4 rounded-xl transition-all",
                        currentStatus === 'available'
                            ? "text-amber-500 hover:text-amber-400 hover:bg-amber-400/10 border border-amber-500/20"
                            : "text-emerald-500 hover:text-emerald-400 hover:bg-emerald-400/10 border border-emerald-500/20"
                    )}
                    title={currentStatus === 'available' ? 'Colocar em Manutenção' : 'Tornar Disponível'}
                >
                    {currentStatus === 'available' ? <Wrench className="h-3 w-3 mr-2" /> : <CheckCircle className="h-3 w-3 mr-2" />}
                    {currentStatus === 'available' ? 'Manutenção' : 'Ativar'}
                </Button>
            )}

            <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                    if (!isSuperAdmin) {
                        toast.error('Apenas o Administrador Mestre pode excluir mesas do sistema.')
                        return
                    }
                    setShowDeleteConfirm(true)
                }}
                disabled={loading}
                className="text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                title="Excluir Mesa"
            >
                <Trash2 className="h-4 w-4" />
            </Button>

            <ConfirmModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDeleteConfirmed}
                title="Excluir Mesa?"
                description="Esta ação irá remover permanentemente a mesa do sistema."
                variant="destructive"
                loading={loading}
            />
        </div>
    )
}
