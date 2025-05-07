import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Dumbbell, MoreVertical, CalendarDays, Target, Eye } from "lucide-react";
import WorkoutDetailDialog from "./WorkoutDetailDialog";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
  
  // Get primary muscle groups for display
  const allMuscleGroups = exercises.flatMap(ex => ex.exercise_details.muscle_groups);
  const uniqueMuscleGroups = [...new Set(allMuscleGroups)];
  const displayedMuscleGroups = uniqueMuscleGroups.slice(0, 3);

  // Count exercises by difficulty to determine workout level
  const difficultyCount = {
    beginner: 0,
    intermediate: 0,
    advanced: 0
  };
  
  exercises.forEach(ex => {
    const difficulty = ex.exercise_details.difficulty.toLowerCase();
    if (difficulty in difficultyCount) {
      difficultyCount[difficulty as keyof typeof difficultyCount]++;
    }
  });
  
  // Determine overall workout difficulty
  let workoutDifficulty = "beginner";
  if (difficultyCount.advanced > exercises.length / 3) {
    workoutDifficulty = "advanced";
  } else if (difficultyCount.intermediate > exercises.length / 3) {
    workoutDifficulty = "intermediate";
  }
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'intermediate':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'advanced':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <Card className="overflow-hidden border-0 shadow-xl shadow-purple-200/40 hover:shadow-2xl transition-all duration-300 h-full flex flex-col bg-white">
      <CardHeader className="p-4 pb-0 space-y-0">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-lg font-semibold text-fitness-charcoal">{name}</h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {description}
            </p>
          </div>
          
          <Badge className={cn("ml-2 font-medium", getDifficultyColor(workoutDifficulty))}>
            {workoutDifficulty}
          </Badge>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2">
          {displayedMuscleGroups.map((muscle, i) => (
            <Badge key={i} variant="outline" className="bg-purple-50 text-fitness-purple border-purple-200">
              {muscle}
            </Badge>
          ))}
          {uniqueMuscleGroups.length > displayedMuscleGroups.length && (
            <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
              +{uniqueMuscleGroups.length - displayedMuscleGroups.length} more
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-4 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px bg-gray-200 flex-grow"></div>
          <span className="text-xs font-medium text-muted-foreground">
            {exercises.length} {exercises.length === 1 ? 'exercise' : 'exercises'}
          </span>
          <div className="h-px bg-gray-200 flex-grow"></div>
      </div>

      <div className="space-y-3">
          {displayedExercises.map((exercise, index) => (
            <motion.div 
              key={`${id}-${exercise.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className={cn(
                "p-3 rounded-lg transition-colors",
                index % 2 === 0 ? "bg-gray-50" : "bg-white"
              )}
            >
            <div className="flex items-center justify-between">
                <div className="flex items-start gap-2">
                  <div className="mt-0.5">
                    <Dumbbell className="h-4 w-4 text-fitness-purple" />
                  </div>
              <div>
                    <p className="font-medium text-sm text-fitness-charcoal">{exercise.name}</p>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <span className="font-medium">{exercise.sets} sets</span>
                      <span className="mx-1">×</span>
                      <span className="font-medium">{exercise.reps} reps</span>
                    </div>
              </div>
            </div>
                <Badge 
                  variant="outline" 
                  className={cn("text-xs", getDifficultyColor(exercise.exercise_details.difficulty))}
                >
                  {exercise.exercise_details.difficulty}
                </Badge>
              </div>
            </motion.div>
        ))}
      </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex flex-col gap-2 mt-auto">
      {hasMoreExercises && (
        <Button
          variant="ghost"
            size="sm"
            className="w-full text-muted-foreground hover:text-foreground hover:bg-gray-100"
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
          className="w-full bg-fitness-purple hover:bg-fitness-purple/90 text-white transition-colors"
        onClick={() => setIsDetailOpen(true)}
      >
          <Eye className="h-4 w-4 mr-2" />
        View Workout
      </Button>
      </CardFooter>

      <WorkoutDetailDialog
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        workout={{ id, name, description, exercises }}
      />
    </Card>
  );
}
