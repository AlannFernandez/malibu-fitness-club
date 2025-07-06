
import { supabase } from "./supabase";


interface Exercise {
    name: string;
    description: string;
    category: string;
    difficulty?: 'principiante' | 'intermedio' | 'avanzado';
    equipment: string;
    muscle_groups: string[];
    sets_suggested?: string | null;
    reps_suggested?: string | null;
    rest_time?: string | null;
    notes?: string | null;
    // 'id', 'created_at', 'updated_at' son manejados por Supabase automáticamente.
    // 'created_by' puede ser manejado por un RLS o insertado manualmente si es necesario.
    // No los requerimos al crear un nuevo ejercicio desde la aplicación.
    // id?: string;
    // created_by?: string;
    // created_at?: string;
    // updated_at?: string;
}


export const exerciseService = {
    /**
     * Crea un nuevo ejercicio en la base de datos.
     * @param exerciseData Los datos del ejercicio a crear.
     * @returns El ejercicio creado o un error.
     */
    async createExercise(exerciseData: Omit<Exercise, 'id' | 'created_at' | 'updated_at' | 'created_by'>) {
        try {

            const { data, error } = await supabase
                .from('exercises')
                .insert([exerciseData])
                .select();

            if (error) {
                console.error('Error al crear ejercicio:', error.message);
                throw new Error(`Error al crear ejercicio: ${error.message}`);
            }


            return data ? data[0] : null;
        } catch (err) {
            console.error('Excepción al crear ejercicio:', err);
            throw err;
        }
    },

    async getExercises() {
        let { data: exercises, error } = await supabase
            .from('exercises')
            .select('*')

        if (error) throw Error(`Error obteniendo ejercicios: ${error.message}`);

        return exercises

    }
    // async updateExercise(id: string, updates: Partial<Exercise>) { ... }
    // async deleteExercise(id: string) { ... }
};

