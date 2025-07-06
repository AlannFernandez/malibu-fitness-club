import { supabase } from "./supabase"
import { UserGoal } from "@/interfaces/users-goals"

export const userGoalsService = {
  async getGoalsByUser(user_id: string): Promise<UserGoal[]> {
    const { data, error } = await supabase
      .from("user_goals")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })
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
  }
}