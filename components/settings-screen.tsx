"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
// import NotificationsSettings from "./notifications-settings"
import {
    ArrowLeft,
    Bell,
    Shield,
    Moon,
    Sun,
    HelpCircle,
    User,
    Palette,
    Globe,
    ChevronRight,
    LogOut,
} from "lucide-react"

interface SettingsScreenProps {
    userData: any
}

const SettingsScreen = ({ userData }: SettingsScreenProps) => {
    const [notifications, setNotifications] = useState<any>({
        workoutReminders: true,
        progressUpdates: true,
        goalDeadlines: true,
        membershipExpiry: true,
        emailNotifications: true,
        pushNotifications: false,
    })

    const [appSettings, setAppSettings] = useState<any>({
        darkMode: true,
        soundEnabled: true,
        autoSync: true,
        offlineMode: false,
        language: "es",
        units: "metric",
    })

    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [showPasswordDialog, setShowPasswordDialog] = useState(false)
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPasswords, setShowPasswords] = useState(false)
    const [deleteConfirmText, setDeleteConfirmText] = useState("")
    const [isDark, setIsDark] = useState(false)
    const [showNotifications, setShowNotifications] = useState(false)
    const { setTheme } = useTheme()
    const router = useRouter()

    useEffect(() => {
        loadSettings()
    }, [userData])

    const loadSettings = async () => {
        try {
            // MOCK: Simular carga de configuraciones desde la base de datos
            // const { data: userSettings } = await supabase
            //   .from("user_settings")
            //   .select("*")
            //   .eq("user_id", userData.id)
            //   .single()

            // if (userSettings) {
            //   setNotifications(userSettings.notifications || notifications)
            //   setAppSettings(userSettings.app_settings || appSettings)
            // }

            // Mock: Cargar configuraciones guardadas del localStorage
            const savedNotifications = localStorage.getItem(`notifications_${userData.id}`)
            const savedAppSettings = localStorage.getItem(`appSettings_${userData.id}`)

            if (savedNotifications) {
                setNotifications(JSON.parse(savedNotifications))
            }

            if (savedAppSettings) {
                setAppSettings(JSON.parse(savedAppSettings))
            }
        } catch (error) {
            console.error("Error loading settings:", error)
        }
    }

    const handleNotificationChange = (key: string, value: boolean) => {
        const newNotifications = { ...notifications, [key]: value }
        setNotifications(newNotifications)

        // Guardar inmediatamente en localStorage (mock de base de datos)
        localStorage.setItem(`notifications_${userData.id}`, JSON.stringify(newNotifications))
    }

    const handleAppSettingChange = (key: string, value: any) => {
        const newAppSettings = { ...appSettings, [key]: value }
        setAppSettings(newAppSettings)

        // Guardar inmediatamente en localStorage (mock de base de datos)
        localStorage.setItem(`appSettings_${userData.id}`, JSON.stringify(newAppSettings))
    }

    const saveSettings = async () => {
        setIsLoading(true)
        setMessage(null)

        try {
            // MOCK: Simular guardado en base de datos
            // const { error } = await supabase
            //   .from("user_settings")
            //   .upsert({
            //     user_id: userData.id,
            //     notifications: notifications,
            //     app_settings: appSettings,
            //     updated_at: new Date().toISOString()
            //   })

            // if (error) throw error

            // Simular delay de red
            await new Promise((resolve) => setTimeout(resolve, 1000))

            // Guardar en localStorage como mock
            localStorage.setItem(`notifications_${userData.id}`, JSON.stringify(notifications))
            localStorage.setItem(`appSettings_${userData.id}`, JSON.stringify(appSettings))

            setMessage({ type: "success", text: "Configuración guardada correctamente" })
        } catch (error: any) {
            setMessage({ type: "error", text: "Error al guardar la configuración" })
        } finally {
            setIsLoading(false)
        }
    }

    const handlePasswordChange = async () => {
        if (newPassword !== confirmPassword) {
            setMessage({ type: "error", text: "Las contraseñas no coinciden" })
            return
        }

        if (newPassword.length < 6) {
            setMessage({ type: "error", text: "La contraseña debe tener al menos 6 caracteres" })
            return
        }

        setIsLoading(true)
        setMessage(null)

        try {
            // MOCK: Simular cambio de contraseña
            // const { error } = await supabase.auth.updateUser({
            //   password: newPassword,
            // })

            // if (error) throw error

            // Simular delay de red
            await new Promise((resolve) => setTimeout(resolve, 2000))

            setMessage({ type: "success", text: "Contraseña actualizada correctamente" })
            setShowPasswordDialog(false)
            setCurrentPassword("")
            setNewPassword("")
            setConfirmPassword("")
        } catch (error: any) {
            setMessage({ type: "error", text: error.message || "Error al cambiar la contraseña" })
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== "ELIMINAR") {
            setMessage({ type: "error", text: "Debes escribir 'ELIMINAR' para confirmar" })
            return
        }

        setIsLoading(true)
        setMessage(null)

        try {
            // MOCK: Simular eliminación de cuenta
            // const { error } = await supabase.auth.admin.deleteUser(userData.id)
            // if (error) throw error

            // También eliminar datos del usuario
            // await supabase.from("users").delete().eq("id", userData.id)
            // await supabase.from("body_measurements").delete().eq("user_id", userData.id)
            // await supabase.from("user_goals").delete().eq("user_id", userData.id)
            // await supabase.from("user_settings").delete().eq("user_id", userData.id)

            // Simular delay de red
            await new Promise((resolve) => setTimeout(resolve, 3000))

            // Limpiar localStorage
            localStorage.removeItem(`notifications_${userData.id}`)
            localStorage.removeItem(`appSettings_${userData.id}`)

            setMessage({ type: "success", text: "Cuenta eliminada correctamente. Redirigiendo..." })

            setTimeout(() => {
                router.push("/login")
            }, 2000)
        } catch (error: any) {
            setMessage({ type: "error", text: "Error al eliminar la cuenta" })
        } finally {
            setIsLoading(false)
        }
    }

    const exportData = async () => {
        setIsLoading(true)
        setMessage(null)

        try {
            // MOCK: Simular exportación de datos
            // const { data: profileData } = await supabase
            //   .from("users")
            //   .select("*")
            //   .eq("id", userData.id)
            //   .single()

            // const { data: measurementsData } = await supabase
            //   .from("body_measurements")
            //   .select("*")
            //   .eq("user_id", userData.id)

            // const { data: goalsData } = await supabase
            //   .from("user_goals")
            //   .select("*")
            //   .eq("user_id", userData.id)

            // Simular delay de red
            await new Promise((resolve) => setTimeout(resolve, 1500))

            // Mock data export
            const userDataExport = {
                profile: userData,
                settings: {
                    notifications,
                    appSettings,
                    exportedFrom: "localStorage", // Indicar que es mock data
                },
                measurements: JSON.parse(localStorage.getItem(`measurements_${userData.id}`) || "[]"),
                goals: JSON.parse(localStorage.getItem(`goals_${userData.id}`) || "[]"),
                exportDate: new Date().toISOString(),
                version: "1.0.0",
            }

            const dataStr = JSON.stringify(userDataExport, null, 2)
            const dataBlob = new Blob([dataStr], { type: "application/json" })
            const url = URL.createObjectURL(dataBlob)
            const link = document.createElement("a")
            link.href = url
            link.download = `gym-data-${userData.full_name.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.json`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)

            setMessage({ type: "success", text: "Datos exportados correctamente" })
        } catch (error: any) {
            setMessage({ type: "error", text: "Error al exportar los datos" })
        } finally {
            setIsLoading(false)
        }
    }

    const handleSupportAction = (action: string) => {
        setMessage({ type: "success", text: `Función ${action} será implementada próximamente` })
    }

    const handleThemeToggle = () => {
        setIsDark(!isDark)
        setTheme(isDark ? "light" : "dark")
    }

    if (showNotifications) {
      // => setShowNotifications(false)} userData={userData} />
        console.log('notificacion')
    }

    return (
        <div className="container relative pb-6">
            <Button variant="ghost" className="absolute left-0 top-0" onClick={() => router.back()}>
                <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex flex-col items-center justify-center h-screen">
                <h1 className="text-3xl font-bold mb-4">Configuración</h1>

                <div className="w-full max-w-md space-y-4">
                    <Card className="bg-gray-900 border-gray-800">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <User className="w-5 h-5 text-blue-400" />
                                    <div>
                                        <h4 className="text-white font-medium">Cuenta</h4>
                                        <p className="text-gray-400 text-sm">Administrar tu cuenta</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gray-900 border-gray-800">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Shield className="w-5 h-5 text-blue-400" />
                                    <div>
                                        <h4 className="text-white font-medium">Privacidad y seguridad</h4>
                                        <p className="text-gray-400 text-sm">Controla tu privacidad</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gray-900 border-gray-800">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Bell className="w-5 h-5 text-blue-400" />
                                    <div>
                                        <h4 className="text-white font-medium">Notificaciones Push</h4>
                                        <p className="text-gray-400 text-sm">Configurar recordatorios y alertas</p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowNotifications(true)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gray-900 border-gray-800">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Palette className="w-5 h-5 text-blue-400" />
                                    <div>
                                        <h4 className="text-white font-medium">Apariencia</h4>
                                        <p className="text-gray-400 text-sm">Personaliza la apariencia de la app</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                                    <div className="flex items-center gap-2" onClick={handleThemeToggle}>
                                        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                        <ChevronRight className="w-4 h-4" />
                                    </div>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gray-900 border-gray-800">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Globe className="w-5 h-5 text-blue-400" />
                                    <div>
                                        <h4 className="text-white font-medium">Idioma</h4>
                                        <p className="text-gray-400 text-sm">Selecciona tu idioma preferido</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gray-900 border-gray-800">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <HelpCircle className="w-5 h-5 text-blue-400" />
                                    <div>
                                        <h4 className="text-white font-medium">Ayuda y soporte</h4>
                                        <p className="text-gray-400 text-sm">Obtén ayuda con la app</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gray-900 border-gray-800">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <LogOut className="w-5 h-5 text-red-500" />
                                    <div>
                                        <h4 className="text-white font-medium">Cerrar sesión</h4>
                                        <p className="text-gray-400 text-sm">Salir de tu cuenta</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default SettingsScreen
