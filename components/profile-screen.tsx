"use client"

import {useState, useEffect} from "react"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {Progress} from "@/components/ui/progress"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {Alert, AlertDescription} from "@/components/ui/alert"
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog"
import {
    ArrowLeft,
    User,
    Edit3,
    Save,
    X,
    Calendar,
    Scale,
    Ruler,
    Activity,
    Heart,
    Plus,
    CheckCircle,
    AlertCircle,
    CreditCard,
} from "lucide-react"

interface ProfileScreenProps {
    onBack: () => void
    onLogout: () => void
    userData: any
}

interface BodyMeasurement {
    id: string
    weight: number
    height: number
    body_fat_percentage?: number
    muscle_mass?: number
    chest?: number
    waist?: number
    hips?: number
    bicep?: number
    thigh?: number
    measurement_date: string
    notes?: string
}

interface UserGoal {
    id: string
    goal_type: "weight_loss" | "weight_gain" | "muscle_gain" | "strength" | "endurance" | "other"
    target_value: number
    current_value: number
    unit: string
    target_date: string
    status: "active" | "completed" | "paused" | "cancelled"
    notes?: string
}

interface MembershipInfo {
    id: string
    status: "active" | "expired" | "pending"
    start_date: string
    end_date: string
    monthly_fee: number
    days_remaining: number
}

