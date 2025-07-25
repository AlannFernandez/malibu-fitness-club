"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Plus, X, Dumbbell, Target, Weight, Users } from "lucide-react"


import { exerciseService} from "@/lib/excercise";

interface ExerciseCreatorProps {
  onBack: () => void
  onLogout: () => void
}

export default function ExerciseCreator({ onBack, onLogout }: ExerciseCreatorProps) {

  const [exerciseName, setExerciseName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [difficulty, setDifficulty] = useState<"principiante" | "intermedio" | "avanzado" | "">("") // Tipo específico para dificultad
  const [equipment, setEquipment] = useState("")
  const [muscleGroups, setMuscleGroups] = useState<string[]>([])
  const [sets, setSets] = useState("")
  const [reps, setReps] = useState("")
  const [restTime, setRestTime] = useState("")
  const [notes, setNotes] = useState("")
  const [newMuscleGroup, setNewMuscleGroup] = useState("")


  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const addMuscleGroup = () => {
    const trimmedGroup = newMuscleGroup.trim();
    if (trimmedGroup && !muscleGroups.includes(trimmedGroup)) {
      setMuscleGroups([...muscleGroups, trimmedGroup])
      setNewMuscleGroup("")
    }
  }

  const removeMuscleGroup = (group: string) => {
    setMuscleGroups(muscleGroups.filter((g) => g !== group))
  }


  const handleSave = async () => {
    setIsLoading(true);
    setMessage(null);


    if (!exerciseName || !description || !category || !difficulty || !equipment || muscleGroups.length === 0) {
      setMessage({ type: 'error', text: 'Por favor, completa todos los campos obligatorios (nombre, descripción, categoría, dificultad, equipamiento y al menos un grupo muscular).' });
      setIsLoading(false);
      return;
    }

    try {

      const exerciseData = {
        name: exerciseName,
        description: description,
        category: category,
        difficulty: difficulty as "principiante" | "intermedio" | "avanzado", // Asegura el tipo correcto
        equipment: equipment,
        muscle_groups: muscleGroups,
        sets_suggested: sets || null,
        reps_suggested: reps || null,
        rest_time: restTime || null,
        notes: notes || null,
      };


      const newExercise = await exerciseService.createExercise(exerciseData);

      if (newExercise) {
        setMessage({ type: 'success', text: '¡Ejercicio creado exitosamente!' });
        setExerciseName("")
        setDescription("")
        setCategory("")
        setDifficulty("")
        setEquipment("")
        setMuscleGroups([])
        setSets("")
        setReps("")
        setRestTime("")
        setNotes("")
        setNewMuscleGroup("")
      } else {
        setMessage({ type: 'error', text: 'No se pudo crear el ejercicio. Inténtalo de nuevo.' });
      }
    } catch (error: any) {
      console.error("Error al guardar el ejercicio:", error);
      setMessage({ type: 'error', text: `Error al guardar: ${error.message || 'Ocurrió un error inesperado.'}` });
    } finally {
      setIsLoading(false);
    }
  }

  return (
      <div className="min-h-screen bg-gray-950 text-white">
        {/* Header */}
        <div className="bg-gray-900 border-b border-gray-800 p-6">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={onBack} className="text-gray-400 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Crear Nuevo Ejercicio</h1>
                  <p className="text-gray-400">Añade un ejercicio personalizado a la biblioteca</p>
                </div>
              </div>
            </div>

            <Button
                onClick={handleSave}
                disabled={isLoading || !exerciseName || !description || !category || !difficulty || !equipment || muscleGroups.length === 0}
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Guardando...' : 'Guardar Ejercicio'}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto p-6">
          {/* Mensajes de éxito/error */}
          {message && (
              <div
                  className={`p-3 mb-6 rounded-lg text-sm ${
                      message.type === 'success' ? 'bg-green-700/30 text-green-200' : 'bg-red-700/30 text-red-200'
                  } border ${message.type === 'success' ? 'border-green-600' : 'border-red-600'}`}
                  role="alert"
              >
                {message.text}
              </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Target className="w-5 h-5 text-blue-400" />
                    Información Básica
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-300">
                      Nombre del Ejercicio *
                    </Label>
                    <Input
                        id="name"
                        value={exerciseName}
                        onChange={(e) => setExerciseName(e.target.value)}
                        placeholder="Ej: Press Banca con Barra"
                        className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-gray-300">
                      Descripción *
                    </Label>
                    <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe la técnica y ejecución del ejercicio..."
                        className="bg-gray-800 border-gray-700 text-white min-h-[100px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-300">Categoría *</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem className={'text-blue-50'} value="fuerza">Fuerza</SelectItem>
                          <SelectItem className={'text-blue-50'} value="cardio">Cardio</SelectItem>
                          <SelectItem className={'text-blue-50'} value="flexibilidad">Flexibilidad</SelectItem>
                          <SelectItem className={'text-blue-50'} value="funcional">Funcional</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300">Dificultad *</Label>
                      <Select value={difficulty} onValueChange={(value: "principiante" | "intermedio" | "avanzado") => setDifficulty(value)}>
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue placeholder="Seleccionar dificultad" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem className={'text-blue-50'} value="principiante">Principiante</SelectItem>
                          <SelectItem className={'text-blue-50'} value="intermedio">Intermedio</SelectItem>
                          <SelectItem className={'text-blue-50'} value="avanzado">Avanzado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Equipamiento *</Label>
                    <Select value={equipment} onValueChange={setEquipment}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="Seleccionar equipamiento" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem className={'text-blue-50'} value="peso-corporal">Peso Corporal</SelectItem>
                        <SelectItem className={'text-blue-50'} value="mancuernas">Mancuernas</SelectItem>
                        <SelectItem className={'text-blue-50'} value="barra">Barra</SelectItem>
                        <SelectItem className={'text-blue-50'} value="maquina">Máquina</SelectItem>
                        <SelectItem className={'text-blue-50'} value="kettlebell">Kettlebell</SelectItem>
                        <SelectItem className={'text-blue-50'} value="banda-elastica">Banda Elástica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Exercise Parameters */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Weight className="w-5 h-5 text-green-400" />
                    Parámetros del Ejercicio
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sets" className="text-gray-300">
                        Series Sugeridas
                      </Label>
                      <Input
                          id="sets"
                          value={sets}
                          onChange={(e) => setSets(e.target.value)}
                          placeholder="Ej: 3-4"
                          className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reps" className="text-gray-300">
                        Repeticiones
                      </Label>
                      <Input
                          id="reps"
                          value={reps}
                          onChange={(e) => setReps(e.target.value)}
                          placeholder="Ej: 8-12"
                          className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rest" className="text-gray-300">
                        Descanso
                      </Label>
                      <Input
                          id="rest"
                          value={restTime}
                          onChange={(e) => setRestTime(e.target.value)}
                          placeholder="Ej: 60-90s"
                          className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-gray-300">
                      Notas Adicionales
                    </Label>
                    <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Consejos de seguridad, variaciones, etc..."
                        className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Muscle Groups */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Users className="w-5 h-5 text-purple-400" />
                    Grupos Musculares *
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                        value={newMuscleGroup}
                        onChange={(e) => setNewMuscleGroup(e.target.value)}
                        placeholder="Ej: Pecho"
                        className="bg-gray-800 border-gray-700 text-white"
                        onKeyPress={(e) => e.key === "Enter" && addMuscleGroup()}
                    />
                    <Button onClick={addMuscleGroup} size="icon" className="bg-purple-600 hover:bg-purple-700">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {muscleGroups.map((group) => (
                        <Badge
                            key={group}
                            variant="secondary"
                            className="bg-purple-900/50 text-purple-200 border-purple-700"
                        >
                          {group}
                          <Button
                              variant="ghost"
                              size="icon"
                              className="w-4 h-4 ml-1 hover:bg-purple-800"
                              onClick={() => removeMuscleGroup(group)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Preview */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Dumbbell className="w-5 h-5 text-orange-400" />
                    Vista Previa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-white">{exerciseName || "Nombre del ejercicio"}</h3>
                      <p className="text-sm text-gray-400">{description || "Descripción del ejercicio"}</p>
                    </div>

                    {(sets || reps) && (
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="secondary" className="bg-gray-600 hover:bg-gray-500 text-gray-200 text-xs">
                            {sets || "0"} series
                          </Badge>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-400">{reps || "0"} repeticiones</span>
                        </div>
                    )}

                    {muscleGroups.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {muscleGroups.map((group) => (
                              <Badge key={group} variant="outline" className="text-xs border-gray-600 text-gray-300">
                                {group}
                              </Badge>
                          ))}
                        </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
  )
}
