import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  Dumbbell, 
  Plus, 
  Save, 
  PlusCircle, 
  ListPlus, 
  Trash2, 
  Check, 
  Star, 
  StarIcon, 
  Info, 
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Eye
} from "lucide-react";
import type { WorkoutPlanWithExercises } from "@/lib/db";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsContent } from '@/components/ui/tabs';
import { motion, AnimatePresence } from "framer-motion";
import WorkoutDetailDialog from "./workout/WorkoutDetailDialog";

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const shortDaysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export interface WeekSchemaData {
  id?: string; // Will be undefined for unsaved schemas
  name: string;
  workouts: string[][]; // Array of 7 arrays, one for each day containing workout IDs
  isActive?: boolean; // Whether this schema is currently active
  created_at?: string;
  updated_at?: string;
}

type WeekSchemaProps = {
  workouts: WorkoutPlanWithExercises[];
  activeSchema: WeekSchemaData;
  savedSchemas: WeekSchemaData[];
  onSchemaChange: (schema: WeekSchemaData) => void;
  onSaveSchema: (schema: WeekSchemaData) => void;
  onCreateNewSchema: (name?: string) => void;
  onDeleteSchema?: (schemaId: string) => Promise<void>;
};

export default function WeekSchema({
  workouts,
  activeSchema,
  savedSchemas,
  onSchemaChange,
  onSaveSchema,
  onCreateNewSchema,
  onDeleteSchema
}: WeekSchemaProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string>("");
  const [isNameEditing, setIsNameEditing] = useState(false);
  const [tempSchemaName, setTempSchemaName] = useState(activeSchema.name);
  const [createNewDialogOpen, setCreateNewDialogOpen] = useState(false);
  const [newSchemaName, setNewSchemaName] = useState("");
  const [schemaToDelete, setSchemaToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [workoutSearchQuery, setWorkoutSearchQuery] = useState("");
  const [startDayIndex, setStartDayIndex] = useState(0);  // Starting day index for the 5-day view
  const [viewWorkoutDetail, setViewWorkoutDetail] = useState<string | null>(null);

  // Move one day forward in the week view
  const slideDaysForward = () => {
    setStartDayIndex(prev => Math.min(prev + 1, 2)); // Max is 2 (showing days 2,3,4,5,6)
  };

  // Move one day backward in the week view  
  const slideDaysBackward = () => {
    setStartDayIndex(prev => Math.max(prev - 1, 0)); // Min is 0 (showing days 0,1,2,3,4)
  };

  // Get the visible 5-day window
  const visibleDays = daysOfWeek.slice(startDayIndex, startDayIndex + 5);
  const visibleDaysShort = shortDaysOfWeek.slice(startDayIndex, startDayIndex + 5);
  const visibleDayIndices = Array.from({ length: 5 }, (_, i) => i + startDayIndex);

  // Open dialog for a specific day
  const handleAddClick = (dayIdx: number) => {
    setSelectedDay(dayIdx);
    setSelectedWorkoutId("");
    setWorkoutSearchQuery("");
    setDialogOpen(true);
  };

  // Add selected workout to selected day
  const handleAddWorkout = () => {
    if (selectedDay === null || !selectedWorkoutId) return;
    
    // Create a deep copy of the current workouts array
    const updatedWorkouts = activeSchema.workouts.map(day => [...day]);
    
    // Add the selected workout to the selected day
    updatedWorkouts[selectedDay].push(selectedWorkoutId);
    
    // Update the parent component
    onSchemaChange({
      ...activeSchema,
      workouts: updatedWorkouts
    });
    
    setDialogOpen(false);
  };

  // Helper to get workout by id
  const getWorkoutById = (id: string) => {
    return workouts.find(w => w.id === id);
  };

  // Helper to get workout name by id
  const getWorkoutName = (id: string) => {
    const workout = workouts.find(w => w.id === id);
    return workout ? workout.name : "Unknown Workout";
  };

  // Remove a workout from a day
  const handleRemoveWorkout = (dayIdx: number, workoutIdx: number) => {
    const updatedWorkouts = activeSchema.workouts.map(day => [...day]);
    updatedWorkouts[dayIdx].splice(workoutIdx, 1);
    
    onSchemaChange({
      ...activeSchema,
      workouts: updatedWorkouts
    });
  };

  // Save schema name changes
  const handleSaveSchemaName = () => {
    if (tempSchemaName.trim()) {
      onSchemaChange({
        ...activeSchema,
        name: tempSchemaName.trim()
      });
      setIsNameEditing(false);
    }
  };

  // Handle saving the current schema
  const handleSaveSchema = () => {
    onSaveSchema(activeSchema);
  };

  // Toggle the active state of the current schema
  const toggleActiveState = () => {
    onSchemaChange({
      ...activeSchema,
      isActive: !activeSchema.isActive
    });
  };

  // Handle schema deletion
  const handleDeleteSchema = async () => {
    if (!schemaToDelete || !onDeleteSchema) return;
    
    try {
      setIsDeleting(true);
      await onDeleteSchema(schemaToDelete);
      setSchemaToDelete(null);
    } catch (error) {
      console.error("Error deleting schema:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const isUnsaved = !activeSchema.id;

  // Filter workouts based on search
  const filteredWorkouts = workouts.filter(workout => {
    if (!workoutSearchQuery) return true;
    
    const query = workoutSearchQuery.toLowerCase();
    return (
      workout.name.toLowerCase().includes(query) ||
      workout.description?.toLowerCase().includes(query) ||
      workout.exercises.some(ex => 
        ex.name.toLowerCase().includes(query) ||
        ex.exercise_details.muscle_groups.some(muscle => 
          muscle.toLowerCase().includes(query)
        )
      )
    );
  });

  // Helper to get difficulty color
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

  // Helper to get primary muscle groups as a comma separated string
  const getPrimaryMuscleGroups = (workoutId: string) => {
    const workout = getWorkoutById(workoutId);
    if (!workout) return "";
    
    // Get all muscle groups from exercises and count occurrences
    const muscleGroups: Record<string, number> = {};
    workout.exercises.forEach(ex => {
      ex.exercise_details.muscle_groups.forEach(muscle => {
        muscleGroups[muscle] = (muscleGroups[muscle] || 0) + 1;
      });
    });
    
    // Sort by occurrence count and take top 3
    const primaryMuscles = Object.entries(muscleGroups)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(entry => entry[0]);
    
    return primaryMuscles.join(", ");
  };

  return (
    <div>
      {/* Schema Header with Title and Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          {isNameEditing ? (
            <div className="flex items-center gap-2">
              <Input
                value={tempSchemaName}
                onChange={(e) => setTempSchemaName(e.target.value)}
                className="max-w-[250px] font-medium text-lg"
                autoFocus
              />
              <Button 
                size="sm" 
                onClick={handleSaveSchemaName}
                className="h-9 bg-fitness-purple hover:bg-fitness-purple/90"
              >
                <Check className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h2 
                className="text-xl font-semibold text-fitness-charcoal cursor-pointer hover:text-fitness-purple transition-colors flex items-center gap-2"
                onClick={() => {
                  setIsNameEditing(true);
                  setTempSchemaName(activeSchema.name);
                }}
              >
                <ListPlus className="h-5 w-5 text-fitness-purple" />
                {activeSchema.name}
              </h2>
              {activeSchema.isActive && (
                <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
                  <StarIcon className="h-3 w-3 mr-1 fill-amber-500" />
                  Active
                </Badge>
              )}
              {isUnsaved && (
                <Badge variant="outline" className="border-gray-200 text-gray-600">
                  Unsaved
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tab Bar with Saved Schemas and Action Buttons - Made transparent by removing background */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-3 gap-3">
        <ScrollArea className="w-full sm:max-w-[60%]">
          <div className="flex space-x-2 p-1">
            {savedSchemas.length > 0 ? (
              savedSchemas.map((schema) => (
                <Button
                  key={schema.id}
                  variant={schema.id === activeSchema.id ? "default" : "outline"}
                  size="sm"
                  className={`whitespace-nowrap ${
                    schema.id === activeSchema.id 
                    ? "bg-fitness-purple hover:bg-fitness-purple/90" 
                    : "border-purple-200 text-fitness-purple hover:bg-purple-50"
                  }`}
                  onClick={() => {
                    if (schema.id !== activeSchema.id) {
                      onSchemaChange(schema);
                    }
                  }}
                >
                  {schema.name}
                  {schema.isActive && (
                    <StarIcon className="h-3 w-3 ml-2 fill-amber-400" />
                  )}
                </Button>
              ))
            ) : (
              <span className="text-sm text-muted-foreground px-2 py-1">No saved schemas</span>
            )}
          </div>
        </ScrollArea>

        <div className="flex items-center gap-2 self-end sm:self-auto ml-auto">
          {!isUnsaved && onDeleteSchema && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSchemaToDelete(activeSchema.id)}
              className="hover:bg-red-50 text-red-600 border-red-200 hover:text-red-700 hover:border-red-300 transition-colors"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={toggleActiveState}
            className={`${
              activeSchema.isActive 
                ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100" 
                : "hover:bg-amber-50 text-gray-600 border-gray-200 hover:text-amber-700"
            } transition-colors`}
          >
            <Star className={`h-4 w-4 mr-2 ${activeSchema.isActive ? "fill-amber-400" : ""}`} />
            {activeSchema.isActive ? "Remove Active" : "Set as Active"}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveSchema}
            className="hover:bg-green-50 text-green-600 border-green-200 hover:text-green-700 hover:border-green-300 transition-colors"
          >
            <Save className="h-4 w-4 mr-2" />
            {isUnsaved ? "Save Schema" : "Update Schema"}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCreateNewDialogOpen(true)}
            className="hover:bg-purple-50 text-fitness-purple border-purple-200 hover:border-purple-300 transition-colors"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            New Schema
          </Button>
        </div>
      </div>

      {/* Info Badge */}
      <div className="mb-5 flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-md border border-blue-200">
        <Info className="h-4 w-4" />
        <p className="text-sm">Click on any workout to view its details and exercises</p>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={slideDaysBackward}
          disabled={startDayIndex === 0}
          className="text-fitness-purple hover:bg-purple-50"
        >
          <ChevronLeft className="h-5 w-5 mr-2" />
          Previous
        </Button>
        
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4 text-fitness-purple mr-1" />
          <span className="text-sm font-medium">
            {visibleDays[0]} - {visibleDays[4]}
          </span>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={slideDaysForward}
          disabled={startDayIndex >= 2}
          className="text-fitness-purple hover:bg-purple-50"
        >
          Next
          <ChevronRight className="h-5 w-5 ml-2" />
        </Button>
      </div>

      {/* 5-Day Week Grid with Animation */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={`week-view-${startDayIndex}`}
          initial={{ opacity: 0, x: startDayIndex > 0 ? 50 : -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: startDayIndex > 0 ? -50 : 50 }}
          transition={{ duration: 0.3 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
            {visibleDayIndices.map((dayIdx, i) => (
              <Card key={dayIdx} className="flex flex-col min-h-[350px] border-gray-200 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gray-50 rounded-t-lg">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Dumbbell className="h-4 w-4 text-fitness-purple" />
                    <div className="flex flex-col">
                      <span>{visibleDaysShort[i]}</span>
                      <span className="text-xs text-muted-foreground font-normal">{visibleDays[i]}</span>
                    </div>
                  </CardTitle>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleAddClick(dayIdx)}
                    className="text-fitness-purple hover:bg-purple-100"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-3 p-3">
                  {activeSchema.workouts[dayIdx].length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                      <span className="text-muted-foreground text-sm">No workouts</span>
                      <Button
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleAddClick(dayIdx)}
                        className="mt-2 text-fitness-purple hover:bg-purple-100"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Workout
                      </Button>
                    </div>
                  ) : (
                    activeSchema.workouts[dayIdx].map((workoutId, widx) => {
                      const workout = getWorkoutById(workoutId);
                      if (!workout) return null;
                      
                      return (
                        <div 
                          key={widx} 
                          className="flex flex-col gap-2 bg-white p-3 rounded-lg border border-gray-100 hover:border-purple-200 hover:bg-purple-50/10 cursor-pointer transition-colors"
                          onClick={() => setViewWorkoutDetail(workoutId)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-fitness-charcoal">{workout.name}</div>
                              
                              <div className="flex flex-wrap gap-1 mt-1">
                                {workout.exercises.slice(0, 3).map((ex, i) => (
                                  <Badge 
                                    key={i} 
                                    variant="outline" 
                                    className="text-xs bg-purple-50/50 text-fitness-purple border-purple-200"
                                  >
                                    {ex.name}
                                  </Badge>
                                ))}
                                {workout.exercises.length > 3 && (
                                  <Badge variant="outline" className="text-xs bg-gray-50 text-gray-500 border-gray-200">
                                    +{workout.exercises.length - 3} more
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="text-xs text-muted-foreground mt-2">
                                {workout.exercises.length} exercises | {getPrimaryMuscleGroups(workoutId)}
                              </div>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50 self-start -mt-1 -mr-1"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent opening workout detail
                                handleRemoveWorkout(dayIdx, widx);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Enhanced Workout Selection Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-fitness-purple" />
              Add Workout to {selectedDay !== null ? daysOfWeek[selectedDay] : ""}
            </DialogTitle>
          </DialogHeader>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search workouts by name, muscle group, or exercise..."
              value={workoutSearchQuery}
              onChange={(e) => setWorkoutSearchQuery(e.target.value)}
              className="pl-9 py-2"
            />
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2">
            {filteredWorkouts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No workouts match your search criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredWorkouts.map((workout) => (
                  <div 
                    key={workout.id}
                    className={`
                      p-4 rounded-lg border cursor-pointer transition-all
                      ${selectedWorkoutId === workout.id 
                        ? "border-fitness-purple bg-purple-50 shadow-md" 
                        : "border-gray-200 hover:border-purple-200 hover:bg-purple-50/30"
                      }
                    `}
                    onClick={() => setSelectedWorkoutId(workout.id)}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-fitness-charcoal text-base">{workout.name}</h3>
                      
                      {workout.exercises[0]?.exercise_details.difficulty_level && (
                        <Badge 
                          variant="secondary" 
                          className={getDifficultyColor(workout.exercises[0].exercise_details.difficulty_level)}
                        >
                          {workout.exercises[0].exercise_details.difficulty_level}
                        </Badge>
                      )}
                    </div>
                    
                    {workout.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{workout.description}</p>
                    )}
                    
                    <div className="mt-3">
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                        Exercises ({workout.exercises.length})
                      </div>
                      <ul className="space-y-2">
                        {workout.exercises.slice(0, 3).map((exercise, idx) => (
                          <li key={idx} className="text-sm flex justify-between">
                            <span className="font-medium text-gray-700">{exercise.name}</span>
                            <span className="text-muted-foreground">{exercise.sets} × {exercise.reps}</span>
                          </li>
                        ))}
                        {workout.exercises.length > 3 && (
                          <li className="text-xs text-muted-foreground">+ {workout.exercises.length - 3} more exercises</li>
                        )}
                      </ul>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mt-3">
                      {/* Get unique muscle groups from all exercises */}
                      {Array.from(new Set(
                        workout.exercises.flatMap(ex => ex.exercise_details.muscle_groups)
                      )).slice(0, 5).map((muscle, idx) => (
                        <Badge 
                          key={idx} 
                          variant="outline" 
                          className="text-xs bg-purple-50 text-fitness-purple border-purple-200"
                        >
                          {muscle}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <DialogFooter className="mt-4 pt-3 border-t">
            <Button 
              onClick={handleAddWorkout} 
              disabled={!selectedWorkoutId}
              className="bg-fitness-purple hover:bg-fitness-purple/90"
            >
              Add Workout to {selectedDay !== null ? daysOfWeek[selectedDay] : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create New Schema Dialog */}
      <Dialog open={createNewDialogOpen} onOpenChange={setCreateNewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Create New Week Schema
            </DialogTitle>
          </DialogHeader>
          <div className="mb-4">
            <Input
              placeholder="Schema Name (e.g. Summer Bulk, Weight Loss Plan)"
              value={newSchemaName}
              onChange={(e) => setNewSchemaName(e.target.value)}
              className="mb-4"
            />
          </div>
          <DialogFooter>
            <Button 
              onClick={() => {
                if (newSchemaName.trim()) {
                  onCreateNewSchema(newSchemaName.trim());
                  setCreateNewDialogOpen(false);
                  setNewSchemaName("");
                }
              }} 
              disabled={!newSchemaName.trim()}
            >
              Create New Schema
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={!!schemaToDelete} 
        onOpenChange={(open) => !open && setSchemaToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Week Schema?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              schema and all its workout associations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteSchema}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Schema"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Workout Detail Dialog */}
      {viewWorkoutDetail && (
        <WorkoutDetailDialog
          isOpen={!!viewWorkoutDetail}
          onClose={() => setViewWorkoutDetail(null)}
          workout={
            getWorkoutById(viewWorkoutDetail) ? {
              id: getWorkoutById(viewWorkoutDetail)!.id,
              name: getWorkoutById(viewWorkoutDetail)!.name,
              description: getWorkoutById(viewWorkoutDetail)!.description || "",
              exercises: getWorkoutById(viewWorkoutDetail)!.exercises.map(ex => ({
                id: ex.id,
                name: ex.name,
                sets: ex.sets,
                reps: ex.reps,
                notes: ex.notes,
                order: ex.order,
                exercise_details: {
                  description: ex.exercise_details.description,
                  category: ex.exercise_details.category,
                  muscle_groups: ex.exercise_details.muscle_groups,
                  difficulty: ex.exercise_details.difficulty_level, // Map difficulty_level to difficulty
                  equipment_needed: ex.exercise_details.equipment_needed
                }
              }))
            } : {
              id: "",
              name: "Workout Not Found",
              description: "",
              exercises: []
            }
          }
        />
      )}
    </div>
  );
} 