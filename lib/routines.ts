import { supabase } from "@/lib/supabase";

export const routineService = {
    async createRoutine({ name, createdBy }: { name: string; createdBy: string }) {
        const { data, error } = await supabase
            .from("routines")
            .insert([{ name, created_by: createdBy }])
            .select()
            .single();

        if (error) {
            console.error("error al guardar la rutina", error.message)
            throw error;
        }
        return data;
    }
};
