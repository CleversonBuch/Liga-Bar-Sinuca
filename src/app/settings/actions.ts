"use server"

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { isSuperAdmin } from '@/lib/auth'

export interface AppSettings {
    id: number
    app_name: string
    app_subtitle: string
    app_logo_url: string | null
    prize_pool_winner_pct: number
    fund_monthly_pct: number
    fund_yearly_pct: number
    fund_bar_pct: number
}

export async function getAppSettings(): Promise<AppSettings> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('id', 1)
        .single()

    if (error || !data) {
        // Fallback para não quebrar a UI antes do script de BD ser executado
        return {
            id: 1,
            app_name: 'A.C.L.S',
            app_subtitle: 'Torneios',
            app_logo_url: null,
            prize_pool_winner_pct: 65,
            fund_monthly_pct: 20,
            fund_yearly_pct: 10,
            fund_bar_pct: 5,
        }
    }

    return data
}

export async function updateAppSettings(name: string, subtitle: string) {
    const isAuthorized = await isSuperAdmin()
    if (!isAuthorized) {
        return { success: false, error: 'Acesso negado. Apenas super admins podem alterar essas configurações.' }
    }

    const supabase = await createClient()

    const { error } = await supabase
        .from('app_settings')
        .update({
            app_name: name,
            app_subtitle: subtitle,
            updated_at: new Date().toISOString()
        })
        .eq('id', 1)

    if (error) {
        console.error("Erro ao atualizar configurações:", error)
        return { success: false, error: error.message }
    }

    revalidatePath('/', 'layout')
    return { success: true }
}

export async function uploadAppLogo(formData: FormData) {
    const isAuthorized = await isSuperAdmin()
    if (!isAuthorized) {
        return { success: false, error: 'Acesso negado. Apenas super admins podem alterar o logo.' }
    }

    const file = formData.get('logo') as File
    if (!file) return { success: false, error: 'Nenhum arquivo enviado.' }

    const supabase = await createClient()

    // 1. Fazer upload do arquivo pro bucket
    const fileExt = file.name.split('.').pop()
    const fileName = `logo_${Date.now()}.${fileExt}`
    const filePath = `logos/${fileName}`

    const { error: uploadError } = await supabase.storage
        .from('public-assets')
        .upload(filePath, file)

    if (uploadError) {
        console.error("Erro de upload:", uploadError)
        return { success: false, error: 'Erro ao enviar imagem.' }
    }

    // 2. Pegar a URL pública
    const { data: { publicUrl } } = supabase.storage
        .from('public-assets')
        .getPublicUrl(filePath)

    // 3. Atualizar a tabela
    const { error: updateError } = await supabase
        .from('app_settings')
        .update({ app_logo_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('id', 1)

    if (updateError) {
        console.error("Erro ao atualizar logo na base:", updateError)
        return { success: false, error: 'Erro ao salvar a URL do logo.' }
    }

    revalidatePath('/', 'layout')
    return { success: true, url: publicUrl }
}

export async function updateFinancialSettings(pcts: {
    prize_pool_winner_pct: number
    fund_monthly_pct: number
    fund_yearly_pct: number
    fund_bar_pct: number
}) {
    const isAuthorized = await isSuperAdmin()
    if (!isAuthorized) {
        return { success: false, error: 'Acesso negado.' }
    }

    const total = pcts.prize_pool_winner_pct + pcts.fund_monthly_pct + pcts.fund_yearly_pct + pcts.fund_bar_pct
    if (total !== 100) {
        return { success: false, error: 'A soma das porcentagens deve ser exatamente 100%.' }
    }

    const supabase = await createClient()
    const { error } = await supabase
        .from('app_settings')
        .update({
            ...pcts,
            updated_at: new Date().toISOString()
        })
        .eq('id', 1)

    if (error) return { success: false, error: error.message }

    revalidatePath('/', 'layout')
    return { success: true }
}

export async function resetSystemData() {
    const isAuthorized = await isSuperAdmin()
    if (!isAuthorized) {
        return { success: false, error: 'Acesso negado. Apenas o Administrador Mestre pode realizar esta ação.' }
    }

    const supabase = await createClient()

    try {
        // 1. Deletar todas as partidas
        const { error: matchesError } = await supabase
            .from('matches')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000') // Deleta tudo

        if (matchesError) throw new Error(`Erro ao limpar partidas: ${matchesError.message}`)

        // 2. Deletar todos os torneios
        const { error: tournamentsError } = await supabase
            .from('tournaments')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000') // Deleta tudo

        if (tournamentsError) throw new Error(`Erro ao limpar torneios: ${tournamentsError.message}`)

        // 3. Resetar estatísticas de jogadores (vitórias e partidas)
        const { error: playersError } = await supabase
            .from('players')
            .update({
                wins: 0,
                matches_played: 0
            })
            .neq('id', '00000000-0000-0000-0000-000000000000') // Atualiza todos

        if (playersError) throw new Error(`Erro ao resetar jogadores: ${playersError.message}`)

        revalidatePath('/', 'layout')
        return { success: true }
    } catch (err: any) {
        console.error("Erro no Reset de Sistema:", err)
        return { success: false, error: err.message }
    }
}
