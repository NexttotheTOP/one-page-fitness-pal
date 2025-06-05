import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Dumbbell } from "lucide-react";
import WorkoutDetailDialog from "./WorkoutDetailDialog";
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
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
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
        return 'bg-green-50 text-green-700 border-green-200';
      case 'intermediate':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'advanced':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <Card className="overflow-hidden border border-gray-100 hover:border-purple-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 bg-white h-full flex flex-col">
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 h-2" />
      <CardHeader className="p-4 pb-2 space-y-0">
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

      <CardContent className="p-4 pt-2 flex-1 flex flex-col">
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {exercises.map((exercise, index) => (
            <motion.div 
              key={`${id}-${exercise.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="h-4 w-4 text-fitness-purple" />
                    <h4 className="font-medium text-fitness-charcoal group-hover:text-fitness-purple transition-colors">{exercise.name}</h4>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-medium">{exercise.sets} sets × {exercise.reps} reps</span>
                  </div>
                </div>
                <Badge 
                  variant="outline" 
                  className={cn("text-xs", getDifficultyColor(exercise.exercise_details.difficulty))}
                >
                  {exercise.exercise_details.difficulty}
                </Badge>
              </div>
              {exercise.notes && (
                <p className="text-sm text-muted-foreground mt-2 pl-4 border-l-2 border-purple-200">
                  {exercise.notes}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="flex bg-gray-50/50 pt-3 pb-3 border-t border-gray-100 mt-auto">
        <div className="flex items-center text-sm text-gray-500 mr-auto">
          <Dumbbell className="h-4 w-4 mr-1 text-fitness-purple/70" />
          {exercises.length} {exercises.length === 1 ? 'exercise' : 'exercises'}
        </div>
        
        <Button
          className="bg-fitness-purple hover:bg-fitness-purple/90 text-white transition-colors"
          onClick={() => setIsDetailOpen(true)}
          size="sm"
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
