'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Swords,
    Trophy,
    Users,
    History
} from 'lucide-react'
import { cn } from '@/lib/utils'

const mobileNavItems = [
    { title: 'Home', href: '/', icon: LayoutDashboard },
    { title: 'Mesas', href: '/mesas', icon: Swords },
    { title: 'Torneios', href: '/torneios', icon: Trophy },
    { title: 'Ranking', href: '/ranking', icon: Trophy }, // Using Trophy for Ranking too as it fits the theme
    { title: 'Ficha', href: '/jogadores', icon: Users },
]

export function MobileNav() {
    const pathname = usePathname()

    if (pathname === '/tv') return null

    return (
        <nav className="md:hidden fixed bottom-6 left-4 right-4 z-50">
            <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-2 flex items-center justify-around shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)]">
                {mobileNavItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "relative flex flex-col items-center gap-1 p-3 flex-1 transition-all duration-300",
                                isActive ? "text-primary" : "text-muted-foreground hover:text-white"
                            )}
                        >
                            {isActive && (
                                <div className="absolute inset-0 bg-primary/10 rounded-2xl -z-10 animate-in fade-in zoom-in duration-300"></div>
                            )}

                            <item.icon className={cn(
                                "w-6 h-6 transition-transform duration-300",
                                isActive ? "scale-110 drop-shadow-[0_0_10px_var(--color-primary)]" : ""
                            )} />

                            <span className={cn(
                                "text-[9px] font-black uppercase tracking-tighter transition-all duration-300",
                                isActive ? "opacity-100 translate-y-0" : "opacity-60"
                            )}>
                                {item.title}
                            </span>

                            {isActive && (
                                <div className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full shadow-[0_0_5px_var(--color-primary)]"></div>
                            )}
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
