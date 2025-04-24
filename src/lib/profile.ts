import { supabase } from './supabase';

export interface FitnessProfile {
  id: string;
  user_id: string;
  thread_id: string;
  age: number;
  gender: string;
  height: string;
  weight: string;
  activity_level: string;
  fitness_goals: string[];
  dietary_preferences: string[];
  health_restrictions: string[];
  created_at: string;
  updated_at: string;
}

function generateThreadId(): string {
  // Generate a UUID v4
  return crypto.randomUUID();
}

export async function getUserFitnessProfile(userId: string): Promise<FitnessProfile | null> {
  const session = await supabase.auth.getSession();
  if (!session.data.session) {
    throw new Error('No active session');
  }

  const { data, error } = await supabase
    .from('fitness_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No profile found
      return null;
    }
    throw error;
  }

  return data;
}

export async function createFitnessProfile(userId: string, profile: Omit<FitnessProfile, 'id' | 'user_id' | 'thread_id' | 'created_at' | 'updated_at'>) {
  const threadId = generateThreadId();

  const { data, error } = await supabase
    .from('fitness_profiles')
    .insert({
      user_id: userId,
      thread_id: threadId,
      ...profile
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateFitnessProfile(userId: string, profile: Partial<Omit<FitnessProfile, 'id' | 'user_id' | 'thread_id' | 'created_at' | 'updated_at'>>) {
  const { data, error } = await supabase
    .from('fitness_profiles')
    .update(profile)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getOrCreateThreadId(userId: string): Promise<string> {
  const profile = await getUserFitnessProfile(userId);
  
  if (profile?.thread_id) {
    return profile.thread_id;
  }

  // If no profile exists or no thread_id, create a new profile with thread_id
  if (!profile) {
    const newProfile = await createFitnessProfile(userId, {
      age: 0,
      gender: '',
      height: '',
      weight: '',
      activity_level: '',
      fitness_goals: [],
      dietary_preferences: [],
      health_restrictions: []
    });
    return newProfile.thread_id;
  }

  // If profile exists but somehow has no thread_id (shouldn't happen with new SQL constraints)
  const threadId = generateThreadId();
  await updateFitnessProfile(userId, { ...profile, thread_id: threadId } as any);
  return threadId;
} 