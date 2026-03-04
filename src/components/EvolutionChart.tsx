'use client'

import { useState, useMemo } from 'react'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts'
import { Trophy, CalendarDays, Activity, ListFilter } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EvolutionChartProps {
    data: {
        months: any[]
        matches: any[]
    }
}

type Timeframe = 'matches' | 'weeks' | 'months'

export function EvolutionChart({ data }: EvolutionChartProps) {
    const [timeframe, setTimeframe] = useState<Timeframe>('matches')
    const [showTop5, setShowTop5] = useState(false)

    // Cores específicas exigidas: Verde, Amarelo, Vermelho, Azul, Roxo
    const colors = ["#00C853", "#F5B400", "#FF5252", "#1E3A5F", "#9C27B0"]

    // Derivar os nomes dos jogadores (pega o primeiro datapoint completo de "matches" se existir, ou de "months")
    const sampleItem = data.matches.length > 0 ? Object.keys(data.matches[0]) :
        data.months.length > 0 ? Object.keys(data.months[0]) : []

    // Filtra chaves de sistema
    const allPlayerNames = sampleItem.filter(k => k !== 'name' && k !== 'fullDate' && k !== 'week')

    // Limita os nomes baseado no toggle (Top 3 ou Top 5)
    // O array já costuma vir ordenado do banco (maior pontuador = primeiro do ranking atual)
    const activePlayers = showTop5 ? allPlayerNames : allPlayerNames.slice(0, 3)

    // Agrupar 'matches' em 'weeks' dinamicamente se necessário
    const chartData = useMemo(() => {
        if (timeframe === 'months') return data.months
        if (timeframe === 'matches') return data.matches

        // Transformar 'matches' em 'weeks' pegando o último ponto de cada semana
        if (timeframe === 'weeks') {
            const weeksMap = new Map()
            data.matches.forEach(m => {
                // Guarda sempre a última partida registrada naquela semana (estado cumulativo final)
                weeksMap.set(m.week, { ...m, name: m.week.split('-')[1] })
            })
            return Array.from(weeksMap.values())
        }

        return []
    }, [data, timeframe])

    function CustomTooltip({ active, payload, label }: any) {
        if (active && payload && payload.length) {
            // Ordenar por pontuação do maior para o menor naquele instante
            const sortedPayload = [...payload].sort((a, b) => b.value - a.value)

            return (
                <div className="bg-[#081220]/95 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl">
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-3 border-b border-white/5 pb-2">
                        {timeframe === 'months' ? label :
                            timeframe === 'weeks' ? `Semana ${label}` :
                                `Partida ${label.replace('P', '')}`}
                    </p>
                    <div className="space-y-2.5">
                        {sortedPayload.map((entry: any, index: number) => (
                            <div key={`item-${index}`} className="flex items-center gap-4 justify-between">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-2.5 h-2.5 rounded-full"
                                        style={{ backgroundColor: entry.color, boxShadow: `0 0 8px ${entry.color}80` }}
                                    />
                                    <span className="text-xs font-bold text-white capitalize">{entry.name}</span>
                                </div>
                                <span className="text-xs font-black" style={{ color: entry.color }}>
                                    {entry.value} {timeframe !== 'months' ? 'vitórias' : 'pts'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )
        }
        return null;
    }

    if (!data || (data.months.length === 0 && data.matches.length === 0)) {
        return (
            <div className="w-full h-[250px] flex items-center justify-center bg-white/5 rounded-2xl mt-6 border border-white/5">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Sem dados no período</span>
            </div>
        )
    }

    return (
        <div className="w-full mt-4 flex flex-col">

            {/* Controles do Gráfico */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">

                {/* Seletor de Período (Matches, Weeks, Months) */}
                <div className="flex bg-[#081220] p-1 rounded-xl border border-white/10 shadow-inner w-full sm:w-auto">
                    <button
                        onClick={() => setTimeframe('matches')}
                        className={cn(
                            "flex-1 sm:flex-none px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all gap-1.5 flex items-center justify-center",
                            timeframe === 'matches' ? "bg-white/10 text-white shadow-md border border-white/10" : "text-slate-500 hover:text-white"
                        )}
                    >
                        <Activity className="w-3.5 h-3.5" /> Partidas
                    </button>
                    <button
                        onClick={() => setTimeframe('weeks')}
                        className={cn(
                            "flex-1 sm:flex-none px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all gap-1.5 flex items-center justify-center",
                            timeframe === 'weeks' ? "bg-white/10 text-white shadow-md border border-white/10" : "text-slate-500 hover:text-white"
                        )}
                    >
                        <CalendarDays className="w-3.5 h-3.5" /> Semanas
                    </button>
                    <button
                        onClick={() => setTimeframe('months')}
                        className={cn(
                            "flex-1 sm:flex-none px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all gap-1.5 flex items-center justify-center",
                            timeframe === 'months' ? "bg-white/10 text-white shadow-md border border-white/10" : "text-slate-500 hover:text-white"
                        )}
                    >
                        <Trophy className="w-3.5 h-3.5" /> Meses
                    </button>
                </div>

                {/* Filtro Top Players */}
                <button
                    onClick={() => setShowTop5(!showTop5)}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                        showTop5
                            ? "bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-amber-500/20"
                            : "bg-[#081220] text-slate-400 border-white/10 hover:border-white/30 hover:text-white"
                    )}
                >
                    <ListFilter className="w-3.5 h-3.5" />
                    {showTop5 ? "Ocultar Top 5" : "Mostrar Top 5"}
                </button>
            </div>

            {/* Container do Gráfico com Scroll X em caso de muitas partidas */}
            <div className="w-full overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                <div className={cn("h-[280px]", timeframe === 'matches' && chartData.length > 20 ? "min-w-[800px]" : "w-full")}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 15, right: 20, left: -25, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />

                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }}
                                dy={10}
                                minTickGap={20}
                            />

                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }}
                                dx={-10}
                            />

                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ffffff20', strokeWidth: 1, strokeDasharray: '5 5' }} />

                            <Legend
                                verticalAlign="top"
                                height={40}
                                iconType="circle"
                                wrapperStyle={{
                                    fontSize: '11px',
                                    fontWeight: 'black',
                                    textTransform: 'uppercase',
                                    color: '#fff',
                                    paddingBottom: '20px'
                                }}
                            />

                            {activePlayers.map((name, index) => {
                                // O jogador atual no loop é o primeiro no array (Líder)?
                                const isLeader = index === 0;

                                return (
                                    <Line
                                        key={name}
                                        type="monotone"
                                        dataKey={name}
                                        stroke={colors[index % colors.length]}
                                        strokeWidth={isLeader ? 4 : 2.5}
                                        // Sombreamento apenas no líder
                                        style={{ filter: isLeader ? `drop-shadow(0px 4px 8px ${colors[index % colors.length]}60)` : 'none' }}
                                        dot={{
                                            r: isLeader ? 4 : 3,
                                            strokeWidth: 2,
                                            fill: '#081220',
                                            stroke: colors[index % colors.length]
                                        }}
                                        activeDot={{
                                            r: isLeader ? 8 : 6,
                                            strokeWidth: 0,
                                            fill: colors[index % colors.length],
                                            style: { filter: `drop-shadow(0px 0px 8px ${colors[index % colors.length]})` }
                                        }}
                                        animationDuration={2000}
                                        animationEasing="ease-out"
                                    />
                                )
                            })}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="text-center mt-2">
                {timeframe === 'matches' && chartData.length > 20 && (
                    <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest italic animate-pulse">
                        &lt; Deslize para ver todas as partidas &gt;
                    </span>
                )}
            </div>
        </div>
    )
}
