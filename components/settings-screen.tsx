"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
    ArrowLeft,
    Settings,
    Bell,
    Moon,
    Sun,
    Smartphone,
    Volume2,
    VolumeX,
    Shield,
    Database,
    Trash2,
    Download,
    CheckCircle,
    AlertCircle,
} from "lucide-react"

interface SettingsScreenProps {
    onBack: () => void
    onLogout: () => void
    userData: any
}

interface NotificationSettings {
    workoutReminders: boolean
    progressUpdates: boolean
    membershipAlerts: boolean
    socialNotifications: boolean
    emailNotifications: boolean
    pushNotifications: boolean
}

interface AppSettings {
    darkMode: boolean
    soundEnabled: boolean
    autoSync: boolean
    offlineMode: boolean
    dataUsage: "low" | "medium" | "high"
}

export default function SettingsScreen({ onBack, onLogout, userData }: SettingsScreenProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

    // Notification settings
    const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
        workoutReminders: true,
        progressUpdates: true,
        membershipAlerts: true,
        socialNotifications: false,
        emailNotifications: true,
        pushNotifications: true,
    })

    // App settings
    const [appSettings, setAppSettings] = useState<AppSettings>({
        darkMode: true,
        soundEnabled: true,
        autoSync: true,
        offlineMode: false,
        dataUsage: "medium",
    })

    // Push notification subscription status
    const [pushSubscription, setPushSubscription] = useState<PushSubscription | null>(null)
    const [pushSupported, setPushSupported] = useState(false)

    useEffect(() => {
        loadSettings()
        checkPushNotificationSupport()
    }, [userData])

    const loadSettings = async () => {
        try {
            // Load from localStorage for now (in production, load from database)
            const savedNotificationSettings = localStorage.getItem(`notification_settings_${userData.id}`)
            const savedAppSettings = localStorage.getItem(`app_settings_${userData.id}`)

            if (savedNotificationSettings) {
                setNotificationSettings(JSON.parse(savedNotificationSettings))
            }

            if (savedAppSettings) {
                setAppSettings(JSON.parse(savedAppSettings))
            }
        } catch (error) {
            console.error("Error loading settings:", error)
        }
    }

    const checkPushNotificationSupport = async () => {
        if ("serviceWorker" in navigator && "PushManager" in window) {
            setPushSupported(true)

            try {
                const registration = await navigator.serviceWorker.ready
                const subscription = await registration.pushManager.getSubscription()
                setPushSubscription(subscription)
            } catch (error) {
                console.error("Error checking push subscription:", error)
            }
        }
    }

    const saveSettings = async () => {
        setIsLoading(true)
        setMessage(null)

        try {
            // Save to localStorage (in production, save to database)
            localStorage.setItem(`notification_settings_${userData.id}`, JSON.stringify(notificationSettings))
            localStorage.setItem(`app_settings_${userData.id}`, JSON.stringify(appSettings))

            // Simulate network delay
            await new Promise((resolve) => setTimeout(resolve, 1000))

            setMessage({ type: "success", text: "Configuración guardada correctamente" })
        } catch (error) {
            setMessage({ type: "error", text: "Error al guardar la configuración" })
        } finally {
            setIsLoading(false)
        }
    }

    const handleNotificationToggle = (key: keyof NotificationSettings) => {
        setNotificationSettings((prev) => ({
            ...prev,
            [key]: !prev[key],
        }))
    }

    const handleAppSettingToggle = (key: keyof AppSettings) => {
        setAppSettings((prev) => ({
            ...prev,
            [key]: !prev[key],
        }))
    }

    const subscribeToPushNotifications = async () => {
        if (!pushSupported) {
            setMessage({ type: "error", text: "Las notificaciones push no son compatibles con este navegador" })
            return
        }

        try {
            setIsLoading(true)

            const registration = await navigator.serviceWorker.ready

            // Request notification permission
            const permission = await Notification.requestPermission()
            if (permission !== "granted") {
                setMessage({ type: "error", text: "Permisos de notificación denegados" })
                return
            }

            // Subscribe to push notifications
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
            })

            // Save subscription to server (mock for now)
            // await fetch('/api/push-subscription', {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify({
            //     userId: userData.id,
            //     subscription: subscription.toJSON()
            //   })
            // })

            setPushSubscription(subscription)
            setNotificationSettings((prev) => ({ ...prev, pushNotifications: true }))
            setMessage({ type: "success", text: "Notificaciones push activadas correctamente" })
        } catch (error) {
            console.error("Error subscribing to push notifications:", error)
            setMessage({ type: "error", text: "Error al activar las notificaciones push" })
        } finally {
            setIsLoading(false)
        }
    }

    const unsubscribeFromPushNotifications = async () => {
        if (!pushSubscription) return

        try {
            setIsLoading(true)

            await pushSubscription.unsubscribe()

            // Remove subscription from server (mock for now)
            // await fetch('/api/push-subscription', {
            //   method: 'DELETE',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify({ userId: userData.id })
            // })

            setPushSubscription(null)
            setNotificationSettings((prev) => ({ ...prev, pushNotifications: false }))
            setMessage({ type: "success", text: "Notificaciones push desactivadas" })
        } catch (error) {
            console.error("Error unsubscribing from push notifications:", error)
            setMessage({ type: "error", text: "Error al desactivar las notificaciones push" })
        } finally {
            setIsLoading(false)
        }
    }

    const clearAppData = async () => {
        if (!confirm("¿Estás seguro de que quieres borrar todos los datos locales? Esta acción no se puede deshacer.")) {
            return
        }

        try {
            setIsLoading(true)

            // Clear localStorage
            const keysToRemove = Object.keys(localStorage).filter((key) => key.includes(userData.id))
            keysToRemove.forEach((key) => localStorage.removeItem(key))

            // Clear cache if available
            if ("caches" in window) {
                const cacheNames = await caches.keys()
                await Promise.all(cacheNames.map((name) => caches.delete(name)))
            }

            setMessage({ type: "success", text: "Datos locales borrados correctamente" })
        } catch (error) {
            console.error("Error clearing app data:", error)
            setMessage({ type: "error", text: "Error al borrar los datos" })
        } finally {
            setIsLoading(false)
        }
    }

    const exportData = async () => {
        try {
            setIsLoading(true)

            // Collect user data from localStorage
            const profile = JSON.parse(localStorage.getItem(`profile_${userData.id}`) || "{}")
            const measurements = JSON.parse(localStorage.getItem(`measurements_${userData.id}`) || "[]")
            const goals = JSON.parse(localStorage.getItem(`goals_${userData.id}`) || "[]")
            const settings = {
                notifications: notificationSettings,
                app: appSettings,
            }

            const userData = {
                profile,
                measurements,
                goals,
                settings,
                exportDate: new Date().toISOString(),
            }

            // Create and download file
            const dataStr = JSON.stringify(userData, null, 2)
            const dataBlob = new Blob([dataStr], { type: "application/json" })
            const url = URL.createObjectURL(dataBlob)

            const link = document.createElement("a")
            link.href = url
            link.download = `gym-app-data-${new Date().toISOString().split("T")[0]}.json`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            URL.revokeObjectURL(url)

            setMessage({ type: "success", text: "Datos exportados correctamente" })
        } catch (error) {
            console.error("Error exporting data:", error)
            setMessage({ type: "error", text: "Error al exportar los datos" })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white pb-20">
            {/* Header simplificado */}
            <div className="bg-gray-900 border-b border-gray-800 p-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onBack} className="text-gray-400 hover:text-white">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <Settings className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">Configuración</h1>
                            <p className="text-gray-400 text-sm">Personaliza tu experiencia</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-6">
                {/* Message Alert */}
                {message && (
                    <Alert
                        className={`${message.type === "error" ? "border-red-500 bg-red-500/10" : "border-green-500 bg-green-500/10"}`}
                    >
                        {message.type === "error" ? (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                        ) : (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        <AlertDescription className={message.type === "error" ? "text-red-400" : "text-green-400"}>
                            {message.text}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Notification Settings */}
                <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Bell className="w-5 h-5 text-blue-400" />
                            Notificaciones
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label className="text-white">Recordatorios de Entrenamiento</Label>
                                <p className="text-sm text-gray-400">Recibe recordatorios para tus sesiones programadas</p>
                            </div>
                            <Switch
                                checked={notificationSettings.workoutReminders}
                                onCheckedChange={() => handleNotificationToggle("workoutReminders")}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label className="text-white">Actualizaciones de Progreso</Label>
                                <p className="text-sm text-gray-400">Notificaciones sobre tu progreso y logros</p>
                            </div>
                            <Switch
                                checked={notificationSettings.progressUpdates}
                                onCheckedChange={() => handleNotificationToggle("progressUpdates")}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label className="text-white">Alertas de Membresía</Label>
                                <p className="text-sm text-gray-400">Avisos sobre vencimiento y renovación</p>
                            </div>
                            <Switch
                                checked={notificationSettings.membershipAlerts}
                                onCheckedChange={() => handleNotificationToggle("membershipAlerts")}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label className="text-white">Notificaciones por Email</Label>
                                <p className="text-sm text-gray-400">Recibe notificaciones en tu correo electrónico</p>
                            </div>
                            <Switch
                                checked={notificationSettings.emailNotifications}
                                onCheckedChange={() => handleNotificationToggle("emailNotifications")}
                            />
                        </div>

                        {/* Push Notifications */}
                        <div className="border-t border-gray-800 pt-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="space-y-1">
                                    <Label className="text-white flex items-center gap-2">
                                        <Smartphone className="w-4 h-4" />
                                        Notificaciones Push
                                    </Label>
                                    <p className="text-sm text-gray-400">Notificaciones en tiempo real en tu dispositivo</p>
                                </div>
                                <Badge
                                    variant={pushSubscription ? "default" : "secondary"}
                                    className={pushSubscription ? "bg-green-600" : ""}
                                >
                                    {pushSubscription ? "Activas" : "Inactivas"}
                                </Badge>
                            </div>

                            {pushSupported ? (
                                <div className="flex gap-2">
                                    {!pushSubscription ? (
                                        <Button
                                            onClick={subscribeToPushNotifications}
                                            disabled={isLoading}
                                            className="bg-blue-600 hover:bg-blue-700"
                                            size="sm"
                                        >
                                            {isLoading ? "Activando..." : "Activar Push"}
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={unsubscribeFromPushNotifications}
                                            disabled={isLoading}
                                            variant="outline"
                                            className="border-red-600 text-red-400 hover:bg-red-900/20 bg-transparent"
                                            size="sm"
                                        >
                                            {isLoading ? "Desactivando..." : "Desactivar Push"}
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">Las notificaciones push no son compatibles con este navegador</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* App Settings */}
                <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Settings className="w-5 h-5 text-purple-400" />
                            Configuración de la App
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label className="text-white flex items-center gap-2">
                                    {appSettings.darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                                    Modo Oscuro
                                </Label>
                                <p className="text-sm text-gray-400">Interfaz oscura para mejor visualización</p>
                            </div>
                            <Switch checked={appSettings.darkMode} onCheckedChange={() => handleAppSettingToggle("darkMode")} />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label className="text-white flex items-center gap-2">
                                    {appSettings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                                    Sonidos de la App
                                </Label>
                                <p className="text-sm text-gray-400">Efectos de sonido y notificaciones audibles</p>
                            </div>
                            <Switch
                                checked={appSettings.soundEnabled}
                                onCheckedChange={() => handleAppSettingToggle("soundEnabled")}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label className="text-white flex items-center gap-2">
                                    <Database className="w-4 h-4" />
                                    Sincronización Automática
                                </Label>
                                <p className="text-sm text-gray-400">Sincronizar datos automáticamente con el servidor</p>
                            </div>
                            <Switch checked={appSettings.autoSync} onCheckedChange={() => handleAppSettingToggle("autoSync")} />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label className="text-white">Modo Offline</Label>
                                <p className="text-sm text-gray-400">Permitir uso de la app sin conexión</p>
                            </div>
                            <Switch checked={appSettings.offlineMode} onCheckedChange={() => handleAppSettingToggle("offlineMode")} />
                        </div>
                    </CardContent>
                </Card>

                {/* Privacy & Security */}
                <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Shield className="w-5 h-5 text-green-400" />
                            Privacidad y Seguridad
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button
                            onClick={exportData}
                            disabled={isLoading}
                            variant="outline"
                            className="w-full justify-start border-gray-700 hover:bg-gray-800 bg-transparent"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            {isLoading ? "Exportando..." : "Exportar Mis Datos"}
                        </Button>

                        <Button
                            onClick={clearAppData}
                            disabled={isLoading}
                            variant="outline"
                            className="w-full justify-start border-yellow-700 text-yellow-400 hover:bg-yellow-900/20 bg-transparent"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {isLoading ? "Borrando..." : "Borrar Datos Locales"}
                        </Button>
                    </CardContent>
                </Card>

                {/* Save Settings Button */}
                <Button onClick={saveSettings} disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 py-3">
                    {isLoading ? "Guardando..." : "Guardar Configuración"}
                </Button>
            </div>
        </div>
    )
}
