"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Play,
  Clock,
  Target,
  ChevronLeft,
  ChevronRight,
  Home,
  TrendingUp,
  User,
  Settings,
  LogOut,
  CheckCircle,
  Pause,
  RotateCcw,
  Save,
  X,
  Timer,
  FastForward,
  Lock,
  Eye,
} from "lucide-react"

// Importar las nuevas pantallas y servicios
import ProgressScreen from "./progress-screen"
import ProfileScreen from "./profile-screen"
import SettingsScreen from "./settings-screen"
import { studentRoutineService, type WeeklyRoutine } from "@/lib/student-routines"
import { workoutService } from "@/lib/workout"
import { WorkoutExercise, workoutExerciseService } from "@/lib/workout-excercise"
const daysOfWeek = [
  { id: "lun", name: "LUN", fullName: "Lunes" },
  { id: "mar", name: "MAR", fullName: "Martes" },
  { id: "mie", name: "MIÉ", fullName: "Miércoles" },
  { id: "jue", name: "JUE", fullName: "Jueves" },
  { id: "vie", name: "VIE", fullName: "Viernes" },
  { id: "sab", name: "SÁB", fullName: "Sábado" },
  { id: "dom", name: "DOM", fullName: "Domingo" },
]

// Interfaces para el tracking de ejercicios
interface ExerciseSet {
  setNumber: number
  weight: string
  reps: string
  completed: boolean
  startTime?: Date
  endTime?: Date
}

interface ExerciseProgress {
  exerciseId: string
  dayId: string // Agregar el día al que pertenece el ejercicio
  status: "not_started" | "in_progress" | "resting" | "completed"
  currentSet: number
  sets: ExerciseSet[]
  startTime?: Date
  endTime?: Date
  totalTime?: number
  restStartTime?: Date
  restDuration?: number // en segundos
}

interface RoutinesScreenProps {
  onLogout: () => void
  userData?: any
}

