import { supabase } from "./supabase";

export const userService = {

    async getUsers() {
       let { data: users, error } = await supabase
           .from('users')
           .select("*")
           .eq('role', 'student')

        if (error) throw Error(`Error obteniendo los usuarios: ${error.message}`);

        return users
    },

    //async updateUserById(userId){}
}