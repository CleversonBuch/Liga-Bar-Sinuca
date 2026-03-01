'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { deleteTournament } from './actions.server'
import { ConfirmModal } from '@/components/ConfirmModal'

export function TournamentActions({ tournamentId }: { tournamentId: string }) {
    const [loading, setLoading] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    async function handleDeleteConfirmed() {
        setLoading(true)
        const result = await deleteTournament(tournamentId)
        setLoading(false)
        setShowConfirm(false)

        if (result.success) {
            toast.success('Torneio excluído com sucesso.')
        } else {
            toast.error(result.error || 'Erro ao excluir torneio.')
        }
    }

    return (
        <>
            <Button
                variant="destructive"
                size="icon"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowConfirm(true);
                }}
                disabled={loading}
                className="w-12 h-12 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.5)] z-20 pointer-events-auto"
                title="Excluir Torneio (Super Admin)"
            >
                <Trash2 className="w-5 h-5" />
            </Button>

            <ConfirmModal
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleDeleteConfirmed}
                title="Excluir Torneio?"
                description="Excluir este torneio apagará todas as partidas, pontos de ranking e movimentações financeiras associadas. As estatísticas e títulos dos jogadores serão recalculados automaticamente. Esta ação é irreversível."
                variant="destructive"
                loading={loading}
            />
        </>
    )
}
