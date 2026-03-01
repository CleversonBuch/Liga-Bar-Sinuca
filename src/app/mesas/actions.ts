'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getTables() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('tables')
        .select('*')
        .order('number')

    return { data, error: error?.message }
}

export async function addTable(formData: FormData) {
    const supabase = await createClient()

    const number = parseInt(formData.get('number') as string)
    const name = (formData.get('name') as string) || null

    if (!number) return { success: false, error: 'O número da mesa é obrigatório.' }

    const { error } = await supabase
        .from('tables')
        .insert([{ number, name }])

    if (error) {
        // Código de erro comum do Postgre para UNIQUE constraint (caso mesa já exista)
        if (error.code === '23505') {
            return { success: false, error: 'Já existe uma mesa com este número.' }
        }
        return { success: false, error: error.message }
    }

    revalidatePath('/mesas')
    return { success: true }
}

export async function deleteTable(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('tables').delete().eq('id', id)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/mesas')
    return { success: true }
}

export async function toggleTableStatus(id: string, currentStatus: string) {
    const supabase = await createClient()

    const newStatus = currentStatus === 'available' ? 'maintenance' : 'available'

    const { error } = await supabase
        .from('tables')
        .update({ status: newStatus })
        .eq('id', id)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/mesas')
    return { success: true }
}
