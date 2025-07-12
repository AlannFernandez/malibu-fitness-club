import { supabase } from "./supabase"

export const attendanceService = {
    async getAttendance(userId: String) {

        let { data: attendance, error } = await supabase
            .from('attendance')
            .select('*')
            .eq('user_id', userId)

        if (error) throw Error(error.message)
        return attendance
    }

}