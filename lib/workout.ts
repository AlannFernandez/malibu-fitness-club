import { supabase } from './supabase'

export const workoutService = {
    async getWorkout(userId: string) {

        let { data: workouts, error } = await supabase
            .from('workouts')
            .select('*')
            .eq('user_id', userId)
        if(error) throw Error(error.message)
        return workouts
    },
    async createWorkout(userId: string, workout: any) {
        let { data, error } = await supabase
            .from('workouts')
            .insert([{ user_id: userId, ...workout }])
        if(error) throw Error(error.message)
        return data
    },
    async getActiveWorkout(userId: string, workoutDate: string, routineId: string, start_time: string) {
        let { data: workout, error } = await supabase
            .from('workouts')
            .select('id')
            .eq('user_id', userId)
            .eq('workout_date', workoutDate)
            .eq('routine_id', routineId)
            .eq('start_time', start_time)
            .single()
        if(error) throw Error(error.message)
        return workout
    }
}