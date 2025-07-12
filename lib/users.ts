import { User } from "@/interfaces/user";
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
    
    async getUserById(userId: string) {
        const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

        if (error) throw new Error(`Error obteniendo el usuario: ${error.message}`);

        return user;
    },

    async updateUserById(userId: string, updates: Partial<User>) {
        const { data, error } = await supabase
            .from('users')
            .update({
                ...updates,
                updated_at: new Date().toISOString(),
            })
            .eq('id', userId)
            .single() 

        if (error) throw Error(`Error actualizando el usuario: ${error.message}`);

        return data
    }
}