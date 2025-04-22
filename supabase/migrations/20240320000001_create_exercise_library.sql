-- Create the exercise category enum
DO $$ BEGIN
    CREATE TYPE exercise_category AS ENUM (
        'strength',
        'cardio',
        'flexibility'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create the difficulty level enum
DO $$ BEGIN
    CREATE TYPE difficulty_level AS ENUM (
        'beginner',
        'intermediate',
        'advanced'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Check existing enum values
SELECT enum_range(NULL::exercise_category);
SELECT enum_range(NULL::difficulty_level);

-- Create the exercises table if it doesn't exist
create table if not exists public.exercises (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    description text,
    category exercise_category,
    muscle_groups text[] not null,
    difficulty difficulty_level not null,
    equipment_needed text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policy
alter table public.exercises enable row level security;

-- Allow read access to authenticated users
create policy "Allow read access to authenticated users"
on public.exercises
for select
to authenticated
using (true);

-- First, clean up any existing data
delete from public.exercises;

-- Insert all exercises from workout schemes with appropriate categorization
insert into public.exercises (name, description, category, muscle_groups, difficulty, equipment_needed) values
    -- Push Day Exercises
    ('Bench Press', 'A compound exercise targeting chest muscles. Keep elbows at 45 degrees.', 'strength', '{Chest,Triceps,Front Deltoids}', 'intermediate', 'Barbell and Bench'),
    ('Overhead Press', 'A shoulder press movement. Keep core tight throughout the movement.', 'strength', '{Shoulders,Triceps}', 'intermediate', 'Barbell'),
    ('Incline Dumbbell Press', 'An upper chest focused pressing movement. Control the descent.', 'strength', '{Upper Chest,Front Deltoids,Triceps}', 'intermediate', 'Dumbbells and Incline Bench'),
    ('Lateral Raises', 'An isolation exercise for shoulder width. Keep slight bend in elbows.', 'strength', '{Side Deltoids}', 'beginner', 'Dumbbells'),
    ('Tricep Pushdowns', 'An isolation exercise for triceps. Keep elbows close to body.', 'strength', '{Triceps}', 'beginner', 'Cable Machine'),

    -- Pull Day Exercises
    ('Barbell Rows', 'A compound back exercise. Keep back straight and pull to lower chest.', 'strength', '{Back,Biceps,Rear Deltoids}', 'intermediate', 'Barbell'),
    ('Pull-ups', 'A bodyweight back exercise. Focus on full range of motion.', 'strength', '{Back,Biceps,Forearms}', 'advanced', 'Pull-up Bar'),
    ('Face Pulls', 'A rear deltoid and upper back exercise. Focus on rear deltoids.', 'strength', '{Rear Deltoids,Upper Back}', 'beginner', 'Cable Machine'),
    ('Barbell Curls', 'A bicep isolation exercise. Keep elbows stationary.', 'strength', '{Biceps}', 'beginner', 'Barbell'),
    ('Hammer Curls', 'A bicep and forearm exercise. Works both biceps and forearms.', 'strength', '{Biceps,Forearms}', 'beginner', 'Dumbbells'),

    -- Legs Day Exercises
    ('Squats', 'A compound lower body exercise. Keep chest up and break parallel.', 'strength', '{Quadriceps,Glutes,Hamstrings}', 'intermediate', 'Barbell and Squat Rack'),
    ('Romanian Deadlifts', 'A hip-hinge movement. Feel the hamstring stretch.', 'strength', '{Hamstrings,Lower Back,Glutes}', 'intermediate', 'Barbell'),
    ('Bulgarian Split Squats', 'A unilateral leg exercise. Keep front knee aligned.', 'strength', '{Quadriceps,Glutes,Hamstrings}', 'intermediate', 'Dumbbells and Bench'),
    ('Leg Press', 'A machine-based leg exercise. Do not lock out knees.', 'strength', '{Quadriceps,Glutes,Hamstrings}', 'beginner', 'Leg Press Machine'),
    ('Calf Raises', 'An isolation exercise for calves. Use full range of motion.', 'strength', '{Calves}', 'beginner', 'Step Platform'),

    -- Additional Upper Body Exercises
    ('Bent Over Rows', 'A compound back exercise. Squeeze shoulder blades together.', 'strength', '{Back,Biceps,Rear Deltoids}', 'intermediate', 'Barbell'),
    ('Lat Pulldowns', 'A back exercise focusing on lats. Get full stretch at top.', 'strength', '{Back,Biceps}', 'beginner', 'Cable Machine'),
    ('Bicep Curls', 'A bicep isolation exercise. Use full range of motion.', 'strength', '{Biceps}', 'beginner', 'Dumbbells'),

    -- Additional Lower Body Exercises
    ('Back Squats', 'A compound lower body movement. Drive through heels.', 'strength', '{Quadriceps,Glutes,Hamstrings}', 'intermediate', 'Barbell and Squat Rack'),
    ('Deadlifts', 'A compound full body exercise. Keep bar close to body.', 'strength', '{Hamstrings,Lower Back,Glutes,Quadriceps}', 'advanced', 'Barbell'),
    ('Walking Lunges', 'A dynamic leg exercise. Step with purpose.', 'strength', '{Quadriceps,Glutes,Hamstrings}', 'intermediate', 'Dumbbells'),
    ('Leg Extensions', 'An isolation exercise for quads. Focus on quad contraction.', 'strength', '{Quadriceps}', 'beginner', 'Leg Extension Machine'),
    ('Leg Curls', 'An isolation exercise for hamstrings. Control the negative.', 'strength', '{Hamstrings}', 'beginner', 'Leg Curl Machine'),
    ('Standing Calf Raises', 'A calf isolation exercise. Pause at top and bottom.', 'strength', '{Calves}', 'beginner', 'Calf Raise Machine'),

    -- Core Exercises
    ('Planks', 'A core stabilization exercise. Hold position maintaining straight line.', 'strength', '{Core,Shoulders}', 'beginner', 'None'),
    ('Russian Twists', 'A rotational core exercise. Control the rotation.', 'strength', '{Core,Obliques}', 'beginner', 'Weight Plate'),
    ('Dead Bugs', 'A core stability exercise. Keep lower back pressed to ground.', 'strength', '{Core,Lower Back}', 'beginner', 'None'),
    ('Cable Woodchoppers', 'A rotational core movement. Rotate from core, not arms.', 'strength', '{Core,Obliques}', 'intermediate', 'Cable Machine'),
    ('Back Extensions', 'A lower back strengthening exercise. Focus on lower back engagement.', 'strength', '{Lower Back,Glutes}', 'beginner', 'Back Extension Bench'),
    ('Hanging Leg Raises', 'An advanced core exercise. Control the movement.', 'strength', '{Core,Hip Flexors}', 'advanced', 'Pull-up Bar')
on conflict (id) do nothing;

-- After seeing the actual enum values, we can update the categories
-- UPDATE public.exercises SET category = 'correct_enum_value' WHERE name = 'Exercise Name'; 