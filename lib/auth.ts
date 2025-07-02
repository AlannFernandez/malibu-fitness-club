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
                .eq("id", data.user.id)
                .single()

            if (userError) throw userError

            return { user: data.user, userData }
        }

        return { user: null, userData: null }
    },

    // Registrar usuario
    async signUp(email: string, password: string, fullName: string, role: "student" | "teacher" = "student") {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    role: role,
                },
            },
        })
        console.log(error)
        if (error) throw error

        // Crear registro en la tabla users
        if (data.user) {
            const { error: insertError } = await supabase.from("users").insert({
                id: data.user.id,
                email: data.user.email!,
                full_name: fullName,
                role: role,
            })

            if (insertError) throw insertError
        }

        return data
    },

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
}
