"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowLeft,
  Search,
  Plus,
  Trash2,
  GripVertical,
  Target,
  Clock,
  Weight,
  Users,
  UserPlus,
  Edit3,
  Save,
  X,
  CheckCircle,
  Sparkles,
} from "lucide-react"
import { exerciseService } from "@/lib/excercise"
import { userService } from "@/lib/users"
import { routineService } from "@/lib/routines"
import { routineExerciseService } from "@/lib/routine-excercise"
import { studentRoutineService } from "@/lib/student-excercise"
import { authService } from "@/lib/auth"

interface Exercise {
  id: string
  name: string
  sets: string
  reps: string
  weight?: string | null
  rest?: string | null
  category: string
  muscleGroups: string[]
  description: string
  difficulty: "principiante" | "intermedio" | "avanzado"
  equipment: string
  notes?: string | null
  exercise_id: string
  // Campos para valores personalizados en la rutina
  custom_sets?: string
  custom_reps?: string
  custom_weight?: string
  custom_rest?: string
  isModified?: boolean
}

interface Student {
  id: string
  name: string
  email: string
  avatar?: string
  membershipStatus: "active" | "expired"
  lastActivity: string
}

const daysOfWeek = [
  { id: "lun", name: "Lunes", shortName: "LUN" },
  { id: "mar", name: "Martes", shortName: "MAR" },
  { id: "mie", name: "Miércoles", shortName: "MIÉ" },
  { id: "jue", name: "Jueves", shortName: "JUE" },
  { id: "vie", name: "Viernes", shortName: "VIE" },
  { id: "sab", name: "Sábado", shortName: "SÁB" },
  { id: "dom", name: "Domingo", shortName: "DOM" },
]

interface RoutineBuilderProps {
  onBack: () => void
  onLogout: () => void
}

