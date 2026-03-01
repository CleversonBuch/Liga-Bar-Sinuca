'use client'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle2, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ConfirmModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    variant?: 'default' | 'destructive' | 'success'
    loading?: boolean
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    variant = 'default',
    loading = false
}: ConfirmModalProps) {
    const Icon = variant === 'destructive' ? AlertTriangle : variant === 'success' ? CheckCircle2 : HelpCircle

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[400px] bg-slate-950/90 backdrop-blur-2xl border-white/10 text-white rounded-[2rem] overflow-hidden p-0 shadow-2xl">
                {/* Header with Icon and Background Glow */}
                <div className={cn(
                    "relative p-8 pb-4 flex flex-col items-center text-center space-y-4",
                    variant === 'destructive' ? "from-red-500/20" : variant === 'success' ? "from-emerald-500/20" : "from-blue-500/20",
                    "bg-gradient-to-b to-transparent"
                )}>
                    <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center border-2 shadow-xl ring-4 ring-black/20",
                        variant === 'destructive' ? "border-red-500/50 bg-red-500/10 text-red-500" :
                            variant === 'success' ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-500" :
                                "border-blue-500/50 bg-blue-500/10 text-blue-500"
                    )}>
                        <Icon className="w-8 h-8" />
                    </div>

                    <DialogHeader className="space-y-2">
                        <DialogTitle className="text-2xl font-black uppercase tracking-tighter italic text-white flex justify-center">
                            {title}
                        </DialogTitle>
                        <DialogDescription className="text-slate-400 font-medium leading-relaxed">
                            {description}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <DialogFooter className="flex flex-col sm:flex-row gap-3 p-8 pt-4">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] border border-white/5 hover:bg-white/5 text-slate-400"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={variant === 'destructive' ? 'destructive' : 'default'}
                        onClick={(e) => {
                            e.preventDefault();
                            onConfirm();
                        }}
                        disabled={loading}
                        className={cn(
                            "flex-1 h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg transition-all",
                            variant === 'default' && "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20",
                            variant === 'success' && "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20",
                            variant === 'destructive' && "bg-red-600 hover:bg-red-500 text-white shadow-red-500/20",
                            "active:scale-95"
                        )}
                    >
                        {loading ? "Processando..." : confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
