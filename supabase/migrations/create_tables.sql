-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE exercise_category AS ENUM ('strength', 'cardio', 'flexibility');
CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');

-- Create exercises table
CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category exercise_category NOT NULL,
    muscle_groups TEXT[] NOT NULL,
    difficulty_level difficulty_level NOT NULL,
    equipment_needed TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create workout_plans table
CREATE TABLE workout_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_template BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create workout_sessions table
CREATE TABLE workout_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    completed BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create workout_exercises table (junction table between workout_plans and exercises)
CREATE TABLE workout_exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workout_plan_id UUID NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    sets INTEGER,
    reps INTEGER,
    weight DECIMAL(5,2),
    duration INTEGER, -- in seconds
    order_index INTEGER NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(workout_plan_id, order_index)
);

-- Create exercise_progress table
CREATE TABLE exercise_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    workout_session_id UUID NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
    sets_completed INTEGER NOT NULL,
    reps_completed INTEGER NOT NULL,
    weight_used DECIMAL(5,2),
    date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create updated_at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_exercises_updated_at
    BEFORE UPDATE ON exercises
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_plans_updated_at
    BEFORE UPDATE ON workout_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_sessions_updated_at
    BEFORE UPDATE ON workout_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_exercises_updated_at
    BEFORE UPDATE ON workout_exercises
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create RLS (Row Level Security) policies
ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;

-- Policies for workout_plans
CREATE POLICY "Users can view their own workout plans"
    ON workout_plans FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workout plans"
    ON workout_plans FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout plans"
    ON workout_plans FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workout plans"
    ON workout_plans FOR DELETE
    USING (auth.uid() = user_id);

-- Policies for workout_sessions
CREATE POLICY "Users can view their own workout sessions"
    ON workout_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workout sessions"
    ON workout_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout sessions"
    ON workout_sessions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workout sessions"
    ON workout_sessions FOR DELETE
    USING (auth.uid() = user_id);

-- Policies for exercise_progress
CREATE POLICY "Users can view their own exercise progress"
    ON exercise_progress FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own exercise progress"
    ON exercise_progress FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exercise progress"
    ON exercise_progress FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exercise progress"
    ON exercise_progress FOR DELETE
    USING (auth.uid() = user_id);

-- Policies for workout_exercises (through workout_plans)
CREATE POLICY "Users can view exercises in their workout plans"
    ON workout_exercises FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM workout_plans wp
        WHERE wp.id = workout_exercises.workout_plan_id
        AND wp.user_id = auth.uid()
    ));

CREATE POLICY "Users can create exercises in their workout plans"
    ON workout_exercises FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM workout_plans wp
        WHERE wp.id = workout_plan_id
        AND wp.user_id = auth.uid()
    ));

CREATE POLICY "Users can update exercises in their workout plans"
    ON workout_exercises FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM workout_plans wp
        WHERE wp.id = workout_exercises.workout_plan_id
        AND wp.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete exercises from their workout plans"
    ON workout_exercises FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM workout_plans wp
        WHERE wp.id = workout_exercises.workout_plan_id
        AND wp.user_id = auth.uid()
    )); 