import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para la base de datos
export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    email: string
                    full_name: string
                    phone: string | null
                    role: "student" | "teacher" | "admin"
                    avatar_url: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email: string
                    full_name: string
                    phone?: string | null
                    role?: "student" | "teacher" | "admin"
                    avatar_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    full_name?: string
                    phone?: string | null
                    role?: "student" | "teacher" | "admin"
                    avatar_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            exercises: {
                Row: {
                    id: string
                    name: string
                    description: string
                    category: string
                    difficulty: "principiante" | "intermedio" | "avanzado"
                    equipment: string
                    muscle_groups: string[]
                    sets_suggested: string
                    reps_suggested: string
                    rest_time: string
                    notes: string | null
                    created_by: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description: string
                    category: string
                    difficulty?: "principiante" | "intermedio" | "avanzado"
                    equipment: string
                    muscle_groups: string[]
                    sets_suggested: string
                    reps_suggested: string
                    rest_time: string
                    notes?: string | null
                    created_by: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string
                    category?: string
                    difficulty?: "principiante" | "intermedio" | "avanzado"
                    equipment?: string
                    muscle_groups?: string[]
                    sets_suggested?: string
                    reps_suggested?: string
                    rest_time?: string
                    notes?: string | null
                    created_by?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            routines: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    created_by: string
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    created_by: string
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    created_by?: string
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            memberships: {
                Row: {
                    id: string
                    user_id: string
                    status: "active" | "expired" | "pending"
                    start_date: string
                    end_date: string
                    monthly_fee: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    status?: "active" | "expired" | "pending"
                    start_date: string
                    end_date: string
                    monthly_fee: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    status?: "active" | "expired" | "pending"
                    start_date?: string
                    end_date?: string
                    monthly_fee?: number
                    created_at?: string
                    updated_at?: string
                }
            }
        }
    }
}
