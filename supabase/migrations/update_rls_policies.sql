-- Drop existing policies
DROP POLICY IF EXISTS "Users can create their own workout plans" ON workout_plans;

-- Create updated policy that allows creation during signup
CREATE POLICY "Users can create their own workout plans"
ON workout_plans FOR INSERT
WITH CHECK (
  auth.uid() = user_id OR 
  (
    -- Allow creation during signup when the user_id matches the current session
    auth.role() = 'authenticated' AND 
    user_id = auth.uid()
  )
); 