import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Edit2, Trash2, Plus, GripVertical, X, Wand2, Dumbbell, ClipboardList, Target, ArrowLeft, Check, ChevronDown, ChevronUp } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import EditWorkoutDetailsForm from "./EditWorkoutDetailsForm";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { ExerciseCategory, DifficultyLevel } from "@/types/workout";

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
      
      const response = await fetch('http://localhost:8000/workout/variation', {
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
      
      setWorkoutVariations(data.variations);
      
      toast({
        title: "Workout Variations Generated",
        description: "Choose from the generated variations!",
      });
      
    } catch (error) {
      console.error('Error generating workout variation:', error);
      toast({
        title: "Error",
        description: "Failed to generate workout variation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingVariation(false);
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[80vh] flex flex-col p-0" hideDefaultClose>
        <div className="absolute right-4 top-4 z-10">
          <DialogClose asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="hover:bg-muted rounded-full h-8 w-8 transition-colors"
            >
              <X className="h-5 w-5" />
            </Button>
          </DialogClose>
        </div>

        {workoutVariations ? (
          <>
            <DialogHeader className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setWorkoutVariations(null)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <DialogTitle className="text-2xl font-bold tracking-tight">
                    Workout Variations
                  </DialogTitle>
                  <DialogDescription className="text-base">
                    We have generated these variations for you based on your workout.
                  </DialogDescription>
                </div>
              </div>
              <Separator className="bg-purple-200 dark:bg-purple-900/50" />
            </DialogHeader>

            <ScrollArea className="flex-1 px-6">
              <div className="space-y-6 pb-6">
                {workoutVariations.map((variation: WorkoutVariation, index: number) => (
                  <Card
                    key={`${variation.name}-${index}`}
                    className="border-2 hover:border-purple-200 transition-colors"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl font-semibold">
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
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleDiscardVariation(variation.name)}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Don't keep it
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 hover:bg-green-100 hover:text-green-700"
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
                            className="space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium">{exercise.name}</h4>
                                  <Badge 
                                    variant="secondary" 
                                    className={getDifficultyColor(exercise.details.difficulty)}
                                  >
                                    {exercise.details.difficulty}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Dumbbell className="h-4 w-4" />
                                  <span>{exercise.sets} sets × {exercise.reps} reps</span>
                                </div>
                              </div>
                            </div>
                            {exercise.notes && (
                              <p className="text-sm text-muted-foreground pl-4 border-l-2 border-purple-200">
                                {exercise.notes}
                              </p>
                            )}
                          </div>
                        ))}

                        {variation.exercises.length > 3 && (
                          <Button
                            variant="ghost"
                            className="w-full text-muted-foreground hover:text-foreground"
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
                ))}
              </div>
            </ScrollArea>
          </>
        ) : (
          <>
            <DialogHeader className="p-6 space-y-6">
              {isEditing ? (
                <EditWorkoutDetailsForm
                  workoutId={workout.id}
                  initialName={workoutDetails.name}
                  initialDescription={workoutDetails.description}
                  onSave={handleSaveDetails}
                  onCancel={() => setIsEditing(false)}
                />
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <DialogTitle className="text-2xl font-bold tracking-tight">
                        {workoutDetails.name}
                      </DialogTitle>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setIsEditing(true)}
                        className="hover:bg-muted h-8"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <DialogDescription className="text-base">
                      {workoutDetails.description}
                    </DialogDescription>
                  </div>
                  <div className="flex justify-between items-center">
                    <Separator className="bg-purple-200 dark:bg-purple-900/50 flex-1" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateVariation}
                      disabled={isGeneratingVariation}
                      className="mx-4 bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
                    >
                      <Wand2 className="h-4 w-4 mr-2" />
                      {isGeneratingVariation ? "Generating..." : "Create Variation"}
                    </Button>
                    <Separator className="bg-purple-200 dark:bg-purple-900/50 flex-1" />
                  </div>
                </div>
              )}
            </DialogHeader>

            <ScrollArea className="flex-1 px-6">
              <div className="space-y-6 pb-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Exercises</h3>
                    <Button variant="outline" size="sm" className="shrink-0">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Exercise
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {workout.exercises.map((exercise) => (
                      <Card
                        key={`${workout.id}-${exercise.id}`}
                        className={`group relative transition-colors ${isEditingExercise === exercise.id ? 'border-purple-300' : 'hover:border-purple-200'}`}
                      >
                        {isEditingExercise === exercise.id ? (
                          <div className="p-4 space-y-4">
                            <div className="flex items-center justify-between">
                              <Input value={exercise.name} className="font-medium" />
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => setIsEditingExercise(null)}
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  variant="default"
                                  size="sm"
                                  className="bg-purple-600 hover:bg-purple-700"
                                  onClick={() => setIsEditingExercise(null)}
                                >
                                  Save
                                </Button>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <Label>Sets</Label>
                                <Input type="number" value={exercise.sets} className="mt-1" />
                              </div>
                              <div>
                                <Label>Reps</Label>
                                <Input type="number" value={exercise.reps} className="mt-1" />
                              </div>
                              <div>
                                <Label>Equipment</Label>
                                <Input value={exercise.exercise_details.equipment_needed} className="mt-1" />
                              </div>
                            </div>

                            <div>
                              <Label>Notes</Label>
                              <Textarea 
                                value={exercise.notes || ''} 
                                placeholder="Add notes for this exercise..."
                                className="mt-1 resize-none"
                              />
                            </div>
                          </div>
                        ) : (
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium">{exercise.name}</h4>
                                  <Badge 
                                    variant="secondary" 
                                    className={getDifficultyColor(exercise.exercise_details.difficulty)}
                                  >
                                    {exercise.exercise_details.difficulty}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Target className="h-4 w-4" />
                                  {exercise.exercise_details.muscle_groups.join(", ")}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="hover:bg-muted"
                                  onClick={() => setIsEditingExercise(exercise.id)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-4">
                              <div className="flex items-center gap-2 text-sm">
                                <Dumbbell className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{exercise.sets} sets</span>
                                <span className="text-muted-foreground">×</span>
                                <span className="font-medium">{exercise.reps} reps</span>
                              </div>
                              {exercise.exercise_details.equipment_needed && (
                                <Badge variant="outline" className="gap-1">
                                  {exercise.exercise_details.equipment_needed}
                                </Badge>
                              )}
                            </div>

                            {exercise.notes && (
                              <div className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
                                <ClipboardList className="h-4 w-4 mt-0.5" />
                                <p>{exercise.notes}</p>
                              </div>
                            )}
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
} 