-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own workout plans" ON workout_plans;
DROP POLICY IF EXISTS "Users can create their own workout plans" ON workout_plans;
DROP POLICY IF EXISTS "Users can update their own workout plans" ON workout_plans;
DROP POLICY IF EXISTS "Users can delete their own workout plans" ON workout_plans;
DROP POLICY IF EXISTS "Users can view exercises in their workout plans" ON workout_exercises;
DROP POLICY IF EXISTS "Users can create exercises in their workout plans" ON workout_exercises;
DROP POLICY IF EXISTS "Users can update exercises in their workout plans" ON workout_exercises;
DROP POLICY IF EXISTS "Users can delete exercises from their workout plans" ON workout_exercises;
DROP POLICY IF EXISTS "Users can view their own workout sessions" ON workout_sessions;
DROP POLICY IF EXISTS "Users can create their own workout sessions" ON workout_sessions;
DROP POLICY IF EXISTS "Users can update their own workout sessions" ON workout_sessions;
DROP POLICY IF EXISTS "Users can delete their own workout sessions" ON workout_sessions;

-- Enable RLS on all tables
ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;

-- Create single policy for workout_plans that handles all operations
CREATE POLICY "Enable all operations for users based on user_id"
ON workout_plans
AS PERMISSIVE
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create single policy for workout_exercises through workout_plans
CREATE POLICY "Enable all operations for users own workout exercises"
ON workout_exercises
AS PERMISSIVE
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM workout_plans wp
    WHERE wp.id = workout_exercises.workout_plan_id
    AND wp.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM workout_plans wp
    WHERE wp.id = workout_plan_id
    AND wp.user_id = auth.uid()
  )
);

-- Create single policy for workout_sessions that handles all operations
CREATE POLICY "Enable all operations for users based on user_id"
ON workout_sessions
AS PERMISSIVE
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id); 