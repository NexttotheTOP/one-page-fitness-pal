import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import WorkoutDetailDialog from "./WorkoutDetailDialog";
import { Separator } from "@/components/ui/separator";

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

interface WorkoutPlanProps {
  id: string;
  name: string;
  description: string;
  exercises: Exercise[];
}

export default function WorkoutPlan({ id, name, description, exercises }: WorkoutPlanProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const displayedExercises = isExpanded ? exercises : exercises.slice(0, 3);
  const hasMoreExercises = exercises.length > 3;

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{name}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
        <Separator className="bg-purple-200 dark:bg-purple-900/50 w-4/5" />
      </div>

      <div className="space-y-3">
        {displayedExercises.map((exercise) => (
          <div key={`${id}-${exercise.id}`} className="space-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{exercise.name}</p>
                <p className="text-sm text-muted-foreground">
                  {exercise.sets} sets × {exercise.reps} reps
                </p>
              </div>
            </div>
            {exercise.notes && (
              <div className="pl-4 border-l-2 border-purple-200 dark:border-purple-900">
                <p className="text-sm text-muted-foreground">{exercise.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {hasMoreExercises && (
        <Button
          variant="ghost"
          className="w-full text-muted-foreground hover:text-foreground"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>
              Show Less <ChevronUp className="ml-2 h-4 w-4" />
            </>
          ) : (
            <>
              Show {exercises.length - 3} More <ChevronDown className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      )}

      <Button
        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
        onClick={() => setIsDetailOpen(true)}
      >
        View Workout
      </Button>

      <WorkoutDetailDialog
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        workout={{ id, name, description, exercises }}
      />
    </div>
  );
}
