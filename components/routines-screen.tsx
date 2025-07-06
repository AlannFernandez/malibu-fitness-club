"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Play,
  Clock,
  Target,
  Weight,
  ChevronLeft,
  ChevronRight,
  Home,
  TrendingUp,
  User,
  Settings,
  LogOut,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react"

// Importar las nuevas pantallas y servicios
import ProgressScreen from "./progress-screen"
import ProfileScreen from "./profile-screen"
import SettingsScreen from "./settings-screen"
import { studentRoutineService, type WeeklyRoutine } from "@/lib/student-routines"
import { authService } from "@/lib/auth"

const daysOfWeek = [
  { id: "lun", name: "LUN", fullName: "Lunes" },
  { id: "mar", name: "MAR", fullName: "Martes" },
  { id: "mie", name: "MIÉ", fullName: "Miércoles" },
  { id: "jue", name: "JUE", fullName: "Jueves" },
  { id: "vie", name: "VIE", fullName: "Viernes" },
  { id: "sab", name: "SÁB", fullName: "Sábado" },
  { id: "dom", name: "DOM", fullName: "Domingo" },
]

// Rutina por defecto cuando no hay rutinas asignadas
const defaultRoutineData: WeeklyRoutine = {
  lun: {
    title: "Sin rutina asignada",
    duration: "0 min",
    exercises: [],
  },
  mar: {
    title: "Sin rutina asignada",
    duration: "0 min",
    exercises: [],
  },
  mie: {
    title: "Sin rutina asignada",
    duration: "0 min",
    exercises: [],
  },
  jue: {
    title: "Sin rutina asignada",
    duration: "0 min",
    exercises: [],
  },
  vie: {
    title: "Sin rutina asignada",
    duration: "0 min",
    exercises: [],
  },
  sab: {
    title: "Sin rutina asignada",
    duration: "0 min",
    exercises: [],
  },
  dom: {
    title: "Sin rutina asignada",
    duration: "0 min",
    exercises: []
  }
}

interface RoutinesScreenProps {
  onLogout: () => void
  userData?: any
}

