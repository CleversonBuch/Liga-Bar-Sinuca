import { cookies } from 'next/headers'

// Verifica se tem qualquer acesso (Operador ou Admin)
export async function isAdmin() {
    const cookieStore = await cookies()
    const access = cookieStore.get('admin_access')?.value
    return access === 'operator' || access === 'super_admin' || access === 'true' // Mantendo compatibilidade legada 'true' se der erro
}

// Verifica acesso ABSOLUTO (Apenas Super Admin)
export async function isSuperAdmin() {
    const cookieStore = await cookies()
    return cookieStore.get('admin_access')?.value === 'super_admin'
}
