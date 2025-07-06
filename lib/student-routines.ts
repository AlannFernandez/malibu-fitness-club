import {supabase} from "./supabase"

export interface StudentRoutineExercise {
    id: string
    exercise_id: string
    routine_id: string
    day_of_week: number
    order_in_day: number
    sets_override?: string
    reps_override?: string
    weight_override?: string
    rest_override?: string
    exercise: {
        id: string
        name: string
        description: string
        category: string
        difficulty: string
        equipment: string
        muscle_groups: string[]
        sets_suggested: string
        reps_suggested: string
        rest_time: string
        notes?: string
    }
}

export interface StudentRoutine {
    id: string
    name: string
    created_at: string
    created_by: string
    exercises: StudentRoutineExercise[]
}

export interface DayRoutine {
    title: string
    duration: string
    exercises: {
        id: string
        name: string
        sets: string
        reps: string
        weight: string
        rest: string
        category: string
        muscleGroups: string[]
        description: string
        difficulty: string
        equipment: string
        notes?: string
    }[]
}

export interface WeeklyRoutine {
    lun: DayRoutine
    mar: DayRoutine
    mie: DayRoutine
    jue: DayRoutine
    vie: DayRoutine
    sab: DayRoutine
    dom: DayRoutine
}

class StudentRoutineService {
    /**
     * Verificar si el usuario tiene membresía activa o pendiente
     */
    async checkMembershipStatus(userId: string): Promise<boolean> {
        try {
            const {data, error} = await supabase
                .from("memberships")
                .select("*")
                .eq("user_id", userId)
                .in("status", ["active", "pending"])

            if (error) {
                return false
            }

            if (!data || data.length === 0) {
                return false
            }

            const currentDate = new Date().toISOString().split("T")[0]
            const activeMembership = data.find((membership) => {
                const endDate = membership.end_date
                return endDate >= currentDate
            })

            return !!activeMembership
        } catch (error) {
            return false
        }
    }

    /**
     * Buscar rutina activa del estudiante en student_routines
     */
    async getActiveStudentRoutine(studentId: string): Promise<any | null> {
        try {
            const {data, error} = await supabase
                .from("student_routines")
                .select("*")
                .eq("student_id", studentId)
                .eq("is_active", true)

            if (error) {
                return null
            }

            if (!data || data.length === 0) {
                return null
            }

            return data[0]
        } catch (error) {
            return null
        }
    }

    /**
     * Obtener ejercicios de la rutina desde routine_exercises
     */
    async getRoutineExercises(routineId: string): Promise<any[]> {
        try {
            const {data, error} = await supabase
                .from("routine_exercises")
                .select("*")
                .eq("routine_id", routineId)
                .order("day_of_week", {ascending: true})
                .order("order_in_day", {ascending: true})

            if (error) {
                return []
            }

            return data || []
        } catch (error) {
            return []
        }
    }

    /**
     * Obtener detalles de un ejercicio específico
     */
    async getExerciseDetails(exerciseId: string): Promise<any | null> {
        try {
            const {data, error} = await supabase.from("exercises").select("*").eq("id", exerciseId).single()

            if (error) {
                return null
            }

            return data
        } catch (error) {
            return null
        }
    }

    /**
     * Obtener detalles de la rutina
     */
    async getRoutineDetails(routineId: string): Promise<any | null> {
        try {
            const {data, error} = await supabase.from("routines").select("*").eq("id", routineId).single()

            if (error) {
                return null
            }

            return data
        } catch (error) {
            return null
        }
    }

