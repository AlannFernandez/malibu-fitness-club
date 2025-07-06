import { supabase } from "@/lib/supabase";

export const studentRoutineService = {
    async bulkAssign({ routineId, assignedBy, studentIds }: {
        routineId: string;
        assignedBy: string;
        studentIds: string[];
    }) {
        const payload = studentIds.map(studentId => ({
            routine_id: routineId,
            student_id: studentId,
            assigned_by: assignedBy
        }));

        const { error } = await supabase
            .from("student_routines")
            .insert(payload);

        if (error) {
            console.log("error al guardar los alumnos de la rutina",error.message)
            throw error;
        }
    }
};
