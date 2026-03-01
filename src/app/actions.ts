'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

// Senha definida no ambiente ou padrão 2580
const ADMIN_PIN = process.env.ADMIN_PIN || '2580'
const SUPER_ADMIN_PIN = process.env.SUPER_ADMIN_PIN || '9999'

export async function loginAdmin(pin: string) {
    if (pin === ADMIN_PIN || pin === SUPER_ADMIN_PIN) {
        const role = pin === SUPER_ADMIN_PIN ? 'super_admin' : 'operator'
        const cookieStore = await cookies()

        // Define cookie válido por 30 dias
        cookieStore.set('admin_access', role, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 30, // 30 dias
            path: '/',
        })
        revalidatePath('/', 'layout')
        return { success: true }
    }
    return { success: false, error: 'Senha incorreta.' }
}

export async function logoutAdmin() {
    const cookieStore = await cookies()
    cookieStore.delete('admin_access')
    revalidatePath('/', 'layout')
}
