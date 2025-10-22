import {supabase} from "./supabase"

// Interfaces para los datos de Supabase
interface SupabaseExercise {
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

interface SupabaseRoutineExercise {
    id: string
    exercise_id: string
    day_of_week: number
    order_in_day: number
    sets_override?: string
    reps_override?: string
    weight_override?: string
    rest_override?: string
    exercises: SupabaseExercise
}

interface SupabaseRoutine {
    id: string
    name: string
    created_at: string
    created_by: string
    routine_exercises: SupabaseRoutineExercise[]
}

interface SupabaseStudentRoutine {
    routine_id: string
    routines: SupabaseRoutine
}

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
    routine_id?: string
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
     * Verificar si el usuario tiene membresía activa o pendiente (Optimizado)
     */
    async checkMembershipStatus(userId: string): Promise<boolean> {
        try {
            const currentDate = new Date().toISOString().split("T")[0]
            
            const { data, error } = await supabase
                .from("memberships")
                .select("id")
                .eq("user_id", userId)
                .in("status", ["active", "pending"])
                .gte("end_date", currentDate)
                .limit(1)

            return !error && data && data.length > 0
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
     * Función principal optimizada: Una sola consulta con JOINs
     */
    async getStudentRoutines(studentId: string): Promise<StudentRoutine[]> {
        try {
            const { data, error } = await supabase
                .from("student_routines")
                .select(`
                    routine_id,
                    routines!inner (
                        id,
                        name,
                        created_at,
                        created_by,
                        routine_exercises!inner (
                            id,
                            exercise_id,
                            day_of_week,
                            order_in_day,
                            sets_override,
                            reps_override,
                            weight_override,
                            rest_override,
                            exercises!inner (
                                id,
                                name,
                                description,
                                category,
                                difficulty,
                                equipment,
                                muscle_groups,
                                sets_suggested,
                                reps_suggested,
                                rest_time,
                                notes
                            )
                        )
                    )
                `)
                .eq("student_id", studentId)
                .eq("is_active", true)

            if (error || !data || data.length === 0) {
                console.error("Error getting student routines:", error)
                return []
            }

            return data.map((studentRoutine: any) => {
                const routine = studentRoutine.routines
                
                if (!routine || !routine.routine_exercises || !Array.isArray(routine.routine_exercises)) {
                    console.warn("Rutina sin ejercicios válidos:", studentRoutine)
                    return {
                        id: routine?.id || "",
                        name: routine?.name || "Rutina sin nombre",
                        created_at: routine?.created_at || "",
                        created_by: routine?.created_by || "",
                        exercises: []
                    }
                }
                
                const sortedRoutineExercises = routine.routine_exercises.sort((a: SupabaseRoutineExercise, b: SupabaseRoutineExercise) => {
                    if (a.day_of_week !== b.day_of_week) {
                        return a.day_of_week - b.day_of_week
                    }
                    return a.order_in_day - b.order_in_day
                })
                
                const exercises: StudentRoutineExercise[] = sortedRoutineExercises.map((re: SupabaseRoutineExercise) => ({
                    id: re.id,
                    exercise_id: re.exercise_id,
                    routine_id: routine.id,
                    day_of_week: re.day_of_week,
                    order_in_day: re.order_in_day,
                    sets_override: re.sets_override,
                    reps_override: re.reps_override,
                    weight_override: re.weight_override,
                    rest_override: re.rest_override,
                    exercise: {
                        id: re.exercises.id,
                        name: re.exercises.name,
                        description: re.exercises.description,
                        category: re.exercises.category,
                        difficulty: re.exercises.difficulty,
                        equipment: re.exercises.equipment,
                        muscle_groups: re.exercises.muscle_groups || [],
                        sets_suggested: re.exercises.sets_suggested || "3",
                        reps_suggested: re.exercises.reps_suggested || "12",
                        rest_time: re.exercises.rest_time || "60s",
                        notes: re.exercises.notes,
                    }
                }))

                return {
                    id: routine.id,
                    name: routine.name,
                    created_at: routine.created_at,
                    created_by: routine.created_by,
                    exercises
                }
            }).filter(routine => routine.id) // Filtrar rutinas inválidas
        } catch (error) {
            console.error("Error getting student routines:", error)
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

            const exercisesByDay = new Map<number, StudentRoutineExercise[]>()

            currentRoutine.exercises.forEach((exercise) => {
                if (!exercisesByDay.has(exercise.day_of_week)) {
                    exercisesByDay.set(exercise.day_of_week, [])
                }
                exercisesByDay.get(exercise.day_of_week)!.push(exercise)
            })

            // Procesar cada día
            exercisesByDay.forEach((exercises, dayIndex) => {
                const dayKey = dayKeys[dayIndex] as keyof WeeklyRoutine

                if (dayKey && weeklyRoutine[dayKey]) {
                    const dayExercises = exercises
                        .sort((a, b) => a.order_in_day - b.order_in_day)
                        .map((re) => ({
                            id: re.id,
                            exercise_id: re.exercise_id,
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
                        routine_id: currentRoutine.id,
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
