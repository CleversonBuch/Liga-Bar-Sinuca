'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { deleteTournament } from './actions.server'

export function TournamentActions({ tournamentId }: { tournamentId: string }) {
    const [loading, setLoading] = useState(false)

    async function handleDelete(e: React.MouseEvent) {
        e.preventDefault() // Previne a navegação pro link do card
        e.stopPropagation()

        if (!window.confirm('CUIDADO MÁXIMO: Tem certeza que deseja apagar este TORNEIO INTEIRO? Todas as partidas, inscritos e chaves ligadas a ele serão apagadas.')) {
            return
        }

        setLoading(true)
        const result = await deleteTournament(tournamentId)
        setLoading(false)

        if (result.success) {
            toast.success('Torneio excluído com sucesso.')
        } else {
            toast.error(result.error || 'Erro ao excluir torneio.')
        }
    }

    return (
        <Button
            variant="destructive"
            size="icon"
            onClick={handleDelete}
            disabled={loading}
            className="w-12 h-12 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.5)] z-20 pointer-events-auto"
            title="Excluir Torneio (Super Admin)"
        >
            <Trash2 className="w-5 h-5" />
        </Button>
    )
}
