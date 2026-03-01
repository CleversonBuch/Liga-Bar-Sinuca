'use client'

import { useState, useRef, useEffect } from 'react'
import { addPlayer, editPlayer } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { UserPlus, Camera, Upload, Image as ImageIcon, Pencil } from 'lucide-react'

// Definindo o tipo base de player que precisamos
type PlayerFormProps = {
    player?: {
        id: string;
        name: string;
        nickname?: string | null;
        photo_url?: string | null;
    };
    children?: React.ReactNode;
}

export function PlayerForm({ player, children }: PlayerFormProps) {
    const isEditMode = !!player

    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [photoPreview, setPhotoPreview] = useState<string | null>(player?.photo_url || null)
    const [clearPhoto, setClearPhoto] = useState(false)

    // Resetar estado quando modal fecha ou abre
    useEffect(() => {
        if (open) {
            setPhotoPreview(player?.photo_url || null)
            setClearPhoto(false)
        }
    }, [open, player])

    // Referências ocultas para os inputs de arquivo
    const fileInputRef = useRef<HTMLInputElement>(null)
    const cameraInputRef = useRef<HTMLInputElement>(null)

    // Lida com o processamento da imagem (Redimensionar e Base64)
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            const result = event.target?.result as string

            // Usar Canvas para redimensionar e não explodir o DB
            const img = new Image()
            img.onload = () => {
                const canvas = document.createElement('canvas')
                const MAX_WIDTH = 400
                const MAX_HEIGHT = 400
                let width = img.width
                let height = img.height

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width
                        width = MAX_WIDTH
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height
                        height = MAX_HEIGHT
                    }
                }

                canvas.width = width
                canvas.height = height
                const ctx = canvas.getContext('2d')
                ctx?.drawImage(img, 0, 0, width, height)

                // Qualidade 80% JPEG
                const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.8)
                setPhotoPreview(resizedDataUrl)
            }
            img.src = result
        }
        reader.readAsDataURL(file)
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        if (photoPreview && photoPreview !== player?.photo_url) {
            formData.append('photoBase64', photoPreview)
        }
        if (clearPhoto) {
            formData.append('clearPhoto', 'true')
        }

        const result = isEditMode
            ? await editPlayer(player.id, formData)
            : await addPlayer(formData)

        setLoading(false)

        if (result.success) {
            toast.success(isEditMode ? 'Jogador atualizado com sucesso!' : 'Jogador adicionado com sucesso!')
            setOpen(false)
        } else {
            toast.error(result.error || `Erro ao ${isEditMode ? 'atualizar' : 'adicionar'} jogador.`)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children ? (
                    children
                ) : (
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_var(--color-primary)]/30 border border-primary/50 transition-all rounded-full px-6 font-bold uppercase tracking-wide">
                        <UserPlus className="w-5 h-5 mr-2" />
                        Adicionar Jogador
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="bg-card/95 backdrop-blur-xl border-white/10 shadow-2xl sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-primary/20 p-2.5 rounded-xl border border-primary/30 shadow-[0_0_15px_var(--color-primary)]/20">
                            {isEditMode ? (
                                <Pencil className="w-6 h-6 text-primary drop-shadow-[0_0_8px_var(--color-primary)]" />
                            ) : (
                                <UserPlus className="w-6 h-6 text-primary drop-shadow-[0_0_8px_var(--color-primary)]" />
                            )}
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-black tracking-tight text-white mb-1">
                                {isEditMode ? 'Editar Jogador' : 'Novo Jogador'}
                            </DialogTitle>
                            <DialogDescription className="text-muted-foreground text-sm font-medium">
                                {isEditMode
                                    ? 'Atualize os dados e a aparência do atleta.'
                                    : 'Registre um novo guerreiro para as mesas da Liga Sinuca.'}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    {/* Campos de Texto */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-slate-300 font-bold uppercase tracking-widest text-[10px]">Nome Completo</Label>
                            <Input
                                name="name"
                                defaultValue={player?.name || ''}
                                placeholder="Ex: João da Silva"
                                required
                                className="bg-background/50 border-white/10 text-white focus-visible:ring-primary h-12 rounded-xl"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-300 font-bold uppercase tracking-widest text-[10px]">Apelido na Mesa (Opcional)</Label>
                            <Input
                                name="nickname"
                                defaultValue={player?.nickname || ''}
                                placeholder="Ex: Joãozinho Rei da Oito"
                                className="bg-background/50 border-white/10 text-white focus-visible:ring-primary h-12 rounded-xl"
                            />
                        </div>
                    </div>

                    {/* Secção da Foto */}
                    <div className="space-y-3 pt-2">
                        <Label className="text-slate-300 font-bold uppercase tracking-widest text-[10px]">Foto de Perfil</Label>

                        <div className="flex flex-col items-center gap-4">
                            {/* Preview Circular */}
                            <div className="w-28 h-28 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center overflow-hidden shadow-inner relative group">
                                {photoPreview && !clearPhoto ? (
                                    <>
                                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                        <div
                                            className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                            onClick={() => {
                                                setPhotoPreview(null)
                                                setClearPhoto(true)
                                            }}
                                        >
                                            <span className="text-xs font-bold text-white uppercase">Remover</span>
                                        </div>
                                    </>
                                ) : (
                                    <ImageIcon className="w-10 h-10 text-muted-foreground/30" />
                                )}
                            </div>

                            {/* Botões Ocultos de File Input */}
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handlePhotoChange}
                                className="hidden"
                            />
                            <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                ref={cameraInputRef}
                                onChange={handlePhotoChange}
                                className="hidden"
                            />

                            {/* Ações Visíveis */}
                            <div className="flex gap-2 w-full">
                                <Button type="button" variant="outline" className="flex-1 border-white/10 bg-white/5 hover:bg-white/10" onClick={() => cameraInputRef.current?.click()}>
                                    <Camera className="w-4 h-4 mr-2 text-blue-400" />
                                    Tirar Foto
                                </Button>
                                <Button type="button" variant="outline" className="flex-1 border-white/10 bg-white/5 hover:bg-white/10" onClick={() => fileInputRef.current?.click()}>
                                    <Upload className="w-4 h-4 mr-2 text-emerald-400" />
                                    Galeria
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/5">
                        <Button
                            type="submit"
                            disabled={loading || !open}
                            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-lg uppercase tracking-wide shadow-[0_0_20px_var(--color-primary)]/30 rounded-xl transition-all"
                        >
                            {loading ? 'Processando...' : (isEditMode ? 'Salvar Alterações' : 'Adicionar Jogador')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

