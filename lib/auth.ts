import { supabase } from "./supabase"
import type { User } from "@supabase/supabase-js"

export interface AuthUser extends User {
    user_metadata: {
        full_name?: string
        role?: "student" | "teacher" | "admin"
    }
}

export const authService = {
    // Iniciar sesión
    async signIn(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) throw error

        // Obtener información adicional del usuario
        if (data.user) {
            const { data: userData, error: userError } = await supabase
                .from("users")
                .select("*")
                .eq("email", data.user.email)
                .single()


            if (userError) throw userError

            return { user: data.user, userData }
        }

        return { user: null, userData: null }
    },

    // Registrar usuarios
    async signUp(
        email: string,
    password: string,
    firstName: string,
    lastName: string
) {
    // Paso 1: Registro en auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password
    });

    if (authError) {
        console.error('Error en el registro de autenticación:', authError.message);
        throw authError;
    }

    return authData;
}
,

    // Cerrar sesión
    async signOut() {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
    },

    // Obtener usuario actual
    async getCurrentUser() {
        const {
            data: { user },
            error,
        } = await supabase.auth.getUser()
        if (error) throw error

        if (user) {
            const { data: userData, error: userError } = await supabase.from("users").select("*").eq("id", user.id).single()

            if (userError) throw userError
            return { user, userData }
        }

        return { user: null, userData: null }
    },

    // Verificar si la membresía está activa
    async checkMembershipStatus(userId: string) {
        const { data, error } = await supabase
            .from("memberships")
            .select("*")
            .eq("user_id", userId)
            .eq("status", "active")
            .gte("end_date", new Date().toISOString())
            .single()

        if (error && error.code !== "PGRST116") throw error

        return data ? "active" : "expired"
    },

    async saveUserDataTemp(
        gymId: string,
        firstName: string,
        lastName: string,
        email: string
    ): Promise<void> {

        const { data, error } = await supabase
            .from('user_data_temp')
            .insert([
                {
                    gym_id: gymId,
                    first_name: firstName,
                    last_name: lastName,
                    email: email
                },
            ])

        if (error) throw new Error(error.message);

    }
}
