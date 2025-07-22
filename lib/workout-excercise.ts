import { supabase } from './supabase'

export const workoutExerciseService = {
    async createWorkoutExercise(workoutId: string, exercise: any) {
        let { data, error } = await supabase
            .from('workout_exercises')
            .insert([{ workout_id: workoutId, ...exercise }])
        if (error) throw Error(error.message)
        return data
    }
}