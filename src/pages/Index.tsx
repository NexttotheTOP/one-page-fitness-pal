
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Dumbbell, PieChart, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import WorkoutPlan from '@/components/workout/WorkoutPlan';

const Index = () => {
  const navigate = useNavigate();
  
  // Sample workout data
  const workouts = [
    {
      id: 1,
      name: 'Full Body Workout',
      exercises: [
        { id: 1, name: 'Barbell Squat', sets: 3, reps: 10, weight: 135 },
        { id: 2, name: 'Bench Press', sets: 3, reps: 8, weight: 145 },
        { id: 3, name: 'Deadlift', sets: 3, reps: 8, weight: 185 },
      ],
    },
    {
      id: 2,
      name: 'Upper Body Focus',
      exercises: [
        { id: 4, name: 'Pull-ups', sets: 3, reps: 8, weight: 0 },
        { id: 5, name: 'Dumbbell Press', sets: 3, reps: 10, weight: 30 },
        { id: 6, name: 'Bent Over Rows', sets: 3, reps: 10, weight: 65 },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="fitness-container py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-fitness-charcoal">Your Workout Plans</h2>
          
          <div className="flex space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                placeholder="Search workouts..." 
                className="pl-9 w-[200px] bg-white"
              />
            </div>
            
            <Button className="fitness-btn-primary">
              <Plus className="h-5 w-5 mr-1" />
              New Workout
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workouts.map((workout) => (
            <WorkoutPlan key={workout.id} workout={workout} />
          ))}
          
          <Card className="fitness-card border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 cursor-pointer flex flex-col items-center justify-center h-[300px]">
            <CardContent className="flex flex-col items-center justify-center h-full text-gray-500">
              <Plus className="h-12 w-12 mb-3" />
              <p className="font-medium">Create New Workout Plan</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-fitness-charcoal">Quick Links</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="fitness-card hover:border-fitness-purple cursor-pointer" onClick={() => navigate('/calories')}>
              <CardContent className="flex items-center p-6">
                <PieChart className="h-12 w-12 text-fitness-purple mr-4" />
                <div>
                  <h3 className="text-lg font-semibold">Calorie Tracker</h3>
                  <p className="text-gray-500">Track your daily calorie intake and meals</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="fitness-card hover:border-fitness-purple cursor-pointer">
              <CardContent className="flex items-center p-6">
                <Dumbbell className="h-12 w-12 text-fitness-purple mr-4" />
                <div>
                  <h3 className="text-lg font-semibold">Exercise Library</h3>
                  <p className="text-gray-500">Browse our database of exercises</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
