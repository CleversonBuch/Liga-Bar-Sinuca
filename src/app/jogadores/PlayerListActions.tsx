'use client'

import { useState } from 'react'
import { deletePlayer } from './actions'
import { Button } from '@/components/ui/button'
import { Trash2, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { PlayerForm } from './PlayerForm'
import { ConfirmModal } from '@/components/ConfirmModal'

export function PlayerListActions({ player, isSuperAdmin }: { player: any, isSuperAdmin: boolean }) {
    const [loading, setLoading] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    async function handleDeleteConfirmed() {
        setLoading(true)
        const result = await deletePlayer(player.id)
        setLoading(false)
        setShowDeleteConfirm(false)

        if (result.success) {
            toast.success('Jogador removido.')
        } else {
            toast.error(result.error || 'Erro ao remover.')
        }
    }

    return (
        <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md rounded-lg p-1 border border-white/5">
            <PlayerForm player={player}>
                <Button
                    variant="ghost"
                    size="icon"
                    disabled={loading}
                    className="h-8 w-8 text-slate-400 hover:text-emerald-400 hover:bg-emerald-400/10 transition-colors"
                    title="Editar Jogador"
                >
                    <Pencil className="h-4 w-4" />
                </Button>
            </PlayerForm>

            {isSuperAdmin && (
                <>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={loading}
                        className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                        title="Excluir Jogador"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>

                    <ConfirmModal
                        isOpen={showDeleteConfirm}
                        onClose={() => setShowDeleteConfirm(false)}
                        onConfirm={handleDeleteConfirmed}
                        title="Excluir Jogador?"
                        description={`Tem certeza que deseja apagar ${player.name}? Todo o histórico de participações e vitórias será perdido permanentemente.`}
                        variant="destructive"
                        loading={loading}
                    />
                </>
            )}
        </div>
    )
}
