export interface UserGoal {
  id: string
  user_id: string
  goal_type: string
  target_value: number
  current_value: number
  unit: string
  target_date: string
  status: string
  notes?: string
  created_at?: string
  updated_at?: string
}