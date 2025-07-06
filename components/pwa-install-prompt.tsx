"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Download, Smartphone } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[]
    readonly userChoice: Promise<{
        outcome: "accepted" | "dismissed"
        platform: string
    }>
    prompt(): Promise<void>
}

interface PWAInstallPromptProps {
    showOnLogin?: boolean
    autoShow?: boolean
    delay?: number
}

export default function PWAInstallPrompt({
                                             showOnLogin = false,
                                             autoShow = true,
                                             delay = 3000,
                                         }: PWAInstallPromptProps) {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [showInstallPrompt, setShowInstallPrompt] = useState(false)
    const [isInstalled, setIsInstalled] = useState(false)

    useEffect(() => {
        // Verificar si ya está instalado
        const checkIfInstalled = () => {
            if (window.matchMedia("(display-mode: standalone)").matches) {
                setIsInstalled(true)
                return true
            }
            if ((window.navigator as any).standalone === true) {
                setIsInstalled(true)
                return true
            }
            if (document.referrer.includes("android-app://")) {
                setIsInstalled(true)
                return true
            }
            return false
        }

        const installed = checkIfInstalled()

        // Escuchar el evento beforeinstallprompt
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e as BeforeInstallPromptEvent)

            // Si showOnLogin es true, mostrar inmediatamente
            if (showOnLogin && !installed) {
                setShowInstallPrompt(true)
            } else if (autoShow && !installed) {
                // Mostrar el prompt después de un delay
                setTimeout(() => {
                    if (!isInstalled) {
                        setShowInstallPrompt(true)
                    }
                }, delay)
            }
        }

        // Escuchar cuando la app se instala
        const handleAppInstalled = () => {
            setIsInstalled(true)
            setShowInstallPrompt(false)
            setDeferredPrompt(null)
            console.log("PWA instalada exitosamente")
        }

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
        window.addEventListener("appinstalled", handleAppInstalled)

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
            window.removeEventListener("appinstalled", handleAppInstalled)
        }
    }, [isInstalled, showOnLogin, autoShow, delay])

    const handleInstallClick = async () => {
        if (!deferredPrompt) return

        try {
            await deferredPrompt.prompt()
            const { outcome } = await deferredPrompt.userChoice

            console.log(`Usuario ${outcome} la instalación`)

            if (outcome === "accepted") {
                setIsInstalled(true)
            }

            setShowInstallPrompt(false)
            setDeferredPrompt(null)
        } catch (error) {
            console.error("Error instalando PWA:", error)
        }
    }

    const handleDismiss = () => {
        setShowInstallPrompt(false)
        // No mostrar de nuevo por 24 horas
        localStorage.setItem("pwa-install-dismissed", Date.now().toString())
    }

    // No mostrar si ya está instalado o si fue rechazado recientemente
    if (isInstalled || !showInstallPrompt || !deferredPrompt) {
        return null
    }

    const dismissedTime = localStorage.getItem("pwa-install-dismissed")
    if (dismissedTime && Date.now() - Number.parseInt(dismissedTime) < 24 * 60 * 60 * 1000) {
        return null
    }

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 text-white shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Smartphone className="w-5 h-5" />
                            Instalar App
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleDismiss}
                            className="text-white hover:bg-white/20 h-8 w-8"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    <p className="text-sm text-blue-100 mb-4">
                        Instala Gym App en tu dispositivo para acceso rápido y notificaciones.
                    </p>
                    <div className="flex gap-2">
                        <Button
                            onClick={handleInstallClick}
                            className="flex-1 bg-white text-blue-600 hover:bg-blue-50 font-semibold"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Instalar
                        </Button>
                        <Button variant="ghost" onClick={handleDismiss} className="text-white hover:bg-white/20">
                            Ahora no
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
