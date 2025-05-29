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
import WorkoutGenerationAnimation from '@/components/workout/WorkoutGenerationAnimation';
import WeekSchema, { WeekSchemaData } from '@/components/WeekSchema';

// Add TypeScript interfaces for API
interface WorkoutNLQRequest {
  user_id: string;
  prompt: string;
  thread_id?: string;
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

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [workouts, setWorkouts] = useState<WorkoutPlanWithExercises[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
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

  const handleGenerateWorkout = async () => {
    if (!user) {
      toast.error("Error", "You must be logged in to create workouts.");
      return;
    }

    if (!prompt.trim()) {
      toast.error("Error", "Please describe the workout you want to create.");
      return;
    }

    setIsGenerating(true);

    try {
      // Prepare request payload
      const requestPayload: WorkoutNLQRequest = {
        user_id: user.id,
        prompt: prompt.trim(),
        thread_id: `workout-${Date.now()}`,
      };

      // Enhanced logging with clear visual separation
      console.log('🏋️ WORKOUT GENERATION - REQUEST');
      console.log('================================');
      console.log('User ID:', requestPayload.user_id);
      console.log('Prompt:', requestPayload.prompt);
      console.log('Thread ID:', requestPayload.thread_id);
      console.log('================================');

      const response = await fetch('https://web-production-aafa6.up.railway.app/workout/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Workout generation failed:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
        });
        throw new Error(
          errorData?.message || 
          `Failed to generate workout: ${response.status} ${response.statusText}`
        );
      }

      const data: WorkoutResponse = await response.json();
      console.log('Received workout response:', data);

      if (!data.created_workouts?.length) {
        throw new Error('No workouts were generated');
      }

      setGeneratedWorkouts(data.created_workouts);
      setWorkoutReasoning(data.reasoning || null);

      setTimeout(() => {
        generatedWorkoutsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100); // slight delay to ensure rendering

      toast.success("Success", `Created ${data.created_workouts.length} personalized workout${data.created_workouts.length > 1 ? 's' : ''}!`);
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

  // Handle changes to the active schema
  const handleSchemaChange = (updatedSchema: WeekSchemaData) => {
    setActiveSchema(updatedSchema);
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
                    {/* Header Section */}
                    <div className="p-6 pb-0">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-fitness-purple to-purple-400 flex items-center justify-center shadow-lg shadow-purple-300/40">
                          <Brain className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-fitness-charcoal">AI Workout Coach</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Tell me what kind of workout you want, and I'll create a personalized plan based on your fitness profile and assessment.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Main Content Section */}
                    <div className="p-6">
                      {/* Profile Data Card */}
                      <Card className="border border-purple-100 bg-purple-50/50 mb-6 shadow-lg shadow-purple-200/30">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="h-8 w-8 rounded-full bg-fitness-purple/10 flex items-center justify-center">
                              <User className="h-4 w-4 text-fitness-purple" />
                            </div>
                            <div className="space-y-1 flex-1">
                              <h3 className="font-medium text-fitness-charcoal">Using Your Profile Data</h3>
                              <p className="text-sm text-muted-foreground">
                                Our AI analyzes your fitness profile, body composition, and training history to create workouts that match your:
                              </p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <Badge variant="outline" className="bg-white border-purple-200 text-fitness-purple gap-1.5 shadow-md shadow-purple-100/20">
                                  <Target className="h-3.5 w-3.5" />
                                  Fitness Goals
                                </Badge>
                                <Badge variant="outline" className="bg-white border-purple-200 text-fitness-purple gap-1.5 shadow-md shadow-purple-100/20">
                                  <Activity className="h-3.5 w-3.5" />
                                  Activity Level
                                </Badge>
                                <Badge variant="outline" className="bg-white border-purple-200 text-fitness-purple gap-1.5 shadow-md shadow-purple-100/20">
                                  <Scale className="h-3.5 w-3.5" />
                                  Body Analysis
                                </Badge>
                                <Badge variant="outline" className="bg-white border-purple-200 text-fitness-purple gap-1.5 shadow-md shadow-purple-100/20">
                                  <Dumbbell className="h-3.5 w-3.5" />
                                  Training Experience
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Workout Description Section */}
                      <div className="space-y-4 mb-6">
                        <div>
                          <h3 className="font-medium text-fitness-charcoal mb-1.5">Describe Your Workout</h3>
                          <p className="text-sm text-muted-foreground">
                            Tell us what kind of workout you want. Be as specific as you'd like about:
                          </p>
                          <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                            <li className="flex items-center gap-2">
                              <Check className="h-3.5 w-3.5 text-green-500" />
                              Target muscle groups or body parts
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="h-3.5 w-3.5 text-green-500" />
                              Preferred difficulty level
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="h-3.5 w-3.5 text-green-500" />
                              Workout duration or intensity
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="h-3.5 w-3.5 text-green-500" />
                              Available equipment or limitations
                            </li>
                          </ul>
                        </div>

                        <Textarea
                          placeholder="Example: Create 3-4 personalized intermediate leg workouts focusing on strength and endurance, each about 45-60 minutes long. I have access to a full gym."
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          className="min-h-[120px] bg-white border-gray-200 resize-none focus-visible:ring-fitness-purple/25 rounded-lg w-full shadow-md shadow-purple-100/20"
                        />
                      </div>

                      {/* Example Prompts */}
                      <div className="space-y-3 mb-6">
                        <h3 className="font-medium text-sm text-muted-foreground">Example Prompts:</h3>
                        <div className="grid gap-2">
                          {[
                            "Create a 30-minute HIIT workout I can do at home with minimal equipment",
                            "Design an upper body strength workout for an intermediate lifter, focusing on chest and back",
                            "Make a beginner-friendly full body workout using mainly machines",
                            "Create an advanced powerlifting workout focusing on deadlift progression"
                          ].map((example, i) => (
                            <Button
                              key={i}
                              variant="outline"
                              className="justify-start h-auto whitespace-normal text-left bg-purple-50/50 border-purple-100 hover:bg-purple-100/50 hover:text-fitness-purple hover:border-purple-200 transition-colors shadow-md shadow-purple-100/20"
                              onClick={() => setPrompt(example)}
                            >
                              {example}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:bg-gray-100 shadow-md shadow-gray-200/30"
                          onClick={() => setIsCreateOpen(false)}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                        <Button
                          onClick={handleGenerateWorkout}
                          disabled={isGenerating || !prompt.trim()}
                          className="bg-fitness-purple hover:bg-fitness-purple/90 text-white shadow-lg shadow-purple-300/40"
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Creating Your Workout...
                            </>
                          ) : (
                            <>
                              <Brain className="h-4 w-4 mr-2" />
                              Generate Workout
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Generated Workouts Display */}
                      {isGenerating ? (
                        <WorkoutGenerationAnimation />
                      ) : generatedWorkouts && generatedWorkouts.length > 0 && (
                        <motion.div
                          ref={generatedWorkoutsRef}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4 }}
                          className="mt-8 pt-6 border-t border-purple-100"
                        >
                          <h3 className="text-lg font-semibold text-fitness-charcoal mb-4 flex items-center gap-2">
                            <Dumbbell className="h-5 w-5 text-fitness-purple" />
                            Generated Workouts
                          </h3>
                          {workoutReasoning && (
                            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                              <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                                <LightbulbIcon className="h-5 w-5 text-blue-500" />
                                Why these workouts?
                              </h4>
                              <p className="text-blue-900">{workoutReasoning}</p>
                            </div>
                          )}
                          <div className="space-y-4">
                            {generatedWorkouts.map((workout, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
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
                                          onClick={() => handleSaveWorkout(workout)}
                                          disabled={savedWorkouts.has(workout.name)}
                                        >
                                          {savedWorkouts.has(workout.name) ? (
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
                                        {workout.exercises.map((exercise: any, exerciseIndex: number) => (
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
                                                {exercise.details.muscle_groups.slice(0, 2).map((muscle: string, i: number) => (
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
                            ))}
                          </div>
                        </motion.div>
                      )}
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

export default Index;