export default function RoutinesScreen({ onLogout, userData }: RoutinesScreenProps) {
  const [selectedDay, setSelectedDay] = useState("lun")
  const [activeTab, setActiveTab] = useState("routines")
  const [routineData, setRoutineData] = useState<WeeklyRoutine>(defaultRoutineData)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isStartingWorkout, setIsStartingWorkout] = useState(false)

  const currentRoutine = routineData[selectedDay as keyof WeeklyRoutine]

  // Cargar rutinas del usuario al montar el componente
  useEffect(() => {
    const loadUserRoutines = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const { user } = await authService.getCurrentUser()
        if (!user) {
          throw new Error("Usuario no autenticado")
        }

        const weeklyRoutine = await studentRoutineService.getCurrentWeeklyRoutine(user.id)

        if (weeklyRoutine) {
          setRoutineData(weeklyRoutine)
        } else {
          setRoutineData(defaultRoutineData)
        }
      } catch (err: any) {
        setError(err.message || "Error al cargar las rutinas")
        setRoutineData(defaultRoutineData)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserRoutines()
  }, [])

  const handleRefresh = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { user } = await authService.getCurrentUser()
      if (!user) {
        throw new Error("Usuario no autenticado")
      }

      const weeklyRoutine = await studentRoutineService.getCurrentWeeklyRoutine(user.id)
      if (weeklyRoutine) {
        setRoutineData(weeklyRoutine)
      } else {
        setRoutineData(defaultRoutineData)
      }
    } catch (err: any) {
      setError(err.message)
      setRoutineData(defaultRoutineData)
    } finally {
      setIsLoading(false)
    }
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

  const handleStartWorkout = async () => {
    if (currentRoutine.exercises.length === 0) {
      return
    }

    try {
      setIsStartingWorkout(true)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      alert("¡Entrenamiento iniciado! (Funcionalidad en desarrollo)")
    } catch (err: any) {
      alert("Error al iniciar el entrenamiento")
    } finally {
      setIsStartingWorkout(false)
    }
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
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleRefresh}
                        disabled={isLoading}
                        className="w-6 h-6 text-gray-400 hover:text-white"
                    >
                      <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                    </Button>
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
                            className={`min-w-[60px] transition-all duration-300 ${
                                day.position === "current"
                                    ? "bg-blue-600 hover:bg-blue-700 text-white scale-110 font-semibold"
                                    : day.position === "prev" || day.position === "next"
                                        ? "text-gray-500 hover:text-gray-300 scale-90"
                                        : "text-gray-400 hover:text-white"
                            }`}
                        >
                          {day.name}
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

              {/* Content */}
              <div className="flex-1 p-4 pb-20">
                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
                        <p className="text-gray-400">Cargando rutinas...</p>
                      </div>
                    </div>
                )}

                {/* Error State */}
                {error && !isLoading && (
                    <Alert className="mb-6 border-red-800 bg-red-900/20">
                      <AlertCircle className="h-4 w-4 text-red-400" />
                      <AlertDescription className="text-red-200">
                        {error}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRefresh}
                            className="ml-2 text-red-300 hover:text-red-100"
                        >
                          Reintentar
                        </Button>
                      </AlertDescription>
                    </Alert>
                )}

                {/* Content when loaded */}
                {!isLoading && !error && (
                    <>
                      {/* Routine Title */}
                      <div className="mb-6">
                        <h2 className="text-2xl font-bold mb-2">{currentRoutine.title}</h2>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <div className="flex items-center gap-1">
                            <Target className="w-4 h-4" />
                            <span>{currentRoutine.exercises.length} ejercicios</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{currentRoutine.duration}</span>
                          </div>
                        </div>
                      </div>

                      {/* Start Routine Button */}
                      {currentRoutine.exercises.length > 0 && (
                          <Button
                              onClick={handleStartWorkout}
                              disabled={isStartingWorkout}
                              className="w-full mb-6 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3"
                          >
                            {isStartingWorkout ? (
                                <>
                                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                  Iniciando...
                                </>
                            ) : (
                                <>
                                  <Play className="w-5 h-5 mr-2" />
                                  Iniciar Sesión de Entrenamiento
                                </>
                            )}
                          </Button>
                      )}

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
                          <ScrollArea className="h-100vh">
                            <div className="space-y-4">
                              {currentRoutine.exercises.map((exercise, index) => (
                                  <Card key={exercise.id} className="bg-gray-900 border-gray-800">
                                    <CardHeader className="pb-3">
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <CardTitle className="text-lg font-semibold text-white mb-2">
                                            {exercise.name}
                                          </CardTitle>
                                          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                                            <Badge variant="secondary" className="bg-gray-800 text-gray-300">
                                              {exercise.sets} series
                                            </Badge>
                                            <span>•</span>
                                            <span>{exercise.reps}</span>
                                          </div>
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
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-green-500/20 rounded-lg flex items-center justify-center border border-gray-700">
                                          <Weight className="w-6 h-6 text-blue-400" />
                                        </div>
                                      </div>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                      <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-4">
                                          <div className="flex items-center gap-1 text-blue-400">
                                            <Weight className="w-4 h-4" />
                                            <span>{exercise.weight}</span>
                                          </div>
                                          <div className="flex items-center gap-1 text-orange-400">
                                            <Clock className="w-4 h-4" />
                                            <span>{exercise.rest}</span>
                                          </div>
                                        </div>
                                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                                          Ver técnica
                                        </Button>
                                      </div>
                                      {exercise.description && (
                                          <p className="text-xs text-gray-500 mt-2 line-clamp-2">{exercise.description}</p>
                                      )}
                                    </CardContent>
                                  </Card>
                              ))}
                            </div>
                          </ScrollArea>
                      )}
                    </>
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

        {/* Bottom Tab Navigation - Siempre visible */}
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