    /**
     * Función principal: Seguir el flujo completo
     */
    async getStudentRoutines(studentId: string): Promise<StudentRoutine[]> {
        try {
            // Verificar membresía
            const hasMembership = await this.checkMembershipStatus(studentId)
            if (!hasMembership) {
                return []
            }

            // Buscar rutina activa
            const activeStudentRoutine = await this.getActiveStudentRoutine(studentId)
            if (!activeStudentRoutine) {
                return []
            }

            // Obtener ejercicios de la rutina
            const routineExercises = await this.getRoutineExercises(activeStudentRoutine.routine_id)
            if (routineExercises.length === 0) {
                return []
            }

            // Obtener detalles de cada ejercicio
            const exercisesWithDetails: StudentRoutineExercise[] = []

            for (const routineExercise of routineExercises) {
                const exerciseDetails = await this.getExerciseDetails(routineExercise.exercise_id)

                if (exerciseDetails) {
                    exercisesWithDetails.push({
                        id: routineExercise.id,
                        exercise_id: routineExercise.exercise_id,
                        routine_id: routineExercise.routine_id,
                        day_of_week: routineExercise.day_of_week,
                        order_in_day: routineExercise.order_in_day,
                        sets_override: routineExercise.sets_override,
                        reps_override: routineExercise.reps_override,
                        weight_override: routineExercise.weight_override,
                        rest_override: routineExercise.rest_override,
                        exercise: {
                            id: exerciseDetails.id,
                            name: exerciseDetails.name,
                            description: exerciseDetails.description,
                            category: exerciseDetails.category,
                            difficulty: exerciseDetails.difficulty,
                            equipment: exerciseDetails.equipment,
                            muscle_groups: exerciseDetails.muscle_groups || [],
                            sets_suggested: exerciseDetails.sets_suggested || "3",
                            reps_suggested: exerciseDetails.reps_suggested || "12",
                            rest_time: exerciseDetails.rest_time || "60s",
                            notes: exerciseDetails.notes,
                        },
                    })
                }
            }

            // Obtener detalles de la rutina
            const routineDetails = await this.getRoutineDetails(activeStudentRoutine.routine_id)
            if (!routineDetails) {
                return []
            }

            const finalRoutine: StudentRoutine = {
                id: routineDetails.id,
                name: routineDetails.name,
                created_at: routineDetails.created_at,
                created_by: routineDetails.created_by,
                exercises: exercisesWithDetails,
            }

            return [finalRoutine]
        } catch (error) {
            return []
        }
    }

    /**
     * Obtiene la rutina semanal organizada por días
     */
    async getCurrentWeeklyRoutine(studentId: string): Promise<WeeklyRoutine | null> {
        try {
            const routines = await this.getStudentRoutines(studentId)

            if (routines.length === 0) {
                return null
            }

            const currentRoutine = routines[0]

            // Inicializar rutina semanal vacía
            const weeklyRoutine: WeeklyRoutine = {
                lun: {title: "Lunes", duration: "0 min", exercises: []},
                mar: {title: "Martes", duration: "0 min", exercises: []},
                mie: {title: "Miércoles", duration: "0 min", exercises: []},
                jue: {title: "Jueves", duration: "0 min", exercises: []},
                vie: {title: "Viernes", duration: "0 min", exercises: []},
                sab: {title: "Sábado", duration: "0 min", exercises: []},
                dom: {title: "Domingo", duration: "0 min", exercises: []},
            }


            const dayKeys = [ "lun", "mar", "mie", "jue", "vie", "sab","dom"]

            // Agrupar ejercicios por día
            const exercisesByDay: { [key: number]: StudentRoutineExercise[] } = {}

            currentRoutine.exercises.forEach((exercise) => {
                if (!exercisesByDay[exercise.day_of_week]) {
                    exercisesByDay[exercise.day_of_week] = []
                }
                exercisesByDay[exercise.day_of_week].push(exercise)
            })

            // Procesar cada día
            Object.keys(exercisesByDay).forEach((dayNum) => {
                const dayIndex = Number.parseInt(dayNum)
                const dayKey = dayKeys[dayIndex] as keyof WeeklyRoutine

                if (dayKey && weeklyRoutine[dayKey]) {
                    const dayExercises = exercisesByDay[dayIndex]
                        .sort((a, b) => a.order_in_day - b.order_in_day)
                        .map((re) => ({
                            id: re.id,
                            name: re.exercise.name,
                            sets: re.sets_override || re.exercise.sets_suggested || "3",
                            reps: re.reps_override || re.exercise.reps_suggested || "12",
                            weight: re.weight_override || "Peso corporal",
                            rest: re.rest_override || re.exercise.rest_time || "60s",
                            category: re.exercise.category,
                            muscleGroups: re.exercise.muscle_groups,
                            description: re.exercise.description,
                            difficulty: re.exercise.difficulty,
                            equipment: re.exercise.equipment,
                            notes: re.exercise.notes,
                        }))

                    // Calcular duración estimada
                    const estimatedDuration = dayExercises.length * 3
                    const maxDuration = dayExercises.length * 4

                    // Generar título del día
                    const muscleGroups = dayExercises.flatMap((ex) => ex.muscleGroups)
                    const dayTitle = this.generateDayTitle(muscleGroups, dayKey)

                    weeklyRoutine[dayKey] = {
                        title: dayTitle,
                        duration: estimatedDuration > 0 ? `${estimatedDuration}-${maxDuration} min` : "Descanso",
                        exercises: dayExercises,
                    }
                }
            })

            return weeklyRoutine
        } catch (error) {
            return null
        }
    }

