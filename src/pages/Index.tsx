import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { 
  Dumbbell, 
  PieChart, 
  Plus, 
  Search, 
  Brain, 
  User, 
  FolderPlus, 
  CalendarDays, 
  Loader2,
  ChevronDown,
  ChevronUp,
  Target,
  Activity,
  Scale,
  Check,
  X,
  Info,
  LightbulbIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import WorkoutPlan from '@/components/workout/WorkoutPlan';
import { useAuth } from "@/lib/auth-context";
import { getUserDisplayName } from "@/lib/utils";
import { getUserWorkouts, type WorkoutPlanWithExercises, getUserWeekSchemas, saveWeekSchema, deleteWeekSchema } from '@/lib/db';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from "framer-motion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/lib/supabase";
import { ExerciseCategory, DifficultyLevel } from "@/types/workout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import WeekSchema, { WeekSchemaData } from '@/components/WeekSchema';
import MentionTextarea from '@/components/ui/mention-textarea';
import ReactMarkdown from 'react-markdown'
import { cn } from "@/lib/utils";

// Add TypeScript interfaces for API
interface ContextExercise {
  id: string;
  name: string;
  description: string;
  category: string;
  muscle_groups: string[];
  difficulty_level: string;
  equipment_needed: string;
}

interface ContextWorkout {
  id: string;
  name: string;
  description: string;
  exercises: Array<{
    name: string;
    sets: number;
    reps: number;
    notes?: string;
    exercise_details: {
      description: string;
      category: string;
      muscle_groups: string[];
      difficulty_level: string;
      equipment_needed: string;
    };
  }>;
}

interface WorkoutContext {
  exercises: ContextExercise[];
  workouts: ContextWorkout[];
}

interface WorkoutNLQRequest {
  user_id: string;
  prompt: string;
  thread_id?: string;
  context?: WorkoutContext;
}

interface ExerciseDetails {
  description: string;
  category: string;
  muscle_groups: string[];
  difficulty: string;
  equipment_needed: string;
}

interface Exercise {
  name: string;
  sets: number;
  reps?: number;
  duration?: string;
  notes?: string;
  details: ExerciseDetails;
}

interface GeneratedWorkout {
  name: string;
  description: string;
  difficulty_level?: string;
  estimated_duration?: string;
  target_muscle_groups?: string[];
  equipment_required?: string[];
  exercises: Exercise[];
}

interface WorkoutResponse {
  user_id: string;
  thread_id: string;
  created_workouts: GeneratedWorkout[];
  reasoning: string;
}

// Utility function for difficulty colors
const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case 'beginner':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'intermediate':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'advanced':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

function tryParseJSON(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// Add markdown styles
const markdownStyles = `
  .markdown-content {
    font-size: 0.95rem;
    line-height: 1.7;
    color: #374151;
  }

  .markdown-content h1,
  .markdown-content h2,
  .markdown-content h3,
  .markdown-content h4 {
    font-weight: 600;
    line-height: 1.3;
    margin-top: 1.5em;
    margin-bottom: 0.75em;
  }

  .markdown-content h1 { font-size: 1.5em; color: #111827; }
  .markdown-content h2 { font-size: 1.3em; color: #1F2937; }
  .markdown-content h3 { font-size: 1.15em; color: #374151; }
  .markdown-content h4 { font-size: 1em; color: #4B5563; }

  .markdown-content p {
    margin-bottom: 1em;
  }

  .markdown-content ul,
  .markdown-content ol {
    margin: 0.5em 0 1em;
    padding-left: 1.5em;
  }

  .markdown-content ul { list-style-type: disc; }
  .markdown-content ol { list-style-type: decimal; }
  
  .markdown-content li {
    margin: 0.3em 0;
  }

  .markdown-content code {
    background: #F3F4F6;
    padding: 0.2em 0.4em;
    border-radius: 0.25em;
    font-size: 0.9em;
    color: #DC2626;
    font-family: ui-monospace, monospace;
  }

  .markdown-content pre {
    background: #F9FAFB;
    border: 1px solid #E5E7EB;
    border-radius: 0.5em;
    padding: 1em;
    margin: 1em 0;
    overflow-x: auto;
  }

  .markdown-content pre code {
    background: none;
    padding: 0;
    color: #374151;
    font-size: 0.9em;
  }

  .markdown-content blockquote {
    border-left: 3px solid #E5E7EB;
    padding-left: 1em;
    margin: 1em 0;
    color: #6B7280;
    font-style: italic;
  }

  .markdown-content table {
    width: 100%;
    border-collapse: collapse;
    margin: 1em 0;
  }

  .markdown-content th,
  .markdown-content td {
    border: 1px solid #E5E7EB;
    padding: 0.5em 1em;
    text-align: left;
  }

  .markdown-content th {
    background: #F9FAFB;
    font-weight: 600;
  }

  .markdown-content hr {
    border: none;
    border-top: 1px solid #E5E7EB;
    margin: 2em 0;
  }

  .markdown-content a {
    color: #7C3AED;
    text-decoration: none;
  }

  .markdown-content a:hover {
    text-decoration: underline;
  }

  .markdown-content img {
    max-width: 100%;
    border-radius: 0.5em;
    margin: 1em 0;
  }

  /* Specific styles for the streaming content */
  .streaming-markdown {
    font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
  }

  .streaming-markdown .token {
    opacity: 0.5;
    transition: opacity 0.2s ease;
  }

  .streaming-markdown .token.visible {
    opacity: 1;
  }
`;

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [workouts, setWorkouts] = useState<WorkoutPlanWithExercises[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWorkouts, setGeneratedWorkouts] = useState<any[]>([]);
  const [savedWorkouts, setSavedWorkouts] = useState(new Set<string>());
  const [workoutReasoning, setWorkoutReasoning] = useState<string | null>(null);
  const generatedWorkoutsRef = useRef<HTMLDivElement | null>(null);
  const [viewMode, setViewMode] = useState<'single' | 'week'>('single');
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedWorkouts, setSelectedWorkouts] = useState<Set<string>>(new Set());
  const [activeSchema, setActiveSchema] = useState<WeekSchemaData>({
    name: "My Week Plan",
    workouts: Array(7).fill([]).map(() => [])
  });
  const [savedSchemas, setSavedSchemas] = useState<WeekSchemaData[]>([]);
  const [isSchemasLoading, setIsSchemasLoading] = useState(false);
  const [streamedWorkouts, setStreamedWorkouts] = useState<Partial<GeneratedWorkout>[]>([]);
  const [streamedReasoning, setStreamedReasoning] = useState<string>('');
  const [isStreamComplete, setIsStreamComplete] = useState(false);
  const [mentionContext, setMentionContext] = useState<WorkoutContext>({ exercises: [], workouts: [] });
  const [accumulatedTokens, setAccumulatedTokens] = useState<string>('');
  const accumulatedTokensRef = useRef<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [lastStreamingText, setLastStreamingText] = useState<string>("");
  const [currentGenerationId, setCurrentGenerationId] = useState<string | null>(null);
  const markdownRef = useRef<HTMLDivElement>(null);
  const [progressMessage, setProgressMessage] = useState<string | null>(null);
  const isCreatingWorkouts = progressMessage === "Creating your workouts now...";
  const [streamedExercises, setStreamedExercises] = useState<Partial<Exercise>[]>([]);
  const [generatedExercises, setGeneratedExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    setDisplayName(getUserDisplayName(user));
  }, [user]);

  useEffect(() => {
    const loadWorkouts = async () => {
      if (!user) {
        setWorkouts([]);
        setIsLoading(false);
        return;
      }

      try {
        const userWorkouts = await getUserWorkouts(user.id);
        setWorkouts(userWorkouts);
      } catch (error) {
        console.error('Error loading workouts:', error);
        toast.error("Error", "Failed to load your workouts. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkouts();
  }, [user, toast]);

  // Load user's week schemas
  useEffect(() => {
    const loadSchemas = async () => {
      if (!user) {
        setSavedSchemas([]);
        setActiveSchema({
          name: "My Week Plan",
          workouts: Array(7).fill([]).map(() => [])
        });
        return;
      }

      try {
        setIsSchemasLoading(true);
        const userSchemas = await getUserWeekSchemas(user.id);
        
        if (userSchemas.length > 0) {
          // Find active schema or use the latest one
          const activeUserSchema = userSchemas.find(s => s.isActive) || userSchemas[0];
          setActiveSchema(activeUserSchema);
          setSavedSchemas(userSchemas);
        } else {
          // Create default schema if none exist
          setActiveSchema({
            name: "My Week Plan",
            workouts: Array(7).fill([]).map(() => [])
          });
          setSavedSchemas([]);
        }
      } catch (error) {
        console.error('Error loading week schemas:', error);
        toast.error("Error", "Failed to load your week schemas. Please try again.");
      } finally {
        setIsSchemasLoading(false);
      }
    };

    loadSchemas();
  }, [user, toast]);

  useEffect(() => {
    if (isGenerating) {
      setShowPreview(true);
    }
  }, [isGenerating]);

  useEffect(() => {
    if (!isGenerating && showPreview) {
      // Fade out preview after 1s, then show final
      const timeout = setTimeout(() => setShowPreview(false), 1000);
      return () => clearTimeout(timeout);
    }
  }, [isGenerating, showPreview]);

  useEffect(() => {
    if (!isGenerating && accumulatedTokens) {
      setLastStreamingText(accumulatedTokens);
    }
  }, [isGenerating, accumulatedTokens]);

  // Reset lastStreamingText when prompt changes (new generation)
  useEffect(() => {
    setLastStreamingText("");
  }, [prompt]);

  // Auto-scroll effect when new tokens are added
  useEffect(() => {
    if (isGenerating && markdownRef.current) {
      const scrollContainer = markdownRef.current.parentElement?.parentElement;
      if (scrollContainer) {
        // Use requestAnimationFrame to ensure the scroll happens after content is rendered
        requestAnimationFrame(() => {
          scrollContainer.scrollTo({
            top: scrollContainer.scrollHeight,
            behavior: 'smooth'
          });
        });
      }
    }
  }, [accumulatedTokens, isGenerating]);

  // Filter workouts based on search query
  const filteredWorkouts = workouts.filter(workout => {
    const searchLower = searchQuery.toLowerCase();
    return (
      workout.name.toLowerCase().includes(searchLower) ||
      workout.description?.toLowerCase().includes(searchLower) ||
      workout.exercises.some(ex => 
        ex.name.toLowerCase().includes(searchLower) ||
        ex.exercise_details.muscle_groups.some(muscle => 
          muscle.toLowerCase().includes(searchLower)
        )
      )
    );
  });

  // Function to clear current generation
  const clearCurrentGeneration = () => {
    setCurrentGenerationId(null);
    setAccumulatedTokens('');
    accumulatedTokensRef.current = '';
    setStreamedWorkouts([]);
    setStreamedReasoning('');
    setIsStreamComplete(false);
    setGeneratedWorkouts([]);
    setWorkoutReasoning(null);
    setProgressMessage(null);
  };

  // Handle input changes without clearing generation
  const handlePromptChange = (newValue: string) => {
    setPrompt(newValue);
  };

  const handleGenerateWorkout = async () => {
    if (!user) {
      toast.error("Error", "You must be logged in to create workouts.");
      return;
    }

    if (!prompt.trim()) {
      toast.error("Error", "Please describe the workout you want to create.");
      return;
    }

    // Generate a new ID for this generation
    const generationId = `gen-${Date.now()}`;
    setCurrentGenerationId(generationId);
    
    // Clear previous generation state
    setIsGenerating(true);
    setStreamedWorkouts([]);
    setStreamedReasoning('');
    setIsStreamComplete(false);
    setGeneratedWorkouts([]);
    setWorkoutReasoning(null);
    setAccumulatedTokens('');
    accumulatedTokensRef.current = '';
    setProgressMessage(null);

    try {
      // Check if we have meaningful context to send
      const hasContext = (mentionContext.exercises && mentionContext.exercises.length > 0) || 
                        (mentionContext.workouts && mentionContext.workouts.length > 0);

      const requestPayload: WorkoutNLQRequest = {
        user_id: user.id,
        prompt: prompt.trim(),
        thread_id: `workout-${Date.now()}`,
        context: hasContext ? mentionContext : undefined,
      };

      console.log('🚀 Sending workout request with context:', requestPayload);
      console.log('📊 Context details:', {
        hasContext,
        exerciseCount: mentionContext.exercises?.length || 0,
        workoutCount: mentionContext.workouts?.length || 0
      });

      const response = await fetch('http://localhost:8000/workout/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate workout: ${response.status} ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      // Read the stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        // Process complete lines from the buffer
        let newlineIndex;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          const line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          
          if (line.trim()) {
            try {
              // Handle SSE format - strip "data: " prefix if present
              let jsonLine = line.trim();
              if (jsonLine.startsWith('data: ')) {
                jsonLine = jsonLine.substring(6); // Remove "data: " prefix
              }
              
              // Skip empty lines or lines that aren't JSON
              if (!jsonLine || jsonLine === '') {
                continue;
              }
              
              // DEBUG: Log every raw line
              console.log('🟣 [STREAM] Raw line:', jsonLine);
              
              const data = JSON.parse(jsonLine);
              console.log('📦 [STREAM] Received stream data:', data);
              
              // Handle different types of stream events
              if (data.type === 'token') {
                // Individual token streaming - accumulate to build complete response
                setAccumulatedTokens(prev => prev + data.content);
                accumulatedTokensRef.current += data.content;
                console.log('🔤 [STREAM] Token:', data.content);
              } else if (data.type === 'progress') {
                setProgressMessage(data.content);
                console.log('🔄 [STREAM] Progress update:', data.content);
              } else if (data.type === 'result') {
                // Parse the stringified JSON       
                let parsed;
                try {
                  parsed = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
                  console.log('✅ [STREAM] Parsed result content:', parsed);
                  console.log('RAW data.content:', data.content);
                } catch (err) {
                  console.error('❌ [STREAM] Failed to parse results content:', err, data.content);
                  return;
                }
                // Simple, independent handling of workouts and exercises
                if (Array.isArray(parsed.workouts)) {
                  setStreamedWorkouts(parsed.workouts as GeneratedWorkout[]);
                  setGeneratedWorkouts(parsed.workouts as GeneratedWorkout[]);
                  console.log('🏋️‍♂️ [STREAM] setStreamedWorkouts & setGeneratedWorkouts called with:', parsed.workouts);
                }
                if (Array.isArray(parsed.exercises)) {
                  setStreamedExercises(parsed.exercises as Exercise[]);
                  setGeneratedExercises(parsed.exercises as Exercise[]);
                  console.log('💪 [STREAM] setStreamedExercises & setGeneratedExercises called with:', parsed.exercises);
                }
                // DEBUG: Log after set
                setTimeout(() => {
                  console.log('🟢 [STREAM] After set - streamedWorkouts:', streamedWorkouts);
                  console.log('🟢 [STREAM] After set - streamedExercises:', streamedExercises);
                }, 100);
              // } else if (data.type === 'workout') {
              //   // Workout data updates
              //   setStreamedWorkouts(prev => {
              //     const workoutIndex = data.workoutIndex;
              //     const newWorkouts = [...prev];
              //     newWorkouts[workoutIndex] = {
              //       ...newWorkouts[workoutIndex],
              //       ...data.content
              //     };
              //     console.log('🔄 [STREAM] Updated streamedWorkouts:', newWorkouts);
              //     return newWorkouts;
              //   });
              } else if (data.type === 'reasoning') {
                // Reasoning updates
                setStreamedReasoning(data.content);
              } else if (data.type === 'update') {
                // General updates
                console.log('🔄 [STREAM] Update received:', data.content);
              } else if (data.type === 'complete' || data.type === 'done') {
                // Stream completion - try to parse accumulated tokens
                console.log('✅ [STREAM] Stream completed');
                setIsStreamComplete(true);
                
                // Try to parse accumulated tokens as complete JSON
                if (accumulatedTokensRef.current.trim()) {
                  try {
                    console.log('🎯 [STREAM] Attempting to parse accumulated response:', accumulatedTokensRef.current);
                    const completedResponse = JSON.parse(accumulatedTokensRef.current);
                    
                    if (completedResponse.created_workouts) {
                      setGeneratedWorkouts(completedResponse.created_workouts);
                      console.log('✅ [STREAM] Workouts parsed from tokens:', completedResponse.created_workouts);
                    }
                    
                    if (completedResponse.reasoning) {
                      setWorkoutReasoning(completedResponse.reasoning);
                      console.log('✅ [STREAM] Reasoning parsed from tokens:', completedResponse.reasoning);
                    }
                  } catch (parseError) {
                    console.error('❌ [STREAM] Failed to parse accumulated tokens:', parseError);
                    console.log('📄 [STREAM] Accumulated tokens:', accumulatedTokensRef.current);
                  }
                }
                
                // Fallback to data from completion event
                if (data.workouts) {
                  setGeneratedWorkouts(data.workouts);
                }
                if (data.reasoning) {
                  setWorkoutReasoning(data.reasoning);
                }
              }
            } catch (e) {
              console.error('❌ [STREAM] Error parsing stream data:', e);
              console.error('📄 [STREAM] Raw line:', line);
              // Only log processed line if it was declared in this scope
              if (line.trim().startsWith('data: ')) {
                console.error('🔍 [STREAM] Processed line:', line.trim().substring(6));
              }
            }
          }
        }
      }

      if (!isStreamComplete) {
        setIsStreamComplete(true);
        setGeneratedWorkouts(streamedWorkouts as GeneratedWorkout[]);
        setWorkoutReasoning(streamedReasoning);
      }

      toast.success("Success", "Your personalized workout has been created!");
    } catch (error) {
      console.error('Error generating workout:', error);
      toast.error("Error", error instanceof Error ? error.message : "Failed to generate workout. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveWorkout = async (workout: any) => {
    if (!user) {
      toast.error("Error", "You must be logged in to save workouts.");
      return;
    }

    try {
      console.log('🏋️ SAVING WORKOUT - START');
      console.log('================================');
      console.log('Workout to save:', workout);

      // Create a new workout plan
      const { data: workoutPlan, error: workoutError } = await supabase
        .from('workout_plans')
        .insert({
          user_id: user.id,
          name: workout.name,
          description: workout.description,
          is_template: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (workoutError) {
        console.error('Error creating workout plan:', workoutError);
        throw workoutError;
      }

      console.log('Created workout plan:', workoutPlan);

      // For each exercise, create it (don't check for existing ones to avoid 406 errors)
      const exercisesPromises = workout.exercises.map(async (ex: any, index: number) => {
        try {
          console.log(`Creating exercise ${index + 1}/${workout.exercises.length}:`, ex.name);
          
          const { data: newExercise, error: exerciseError } = await supabase
            .from('exercises')
            .insert({
              user_id: user.id,
              name: ex.name,
              description: ex.details.description,
              category: ex.details.category as ExerciseCategory,
              muscle_groups: ex.details.muscle_groups,
              difficulty_level: ex.details.difficulty as DifficultyLevel,
              equipment_needed: ex.details.equipment_needed,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (exerciseError) {
            console.error(`Error creating exercise ${ex.name}:`, exerciseError);
            throw exerciseError;
          }

          console.log(`Successfully created exercise:`, newExercise);
          return newExercise;
        } catch (error) {
          console.error(`Failed to create exercise ${ex.name}:`, error);
          throw error;
        }
      });

      const exercises = await Promise.all(exercisesPromises);
      console.log('All exercises created successfully:', exercises);

      // Create workout_exercises linking exercises to the workout
      const workoutExercisesData = exercises.map((exercise, index) => ({
        workout_plan_id: workoutPlan.id,
        exercise_id: exercise.id,
        sets: workout.exercises[index].sets,
        reps: workout.exercises[index].reps,
        notes: workout.exercises[index].notes || null,
        order_index: index,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      console.log('Creating workout exercises links:', workoutExercisesData);

      const { error: workoutExercisesError } = await supabase
        .from('workout_exercises')
        .insert(workoutExercisesData);

      if (workoutExercisesError) {
        console.error('Error creating workout exercises links:', workoutExercisesError);
        throw workoutExercisesError;
      }

      console.log('Successfully created workout exercises links');
      console.log('================================');

      // Mark the workout as saved
      setSavedWorkouts(prev => new Set([...prev, workout.name]));

      // Refresh the workouts list
      const userWorkouts = await getUserWorkouts(user.id);
      setWorkouts(userWorkouts);

      toast.success("Success", `Workout "${workout.name}" saved successfully!`);

    } catch (error) {
      console.error('Error saving workout:', error);
      toast.error("Error", error instanceof Error ? error.message : "Failed to save workout. Please try again.");
    }
  };

  const handleBulkDelete = async () => {
    if (!user) {
      toast.error("Error", "You must be logged in to delete workouts.");
      return;
    }

    if (!window.confirm(`Delete ${selectedWorkouts.size} selected workout(s)? This cannot be undone.`)) {
      return;
    }

    try {
      const ids = Array.from(selectedWorkouts);
      const { error } = await supabase
        .from('workout_plans')
        .delete()
        .in('id', ids)
        .eq('user_id', user.id);

      if (error) throw error;

      setWorkouts(prev => prev.filter(w => !selectedWorkouts.has(w.id)));
      setSelectedWorkouts(new Set());
      setDeleteMode(false);

      toast.success("Deleted", "Selected workouts deleted.");
    } catch (error) {
      console.error('Error deleting workouts:', error);
      toast.error("Error", error instanceof Error ? error.message : "Failed to delete workouts.");
    }
  };

  // Handle changes to the active schema
  const handleSchemaChange = (updatedSchema: WeekSchemaData) => {
    setActiveSchema(updatedSchema);
  };

  // Handle context changes from MentionTextarea
  const handleMentionContextChange = (context: { exercises: any[], workouts: any[] }) => {
    console.log('📝 Context changed:', context);
    
    try {
      // Convert exercises to the proper format
      const contextExercises: ContextExercise[] = context.exercises.map(exercise => ({
        id: exercise.id,
        name: exercise.name,
        description: exercise.description,
        category: exercise.category,
        muscle_groups: exercise.muscle_groups,
        difficulty_level: exercise.difficulty_level,
        equipment_needed: exercise.equipment_needed,
      }));

      // Convert workouts to the proper format
      const contextWorkouts: ContextWorkout[] = context.workouts.map(workout => {
        console.log('🔍 Processing workout:', workout);
        
        return {
          id: workout.id,
          name: workout.name,
          description: workout.description || '',
          exercises: (workout.exercises || []).map((ex: any) => ({
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            notes: ex.notes,
            exercise_details: {
              description: ex.exercise_details?.description || '',
              category: ex.exercise_details?.category || '',
              muscle_groups: ex.exercise_details?.muscle_groups || [],
              difficulty_level: ex.exercise_details?.difficulty_level || '',
              equipment_needed: ex.exercise_details?.equipment_needed || '',
            }
          }))
        };
      });

      setMentionContext({
        exercises: contextExercises,
        workouts: contextWorkouts
      });
      
      console.log('✅ Context processed successfully:', {
        exercises: contextExercises.length,
        workouts: contextWorkouts.length
      });
    } catch (error) {
      console.error('❌ Error processing context:', error);
      console.error('Context data:', context);
    }
  };

  // Handle saving the active schema
  const handleSaveSchema = async (schema: WeekSchemaData) => {
    if (!user) {
      toast.error("Error", "You must be logged in to save schemas.");
      return;
    }

    try {
      const savedSchema = await saveWeekSchema(user.id, schema);
      
      // Update state with saved schema
      setActiveSchema(savedSchema);
      
      // Update saved schemas list
      setSavedSchemas(prev => {
        const exists = prev.some(s => s.id === savedSchema.id);
        if (exists) {
          return prev.map(s => s.id === savedSchema.id ? savedSchema : s);
        } else {
          return [...prev, savedSchema];
        }
      });
      
      toast.success("Success", `Week schema "${schema.name}" saved.`);
    } catch (error) {
      console.error('Error saving week schema:', error);
      toast.error("Error", "Failed to save week schema. Please try again.");
    }
  };

  // Handle creating a new empty schema
  const handleCreateNewSchema = (name: string = "New Week Plan") => {
    const newSchema: WeekSchemaData = {
      name: name,
      workouts: Array(7).fill([]).map(() => []),
      isActive: false // Ensure new schemas are not automatically active
    };
    setActiveSchema(newSchema);
    toast.success("Success", "New Schema Created. Start adding workouts to your new week plan. Save to keep it.");
  };

  // Handle deleting a week schema
  const handleDeleteSchema = async (schemaId: string) => {
    if (!user) {
      toast.error("Error", "You must be logged in to delete schemas.");
      return;
    }

    try {
      await deleteWeekSchema(user.id, schemaId);
      
      // Remove from saved schemas state
      setSavedSchemas(prev => prev.filter(s => s.id !== schemaId));
      
      // If active schema was deleted, set to a new one (or create a default)
      if (activeSchema.id === schemaId) {
        if (savedSchemas.length > 1) {
          // Find another schema that's not the deleted one
          const nextSchema = savedSchemas.find(s => s.id !== schemaId);
          if (nextSchema) {
            setActiveSchema(nextSchema);
          }
        } else {
          // Create a new default schema
          setActiveSchema({
            name: "My Week Plan",
            workouts: Array(7).fill([]).map(() => []),
            isActive: false
          });
        }
      }
      
      toast.success("Success", "Week schema deleted successfully.");
    } catch (error) {
      console.error('Error deleting week schema:', error);
      toast.error("Error", "Failed to delete week schema. Please try again.");
    }
  };

  // Update the generated workouts display section to use streamed data
  const displayWorkouts = isGenerating ? streamedWorkouts : generatedWorkouts;
  const displayExercises = isGenerating ? streamedExercises : generatedExercises;
  const displayReasoning = isGenerating ? streamedReasoning : workoutReasoning;

  // Debug: log when displayWorkouts or displayExercises updates
  useEffect(() => {
    console.log('🔍 [RENDER] displayWorkouts changed. Length:', displayWorkouts?.length || 0, 'Data:', displayWorkouts);
  }, [displayWorkouts]);

  useEffect(() => {
    console.log('🔍 [RENDER] displayExercises changed. Length:', displayExercises?.length || 0, 'Data:', displayExercises);
  }, [displayExercises]);


  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="fitness-container py-8">
        {/* Title Section with Hero-like Design */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-8 mb-10 shadow-xl shadow-purple-200/30">
          <div>
            <h1 className="text-3xl font-bold text-fitness-charcoal flex items-center gap-2">
              <Dumbbell className="h-7 w-7 text-fitness-purple" />
              Welcome to Your Workouts, {displayName}
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Create, manage and track your personal workout plans
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-6 w-full">
              <Button 
                onClick={() => setIsCreateOpen(!isCreateOpen)}
                className="bg-fitness-purple hover:bg-fitness-purple/90 transition-all shadow-lg shadow-purple-300/40"
                size="lg"
              >
                <Brain className="h-5 w-5 mr-2" />
                Create New Workout
                {isCreateOpen ? (
                  <ChevronUp className="h-4 w-4 ml-2" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-2" />
                )}
              </Button>
              
              <div className="relative flex-1 max-w-sm">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search your workouts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-11 bg-white border-gray-200 w-full transition-all focus-visible:ring-fitness-purple/25 shadow-md shadow-purple-100/20"
                />
              </div>
            </div>

            {/* Expandable Workout Creation Section */}
            <AnimatePresence>
              {isCreateOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden w-full"
                >
                  <div className="mt-6 bg-white rounded-xl border border-purple-100/50 shadow-2xl shadow-purple-200/30 w-full">
                    <div className="p-6">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-fitness-purple to-purple-400 flex items-center justify-center shadow-lg shadow-purple-300/40">
                          <Brain className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-fitness-charcoal">AI Workout Creator</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Describe your ideal workout and I'll create a personalized plan for you. Use @ to mention specific exercises or workouts.
                          </p>
                        </div>
                      </div>

                      <MentionTextarea
                        value={prompt}
                        onChange={handlePromptChange}
                        onContextChange={handleMentionContextChange}
                        className="mb-4"
                        onGenerate={handleGenerateWorkout}
                        isGenerating={isGenerating}
                      />

                      {/* Generation Preview */}
                      {currentGenerationId && (
                        <div className="mt-6 border-t border-gray-100 pt-4">
                          <style>{markdownStyles}</style>
                          {isGenerating && (
                            <>
                              {/* Minimalistic agent progress indicator */}
                              <style>
                                {`
                                  @keyframes dotBlink {
                                    0%, 20% { opacity: 0; }
                                    50% { opacity: 1; }
                                    100% { opacity: 0; }
                                  }
                                  .ai-dot {
                                    animation: dotBlink 1.4s infinite;
                                  }
                                  .ai-dot:nth-of-type(1) { animation-delay: 0s; }
                                  .ai-dot:nth-of-type(2) { animation-delay: 0.2s; }
                                  .ai-dot:nth-of-type(3) { animation-delay: 0.4s; }
                                `}
                              </style>
                              <div className="flex items-center gap-3 mb-3">
                                {/* Agent avatar/icon */}
                                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-fitness-purple to-blue-500 flex items-center justify-center shadow-sm">
                                  <Brain className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-sm font-medium text-gray-700 flex items-center">
                                  {progressMessage || "AI is analyzing your request"}
                                  <span className="ai-dot">.</span>
                                  <span className="ai-dot">.</span>
                                  <span className="ai-dot">.</span>
                                </span>
                              </div>
                            </>
                          )}
                          <ScrollArea 
                            className="h-[400px] w-full rounded-xl overflow-hidden border border-purple-100/50"
                            scrollHideDelay={75}
                          >
                            <div 
                              ref={markdownRef}
                              className={cn(
                                "prose prose-sm max-w-none text-gray-700 p-6",
                                "markdown-content streaming-markdown",
                                "bg-gradient-to-br from-white via-purple-100/40 to-blue-100/40",
                                isGenerating && "animate-pulse"
                              )}
                            >
                              <ReactMarkdown>{accumulatedTokens}</ReactMarkdown>
                            </div>
                          </ScrollArea>
                        </div>
                      )}
                      {isCreatingWorkouts && (
                        <div className="flex items-center gap-3 my-4 p-4 bg-blue-50 border border-blue-200 rounded-lg shadow mt-8">
                          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                          <span className="text-blue-900 font-medium">
                            Creating your workouts now... Please wait while we generate your personalized exercises and plans!
                          </span>
                        </div>
                      )}

                      {/* Final Generated Workouts & Exercises */}
                      {(displayWorkouts && displayWorkouts.length > 0) || (displayExercises && displayExercises.length > 0) ? (
                        <motion.div
                          ref={generatedWorkoutsRef}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4 }}
                          className="mt-8 pt-6 border-t border-purple-100"
                        >
                          {displayReasoning && (
                            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                              <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                                <LightbulbIcon className="h-5 w-5 text-blue-500" />
                                Why these recommendations?
                              </h4>
                              <p className="text-blue-900">{displayReasoning}</p>
                            </div>
                          )}

                          {/* Workouts Section */}
                          {displayWorkouts && displayWorkouts.length > 0 && (
                            <>
                              <h3 className="text-lg font-semibold text-fitness-charcoal mb-4 flex items-center gap-2">
                                <Dumbbell className="h-5 w-5 text-fitness-purple" />
                                Generated Workouts
                              </h3>
                              <ScrollArea className="max-h-[500px] w-full rounded-md pr-4 mb-6">
                                <div className="space-y-4">
                                  {displayWorkouts.map((workout, index) => (
                                    <WorkoutCard
                                      key={index}
                                      workout={workout}
                                      onSave={handleSaveWorkout}
                                      isSaved={savedWorkouts.has(workout.name)}
                                    />
                                  ))}
                                </div>
                              </ScrollArea>
                            </>
                          )}

                          {/* Exercises Section */}
                          {displayExercises && displayExercises.length > 0 && (
                            <>
                              <h3 className="text-lg font-semibold text-fitness-charcoal mb-4 flex items-center gap-2">
                                <Dumbbell className="h-5 w-5 text-fitness-purple" />
                                Generated Exercises
                              </h3>
                              <ScrollArea className="h-[400px] w-full rounded-md pr-4">
                                <div className="space-y-4">
                                  {displayExercises.map((exercise, idx) => (
                                    <ExerciseCard key={idx} exercise={exercise as Exercise} />
                                  ))}
                                </div>
                              </ScrollArea>
                            </>
                          )}
                        </motion.div>
                      ) : null}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Workouts Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-fitness-charcoal">Your Workout Plans</h2>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-white">
                {filteredWorkouts.length} {filteredWorkouts.length === 1 ? 'workout' : 'workouts'}
              </Badge>
              <Button
                variant={deleteMode ? "destructive" : "outline"}
                onClick={() => {
                  setDeleteMode(!deleteMode);
                  setSelectedWorkouts(new Set());
                }}
                className="ml-2"
              >
                {deleteMode ? "Cancel Delete" : "Delete Workouts"}
              </Button>
            </div>
          </div>
          {deleteMode && selectedWorkouts.size > 0 && (
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              className="mb-4"
            >
              Delete Selected ({selectedWorkouts.size})
            </Button>
          )}
          <Tabs value={viewMode} onValueChange={v => setViewMode(v as 'single' | 'week')} className="mb-6">
            <div className="flex justify-center">
              <TabsList className="bg-gray-100 rounded-lg p-1 flex gap-2">
                <TabsTrigger value="single" className="px-4 py-2 rounded-lg data-[state=active]:bg-fitness-purple data-[state=active]:text-white">Workouts</TabsTrigger>
                <TabsTrigger value="week" className="px-4 py-2 rounded-lg data-[state=active]:bg-fitness-purple data-[state=active]:text-white">Week Schema</TabsTrigger>
              </TabsList>
            </div>
          </Tabs>
          {viewMode === 'single' ? (
            isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin" />
              </div>
            ) : filteredWorkouts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-gray-50">
                {filteredWorkouts.map((workout, index) => (
                  <motion.div
                    key={workout.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`shadow-xl shadow-purple-200/40 h-full flex flex-col cursor-pointer transition-all
                      ${deleteMode ? "hover:scale-[1.02]" : ""}
                      ${deleteMode && selectedWorkouts.has(workout.id) ? "border-2 border-red-500 bg-red-50" : ""}
                    `}
                    onClick={() => {
                      if (!deleteMode) return;
                      setSelectedWorkouts(prev => {
                        const newSet = new Set(prev);
                        if (newSet.has(workout.id)) newSet.delete(workout.id);
                        else newSet.add(workout.id);
                        return newSet;
                      });
                    }}
                    style={{ pointerEvents: deleteMode ? "auto" : "auto" }}
                  >
                    <WorkoutPlan
                      id={workout.id}
                      name={workout.name}
                      description={workout.description || ''}
                      exercises={workout.exercises.map(ex => ({
                        ...ex,
                        exercise_details: {
                          ...ex.exercise_details,
                          difficulty: ex.exercise_details.difficulty_level
                        }
                      }))}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-white rounded-full h-12 w-12 flex items-center justify-center mx-auto mb-4">
                  <Dumbbell className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-fitness-charcoal mb-2">No workouts found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery
                    ? "No workouts match your search criteria"
                    : "Start by creating your first workout plan"}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={() => setIsCreateOpen(true)}
                    className="bg-fitness-purple hover:bg-fitness-purple/90"
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    Create Your First Workout
                  </Button>
                )}
              </div>
            )
          ) : (
            <WeekSchema 
              workouts={workouts} 
              activeSchema={activeSchema}
              savedSchemas={savedSchemas}
              onSchemaChange={handleSchemaChange}
              onSaveSchema={handleSaveSchema}
              onCreateNewSchema={handleCreateNewSchema}
              onDeleteSchema={handleDeleteSchema}
            />
          )}
        </div>
      </main>
    </div>
  );
};

interface WorkoutCardProps {
  workout: GeneratedWorkout;
  onSave: (workout: GeneratedWorkout) => void;
  isSaved: boolean;
}

// Separate WorkoutCard component for cleaner code
const WorkoutCard = ({ workout, onSave, isSaved }: WorkoutCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <Card className="border border-purple-100 hover:border-purple-200 transition-colors shadow-xl shadow-purple-200/40">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {workout.name}
            </CardTitle>
            <CardDescription>{workout.description}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700 transition-colors"
              onClick={() => onSave(workout)}
              disabled={isSaved}
            >
              {isSaved ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Saved
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Save workout
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {workout.target_muscle_groups?.map((muscle, i) => (
              <Badge key={i} variant="secondary" className="bg-purple-50 text-fitness-purple border-purple-200">
                {muscle}
              </Badge>
            ))}
            {workout.equipment_required && (
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                Equipment: {workout.equipment_required.join(', ')}
              </Badge>
            )}
            {workout.difficulty_level && (
              <Badge variant="secondary" className={getDifficultyColor(workout.difficulty_level)}>
                {workout.difficulty_level}
              </Badge>
            )}
          </div>
          <div className="space-y-3">
            {workout.exercises.map((exercise, exerciseIndex) => (
              <div
                key={exerciseIndex}
                className="p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Dumbbell className="h-4 w-4 text-fitness-purple" />
                      <h4 className="font-medium text-fitness-charcoal">{exercise.name}</h4>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="font-medium">{exercise.sets} sets × {exercise.reps} reps</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {exercise.details.muscle_groups.slice(0, 2).map((muscle, i) => (
                      <Badge key={i} variant="outline" className="text-xs bg-purple-50 text-fitness-purple border-purple-200">
                        {muscle}
                      </Badge>
                    ))}
                  </div>
                </div>
                {exercise.notes && (
                  <p className="text-sm text-muted-foreground mt-2 pl-4 border-l-2 border-purple-200">
                    {exercise.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

interface ExerciseCardProps {
  exercise: Exercise;
}

const ExerciseCard = ({ exercise }: ExerciseCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <Card className="border border-blue-100 hover:border-blue-200 transition-colors shadow-xl shadow-blue-200/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          {exercise.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium">{exercise.sets} sets × {exercise.reps} reps</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {exercise.details?.muscle_groups?.slice(0, 3).map((muscle, i) => (
              <Badge key={i} variant="outline" className="text-xs bg-purple-50 text-fitness-purple border-purple-200">
                {muscle}
              </Badge>
            ))}
            {exercise.details?.difficulty && (
              <Badge variant="secondary" className={getDifficultyColor(exercise.details.difficulty)}>
                {exercise.details.difficulty}
              </Badge>
            )}
          </div>
          {exercise.notes && (
            <p className="text-sm text-muted-foreground border-l-2 border-blue-200 pl-2">
              {exercise.notes}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default Index;
