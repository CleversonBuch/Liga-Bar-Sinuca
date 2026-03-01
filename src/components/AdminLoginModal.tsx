'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginAdmin } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Lock, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'

export function AdminLoginModal({ isCompact = false }: { isCompact?: boolean }) {
    const [open, setOpen] = useState(false)
    const [pin, setPin] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        try {
            const result = await loginAdmin(pin)
            if (result.success) {
                toast.success("Acesso Administrativo Liberado!")
                setOpen(false)
                setPin('')
                router.refresh()
            } else {
                toast.error(result.error || "Senha Incorreta.")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {isCompact ? (
                    <Button variant="ghost" size="icon" className="w-full text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10" title="Acesso Operador">
                        <Lock className="w-5 h-5" />
                    </Button>
                ) : (
                    <Button variant="outline" className="w-full justify-start border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300">
                        <Lock className="w-4 h-4 mr-2" />
                        Acesso Operador
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-white">
                <DialogHeader>
                    <div className="flex justify-center mb-4 mt-2">
                        <div className="rounded-full bg-emerald-500/10 p-3">
                            <ShieldAlert className="h-8 w-8 text-emerald-500" />
                        </div>
                    </div>
                    <DialogTitle className="text-xl text-center">Acesso Restrito</DialogTitle>
                    <DialogDescription className="text-center text-slate-400">
                        Digite a senha para gerenciar torneios e dados do sistema.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleLogin} className="space-y-4 py-4">
                    <Input
                        type="password"
                        placeholder="Senha de acesso..."
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        className="text-center text-lg tracking-widest bg-slate-950 border-slate-700 text-white focus-visible:ring-emerald-500"
                        autoFocus
                        maxLength={10}
                        required
                    />
                    <DialogFooter className="sm:justify-center">
                        <Button
                            type="submit"
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                            disabled={loading}
                        >
                            {loading ? "Validando..." : "Desbloquear"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
