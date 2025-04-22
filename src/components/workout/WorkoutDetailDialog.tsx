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
import { Edit2, Trash2, Plus, GripVertical, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import EditWorkoutDetailsForm from "./EditWorkoutDetailsForm";

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  notes?: string;
  order: number;
  exercise_details: {
    description: string;
    category: string;
    muscle_groups: string[];
    difficulty: string;
    equipment_needed: string;
  };
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
  const [workoutDetails, setWorkoutDetails] = useState({
    name: workout.name,
    description: workout.description,
  });

  const handleSaveDetails = (name: string, description: string) => {
    setWorkoutDetails({ name, description });
    setIsEditing(false);
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
              <Separator className="bg-purple-200 dark:bg-purple-900/50" />
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
                  <div
                    key={`${workout.id}-${exercise.id}`}
                    className="group relative flex gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center text-muted-foreground cursor-move">
                      <GripVertical className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{exercise.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {exercise.exercise_details?.muscle_groups?.join(", ") || "No muscle groups specified"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="hover:bg-muted">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
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
                        <div className="space-y-2">
                          <div>
                            <Label>Equipment</Label>
                            <div className="mt-1 text-sm text-muted-foreground">
                              {exercise.exercise_details?.equipment_needed || "No equipment needed"}
                            </div>
                          </div>
                          <div>
                            <Label>Difficulty</Label>
                            <div className="mt-1 text-sm text-muted-foreground capitalize">
                              {exercise.exercise_details?.difficulty || "Not specified"}
                            </div>
                          </div>
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
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 p-6 bg-muted/40">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="bg-purple-600 hover:bg-purple-700">Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 