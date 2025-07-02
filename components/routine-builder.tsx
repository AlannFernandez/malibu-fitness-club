"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Search, Plus, Trash2, GripVertical, Target, Clock, Weight, Users, UserPlus } from "lucide-react"

interface Exercise {
  id: string
  name: string
  sets: string
  reps: string
  weight?: string
  rest?: string
  category: string
  muscleGroups: string[]
}

interface Student {
  id: string
  name: string
  email: string
  avatar?: string
  membershipStatus: "active" | "expired"
  lastActivity: string
}

interface RoutineBuilderProps {
  onBack: () => void
  onLogout: () => void
}

const availableExercises: Exercise[] = [
  {
    id: "1",
    name: "Press Banca con Barra",
    sets: "4",
    reps: "8-12",
    weight: "30kg",
    rest: "2-3 min",
    category: "fuerza",
    muscleGroups: ["Pecho", "Tríceps"],
  },
  {
    id: "2",
    name: "Sentadilla con Barra",
    sets: "4",
    reps: "8-12",
    weight: "40kg",
    rest: "3 min",
    category: "fuerza",
    muscleGroups: ["Cuádriceps", "Glúteos"],
  },
  {
    id: "3",
    name: "Dominadas",
    sets: "3",
    reps: "6-10",
    weight: "Peso corporal",
    rest: "2-3 min",
    category: "fuerza",
    muscleGroups: ["Espalda", "Bíceps"],
  },
  {
    id: "4",
    name: "Press Militar",
    sets: "3",
    reps: "8-12",
    weight: "20kg",
    rest: "2 min",
    category: "fuerza",
    muscleGroups: ["Hombros"],
  },
  {
    id: "5",
    name: "Peso Muerto Rumano",
    sets: "3",
    reps: "10-12",
    weight: "35kg",
    rest: "2-3 min",
    category: "fuerza",
    muscleGroups: ["Isquiotibiales", "Glúteos"],
  },
  {
    id: "6",
    name: "Plancha",
    sets: "3",
    reps: "30-60s",
    weight: "Peso corporal",
    rest: "60s",
    category: "core",
    muscleGroups: ["Core"],
  },
  {
    id: "7",
    name: "Burpees",
    sets: "3",
    reps: "10-15",
    weight: "Peso corporal",
    rest: "90s",
    category: "cardio",
    muscleGroups: ["Full Body"],
  },
  {
    id: "8",
    name: "Curl con Barra",
    sets: "3",
    reps: "10-15",
    weight: "15kg",
    rest: "90s",
    category: "fuerza",
    muscleGroups: ["Bíceps"],
  },
]

const students: Student[] = [
  {
    id: "1",
    name: "María González",
    email: "maria@email.com",
    membershipStatus: "active",
    lastActivity: "Hoy",
  },
  {
    id: "2",
    name: "Carlos Rodríguez",
    email: "carlos@email.com",
    membershipStatus: "active",
    lastActivity: "Ayer",
  },
  {
    id: "3",
    name: "Ana Martínez",
    email: "ana@email.com",
    membershipStatus: "active",
    lastActivity: "Hace 2 días",
  },
  {
    id: "4",
    name: "Luis Fernández",
    email: "luis@email.com",
    membershipStatus: "expired",
    lastActivity: "Hace 1 semana",
  },
  {
    id: "5",
    name: "Sofia López",
    email: "sofia@email.com",
    membershipStatus: "active",
    lastActivity: "Hoy",
  },
  {
    id: "6",
    name: "Diego Morales",
    email: "diego@email.com",
    membershipStatus: "active",
    lastActivity: "Ayer",
  },
]

const daysOfWeek = [
  { id: "lun", name: "Lunes", shortName: "LUN" },
  { id: "mar", name: "Martes", shortName: "MAR" },
  { id: "mie", name: "Miércoles", shortName: "MIÉ" },
  { id: "jue", name: "Jueves", shortName: "JUE" },
  { id: "vie", name: "Viernes", shortName: "VIE" },
  { id: "sab", name: "Sábado", shortName: "SÁB" },
  { id: "dom", name: "Domingo", shortName: "DOM" },
]

