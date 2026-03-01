import { isAdmin } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Trophy } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { TournamentWizard } from './TournamentWizard'

export default async function NovoTorneioPage() {
    // Apenas operadores podem criar torneios
    const isOperator = await isAdmin()
    if (!isOperator) redirect('/')

    // Buscar lista de jogadores disponíveis
    const supabase = await createClient()
    const { data: players } = await supabase.from('players').select('id, name, nickname').order('name')

    return (
        <div className="w-full bg-slate-950 text-white animate-in fade-in duration-500">
            <main className="max-w-7xl mx-auto p-6 md:p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Trophy className="w-8 h-8 text-emerald-500" />
                        Configurar Novo Torneio
                    </h1>
                    <p className="text-slate-400 mt-1">Configure o regulamento, taxas e lista de participantes para a nova competição.</p>
                </div>
                <TournamentWizard players={players || []} />
            </main>
        </div>
    )
}
