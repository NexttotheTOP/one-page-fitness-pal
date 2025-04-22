import { supabase } from './supabase';
import type { WorkoutPlan } from "@/types/workout";

async function getExerciseIdByName(name: string): Promise<string> {
  const { data, error } = await supabase
    .from('exercises')
    .select('id')
    .eq('name', name)
    .single();

  if (error) throw error;
  if (!data) throw new Error(`Exercise not found: ${name}`);
  
  return data.id;
}

export async function createWorkoutPlan(userId: string, workoutPlan: {
  name: string;
  description: string;
  exercises: Array<{
    name: string;
    sets: number;
    reps: number;
    notes?: string;
    order: number;
  }>;
}) {
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

  // Get exercise IDs and create exercises
  const exercisePromises = workoutPlan.exercises.map(async (exercise) => {
    const exerciseId = await getExerciseIdByName(exercise.name);
    return {
      workout_plan_id: plan.id,
      exercise_id: exerciseId,
      sets: exercise.sets,
      reps: exercise.reps,
      notes: exercise.notes,
      order_index: exercise.order
    };
  });

  const exercisesWithIds = await Promise.all(exercisePromises);

  const { error: exercisesError } = await supabase
    .from('workout_exercises')
    .insert(exercisesWithIds);

  if (exercisesError) throw exercisesError;

  return plan;
}

export async function createDefaultWorkouts(userId: string, defaultWorkouts: WorkoutPlan[]) {
  for (const workout of defaultWorkouts) {
    try {
      console.log("Creating workout plan:", workout.name);
      
      // Create the workout plan
      const { data: workoutPlan, error: workoutError } = await supabase
        .from("workout_plans")
        .insert([
          {
            name: workout.name,
            description: workout.description,
            user_id: userId,
            is_template: true
          },
        ])
        .select()
        .single();

      if (workoutError) {
        console.error("Error creating workout plan:", workoutError);
        throw workoutError;
      }

      if (!workoutPlan) {
        throw new Error("No workout plan data received after creation");
      }

      console.log("Workout plan created:", workoutPlan.id);

      // Get exercise IDs and create exercises
      const exercisePromises = workout.exercises.map(async (exercise) => {
        console.log("Getting ID for exercise:", exercise.name);
        const exerciseId = await getExerciseIdByName(exercise.name);
        return {
          workout_plan_id: workoutPlan.id,
          exercise_id: exerciseId,
          sets: exercise.sets,
          reps: exercise.reps,
          notes: exercise.notes || null,
          order_index: exercise.order || 0
        };
      });

      const exercisesWithIds = await Promise.all(exercisePromises);
      console.log("Creating exercises with IDs:", exercisesWithIds);

      const { error: exercisesError } = await supabase
        .from("workout_exercises")
        .insert(exercisesWithIds);

      if (exercisesError) {
        console.error("Error creating exercises:", exercisesError);
        throw exercisesError;
      }

      console.log("Exercises created successfully for workout:", workout.name);
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
  equipment_needed: string[];
}

interface WorkoutExerciseWithDetails {
  id: string;
  sets: number;
  reps: number;
  notes?: string;
  order_index: number;
  workout_plan_id: string;
  exercise: DatabaseExercise;
}

export type WorkoutPlanWithExercises = {
  id: string;
  name: string;
  description: string;
  user_id: string;
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
      equipment_needed: string[];
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
      exercises: (exercises || []).map(ex => ({
        id: ex.id,
        name: ex.exercise.name,
        sets: ex.sets,
        reps: ex.reps,
        notes: ex.notes,
        order: ex.order_index,
        exercise_details: {
          description: ex.exercise.description,
          category: ex.exercise.category,
          muscle_groups: ex.exercise.muscle_groups,
          difficulty_level: ex.exercise.difficulty_level,
          equipment_needed: ex.exercise.equipment_needed
        }
      })),
    });
  }

  return workoutsWithExercises;
} 