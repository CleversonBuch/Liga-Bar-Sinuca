'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginAdmin } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowRight, LockKeyhole, UserCog } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function LoginPage() {
    const [pin, setPin] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        const result = await loginAdmin(pin)

        if (result.success) {
            toast.success('Acesso Liberado!')
            router.push('/')
        } else {
            toast.error(result.error || 'Senha incorreta.')
            setPin('')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-950 p-4">

            {/* Efeitos de Fundo (Backdrop Blur e Radiais) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 blur-[150px] rounded-full pointer-events-none z-0"></div>

            <div className="relative z-10 w-full max-w-md">

                {/* Cabeçalho */}
                <div className="text-center mb-10 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="mx-auto w-20 h-20 bg-background/50 border border-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-2xl backdrop-blur-md relative">
                        <div className="absolute inset-0 bg-primary/10 flex items-center justify-center rounded-2xl animate-pulse">
                            <LockKeyhole className="w-10 h-10 text-primary drop-shadow-[0_0_15px_var(--color-primary)]" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter drop-shadow-md">
                        Acesso Restrito
                    </h1>
                    <p className="text-muted-foreground mt-2 font-medium">
                        Insira seu PIN de operador para alterar dados.
                    </p>
                </div>

                {/* Formulário */}
                <div className="bg-card/40 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl shadow-2xl animate-in slide-in-from-bottom-8 duration-700 delay-100">
                    <form onSubmit={handleLogin} className="space-y-6">

                        <div className="space-y-2 relative">
                            <Input
                                type="password"
                                inputMode="numeric"
                                placeholder="PIN de Acesso"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                className="w-full h-14 bg-background/50 border-white/10 text-center text-2xl tracking-[0.5em] font-black text-white rounded-xl focus-visible:ring-primary placeholder:tracking-normal placeholder:font-medium placeholder:text-muted-foreground/50 transition-all placeholder-shown:tracking-normal"
                                required
                                autoFocus
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading || pin.length < 4}
                            className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-lg uppercase tracking-wide shadow-[0_0_30px_var(--color-primary)]/40 rounded-xl transition-all group"
                        >
                            {loading ? (
                                'Verificando...'
                            ) : (
                                <span className="flex items-center gap-2">
                                    Entrar no Sistema
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 text-center pt-6 border-t border-white/5 flex gap-2 justify-center">
                        <Link href="/" className="text-sm font-semibold text-muted-foreground hover:text-white transition-colors underline-offset-4 hover:underline">
                            Voltar para Inicio
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
