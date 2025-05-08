-- Create week_schemas table to store user week schema metadata
CREATE TABLE IF NOT EXISTS week_schemas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  
  -- We've removed the unique constraint here because we're using a partial index below
);

-- Add a constraint that prevents multiple active schemas per user (only enforced when is_active is true)
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_schema_per_user 
ON week_schemas (user_id) 
WHERE is_active = TRUE;

-- Create week_schema_workouts junction table that links workout plans to days in the schema
CREATE TABLE IF NOT EXISTS week_schema_workouts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  week_schema_id UUID NOT NULL REFERENCES week_schemas(id) ON DELETE CASCADE,
  workout_plan_id UUID NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
  day_index INTEGER NOT NULL CHECK (day_index >= 0 AND day_index <= 6), -- 0 (Monday) to 6 (Sunday)
  order_index INTEGER NOT NULL DEFAULT 0, -- If we want to support ordering multiple workouts per day
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Each workout can only appear once per day in a schema
  CONSTRAINT unique_workout_day_schema UNIQUE (week_schema_id, workout_plan_id, day_index)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_week_schema_workouts_schema_id ON week_schema_workouts(week_schema_id);
CREATE INDEX IF NOT EXISTS idx_week_schema_workouts_day_index ON week_schema_workouts(day_index);

-- Add RLS (Row Level Security) policies
ALTER TABLE week_schemas ENABLE ROW LEVEL SECURITY;
ALTER TABLE week_schema_workouts ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own schemas
CREATE POLICY week_schemas_user_policy ON week_schemas
  FOR ALL
  USING (auth.uid() = user_id);

-- Allow users to manage their own schema workouts
CREATE POLICY week_schema_workouts_user_policy ON week_schema_workouts
  FOR ALL
  USING (
    week_schema_id IN (
      SELECT id FROM week_schemas WHERE user_id = auth.uid()
    )
  );

-- Create a function to set is_active to false for all other schemas when one is marked active
CREATE OR REPLACE FUNCTION maintain_single_active_schema()
RETURNS TRIGGER AS $$
BEGIN
  -- If the new/updated schema is active
  IF NEW.is_active = TRUE THEN
    -- Set all other schemas for this user to inactive
    UPDATE week_schemas
    SET is_active = FALSE
    WHERE user_id = NEW.user_id AND id != NEW.id AND is_active = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function before insert or update
CREATE TRIGGER maintain_single_active_schema_trigger
BEFORE INSERT OR UPDATE ON week_schemas
FOR EACH ROW
EXECUTE FUNCTION maintain_single_active_schema(); 