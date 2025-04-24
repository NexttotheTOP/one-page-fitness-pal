-- Create fitness_profiles table
CREATE TABLE fitness_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    age INTEGER NOT NULL,
    gender VARCHAR(20) NOT NULL,
    height VARCHAR(20) NOT NULL,
    weight VARCHAR(20) NOT NULL,
    activity_level VARCHAR(20) NOT NULL,
    fitness_goals TEXT[] NOT NULL,
    dietary_preferences TEXT[] NOT NULL,
    health_restrictions TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id)
);

-- Add RLS policies
ALTER TABLE fitness_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own fitness profile"
    ON fitness_profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own fitness profile"
    ON fitness_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own fitness profile"
    ON fitness_profiles FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_fitness_profiles_updated_at
    BEFORE UPDATE ON fitness_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 