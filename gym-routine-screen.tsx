"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Play, Clock, Target, Weight, ChevronLeft, ChevronRight } from "lucide-react"

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
    title: "Pecho y Tríceps",
    duration: "45-60 min",
    exercises: [
      {
        name: "Press Banca con Barra",
        sets: "4 series",
        reps: "8-12 repeticiones",
        weight: "30kg",
        restTime: "2-3 min",
      },
      {
        name: "Press Inclinado con Mancuernas",
        sets: "3 series",
        reps: "10-15 repeticiones",
        weight: "12kg c/u",
        restTime: "90 seg",
      },
      {
        name: "Fondos en Paralelas",
        sets: "3 series",
        reps: "Hasta el fallo",
        weight: "Peso corporal",
        restTime: "2 min",
      },
      {
        name: "Press Francés",
        sets: "3 series",
        reps: "12-15 repeticiones",
        weight: "15kg",
        restTime: "90 seg",
      },
      {
        name: "Extensiones de Tríceps en Polea",
        sets: "3 series",
        reps: "15-20 repeticiones",
        weight: "20kg",
        restTime: "60 seg",
      },
    ],
  },
  mar: {
    title: "Espalda y Bíceps",
    duration: "50-65 min",
    exercises: [
      {
        name: "Dominadas",
        sets: "4 series",
        reps: "6-10 repeticiones",
        weight: "Peso corporal",
        restTime: "2-3 min",
      },
      {
        name: "Remo con Barra",
        sets: "4 series",
        reps: "8-12 repeticiones",
        weight: "25kg",
        restTime: "2 min",
      },
      {
        name: "Curl con Barra",
        sets: "3 series",
        reps: "10-15 repeticiones",
        weight: "15kg",
        restTime: "90 seg",
      },
    ],
  },
  mie: {
    title: "Descanso Activo",
    duration: "30 min",
    exercises: [
      {
        name: "Caminata Ligera",
        sets: "1 sesión",
        reps: "20-30 minutos",
        weight: "Baja intensidad",
        restTime: "N/A",
      },
      {
        name: "Estiramientos",
        sets: "1 sesión",
        reps: "10-15 minutos",
        weight: "Relajación",
        restTime: "N/A",
      },
    ],
  },
  jue: {
    title: "Piernas y Glúteos",
    duration: "60-75 min",
    exercises: [
      {
        name: "Sentadillas con Barra",
        sets: "4 series",
        reps: "8-12 repeticiones",
        weight: "40kg",
        restTime: "3 min",
      },
      {
        name: "Peso Muerto Rumano",
        sets: "3 series",
        reps: "10-12 repeticiones",
        weight: "35kg",
        restTime: "2-3 min",
      },
      {
        name: "Prensa de Piernas",
        sets: "3 series",
        reps: "15-20 repeticiones",
        weight: "80kg",
        restTime: "2 min",
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
        weight: "20kg",
        restTime: "2-3 min",
      },
      {
        name: "Elevaciones Laterales",
        sets: "3 series",
        reps: "12-15 repeticiones",
        weight: "8kg c/u",
        restTime: "90 seg",
      },
      {
        name: "Plancha",
        sets: "3 series",
        reps: "30-60 segundos",
        weight: "Peso corporal",
        restTime: "60 seg",
      },
    ],
  },
  sab: {
    title: "Full Body",
    duration: "40-50 min",
    exercises: [
      {
        name: "Burpees",
        sets: "3 series",
        reps: "10-15 repeticiones",
        weight: "Peso corporal",
        restTime: "90 seg",
      },
      {
        name: "Flexiones",
        sets: "3 series",
        reps: "15-20 repeticiones",
        weight: "Peso corporal",
        restTime: "60 seg",
      },
    ],
  },
  dom: {
    title: "Descanso Total",
    duration: "Recuperación",
    exercises: [
      {
        name: "Día de Descanso",
        sets: "Relajación",
        reps: "Recuperación muscular",
        weight: "Hidratación",
        restTime: "24 horas",
      },
    ],
  },
}

export default function GymRoutineScreen() {
  const [selectedDay, setSelectedDay] = useState("lun")
  const currentRoutine = routineData[selectedDay as keyof typeof routineData]

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Mis Rutinas</h1>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Clock className="w-4 h-4" />
            <span>{currentRoutine.duration}</span>
          </div>
        </div>

        {/* Day Navigation */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <ScrollArea className="flex-1">
            <div className="flex gap-2 px-2">
              {daysOfWeek.map((day) => (
                <Button
                  key={day.id}
                  variant={selectedDay === day.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedDay(day.id)}
                  className={`min-w-[50px] ${
                    selectedDay === day.id
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  {day.name}
                </Button>
              ))}
            </div>
          </ScrollArea>

          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Routine Content */}
      <div className="p-4">
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
        <Button className="w-full mb-6 bg-green-600 hover:bg-green-700 text-white font-semibold py-3">
          <Play className="w-5 h-5 mr-2" />
          Iniciar Rutina
        </Button>

        {/* Exercise List */}
        <div className="space-y-4">
          {currentRoutine.exercises.map((exercise, index) => (
            <Card key={index} className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-white mb-1">{exercise.name}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Badge variant="secondary" className="bg-gray-800 text-gray-300">
                        {exercise.sets}
                      </Badge>
                      <span>•</span>
                      <span>{exercise.reps}</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                    <Weight className="w-6 h-6 text-gray-400" />
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
                      <span>{exercise.restTime}</span>
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

        {/* Bottom Spacing */}
        <div className="h-6"></div>
      </div>
    </div>
  )
}