export default function RoutineBuilder({ onBack, onLogout }: RoutineBuilderProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [routines, setRoutines] = useState<Record<string, Exercise[]>>({
    lun: [],
    mar: [],
    mie: [],
    jue: [],
    vie: [],
    sab: [],
    dom: [],
  })
  const [draggedExercise, setDraggedExercise] = useState<Exercise | null>(null)
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [routineName, setRoutineName] = useState("")

  const filteredExercises = availableExercises.filter(
    (exercise) =>
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.muscleGroups.some((group) => group.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const activeStudents = students.filter((student) => student.membershipStatus === "active")

  const handleDragStart = (e: React.DragEvent, exercise: Exercise) => {
    setDraggedExercise(exercise)
    e.dataTransfer.effectAllowed = "copy"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "copy"
  }

  const handleDrop = (e: React.DragEvent, dayId: string) => {
    e.preventDefault()
    if (draggedExercise) {
      const newExercise = { ...draggedExercise, id: `${draggedExercise.id}-${Date.now()}` }
      setRoutines((prev) => ({
        ...prev,
        [dayId]: [...prev[dayId], newExercise],
      }))
      setDraggedExercise(null)
    }
  }

  const removeExercise = (dayId: string, exerciseId: string) => {
    setRoutines((prev) => ({
      ...prev,
      [dayId]: prev[dayId].filter((ex) => ex.id !== exerciseId),
    }))
  }

  const handleStudentSelection = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents([...selectedStudents, studentId])
    } else {
      setSelectedStudents(selectedStudents.filter((id) => id !== studentId))
    }
  }

  const handleSaveRoutine = () => {
    console.log("Guardando rutina:", {
      name: routineName,
      routines,
      assignedStudents: selectedStudents,
    })
    // Aquí se guardaría la rutina y se asignaría a los estudiantes seleccionados
  }

  const totalExercises = Object.values(routines).reduce((total, dayExercises) => total + dayExercises.length, 0)

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack} className="text-gray-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Constructor de Rutinas</h1>
                <p className="text-gray-400">Arrastra ejercicios y asigna a estudiantes</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-400">
                {totalExercises} ejercicios • {selectedStudents.length} estudiantes seleccionados
              </p>
            </div>
            <Button
              onClick={handleSaveRoutine}
              disabled={totalExercises === 0 || selectedStudents.length === 0 || !routineName}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              Guardar y Asignar Rutina
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[calc(100vh-200px)]">
          {/* Exercise Library */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-900 border-gray-800 h-full">
              <CardHeader>
                <CardTitle className="text-white">Biblioteca de Ejercicios</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar ejercicios..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-350px)]">
                  <div className="p-4 space-y-2">
                    {filteredExercises.map((exercise) => (
                      <div
                        key={exercise.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, exercise)}
                        className="p-3 bg-gray-800 rounded-lg border border-gray-700 cursor-grab hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          <GripVertical className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-white text-sm truncate">{exercise.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs bg-gray-700 text-gray-300">
                                {exercise.sets} series
                              </Badge>
                              <span className="text-xs text-gray-400">{exercise.reps}</span>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {exercise.muscleGroups.map((group) => (
                                <Badge key={group} variant="outline" className="text-xs border-gray-600 text-gray-400">
                                  {group}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Routine Builder */}
          <div className="lg:col-span-3">
            <div className="mb-4">
              <Input
                placeholder="Nombre de la rutina (ej: Rutina Principiantes Semana 1)"
                value={routineName}
                onChange={(e) => setRoutineName(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 h-[calc(100%-60px)]">
              {daysOfWeek.map((day) => (
                <Card key={day.id} className="bg-gray-900 border-gray-800 flex flex-col">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-center text-white text-lg">{day.shortName}</CardTitle>
                    <p className="text-center text-gray-400 text-sm">{day.name}</p>
                  </CardHeader>
                  <CardContent className="flex-1 p-3">
                    <div
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, day.id)}
                      className="min-h-[400px] border-2 border-dashed border-gray-700 rounded-lg p-2 hover:border-gray-600 transition-colors"
                    >
                      {routines[day.id].length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                          <Plus className="w-8 h-8 mb-2" />
                          <p className="text-sm text-center">Arrastra ejercicios aquí</p>
                        </div>
                      ) : (
                        <ScrollArea className="h-[400px]">
                          <div className="space-y-2">
                            {routines[day.id].map((exercise, index) => (
                              <div
                                key={exercise.id}
                                className="p-3 bg-gray-800 rounded-lg border border-gray-700 group"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-white text-sm truncate">{exercise.name}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge variant="secondary" className="text-xs bg-gray-700 text-gray-300">
                                        {exercise.sets} series
                                      </Badge>
                                      <span className="text-xs text-gray-400">{exercise.reps}</span>
                                    </div>
                                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                                      {exercise.weight && (
                                        <div className="flex items-center gap-1">
                                          <Weight className="w-3 h-3" />
                                          <span>{exercise.weight}</span>
                                        </div>
                                      )}
                                      {exercise.rest && (
                                        <div className="flex items-center gap-1">
                                          <Clock className="w-3 h-3" />
                                          <span>{exercise.rest}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeExercise(day.id, exercise.id)}
                                    className="w-6 h-6 text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Student Assignment */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-900 border-gray-800 h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <UserPlus className="w-5 h-5 text-purple-400" />
                  Asignar a Estudiantes
                </CardTitle>
                <p className="text-sm text-gray-400">Selecciona los estudiantes para esta rutina</p>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-350px)]">
                  <div className="p-4 space-y-3">
                    {activeStudents.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-700/50 transition-colors"
                      >
                        <Checkbox
                          id={student.id}
                          checked={selectedStudents.includes(student.id)}
                          onCheckedChange={(checked) => handleStudentSelection(student.id, checked as boolean)}
                        />
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={student.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="bg-purple-600 text-white text-xs">
                            {student.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{student.name}</p>
                          <p className="text-gray-400 text-xs truncate">{student.email}</p>
                          <p className="text-gray-500 text-xs">Última actividad: {student.lastActivity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {selectedStudents.length > 0 && (
                  <div className="p-4 border-t border-gray-800">
                    <div className="bg-purple-900/30 rounded-lg p-3 border border-purple-700/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-200 text-sm font-medium">
                          {selectedStudents.length} estudiantes seleccionados
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {selectedStudents.slice(0, 3).map((studentId) => {
                          const student = students.find((s) => s.id === studentId)
                          return (
                            <Badge
                              key={studentId}
                              variant="secondary"
                              className="text-xs bg-purple-800 text-purple-200"
                            >
                              {student?.name.split(" ")[0]}
                            </Badge>
                          )
                        })}
                        {selectedStudents.length > 3 && (
                          <Badge variant="secondary" className="text-xs bg-purple-800 text-purple-200">
                            +{selectedStudents.length - 3} más
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
