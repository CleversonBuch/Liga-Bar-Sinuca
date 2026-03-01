"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateAppSettings, uploadAppLogo, AppSettings } from "@/app/settings/actions"
import { toast } from "sonner"
import { Camera, Loader2 } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

export function SettingsDialog({
    children,
    appSettings,
    isSuperAdmin
}: {
    children: React.ReactNode
    appSettings: AppSettings
    isSuperAdmin: boolean
}) {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState(appSettings.app_name)
    const [subtitle, setSubtitle] = useState(appSettings.app_subtitle)
    const [isSaving, setIsSaving] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const router = useRouter()

    // Se não for super admin, apenas renderiza os children normalmente (não engatilhar o dialog)
    if (!isSuperAdmin) {
        return <>{children}</>
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const res = await updateAppSettings(name, subtitle)
            if (res.success) {
                toast.success("Configurações atualizadas!")
                setOpen(false)
                router.refresh()
            } else {
                toast.error(res.error || "Erro ao salvar")
            }
        } catch (error) {
            toast.error("Erro inesperado.")
            console.error(error)
        } finally {
            setIsSaving(false)
        }
    }

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        try {
            const formData = new FormData()
            formData.append('logo', file)

            const res = await uploadAppLogo(formData)
            if (res.success) {
                toast.success("Logo atualizado!")
                router.refresh()
            } else {
                toast.error(res.error || "Erro ao enviar logo")
            }
        } catch (error) {
            toast.error("Erro inesperado no upload.")
            console.error(error)
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div role="button" tabIndex={0} className="cursor-pointer group relative block w-full">
                    {children}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl pointer-events-none">
                        <span className="text-white text-xs font-bold ring-1 ring-white/50 px-2 py-1 rounded-full bg-black/50 backdrop-blur-md">
                            Editar
                        </span>
                    </div>
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Configurações do Aplicativo</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 pt-4">
                    {/* Logo Section */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative w-full max-w-[200px] h-32 rounded-2xl overflow-hidden bg-primary/10 border border-primary/20 flex flex-col items-center justify-center group">
                            {appSettings.app_logo_url ? (
                                <Image
                                    src={appSettings.app_logo_url}
                                    alt="App Logo"
                                    fill
                                    className="object-contain p-2"
                                    unoptimized
                                />
                            ) : (
                                <span className="font-black text-primary text-5xl">{name.charAt(0)}</span>
                            )}

                            <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer">
                                {isUploading ? (
                                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                                ) : (
                                    <>
                                        <Camera className="w-6 h-6 text-white mb-1" />
                                        <span className="text-[10px] text-white font-bold uppercase tracking-wider">Alterar</span>
                                    </>
                                )}
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/png, image/jpeg, image/webp"
                                    onChange={handleLogoUpload}
                                    disabled={isUploading}
                                />
                            </label>
                        </div>
                        <p className="text-xs text-muted-foreground">Clique na imagem para alterar o logo.</p>
                    </div>

                    {/* Text Settings */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="appName">Nome Principal</Label>
                            <Input
                                id="appName"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="A.C.L.S"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="appSubtitle">Subtítulo</Label>
                            <Input
                                id="appSubtitle"
                                value={subtitle}
                                onChange={(e) => setSubtitle(e.target.value)}
                                placeholder="Torneios"
                            />
                        </div>
                    </div>

                    <Button
                        onClick={handleSave}
                        className="w-full"
                        disabled={isSaving || isUploading}
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Salvar Alterações
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
