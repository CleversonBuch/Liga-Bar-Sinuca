'use client'

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

interface EvolutionChartProps {
    data: any[]
}

export function EvolutionChart({ data }: EvolutionChartProps) {
    // Cores especificadas: Verde (líder), Amarelo, Azul, Vermelho, Roxo
    const colors = ["#00C853", "#F5B400", "#1E3A5F", "#FF5252", "#9C27B0"]

    // Pegar as chaves dos jogadores (todas exceto 'name')
    const playerNames = data.length > 0
        ? Object.keys(data[0]).filter(key => key !== 'name')
        : []

    return (
        <div className="w-full h-[250px] mt-6">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#0F1C2E',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            color: '#fff'
                        }}
                        itemStyle={{ padding: '0px' }}
                    />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        wrapperStyle={{
                            fontSize: '10px',
                            fontWeight: 'black',
                            textTransform: 'uppercase',
                            paddingTop: '20px'
                        }}
                    />
                    {playerNames.map((name, index) => (
                        <Line
                            key={name}
                            type="monotone"
                            dataKey={name}
                            stroke={colors[index % colors.length]}
                            strokeWidth={3}
                            dot={{ r: 4, strokeWidth: 2, fill: '#081220' }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                            animationDuration={1500}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}
