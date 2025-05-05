import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Edit2, Trash2, Plus, GripVertical, X, Wand2, Dumbbell, ClipboardList, Target, ArrowLeft, Check, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import EditWorkoutDetailsForm from "./EditWorkoutDetailsForm";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { ExerciseCategory, DifficultyLevel } from "@/types/workout";
import { motion, AnimatePresence } from "framer-motion";

interface ExerciseDetails {
  description: string;
  category: string;
  muscle_groups: string[];
  difficulty: string;
  equipment_needed: string;
}

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  notes?: string;
  order: number;
  exercise_details: ExerciseDetails;
}

interface WorkoutVariation {
  name: string;
  description: string;
  exercises: {
    name: string;
    sets: number;
    reps: number;
    notes?: string;
    details: ExerciseDetails;
  }[];
}

interface WorkoutDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  workout: {
    id: string;
    name: string;
    description: string;
    exercises: Exercise[];
  };
}

export default function WorkoutDetailDialog({ isOpen, onClose, workout }: WorkoutDetailDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingExercise, setIsEditingExercise] = useState<string | null>(null);
  const [isGeneratingVariation, setIsGeneratingVariation] = useState(false);
  const [workoutVariations, setWorkoutVariations] = useState<WorkoutVariation[] | null>(null);
  const [expandedVariations, setExpandedVariations] = useState<{ [key: string]: boolean }>({});
  const [savedVariations, setSavedVariations] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const { user } = useAuth();
  const [workoutDetails, setWorkoutDetails] = useState({
    name: workout.name,
    description: workout.description,
  });
  const [exercises, setExercises] = useState(workout.exercises);
  const [editedExercise, setEditedExercise] = useState<{
    name: string;
    sets: number;
    reps: number;
    notes?: string;
  } | null>(null);
  const [isUpdatingExercise, setIsUpdatingExercise] = useState(false);
  const [isDeletingExercise, setIsDeletingExercise] = useState<string | null>(null);
  const [exerciseToDelete, setExerciseToDelete] = useState<Exercise | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const toggleVariationExpansion = (variationName: string) => {
    setExpandedVariations(prev => ({
      ...prev,
      [variationName]: !prev[variationName]
    }));
  };

  const handleSaveDetails = (name: string, description: string) => {
    setWorkoutDetails({ name, description });
    setIsEditing(false);
  };

  const handleGenerateVariation = async () => {
    try {
      setIsGeneratingVariation(true);
      
      // Start progress animation with slower increments for longer animation
      setLoadingProgress(0);
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          // Much slower progression to extend animation time
          if (prev < 20) return prev + 0.6;
          if (prev < 40) return prev + 0.4;
          if (prev < 60) return prev + 0.3;
          if (prev < 75) return prev + 0.2;
          if (prev < 85) return prev + 0.1;
          if (prev < 95) return prev + 0.05;
          return prev;
        });
      }, 150); // Slower interval
      
      const workoutData = {
        name: workout.name,
        description: workout.description,
        exercises: workout.exercises.map(ex => ({
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          notes: ex.notes,
          details: ex.exercise_details
        }))
      };

      console.log('=== Sending Workout Data for Variation ===');
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        requestData: workoutData
      }, null, 2));
      console.log('=======================================');
      
      const response = await fetch('https://web-production-aafa6.up.railway.app/workout/variation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ requestData: workoutData }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        throw new Error('Failed to generate workout variation');
      }

      const data = await response.json();
      
      console.log('=== Received Workout Variation ===');
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        variation: data
      }, null, 2));
      console.log('================================');
      
      // Complete the progress animation
      clearInterval(progressInterval);
      setLoadingProgress(100);
      
      // Longer delay before showing results to complete animations
      setTimeout(() => {
        setWorkoutVariations(data.variations);
        
        toast({
          title: "Workout Variations Generated",
          description: "Choose from the generated variations!",
        });
      }, 1000);
      
    } catch (error) {
      console.error('Error generating workout variation:', error);
      toast({
        title: "Error",
        description: "Failed to generate workout variation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsGeneratingVariation(false);
        setLoadingProgress(0);
      }, 1000);
    }
  };

  const handleSaveVariation = async (variation: WorkoutVariation) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save workouts.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create a new workout plan
      const { data: workoutPlan, error: workoutError } = await supabase
        .from('workout_plans')
        .insert({
          user_id: user.id,
          name: variation.name,
          description: variation.description,
          is_template: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (workoutError) throw workoutError;

      // For each exercise, first check if the user already has it, if not create it
      const exercisesPromises = variation.exercises.map(async (ex) => {
        // Try to find existing exercise for this user
        const { data: existingExercise } = await supabase
          .from('exercises')
          .select('id')
          .eq('user_id', user.id)
          .eq('name', ex.name)
          .single();

        if (existingExercise) {
          return existingExercise;
        }

        // If exercise doesn't exist for this user, create it
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

        if (exerciseError) throw exerciseError;
        return newExercise;
      });

      const exercises = await Promise.all(exercisesPromises);

      // Create workout_exercises linking exercises to the workout
      const workoutExercisesData = exercises.map((exercise, index) => ({
        workout_plan_id: workoutPlan.id,
        exercise_id: exercise.id,
        sets: variation.exercises[index].sets,
        reps: variation.exercises[index].reps,
        notes: variation.exercises[index].notes || null,
        order_index: index,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const { error: workoutExercisesError } = await supabase
        .from('workout_exercises')
        .insert(workoutExercisesData);

      if (workoutExercisesError) throw workoutExercisesError;

      // Mark the variation as saved
      setSavedVariations(prev => new Set([...prev, variation.name]));

      toast({
        title: "Success",
        description: `Workout variation "${variation.name}" saved successfully!`,
      });

    } catch (error) {
      console.error('Error saving workout variation:', error);
      toast({
        title: "Error",
        description: "Failed to save workout variation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDiscardVariation = (variationName: string) => {
    // Remove the variation from the state
    setWorkoutVariations((prev) => 
      prev ? prev.filter(v => v.name !== variationName) : null
    );
    
    toast({
      title: "Variation Discarded",
      description: `The variation "${variationName}" has been discarded.`,
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  // Start editing an exercise
  const handleEditExercise = (exercise: Exercise) => {
    setIsEditingExercise(exercise.id);
    setEditedExercise({
      name: exercise.name,
      sets: exercise.sets,
      reps: exercise.reps,
      notes: exercise.notes,
    });
  };

  // Update edited exercise fields
  const handleExerciseFieldChange = (field: string, value: string | number) => {
    if (!editedExercise) return;
    
    setEditedExercise({
      ...editedExercise,
      [field]: value,
    });
  };

  // Save edited exercise
  const handleSaveExercise = async () => {
    if (!user || !editedExercise || !isEditingExercise) return;
    
    setIsUpdatingExercise(true);
    
    try {
      // Find the exercise we're editing
      const exerciseToUpdate = exercises.find(ex => ex.id === isEditingExercise);
      if (!exerciseToUpdate) throw new Error('Exercise not found');
      
      console.log('Updating exercise:', {
        exerciseId: isEditingExercise,
        name: editedExercise.name,
        sets: editedExercise.sets,
        reps: editedExercise.reps,
        notes: editedExercise.notes || null
      });
      
      // First, get the exercise_id from the workout_exercises table
      const { data: workoutExerciseData, error: fetchError } = await supabase
        .from('workout_exercises')
        .select('exercise_id')
        .eq('id', isEditingExercise)
        .single();
      
      if (fetchError) {
        console.error('Error fetching exercise_id:', fetchError);
        throw fetchError;
      }
      
      const exerciseId = workoutExerciseData.exercise_id;
      
      // Update the name in the exercises table if it changed
      if (editedExercise.name !== exerciseToUpdate.name) {
        const { error: exerciseError } = await supabase
          .from('exercises')
          .update({
            name: editedExercise.name,
            updated_at: new Date().toISOString(),
          })
          .eq('id', exerciseId);
        
        if (exerciseError) {
          console.error('Error updating exercise name:', exerciseError);
          throw exerciseError;
        }
        
        console.log('Exercise name updated successfully in database');
      }
      
      // Update the workout_exercises table (junction table)
      const { error: workoutExerciseError } = await supabase
        .from('workout_exercises')
        .update({
          sets: editedExercise.sets,
          reps: editedExercise.reps,
          notes: editedExercise.notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', isEditingExercise);
      
      if (workoutExerciseError) {
        console.error('Error updating workout exercise:', workoutExerciseError);
        throw workoutExerciseError;
      }
      
      console.log('Exercise details updated successfully in database');
      
      // Update the local state for immediate UI update
      const updatedExercises = exercises.map(ex => {
        if (ex.id === isEditingExercise) {
          return {
            ...ex,
            name: editedExercise.name,
            sets: editedExercise.sets,
            reps: editedExercise.reps,
            notes: editedExercise.notes,
          };
        }
        return ex;
      });
      
      setExercises(updatedExercises);
      
      toast({
        title: "Success",
        description: "Exercise updated successfully",
      });
      
      setIsEditingExercise(null);
      setEditedExercise(null);
    } catch (error) {
      console.error('Error updating exercise:', error);
      toast({
        title: "Error",
        description: "Failed to update exercise. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingExercise(false);
    }
  };

  // Delete exercise
  const handleDeleteExercise = async (exerciseId: string) => {
    if (!user) return;
    
    setIsDeletingExercise(exerciseId);
    
    try {
      // Delete the exercise from the workout_exercises table
      const { error } = await supabase
        .from('workout_exercises')
        .delete()
        .eq('id', exerciseId);
      
      if (error) throw error;
      
      // Update the local state to remove the exercise
      const updatedExercises = exercises.filter(ex => ex.id !== exerciseId);
      setExercises(updatedExercises);
      
      toast({
        title: "Success",
        description: "Exercise removed from workout",
      });
    } catch (error) {
      console.error('Error deleting exercise:', error);
      toast({
        title: "Error",
        description: "Failed to remove exercise. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingExercise(null);
      setExerciseToDelete(null);
    }
  };

  // Prompt to confirm deletion
  const confirmDeleteExercise = (exercise: Exercise) => {
    setExerciseToDelete(exercise);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl h-[80vh] flex flex-col p-0 overflow-hidden border-0 shadow-lg" hideDefaultClose>
          <div className="absolute right-4 top-4 z-10">
            <DialogClose asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="hover:bg-black/5 rounded-full h-8 w-8 transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </Button>
            </DialogClose>
          </div>

          {/* Animated Loading Overlay with more steps */}
          <AnimatePresence>
            {isGeneratingVariation && (
              <motion.div 
                className="absolute inset-0 bg-white/95 z-20 flex flex-col items-center justify-center p-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-center"
                >
                  <Wand2 className="h-12 w-12 text-fitness-purple mx-auto mb-4 animate-pulse" />
                  <h3 className="text-xl font-semibold text-fitness-charcoal mb-2">
                    Creating Workout Variations
                  </h3>
                  <p className="text-muted-foreground max-w-md mb-6">
                    Our AI is analyzing your workout and creating personalized variations 
                    based on your exercises, muscle groups, and intensity levels.
                  </p>
                  
                  <div className="w-full max-w-md h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                    <motion.div 
                      className="h-full bg-fitness-purple"
                      initial={{ width: 0 }}
                      animate={{ width: `${loadingProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Analyzing workout structure</span>
                    <span>{Math.min(100, Math.round(loadingProgress))}%</span>
                  </div>
                </motion.div>
                
                <div className="mt-8">
                  <motion.div 
                    className="flex flex-col items-center gap-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    {loadingProgress > 15 && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-muted-foreground flex items-center gap-2"
                      >
                        <Check className="h-4 w-4 text-green-500" />
                        Scanning exercise selection patterns
                      </motion.div>
                    )}
                    
                    {loadingProgress > 30 && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-muted-foreground flex items-center gap-2"
                      >
                        <Check className="h-4 w-4 text-green-500" />
                        Identifying muscle groups and difficulty levels
                      </motion.div>
                    )}
                    
                    {loadingProgress > 45 && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-muted-foreground flex items-center gap-2"
                      >
                        <Check className="h-4 w-4 text-green-500" />
                        Evaluating exercise intensity and volume
                      </motion.div>
                    )}
                    
                    {loadingProgress > 60 && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-muted-foreground flex items-center gap-2"
                      >
                        <Check className="h-4 w-4 text-green-500" />
                        Creating alternative exercise combinations
                      </motion.div>
                    )}
                    
                    {loadingProgress > 75 && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-muted-foreground flex items-center gap-2"
                      >
                        <Check className="h-4 w-4 text-green-500" />
                        Balancing workout structure for optimal results
                      </motion.div>
                    )}
                    
                    {loadingProgress > 85 && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-muted-foreground flex items-center gap-2"
                      >
                        <Check className="h-4 w-4 text-green-500" />
                        Optimizing for your fitness goals
                      </motion.div>
                    )}
                    
                    {loadingProgress > 95 && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-muted-foreground flex items-center gap-2"
                      >
                        <Check className="h-4 w-4 text-green-500" />
                        Finalizing workout variations
                      </motion.div>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!workoutVariations ? (
            <>
              <DialogHeader className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 space-y-4">
                {isEditing ? (
                  <EditWorkoutDetailsForm
                    workoutId={workout.id}
                    initialName={workoutDetails.name}
                    initialDescription={workoutDetails.description}
                    onSave={handleSaveDetails}
                    onCancel={() => setIsEditing(false)}
                  />
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <DialogTitle className="text-2xl font-bold tracking-tight text-fitness-charcoal">
                          {workoutDetails.name}
                        </DialogTitle>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setIsEditing(true)}
                          className="hover:bg-black/5 h-8 rounded-full"
                        >
                          <Edit2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                      <DialogDescription className="text-base text-muted-foreground">
                        {workoutDetails.description}
                      </DialogDescription>
                    </div>
                    <div className="flex justify-between items-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleGenerateVariation}
                        disabled={isGeneratingVariation}
                        className="bg-white hover:bg-purple-50 text-fitness-purple border-purple-200 transition-colors"
                      >
                        <Wand2 className="h-4 w-4 mr-2" />
                        Create Variation
                      </Button>
                    </div>
                  </div>
                )}
              </DialogHeader>

              <ScrollArea className="flex-1 px-6">
                <div className="space-y-6 py-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-fitness-charcoal">Exercises</h3>
                        <div className="h-px bg-gray-200 w-12"></div>
                        <Badge variant="outline" className="bg-gray-50">
                          {workout.exercises.length} total
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm" className="border-fitness-purple/30 text-fitness-purple hover:bg-fitness-purple-light transition-colors">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Exercise
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {exercises.map((exercise, index) => (
                        <motion.div
                          key={`${workout.id}-${exercise.id}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                        >
                          <Card
                            className={`group relative transition-colors ${isEditingExercise === exercise.id ? 'border-purple-300 shadow-md' : 'hover:border-purple-200 shadow-sm'}`}
                          >
                          {isEditingExercise === exercise.id ? (
                            <div className="p-4 space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="w-full mr-2">
                                  <Input 
                                    value={editedExercise?.name || exercise.name} 
                                    onChange={(e) => handleExerciseFieldChange('name', e.target.value)}
                                    className="font-medium border-fitness-purple/30 focus-visible:ring-fitness-purple/20 w-full" 
                                    placeholder="Exercise name"
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => {
                                      setIsEditingExercise(null);
                                      setEditedExercise(null);
                                    }}
                                    className="text-muted-foreground hover:text-gray-900"
                                    disabled={isUpdatingExercise}
                                  >
                                    Cancel
                                  </Button>
                                  <Button 
                                    variant="default"
                                    size="sm"
                                    className="bg-fitness-purple hover:bg-fitness-purple/90"
                                    onClick={handleSaveExercise}
                                    disabled={isUpdatingExercise}
                                  >
                                    {isUpdatingExercise ? (
                                      <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Saving...
                                      </>
                                    ) : "Save"}
                                  </Button>
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-4">
                                <div>
                                  <Label className="text-xs text-muted-foreground">Sets</Label>
                                  <Input 
                                    type="number" 
                                    value={editedExercise?.sets || exercise.sets} 
                                    onChange={(e) => handleExerciseFieldChange('sets', parseInt(e.target.value, 10))}
                                    className="mt-1 border-gray-200 focus-visible:border-fitness-purple/50" 
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs text-muted-foreground">Reps</Label>
                                  <Input 
                                    type="number" 
                                    value={editedExercise?.reps || exercise.reps} 
                                    onChange={(e) => handleExerciseFieldChange('reps', parseInt(e.target.value, 10))}
                                    className="mt-1 border-gray-200 focus-visible:border-fitness-purple/50" 
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs text-muted-foreground">Equipment</Label>
                                  <Input 
                                    value={exercise.exercise_details.equipment_needed} 
                                    disabled
                                    className="mt-1 border-gray-200 bg-gray-50" 
                                  />
                                </div>
                              </div>

                              <div>
                                <Label className="text-xs text-muted-foreground">Notes</Label>
                                <Textarea 
                                  value={editedExercise?.notes || ''} 
                                  onChange={(e) => handleExerciseFieldChange('notes', e.target.value)}
                                  placeholder="Add notes for this exercise..."
                                  className="mt-1 resize-none border-gray-200 focus-visible:border-fitness-purple/50"
                                />
                              </div>
                            </div>
                          ) : (
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-start gap-2">
                                  <Dumbbell className="h-5 w-5 mt-0.5 text-fitness-purple" />
                                  <div className="space-y-1.5">
                                    <h4 className="font-medium text-fitness-charcoal">{exercise.name}</h4>
                                    <div className="flex flex-wrap gap-1">
                                      <Badge 
                                        variant="secondary" 
                                        className={getDifficultyColor(exercise.exercise_details.difficulty)}
                                      >
                                        {exercise.exercise_details.difficulty}
                                      </Badge>
                                      <div className="flex items-center text-xs text-muted-foreground px-2 py-0.5 bg-gray-100 rounded-full">
                                        <span>{exercise.sets} sets × {exercise.reps} reps</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-8 w-8 rounded-full border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 p-0"
                                    onClick={() => handleEditExercise(exercise)}
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-8 w-8 rounded-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 p-0"
                                    onClick={() => confirmDeleteExercise(exercise)}
                                    disabled={isDeletingExercise === exercise.id}
                                  >
                                    {isDeletingExercise === exercise.id ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-3.5 w-3.5" />
                                    )}
                                  </Button>
                                </div>
                              </div>

                              <div className="mt-3 flex flex-wrap gap-2">
                                {exercise.exercise_details.muscle_groups.map((muscle, i) => (
                                  <Badge key={i} variant="outline" className="bg-purple-50 text-fitness-purple border-purple-200">
                                    {muscle}
                                  </Badge>
                                ))}
                                {exercise.exercise_details.equipment_needed && (
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1">
                                    {exercise.exercise_details.equipment_needed}
                                  </Badge>
                                )}
                              </div>

                              {exercise.notes && (
                                <div className="mt-3 flex items-start gap-2 text-sm">
                                  <ClipboardList className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                  <p className="text-muted-foreground text-sm">{exercise.notes}</p>
                                </div>
                              )}
                            </CardContent>
                          )}
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </>
          ) : (
            <>
              <DialogHeader className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 space-y-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-black/5 rounded-full"
                    onClick={() => setWorkoutVariations(null)}
                  >
                    <ArrowLeft className="h-5 w-5 text-fitness-charcoal" />
                  </Button>
                  <div>
                    <DialogTitle className="text-2xl font-bold tracking-tight text-fitness-charcoal">
                      Workout Variations
                    </DialogTitle>
                    <DialogDescription className="text-base text-muted-foreground">
                      Choose from these AI-generated variations based on your workout
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <ScrollArea className="flex-1 px-6">
                <div className="space-y-6 py-6">
                  {workoutVariations.map((variation: WorkoutVariation, index: number) => (
                    <motion.div
                      key={`${variation.name}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card
                        className="border border-gray-100 hover:border-purple-200 transition-colors shadow-sm"
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-xl font-semibold text-fitness-charcoal">
                                {variation.name}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground mt-1">
                                {variation.description}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                                onClick={() => handleDiscardVariation(variation.name)}
                              >
                                <X className="h-4 w-4 mr-2" />
                                Don't keep it
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700 transition-colors"
                                onClick={() => handleSaveVariation(variation)}
                                disabled={savedVariations.has(variation.name)}
                              >
                                {savedVariations.has(variation.name) ? (
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
                            {variation.exercises.slice(0, expandedVariations[variation.name] ? undefined : 3).map((exercise: any, exerciseIndex: number) => (
                              <div
                                key={`${variation.name}-${exercise.name}-${exerciseIndex}`}
                                className="p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <Dumbbell className="h-4 w-4 text-fitness-purple" />
                                      <h4 className="font-medium text-fitness-charcoal">{exercise.name}</h4>
                                      <Badge 
                                        variant="secondary" 
                                        className={getDifficultyColor(exercise.details.difficulty)}
                                      >
                                        {exercise.details.difficulty}
                                      </Badge>
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

                            {variation.exercises.length > 3 && (
                              <Button
                                variant="ghost"
                                className="w-full text-muted-foreground hover:text-foreground hover:bg-gray-100"
                                onClick={() => toggleVariationExpansion(variation.name)}
                              >
                                {expandedVariations[variation.name] ? (
                                  <>
                                    Show Less <ChevronUp className="ml-2 h-4 w-4" />
                                  </>
                                ) : (
                                  <>
                                    Show {variation.exercises.length - 3} More <ChevronDown className="ml-2 h-4 w-4" />
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Exercise Deletion */}
      <AlertDialog open={!!exerciseToDelete} onOpenChange={(open) => !open && setExerciseToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Exercise</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{exerciseToDelete?.name}" from this workout plan? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => exerciseToDelete && handleDeleteExercise(exerciseToDelete.id)}
            >
              {isDeletingExercise ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 