import { supabase } from "@/lib/supabase";

export const routineExerciseService = {
    async bulkInsert({ routineId, exercises }: {
        routineId: string;
        exercises: {
            exercise_id: string;
            day_of_week: number;
            order_in_day: number;
            sets_override?: string;
            reps_override?: string;
            weight_override?: string;
            rest_override?: string;
        }[];
    }) {
        const payload = exercises.map(ex => ({
            routine_id: routineId,
            ...ex
        }));
    const { error } = await supabase
            .from("routine_exercises")
            .insert(payload);

        if (error) {
            console.log("error al guardar los ejercicios de la rutina",error.message)
            throw error;
        }
    }
};
