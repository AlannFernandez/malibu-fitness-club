import { supabase } from './supabase';

export interface WorkoutExercise {
  id?: string;
  workout_id?: string | null;
  exercise_id?: string | null;
  sets_completed?: number | null;
  reps_completed?: string[] | null;
  weight_used?: string[] | null;
  rest_time_actual?: number[] | null;
  notes?: string | null;
  completed_at?: string | null;
}

export const workoutExerciseService = {
  async createWorkoutExercise(workoutExercise: Partial<WorkoutExercise>) {
    // Filtramos propiedades con valor undefined
    const cleaned = Object.fromEntries(
      Object.entries(workoutExercise).filter(([_, v]) => v !== undefined)
    );

    const { data, error } = await supabase
      .from('workout_exercises')
      .insert(cleaned)
    if (error) throw new Error(error.message);
    return data;
  }
};