    /**
     * Genera título del día basado en grupos musculares
     */
    private generateDayTitle(muscleGroups: string[], dayKey: string): string {
        if (!muscleGroups || muscleGroups.length === 0) {
            return "Entrenamiento"
        }

        const muscleGroupCounts: { [key: string]: number } = {}

        muscleGroups.forEach((group) => {
            const normalizedGroup = group.toLowerCase()
            muscleGroupCounts[normalizedGroup] = (muscleGroupCounts[normalizedGroup] || 0) + 1
        })

        const sortedGroups = Object.entries(muscleGroupCounts)
            .sort(([, a], [, b]) => b - a)
            .map(([group]) => group)

        const groupTitles: { [key: string]: string } = {
            pecho: "Pecho",
            espalda: "Espalda",
            piernas: "Piernas",
            hombros: "Hombros",
            brazos: "Brazos",
            triceps: "Tríceps",
            biceps: "Bíceps",
            abdominales: "Core",
            core: "Core",
            gluteos: "Glúteos",
            cardio: "Cardio",
            cuadriceps: "Piernas",
            isquiotibiales: "Piernas",
            pantorrillas: "Piernas",
            antebrazos: "Brazos",
        }

        const primaryGroups = sortedGroups.slice(0, 2)
        const titleParts = primaryGroups.map((group) => groupTitles[group] || group)

        if (titleParts.length === 1) {
            return titleParts[0]
        } else if (titleParts.length === 2) {
            return `${titleParts[0]} y ${titleParts[1]}`
        }

        return titleParts.join(", ")
    }

    /**
     * Marca una rutina como completada para un estudiante
     */
    async markRoutineCompleted(studentId: string, routineId: string, dayOfWeek: number): Promise<void> {
        try {
            const {data: workout, error: workoutError} = await supabase
                .from("workouts")
                .insert({
                    user_id: studentId,
                    routine_id: routineId,
                    workout_date: new Date().toISOString().split("T")[0],
                    start_time: new Date().toISOString(),
                    end_time: new Date().toISOString(),
                    status: "completed",
                    notes: `Rutina completada para el día ${dayOfWeek}`,
                })
                .select()
                .single()

            if (workoutError) {
                throw workoutError
            }
        } catch (error) {
            throw error
        }
    }

    /**
     * Obtiene el historial de rutinas completadas por un estudiante
     */
    async getCompletedRoutines(studentId: string, limit = 10): Promise<any[]> {
        try {
            const {data, error} = await supabase
                .from("workouts")
                .select(`
                  id,
                  workout_date,
                  start_time,
                  end_time,
                  status,
                  notes,
                  routines (
                    id,
                    name
                  )
                `)
                .eq("user_id", studentId)
                .eq("status", "completed")
                .order("workout_date", {ascending: false})
                .limit(limit)

            if (error) {
                throw error
            }

            return data || []
        } catch (error) {
            throw error
        }
    }
}

export const studentRoutineService = new StudentRoutineService()
