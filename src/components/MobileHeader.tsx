'use client'

import { Settings, LogOut, Menu, Trophy, Swords, LayoutDashboard, Users, History, X, ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { useState } from 'react'
import { AppSettings } from '@/app/settings/actions'
import { SettingsDialog } from './SettingsDialog'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export function MobileHeader({
    appSettings,
    isSuperAdmin,
    isOperator,
    performLogoutAction
}: {
    appSettings?: AppSettings,
    isSuperAdmin?: boolean,
    isOperator?: boolean,
    performLogoutAction?: () => void
}) {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()
    const router = useRouter()

    const isSubPage = !['/dashboard', '/', '/ranking', '/torneios', '/jogadores', '/historico', '/mesas', '/financeiro', '/relatorios', '/configuracoes'].includes(pathname)


    const navItems = [
        { title: 'Início', href: '/dashboard', icon: LayoutDashboard },
        { title: 'Mesas', href: '/mesas', icon: Swords },
        { title: 'Torneios', href: '/torneios', icon: Trophy },
        { title: 'Ranking', href: '/ranking', icon: Trophy },
        { title: 'Jogadores', href: '/jogadores', icon: Users },
        { title: 'Histórico', href: '/historico', icon: History },
        { title: 'Financeiro', href: '/financeiro', icon: Trophy },
        { title: 'Relatórios', href: '/relatorios', icon: Trophy },
        { title: 'Configurações', href: '/configuracoes', icon: Settings },
    ]

    const filteredNavItems = navItems.filter(item => {
        const isAdminOnly = ['/financeiro', '/relatorios', '/configuracoes', '/mesas'].includes(item.href)
        if (isAdminOnly) return isOperator
        return true
    })

    return (
        <header className="md:hidden sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
                {isSubPage ? (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/5 rounded-xl"
                        onClick={() => router.back()}
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </Button>
                ) : (
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-white hover:bg-white/5 rounded-xl">
                                <Menu className="w-6 h-6" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="fixed inset-y-0 left-0 translate-x-0 translate-y-0 w-[280px] h-screen bg-slate-950/95 backdrop-blur-2xl border-r border-white/5 p-0 max-w-none rounded-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left duration-300">
                            <DialogHeader className="p-6 border-b border-white/5">
                                <div className="flex items-center gap-3">
                                    {appSettings?.app_logo_url ? (
                                        <div className="relative w-8 h-8">
                                            <Image src={appSettings.app_logo_url} alt="Logo" fill className="object-contain" unoptimized />
                                        </div>
                                    ) : (
                                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                            <span className="font-black text-white text-sm">{appSettings?.app_name.charAt(0) || 'A'}</span>
                                        </div>
                                    )}
                                    <div className="flex flex-col text-left">
                                        <DialogTitle className="font-black text-white text-sm tracking-tight leading-none">
                                            {appSettings?.app_name || 'Liga Sinuca'}
                                        </DialogTitle>
                                        <span className="text-[8px] uppercase text-muted-foreground font-bold tracking-widest mt-0.5">
                                            Navegação
                                        </span>
                                    </div>
                                </div>
                            </DialogHeader>

                            <nav className="flex-col gap-1 p-4 pb-20 overflow-y-auto h-full flex">
                                {filteredNavItems.map((item) => {
                                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setIsOpen(false)}
                                            className={cn(
                                                "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 font-black uppercase tracking-widest text-[10px]",
                                                isActive
                                                    ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(var(--color-primary),0.1)]"
                                                    : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                                            )}
                                        >
                                            <item.icon className={cn("w-4 h-4", isActive && "drop-shadow-[0_0_8px_var(--color-primary)]")} />
                                            {item.title}
                                        </Link>
                                    )
                                })}
                            </nav>

                            <div className="mt-auto p-6 border-t border-white/5 bg-black/20">
                                <p className="text-[8px] text-slate-600 font-black uppercase tracking-[0.3em] text-center">
                                    {appSettings?.app_subtitle || 'Gestão de Torneios'} v2.0
                                </p>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}

                <div className="flex flex-col">
                    <span className="font-black text-white text-xs tracking-tight leading-none">
                        {appSettings?.app_name || 'Liga Sinuca'}
                    </span>
                    <span className="text-[7px] uppercase text-muted-foreground font-bold tracking-widest mt-0.5">
                        {appSettings?.app_subtitle || 'Torneios'}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {appSettings && isSuperAdmin !== undefined && (
                    <SettingsDialog appSettings={appSettings} isSuperAdmin={isSuperAdmin}>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
                            <Settings className="w-5 h-5" />
                        </Button>
                    </SettingsDialog>
                )}

                {!isOperator && (
                    <Button variant="ghost" size="icon" asChild className="text-muted-foreground hover:text-white">
                        <Link href="/login">
                            <Users className="w-5 h-5" />
                        </Link>
                    </Button>
                )}

                {isOperator && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => performLogoutAction?.()}
                        className="text-muted-foreground hover:text-destructive"
                    >
                        <LogOut className="w-5 h-5" />
                    </Button>
                )}
            </div>
        </header>
    )
}
