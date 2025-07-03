"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, TrendingUp, Target, Award, Flame, BarChart3, Clock, Weight, Activity, Calendar } from "lucide-react"
// import { supabase } from "@/lib/supabase"

interface ProgressScreenProps {
    onBack: () => void
    userData: any
}

interface WorkoutStats {
    totalWorkouts: number
    completedWorkouts: number
    currentStreak: number
    longestStreak: number
    averageWorkoutTime: number
    totalWorkoutTime: number
}

interface WeightProgress {
    date: string
    weight: number
    bodyFat?: number
    muscleMass?: number
}

interface Goal {
    id: string
    goalType: string
    targetValue: number
    currentValue: number
    unit: string
    targetDate: string
    status: string
    notes?: string
}

// Componente simple para gráfico de líneas
const SimpleLineChart = ({ data, goal }: { data: WeightProgress[]; goal?: Goal }) => {
    if (data.length === 0) return null

    const maxWeight = Math.max(...data.map((d) => d.weight))
    const minWeight = Math.min(...data.map((d) => d.weight))
    const range = maxWeight - minWeight || 1
    const targetWeight = goal?.targetValue

    return (
        <div className="relative h-40 w-full bg-gray-800 rounded-lg p-4">
            <svg className="w-full h-full" viewBox="0 0 400 120">
                {/* Grid lines */}
                {[0, 1, 2, 3, 4].map((i) => (
                    <line key={i} x1="0" y1={i * 24} x2="400" y2={i * 24} stroke="#374151" strokeWidth="1" opacity="0.3" />
                ))}

                {/* Target line */}
                {targetWeight && targetWeight >= minWeight && targetWeight <= maxWeight && (
                    <line
                        x1="0"
                        y1={120 - ((targetWeight - minWeight) / range) * 120}
                        x2="400"
                        y2={120 - ((targetWeight - minWeight) / range) * 120}
                        stroke="#ef4444"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                    />
                )}

                {/* Weight line */}
                <polyline
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    points={data
                        .map((point, index) => {
                            const x = (index / (data.length - 1)) * 400
                            const y = 120 - ((point.weight - minWeight) / range) * 120
                            return `${x},${y}`
                        })
                        .join(" ")}
                />

                {/* Data points */}
                {data.map((point, index) => {
                    const x = (index / (data.length - 1)) * 400
                    const y = 120 - ((point.weight - minWeight) / range) * 120
                    return (
                        <circle key={index} cx={x} cy={y} r="4" fill="#3b82f6" stroke="#1e293b" strokeWidth="2">
                            <title>{`${point.weight}kg - ${new Date(point.date).toLocaleDateString()}`}</title>
                        </circle>
                    )
                })}
            </svg>

            {/* Labels */}
            <div className="absolute bottom-1 left-4 text-xs text-gray-400">
                {data.length > 0 && new Date(data[0].date).toLocaleDateString()}
            </div>
            <div className="absolute bottom-1 right-4 text-xs text-gray-400">
                {data.length > 0 && new Date(data[data.length - 1].date).toLocaleDateString()}
            </div>
            <div className="absolute top-1 left-4 text-xs text-gray-400">{maxWeight}kg</div>
            <div className="absolute bottom-8 left-4 text-xs text-gray-400">{minWeight}kg</div>
            {targetWeight && <div className="absolute top-1 right-4 text-xs text-red-400">Meta: {targetWeight}kg</div>}
        </div>
    )
}