export default function ProfileScreen({onBack, onLogout, userData}: ProfileScreenProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

    // Profile data
    const [profileData, setProfileData] = useState({
        full_name: userData?.full_name || "",
        phone: userData?.phone || "",
        email: userData?.email || "",
    })

    // Body measurements
    const [measurements, setMeasurements] = useState<BodyMeasurement[]>([])
    const [newMeasurement, setNewMeasurement] = useState<Partial<BodyMeasurement>>({
        weight: 0,
        height: 0,
        body_fat_percentage: 0,
        muscle_mass: 0,
        measurement_date: new Date().toISOString().split("T")[0],
    })
    const [showAddMeasurement, setShowAddMeasurement] = useState(false)

    // Goals
    const [goals, setGoals] = useState<UserGoal[]>([])
    const [newGoal, setNewGoal] = useState<Partial<UserGoal>>({
        goal_type: "weight_loss",
        target_value: 0,
        current_value: 0,
        unit: "kg",
        target_date: "",
        status: "active",
    })
    const [showAddGoal, setShowAddGoal] = useState(false)

    // Membership
    const [membershipInfo, setMembershipInfo] = useState<MembershipInfo | null>(null)

    useEffect(() => {
        loadProfileData()
    }, [userData])

    const loadProfileData = async () => {
        try {
            // MOCK: Cargar mediciones corporales
            // const { data: measurementsData } = await supabase
            //   .from("body_measurements")
            //   .select("*")
            //   .eq("user_id", userData.id)
            //   .order("measurement_date", { ascending: false })

            const savedMeasurements = localStorage.getItem(`measurements_${userData.id}`)
            if (savedMeasurements) {
                setMeasurements(JSON.parse(savedMeasurements))
            } else {
                // Mock data inicial
                const mockMeasurements: BodyMeasurement[] = [
                    {
                        id: "1",
                        weight: 75.5,
                        height: 175,
                        body_fat_percentage: 15.2,
                        muscle_mass: 45.8,
                        chest: 95,
                        waist: 82,
                        hips: 98,
                        bicep: 35,
                        thigh: 58,
                        measurement_date: "2024-01-15",
                        notes: "Medición inicial",
                    },
                    {
                        id: "2",
                        weight: 74.2,
                        height: 175,
                        body_fat_percentage: 14.8,
                        muscle_mass: 46.2,
                        chest: 96,
                        waist: 80,
                        hips: 97,
                        bicep: 36,
                        thigh: 59,
                        measurement_date: "2024-02-15",
                        notes: "Progreso después de 1 mes",
                    },
                ]
                setMeasurements(mockMeasurements)
                localStorage.setItem(`measurements_${userData.id}`, JSON.stringify(mockMeasurements))
            }

            // MOCK: Cargar objetivos
            // const { data: goalsData } = await supabase
            //   .from("user_goals")
            //   .select("*")
            //   .eq("user_id", userData.id)
            //   .order("created_at", { ascending: false })

            const savedGoals = localStorage.getItem(`goals_${userData.id}`)
            if (savedGoals) {
                setGoals(JSON.parse(savedGoals))
            } else {
                // Mock data inicial
                const mockGoals: UserGoal[] = [
                    {
                        id: "1",
                        goal_type: "weight_loss",
                        target_value: 70,
                        current_value: 74.2,
                        unit: "kg",
                        target_date: "2024-06-01",
                        status: "active",
                        notes: "Perder peso para el verano",
                    },
                    {
                        id: "2",
                        goal_type: "muscle_gain",
                        target_value: 50,
                        current_value: 46.2,
                        unit: "kg",
                        target_date: "2024-12-31",
                        status: "active",
                        notes: "Aumentar masa muscular",
                    },
                ]
                setGoals(mockGoals)
                localStorage.setItem(`goals_${userData.id}`, JSON.stringify(mockGoals))
            }

            // MOCK: Cargar información de membresía
            // const { data: membershipData } = await supabase
            //   .from("memberships")
            //   .select("*")
            //   .eq("user_id", userData.id)
            //   .eq("status", "active")
            //   .single()

            const mockMembership: MembershipInfo = {
                id: "1",
                status: "active",
                start_date: "2025-07-01",
                end_date: "2025-07-31",
                monthly_fee: 25000,
                days_remaining: 28,
            }
            setMembershipInfo(mockMembership)
        } catch (error) {
            console.error("Error loading profile data:", error)
        }
    }

    const handleSaveProfile = async () => {
        setIsLoading(true)
        setMessage(null)

        try {
            // MOCK: Actualizar perfil en base de datos
            // const { error } = await supabase
            //   .from("users")
            //   .update({
            //     full_name: profileData.full_name,
            //     phone: profileData.phone,
            //     updated_at: new Date().toISOString()
            //   })
            //   .eq("id", userData.id)

            // if (error) throw error

            // Simular delay de red
            await new Promise((resolve) => setTimeout(resolve, 1000))

            setMessage({type: "success", text: "Perfil actualizado correctamente"})
            setIsEditing(false)
        } catch (error: any) {
            setMessage({type: "error", text: "Error al actualizar el perfil"})
        } finally {
            setIsLoading(false)
        }
    }

    const handleAddMeasurement = async () => {
        if (!newMeasurement.weight || !newMeasurement.height) {
            setMessage({type: "error", text: "Peso y altura son obligatorios"})
            return
        }

        setIsLoading(true)
        setMessage(null)

        try {
            const measurementToAdd: BodyMeasurement = {
                id: Date.now().toString(),
                weight: newMeasurement.weight!,
                height: newMeasurement.height!,
                body_fat_percentage: newMeasurement.body_fat_percentage || 0,
                muscle_mass: newMeasurement.muscle_mass || 0,
                chest: newMeasurement.chest || 0,
                waist: newMeasurement.waist || 0,
                hips: newMeasurement.hips || 0,
                bicep: newMeasurement.bicep || 0,
                thigh: newMeasurement.thigh || 0,
                measurement_date: newMeasurement.measurement_date!,
                notes: newMeasurement.notes || "",
            }

            // MOCK: Guardar en base de datos
            // const { error } = await supabase
            //   .from("body_measurements")
            //   .insert({
            //     user_id: userData.id,
            //     ...measurementToAdd
            //   })

            // if (error) throw error

            // Simular delay de red
            await new Promise((resolve) => setTimeout(resolve, 1000))

            const updatedMeasurements = [measurementToAdd, ...measurements]
            setMeasurements(updatedMeasurements)
            localStorage.setItem(`measurements_${userData.id}`, JSON.stringify(updatedMeasurements))

            setNewMeasurement({
                weight: 0,
                height: 0,
                body_fat_percentage: 0,
                muscle_mass: 0,
                measurement_date: new Date().toISOString().split("T")[0],
            })
            setShowAddMeasurement(false)
            setMessage({type: "success", text: "Medición agregada correctamente"})
        } catch (error: any) {
            setMessage({type: "error", text: "Error al agregar la medición"})
        } finally {
            setIsLoading(false)
        }
    }

    const handleAddGoal = async () => {
        if (!newGoal.target_value || !newGoal.target_date) {
            setMessage({type: "error", text: "Valor objetivo y fecha son obligatorios"})
            return
        }

        setIsLoading(true)
        setMessage(null)

        try {
            const goalToAdd: UserGoal = {
                id: Date.now().toString(),
                goal_type: newGoal.goal_type!,
                target_value: newGoal.target_value!,
                current_value: newGoal.current_value!,
                unit: newGoal.unit!,
                target_date: newGoal.target_date!,
                status: "active",
                notes: newGoal.notes || "",
            }

            // MOCK: Guardar en base de datos
            // const { error } = await supabase
            //   .from("user_goals")
            //   .insert({
            //     user_id: userData.id,
            //     ...goalToAdd
            //   })

            // if (error) throw error

            // Simular delay de red
            await new Promise((resolve) => setTimeout(resolve, 1000))

            const updatedGoals = [goalToAdd, ...goals]
            setGoals(updatedGoals)
            localStorage.setItem(`goals_${userData.id}`, JSON.stringify(updatedGoals))

            setNewGoal({
                goal_type: "weight_loss",
                target_value: 0,
                current_value: 0,
                unit: "kg",
                target_date: "",
                status: "active",
            })
            setShowAddGoal(false)
            setMessage({type: "success", text: "Objetivo agregado correctamente"})
        } catch (error: any) {
            setMessage({type: "error", text: "Error al agregar el objetivo"})
        } finally {
            setIsLoading(false)
        }
    }

    const calculateBMI = (weight: number, height: number) => {
        const heightInMeters = height / 100
        return weight / (heightInMeters * heightInMeters)
    }

    const getBMICategory = (bmi: number) => {
        if (bmi < 18.5) return {category: "Bajo peso", color: "text-blue-400"}
        if (bmi < 25) return {category: "Normal", color: "text-green-400"}
        if (bmi < 30) return {category: "Sobrepeso", color: "text-yellow-400"}
        return {category: "Obesidad", color: "text-red-400"}
    }

    const getGoalProgress = (goal: UserGoal) => {
        const progress = (goal.current_value / goal.target_value) * 100
        return Math.min(progress, 100)
    }

    const latestMeasurement = measurements[0]
    const bmi = latestMeasurement ? calculateBMI(latestMeasurement.weight, latestMeasurement.height) : 0
    const bmiInfo = getBMICategory(bmi)

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            {/* Header */}
            <div className="bg-gray-900 border-b border-gray-800 p-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onBack} className="text-gray-400 hover:text-white">
                        <ArrowLeft className="w-5 h-5"/>
                    </Button>
                    <div className="flex items-center gap-3">
                        <div
                            className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-white"/>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">{profileData.full_name}</h1>
                            <p className="text-gray-400 text-sm">{profileData.email}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-6">
                {/* Message Alert */}
                {message && (
                    <Alert
                        className={`${message.type === "success" ? "border-green-600 bg-green-900/20" : "border-red-600 bg-red-900/20"}`}
                    >
                        <AlertDescription className={message.type === "success" ? "text-green-400" : "text-red-400"}>
                            {message.text}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Tabs */}
                <Tabs defaultValue="profile" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 bg-gray-900">
                        <TabsTrigger value="profile"
                                     className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-white">
                            Perfil
                        </TabsTrigger>
                        <TabsTrigger value="measurements"
                                     className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-white">
                            Mediciones
                        </TabsTrigger>
                        <TabsTrigger value="goals"
                                     className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-white">
                            Objetivos
                        </TabsTrigger>
                        <TabsTrigger value="membership"
                                     className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-white">
                            Membresía
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile" className="space-y-4">
                        <Card className="bg-gray-900 border-gray-800">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <User className="w-5 h-5 text-blue-400"/>
                                        Información Personal
                                    </CardTitle>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsEditing(!isEditing)}
                                        className="border-gray-600"
                                    >
                                        {isEditing ? <X className="w-4 h-4"/> : <Edit3 className="w-4 h-4"/>}
                                        {isEditing ? "Cancelar" : "Editar"}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-gray-300">Nombre Completo</Label>
                                    {isEditing ? (
                                        <Input
                                            value={profileData.full_name}
                                            onChange={(e) => setProfileData({
                                                ...profileData,
                                                full_name: e.target.value
                                            })}
                                            className="bg-gray-800 border-gray-700 text-white"
                                        />
                                    ) : (
                                        <p className="text-white p-2 bg-gray-800 rounded">{profileData.full_name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-gray-300">Teléfono</Label>
                                    {isEditing ? (
                                        <Input
                                            value={profileData.phone}
                                            onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                                            className="bg-gray-800 border-gray-700 text-white"
                                            placeholder="Número de teléfono"
                                        />
                                    ) : (
                                        <p className="text-white p-2 bg-gray-800 rounded">{profileData.phone || "No especificado"}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-gray-300">Email</Label>
                                    <p className="text-gray-400 p-2 bg-gray-800 rounded">{profileData.email}</p>
                                    <p className="text-xs text-gray-500">El email no se puede modificar</p>
                                </div>

                                {isEditing && (
                                    <Button
                                        onClick={handleSaveProfile}
                                        disabled={isLoading}
                                        className="w-full bg-blue-600 hover:bg-blue-700"
                                    >
                                        <Save className="w-4 h-4 mr-2"/>
                                        {isLoading ? "Guardando..." : "Guardar Cambios"}
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

                        {/* BMI Card */}
                        {latestMeasurement && (
                            <Card className="bg-gray-900 border-gray-800">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-green-400"/>
                                        Índice de Masa Corporal (IMC)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center space-y-2">
                                        <div className="text-3xl font-bold text-white">{bmi.toFixed(1)}</div>
                                        <div className={`text-lg font-medium ${bmiInfo.color}`}>{bmiInfo.category}</div>
                                        <div className="text-sm text-gray-400">
                                            Basado en {latestMeasurement.weight}kg y {latestMeasurement.height}cm
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="measurements" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-white">Mediciones Corporales</h3>
                            <Dialog open={showAddMeasurement} onOpenChange={setShowAddMeasurement}>
                                <DialogTrigger asChild>
                                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                        <Plus className="w-4 h-4 mr-2"/>
                                        Agregar
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Nueva Medición</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-gray-300">Peso (kg) *</Label>
                                                <Input
                                                    type="number"
                                                    step="0.1"
                                                    value={newMeasurement.weight || ""}
                                                    onChange={(e) =>
                                                        setNewMeasurement({
                                                            ...newMeasurement,
                                                            weight: Number.parseFloat(e.target.value)
                                                        })
                                                    }
                                                    className="bg-gray-800 border-gray-700 text-white"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-gray-300">Altura (cm) *</Label>
                                                <Input
                                                    type="number"
                                                    value={newMeasurement.height || ""}
                                                    onChange={(e) =>
                                                        setNewMeasurement({
                                                            ...newMeasurement,
                                                            height: Number.parseFloat(e.target.value)
                                                        })
                                                    }
                                                    className="bg-gray-800 border-gray-700 text-white"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-gray-300">Grasa Corporal (%)</Label>
                                                <Input
                                                    type="number"
                                                    step="0.1"
                                                    value={newMeasurement.body_fat_percentage || ""}
                                                    onChange={(e) =>
                                                        setNewMeasurement({
                                                            ...newMeasurement,
                                                            body_fat_percentage: Number.parseFloat(e.target.value),
                                                        })
                                                    }
                                                    className="bg-gray-800 border-gray-700 text-white"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-gray-300">Masa Muscular (kg)</Label>
                                                <Input
                                                    type="number"
                                                    step="0.1"
                                                    value={newMeasurement.muscle_mass || ""}
                                                    onChange={(e) =>
                                                        setNewMeasurement({
                                                            ...newMeasurement,
                                                            muscle_mass: Number.parseFloat(e.target.value)
                                                        })
                                                    }
                                                    className="bg-gray-800 border-gray-700 text-white"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-gray-300">Fecha</Label>
                                            <Input
                                                type="date"
                                                value={newMeasurement.measurement_date}
                                                onChange={(e) => setNewMeasurement({
                                                    ...newMeasurement,
                                                    measurement_date: e.target.value
                                                })}
                                                className="bg-gray-800 border-gray-700 text-white"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-gray-300">Notas</Label>
                                            <Input
                                                value={newMeasurement.notes || ""}
                                                onChange={(e) => setNewMeasurement({
                                                    ...newMeasurement,
                                                    notes: e.target.value
                                                })}
                                                className="bg-gray-800 border-gray-700 text-white"
                                                placeholder="Notas opcionales"
                                            />
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                onClick={handleAddMeasurement}
                                                disabled={isLoading}
                                                className="flex-1 bg-green-600 hover:bg-green-700"
                                            >
                                                {isLoading ? "Guardando..." : "Guardar"}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => setShowAddMeasurement(false)}
                                                className="border-gray-600 text-black"
                                            >
                                                Cancelar
                                            </Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <div className="space-y-4">
                            {measurements.map((measurement) => (
                                <Card key={measurement.id} className="bg-gray-900 border-gray-800">
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="text-sm text-gray-400">
                                                {new Date(measurement.measurement_date).toLocaleDateString()}
                                            </div>
                                            <Badge variant="outline" className="border-blue-600 text-blue-400">
                                                IMC: {calculateBMI(measurement.weight, measurement.height).toFixed(1)}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Scale className="w-4 h-4 text-blue-400"/>
                                                <span className="text-gray-300">Peso:</span>
                                                <span className="text-white font-medium">{measurement.weight} kg</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Ruler className="w-4 h-4 text-green-400"/>
                                                <span className="text-gray-300">Altura:</span>
                                                <span className="text-white font-medium">{measurement.height} cm</span>
                                            </div>
                                            {measurement.body_fat_percentage && measurement.body_fat_percentage > 0 && (
                                                <div className="flex items-center gap-2">
                                                    <Activity className="w-4 h-4 text-yellow-400"/>
                                                    <span className="text-gray-300">Grasa:</span>
                                                    <span
                                                        className="text-white font-medium">{measurement.body_fat_percentage}%</span>
                                                </div>
                                            )}
                                            {measurement.muscle_mass && measurement.muscle_mass > 0 && (
                                                <div className="flex items-center gap-2">
                                                    <Heart className="w-4 h-4 text-red-400"/>
                                                    <span className="text-gray-300">Músculo:</span>
                                                    <span
                                                        className="text-white font-medium">{measurement.muscle_mass} kg</span>
                                                </div>
                                            )}
                                        </div>

                                        {measurement.notes && (
                                            <div
                                                className="mt-3 p-2 bg-gray-800 rounded text-sm text-gray-300">{measurement.notes}</div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="goals" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-white">Objetivos</h3>
                            <Dialog open={showAddGoal} onOpenChange={setShowAddGoal}>
                                <DialogTrigger asChild>
                                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                                        <Plus className="w-4 h-4 mr-2"/>
                                        Agregar
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-gray-900 border-gray-800 text-white">
                                    <DialogHeader>
                                        <DialogTitle>Nuevo Objetivo</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-gray-300">Tipo de Objetivo</Label>
                                            <select
                                                value={newGoal.goal_type}
                                                onChange={(e) => setNewGoal({
                                                    ...newGoal,
                                                    goal_type: e.target.value as any
                                                })}
                                                className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                                            >
                                                <option value="weight_loss">Pérdida de Peso</option>
                                                <option value="weight_gain">Aumento de Peso</option>
                                                <option value="muscle_gain">Ganancia Muscular</option>
                                                <option value="strength">Fuerza</option>
                                                <option value="endurance">Resistencia</option>
                                                <option value="other">Otro</option>
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-gray-300">Valor Objetivo</Label>
                                                <Input
                                                    type="number"
                                                    step="0.1"
                                                    value={newGoal.target_value || ""}
                                                    onChange={(e) => setNewGoal({
                                                        ...newGoal,
                                                        target_value: Number.parseFloat(e.target.value)
                                                    })}
                                                    className="bg-gray-800 border-gray-700 text-white"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-gray-300">Valor Actual</Label>
                                                <Input
                                                    type="number"
                                                    step="0.1"
                                                    value={newGoal.current_value || ""}
                                                    onChange={(e) => setNewGoal({
                                                        ...newGoal,
                                                        current_value: Number.parseFloat(e.target.value)
                                                    })}
                                                    className="bg-gray-800 border-gray-700 text-white"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-gray-300">Unidad</Label>
                                                <Input
                                                    value={newGoal.unit || ""}
                                                    onChange={(e) => setNewGoal({...newGoal, unit: e.target.value})}
                                                    className="bg-gray-800 border-gray-700 text-white"
                                                    placeholder="kg, lbs, cm, etc."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-gray-300">Fecha Objetivo</Label>
                                                <Input
                                                    type="date"
                                                    value={newGoal.target_date}
                                                    onChange={(e) => setNewGoal({
                                                        ...newGoal,
                                                        target_date: e.target.value
                                                    })}
                                                    className="bg-gray-800 border-gray-700 text-white"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-gray-300">Notas</Label>
                                            <Input
                                                value={newGoal.notes || ""}
                                                onChange={(e) => setNewGoal({...newGoal, notes: e.target.value})}
                                                className="bg-gray-800 border-gray-700 text-white"
                                                placeholder="Descripción del objetivo"
                                            />
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                onClick={handleAddGoal}
                                                disabled={isLoading}
                                                className="flex-1 bg-purple-600 hover:bg-purple-700"
                                            >
                                                {isLoading ? "Guardando..." : "Guardar"}
                                            </Button>
                                            <Button variant="outline" onClick={() => setShowAddGoal(false)}
                                                    className="border-gray-600 text-black">
                                                Cancelar
                                            </Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <div className="space-y-4">
                            {goals.map((goal) => {
                                const progress = getGoalProgress(goal)
                                const isCompleted = progress >= 100
                                const daysRemaining = Math.ceil(
                                    (new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                                )

                                return (
                                    <Card key={goal.id} className="bg-gray-900 border-gray-800">
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h4 className="text-white font-medium capitalize">{goal.goal_type.replace("_", " ")}</h4>
                                                    <p className="text-gray-400 text-sm">{goal.notes}</p>
                                                </div>
                                                <Badge
                                                    variant="outline"
                                                    className={`${
                                                        isCompleted
                                                            ? "border-green-600 text-green-400"
                                                            : daysRemaining < 0
                                                                ? "border-red-600 text-red-400"
                                                                : "border-yellow-600 text-yellow-400"
                                                    }`}
                                                >
                                                    {isCompleted ? (
                                                        <CheckCircle className="w-3 h-3 mr-1"/>
                                                    ) : daysRemaining < 0 ? (
                                                        <AlertCircle className="w-3 h-3 mr-1"/>
                                                    ) : (
                                                        <Calendar className="w-3 h-3 mr-1"/>
                                                    )}
                                                    {isCompleted ? "Completado" : daysRemaining < 0 ? "Vencido" : `${daysRemaining} días`}
                                                </Badge>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-300">Progreso</span>
                                                    <span className="text-white">
                    {goal.current_value} / {goal.target_value} {goal.unit}
                </span>
                                                </div>
                                                <Progress
                                                    value={progress}
                                                    className="h-2 bg-neutral-200" // color de fondo del track
                                                    indicatorClassName="bg-green-500" // color de la barra (Indicator)
                                                />

                                                <div className="text-xs text-gray-400 text-right">{progress.toFixed(1)}%
                                                    completado
                                                </div>
                                            </div>

                                            <div className="mt-3 text-xs text-gray-400">
                                                Fecha objetivo: {new Date(goal.target_date).toLocaleDateString()}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    </TabsContent>

                    <TabsContent value="membership" className="space-y-4">
                        {membershipInfo && (
                            <Card className="bg-gray-900 border-gray-800">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <CreditCard className="w-5 h-5 text-green-400"/>
                                        Estado de Membresía
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-300">Estado:</span>
                                        <Badge
                                            variant="outline"
                                            className={`${
                                                membershipInfo.status === "active"
                                                    ? "border-green-600 text-green-400"
                                                    : membershipInfo.status === "expired"
                                                        ? "border-red-600 text-red-400"
                                                        : "border-yellow-600 text-yellow-400"
                                            }`}
                                        >
                                            {membershipInfo.status === "active"
                                                ? "Activa"
                                                : membershipInfo.status === "expired"
                                                    ? "Expirada"
                                                    : "Pendiente"}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-300">Fecha de inicio:</span>
                                        <span
                                            className="text-white">{new Date(membershipInfo.start_date).toLocaleDateString()}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-300">Fecha de vencimiento:</span>
                                        <span
                                            className="text-white">{new Date(membershipInfo.end_date).toLocaleDateString()}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-300">Cuota mensual:</span>
                                        <span className="text-white font-medium">${membershipInfo.monthly_fee}</span>
                                    </div>

                                    {membershipInfo.status === "active" && (
                                        <div className="p-3 bg-green-900/20 border border-green-800 rounded-lg">
                                            <div className="flex items-center gap-2 text-green-400">
                                                <CheckCircle className="w-4 h-4"/>
                                                <span className="font-medium">Membresía Activa</span>
                                            </div>
                                            <p className="text-green-300 text-sm mt-1">
                                                Te quedan {membershipInfo.days_remaining} días de membresía
                                            </p>
                                        </div>
                                    )}

                                    {membershipInfo.status === "expired" && (
                                        <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg">
                                            <div className="flex items-center gap-2 text-red-400">
                                                <AlertCircle className="w-4 h-4"/>
                                                <span className="font-medium">Membresía Expirada</span>
                                            </div>
                                            <p className="text-red-300 text-sm mt-1">Contacta al gimnasio para renovar
                                                tu membresía</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
