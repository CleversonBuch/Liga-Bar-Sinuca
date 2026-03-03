"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Users,
    Swords,
    Trophy,
    History,
    DollarSign,
    Settings,
    LogOut,
    MonitorPlay
} from 'lucide-react'
import { cn } from '@/lib/utils'

type SidebarItem = {
    title: string
    href: string
    icon: React.ElementType
}

const navItems: SidebarItem[] = [
    { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { title: 'Mesas', href: '/mesas', icon: Swords },
    { title: 'Torneios', href: '/torneios', icon: Trophy },
    { title: 'Jogadores', href: '/jogadores', icon: Users },
    { title: 'Ranking', href: '/ranking', icon: Trophy },
    { title: 'Histórico', href: '/historico', icon: History },
    { title: 'Financeiro', href: '/financeiro', icon: DollarSign },
    { title: 'Relatórios', href: '/relatorios', icon: Trophy },
    { title: 'Configurações', href: '/configuracoes', icon: Settings }
]

import { SettingsDialog } from '@/components/SettingsDialog'
import { AppSettings } from '@/app/settings/actions'
import Image from 'next/image'

export function Sidebar({ isOperator, performLogoutAction, appSettings, isSuperAdmin }: { isOperator: boolean, performLogoutAction?: () => void, appSettings?: AppSettings, isSuperAdmin?: boolean }) {
    const pathname = usePathname()

    // Esconder a Sidebar globalmente se a rota demandar tela máxima (ex: Modo TV)
    if (pathname === '/tv') return null

    return (
        <aside className="w-[280px] bg-black/60 backdrop-blur-sm border-r border-white/5 flex flex-col h-full hidden md:flex shadow-2xl relative z-20">
            {/* Logo Area */}
            <div className="p-8 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
                {appSettings && isSuperAdmin !== undefined ? (
                    <SettingsDialog appSettings={appSettings} isSuperAdmin={isSuperAdmin}>
                        <div className="flex flex-col items-center gap-4 w-full text-center">
                            <div className="w-full h-24 flex items-center justify-center relative drop-shadow-[0_0_15px_var(--color-primary)]">
                                {appSettings.app_logo_url ? (
                                    <Image src={appSettings.app_logo_url} alt="App Logo" fill className="object-contain" unoptimized />
                                ) : (
                                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-[0_0_30px_-5px_var(--color-primary)] border border-white/20">
                                        <span className="font-black text-white text-3xl tracking-tighter">{appSettings.app_name.charAt(0)}</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col justify-center">
                                <span className="font-black text-white text-xl tracking-tight leading-none text-primary drop-shadow-[0_0_15px_var(--color-primary)]">
                                    {appSettings.app_name}
                                </span>
                                <span className="text-[10px] uppercase text-muted-foreground font-black tracking-[0.3em] mt-1">
                                    {appSettings.app_subtitle}
                                </span>
                            </div>
                        </div>
                    </SettingsDialog>
                ) : (
                    <div className="flex flex-col items-center gap-4 text-center">
                        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-[0_0_30px_-5px_var(--color-primary)] border border-white/20">
                            <span className="font-black text-white text-3xl tracking-tighter">A</span>
                        </div>
                        <div className="flex flex-col justify-center">
                            <span className="font-black text-white text-xl tracking-tight leading-none text-primary drop-shadow-[0_0_15px_var(--color-primary)]">A.C.L.S</span>
                            <span className="text-[10px] uppercase text-muted-foreground font-black tracking-[0.3em] mt-1">Torneios</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 scrollbar-hide">
                {navItems.filter(item => {
                    const isAdminOnly = ['/financeiro', '/relatorios', '/configuracoes', '/mesas'].includes(item.href)
                    if (isAdminOnly) return isOperator
                    return true
                }).map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group text-sm font-semibold relative overflow-hidden",
                                isActive
                                    ? "text-white"
                                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                            )}
                        >
                            {/* Active background indicator */}
                            {isActive && (
                                <div className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-xl"></div>
                            )}

                            {/* Active left bar indicator */}
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-primary rounded-r-full shadow-[0_0_10px_var(--color-primary)]"></div>
                            )}

                            <item.icon className={cn(
                                "w-5 h-5 transition-all duration-300 relative z-10",
                                isActive
                                    ? "text-primary drop-shadow-[0_0_8px_var(--color-primary)]"
                                    : "text-muted-foreground group-hover:text-white group-hover:scale-110"
                            )} />
                            <span className="relative z-10">{item.title}</span>
                        </Link>
                    )
                })}
            </nav>

            {/* Footer / User Area */}
            <div className="p-6 border-t border-white/5 bg-black/20">
                {isOperator ? (
                    <button
                        onClick={() => performLogoutAction && performLogoutAction()}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 border border-transparent transition-all duration-300 text-sm font-bold group"
                    >
                        <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Sair do Sistema
                    </button>
                ) : (
                    <Link href="/login" className="flex items-center justify-center gap-3 px-4 py-3 w-full rounded-xl text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 text-sm font-bold shadow-lg">
                        <Users className="w-4 h-4" />
                        Login Operador
                    </Link>
                )}
            </div>
        </aside>
    )
}
