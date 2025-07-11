import { supabase } from './supabase'

export const workoutService = {
    async getWorkout(userId: string) {

        let { data: workouts, error } = await supabase
            .from('workouts')
            .select('*')
            .eq('user_id', userId)
        if(error) throw Error(error.message)
        return workouts
    }


}