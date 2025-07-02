"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
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
} from "lucide-react"

const daysOfWeek = [
  { id: "lun", name: "LUN", fullName: "Lunes" },
  { id: "mar", name: "MAR", fullName: "Martes" },
  { id: "mie", name: "MIÉ", fullName: "Miércoles" },
  { id: "jue", name: "JUE", fullName: "Jueves" },
  { id: "vie", name: "VIE", fullName: "Viernes" },
  { id: "sab", name: "SÁB", fullName: "Sábado" },
  { id: "dom", name: "DOM", fullName: "Domingo" },
]

const routineData = {
  lun: {
    title: "Empuje - Pecho y Tríceps",
    duration: "45-60 min",
    exercises: [
      {
        name: "Press Banca con Barra",
        sets: "4 series",
        reps: "8-12 repeticiones",
        weight: "Peso: 30kg",
        rest: "Descanso: 2-3 min",
      },
      {
        name: "Press Inclinado con Mancuernas",
        sets: "3 series",
        reps: "10-15 repeticiones",
        weight: "Peso: 12kg c/u",
        rest: "Descanso: 90s",
      },
      {
        name: "Fondos en Paralelas",
        sets: "3 series",
        reps: "Hasta el fallo",
        weight: "Peso corporal",
        rest: "Descanso: 2 min",
      },
      {
        name: "Press Francés",
        sets: "3 series",
        reps: "12-15 repeticiones",
        weight: "Peso: 15kg",
        rest: "Descanso: 90s",
      },
    ],
  },
  mar: {
    title: "Tracción - Espalda y Bíceps",
    duration: "50-65 min",
    exercises: [
      {
        name: "Dominadas",
        sets: "4 series",
        reps: "6-10 repeticiones",
        weight: "Peso corporal",
        rest: "Descanso: 2-3 min",
      },
      {
        name: "Remo con Barra",
        sets: "4 series",
        reps: "8-12 repeticiones",
        weight: "Peso: 25kg",
        rest: "Descanso: 2 min",
      },
      {
        name: "Curl con Barra",
        sets: "3 series",
        reps: "10-15 repeticiones",
        weight: "Peso: 15kg",
        rest: "Descanso: 90s",
      },
    ],
  },
  mie: {
    title: "Piernas y Glúteos",
    duration: "60-75 min",
    exercises: [
      {
        name: "Sentadilla con Barra",
        sets: "4 series",
        reps: "8-12 repeticiones",
        weight: "Peso: 40kg",
        rest: "Descanso: 3 min",
      },
      {
        name: "Peso Muerto Rumano",
        sets: "3 series",
        reps: "10-12 repeticiones",
        weight: "Peso: 35kg",
        rest: "Descanso: 2-3 min",
      },
      {
        name: "Prensa de Piernas",
        sets: "3 series",
        reps: "15-20 repeticiones",
        weight: "Peso: 80kg",
        rest: "Descanso: 2 min",
      },
    ],
  },
  jue: {
    title: "Cardio y Abdominales",
    duration: "30-40 min",
    exercises: [
      {
        name: "Cinta de Correr",
        sets: "1 sesión",
        reps: "20 minutos",
        weight: "Intensidad media",
        rest: "N/A",
      },
      {
        name: "Plancha",
        sets: "3 series",
        reps: "30-60 segundos",
        weight: "Peso corporal",
        rest: "Descanso: 60s",
      },
      {
        name: "Abdominales Bicicleta",
        sets: "3 series",
        reps: "20 repeticiones",
        weight: "Peso corporal",
        rest: "Descanso: 45s",
      },
    ],
  },
  vie: {
    title: "Hombros y Core",
    duration: "45-55 min",
    exercises: [
      {
        name: "Press Militar",
        sets: "4 series",
        reps: "8-12 repeticiones",
        weight: "Peso: 20kg",
        rest: "Descanso: 2-3 min",
      },
      {
        name: "Elevaciones Laterales",
        sets: "3 series",
        reps: "12-15 repeticiones",
        weight: "Peso: 8kg c/u",
        rest: "Descanso: 90s",
      },
    ],
  },
  sab: {
    title: "Full Body Funcional",
    duration: "40-50 min",
    exercises: [
      {
        name: "Burpees",
        sets: "3 series",
        reps: "10-15 repeticiones",
        weight: "Peso corporal",
        rest: "Descanso: 90s",
      },
      {
        name: "Flexiones",
        sets: "3 series",
        reps: "15-20 repeticiones",
        weight: "Peso corporal",
        rest: "Descanso: 60s",
      },
    ],
  },
  dom: {
    title: "Descanso Activo",
    duration: "30 min",
    exercises: [
      {
        name: "Caminata Ligera",
        sets: "1 sesión",
        reps: "20-30 minutos",
        weight: "Baja intensidad",
        rest: "N/A",
      },
      {
        name: "Estiramientos",
        sets: "1 sesión",
        reps: "10-15 minutos",
        weight: "Relajación",
        rest: "N/A",
      },
    ],
  },
}

interface RoutinesScreenProps {
  onLogout: () => void
}

export default function RoutinesScreen({ onLogout }: RoutinesScreenProps) {
  const [selectedDay, setSelectedDay] = useState("lun")
  const [activeTab, setActiveTab] = useState("routines")
  const currentRoutine = routineData[selectedDay as keyof typeof routineData]

  const getCurrentDayIndex = () => {
    return daysOfWeek.findIndex((day) => day.id === selectedDay)
  }

  const navigateDay = (direction: "prev" | "next") => {
    const currentIndex = getCurrentDayIndex()
    let newIndex

    if (direction === "prev") {
      newIndex = currentIndex > 0 ? currentIndex - 1 : daysOfWeek.length - 1
    } else {
      newIndex = currentIndex < daysOfWeek.length - 1 ? currentIndex + 1 : 0
    }

    setSelectedDay(daysOfWeek[newIndex].id)
  }

  const getVisibleDays = () => {
    const currentIndex = getCurrentDayIndex()
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : daysOfWeek.length - 1
    const nextIndex = currentIndex < daysOfWeek.length - 1 ? currentIndex + 1 : 0

    return [
      { ...daysOfWeek[prevIndex], position: "prev" },
      { ...daysOfWeek[currentIndex], position: "current" },
      { ...daysOfWeek[nextIndex], position: "next" },
    ]
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Mis Rutinas</h1>
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
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <div className="flex items-center gap-4">
            {getVisibleDays().map((day) => (
              <Button
                key={day.id}
                variant="ghost"
                onClick={() => setSelectedDay(day.id)}
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
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 pb-20">
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
        <Button className="w-full mb-6 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3">
          <Play className="w-5 h-5 mr-2" />
          Iniciar Sesión de Entrenamiento
        </Button>

        {/* Exercise List */}
        <ScrollArea className="h-100vh">
          <div className="space-y-4">
            {currentRoutine.exercises.map((exercise, index) => (
              <Card key={index} className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-white mb-2">{exercise.name}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                        <Badge variant="secondary" className="bg-gray-800 text-gray-300">
                          {exercise.sets}
                        </Badge>
                        <span>•</span>
                        <span>{exercise.reps}</span>
                      </div>
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
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Bottom Tab Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 px-4 py-2">
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