export default function RoutineBuilder({ onBack, onLogout }: RoutineBuilderProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchStudents, setSearchStudents] = useState("")
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
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([])
  const [allStudents, setAllStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [errorLoadingData, setErrorLoadingData] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false)

  // Estados para edición de ejercicios
  const [editingExercise, setEditingExercise] = useState<{
    dayId: string
    exerciseId: string
    exercise: Exercise
  } | null>(null)
  const [editForm, setEditForm] = useState({
    sets: "",
    reps: "",
    weight: "",
    rest: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setErrorLoadingData(null)
      try {
        const [fetchedExercises, fetchedUsers] = await Promise.all([
          exerciseService.getExercises(),
          userService.getUsers(),
        ])

        if (fetchedExercises) {
          const transformedExercises: Exercise[] = fetchedExercises.map((ex: any) => ({
            id: ex.id,
            name: ex.name,
            description: ex.description,
            category: ex.category,
            difficulty: ex.difficulty,
            equipment: ex.equipment,
            muscleGroups: ex.muscle_groups || [],
            sets: ex.sets_suggested || "",
            reps: ex.reps_suggested || "",
            rest: ex.rest_time || "",
            notes: ex.notes || null,
            weight: null,
            exercise_id: ex.id,
          }))
          setAvailableExercises(transformedExercises)
        }

        if (fetchedUsers) {
          const transformedUsers: Student[] = fetchedUsers.map((user: any) => ({
            id: user.id,
            name: user.full_name,
            email: user.email,
            avatar: user.avatar || "/placeholder.svg",
            membershipStatus: user.membershipStatus || "active",
            lastActivity: user.lastActivity || "N/A",
          }))
          setAllStudents(transformedUsers)
        }
      } catch (error: any) {
        console.error("Error al cargar datos:", error)
        setErrorLoadingData(`Error al cargar datos: ${error.message || "Error desconocido"}`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredExercises = availableExercises.filter(
      (exercise) =>
          exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          exercise.muscleGroups.some((group) => group.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const activeStudents = allStudents.filter((student) => student.membershipStatus === "active")

  const filteredStudents = activeStudents.filter(
      (student) =>
          student.name.toLowerCase().includes(searchStudents.toLowerCase()) ||
          student.email.toLowerCase().includes(searchStudents.toLowerCase()),
  )

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
      const newExercise = {
        ...draggedExercise,
        id: `${draggedExercise.id}-${Date.now()}`,
        exercise_id: draggedExercise.id,
        // Inicializar valores personalizados con los valores originales
        custom_sets: draggedExercise.sets,
        custom_reps: draggedExercise.reps,
        custom_weight: draggedExercise.weight || "",
        custom_rest: draggedExercise.rest || "",
        isModified: false,
      }
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

  // Funciones para editar ejercicios
  const openEditDialog = (dayId: string, exerciseId: string) => {
    const exercise = routines[dayId].find((ex) => ex.id === exerciseId)
    if (exercise) {
      setEditingExercise({ dayId, exerciseId, exercise })
      setEditForm({
        sets: exercise.custom_sets || exercise.sets,
        reps: exercise.custom_reps || exercise.reps,
        weight: exercise.custom_weight || exercise.weight || "",
        rest: exercise.custom_rest || exercise.rest || "",
      })
    }
  }

  const closeEditDialog = () => {
    setEditingExercise(null)
    setEditForm({ sets: "", reps: "", weight: "", rest: "" })
  }

  const saveExerciseChanges = () => {
    if (!editingExercise) return

    const { dayId, exerciseId } = editingExercise

    setRoutines((prev) => ({
      ...prev,
      [dayId]: prev[dayId].map((ex) =>
          ex.id === exerciseId
              ? {
                ...ex,
                custom_sets: editForm.sets,
                custom_reps: editForm.reps,
                custom_weight: editForm.weight,
                custom_rest: editForm.rest,
                isModified: true,
              }
              : ex,
      ),
    }))

    closeEditDialog()
  }

  // Función para reiniciar estados después de guardar
  const resetRoutineStates = () => {
    setRoutines({
      lun: [],
      mar: [],
      mie: [],
      jue: [],
      vie: [],
      sab: [],
      dom: [],
    })
    setSelectedStudents([])
    setRoutineName("")
    setSearchTerm("")
    setSearchStudents("")
    setDraggedExercise(null)
    setEditingExercise(null)
    setEditForm({ sets: "", reps: "", weight: "", rest: "" })
  }

  const handleSaveRoutine = async () => {
    setIsSaving(true)
    try {
      const { user } = await authService.getCurrentUser()
      if (!user) throw new Error("Usuario no autenticado")

      const routine = await routineService.createRoutine({
        name: routineName,
        createdBy: user.id,
      })

      const allExercises = Object.entries(routines).flatMap(([dayKey, exercises]) =>
          exercises.map((ex, index) => ({
            exercise_id: ex.exercise_id,
            day_of_week: daysOfWeek.findIndex((d) => d.id === dayKey),
            order_in_day: index,
            // Usar valores personalizados si fueron modificados, sino usar originales
            sets_override: ex.isModified ? ex.custom_sets : undefined,
            reps_override: ex.isModified ? ex.custom_reps : undefined,
            weight_override: ex.isModified ? ex.custom_weight : undefined,
            rest_override: ex.isModified ? ex.custom_rest : undefined,
          })),
      )

      await routineExerciseService.bulkInsert({
        routineId: routine.id,
        exercises: allExercises,
      })

      if (selectedStudents.length > 0) {
        await studentRoutineService.bulkAssign({
          routineId: routine.id,
          assignedBy: user.id,
          studentIds: selectedStudents,
        })
      }

      // Mostrar mensaje de éxito
      setShowSuccessMessage(true)

      // Reiniciar estados después de un breve delay
      setTimeout(() => {
        resetRoutineStates()
        setShowSuccessMessage(false)
      }, 3000)
    } catch (error: any) {
      console.error("Error al guardar rutina:", error)
      alert(`Error al guardar rutina: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const totalExercises = Object.values(routines).reduce((total, dayExercises) => total + dayExercises.length, 0)

  // Función para obtener los valores a mostrar (personalizados o originales)
  const getDisplayValues = (exercise: Exercise) => ({
    sets: exercise.custom_sets || exercise.sets,
    reps: exercise.custom_reps || exercise.reps,
    weight: exercise.custom_weight || exercise.weight,
    rest: exercise.custom_rest || exercise.rest,
  })

  return (
      <div className="min-h-screen bg-gray-950 text-white">
        {/* Mensaje de éxito */}
        {showSuccessMessage && (
            <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-full">
              <Alert className="bg-green-900 border-green-700 text-green-100 shadow-lg">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <AlertDescription className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-green-400" />
                  <span className="font-medium">¡Rutina creada exitosamente!</span>
                  <span className="text-green-300">Se ha asignado a {selectedStudents.length} estudiantes</span>
                </AlertDescription>
              </Alert>
            </div>
        )}

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
                  disabled={totalExercises === 0 || !routineName || isLoading || isSaving}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:opacity-50"
              >
                {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Guardando...
                    </>
                ) : (
                    "Guardar y Asignar Rutina"
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w mx-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-100vh">
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
                  <ScrollArea className="h-100vh">
                    {isLoading ? (
                        <div className="p-4 text-center text-gray-400">Cargando ejercicios...</div>
                    ) : errorLoadingData ? (
                        <div className="p-4 text-center text-red-400">{errorLoadingData}</div>
                    ) : filteredExercises.length === 0 ? (
                        <div className="p-4 text-center text-gray-400">
                          No hay ejercicios disponibles o no se encontraron.
                        </div>
                    ) : (
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
                                          <Badge
                                              key={group}
                                              variant="outline"
                                              className="text-xs border-gray-600 text-gray-400"
                                          >
                                            {group}
                                          </Badge>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                          ))}
                        </div>
                    )}
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

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 h-100vh">
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
                                  {routines[day.id].map((exercise, index) => {
                                    const displayValues = getDisplayValues(exercise)
                                    return (
                                        <div
                                            key={exercise.id}
                                            className="p-3 bg-gray-800 rounded-lg border border-gray-700 group relative"
                                        >
                                          {/* Indicador de modificación */}
                                          {exercise.isModified && (
                                              <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                                          )}

                                          <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                              <h4 className="font-medium text-white text-sm truncate">{exercise.name}</h4>
                                              <div className="flex items-center gap-2 mt-1">
                                                <Badge
                                                    variant="secondary"
                                                    className={`text-xs ${exercise.isModified ? "bg-blue-700 text-blue-200" : "bg-gray-700 text-gray-300"}`}
                                                >
                                                  {displayValues.sets} series
                                                </Badge>
                                                <span
                                                    className={`text-xs ${exercise.isModified ? "text-blue-300" : "text-gray-400"}`}
                                                >
                                          {displayValues.reps}
                                        </span>
                                              </div>
                                              <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                                                {displayValues.weight && (
                                                    <div className="flex items-center gap-1">
                                                      <Weight className="w-3 h-3" />
                                                      <span className={exercise.isModified ? "text-blue-300" : ""}>
                                              {displayValues.weight}
                                            </span>
                                                    </div>
                                                )}
                                                {displayValues.rest && (
                                                    <div className="flex items-center gap-1">
                                                      <Clock className="w-3 h-3" />
                                                      <span className={exercise.isModified ? "text-blue-300" : ""}>
                                              {displayValues.rest}
                                            </span>
                                                    </div>
                                                )}
                                              </div>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                              <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  onClick={() => openEditDialog(day.id, exercise.id)}
                                                  className="w-6 h-6 text-gray-400 hover:text-blue-400"
                                              >
                                                <Edit3 className="w-3 h-3" />
                                              </Button>
                                              <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  onClick={() => removeExercise(day.id, exercise.id)}
                                                  className="w-6 h-6 text-gray-400 hover:text-red-400"
                                              >
                                                <Trash2 className="w-3 h-3" />
                                              </Button>
                                            </div>
                                          </div>
                                        </div>
                                    )
                                  })}
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
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        placeholder="Buscar estudiantes..."
                        value={searchStudents}
                        onChange={(e) => setSearchStudents(e.target.value)}
                        className="pl-10 bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-100vh">
                    {isLoading ? (
                        <div className="p-4 text-center text-gray-400">Cargando estudiantes...</div>
                    ) : errorLoadingData ? (
                        <div className="p-4 text-center text-red-400">{errorLoadingData}</div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="p-4 text-center text-gray-400">
                          {searchStudents ? "No se encontraron estudiantes." : "No hay estudiantes activos disponibles."}
                        </div>
                    ) : (
                        <div className="p-4 space-y-3">
                          {filteredStudents.map((student) => (
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
                    )}
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
                              const student = allStudents.find((s) => s.id === studentId)
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

        {/* Dialog para editar ejercicio */}
        <Dialog open={!!editingExercise} onOpenChange={closeEditDialog}>
          <DialogContent className="bg-gray-900 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">Editar Ejercicio: {editingExercise?.exercise.name}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-sets" className="text-gray-300">
                    Series
                  </Label>
                  <Input
                      id="edit-sets"
                      value={editForm.sets}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, sets: e.target.value }))}
                      placeholder="ej: 3"
                      className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-reps" className="text-gray-300">
                    Repeticiones
                  </Label>
                  <Input
                      id="edit-reps"
                      value={editForm.reps}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, reps: e.target.value }))}
                      placeholder="ej: 12"
                      className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-weight" className="text-gray-300">
                    Peso (opcional)
                  </Label>
                  <Input
                      id="edit-weight"
                      value={editForm.weight}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, weight: e.target.value }))}
                      placeholder="ej: 20kg"
                      className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-rest" className="text-gray-300">
                    Descanso (opcional)
                  </Label>
                  <Input
                      id="edit-rest"
                      value={editForm.rest}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, rest: e.target.value }))}
                      placeholder="ej: 60s"
                      className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div className="bg-gray-800 p-3 rounded-lg">
                <p className="text-sm text-gray-400 mb-2">Valores originales del ejercicio:</p>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>Series: {editingExercise?.exercise.sets}</p>
                  <p>Repeticiones: {editingExercise?.exercise.reps}</p>
                  {editingExercise?.exercise.weight && <p>Peso: {editingExercise.exercise.weight}</p>}
                  {editingExercise?.exercise.rest && <p>Descanso: {editingExercise.exercise.rest}</p>}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                  variant="outline"
                  onClick={closeEditDialog}
                  className="border-gray-600 text-gray-300 bg-transparent"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={saveExerciseChanges} className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
  )
}