export default function ProgressScreen({ onBack, userData }: ProgressScreenProps) {
    const [workoutStats, setWorkoutStats] = useState<WorkoutStats>({
        totalWorkouts: 0,
        completedWorkouts: 0,
        currentStreak: 0,
        longestStreak: 0,
        averageWorkoutTime: 0,
        totalWorkoutTime: 0,
    })
    const [weightProgress, setWeightProgress] = useState<WeightProgress[]>([])
    const [goals, setGoals] = useState<Goal[]>([])
    const [recentWorkouts, setRecentWorkouts] = useState<any[]>([])

    useEffect(() => {
        loadProgressData()
    }, [userData])

    const loadProgressData = async () => {
        if (!userData?.id) return

        try {
            // MOCK: Cargar estadísticas de entrenamientos
            // const { data: workouts } = await supabase
            //   .from("workouts")
            //   .select("*")
            //   .eq("user_id", userData.id)
            //   .order("workout_date", { ascending: false })

            // Mock data para workouts
            const mockWorkouts = [
                {
                    id: "1",
                    user_id: userData.id,
                    workout_date: "2024-01-15",
                    status: "completed",
                    start_time: "2024-01-15T10:00:00Z",
                    end_time: "2024-01-15T11:30:00Z",
                },
                {
                    id: "2",
                    user_id: userData.id,
                    workout_date: "2024-01-14",
                    status: "completed",
                    start_time: "2024-01-14T09:00:00Z",
                    end_time: "2024-01-14T10:15:00Z",
                },
                {
                    id: "3",
                    user_id: userData.id,
                    workout_date: "2024-01-13",
                    status: "completed",
                    start_time: "2024-01-13T18:00:00Z",
                    end_time: "2024-01-13T19:45:00Z",
                },
            ]

            const workouts = mockWorkouts
            if (workouts) {
                const completed = workouts.filter((w) => w.status === "completed")
                const totalTime = completed.reduce((sum, w) => {
                    if (w.start_time && w.end_time) {
                        const start = new Date(w.start_time)
                        const end = new Date(w.end_time)
                        return sum + (end.getTime() - start.getTime()) / (1000 * 60) // minutos
                    }
                    return sum
                }, 0)

                setWorkoutStats({
                    totalWorkouts: workouts.length,
                    completedWorkouts: completed.length,
                    currentStreak: calculateCurrentStreak(completed),
                    longestStreak: calculateLongestStreak(completed),
                    averageWorkoutTime: completed.length > 0 ? totalTime / completed.length : 0,
                    totalWorkoutTime: totalTime,
                })

                setRecentWorkouts(workouts.slice(0, 5))
            }

            // MOCK: Cargar progreso de peso
            // const { data: measurements } = await supabase
            //   .from("body_measurements")
            //   .select("*")
            //   .eq("user_id", userData.id)
            //   .order("measurement_date", { ascending: true })

            const mockMeasurements = [
                {
                    measurement_date: "2024-01-01",
                    weight: 75.5,
                    body_fat_percentage: 15.2,
                    muscle_mass: 45.8,
                },
                {
                    measurement_date: "2024-01-15",
                    weight: 74.8,
                    body_fat_percentage: 14.9,
                    muscle_mass: 46.1,
                },
                {
                    measurement_date: "2024-02-01",
                    weight: 74.2,
                    body_fat_percentage: 14.5,
                    muscle_mass: 46.5,
                },
            ]

            const measurements = mockMeasurements
            if (measurements) {
                setWeightProgress(
                    measurements
                        .filter((m) => m.weight)
                        .map((m) => ({
                            date: m.measurement_date,
                            weight: m.weight,
                            bodyFat: m.body_fat_percentage,
                            muscleMass: m.muscle_mass,
                        })),
                )
            }

            // MOCK: Cargar objetivos
            // const { data: userGoals } = await supabase
            //   .from("user_goals")
            //   .select("*")
            //   .eq("user_id", userData.id)
            //   .eq("status", "active")

            const mockGoals = [
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
                    current_value: 46.5,
                    unit: "kg",
                    target_date: "2024-12-31",
                    status: "active",
                    notes: "Aumentar masa muscular",
                },
            ]

            const userGoals = mockGoals
            if (userGoals) {
                setGoals(
                    userGoals.map((g) => ({
                        id: g.id,
                        goalType: g.goal_type,
                        targetValue: g.target_value,
                        currentValue: g.current_value,
                        unit: g.unit,
                        targetDate: g.target_date,
                        status: g.status,
                        notes: g.notes,
                    })),
                )
            }
        } catch (error) {
            console.error("Error loading progress data:", error)
        }
    }

    const calculateCurrentStreak = (workouts: any[]) => {
        if (workouts.length === 0) return 0

        let streak = 0
        const today = new Date()
        const sortedWorkouts = workouts.sort(
            (a, b) => new Date(b.workout_date).getTime() - new Date(a.workout_date).getTime(),
        )

        for (let i = 0; i < sortedWorkouts.length; i++) {
            const workoutDate = new Date(sortedWorkouts[i].workout_date)
            const daysDiff = Math.floor((today.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24))

            if (daysDiff <= i + 1) {
                streak++
            } else {
                break
            }
        }

        return streak
    }

    const calculateLongestStreak = (workouts: any[]) => {
        if (workouts.length === 0) return 0

        let maxStreak = 0
        let currentStreak = 0
        const sortedWorkouts = workouts.sort(
            (a, b) => new Date(a.workout_date).getTime() - new Date(b.workout_date).getTime(),
        )

        for (let i = 0; i < sortedWorkouts.length; i++) {
            if (i === 0) {
                currentStreak = 1
            } else {
                const prevDate = new Date(sortedWorkouts[i - 1].workout_date)
                const currentDate = new Date(sortedWorkouts[i].workout_date)
                const daysDiff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))

                if (daysDiff === 1) {
                    currentStreak++
                } else {
                    maxStreak = Math.max(maxStreak, currentStreak)
                    currentStreak = 1
                }
            }
        }

        return Math.max(maxStreak, currentStreak)
    }

    const getGoalProgress = (goal: Goal) => {
        if (goal.goalType === "weight_loss") {
            const totalToLose = goal.currentValue - goal.targetValue
            const currentWeight =
                weightProgress.length > 0 ? weightProgress[weightProgress.length - 1].weight : goal.currentValue
            const currentLoss = goal.currentValue - currentWeight
            return Math.min((currentLoss / totalToLose) * 100, 100)
        } else if (goal.goalType === "weight_gain") {
            const totalToGain = goal.targetValue - goal.currentValue
            const currentWeight =
                weightProgress.length > 0 ? weightProgress[weightProgress.length - 1].weight : goal.currentValue
            const currentGain = currentWeight - goal.currentValue
            return Math.min((currentGain / totalToGain) * 100, 100)
        }
        return Math.min((goal.currentValue / goal.targetValue) * 100, 100)
    }

    const formatWorkoutTime = (minutes: number) => {
        const hours = Math.floor(minutes / 60)
        const mins = Math.round(minutes % 60)
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
    }

    const getWeightGoal = () => {
        return goals.find((g) => g.goalType === "weight_loss" || g.goalType === "weight_gain")
    }

    const getDaysUntilGoal = (targetDate: string) => {
        const today = new Date()
        const target = new Date(targetDate)
        const diffTime = target.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
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
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">Mi Progreso</h1>
                            <p className="text-gray-400 text-sm">Seguimiento de entrenamientos y objetivos</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-gray-900 border-gray-800">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                    <Target className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-white">{workoutStats.completedWorkouts}</p>
                                    <p className="text-gray-400 text-xs">Entrenamientos</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gray-900 border-gray-800">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                                    <Flame className="w-5 h-5 text-orange-400" />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-white">{workoutStats.currentStreak}</p>
                                    <p className="text-gray-400 text-xs">Racha Actual</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gray-900 border-gray-800">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-green-400" />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-white">{formatWorkoutTime(workoutStats.averageWorkoutTime)}</p>
                                    <p className="text-gray-400 text-xs">Tiempo Promedio</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gray-900 border-gray-800">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                    <Award className="w-5 h-5 text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-white">{workoutStats.longestStreak}</p>
                                    <p className="text-gray-400 text-xs">Mejor Racha</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-gray-900">
                        <TabsTrigger value="overview" className="data-[state=active]:bg-gray-800">
                            Resumen
                        </TabsTrigger>
                        <TabsTrigger value="weight" className="data-[state=active]:bg-gray-800">
                            Peso
                        </TabsTrigger>
                        <TabsTrigger value="goals" className="data-[state=active]:bg-gray-800">
                            Objetivos
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        {/* Progress Chart */}
                        <Card className="bg-gray-900 border-gray-800">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-blue-400" />
                                    Progreso Semanal
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day, index) => {
                                        const completed = Math.random() > 0.3 // Mock data
                                        return (
                                            <div key={day} className="flex items-center gap-3">
                                                <span className="text-sm text-gray-400 w-8">{day}</span>
                                                <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${completed ? "bg-green-500" : "bg-gray-700"}`}
                                                        style={{ width: completed ? "100%" : "0%" }}
                                                    />
                                                </div>
                                                <div className="w-4 h-4 rounded-full border-2 border-gray-600 flex items-center justify-center">
                                                    {completed && <div className="w-2 h-2 bg-green-500 rounded-full" />}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Activity */}
                        <Card className="bg-gray-900 border-gray-800">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-purple-400" />
                                    Actividad Reciente
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {recentWorkouts.length > 0 ? (
                                    <div className="space-y-3">
                                        {recentWorkouts.slice(0, 3).map((workout, index) => (
                                            <div key={workout.id} className="flex items-center justify-between p-3 bg-gray-800 rounded">
                                                <div>
                                                    <p className="text-white text-sm font-medium">
                                                        {new Date(workout.workout_date).toLocaleDateString("es-ES", {
                                                            weekday: "long",
                                                            month: "short",
                                                            day: "numeric",
                                                        })}
                                                    </p>
                                                    <p className="text-gray-400 text-xs">
                                                        {workout.start_time && workout.end_time
                                                            ? `${formatWorkoutTime(
                                                                (new Date(workout.end_time).getTime() - new Date(workout.start_time).getTime()) /
                                                                (1000 * 60),
                                                            )}`
                                                            : "Duración no registrada"}
                                                    </p>
                                                </div>
                                                <Badge
                                                    variant={workout.status === "completed" ? "default" : "secondary"}
                                                    className={workout.status === "completed" ? "bg-green-600" : "bg-gray-600"}
                                                >
                                                    {workout.status === "completed" ? "Completado" : "Planificado"}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-400 text-center py-4">No hay entrenamientos recientes</p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="weight" className="space-y-4">
                        {/* Weight Chart */}
                        {weightProgress.length > 0 ? (
                            <Card className="bg-gray-900 border-gray-800">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <Weight className="w-5 h-5 text-blue-400" />
                                        Evolución del Peso
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <SimpleLineChart data={weightProgress} goal={getWeightGoal()} />
                                    <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                                        <div>
                                            <p className="text-gray-400 text-xs">Peso Inicial</p>
                                            <p className="text-white font-medium">{weightProgress[0]?.weight}kg</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-xs">Peso Actual</p>
                                            <p className="text-white font-medium">{weightProgress[weightProgress.length - 1]?.weight}kg</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-xs">Cambio Total</p>
                                            <p
                                                className={`font-medium ${
                                                    weightProgress[weightProgress.length - 1]?.weight < weightProgress[0]?.weight
                                                        ? "text-green-400"
                                                        : "text-red-400"
                                                }`}
                                            >
                                                {(
                                                    (weightProgress[weightProgress.length - 1]?.weight || 0) - (weightProgress[0]?.weight || 0)
                                                ).toFixed(1)}
                                                kg
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="bg-gray-900 border-gray-800">
                                <CardContent className="p-6 text-center">
                                    <Weight className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                    <p className="text-gray-400">No hay datos de peso registrados</p>
                                    <p className="text-gray-500 text-sm mt-1">Ve a tu perfil para agregar mediciones</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Weight History */}
                        {weightProgress.length > 0 && (
                            <Card className="bg-gray-900 border-gray-800">
                                <CardHeader>
                                    <CardTitle className="text-white">Historial de Peso</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {weightProgress
                                            .slice()
                                            .reverse()
                                            .map((entry, index) => (
                                                <div key={index} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                                                    <span className="text-white font-medium">{entry.weight} kg</span>
                                                    <span className="text-gray-400 text-sm">
                            {new Date(entry.date).toLocaleDateString("es-ES")}
                          </span>
                                                </div>
                                            ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="goals" className="space-y-4">
                        {goals.length > 0 ? (
                            goals.map((goal) => (
                                <Card key={goal.id} className="bg-gray-900 border-gray-800">
                                    <CardContent className="p-4">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-white font-medium capitalize">{goal.goalType.replace("_", " ")}</h3>
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
                            {weightProgress.length > 0 &&
                            (goal.goalType === "weight_loss" || goal.goalType === "weight_gain")
                                ? `${weightProgress[weightProgress.length - 1].weight}kg`
                                : `${goal.currentValue}`}{" "}
                                                        → {goal.targetValue} {goal.unit}
                          </span>
                                                </div>
                                                <Progress value={getGoalProgress(goal)} className="h-2" />
                                                <div className="flex items-center justify-between text-xs text-gray-500">
                                                    <span>{Math.round(getGoalProgress(goal))}% completado</span>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        <span>
                              {getDaysUntilGoal(goal.targetDate) > 0
                                  ? `${getDaysUntilGoal(goal.targetDate)} días restantes`
                                  : "¡Fecha alcanzada!"}
                            </span>
                                                    </div>
                                                </div>
                                                {goal.notes && <p className="text-gray-400 text-sm mt-2">{goal.notes}</p>}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <Card className="bg-gray-900 border-gray-800">
                                <CardContent className="p-6 text-center">
                                    <Target className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                    <p className="text-gray-400">No tienes objetivos activos</p>
                                    <p className="text-gray-500 text-sm mt-1">Ve a tu perfil para crear objetivos</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
