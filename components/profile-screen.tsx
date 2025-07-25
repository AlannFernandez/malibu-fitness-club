"use client"

import {useState, useEffect} from "react"
import {userService} from "@/lib/users";
import {bodyMeasurementService, BodyMeasurement as SupabaseBodyMeasurement} from "@/lib/body-measurements";
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {Progress} from "@/components/ui/progress"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {Alert, AlertDescription} from "@/components/ui/alert"
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {
    ArrowLeft,
    User,
    Edit3,
    Save,
    X,
    Calendar,
    Scale,
    Activity,
    Heart,
    Plus,
    CheckCircle,
    AlertCircle,
    CreditCard,
} from "lucide-react"

import {userGoalsService} from "@/lib/users-goals";
import {UserGoal} from "@/interfaces/users-goals";

import {BodyMeasurement} from "@/interfaces/body-measurement";
import {goalTypeMap} from "@/lib/utils"

interface ProfileScreenProps {
    onBack: () => void
    onLogout: () => void
    userData: any
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
        gender: userData?.gender || "",
        birth_date: userData?.birth_date || "",
    })

    const [lastWeight, setLastWeight] = useState<number | null>(null)


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
        if (userData?.id) {
            loadProfileData();
        }
    }, [userData]);

    useEffect(() => {
        if (measurements.length > 0) {
            setLastWeight(measurements[measurements.length - 1].weight)
            setNewGoal({...newGoal, current_value: Number(measurements[measurements.length - 1].weight)})
        } else {
            setLastWeight(null)
        }
    }, [measurements])

    const loadProfileData = async () => {
        try {
            const promises = [
                bodyMeasurementService.getMeasurementsByUser(userData.id),
                userGoalsService.getGoalsByUser(userData.id),
                userService.getUserById(userData.id),
            ];

            const [supabaseMeasurements, supabaseGoals, user] = await Promise.all(promises);
            setMeasurements(supabaseMeasurements);


            const mappedGoals: UserGoal[] = supabaseGoals.map((goal: { goal_type: string; status: string; }) => ({
                ...goal,
                goal_type: goal.goal_type as UserGoal["goal_type"],
                status: goal.status as UserGoal["status"],
            }));
            setGoals(mappedGoals);

            // MOCK: Cargar información de membresía
            const mockMembership: MembershipInfo = {
                id: "1",
                status: "active",
                start_date: "2024-01-01",
                end_date: "2024-12-31",
                monthly_fee: 50,
                days_remaining: 45,
            };
            setMembershipInfo(mockMembership);

            // Cargar datos adicionales del perfil si existe en localStorage
            const savedProfile = localStorage.getItem(`profile_${userData.id}`);
            if (savedProfile) {
                setProfileData((prev) => ({
                    ...prev,
                    full_name: user.full_name || prev.full_name,
                    phone: user.phone || prev.phone,
                    gender: user.gender || prev.gender,
                    birth_date: user.birth_date || prev.birth_date,
                    email: userData?.email || prev.email,
                }));
            }
        } catch (error) {
            console.error("Error loading profile data:", error);
        }
    };


    const handleSaveProfile = async () => {
        setIsLoading(true)
        setMessage(null)

        try {
            if (profileData.birth_date) {
                const birthDate = new Date(profileData.birth_date)
                const today = new Date()

                if (birthDate > today) {
                    setMessage({ type: "error", text: "La fecha de nacimiento no puede ser mayor a la fecha actual" })
                    setIsLoading(false)
                    return
                }
            }

            await userService.updateUserById(userData.id, {
                full_name: profileData.full_name,
                phone: profileData.phone,
                gender: profileData.gender,
                birth_date: profileData.birth_date,
                updated_at: new Date().toISOString(),
            })

            setMessage({type: "success", text: "Perfil actualizado correctamente"})
            setIsEditing(false)
        } catch (error: any) {
            setMessage({type: "error", text: "Error al actualizar el perfil"})
            setMessage({ type: "error", text: "Error al actualizar el perfil" })
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
            // Guardar medición en Supabase
            const measurementToAdd: Omit<SupabaseBodyMeasurement, "id" | "created_at"> = {
                user_id: userData.id,
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
            };
            const newSaved = await bodyMeasurementService.addMeasurement(measurementToAdd);
            setMeasurements([newSaved, ...measurements]);
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
    const getUserGoals = async () => {
        return await userGoalsService.getGoalsByUser(userData.id)
    }
    const disabledUserGoal = async (goalId: string) => {
        const goalStatus = {status: 'cancelled'} as UserGoal
        await userGoalsService.updateGoal(goalId, goalStatus)
    }
    const handleAddGoal = async () => {
        if (!newGoal.target_value || !newGoal.target_date) {
            setMessage({type: "error", text: "Valor objetivo y fecha son obligatorios"})
            return
        }

        if (newGoal.target_date) {
            const targetDate = new Date(newGoal.target_date)
            const today = new Date()

            if (targetDate <= today) {
                setMessage({ type: "error", text: "La fecha objetivo debe ser mayor a la fecha actual" })
                return
            }
        }

        if (newGoal.target_value <= 0) {
            setMessage({ type: "error", text: "El valor objetivo debe ser mayor a cero" })
            return
        }

        setIsLoading(true)
        setMessage(null)

        try {

            const goals = await getUserGoals()

            if (goals.length > 0) {
                await disabledUserGoal(goals[0].id)
            }

            const goalToAdd: Omit<UserGoal, "id" | "created_at" | "updated_at"> = {
                user_id: userData.id,
                goal_type: newGoal.goal_type!,
                target_value: newGoal.target_value!,
                current_value: newGoal.current_value!,
                unit: newGoal.unit!,
                target_date: newGoal.target_date!,
                status: "active",
                notes: newGoal.notes || "",
            }

            const savedGoal = await userGoalsService.addGoal(goalToAdd)
            setGoals([{
                ...savedGoal,
                goal_type: savedGoal.goal_type as UserGoal["goal_type"],
                status: savedGoal.status as UserGoal["status"]
            }, ...goals])

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
        if (goal.goal_type === "weight_loss") {
            const totalToLose = goal.current_value - goal.target_value
            const currentWeight = measurements.length > 0 ? measurements[0].weight : goal.current_value
            const currentLoss = goal.current_value - currentWeight
            return Math.min((currentLoss / totalToLose) * 100, 100)
        } else if (goal.goal_type === "weight_gain") {
            const totalToGain = goal.target_value - goal.current_value
            const currentWeight = measurements.length > 0 ? measurements[0].weight : goal.current_value
            const currentGain = currentWeight - goal.current_value
            return Math.min((currentGain / totalToGain) * 100, 100)
        }
        return Math.min((goal.current_value / goal.target_value) * 100, 100)
    }

    const getDaysUntilGoal = (targetDate: string) => {
        const today = new Date()
        const target = new Date(targetDate)
        const diffTime = target.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
    }

    const calculateAge = (birthDate: string) => {
        if (!birthDate) return null
        const today = new Date()
        const birth = new Date(birthDate)
        let age = today.getFullYear() - birth.getFullYear()
        const monthDiff = today.getMonth() - birth.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--
        }
        return age
    }

    const handleNumericCommaInput = (field: keyof typeof newMeasurement, value: string) => {

        const isValid = /^[0-9]*[.]?[0-9]*$/.test(value);

        if (isValid) {
            setNewMeasurement((prev) => ({
                ...prev,
                [field]: value,
            }));
        }
    };

    const latestMeasurement = measurements.length > 0 ? measurements[0] : null
    return (
        <div className="min-h-screen bg-gray-950 text-white pb-20">
            {/* Header simplificado */}
            <div className="bg-gray-900 border-b border-gray-800 p-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onBack} className="text-gray-400 hover:text-white">
                        <ArrowLeft className="w-5 h-5"/>
                    </Button>
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-white"/>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">Mi Perfil</h1>
                            <p className="text-gray-400 text-sm">Información personal y objetivos</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-6">
                {/* Message Alert */}
                {message && !showAddGoal && !showAddMeasurement && (
                    <Alert
                        className={`${message.type === "error" ? "border-red-500 bg-red-500/10" : "border-green-500 bg-green-500/10"}`}
                    >
                        {message.type === "error" ? (
                            <AlertCircle className="h-4 w-4 text-red-500"/>
                        ) : (
                            <CheckCircle className="h-4 w-4 text-green-500"/>
                        )}
                        <AlertDescription className={message.type === "error" ? "text-red-400" : "text-green-400"}>
                            {message.text}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Tabs */}
                <Tabs defaultValue="profile" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 bg-gray-900">
                        <TabsTrigger value="profile"
                                     className="data-[state=active]:bg-gray-700 text-white data-[state=active]:text-white">
                            Perfil
                        </TabsTrigger>
                        <TabsTrigger value="measurements"
                                     className="data-[state=active]:bg-gray-700 text-white data-[state=active]:text-white">
                            Medidas
                        </TabsTrigger>
                        <TabsTrigger value="goals"
                                     className="data-[state=active]:bg-gray-700 text-white data-[state=active]:text-white">
                            Objetivos
                        </TabsTrigger>
                        <TabsTrigger value="membership"
                                     className="data-[state=active]:bg-gray-700 text-white data-[state=active]:text-white">
                            Membresía
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile" className="space-y-4">
                        {/* Profile Info */}
                        <Card className="bg-gray-900 border-gray-800">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <User className="w-5 h-5 text-purple-400"/>
                                        Información Personal
                                    </CardTitle>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsEditing(!isEditing)}
                                        className="text-gray-400 hover:text-white"
                                    >
                                        {isEditing ? <X className="w-4 h-4"/> : <Edit3 className="w-4 h-4"/>}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="full_name" className="text-gray-300">
                                        Nombre Completo
                                    </Label>
                                    <Input
                                        id="full_name"
                                        value={profileData.full_name}
                                        onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                                        disabled={!isEditing}
                                        className="bg-gray-800 border-gray-700 text-white disabled:opacity-60"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-gray-300">
                                        Email
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={profileData.email}
                                        disabled
                                        className="bg-gray-800 border-gray-700 text-white opacity-60"
                                    />
                                    <p className="text-xs text-gray-500">El email no se puede modificar</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-gray-300">
                                        Teléfono
                                    </Label>
                                    <Input
                                        id="phone"
                                        value={profileData.phone}
                                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                                        disabled={!isEditing}
                                        className="bg-gray-800 border-gray-700 text-white disabled:opacity-60"
                                        placeholder="Número de teléfono"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="gender" className="text-gray-300">
                                            Género
                                        </Label>
                                        {isEditing ? (
                                            <Select
                                                value={profileData.gender}
                                                onValueChange={(value) => setProfileData({
                                                    ...profileData,
                                                    gender: value
                                                })}
                                            >
                                                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                                                    <SelectValue placeholder="Seleccionar género"/>
                                                </SelectTrigger>
                                                <SelectContent className="bg-gray-800 border-gray-700">
                                                    <SelectItem value="masculino"
                                                                className="text-white hover:bg-gray-700">
                                                        Masculino
                                                    </SelectItem>
                                                    <SelectItem value="femenino"
                                                                className="text-white hover:bg-gray-700">
                                                        Femenino
                                                    </SelectItem>
                                                    <SelectItem value="otro" className="text-white hover:bg-gray-700">
                                                        Otro
                                                    </SelectItem>
                                                    <SelectItem value="prefiero_no_decir"
                                                                className="text-white hover:bg-gray-700">
                                                        Prefiero no decir
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <div
                                                className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white">
                                                {profileData.gender ? (
                                                    profileData.gender === "masculino" ? (
                                                        "Masculino"
                                                    ) : profileData.gender === "femenino" ? (
                                                        "Femenino"
                                                    ) : profileData.gender === "otro" ? (
                                                        "Otro"
                                                    ) : profileData.gender === "prefiero_no_decir" ? (
                                                        "Prefiero no decir"
                                                    ) : (
                                                        profileData.gender
                                                    )
                                                ) : (
                                                    <span className="text-gray-500">No especificado</span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="birth_date" className="text-gray-300">
                                            Fecha de Nacimiento
                                        </Label>
                                        <Input
                                            id="birth_date"
                                            type="date"
                                            value={profileData.birth_date}
                                            onChange={(e) => setProfileData({ ...profileData, birth_date: e.target.value })}
                                            disabled={!isEditing}
                                            max={new Date().toISOString().split('T')[0]}
                                            className="bg-gray-800 border-gray-700 text-white disabled:opacity-60"
                                        />
                                        {profileData.birth_date && (
                                            <p className="text-xs text-gray-400">Edad: {calculateAge(profileData.birth_date)} años</p>
                                        )}
                                    </div>
                                </div>

                                {isEditing && (
                                    <Button
                                        onClick={handleSaveProfile}
                                        disabled={isLoading}
                                        className="w-full bg-purple-600 hover:bg-purple-700"
                                    >
                                        {isLoading ? (
                                            "Guardando..."
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2"/>
                                                Guardar Cambios
                                            </>
                                        )}
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

                        {/* Quick Stats */}
                        {latestMeasurement && (
                            <Card className="bg-gray-900 border-gray-800">

                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-green-400"/>
                                        Estadísticas Actuales
                                    </CardTitle>
                                </CardHeader>

                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-white">{latestMeasurement.weight} kg</p>
                                            <p className="text-gray-400 text-sm">Peso</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-white">{latestMeasurement.height} cm</p>
                                            <p className="text-gray-400 text-sm">Altura</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-white">
                                                {calculateBMI(latestMeasurement.weight, latestMeasurement.height).toFixed(1)}
                                            </p>
                                            <p className="text-gray-400 text-sm">IMC</p>
                                        </div>
                                        <div className="text-center">
                                            <p
                                                className={`text-sm font-medium ${
                                                    getBMICategory(calculateBMI(latestMeasurement.weight, latestMeasurement.height)).color
                                                }`}
                                            >
                                                {getBMICategory(calculateBMI(latestMeasurement.weight, latestMeasurement.height)).category}
                                            </p>
                                            <p className="text-gray-400 text-sm">Categoría</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="measurements" className="space-y-4">
                        {/* Add Measurement Button */}
                        <Dialog open={showAddMeasurement} onOpenChange={setShowAddMeasurement}>
                            <DialogTrigger asChild>
                                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                    <Plus className="w-4 h-4 mr-2"/>
                                    Agregar Medición
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-gray-900 border-gray-800 text-white">
                                <DialogHeader>
                                    <DialogTitle>Nueva Medición Corporal</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="weight">Peso (kg) *</Label>
                                            <Input
                                                id="weight"
                                                type="text"
                                                step="0.1"
                                                maxLength={5}
                                                value={newMeasurement.weight || ""}
                                                onChange={(e) => handleNumericCommaInput("weight", e.target.value)}
                                                className="bg-gray-800 border-gray-700"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="height">Altura (cm) *</Label>
                                            <Input
                                                id="height"
                                                type="text"
                                                maxLength={5}
                                                value={newMeasurement.height || ""}
                                                onChange={(e) => handleNumericCommaInput("height", e.target.value)}
                                                className="bg-gray-800 border-gray-700"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="body_fat">% Grasa Corporal</Label>
                                            <Input
                                                id="body_fat"
                                                type="text"
                                                maxLength={5}
                                                value={newMeasurement.body_fat_percentage || ""}
                                                onChange={(e) =>
                                                    handleNumericCommaInput("body_fat_percentage", e.target.value)
                                                }
                                                className="bg-gray-800 border-gray-700"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="muscle_mass">Masa Muscular (kg)</Label>
                                            <Input
                                                id="muscle_mass"
                                                type="text"
                                                step="0.1"
                                                maxLength={5}
                                                value={newMeasurement.muscle_mass || ""}
                                                onChange={(e) => handleNumericCommaInput("muscle_mass", e.target.value)}
                                                className="bg-gray-800 border-gray-700"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="measurement_date">Fecha</Label>
                                        <Input
                                            id="measurement_date"
                                            type="date"
                                            value={newMeasurement.measurement_date}
                                            onChange={(e) => setNewMeasurement({
                                                ...newMeasurement,
                                                measurement_date: e.target.value
                                            })}
                                            className="bg-gray-800 border-gray-700"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={handleAddMeasurement}
                                            disabled={isLoading}
                                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                                        >
                                            {isLoading ? "Guardando..." : "Guardar"}
                                        </Button>
                                        <Button variant="ghost" onClick={() => setShowAddMeasurement(false)}
                                                className="flex-1 bg-red-600 hover:bg-red-700 hover:text-white">
                                            Cancelar
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>

                        {/* Measurements History */}
                        {measurements.length > 0 ? (
                            <div className="space-y-4">
                                {measurements.map((measurement) => (
                                    <Card key={measurement.id} className="bg-gray-900 border-gray-800">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <Scale className="w-5 h-5 text-blue-400"/>
                                                    <span className="text-white font-medium">
                                                        {new Date(measurement.measurement_date).toLocaleDateString("es-ES")}
                                                    </span>
                                                </div>
                                                <Badge variant="secondary" className="bg-gray-700 text-white ">
                                                    IMC: {calculateBMI(measurement.weight, measurement.height).toFixed(1)}
                                                </Badge>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="text-gray-400">Peso</p>
                                                    <p className="text-white font-medium">{measurement.weight} kg</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-400">Altura</p>
                                                    <p className="text-white font-medium">{measurement.height} cm</p>
                                                </div>
                                                {measurement.body_fat_percentage  && measurement.body_fat_percentage > 0 &&(
                                                    <div>
                                                        <p className="text-gray-400">% Grasa</p>
                                                        <p className="text-white font-medium">{measurement.body_fat_percentage}%</p>
                                                    </div>
                                                )}
                                                {measurement.muscle_mass && (
                                                    <div>
                                                        <p className="text-gray-400">Masa Muscular</p>
                                                        <p className="text-white font-medium">{measurement.muscle_mass} kg</p>
                                                    </div>
                                                )}
                                            </div>
                                            {measurement.notes &&
                                                <p className="text-gray-400 text-sm mt-3 italic">{measurement.notes}</p>}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card className="bg-gray-900 border-gray-800">
                                <CardContent className="p-6 text-center">
                                    <Scale className="w-12 h-12 text-gray-600 mx-auto mb-3"/>
                                    <p className="text-gray-400">No hay mediciones registradas</p>
                                    <p className="text-gray-500 text-sm mt-1">Agrega tu primera medición para comenzar
                                        el seguimiento</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="goals" className="space-y-4">
                        {/* Add Goal Button */}
                        <Dialog open={showAddGoal} onOpenChange={setShowAddGoal}>
                            <DialogTrigger asChild>
                                <Button className="w-full bg-green-600 hover:bg-green-700">
                                    <Plus className="w-4 h-4 mr-2"/>
                                    Agregar Objetivo
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-gray-900 border-gray-800 text-white">
                                <DialogHeader>
                                    <DialogTitle>Nuevo Objetivo</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
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

                                    <div className="space-y-2">
                                        <Label htmlFor="goal_type">Tipo de Objetivo</Label>
                                        <Select
                                            value={newGoal.goal_type}
                                            onValueChange={(value) => setNewGoal({...newGoal, goal_type: value as any})}
                                        >
                                            <SelectTrigger className="bg-gray-800 border-gray-700">
                                                <SelectValue/>
                                            </SelectTrigger>
                                            <SelectContent className="bg-gray-800 border-gray-700">
                                                <SelectItem value="weight_loss" className="text-white hover:bg-gray-700">Pérdida de Peso</SelectItem>
                                                <SelectItem value="weight_gain" className="text-white hover:bg-gray-700">Aumento de Peso</SelectItem>
                                                <SelectItem value="muscle_gain" className="text-white hover:bg-gray-700">Ganancia Muscular</SelectItem>
                                                <SelectItem value="strength" className="text-white hover:bg-gray-700">Fuerza</SelectItem>
                                                <SelectItem value="endurance" className="text-white hover:bg-gray-700">Resistencia</SelectItem>
                                                <SelectItem value="other" className="text-white hover:bg-gray-700">Otro</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="current_value">Valor Actual</Label>
                                            <Input
                                                id="current_value"
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                value={lastWeight || ""}
                                                onChange={(e) => setNewGoal({
                                                    ...newGoal,
                                                    current_value: Number(e.target.value)
                                                })}
                                                className="bg-gray-800 border-gray-700"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="target_value">Valor Objetivo</Label>
                                            <Input
                                                id="target_value"
                                                type="number"
                                                step="0.1"
                                                min="0.1"
                                                value={newGoal.target_value || ""}
                                                onChange={(e) => setNewGoal({
                                                    ...newGoal,
                                                    target_value: Number.parseFloat(e.target.value)
                                                })}
                                                className="bg-gray-800 border-gray-700"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="unit">Unidad</Label>
                                            <Input
                                                id="unit"
                                                value={newGoal.unit}
                                                onChange={(e) => setNewGoal({...newGoal, unit: e.target.value})}
                                                className="bg-gray-800 border-gray-700"
                                                placeholder="kg, cm, reps, etc."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="target_date">Fecha Objetivo</Label>
                                            <Input
                                                id="target_date"
                                                type="date"
                                                min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                                                value={newGoal.target_date}
                                                onChange={(e) => setNewGoal({...newGoal, target_date: e.target.value})}
                                                className="bg-gray-800 border-gray-700"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="notes">Comentario</Label>
                                        <Input
                                            id="notes"
                                            value={newGoal.notes || ""}
                                            onChange={(e) => setNewGoal({...newGoal, notes: e.target.value})}
                                            className="bg-gray-800 border-gray-700"
                                            placeholder="Agrega un comentario opcional"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={handleAddGoal}
                                            disabled={isLoading}
                                            className="flex-1 bg-green-600 hover:bg-green-700"
                                        >
                                            {isLoading ? "Guardando..." : "Guardar"}
                                        </Button>

                                        <Button variant="ghost" onClick={() => setShowAddGoal(false)} className="flex-1 bg-red-600 hover:bg-red-700 hover:text-white">
                                            Cancelar
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>

                        {/* Goals List */}
                        {goals.length > 0 ? (

                            <div className="space-y-4">
                                {goals.map((goal) => (
                                    <Card key={goal.id} className="bg-gray-900 border-gray-800">
                                        <CardContent className="p-4">
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-white font-medium capitalize">{goalTypeMap[goal.goal_type]}</h3>
                                                    <Badge
                                                        variant={goal.status === "active" ? "default" : "secondary"}
                                                        className={goal.status === "active" ? "bg-green-600" : ""}
                                                    >
                                                        {goal.status === "active" ? "Activo" : "Completado"}
                                                    </Badge>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-gray-400">Progreso</span>
                                                        <span className="text-white">
                              {goal.current_value} → {goal.target_value} {goal.unit}
                            </span>
                                                    </div>
                                                    <Progress value={getGoalProgress(goal)}
                                                              className="h-2 bg-neutral-200  "
                                                              indicatorClassName="bg-green-500"/>
                                                    <div
                                                        className="flex items-center justify-between text-xs text-gray-500">
                                                        <span>{Math.round(getGoalProgress(goal))}% completado</span>
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3"/>
                                                            <span>
                                {getDaysUntilGoal(goal.target_date) > 0
                                    ? `${getDaysUntilGoal(goal.target_date)} días restantes`
                                    : "¡Fecha alcanzada!"}
                              </span>
                                                        </div>
                                                    </div>
                                                    {goal.notes &&
                                                        <p className="text-gray-400 text-sm mt-2">{goal.notes}</p>}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card className="bg-gray-900 border-gray-800">
                                <CardContent className="p-6 text-center">
                                    <Heart className="w-12 h-12 text-gray-600 mx-auto mb-3"/>
                                    <p className="text-gray-400">No tienes objetivos definidos</p>
                                    <p className="text-gray-500 text-sm mt-1">Crea tu primer objetivo para mantenerte
                                        motivado</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="membership" className="space-y-4">
                        {/* Membership Status */}
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
                                        <span className="text-gray-400">Estado</span>
                                        <Badge
                                            variant={membershipInfo.status === "active" ? "default" : "secondary"}
                                            className={
                                                membershipInfo.status === "active"
                                                    ? "bg-green-600"
                                                    : membershipInfo.status === "expired"
                                                        ? "bg-red-600"
                                                        : "bg-yellow-600"
                                            }
                                        >
                                            {membershipInfo.status === "active"
                                                ? "Activa"
                                                : membershipInfo.status === "expired"
                                                    ? "Expirada"
                                                    : "Pendiente"}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400">Fecha de Inicio</span>
                                        <span className="text-white">
                      {new Date(membershipInfo.start_date).toLocaleDateString("es-ES")}
                    </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400">Fecha de Vencimiento</span>
                                        <span
                                            className="text-white">{new Date(membershipInfo.end_date).toLocaleDateString("es-ES")}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400">Cuota Mensual</span>
                                        <span className="text-white font-medium">${membershipInfo.monthly_fee}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400">Días Restantes</span>
                                        <span
                                            className={`font-medium ${
                                                membershipInfo.days_remaining > 30
                                                    ? "text-green-400"
                                                    : membershipInfo.days_remaining > 7
                                                        ? "text-yellow-400"
                                                        : "text-red-400"
                                            }`}
                                        >
                      {membershipInfo.days_remaining} días
                    </span>
                                    </div>
                                    {membershipInfo.days_remaining <= 30 && (
                                        <Alert className="border-yellow-500 bg-yellow-500/10">
                                            <AlertCircle className="h-4 w-4 text-yellow-500"/>
                                            <AlertDescription className="text-yellow-400">
                                                Tu membresía vence pronto. Contacta al gimnasio para renovar.
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Account Actions */}
                        <Card className="bg-gray-900 border-gray-800">
                            <CardHeader>
                                <CardTitle className="text-white">Acciones de Cuenta</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <button
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '12px 24px',
                                        borderRadius: '8px',
                                        backgroundColor: '#009ee3', // Color azul de Mercado Pago
                                        color: '#fff',
                                        border: 'none',
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        fontFamily: 'Arial, sans-serif',
                                        cursor: 'pointer',
                                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                                        transition: 'background-color 0.3s ease',
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#007bbb')} // Un poco más oscuro al pasar el mouse
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#009ee3')}
                                >
                                    <img
                                        src="https://img.icons8.com/color/48/000000/mercado-pago.png" // Icono de Mercado Pago (puedes reemplazarlo)
                                        alt="Mercado Pago Logo"
                                        style={{width: '24px', height: '24px', marginRight: '8px'}}
                                    />
                                    Pagar con Mercado Pago
                                </button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
