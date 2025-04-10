
import React from 'react';
import { Dumbbell } from 'lucide-react';

interface ExerciseProps {
  exercise: {
    id: number;
    name: string;
    sets: number;
    reps: number;
    weight: number;
  };
}

const ExerciseCard = ({ exercise }: ExerciseProps) => {
  return (
    <div className="flex items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
      <div className="bg-fitness-purple-light p-2 rounded-md mr-3">
        <Dumbbell className="h-5 w-5 text-fitness-purple" />
      </div>
      
      <div className="flex-grow">
        <h4 className="font-medium text-gray-900">{exercise.name}</h4>
        <p className="text-sm text-gray-500">
          {exercise.sets} sets &times; {exercise.reps} reps
          {exercise.weight > 0 ? ` • ${exercise.weight} lbs` : ''}
        </p>
      </div>
    </div>
  );
};

export default ExerciseCard;
