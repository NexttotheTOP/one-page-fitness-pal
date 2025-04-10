
import React, { useState } from 'react';
import { Edit, MoreVertical, Play, Trash } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import ExerciseCard from './ExerciseCard';

interface Exercise {
  id: number;
  name: string;
  sets: number;
  reps: number;
  weight: number;
}

interface WorkoutPlanProps {
  workout: {
    id: number;
    name: string;
    exercises: Exercise[];
  };
}

const WorkoutPlan = ({ workout }: WorkoutPlanProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <Card className="fitness-card overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold">{workout.name}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white">
              <DropdownMenuItem className="cursor-pointer flex items-center">
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer flex items-center text-red-500">
                <Trash className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex justify-between items-center mt-2">
          <div className="text-sm text-gray-500">
            {workout.exercises.length} exercises
          </div>
          <Button variant="outline" size="sm" className="h-8" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? 'Hide' : 'View All'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {(isExpanded ? workout.exercises : workout.exercises.slice(0, 2)).map((exercise) => (
            <ExerciseCard key={exercise.id} exercise={exercise} />
          ))}
          
          {!isExpanded && workout.exercises.length > 2 && (
            <div className="text-sm text-gray-400 text-center pt-2">
              {workout.exercises.length - 2} more exercises
            </div>
          )}
        </div>
        
        <div className="mt-4">
          <Button className="w-full bg-fitness-purple hover:bg-fitness-purple-dark">
            <Play className="mr-2 h-4 w-4" />
            Start Workout
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkoutPlan;
