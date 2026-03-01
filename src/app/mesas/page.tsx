import { isAdmin, isSuperAdmin } from '@/lib/auth'
import { getTables } from './actions'
import { TableForm } from './TableForm'
import { TableListActions } from './TableListActions'
import { LayoutDashboard } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function MesasPage() {
    const isOperator = await isAdmin()
    if (!isOperator) {
        redirect('/')
    }

    const isSuper = await isSuperAdmin()
    const { data: tables, error } = await getTables()

    const mapStatusText = (status: string) => {
        switch (status) {
            case 'available': return { label: 'Disponível', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' }
            case 'occupied': return { label: 'Ocupada', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' }
            case 'maintenance': return { label: 'Manutenção', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' }
            default: return { label: status, color: 'text-slate-400 bg-slate-400/10 border-slate-400/20' }
        }
    }

    return (
        <div className="w-full text-white animate-in fade-in duration-500 pb-20">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 md:p-8 space-y-8 md:space-y-12">
                <div className="flex flex-col md:flex-row justify-between items-center sm:items-start md:items-center gap-6 text-center md:text-left pt-4">
                    <div className="space-y-1.5">
                        <div className="inline-flex items-center gap-3 text-purple-500 justify-center md:justify-start w-full">
                            <LayoutDashboard className="w-8 h-8 md:w-10 md:h-10 drop-shadow-[0_0_10px_var(--color-purple-500)]" />
                            <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white uppercase italic">
                                Gerenciar Mesas
                            </h1>
                        </div>
                        <p className="text-slate-500 text-[10px] md:text-xs font-black uppercase tracking-widest max-w-md mx-auto md:mx-0">
                            Controle a disponibilidade e alocação dos jogos do estabelecimento.
                        </p>
                    </div>

                    {isOperator && (
                        <div className="hidden md:block">
                            <TableForm />
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-8">
                    {/* Botão de abrir form no mobile (apenas se for admin) */}
                    {isOperator && (
                        <div className="md:hidden w-full">
                            <TableForm />
                        </div>
                    )}

                    {/* Listagem de Mesas em Cards */}
                    <div className="w-full">
                        {error ? (
                            <div className="bg-red-500/10 border border-red-500/20 p-8 text-center text-red-400 rounded-3xl backdrop-blur-xl">
                                <p className="font-bold uppercase tracking-widest text-sm">Erro ao carregar mesas: {error}</p>
                            </div>
                        ) : !tables || tables.length === 0 ? (
                            <div className="bg-white/5 border border-white/10 p-16 text-center flex flex-col items-center rounded-[2.5rem] backdrop-blur-xl">
                                <LayoutDashboard className="h-16 w-16 text-slate-800 mb-6" />
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Nenhuma mesa cadastrada</h3>
                                <p className="text-slate-500 mt-2 font-bold text-xs uppercase tracking-widest">
                                    {isOperator ? 'Utilize o painel acima para registrar as mesas.' : 'Aguarde as mesas serem registradas.'}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                                {tables.map((table) => {
                                    const styleInfo = mapStatusText(table.status)
                                    return (
                                        <div key={table.id} className="relative group bg-white/5 border border-white/5 backdrop-blur-xl rounded-[2rem] p-6 shadow-2xl transition-all duration-300 hover:bg-white/10 hover:-translate-y-1">
                                            {/* Status Indicator Bar */}
                                            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-1 rounded-b-full shadow-[0_2px_10px_rgba(0,0,0,0.5)] ${table.status === 'available' ? 'bg-emerald-500' : table.status === 'occupied' ? 'bg-blue-500' : 'bg-amber-500'}`}></div>

                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Mesa</span>
                                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-900 text-white text-2xl font-black border border-white/10 shadow-inner italic">
                                                        {table.number}
                                                    </div>
                                                </div>

                                                <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] border shadow-sm ${styleInfo.color}`}>
                                                    {styleInfo.label}
                                                </span>
                                            </div>

                                            <div className="space-y-4">
                                                <div>
                                                    <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Identificação / Nick</div>
                                                    <div className="text-base font-black text-white truncate uppercase tracking-tight italic">
                                                        {table.name || '---'}
                                                    </div>
                                                </div>

                                                {isOperator && (
                                                    <div className="pt-4 border-t border-white/5 flex gap-2">
                                                        <TableListActions
                                                            tableId={table.id}
                                                            currentStatus={table.status}
                                                            isSuperAdmin={isSuper}
                                                            className="w-full bg-white/5 hover:bg-white/10 border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest h-11"
                                                        />
                                                    </div>
                                                )}
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