export default function RoutinesScreen({ onLogout, userData }: RoutinesScreenProps) {
  const [selectedDay, setSelectedDay] = useState("lun")
  const [activeTab, setActiveTab] = useState("routines")
  const [routineData, setRoutineData] = useState<WeeklyRoutine | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isStartingWorkout, setIsStartingWorkout] = useState(false)

  // Estados para tracking de ejercicios - ahora global para todos los días
  const [exerciseProgress, setExerciseProgress] = useState<Record<string, ExerciseProgress>>({})
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null)
  const [showSetDialog, setShowSetDialog] = useState(false)
  const [currentSetData, setCurrentSetData] = useState({ weight: "", reps: "" })
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null)
  const [activeWorkoutDay, setActiveWorkoutDay] = useState<string | null>(null)
  const [workoutId, setWorkoutId] = useState<string | null>(null)

  // Estados para el cronómetro de descanso
  const [restTimer, setRestTimer] = useState<number>(0)
  const [isResting, setIsResting] = useState(false)
  const [restingExerciseId, setRestingExerciseId] = useState<string | null>(null)

  // Cargar rutina del estudiante
  useEffect(() => {
    const loadRoutine = async () => {
      if (!userData?.id) return

      setIsLoading(true)
      setError(null)

      try {
        const weeklyRoutine = await studentRoutineService.getCurrentWeeklyRoutine(userData.id)
        if (weeklyRoutine) {
          setRoutineData(weeklyRoutine)
         

        } else {
          setError("No se encontró una rutina activa")
        }
      } catch (err) {
        setError("Error al cargar la rutina")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    loadRoutine()
  }, [userData?.id])

  const currentRoutine = routineData?.[selectedDay as keyof WeeklyRoutine] || {
    title: "Sin rutina",
    duration: "0 min",
    exercises: [],
  }

  // Función para obtener el día actual (simulado - en producción sería new Date().getDay())
  const getCurrentDay = (): string => {
    const today = new Date()
    const dayIndex = today.getDay() // 0 = domingo, 1 = lunes, etc.
    const dayMapping = ["dom", "lun", "mar", "mie", "jue", "vie", "sab"]
    return dayMapping[dayIndex]
  }

  const todayId = getCurrentDay()
  const isCurrentDay = selectedDay === todayId
  const isViewingMode = !isCurrentDay

  // Función para parsear tiempo de descanso a segundos
  const parseRestTime = (restString: string): number => {
    const cleanRest = restString.toLowerCase().replace(/\s/g, "")

    if (cleanRest.includes("min")) {
      const minutes = Number.parseFloat(cleanRest.replace(/[^0-9.-]/g, ""))
      return Math.floor(minutes * 60)
    } else if (cleanRest.includes("s")) {
      return Number.parseInt(cleanRest.replace(/[^0-9]/g, ""))
    } else {
      // Si no tiene unidad, asumir segundos
      const num = Number.parseInt(cleanRest.replace(/[^0-9]/g, ""))
      return isNaN(num) ? 120 : num // default 2 minutos
    }
  }

  // Función para verificar si todos los ejercicios del día están completados
  const areAllExercisesCompleted = () => {
    if (!routineData || !activeWorkoutDay) return false

    const dayRoutine = routineData[activeWorkoutDay as keyof WeeklyRoutine]
    if (!dayRoutine || dayRoutine.exercises.length === 0) return false

    return dayRoutine.exercises.every((exercise) => {
      const exerciseKey = `${activeWorkoutDay}-${exercise.id}`
      const progress = exerciseProgress[exerciseKey]
      console.log(exerciseProgress[exerciseKey])
      return progress?.status === "completed"
    })
  }

  // Función para finalizar el workout completo
  const finishWorkout = async () => {
    if (!workoutId || !workoutStartTime) return

    const endTime = new Date()
    const totalWorkoutTime = Math.floor((endTime.getTime() - workoutStartTime.getTime()) / 1000)

    console.log("🏁 FINALIZANDO WORKOUT COMPLETO:", {
      workoutId,
      startTime: workoutStartTime.toISOString(),
      endTime: endTime.toISOString(),
      totalTime: totalWorkoutTime,
      day: activeWorkoutDay,
      status: "completed",
    })
    await workoutService.updateWorkout(workoutId, {end_time: endTime, status:'completed'})

    // Simular llamada a Supabase para actualizar el workout
    console.log("📝 Actualizando workout en Supabase:", {
      table: "workouts",
      id: workoutId,
      data: {
        end_time: endTime.toISOString(),
        status: "completed",
        total_time: totalWorkoutTime,
      },
    })

    // Limpiar estados del workout
    setWorkoutStartTime(null)
    setActiveWorkoutDay(null)
    setWorkoutId(null)
  }

  // Efecto para el cronómetro de descanso
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isResting && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer((prev) => {
          if (prev <= 1) {
            // Tiempo de descanso terminado
            setIsResting(false)
            setRestingExerciseId(null)

            // Actualizar el estado del ejercicio
            if (restingExerciseId) {
              setExerciseProgress((prev) => ({
                ...prev,
                [restingExerciseId]: {
                  ...prev[restingExerciseId],
                  status: "in_progress",
                },
              }))
            }

            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isResting, restTimer, restingExerciseId])

  // Inicializar progreso de ejercicios - solo una vez al cargar
  useEffect(() => {
    const initializeAllProgress = () => {
      const progress: Record<string, ExerciseProgress> = {}

      // Inicializar progreso para todos los días
      if (routineData) {
        Object.entries(routineData).forEach(([dayKey, dayRoutine]) => {
          dayRoutine.exercises.forEach((exercise) => {
            const totalSets = Number.parseInt(exercise.sets) || 3
            const exerciseKey = `${dayKey}-${exercise.id}`

            progress[exerciseKey] = {
              exerciseId: exercise.exercise_id,
              dayId: dayKey,
              status: "not_started",
              currentSet: 0,
              sets: Array.from({ length: totalSets }, (_, i) => ({
                setNumber: i + 1,
                weight: "",
                reps: "",
                completed: false,
              })),
              restDuration: parseRestTime(exercise.rest || "120s"),
            }
          })
        })
      }

      setExerciseProgress(progress)
    }

    // Solo inicializar si no hay progreso previo
    if (Object.keys(exerciseProgress).length === 0) {
      initializeAllProgress()
    }
  }, [routineData]) // Solo depende de routineData, no de selectedDay

  // Función para verificar si algún ejercicio está en descanso o en progreso
  const isAnyExerciseActive = () => {
    return (
        isResting ||
        Object.values(exerciseProgress).some(
            (progress) => progress.status === "resting" || progress.status === "in_progress",
        )
    )
  }

  // Función para obtener el ejercicio activo actual
  const getActiveExercise = () => {
    return Object.values(exerciseProgress).find(
        (progress) => progress.status === "resting" || progress.status === "in_progress",
    )
  }

  // Función para iniciar un ejercicio
  const startExercise = (exerciseId: string) => {
    // Solo permitir en el día actual
    if (!isCurrentDay) {
      return
    }

    // No permitir iniciar si hay un ejercicio activo en otro día
    const activeExercise = getActiveExercise()
    if (activeExercise && activeExercise.dayId !== selectedDay) {
      return
    }

    // No permitir iniciar si hay un ejercicio en descanso
    if (isAnyExerciseActive() && !restingExerciseId) {
      return
    }

    const now = new Date()
    const exerciseKey = `${selectedDay}-${exerciseId}`

    function formatDateTime(date: Date): string {
      const pad = (n: number) => n.toString().padStart(2, "0")
      const yyyy = date.getFullYear()
      const mm = pad(date.getMonth() + 1)
      const dd = pad(date.getDate())
      const hh = pad(date.getHours())
      const min = pad(date.getMinutes())
      const ss = pad(date.getSeconds())
      return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`
    }

    const getFirstRoutineId = (weeklyRoutine: Record<string, any>) => {
      for (const dayKey in weeklyRoutine) {
        const dayRoutine = weeklyRoutine[dayKey]
        if (dayRoutine && dayRoutine.routine_id) {
          return dayRoutine.routine_id
        }
      }
      return null
    }

    const saveWorkout = async ({ workoutDate, startTime, status, routineId }) => {
      console.log("🚀 INICIANDO WORKOUT:", {
        userId: userData.id,
        workoutDate,
        startTime,
        status,
        routineId,
      })

      // Simular llamada a Supabase para crear workout
      console.log("📝 Creando workout en Supabase:", {
        table: "workouts",
        data: {
          user_id: userData.id,
          workout_date: workoutDate,
          start_time: startTime,
          status: status,
          routine_id: routineId,
        },
      })

      await workoutService.createWorkout(userData.id, {
        workout_date: workoutDate,
        start_time: startTime,
        status: status,
        routine_id: routineId,
      })

      const workoutId = await workoutService.getActiveWorkout(userData.id, workoutDate, routineId, startTime)
      setWorkoutId(workoutId?.id)
      const actualWorkoutExcercise = await workoutExerciseService.getWorkoutExercise(workoutId?.id)
      console.log('tskk', actualWorkoutExcercise)
    }

    // Si es el primer ejercicio del día, iniciar el workout
    if (!workoutStartTime) {
      setWorkoutStartTime(now)
      setActiveWorkoutDay(selectedDay)
      const workout = saveWorkout({
        workoutDate: now.toISOString().slice(0, 10),
        startTime: formatDateTime(now),
        status: "in_progress",
        routineId: getFirstRoutineId(routineData),
      })
    }

    // Actualizar el progreso del ejercicio
    setExerciseProgress((prev) => ({
      ...prev,
      [exerciseKey]: {
        ...prev[exerciseKey],
        status: "in_progress",
        startTime: now,
        currentSet: 0,
      },
    }))

    setActiveExerciseId(exerciseKey)

    // Preparar datos para la primera serie
    const exercise = currentRoutine.exercises.find((ex) => ex.id === exerciseId)
    if (exercise) {
      setCurrentSetData({
        weight: exercise.weight || "",
        reps: exercise.reps.split("-")[0] || "",
      })
    }

    setShowSetDialog(true)
  }

  // Función para pausar un ejercicio
  const pauseExercise = (exerciseId: string) => {
    const exerciseKey = `${selectedDay}-${exerciseId}`

    setExerciseProgress((prev) => ({
      ...prev,
      [exerciseKey]: {
        ...prev[exerciseKey],
        status: "not_started",
      },
    }))
    setActiveExerciseId(null)
  }

  // Función para completar una serie
  const completeSet = async () => {
    if (!activeExerciseId) return

    const progress = exerciseProgress[activeExerciseId]
    const currentSetIndex = progress.currentSet
    const now = new Date()

    // Guardar la serie completada
    const setData = {
      workoutId,
      exerciseId: progress.exerciseId,
      setNumber: currentSetIndex + 1,
      weight: currentSetData.weight,
      reps: currentSetData.reps,
      completedAt: now.toISOString(),
    }

    console.log("💪 SERIE COMPLETADA:", setData)

    // Simular llamada a Supabase para guardar la serie
    const workoutExcercise: WorkoutExercise={
      workout_id: workoutId,
        exercise_id: progress.exerciseId,
        sets_completed: currentSetIndex + 1,
        weight_used: [currentSetData.weight],
        reps_completed: [currentSetData.reps],
        completed_at: now.toISOString(),
    }
    await workoutExerciseService.createWorkoutExercise(workoutExcercise)

    setExerciseProgress((prev) => {
      const updatedProgress = { ...prev }
      const exerciseData = { ...updatedProgress[activeExerciseId] }

      // Actualizar la serie actual
      exerciseData.sets[currentSetIndex] = {
        ...exerciseData.sets[currentSetIndex],
        weight: currentSetData.weight,
        reps: currentSetData.reps,
        completed: true,
        endTime: now,
      }

      // Verificar si hay más series
      const nextSetIndex = currentSetIndex + 1
      if (nextSetIndex < exerciseData.sets.length) {
        // Hay más series - iniciar descanso
        exerciseData.status = "resting"
        exerciseData.currentSet = nextSetIndex
        exerciseData.restStartTime = now

        // Iniciar cronómetro de descanso
        setIsResting(true)
        setRestingExerciseId(activeExerciseId)
        setRestTimer(exerciseData.restDuration || 120)

        updatedProgress[activeExerciseId] = exerciseData
        setShowSetDialog(false)
        setActiveExerciseId(null)
        return updatedProgress
      } else {
        // Ejercicio completado
        exerciseData.status = "completed"
        exerciseData.endTime = now
        exerciseData.totalTime = exerciseData.startTime
            ? Math.floor((now.getTime() - exerciseData.startTime.getTime()) / 1000)
            : 0

        console.log("✅ EJERCICIO COMPLETADO:", {
          exerciseId: progress.exerciseId,
          totalTime: exerciseData.totalTime,
          completedAt: now.toISOString(),
        })

        updatedProgress[activeExerciseId] = exerciseData

        setActiveExerciseId(null)
        setShowSetDialog(false)

        // Verificar si todos los ejercicios están completados DESPUÉS de actualizar el estado
        const dayRoutine = routineData?.[activeWorkoutDay as keyof WeeklyRoutine]
        const allCompleted = dayRoutine?.exercises.every(exercise => {
          const key = `${activeWorkoutDay}-${exercise.id}`
          const progress = updatedProgress[key] // ¡Usa el estado ACTUALIZADO!
          return progress?.status === "completed"
        })
        console.log("🔍 Verificando si todos están completados:", allCompleted)

        if (allCompleted) {
          finishWorkout()
        }

        return updatedProgress
      }
    })
  }

  // Función para saltar el descanso
  const skipRest = () => {
    if (restingExerciseId) {
      setExerciseProgress((prev) => ({
        ...prev,
        [restingExerciseId]: {
          ...prev[restingExerciseId],
          status: "in_progress",
        },
      }))
    }

    setIsResting(false)
    setRestTimer(0)
    setRestingExerciseId(null)
  }

  // Función para continuar con la siguiente serie después del descanso
  const continueNextSet = (exerciseId: string) => {
    const exerciseKey = `${selectedDay}-${exerciseId}`
    const progress = exerciseProgress[exerciseKey]
    if (!progress || progress.status !== "in_progress") return

    setActiveExerciseId(exerciseKey)

    // Preparar datos para la siguiente serie (mantener valores anteriores)
    const lastCompletedSet = progress.sets.find((set) => set.completed && set.setNumber === progress.currentSet)
    if (lastCompletedSet) {
      setCurrentSetData({
        weight: lastCompletedSet.weight,
        reps: lastCompletedSet.reps,
      })
    }

    setShowSetDialog(true)
  }

  // Función para reiniciar un ejercicio
  const resetExercise = (exerciseId: string) => {
    const exerciseKey = `${selectedDay}-${exerciseId}`
    const totalSets = Number.parseInt(currentRoutine.exercises.find((ex) => ex.id === exerciseId)?.sets || "3")
    const exercise = currentRoutine.exercises.find((ex) => ex.id === exerciseId)

    setExerciseProgress((prev) => ({
      ...prev,
      [exerciseKey]: {
        exerciseId,
        dayId: selectedDay,
        status: "not_started",
        currentSet: 0,
        sets: Array.from({ length: totalSets }, (_, i) => ({
          setNumber: i + 1,
          weight: "",
          reps: "",
          completed: false,
        })),
        restDuration: parseRestTime(exercise?.rest || "120s"),
      },
    }))

    // Si este ejercicio estaba en descanso, limpiar el descanso
    if (restingExerciseId === exerciseKey) {
      setIsResting(false)
      setRestTimer(0)
      setRestingExerciseId(null)
    }
  }

  // Función para obtener el estado visual del ejercicio
  const getExerciseStatus = (exerciseId: string) => {
    const exerciseKey = `${selectedDay}-${exerciseId}`
    const progress = exerciseProgress[exerciseKey]
    if (!progress) return "not_started"
    return progress.status
  }

  // Función para obtener el progreso de series
  const getSetProgress = (exerciseId: string) => {
    const exerciseKey = `${selectedDay}-${exerciseId}`
    const progress = exerciseProgress[exerciseKey]
    if (!progress) return { completed: 0, total: 0 }

    const completed = progress.sets.filter((set) => set.completed).length
    const total = progress.sets.length
    return { completed, total }
  }

  // Función para formatear tiempo
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const navigateDay = (direction: "prev" | "next") => {
    const currentIndex = daysOfWeek.findIndex((day) => day.id === selectedDay)
    let newIndex = currentIndex

    if (direction === "prev") {
      newIndex = currentIndex - 1
      if (newIndex < 0) newIndex = daysOfWeek.length - 1
    } else if (direction === "next") {
      newIndex = currentIndex + 1
      if (newIndex >= daysOfWeek.length) newIndex = 0
    }

    setSelectedDay(daysOfWeek[newIndex].id)
  }

  const getVisibleDays = () => {
    const currentIndex = daysOfWeek.findIndex((day) => day.id === selectedDay)
    const prevIndex = (currentIndex - 1 + daysOfWeek.length) % daysOfWeek.length
    const nextIndex = (currentIndex + 1) % daysOfWeek.length

    return [
      { ...daysOfWeek[prevIndex], position: "prev" },
      { ...daysOfWeek[currentIndex], position: "current" },
      { ...daysOfWeek[nextIndex], position: "next" },
    ]
  }

  // Función para renderizar el contenido principal según la tab activa
  const renderMainContent = () => {
    switch (activeTab) {
      case "progress":
        return (
            <div className="flex-1 overflow-hidden">
              <ProgressScreen onBack={() => setActiveTab("routines")} userData={userData} />
            </div>
        )
      case "profile":
        return (
            <div className="flex-1 overflow-hidden">
              <ProfileScreen onBack={() => setActiveTab("routines")} onLogout={onLogout} userData={userData} />
            </div>
        )
      case "settings":
        return (
            <div className="flex-1 overflow-hidden">
              <SettingsScreen onBack={() => setActiveTab("routines")} onLogout={onLogout} userData={userData} />
            </div>
        )
      default:
        return (
            <>
              {/* Header */}
              <div className="bg-gray-900 border-b border-gray-800 p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold">Mis Rutinas</h1>
                    {workoutStartTime && activeWorkoutDay && (
                        <Badge variant="secondary" className="bg-green-800 text-green-200">
                          Entrenando {daysOfWeek.find((d) => d.id === activeWorkoutDay)?.name}
                        </Badge>
                    )}
                    {isResting && (
                        <Badge variant="secondary" className="bg-orange-800 text-orange-200 animate-pulse">
                          Descansando
                        </Badge>
                    )}
                    {isViewingMode && (
                        <Badge variant="secondary" className="bg-blue-800 text-blue-200">
                          <Eye className="w-3 h-3 mr-1" />
                          Solo vista
                        </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{currentRoutine.duration}</span>
                  </div>
                </div>

                {/* Day Slider Navigation */}
                <div className="flex items-center justify-center gap-4">
                  <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigateDay("prev")}
                      className="text-gray-400 hover:text-white"
                      disabled={isLoading}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>

                  <div className="flex items-center gap-4">
                    {getVisibleDays().map((day) => (
                        <Button
                            key={day.id}
                            variant="ghost"
                            onClick={() => setSelectedDay(day.id)}
                            disabled={isLoading}
                            className={`min-w-[60px] transition-all duration-300 relative ${
                                day.position === "current"
                                    ? day.id === todayId
                                        ? "bg-green-600 hover:bg-green-700 text-white scale-110 font-semibold"
                                        : "bg-blue-600 hover:bg-blue-700 text-white scale-110 font-semibold"
                                    : day.position === "prev" || day.position === "next"
                                        ? "text-gray-500 hover:text-gray-300 scale-90"
                                        : "text-gray-400 hover:text-white"
                            }`}
                        >
                          {day.name}
                          {day.id === todayId && (
                              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full" />
                          )}
                        </Button>
                    ))}
                  </div>

                  <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigateDay("next")}
                      className="text-gray-400 hover:text-white"
                      disabled={isLoading}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Rest Timer Overlay */}
              {isResting && restingExerciseId && (
                  <div className="bg-orange-900/90 border-b border-orange-700 p-4">
                    <div className="flex items-center justify-between max-w-md mx-auto">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
                          <Timer className="w-5 h-5 text-white animate-pulse" />
                        </div>
                        <div>
                          <p className="text-orange-200 font-semibold">Tiempo de descanso</p>
                          <p className="text-orange-300 text-sm">
                            {/* Buscar el ejercicio en el día correcto */}
                            {routineData &&
                                Object.entries(routineData)
                                    .map(([dayKey, dayRoutine]) => {
                                      const exercise = dayRoutine.exercises.find(
                                          (ex) => `${dayKey}-${ex.id}` === restingExerciseId,
                                      )
                                      return exercise ? exercise.name : null
                                    })
                                    .filter(Boolean)[0]}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-200">{formatTime(restTimer)}</div>
                          <div className="text-xs text-orange-300">restante</div>
                        </div>
                        <Button
                            onClick={skipRest}
                            variant="outline"
                            size="sm"
                            className="border-orange-600 text-orange-200 hover:bg-orange-800 bg-transparent"
                        >
                          <FastForward className="w-4 h-4 mr-1" />
                          Saltar
                        </Button>
                      </div>
                    </div>
                  </div>
              )}

              {/* Viewing Mode Alert */}
              {isViewingMode && (
                <div className="mx-4">
                  <Alert className="mt-4 border-blue-800 bg-blue-900/20">
                    <Eye className="h-4 w-4 text-blue-400" />
                    <AlertDescription className="text-blue-200">
                      Estás viendo los ejercicios de {daysOfWeek.find((d) => d.id === selectedDay)?.fullName}. Solo puedes
                      entrenar los ejercicios del día actual ({daysOfWeek.find((d) => d.id === todayId)?.fullName}).
                      {activeWorkoutDay && activeWorkoutDay !== selectedDay && (
                          <span className="block mt-1 text-green-300">
                      Tienes un entrenamiento activo en {daysOfWeek.find((d) => d.id === activeWorkoutDay)?.fullName}.
                    </span>
                      )}
                    </AlertDescription>
                  </Alert>
                </div>
                  
              )}

              {/* Content */}
              <div className="flex-1 p-4 pb-20">
                {/* Routine Title */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">
                    {currentRoutine.title}
                    {isViewingMode && <Lock className="inline w-5 h-5 ml-2 text-gray-400" />}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      <span>{currentRoutine.exercises.length} ejercicios</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{currentRoutine.duration}</span>
                    </div>
                    {workoutStartTime && activeWorkoutDay === selectedDay && (
                        <div className="flex items-center gap-1 text-green-400">
                          <Play className="w-4 h-4" />
                          <span>Entrenando desde {workoutStartTime.toLocaleTimeString()}</span>
                        </div>
                    )}
                  </div>
                </div>

                {/* No exercises message */}
                {currentRoutine.exercises.length === 0 && (
                    <div className="text-center py-12">
                      <Target className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                      <h3 className="text-xl font-semibold mb-2 text-gray-300">No hay ejercicios para hoy</h3>
                      <p className="text-gray-500 mb-4">
                        {selectedDay === "dom"
                            ? "Es tu día de descanso. ¡Disfruta la recuperación!"
                            : "Contacta a tu entrenador para que te asigne una rutina."}
                      </p>
                    </div>
                )}

                {/* Exercise List */}
                {currentRoutine.exercises.length > 0 && (
                    <ScrollArea className="h-[calc(100vh-300px)]">
                      <div className="space-y-4">
                        {currentRoutine.exercises.map((exercise, index) => {
                          const status = getExerciseStatus(exercise.id)
                          const setProgress = getSetProgress(exercise.id)
                          const exerciseKey = `${selectedDay}-${exercise.id}`
                          const progress = exerciseProgress[exerciseKey]
                          const isThisExerciseResting = restingExerciseId === exerciseKey
                          const canStart = isCurrentDay && (!isAnyExerciseActive() || isThisExerciseResting)

                          return (
                              <Card
                                  key={exercise.id}
                                  className={`border-gray-800 transition-all duration-300 ${
                                      status === "completed"
                                          ? "bg-green-900/20 border-green-700"
                                          : status === "resting"
                                              ? "bg-orange-900/20 border-orange-700"
                                              : status === "in_progress"
                                                  ? "bg-blue-900/20 border-blue-700"
                                                  : "bg-gray-900"
                                  } ${isViewingMode ? "opacity-75" : ""} ${!canStart && status === "not_started" ? "opacity-50" : ""}`}
                              >
                                <CardHeader className="pb-3">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <CardTitle className="text-lg font-semibold text-white">{exercise.name}</CardTitle>
                                        {status === "completed" && <CheckCircle className="w-5 h-5 text-green-400" />}
                                        {status === "in_progress" && (
                                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                                        )}
                                        {status === "resting" && (
                                            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                                        )}
                                        {isViewingMode && <Lock className="w-4 h-4 text-gray-500" />}
                                      </div>

                                      <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                                        <Badge variant="secondary" className="bg-gray-800 text-gray-300">
                                          {exercise.sets} series
                                        </Badge>
                                        <span>•</span>
                                        <span>{exercise.reps}</span>
                                        {setProgress.total > 0 && (
                                            <>
                                              <span>•</span>
                                              <span
                                                  className={
                                                    status === "completed"
                                                        ? "text-green-400"
                                                        : status === "in_progress" || status === "resting"
                                                            ? "text-blue-400"
                                                            : "text-gray-400"
                                                  }
                                              >
                                        {setProgress.completed}/{setProgress.total} series
                                      </span>
                                            </>
                                        )}
                                      </div>

                                      {/* Progress bar */}
                                      {setProgress.total > 0 && (
                                          <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                                            <div
                                                className={`h-2 rounded-full transition-all duration-300 ${
                                                    status === "completed"
                                                        ? "bg-green-500"
                                                        : status === "resting"
                                                            ? "bg-orange-500"
                                                            : "bg-blue-500"
                                                }`}
                                                style={{ width: `${(setProgress.completed / setProgress.total) * 100}%` }}
                                            />
                                          </div>
                                      )}

                                      {exercise.muscleGroups.length > 0 && (
                                          <div className="flex flex-wrap gap-1 mt-2">
                                            {exercise.muscleGroups.slice(0, 3).map((group) => (
                                                <Badge
                                                    key={group}
                                                    variant="outline"
                                                    className="text-xs border-gray-600 text-gray-400"
                                                >
                                                  {group}
                                                </Badge>
                                            ))}
                                            {exercise.muscleGroups.length > 3 && (
                                                <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                                                  +{exercise.muscleGroups.length - 3}
                                                </Badge>
                                            )}
                                          </div>
                                      )}
                                    </div>

                                    {/* Action Button */}
                                    <div className="flex flex-col gap-2">
                                      {status === "not_started" && (
                                          <Button
                                              onClick={() => startExercise(exercise.id)}
                                              disabled={!canStart || isViewingMode}
                                              className={`${
                                                  canStart && !isViewingMode
                                                      ? "bg-green-600 hover:bg-green-700 text-white"
                                                      : "bg-gray-600 text-gray-400 cursor-not-allowed"
                                              }`}
                                              size="sm"
                                          >
                                            {isViewingMode ? (
                                                <>
                                                  <Eye className="w-4 h-4 mr-1" />
                                                  Ver
                                                </>
                                            ) : (
                                                <>
                                                  <Play className="w-4 h-4 mr-1" />
                                                  Iniciar
                                                </>
                                            )}
                                          </Button>
                                      )}

                                      {status === "in_progress" && !isViewingMode && (
                                          <div className="flex gap-1">
                                            <Button
                                                onClick={() => continueNextSet(exercise.id)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                                size="sm"
                                            >
                                              Serie {(progress?.currentSet || 0) + 1}
                                            </Button>
                                            <Button
                                                onClick={() => pauseExercise(exercise.id)}
                                                variant="outline"
                                                size="sm"
                                                className="border-gray-600"
                                            >
                                              <Pause className="w-4 h-4" />
                                            </Button>
                                          </div>
                                      )}

                                      {status === "in_progress" && isViewingMode && (
                                          <Badge variant="secondary" className="bg-blue-800 text-blue-200">
                                            En progreso
                                          </Badge>
                                      )}

                                      {status === "resting" && (
                                          <div className="flex flex-col gap-1">
                                            <Badge variant="secondary" className="bg-orange-800 text-orange-200 text-center">
                                              Descansando
                                            </Badge>
                                            <div className="text-xs text-orange-300 text-center">
                                              {isThisExerciseResting ? formatTime(restTimer) : "En descanso"}
                                            </div>
                                          </div>
                                      )}

                                      {status === "completed" && (
                                          <div className="flex gap-1">
                                            <Badge variant="secondary" className="bg-green-800 text-green-200">
                                              Completado
                                            </Badge>
                                            {!isViewingMode && (
                                                <Button
                                                    onClick={() => resetExercise(exercise.id)}
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-gray-600"
                                                >
                                                  <RotateCcw className="w-4 h-4" />
                                                </Button>
                                            )}
                                          </div>
                                      )}
                                    </div>
                                  </div>
                                </CardHeader>

                                <CardContent className="pt-0">
                                  <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-4">
                                      <div className="flex items-center gap-1 text-orange-400">
                                        <Clock className="w-4 h-4" />
                                        <span>{exercise.rest}</span>
                                      </div>
                                      {progress?.totalTime && (
                                          <div className="flex items-center gap-1 text-green-400">
                                            <Target className="w-4 h-4" />
                                            <span>Tiempo: {formatTime(progress.totalTime)}</span>
                                          </div>
                                      )}
                                    </div>
                                  </div>

                                  {exercise.description && (
                                      <p className="text-xs text-gray-500 mt-2 line-clamp-2">{exercise.description}</p>
                                  )}

                                  {/* Sets completed details */}
                                  {progress && progress.sets.some((set) => set.completed) && (
                                      <div className="mt-3 p-2 bg-gray-800 rounded-lg">
                                        <p className="text-xs text-gray-400 mb-1">Series completadas:</p>
                                        <div className="flex flex-wrap gap-2">
                                          {progress.sets
                                              .filter((set) => set.completed)
                                              .map((set) => (
                                                  <Badge
                                                      key={set.setNumber}
                                                      variant="outline"
                                                      className="text-xs border-green-600 text-green-400"
                                                  >
                                                    #{set.setNumber}: {set.weight} × {set.reps}
                                                  </Badge>
                                              ))}
                                        </div>
                                      </div>
                                  )}
                                </CardContent>
                              </Card>
                          )
                        })}
                      </div>
                    </ScrollArea>
                )}
              </div>
            </>
        )
    }
  }

  return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col">
        {/* Main Content */}
        {renderMainContent()}

        {/* Set Completion Dialog */}
        <Dialog open={showSetDialog} onOpenChange={setShowSetDialog}>
          <DialogContent className="bg-gray-900 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">
                {activeExerciseId && routineData && (
                    <>
                      {/* Buscar el ejercicio correcto basado en la clave */}
                      {
                        Object.entries(routineData)
                            .map(([dayKey, dayRoutine]) => {
                              const exercise = dayRoutine.exercises.find((ex) => `${dayKey}-${ex.id}` === activeExerciseId)
                              return exercise
                                  ? `${exercise.name} - Serie ${(exerciseProgress[activeExerciseId]?.currentSet || 0) + 1}`
                                  : null
                            })
                            .filter(Boolean)[0]
                      }
                    </>
                )}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="set-weight" className="text-gray-300">
                    Peso utilizado
                  </Label>
                  <Input
                      id="set-weight"
                      value={currentSetData.weight}
                      onChange={(e) => setCurrentSetData((prev) => ({ ...prev, weight: e.target.value }))}
                      placeholder="ej: 80kg"
                      className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="set-reps" className="text-gray-300">
                    Repeticiones realizadas
                  </Label>
                  <Input
                      id="set-reps"
                      value={currentSetData.reps}
                      onChange={(e) => setCurrentSetData((prev) => ({ ...prev, reps: e.target.value }))}
                      placeholder="ej: 10"
                      className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>

              {activeExerciseId && exerciseProgress[activeExerciseId] && (
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <p className="text-sm text-gray-400 mb-2">Progreso del ejercicio:</p>
                    <div className="text-xs text-gray-500">
                      <p>
                        Serie actual: {(exerciseProgress[activeExerciseId].currentSet || 0) + 1} de{" "}
                        {exerciseProgress[activeExerciseId].sets.length}
                      </p>
                      <p>Series completadas: {exerciseProgress[activeExerciseId].sets.filter((s) => s.completed).length}</p>
                      <p className="text-orange-400 mt-1">
                        Descanso después de esta serie:{" "}
                        {routineData &&
                            Object.entries(routineData)
                                .map(([dayKey, dayRoutine]) => {
                                  const exercise = dayRoutine.exercises.find((ex) => `${dayKey}-${ex.id}` === activeExerciseId)
                                  return exercise ? exercise.rest : null
                                })
                                .filter(Boolean)[0]}
                      </p>
                    </div>
                  </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                  variant="outline"
                  onClick={() => setShowSetDialog(false)}
                  className="border-gray-600 text-gray-300 bg-transparent"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button
                  onClick={completeSet}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={!currentSetData.weight || !currentSetData.reps}
              >
                <Save className="w-4 h-4 mr-2" />
                Completar Serie
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Bottom Tab Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 px-4 py-2 z-50">
          <div className="flex items-center justify-around">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("routines")}
                className={`flex flex-col items-center gap-1 ${
                    activeTab === "routines" ? "text-blue-400" : "text-gray-400 hover:text-white"
                }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-xs">Rutinas</span>
            </Button>

            <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("progress")}
                className={`flex flex-col items-center gap-1 ${
                    activeTab === "progress" ? "text-blue-400" : "text-gray-400 hover:text-white"
                }`}
            >
              <TrendingUp className="w-5 h-5" />
              <span className="text-xs">Progreso</span>
            </Button>

            <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("profile")}
                className={`flex flex-col items-center gap-1 ${
                    activeTab === "profile" ? "text-blue-400" : "text-gray-400 hover:text-white"
                }`}
            >
              <User className="w-5 h-5" />
              <span className="text-xs">Perfil</span>
            </Button>

            <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("settings")}
                className={`flex flex-col items-center gap-1 ${
                    activeTab === "settings" ? "text-blue-400" : "text-gray-400 hover:text-white"
                }`}
            >
              <Settings className="w-5 h-5" />
              <span className="text-xs">Config</span>
            </Button>

            <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="flex flex-col items-center gap-1 text-gray-400 hover:text-red-400"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-xs">Salir</span>
            </Button>
          </div>
        </div>
      </div>
  )
}