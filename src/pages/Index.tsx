import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Dumbbell, PieChart, Plus, Search, Brain, User, FolderPlus, CalendarDays, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import WorkoutPlan from '@/components/workout/WorkoutPlan';
import { useAuth } from "@/lib/auth-context";
import { getUserDisplayName } from "@/lib/utils";
import { getUserWorkouts, type WorkoutPlanWithExercises } from '@/lib/db';
import { useToast } from '@/components/ui/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { motion } from "framer-motion";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const displayName = getUserDisplayName(user);
  const [workouts, setWorkouts] = useState<WorkoutPlanWithExercises[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setIsLoading(true);

      try {
        // Fetch workouts
        const userWorkouts = await getUserWorkouts(user.id);
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
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load your data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, toast]);

  const filteredWorkouts = workouts.filter(workout =>
    workout.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    workout.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Animation variants for staggered list
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="fitness-container py-8">
        {/* Title Section with Hero-like Design */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-8 mb-10 shadow-sm">
          <div className="max-w-4xl">
            <h1 className="text-3xl font-bold text-fitness-charcoal flex items-center gap-2">
              <Dumbbell className="h-7 w-7 text-fitness-purple" />
              Welcome to Your Workouts, {displayName}
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Create, manage and track your personal workout plans
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button 
                onClick={() => navigate('/create-workout')}
                className="bg-fitness-purple hover:bg-fitness-purple/90 transition-all"
                size="lg"
              >
                <FolderPlus className="h-5 w-5 mr-2" />
                Create New Workout
              </Button>
              
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
                  placeholder="Search your workouts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-11 bg-white border-gray-200 min-w-[250px] transition-all focus-visible:ring-fitness-purple/25"
            />
              </div>
            </div>
          </div>
        </div>
        
        {/* Workouts Section */}
        <div className="mb-14">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-xl font-semibold text-fitness-charcoal">Your Workout Collection</h2>
            <div className="h-px bg-gray-200 flex-grow"></div>
            <span className="text-sm text-muted-foreground bg-gray-100 px-2 py-1 rounded-md">
              {filteredWorkouts.length} workout{filteredWorkouts.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Loader2 className="h-10 w-10 text-fitness-purple animate-spin mb-4" />
              <p className="text-muted-foreground">Loading your workout plans...</p>
          </div>
        ) : filteredWorkouts.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={container}
              initial="hidden"
              animate="show"
            >
            {filteredWorkouts.map((workout) => (
                <motion.div key={workout.id} variants={item}>
              <WorkoutPlan
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
                </motion.div>
            ))}
            </motion.div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Dumbbell className="h-8 w-8 text-muted-foreground" />
          </div>
              <h3 className="text-lg font-medium text-fitness-charcoal mb-2">No workouts found</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                {searchQuery ? 
                  `No workouts matching "${searchQuery}" were found. Try a different search term.` : 
                  "You haven't created any workout plans yet. Get started by creating your first plan!"}
              </p>
              {!searchQuery && (
                <Button 
                  onClick={() => navigate('/create-workout')}
                  className="bg-fitness-purple hover:bg-fitness-purple/90"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Create Your First Workout
                </Button>
              )}
          </div>
        )}
        </div>
        
        {/* Quick Links Section */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-xl font-semibold text-fitness-charcoal">Quick Links</h2>
            <div className="h-px bg-gray-200 flex-grow"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <Card className="group relative transition-all duration-300 overflow-hidden hover:shadow-md border-0 shadow-sm cursor-pointer" onClick={() => navigate('/calories')}>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-blue-100 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <CardContent className="relative flex items-center p-6 z-10">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-100 text-blue-500 mr-4 group-hover:scale-110 transition-transform">
                  <PieChart className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-fitness-charcoal">Calorie Tracker</h3>
                  <p className="text-muted-foreground">Track your daily calorie intake and meals</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="group relative transition-all duration-300 overflow-hidden hover:shadow-md border-0 shadow-sm cursor-pointer" onClick={() => navigate('/knowledge')}>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-purple-100 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <CardContent className="relative flex items-center p-6 z-10">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-purple-100 text-purple-500 mr-4 group-hover:scale-110 transition-transform">
                  <Brain className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-fitness-charcoal">Fitness Knowledge</h3>
                  <p className="text-muted-foreground">Chat with our AI fitness expert powered by YouTubers</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="group relative transition-all duration-300 overflow-hidden hover:shadow-md border-0 shadow-sm cursor-pointer" onClick={() => navigate('/profile')}>
              <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-green-100 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <CardContent className="relative flex items-center p-6 z-10">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-100 text-green-500 mr-4 group-hover:scale-110 transition-transform">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-fitness-charcoal">Fitness Profile</h3>
                  <p className="text-muted-foreground">Update your personal fitness information</p>
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
