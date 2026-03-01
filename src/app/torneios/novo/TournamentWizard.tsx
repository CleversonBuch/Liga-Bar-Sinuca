'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createTournament } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { Trophy, Swords, DollarSign, Users, ChevronRight, ChevronLeft, Clock } from 'lucide-react'

// Recebe jogadores do banco como prop
export function TournamentWizard({ players }: { players: any[] }) {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)

    // Estados locais do Wizard
    const [modality, setModality] = useState('3_bolinhas')
    const [format, setFormat] = useState('single_elimination')
    const [bracketType, setBracketType] = useState('random')
    const [entryFee, setEntryFee] = useState('50')
    const [selectedPlayers, setSelectedPlayers] = useState<string[]>([])

    const totalArrecadado = parseFloat(entryFee || '0') * selectedPlayers.length

    // Calculadora Automática de Partidas/Tempo
    const totalPlayersNum = selectedPlayers.length
    let estimatedMatches = 0
    if (totalPlayersNum >= 4) {
        if (format === 'single_elimination') {
            estimatedMatches = totalPlayersNum - 1
        } else if (format === 'double_elimination') {
            estimatedMatches = Math.floor(totalPlayersNum * 1.5)
        } else if (format === 'all_vs_all') {
            estimatedMatches = (totalPlayersNum * (totalPlayersNum - 1)) / 2
        }
    }
    const minsPerMatch = modality === '3_bolinhas' ? 15 : 25
    const estimatedTimeMinutes = estimatedMatches * minsPerMatch
    const estimatedHours = Math.floor(estimatedTimeMinutes / 60)
    const estimatedMins = estimatedTimeMinutes % 60
    const formattedTime = `${estimatedHours > 0 ? `${estimatedHours}h` : ''} ${estimatedMins}m`

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (selectedPlayers.length < 4) {
            toast.error('Selecione pelo menos 4 jogadores para iniciar.')
            return
        }

        setLoading(true)
        const formData = new FormData()
        formData.append('modality', modality)
        formData.append('format', format)
        if (format !== 'all_vs_all') formData.append('bracket_type', bracketType)
        formData.append('entry_fee', entryFee)
        selectedPlayers.forEach(id => formData.append('player_ids', id))

        const result = await createTournament(formData)
        setLoading(false)

        if (result.success && result.url) {
            toast.success('Torneio criado com sucesso! Sorteio realizado.')
            router.push(result.url)
        } else {
            toast.error(result.error || 'Erro ao criar o torneio.')
        }
    }

    const togglePlayer = (id: string) => {
        setSelectedPlayers(prev =>
            prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
        )
    }

    return (
        <div className="bg-white/5 border border-white/5 backdrop-blur-xl rounded-[2.5rem] p-5 md:p-10 shadow-2xl w-full max-w-4xl mx-auto mt-4 md:mt-8">

            {/* ProgressBar */}
            <div className="flex items-center justify-between mb-10 relative px-2">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-white/5 w-full z-0 rounded-full"></div>
                <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 z-0 rounded-full transition-all duration-500 shadow-[0_0_10px_var(--color-emerald-500)]"
                    style={{ width: `${((step - 1) / 3) * 100}%` }}
                ></div>

                {[
                    { num: 1, icon: Trophy, label: 'Regras' },
                    { num: 2, icon: Swords, label: 'Formato' },
                    { num: 3, icon: DollarSign, label: 'Financeiro' },
                    { num: 4, icon: Users, label: 'Jogadores' },
                ].map((item) => (
                    <div key={item.num} className="relative z-10 flex flex-col items-center gap-2 px-1">
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 ${step >= item.num ? 'border-emerald-500 bg-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'border-white/10 bg-slate-900 text-slate-500'}`}>
                            <item.icon className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <span className={`text-[10px] md:text-xs font-black uppercase tracking-widest hidden sm:block ${step >= item.num ? 'text-emerald-400' : 'text-slate-600'}`}>{item.label}</span>
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 min-h-[450px] flex flex-col justify-between">

                {/* STEP 1: Modalidade */}
                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="space-y-2 mb-8 text-center md:text-left">
                            <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter italic">1. Qual a modalidade?</h2>
                            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Escolha o tipo de jogo para esta noite</p>
                        </div>
                        <RadioGroup value={modality} onValueChange={setModality} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className={`group relative border-2 rounded-3xl p-6 cursor-pointer transition-all duration-300 ${modality === '3_bolinhas' ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 'border-white/5 bg-white/5 hover:border-white/10'}`} onClick={() => setModality('3_bolinhas')}>
                                <RadioGroupItem value="3_bolinhas" id="3_bolinhas" className="sr-only" />
                                <Label htmlFor="3_bolinhas" className="cursor-pointer">
                                    <div className={`text-xl font-black uppercase tracking-tighter mb-2 transition-colors ${modality === '3_bolinhas' ? 'text-emerald-400' : 'text-white'}`}>3 Bolinhas</div>
                                    <p className="text-slate-400 text-sm font-medium leading-relaxed">A clássica sinuquinha de bar. Partidas rápidas e dinâmicas para quem gosta de ação.</p>
                                </Label>
                                {modality === '3_bolinhas' && <div className="absolute top-4 right-4 w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_var(--color-emerald-500)]"></div>}
                            </div>
                            <div className={`group relative border-2 rounded-3xl p-6 cursor-pointer transition-all duration-300 ${modality === 'bola_8' ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_30px_rgba(59,130,246,0.1)]' : 'border-white/5 bg-white/5 hover:border-white/10'}`} onClick={() => setModality('bola_8')}>
                                <RadioGroupItem value="bola_8" id="bola_8" className="sr-only" />
                                <Label htmlFor="bola_8" className="cursor-pointer">
                                    <div className={`text-xl font-black uppercase tracking-tighter mb-2 transition-colors ${modality === 'bola_8' ? 'text-blue-400' : 'text-white'}`}>Bola 8</div>
                                    <p className="text-slate-400 text-sm font-medium leading-relaxed">Modo oficial (ímpares e pares). Partidas mais táticas para quem joga com estratégia.</p>
                                </Label>
                                {modality === 'bola_8' && <div className="absolute top-4 right-4 w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_var(--color-blue-500)]"></div>}
                            </div>
                        </RadioGroup>
                    </div>
                )}

                {/* STEP 2: Formato */}
                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="space-y-2 mb-8 text-center md:text-left">
                            <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter italic">2. Formato e Chaveamento</h2>
                            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Como será a disputa do troféu?</p>
                        </div>
                        <div className="space-y-8">
                            <RadioGroup value={format} onValueChange={setFormat} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className={`relative border-2 rounded-2xl p-5 cursor-pointer transition-all ${format === 'single_elimination' ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/5 bg-white/5 hover:border-white/10'}`} onClick={() => setFormat('single_elimination')}>
                                    <RadioGroupItem value="single_elimination" id="se" className="sr-only" />
                                    <Label htmlFor="se" className="cursor-pointer">
                                        <div className="font-black text-white uppercase tracking-tighter mb-1">Mata-Mata</div>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-tight">Eliminação direta. Perdeu, tchau.</p>
                                    </Label>
                                </div>
                                <div className={`relative border-2 rounded-2xl p-5 cursor-pointer transition-all ${format === 'double_elimination' ? 'border-amber-500 bg-amber-500/10' : 'border-white/5 bg-white/5 hover:border-white/10'}`} onClick={() => setFormat('double_elimination')}>
                                    <RadioGroupItem value="double_elimination" id="de" className="sr-only" />
                                    <Label htmlFor="de" className="cursor-pointer">
                                        <div className="font-black text-white uppercase tracking-tighter mb-1">Double Elim</div>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-tight">Chance de volta pela repescagem.</p>
                                    </Label>
                                </div>
                                <div className={`relative border-2 rounded-2xl p-5 cursor-pointer transition-all ${format === 'all_vs_all' ? 'border-purple-500 bg-purple-500/10' : 'border-white/5 bg-white/5 hover:border-white/10'}`} onClick={() => setFormat('all_vs_all')}>
                                    <RadioGroupItem value="all_vs_all" id="ava" className="sr-only" />
                                    <Label htmlFor="ava" className="cursor-pointer">
                                        <div className="font-black text-white uppercase tracking-tighter mb-1">Liga</div>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-tight">Pontos corridos. Todos se enfrentam.</p>
                                    </Label>
                                </div>
                            </RadioGroup>

                            {format !== 'all_vs_all' && (
                                <div className="bg-slate-950/50 backdrop-blur-md p-6 rounded-3xl border border-white/5 mt-4">
                                    <h3 className="text-xs font-black text-slate-600 mb-5 uppercase tracking-[0.2em]">Distribuição da Chave</h3>
                                    <RadioGroup value={bracketType} onValueChange={setBracketType} className="flex flex-col sm:flex-row gap-6">
                                        <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setBracketType('random')}>
                                            <RadioGroupItem value="random" id="random" className="border-white/20 text-emerald-500 w-5 h-5" />
                                            <Label htmlFor="random" className="text-white font-bold uppercase tracking-widest text-[10px] cursor-pointer group-hover:text-emerald-400 transition-colors">Sorteio a cada Rodada</Label>
                                        </div>
                                        <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setBracketType('fixed')}>
                                            <RadioGroupItem value="fixed" id="fixed" className="border-white/20 text-emerald-500 w-5 h-5" />
                                            <Label htmlFor="fixed" className="text-white font-bold uppercase tracking-widest text-[10px] cursor-pointer group-hover:text-emerald-400 transition-colors">Chave Fixa Padrão</Label>
                                        </div>
                                    </RadioGroup>
                                    <p className="text-[10px] text-slate-600 mt-6 italic font-medium">* No Mata-Mata, a regra do BYE (Chapéu) é aplicada automaticamente para balancear a chave.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* STEP 3: Financeiro */}
                {step === 3 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="space-y-2 mb-8 text-center md:text-left">
                            <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter italic">3. Financeiro</h2>
                            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Configuração de taxas e rateio</p>
                        </div>

                        <div className="space-y-8">
                            <div className="bg-slate-950/50 backdrop-blur-md p-8 rounded-[2rem] border border-white/5">
                                <Label className="text-xs font-black text-slate-600 uppercase tracking-[0.2em] mb-4 block">Valor da Inscrição (por jogador)</Label>
                                <div className="relative">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 text-2xl font-black italic">R$</span>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="5"
                                        value={entryFee}
                                        onChange={(e) => setEntryFee(e.target.value)}
                                        className="pl-20 text-4xl font-black h-20 bg-white/5 border-white/5 text-emerald-400 focus-visible:ring-emerald-500 rounded-2xl italic shadow-inner"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center">
                                    <div className="text-2xl font-black text-emerald-400 italic leading-none">65%</div>
                                    <div className="text-[9px] text-slate-500 mt-2 font-black uppercase tracking-widest">Prêmio 1º</div>
                                </div>
                                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center">
                                    <div className="text-2xl font-black text-blue-400 italic leading-none">20%</div>
                                    <div className="text-[9px] text-slate-500 mt-2 font-black uppercase tracking-widest">Fundo Mensal</div>
                                </div>
                                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center">
                                    <div className="text-2xl font-black text-amber-400 italic leading-none">10%</div>
                                    <div className="text-[9px] text-slate-500 mt-2 font-black uppercase tracking-widest">Fundo Anual</div>
                                </div>
                                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center">
                                    <div className="text-2xl font-black text-purple-400 italic leading-none">5%</div>
                                    <div className="text-[9px] text-slate-500 mt-2 font-black uppercase tracking-widest">Fundo Bar</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 4: Seleção de Jogadores */}
                {step === 4 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="flex flex-col sm:flex-row justify-between items-center md:items-end gap-4 mb-8 text-center sm:text-left">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter italic">4. Jogadores</h2>
                                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Quem vai para o pano hoje? (Mínimo: 4)</p>
                            </div>
                            <div className="bg-white/5 px-6 py-2 rounded-2xl border border-white/5">
                                <div className="text-3xl font-black text-emerald-400 italic leading-tight">{selectedPlayers.length}</div>
                                <div className="text-[9px] text-slate-600 font-black uppercase tracking-[0.2em]">Inscritos</div>
                            </div>
                        </div>

                        <div className="bg-slate-950/40 border border-white/5 rounded-[2rem] p-4 max-h-[350px] overflow-y-auto mb-8 custom-scrollbar">
                            {players.length === 0 ? (
                                <div className="text-center py-12">
                                    <Users className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                                    <p className="text-slate-600 font-bold uppercase tracking-widest text-[10px]">Nenhum jogador cadastrado no sistema.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {players.map(player => (
                                        <Label
                                            key={player.id}
                                            htmlFor={player.id}
                                            className={`flex items-center space-x-3 border-2 rounded-xl p-4 cursor-pointer transition-all duration-300 ${selectedPlayers.includes(player.id) ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-white/5 bg-white/5 hover:border-white/10'}`}
                                        >
                                            <Checkbox
                                                id={player.id}
                                                checked={selectedPlayers.includes(player.id)}
                                                onCheckedChange={() => togglePlayer(player.id)}
                                                className="w-5 h-5 border-white/20 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 rounded-lg"
                                            />
                                            <div className="flex flex-col min-w-0">
                                                <span className={`font-black uppercase tracking-tight text-sm truncate ${selectedPlayers.includes(player.id) ? 'text-emerald-400' : 'text-white'}`}>{player.name}</span>
                                                {player.nickname && <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest truncate italic">"{player.nickname}"</span>}
                                            </div>
                                        </Label>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Resumo Financeiro Real-Time */}
                        {selectedPlayers.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-bottom-2 duration-500">
                                <div className="bg-emerald-500/5 border border-emerald-500/20 backdrop-blur-xl rounded-[2rem] p-6 flex justify-between items-center group overflow-hidden">
                                    <div className="relative z-10">
                                        <div className="text-[10px] text-emerald-500/60 font-black uppercase tracking-[0.2em] mb-1">Arrecadação Total</div>
                                        <div className="text-3xl font-black text-white italic leading-tight">R$ {totalArrecadado.toFixed(2)}</div>
                                    </div>
                                    <div className="relative z-10 text-right">
                                        <div className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.2em] mb-1">Prêmio 1º</div>
                                        <div className="text-3xl font-black text-emerald-400 italic leading-tight shadow-[0_0_20px_rgba(16,185,129,0.2)]">R$ {(totalArrecadado * 0.65).toFixed(2)}</div>
                                    </div>
                                    <Trophy className="absolute -right-4 -bottom-4 w-24 h-24 text-emerald-500 opacity-[0.03] rotate-12" />
                                </div>
                                <div className="bg-blue-500/5 border border-blue-500/20 backdrop-blur-xl rounded-[2rem] p-6 flex justify-between items-center group overflow-hidden">
                                    <div className="relative z-10">
                                        <div className="text-[10px] text-blue-500/60 font-black uppercase tracking-[0.2em] mb-1">Total de Partidas</div>
                                        <div className="text-3xl font-black text-white italic leading-tight">{estimatedMatches}</div>
                                    </div>
                                    <div className="relative z-10 text-right">
                                        <div className="text-[10px] text-blue-500 font-black uppercase tracking-[0.2em] mb-1">Tempo Estimado</div>
                                        <div className="text-3xl font-black text-blue-400 italic leading-tight">{formattedTime}</div>
                                    </div>
                                    <Clock className="absolute -right-4 -bottom-4 w-24 h-24 text-blue-500 opacity-[0.03] -rotate-12" />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Footer Navigation */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-white/5 mt-auto">
                    {step > 1 ? (
                        <Button type="button" variant="ghost" onClick={() => setStep(step - 1)} className="w-full sm:w-auto font-black uppercase tracking-widest text-[10px] text-slate-500 hover:text-white hover:bg-white/5 rounded-2xl h-14 min-w-[140px]">
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Passo Anterior
                        </Button>
                    ) : <div className="hidden sm:block"></div>}

                    {step < 4 ? (
                        <Button type="button" onClick={() => setStep(step + 1)} className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black uppercase tracking-widest text-[10px] h-14 min-w-[200px] rounded-[1.25rem] shadow-xl shadow-emerald-500/10 transition-all hover:scale-[1.02]">
                            Próximo Passo
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button type="submit" disabled={loading || selectedPlayers.length < 4} className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase tracking-widest text-[11px] h-14 min-w-[280px] rounded-[1.25rem] shadow-2xl shadow-emerald-500/30 transition-all hover:scale-[1.02] border-t border-white/20">
                            {loading ? 'Preparando Chaves...' : 'Gerar Chaveamento e Começar!'}
                            <Swords className="w-5 h-5 ml-3" />
                        </Button>
                    )}
                </div>
            </form>
        </div>
    )
}
