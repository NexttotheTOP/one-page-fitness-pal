-- Create table for fitness profile generations
CREATE TABLE IF NOT EXISTS fitness_profile_generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  label TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE fitness_profile_generations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to select their own records
CREATE POLICY "Users can view their own generations" 
  ON fitness_profile_generations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own records
CREATE POLICY "Users can create their own generations" 
  ON fitness_profile_generations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own records
CREATE POLICY "Users can update their own generations" 
  ON fitness_profile_generations
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own records
CREATE POLICY "Users can delete their own generations" 
  ON fitness_profile_generations
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_fitness_profile_generations_user_id ON fitness_profile_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_fitness_profile_generations_timestamp ON fitness_profile_generations(timestamp); 