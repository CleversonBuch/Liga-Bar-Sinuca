'use server'

import { createClient } from '@/lib/supabase/server'
import { isSuperAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function deleteTournament(tournamentId: string) {
    const isSuper = await isSuperAdmin()

    if (!isSuper) {
        return { success: false, error: 'Acesso negado. Apenas super administradores podem excluir torneios.' }
    }

    try {
        const supabase = await createClient()

        // 1. Apagar Ranking Mensal / Anual gerado por esse torneio
        // (Simplificado - No caso ideal deveriamos buscar os pontos mas como tem cascade vamos apenas deletar o torneio e ele cascadeia as partidas/players)
        // OBS: Como Rankings não guarda o tournament_id, a remoção de pontos tem que ser manual se foi computado.

        // Vamos apenas deletar o torneio, as cascades em tournaments_players e matches vão cuidar do resto.
        const { error } = await supabase
            .from('tournaments')
            .delete()
            .eq('id', tournamentId)

        if (error) throw error

        revalidatePath('/torneios')
        return { success: true }
    } catch (e: any) {
        return { success: false, error: 'Erro ao excluir torneio: ' + e.message }
    }
}
