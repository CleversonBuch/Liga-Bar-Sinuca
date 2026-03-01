'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getPlayers() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('players')
        .select('*')
        // Ordena por maior número de vitórias; 
        // Desempate: quem jogou mais partidas;
        // Penúltimo critério: nome alfabético.
        .order('wins', { ascending: false })
        .order('matches_played', { ascending: false })
        .order('name', { ascending: true })

    return { data, error: error?.message }
}

export async function addPlayer(formData: FormData) {
    const supabase = await createClient()

    const name = formData.get('name') as string
    const nickname = (formData.get('nickname') as string) || null
    const photoBase64 = (formData.get('photoBase64') as string) || null

    if (!name) return { success: false, error: 'O nome é obrigatório.' }

    const { error } = await supabase
        .from('players')
        .insert([{ name, nickname, photo_url: photoBase64 }])

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/jogadores')
    return { success: true }
}

export async function deletePlayer(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('players').delete().eq('id', id)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/jogadores')
    return { success: true }
}
export async function editPlayer(id: string, formData: FormData) {
    const supabase = await createClient()

    const name = formData.get('name') as string
    const nickname = (formData.get('nickname') as string) || null
    const photoBase64 = (formData.get('photoBase64') as string) || null

    if (!name) return { success: false, error: 'O nome é obrigatório.' }

    const updateData: any = { name, nickname }
    // Só atualiza a imagem se ela foi enviada; caso contrário, mantém a existente.
    // Para remover, no front não passaremos photoBase64 mas teremos um flag, ou passaremos empty string (vamos assumir q se foto n vier, mantemos).
    // Vou adicionar flag clearPhoto caso o user tenha clicado em remover.
    const clearPhoto = formData.get('clearPhoto') === 'true'

    if (clearPhoto) {
        updateData.photo_url = null
    } else if (photoBase64) {
        updateData.photo_url = photoBase64
    }

    const { error } = await supabase
        .from('players')
        .update(updateData)
        .eq('id', id)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/jogadores')
    return { success: true }
}
