import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Dumbbell, PieChart, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import WorkoutPlan from '@/components/workout/WorkoutPlan';
import { useAuth } from "@/lib/auth-context";
import { getUserDisplayName } from "@/lib/utils";
import { getUserWorkouts, type WorkoutPlanWithExercises } from '@/lib/db';
import { useToast } from '@/components/ui/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const displayName = getUserDisplayName(user);
  const [workouts, setWorkouts] = useState<WorkoutPlanWithExercises[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchWorkouts = async () => {
      if (!user) return;
      
      try {
        const userWorkouts = await getUserWorkouts(user.id);
        // Sort workouts by most recent activity (newest first)
        const sortedWorkouts = userWorkouts.sort((a, b) => {
          const aDate = new Date(Math.max(
            new Date(a.created_at).getTime(),
            new Date(a.updated_at || 0).getTime()
          ));
          const bDate = new Date(Math.max(
            new Date(b.created_at).getTime(),
            new Date(b.updated_at || 0).getTime()
          ));
          return bDate.getTime() - aDate.getTime();
        });
        setWorkouts(sortedWorkouts);
      } catch (error) {
        console.error('Error fetching workouts:', error);
        toast({
          title: "Error",
          description: "Failed to load your workouts. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkouts();
  }, [user, toast]);

  const filteredWorkouts = workouts.filter(workout =>
    workout.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    workout.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="fitness-container py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-fitness-charcoal">Your Workout Plans, {displayName}</h2>
          
          <div className="flex space-x-3">
            <Input
              type="text"
              placeholder="Search workouts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-[200px]"
            />
            <Button onClick={() => navigate('/create-workout')}>
              Create Workout
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredWorkouts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkouts.map((workout) => (
              <WorkoutPlan
                key={workout.id}
                id={workout.id}
                name={workout.name}
                description={workout.description}
                exercises={workout.exercises.map(ex => ({
                  id: ex.id,
                  name: ex.name,
                  sets: ex.sets,
                  reps: ex.reps,
                  notes: ex.notes || undefined,
                  order: ex.order,
                  exercise_details: {
                    description: ex.exercise_details.description,
                    category: ex.exercise_details.category,
                    muscle_groups: ex.exercise_details.muscle_groups,
                    difficulty: ex.exercise_details.difficulty_level,
                    equipment_needed: ex.exercise_details.equipment_needed
                  }
                }))}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No workouts found. Create your first workout plan!</p>
          </div>
        )}
        
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
