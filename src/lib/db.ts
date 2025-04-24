import { supabase } from './supabase';
import type { WorkoutPlan, Exercise, ExerciseCategory, DifficultyLevel } from "@/types/workout";

// Define the type for our default workouts that includes exercises
interface DefaultWorkout {
  name: string;
  description: string;
  exercises: Array<{
    name: string;
    sets: number;
    reps: number;
    notes?: string;
    order: number;
    category: ExerciseCategory;
    description?: string;
    muscle_groups: string[];
    difficulty_level: DifficultyLevel;
    equipment_needed: string;
  }>;
}

async function getExerciseIdByName(userId: string, name: string): Promise<string> {
  const { data, error } = await supabase
    .from('exercises')
    .select('id')
    .eq('user_id', userId)
    .eq('name', name)
    .single();

  if (error) throw error;
  if (!data) throw new Error(`Exercise not found: ${name}`);
  
  return data.id;
}

async function createExercise(userId: string, exercise: {
  name: string;
  description?: string;
  category: ExerciseCategory;
  muscle_groups: string[];
  difficulty_level: DifficultyLevel;
  equipment_needed: string;
}): Promise<string> {
  const { data, error } = await supabase
    .from('exercises')
    .insert({
      user_id: userId,
      name: exercise.name,
      description: exercise.description,
      category: exercise.category,
      muscle_groups: exercise.muscle_groups,
      difficulty_level: exercise.difficulty_level,
      equipment_needed: exercise.equipment_needed,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to create exercise');
  
  return data.id;
}

export async function createWorkoutPlan(userId: string, workoutPlan: DefaultWorkout) {
  // First create the workout plan
  const { data: plan, error: planError } = await supabase
    .from('workout_plans')
    .insert({
      user_id: userId,
      name: workoutPlan.name,
      description: workoutPlan.description,
      is_template: true
    })
    .select()
    .single();

  if (planError) throw planError;

  // Create exercises and link them to the workout
  const exercisePromises = workoutPlan.exercises.map(async (exercise) => {
    // Try to find existing exercise first
    try {
      const exerciseId = await getExerciseIdByName(userId, exercise.name);
      return {
        workout_plan_id: plan.id,
        exercise_id: exerciseId,
        sets: exercise.sets,
        reps: exercise.reps,
        notes: exercise.notes,
        order_index: exercise.order
      };
    } catch {
      // If exercise doesn't exist, create it
      const exerciseId = await createExercise(userId, {
        name: exercise.name,
        description: exercise.description,
        category: exercise.category,
        muscle_groups: exercise.muscle_groups,
        difficulty_level: exercise.difficulty_level,
        equipment_needed: exercise.equipment_needed,
      });
      return {
        workout_plan_id: plan.id,
        exercise_id: exerciseId,
        sets: exercise.sets,
        reps: exercise.reps,
        notes: exercise.notes,
        order_index: exercise.order
      };
    }
  });

  const exercisesWithIds = await Promise.all(exercisePromises);

  const { error: exercisesError } = await supabase
    .from('workout_exercises')
    .insert(exercisesWithIds);

  if (exercisesError) throw exercisesError;

  return plan;
}

export async function createDefaultWorkouts(userId: string, defaultWorkouts: DefaultWorkout[]) {
  for (const workout of defaultWorkouts) {
    try {
      console.log("Creating workout plan:", workout.name);
      await createWorkoutPlan(userId, workout);
      console.log("Successfully created workout plan:", workout.name);
    } catch (error) {
      console.error("Error in workout creation loop:", error);
      throw error;
    }
  }
}

interface DatabaseExercise {
  id: string;
  name: string;
  description: string;
  category: string;
  muscle_groups: string[];
  difficulty_level: string;
  equipment_needed: string;
}

interface WorkoutExerciseWithDetails {
  id: string;
  sets: number;
  reps: number;
  notes?: string;
  order_index: number;
  workout_plan_id: string;
  exercise: DatabaseExercise | null;
}

export type WorkoutPlanWithExercises = {
  id: string;
  name: string;
  description: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  exercises: {
    id: string;
    name: string;
    sets: number;
    reps: number;
    notes?: string;
    order: number;
    exercise_details: {
      description: string;
      category: string;
      muscle_groups: string[];
      difficulty_level: string;
      equipment_needed: string;
    };
  }[];
};

export async function getUserWorkouts(userId: string): Promise<WorkoutPlanWithExercises[]> {
  const { data: workoutPlans, error: workoutError } = await supabase
    .from("workout_plans")
    .select("*")
    .eq("user_id", userId);

  if (workoutError) throw workoutError;

  const workoutsWithExercises: WorkoutPlanWithExercises[] = [];

  for (const plan of workoutPlans) {
    const { data: exercises, error: exercisesError } = await supabase
      .from("workout_exercises")
      .select(`
        id,
        sets,
        reps,
        notes,
        order_index,
        workout_plan_id,
        exercise:exercises (
          id,
          name,
          description,
          category,
          muscle_groups,
          difficulty_level,
          equipment_needed
        )
      `)
      .eq("workout_plan_id", plan.id)
      .order('order_index') as { data: WorkoutExerciseWithDetails[] | null, error: any };

    if (exercisesError) throw exercisesError;

    workoutsWithExercises.push({
      ...plan,
      exercises: (exercises || [])
        .filter(ex => ex.exercise !== null)
        .map(ex => ({
          id: ex.id,
          name: ex.exercise!.name,
          sets: ex.sets,
          reps: ex.reps,
          notes: ex.notes,
          order: ex.order_index,
          exercise_details: {
            description: ex.exercise!.description,
            category: ex.exercise!.category,
            muscle_groups: ex.exercise!.muscle_groups,
            difficulty_level: ex.exercise!.difficulty_level,
            equipment_needed: ex.exercise!.equipment_needed
          }
        })),
    });
  }

  return workoutsWithExercises;
} 