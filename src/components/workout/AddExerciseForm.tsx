
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface AddExerciseFormProps {
  onAddExercise: (exercise: { name: string; sets: number; reps: number; weight: number }) => void;
}

const exerciseOptions = [
  "Barbell Squat",
  "Bench Press",
  "Deadlift",
  "Pull-ups",
  "Push-ups",
  "Dumbbell Press",
  "Bent Over Rows",
  "Shoulder Press",
  "Lunges",
  "Leg Press",
];

const AddExerciseForm = ({ onAddExercise }: AddExerciseFormProps) => {
  const [name, setName] = useState('');
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [weight, setWeight] = useState(0);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) return;
    
    onAddExercise({
      name,
      sets,
      reps,
      weight,
    });
    
    // Reset form
    setName('');
    setSets(3);
    setReps(10);
    setWeight(0);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="exercise">Exercise</Label>
        <Select value={name} onValueChange={setName}>
          <SelectTrigger id="exercise">
            <SelectValue placeholder="Select an exercise" />
          </SelectTrigger>
          <SelectContent position="popper" className="bg-white">
            {exerciseOptions.map((exercise) => (
              <SelectItem key={exercise} value={exercise}>{exercise}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sets">Sets</Label>
          <Input
            id="sets"
            type="number"
            min={1}
            value={sets}
            onChange={(e) => setSets(parseInt(e.target.value))}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="reps">Reps</Label>
          <Input
            id="reps"
            type="number"
            min={1}
            value={reps}
            onChange={(e) => setReps(parseInt(e.target.value))}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="weight">Weight (lbs)</Label>
          <Input
            id="weight"
            type="number"
            min={0}
            value={weight}
            onChange={(e) => setWeight(parseInt(e.target.value))}
          />
        </div>
      </div>
      
      <Button type="submit" className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Exercise
      </Button>
    </form>
  );
};

export default AddExerciseForm;
