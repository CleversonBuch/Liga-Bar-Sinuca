'use client'

import { useState, useTransition } from 'react'
import { Pencil, Check, X, CalendarDays } from 'lucide-react'
import { updateEventBanner } from '@/app/dashboard/actions'

interface EventBannerProps {
    initialText: string
    isAdmin: boolean
    hasActiveTournament: boolean
    tournamentName?: string
    tournamentModality?: string
}

export function EventBanner({ initialText, isAdmin, hasActiveTournament, tournamentName, tournamentModality }: EventBannerProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [text, setText] = useState(initialText)
    const [savedText, setSavedText] = useState(initialText)
    const [isPending, startTransition] = useTransition()

    // If there's an active tournament, show the tournament card (non-editable event info)
    if (hasActiveTournament) {
        return null // Tournament card is handled separately
    }

    const handleSave = () => {
        startTransition(async () => {
            const result = await updateEventBanner(text.trim())
            if (result.success) {
                setSavedText(text.trim())
                setIsEditing(false)
            }
        })
    }

    const handleCancel = () => {
        setText(savedText)
        setIsEditing(false)
    }

    const displayText = savedText || ''
    const hasContent = displayText.length > 0

    return (
        <div className={`relative group rounded-[2.5rem] p-6 shadow-2xl overflow-hidden transition-all duration-500 ${hasContent
                ? 'bg-gradient-to-br from-[#2A1A00] to-[#1A0F00] border-2 border-[#FF8C00]/40 event-banner-pulse'
                : 'bg-gradient-to-br from-[#1A1200] to-[#0F0A00] border border-[#FF8C00]/20'
            }`}>
            {/* Orange glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#FF8C00]/10 rounded-full blur-[60px] pointer-events-none -mr-10 -mt-10" />

            <div className="relative z-10">
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                        <div className="p-2.5 bg-[#FF8C00]/15 rounded-xl">
                            <CalendarDays className="w-5 h-5 text-[#FF8C00]" />
                        </div>
                        <span className="text-[10px] font-black text-[#FF8C00] uppercase tracking-[0.2em]">
                            Próximo Evento
                        </span>
                    </div>

                    {/* Edit button (admin only) */}
                    {isAdmin && !isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="p-2 bg-[#FF8C00]/10 hover:bg-[#FF8C00]/20 rounded-xl transition-all text-[#FF8C00] opacity-60 hover:opacity-100"
                            title="Editar informações do evento"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Content */}
                {isEditing ? (
                    <div className="space-y-3">
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Ex: Torneio Bola 8 — Sábado 15/03 às 19h&#10;Inscrições abertas! R$20 por atleta"
                            className="w-full bg-black/30 border border-[#FF8C00]/30 rounded-xl p-3 text-white text-sm font-medium placeholder:text-white/20 focus:outline-none focus:border-[#FF8C00]/60 resize-none min-h-[80px]"
                            rows={3}
                            autoFocus
                        />
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={handleCancel}
                                disabled={isPending}
                                className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest transition-all"
                            >
                                <X className="w-3.5 h-3.5" /> Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isPending}
                                className="flex items-center gap-1.5 px-4 py-2 bg-[#FF8C00] hover:bg-[#FF9F1C] rounded-xl text-[10px] font-black text-black uppercase tracking-widest transition-all disabled:opacity-50"
                            >
                                <Check className="w-3.5 h-3.5" /> {isPending ? 'Salvando...' : 'Salvar'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div>
                        {hasContent ? (
                            <p className="text-white font-bold text-sm leading-relaxed whitespace-pre-line">
                                {displayText}
                            </p>
                        ) : (
                            <div>
                                <h3 className="text-2xl md:text-3xl font-black text-white/30 tracking-tighter uppercase italic">
                                    Sem Evento
                                </h3>
                                <p className="text-muted-foreground text-xs font-black uppercase mt-2 tracking-widest">
                                    {isAdmin ? 'Toque no ícone ✏️ para adicionar informações' : 'Aguardando novo evento'}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
