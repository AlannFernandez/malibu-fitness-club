import { supabase } from "./supabase"
import { UserGoal } from "@/interfaces/users-goals"

export const userGoalsService = {
  /**
   * Retorna todos los objetivos de un usuario especifico.
   * @param userId - El ID del usuario cuyos objetivos se van a recuperar.
   * @returns Una promesa que se resuelve en un array de objetos UserGoal.
   */
  async getGoalsByUser(userId: string): Promise<UserGoal[]> {

    const { data, error } = await supabase
      .from("user_goals")
      .select("*")
      .eq("user_id", userId)
      .eq("status","active")
    if (error) throw error
    return data as UserGoal[]
  },
  async addGoal(goal: Omit<UserGoal, "id" | "created_at" | "updated_at">): Promise<UserGoal> {
    const { data, error } = await supabase
      .from("user_goals")
      .insert([goal])
      .select()
      .single()
    if (error) throw error
    return data as UserGoal
  },
  async updateGoal(goalId: string, updates: Partial<UserGoal>):Promise<void> {

    const { data, error } = await supabase
      .from('user_goals')
      .update(updates)
      .eq('id',goalId )
      .select()
  }
}
