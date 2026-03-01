'use client'

import { Settings, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { AppSettings } from '@/app/settings/actions'
import { SettingsDialog } from './SettingsDialog'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
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

    return (
        <header className="md:hidden sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
                {appSettings?.app_logo_url ? (
                    <div className="relative w-8 h-8 drop-shadow-[0_0_8px_var(--color-primary)]">
                        <Image src={appSettings.app_logo_url} alt="Logo" fill className="object-contain" unoptimized />
                    </div>
                ) : (
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center border border-white/10 shadow-[0_0_15px_-3px_var(--color-primary)]">
                        <span className="font-black text-white text-sm">{appSettings?.app_name.charAt(0) || 'A'}</span>
                    </div>
                )}
                <div className="flex flex-col">
                    <span className="font-black text-white text-sm tracking-tight leading-none">
                        {appSettings?.app_name || 'Liga Sinuca'}
                    </span>
                    <span className="text-[8px] uppercase text-muted-foreground font-bold tracking-widest mt-0.5">
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
