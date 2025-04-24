export type ExerciseCategory = 'strength' | 'cardio' | 'flexibility';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export type Exercise = {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  category: ExerciseCategory;
  muscle_groups: string[];
  difficulty_level: DifficultyLevel;
  equipment_needed?: string[];
  created_at: string;
  updated_at: string;
};

export type WorkoutPlan = {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_template: boolean;
  created_at: string;
  updated_at: string;
};

export type WorkoutSession = {
  id: string;
  plan_id: string;
  user_id: string;
  date: string;
  completed: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type WorkoutExercise = {
  id: string;
  workout_plan_id: string;
  exercise_id: string;
  sets?: number;
  reps?: number;
  weight?: number;
  duration?: number; // in seconds
  order_index: number;
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type ExerciseProgress = {
  id: string;
  user_id: string;
  exercise_id: string;
  workout_session_id: string;
  sets_completed: number;
  reps_completed: number;
  weight_used?: number;
  date: string;
  notes?: string;
  created_at: string;
}; 