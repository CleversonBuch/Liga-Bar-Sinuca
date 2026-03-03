'use server'

import { createClient } from '@/lib/supabase/server'
import { isSuperAdmin } from '@/lib/auth'
import { revalidatePath, revalidateTag } from 'next/cache'
import { recomputeSystemIntegrity } from '@/lib/integrity'

export async function deleteTournament(tournamentId: string) {
    const isSuper = await isSuperAdmin()

    if (!isSuper) {
        return { success: false, error: 'Acesso negado. Apenas super administradores podem excluir torneios.' }
    }

    try {
        const supabase = await createClient()

        // 1. Deletar o torneio (CASCADE apaga matches e tournament_players automaticamente)
        const { error } = await supabase
            .from('tournaments')
            .delete()
            .eq('id', tournamentId)

        if (error) throw error

        // 2. Recalcular TUDO: stats, rankings, títulos — garantindo integridade total
        await recomputeSystemIntegrity(supabase)

        // 3. Revalidar caches e todas as páginas afetadas
        revalidateTag('rankings', 'default')
        revalidatePath('/', 'layout')
        revalidatePath('/torneios')
        revalidatePath('/ranking')
        revalidatePath('/financeiro')
        revalidatePath('/historico')
        revalidatePath('/jogadores')
        return { success: true }
    } catch (e: any) {
        return { success: false, error: 'Erro ao excluir torneio: ' + e.message }
    }
}
