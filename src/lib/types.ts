export type WorkoutPlan = {
  id: string
  user_id: string
  name: string
  description: string
  created_at: string
  updated_at: string
  is_template: boolean
}

export type WorkoutSession = {
  id: string
  plan_id: string
  user_id: string
  date: string
  completed: boolean
  notes?: string
}

export type Exercise = {
  id: string
  name: string
  description: string
  category: 'strength' | 'cardio' | 'flexibility'
  muscle_groups: string[]
  difficulty_level: 'beginner' | 'intermediate' | 'advanced'
  equipment_needed: string[]
}

export type WorkoutExercise = {
  id: string
  workout_plan_id: string
  exercise_id: string
  sets?: number
  reps?: number
  weight?: number
  duration?: number
  order: number
  notes?: string
}

export type ExerciseProgress = {
  id: string
  user_id: string
  exercise_id: string
  workout_session_id: string
  sets_completed: number
  reps_completed: number
  weight_used?: number
  date: string
  notes?: string
} 