import { isAdmin, isSuperAdmin } from '@/lib/auth'
import { getPlayers } from './actions'
import { PlayerForm } from './PlayerForm'
import { PlayerListActions } from './PlayerListActions'
import { Users, Trophy } from 'lucide-react'

export default async function JogadoresPage() {
    const isOperator = await isAdmin()
    const isSuper = await isSuperAdmin()
    const { data: players, error } = await getPlayers()

    return (
        <div className="w-full text-white animate-in fade-in duration-500 pb-20">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 md:p-8 space-y-8 md:space-y-12">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center sm:items-start md:items-center gap-6 text-center md:text-left pt-4">
                    <div className="space-y-1.5">
                        <div className="inline-flex items-center gap-3 text-blue-500 justify-center md:justify-start w-full">
                            <Users className="w-8 h-8 md:w-10 md:h-10 drop-shadow-[0_0_10px_var(--color-blue-500)]" />
                            <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white uppercase italic">
                                Elenco da Liga
                            </h1>
                        </div>
                        <p className="text-slate-500 text-[10px] md:text-xs font-black uppercase tracking-widest max-w-sm mx-auto md:mx-0">
                            Gerencie os {players?.length || 0} competidores registrados no sistema.
                        </p>
                    </div>

                    {isOperator && (
                        <div className="hidden md:block">
                            <PlayerForm />
                        </div>
                    )}
                </div>

                <div className="w-full relative">
                    {/* Botão de abrir form no mobile (apenas se for admin) */}
                    {isOperator && (
                        <div className="md:hidden w-full mb-8">
                            <PlayerForm />
                        </div>
                    )}

                    {/* Listagem de Jogadores */}
                    <div className="w-full flex-1">
                        {error ? (
                            <div className="bg-red-500/10 border border-red-500/20 p-8 text-center text-red-400 rounded-3xl backdrop-blur-xl">
                                <p className="font-bold uppercase tracking-widest text-sm">Erro ao carregar jogadores: {error}</p>
                            </div>
                        ) : !players || players.length === 0 ? (
                            <div className="bg-white/5 border border-white/10 p-16 text-center flex flex-col items-center rounded-[2.5rem] backdrop-blur-xl">
                                <Users className="h-16 w-16 text-slate-800 mb-6" />
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Nenhum jogador encontrado</h3>
                                <p className="text-slate-500 mt-2 font-bold text-xs uppercase tracking-widest">
                                    {isOperator ? 'Utilize o botão acima para registrar competidores.' : 'Aguarde o cadastro pela administração.'}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                                {players.map((player, idx) => {
                                    const totalMatches = player.matches_played || 0
                                    const wins = player.wins || 0
                                    const losses = totalMatches - wins
                                    const calcAprov = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0
                                    const aproveitamento = `${calcAprov}%`

                                    return (
                                        <div key={player.id} className="relative group bg-white/5 border border-white/5 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-2xl transition-all duration-300 hover:bg-white/10 hover:-translate-y-1">

                                            {/* Rank Indicator */}
                                            <div className="absolute top-6 left-6 flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-wider">
                                                <Trophy className="w-3 h-3" />
                                                #{idx + 1}
                                            </div>

                                            {/* Seletor de Ações Administrativas */}
                                            {(isOperator || isSuper) && (
                                                <div className="absolute top-6 right-6">
                                                    <PlayerListActions player={player} isSuperAdmin={isSuper} />
                                                </div>
                                            )}

                                            <div className="flex flex-col items-center mt-4">
                                                {/* Avatar */}
                                                <div className="w-28 h-28 rounded-full bg-slate-900 border-4 border-white/5 flex items-center justify-center font-black text-4xl text-slate-700 mb-4 group-hover:border-blue-500/50 transition-colors shadow-2xl overflow-hidden relative italic">
                                                    {player.photo_url ? (
                                                        <img src={player.photo_url} alt={player.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        player.name.charAt(0)
                                                    )}
                                                </div>

                                                {/* Nomes */}
                                                <div className="text-center h-14 flex flex-col justify-center px-2">
                                                    <div className="font-black text-white text-xl uppercase tracking-tighter italic group-hover:text-blue-400 transition-colors leading-tight">
                                                        {player.name}
                                                    </div>
                                                    {player.nickname && (
                                                        <div className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 mt-1.5 opacity-80 decoration-blue-500/30">
                                                            {player.nickname}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Stats Box */}
                                                <div className="w-full bg-white/[0.03] border border-white/5 rounded-3xl p-4 mt-6">
                                                    <div className="flex justify-between items-center text-center">
                                                        <div className="flex-1">
                                                            <div className="text-lg font-black text-emerald-400 italic leading-none">{wins}</div>
                                                            <div className="text-[8px] font-black uppercase tracking-widest text-slate-600 mt-2">V</div>
                                                        </div>
                                                        <div className="flex-1 border-x border-white/5">
                                                            <div className="text-lg font-black text-rose-500 italic leading-none">{losses}</div>
                                                            <div className="text-[8px] font-black uppercase tracking-widest text-slate-600 mt-2">D</div>
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="text-lg font-black text-slate-200 italic leading-none">{aproveitamento}</div>
                                                            <div className="text-[8px] font-black uppercase tracking-widest text-slate-600 mt-2">AP.</div>
                                                        </div>
                                                    </div>

                                                    {/* Progress Indicator */}
                                                    <div className="w-full h-1 bg-white/5 rounded-full mt-4 overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full"
                                                            style={{ width: aproveitamento }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
