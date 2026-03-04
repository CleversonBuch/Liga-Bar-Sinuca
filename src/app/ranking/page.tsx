import { getRankings, getEvolutionData } from './actions'
import { Zap } from 'lucide-react'
import Link from 'next/link'
import { RulesModal } from '@/components/RulesModal'
import { EvolutionChart } from '@/components/EvolutionChart'
import { PodiumSection } from '@/components/PodiumSection'
import { RankingTabs } from './RankingTabs'

export default async function RankingPage(props: {
    searchParams: Promise<{ period?: string, tab?: string }>
}) {
    const searchParams = await props.searchParams
    const period = (searchParams.period as 'mes' | 'ano') || 'mes'
    const activeTab = searchParams.tab || 'geral'
    const { rank3, rank8, general } = await getRankings(period)
    const evolutionData = await getEvolutionData()

    return (
        <div className="min-h-screen bg-[#081220] flex flex-col pb-20 overflow-x-hidden">
            {/* MAIN CONTENT */}
            <main className="mt-4 px-4 py-8 space-y-8 animate-in fade-in duration-500">

                {/* PERIOD SELECTOR */}
                <div className="flex bg-[#0F1C2E] p-1.5 rounded-2xl border border-white/5 mx-auto w-max shadow-inner">
                    {(['mes', 'ano'] as const).map((p) => (
                        <Link
                            key={p}
                            href={`/ranking?period=${p}&tab=${activeTab}`}
                            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${period === p
                                ? 'bg-[#00C853] text-black shadow-lg shadow-[#00C853]/20'
                                : 'text-slate-500 hover:text-white'
                                }`}
                        >
                            {p === 'mes' ? 'Mensal' : 'Anual'}
                        </Link>
                    ))}
                </div>

                {/* CLIENT-SIDE TABS */}
                <RankingTabs
                    rank3={rank3}
                    rank8={rank8}
                    general={general}
                    initialTab={activeTab}
                />

                {/* 📊 CARD – EVOLUÇÃO TOP 5 */}
                <section className="bg-gradient-to-br from-[#0F1C2E] to-[#12263A] border border-white/5 rounded-[2.5rem] p-6 shadow-2xl overflow-hidden mt-8">
                    <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-5 h-5 text-[#00E676]" />
                        <h2 className="text-white font-semibold text-base">Evolução Top 5</h2>
                    </div>

                    <EvolutionChart data={evolutionData} />
                </section>

                {/* 🏆 HALL DA FAMA — Mini Pódio 3D */}
                <PodiumSection players={general} />
            </main>
        </div>
    )
}
