import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, X, ClipboardList, Save, Loader2, User, Activity, Ruler, Weight, Heart, AlignLeft, Coffee, Utensils, Apple, Moon, Eye, Trash2 } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { generateProfileOverview } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import Markdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { motion } from "framer-motion";
import remarkGfm from 'remark-gfm';

interface FitnessProfileFormProps {
  onSubmit: (data: FitnessProfileData) => void;
  className?: string;
  initiallyExpanded?: boolean;
  initialData?: FitnessProfileData;
  threadId?: string;
}

export interface FitnessProfileData {
  age: number;
  gender: string;
  height: string;
  weight: string;
  activity_level: string;
  fitness_goals: string[];
  dietary_preferences: string[];
  health_restrictions: string[];
}

// Add SavedGeneration type to track saved generations
export interface SavedGeneration {
  id: string;
  timestamp: string;
  content: string;
  label: string; // User can optionally name their generations
}

const ACTIVITY_LEVELS = [
  { value: "sedentary", label: "Sedentary (little or no exercise)" },
  { value: "light", label: "Lightly active (1-3 days/week)" },
  { value: "moderate", label: "Moderately active (3-5 days/week)" },
  { value: "very", label: "Very active (6-7 days/week)" },
  { value: "extra", label: "Extra active (very active & physical job)" },
];

const COMMON_FITNESS_GOALS = [
  "Weight Loss",
  "Muscle Gain",
  "Strength",
  "Endurance",
  "Flexibility",
  "General Fitness",
];

const COMMON_DIETARY_PREFERENCES = [
  "Vegetarian",
  "Vegan",
  "Pescatarian",
  "Keto",
  "Paleo",
  "Mediterranean",
  "No Preference",
];

const COMMON_HEALTH_RESTRICTIONS = [
  "Gluten Free",
  "Dairy Free",
  "Nut Allergy",
  "Diabetes",
  "Heart Condition",
  "None",
];

export default function FitnessProfileForm({ 
  onSubmit, 
  className = "", 
  initiallyExpanded = true,
  initialData,
  threadId
}: FitnessProfileFormProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(initiallyExpanded);
  const [isGenerating, setIsGenerating] = useState(false);
  const [markdown, setMarkdown] = useState('');
  const [savedGenerations, setSavedGenerations] = useState<SavedGeneration[]>([]);
  const [showSavedGenerations, setShowSavedGenerations] = useState(false);
  const [selectedGeneration, setSelectedGeneration] = useState<SavedGeneration | null>(null);
  const [overviewContent, setOverviewContent] = useState<string[]>([]);
  const [age, setAge] = useState(initialData?.age?.toString() || "");
  const [gender, setGender] = useState(initialData?.gender || "");
  const [height, setHeight] = useState(initialData?.height || "");
  const [weight, setWeight] = useState(initialData?.weight || "");
  const [activityLevel, setActivityLevel] = useState(initialData?.activity_level || "");
  const [fitnessGoals, setFitnessGoals] = useState<string[]>(initialData?.fitness_goals || []);
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>(initialData?.dietary_preferences || []);
  const [healthRestrictions, setHealthRestrictions] = useState<string[]>(initialData?.health_restrictions || []);
  const [customGoal, setCustomGoal] = useState("");
  const [customDiet, setCustomDiet] = useState("");
  const [customRestriction, setCustomRestriction] = useState("");

  // Load saved generations from localStorage
  useEffect(() => {
    const loadSavedGenerations = () => {
      const savedData = localStorage.getItem('fitness-profile-generations');
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData) as SavedGeneration[];
          setSavedGenerations(parsedData);
        } catch (err) {
          console.error('Error loading saved generations:', err);
        }
      }
    };
    
    loadSavedGenerations();
  }, []);

  // Update localStorage when savedGenerations changes
  useEffect(() => {
    if (savedGenerations.length > 0) {
      localStorage.setItem('fitness-profile-generations', JSON.stringify(savedGenerations));
    }
  }, [savedGenerations]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      age: parseInt(age),
      gender,
      height,
      weight,
      activity_level: activityLevel,
      fitness_goals: fitnessGoals,
      dietary_preferences: dietaryPreferences,
      health_restrictions: healthRestrictions,
    });
    setIsOpen(false);
  };

  const addCustomItem = (
    item: string,
    list: string[],
    setList: (items: string[]) => void,
    setCustomValue: (value: string) => void
  ) => {
    if (item.trim() && !list.includes(item.trim())) {
      setList([...list, item.trim()]);
      setCustomValue("");
    }
  };

  const removeItem = (
    item: string,
    list: string[],
    setList: (items: string[]) => void
  ) => {
    setList(list.filter((i) => i !== item));
  };

  const handleGenerateOverview = async () => {
    if (!age || !gender || !height || !weight || !activityLevel) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields before generating an overview.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setMarkdown('');
    // Reset selected generation when generating a new one
    setSelectedGeneration(null);

    try {
      // Modified to use a simpler callback that only shows the result when complete
      await generateProfileOverview(
        {
          thread_id: threadId,
          age: parseInt(age),
          gender,
          height,
          weight,
          activity_level: activityLevel,
          fitness_goals: fitnessGoals,
          dietary_preferences: dietaryPreferences,
          health_restrictions: healthRestrictions,
        },
        (finalMarkdown) => {
          setMarkdown(finalMarkdown);
          
          // Save this generation automatically
          const newGeneration: SavedGeneration = {
            id: `gen-${Date.now()}`,
            timestamp: new Date().toISOString(),
            content: finalMarkdown,
            label: `Generation ${new Date().toLocaleString()}`
          };
          
          setSavedGenerations(prev => [newGeneration, ...prev]);
          
          toast({
            title: "Generation Saved",
            description: "Your fitness profile has been generated and saved for future reference.",
          });
        }
      );
      
      setIsGenerating(false);
    } catch (error) {
      console.error('Error generating overview:', error);
      toast({
        title: "Error",
        description: "Failed to generate profile overview. Please try again.",
        variant: "destructive",
      });
      setIsGenerating(false);
    }
  };
  
  const loadGeneration = (generation: SavedGeneration) => {
    setSelectedGeneration(generation);
    setMarkdown(generation.content);
  };
  
  const deleteGeneration = (id: string) => {
    setSavedGenerations(prev => prev.filter(gen => gen.id !== id));
    
    // If the deleted generation was selected, clear the selection
    if (selectedGeneration?.id === id) {
      setSelectedGeneration(null);
    }
    
    toast({
      title: "Generation Deleted",
      description: "The saved generation has been removed.",
    });
  };
  
  const renameGeneration = (id: string, newLabel: string) => {
    setSavedGenerations(prev => 
      prev.map(gen => 
        gen.id === id 
          ? {...gen, label: newLabel} 
          : gen
      )
    );
  };

  return (
    <Card className={cn("border-0 overflow-hidden", className)}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-4 bg-gradient-to-r from-purple-100 to-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-fitness-charcoal flex items-center gap-2">
                <User className="h-5 w-5 text-fitness-purple" />
                Fitness Profile Data
              </CardTitle>
              <CardDescription className="text-sm mt-1">
                Tell us about yourself to get personalized fitness recommendations
              </CardDescription>
            </div>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full h-8 w-8 transition-all hover:bg-black/5"
              >
                {isOpen ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="p-6 pt-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information - Modern Cards Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Personal Info */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-base font-semibold text-fitness-charcoal">Personal Information</h3>
                    <div className="h-px bg-gray-200 flex-grow"></div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="age" className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        Age
                      </Label>
                  <Input
                    id="age"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    required
                    min="1"
                    max="120"
                        className="transition-all focus:border-fitness-purple"
                  />
                </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender" className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        Gender
                      </Label>
                  <Select value={gender} onValueChange={setGender} required>
                        <SelectTrigger id="gender" className="transition-all focus:border-fitness-purple">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                    </div>
                </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="height" className="flex items-center gap-1.5">
                        <Ruler className="h-3.5 w-3.5 text-muted-foreground" />
                        Height
                      </Label>
                  <Input
                    id="height"
                    type="text"
                    placeholder={'5\'10" / 178cm'}
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    required
                        className="transition-all focus:border-fitness-purple"
                  />
                </div>

                    <div className="space-y-2">
                      <Label htmlFor="weight" className="flex items-center gap-1.5">
                        <Weight className="h-3.5 w-3.5 text-muted-foreground" />
                        Weight
                      </Label>
                  <Input
                    id="weight"
                    type="text"
                    placeholder="150lb / 68kg"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    required
                        className="transition-all focus:border-fitness-purple"
                  />
                </div>
              </div>

                  <div className="space-y-2">
                    <Label htmlFor="activity-level" className="flex items-center gap-1.5">
                      <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                      Activity Level
                    </Label>
                  <Select value={activityLevel} onValueChange={setActivityLevel} required>
                      <SelectTrigger id="activity-level" className="transition-all focus:border-fitness-purple">
                      <SelectValue placeholder="Select activity level" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTIVITY_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                </div>

                {/* Right Column - Goals and Preferences */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-base font-semibold text-fitness-charcoal">Goals & Preferences</h3>
                    <div className="h-px bg-gray-200 flex-grow"></div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      <Heart className="h-3.5 w-3.5 text-muted-foreground" />
                      Fitness Goals
                    </Label>
                  <div className="flex gap-2">
                    <Select
                      value=""
                      onValueChange={(value) =>
                        addCustomItem(value, fitnessGoals, setFitnessGoals, () => {})
                      }
                    >
                        <SelectTrigger className="transition-all focus:border-fitness-purple">
                        <SelectValue placeholder="Add goal" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMMON_FITNESS_GOALS.filter(
                          (goal) => !fitnessGoals.includes(goal)
                        ).map((goal) => (
                          <SelectItem key={goal} value={goal}>
                            {goal}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Custom"
                      value={customGoal}
                      onChange={(e) => setCustomGoal(e.target.value)}
                        className="max-w-[100px] transition-all focus:border-fitness-purple"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        addCustomItem(
                          customGoal,
                          fitnessGoals,
                          setFitnessGoals,
                          setCustomGoal
                        )
                      }
                        className="transition-all hover:border-fitness-purple hover:text-fitness-purple"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {fitnessGoals.map((goal) => (
                        <Badge key={goal} variant="secondary" className="gap-1 bg-purple-50 text-fitness-purple hover:bg-purple-100">
                        {goal}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeItem(goal, fitnessGoals, setFitnessGoals)}
                        />
                      </Badge>
                    ))}
                </div>
              </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      <AlignLeft className="h-3.5 w-3.5 text-muted-foreground" />
                      Dietary Preferences
                    </Label>
                  <div className="flex gap-2">
                    <Select
                      value=""
                      onValueChange={(value) =>
                        addCustomItem(
                          value,
                          dietaryPreferences,
                          setDietaryPreferences,
                          () => {}
                        )
                      }
                    >
                        <SelectTrigger className="transition-all focus:border-fitness-purple">
                        <SelectValue placeholder="Add diet" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMMON_DIETARY_PREFERENCES.filter(
                          (pref) => !dietaryPreferences.includes(pref)
                        ).map((pref) => (
                          <SelectItem key={pref} value={pref}>
                            {pref}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Custom"
                      value={customDiet}
                      onChange={(e) => setCustomDiet(e.target.value)}
                        className="max-w-[100px] transition-all focus:border-fitness-purple"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        addCustomItem(
                          customDiet,
                          dietaryPreferences,
                          setDietaryPreferences,
                          setCustomDiet
                        )
                      }
                        className="transition-all hover:border-fitness-purple hover:text-fitness-purple"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {dietaryPreferences.map((pref) => (
                        <Badge key={pref} variant="secondary" className="gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100">
                        {pref}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() =>
                            removeItem(pref, dietaryPreferences, setDietaryPreferences)
                          }
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      <Heart className="h-3.5 w-3.5 text-muted-foreground" />
                      Health Restrictions
                    </Label>
                  <div className="flex gap-2">
                    <Select
                      value=""
                      onValueChange={(value) =>
                        addCustomItem(
                          value,
                          healthRestrictions,
                          setHealthRestrictions,
                          () => {}
                        )
                      }
                    >
                        <SelectTrigger className="transition-all focus:border-fitness-purple">
                        <SelectValue placeholder="Add restriction" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMMON_HEALTH_RESTRICTIONS.filter(
                          (restriction) => !healthRestrictions.includes(restriction)
                        ).map((restriction) => (
                          <SelectItem key={restriction} value={restriction}>
                            {restriction}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Custom"
                      value={customRestriction}
                      onChange={(e) => setCustomRestriction(e.target.value)}
                        className="max-w-[100px] transition-all focus:border-fitness-purple"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        addCustomItem(
                          customRestriction,
                          healthRestrictions,
                          setHealthRestrictions,
                          setCustomRestriction
                        )
                      }
                        className="transition-all hover:border-fitness-purple hover:text-fitness-purple"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {healthRestrictions.map((restriction) => (
                        <Badge key={restriction} variant="secondary" className="gap-1 bg-green-50 text-green-700 hover:bg-green-100">
                        {restriction}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() =>
                            removeItem(
                              restriction,
                              healthRestrictions,
                              setHealthRestrictions
                            )
                          }
                        />
                      </Badge>
                    ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end items-center gap-2 mt-6 border-t pt-4 border-gray-100">
                <Button 
                  type="button" 
                  variant="ghost"
                  className="gap-1 text-muted-foreground hover:text-fitness-charcoal"
                  onClick={() => setShowSavedGenerations(!showSavedGenerations)}
                >
                  <ClipboardList className="w-4 h-4" />
                  {savedGenerations.length > 0 ? `Saved Plans (${savedGenerations.length})` : "No Saved Plans"}
                </Button>
                
                <div className="flex-1"></div>

                <Button 
                  type="button" 
                  variant="outline"
                  className="bg-white hover:bg-fitness-purple-light text-fitness-purple hover:text-fitness-purple border-fitness-purple/20 hover:border-fitness-purple/40 transition-all"
                  onClick={handleGenerateOverview}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin text-fitness-purple" />
                      Generating Overview...
                    </>
                  ) : (
                    <>
                      <ClipboardList className="w-4 h-4 mr-2 text-fitness-purple" />
                      Generate AI Overview
                    </>
                  )}
                </Button>

                <Button 
                  type="submit" 
                  className="bg-fitness-purple hover:bg-fitness-purple/90 transition-all"
                >
                  <Save className="w-4 h-4 mr-1" />
                  Save Profile
                </Button>
              </div>

              {/* Saved Generations Panel */}
              {showSavedGenerations && savedGenerations.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-4 border rounded-lg p-4 bg-gray-50"
                >
                  <h4 className="font-medium text-fitness-charcoal mb-3 flex items-center">
                    <ClipboardList className="h-4 w-4 mr-2 text-fitness-purple" />
                    Your Saved Fitness Plans
                  </h4>
                  
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {savedGenerations.map((generation) => (
                      <div 
                        key={generation.id}
                        className={cn(
                          "flex items-center justify-between p-2 rounded-md border bg-white hover:border-fitness-purple/30 transition-colors",
                          selectedGeneration?.id === generation.id ? "border-fitness-purple/50 bg-fitness-purple/5" : "border-gray-200"
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-sm truncate">
                            {generation.label}
                          </h5>
                          <p className="text-xs text-muted-foreground">
                            {new Date(generation.timestamp).toLocaleString()}
                          </p>
                        </div>
                        
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-full hover:bg-fitness-purple/10 hover:text-fitness-purple"
                            title="View this plan"
                            onClick={() => loadGeneration(generation)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-full hover:bg-red-50 hover:text-red-500"
                            title="Delete this plan"
                            onClick={() => deleteGeneration(generation.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {(markdown || isGenerating) && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-5 bg-gradient-to-r from-gray-50 to-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-md font-semibold flex items-center gap-2 text-fitness-charcoal">
                      <ClipboardList className="h-4 w-4 text-fitness-purple" />
                      {selectedGeneration 
                        ? <span>Viewing: <span className="text-fitness-purple">{selectedGeneration.label}</span></span>
                        : "Personal Fitness Overview"
                      }
                    </h3>
                    
                    {selectedGeneration && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs h-8"
                        onClick={() => setSelectedGeneration(null)}
                      >
                        Return to Latest Generation
                      </Button>
                    )}
                  </div>
                  
                  <div className="bg-white p-6 rounded border border-gray-100 max-h-[800px] overflow-y-auto">
                    {isGenerating ? (
                      <div className="flex flex-col items-center justify-center py-10">
                        <Loader2 className="h-10 w-10 animate-spin text-fitness-purple mb-4" />
                        <p className="text-muted-foreground">Generating your personalized fitness overview...</p>
                        <p className="text-xs text-muted-foreground mt-2">This may take a moment</p>
                      </div>
                    ) : (
                      <div className="prose prose-sm max-w-none text-gray-700">
                        <div>
                          <Markdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              h1: ({ children }) => <h1 className="text-xl font-bold text-fitness-charcoal mt-6 mb-4">{children}</h1>,
                              h2: ({ children }) => <h2 className="text-lg font-semibold text-fitness-purple mt-5 mb-3 flex items-center gap-2">
                                {children.toString().includes("Dietary") ? 
                                  <AlignLeft className="h-4 w-4 text-green-600" /> : 
                                  <Activity className="h-4 w-4 text-blue-600" />}
                                {children}
                              </h2>,
                              h3: ({ children }) => {
                                const content = children.toString();
                                // Special formatting for meal-related sections
                                if (content.includes("Meal Plan")) {
                                  return (
                                    <h3 className="text-md font-medium mt-5 mb-3 bg-green-50 px-3 py-2 rounded-md flex items-center gap-2 border-l-4 border-green-200">
                                      <Utensils className="h-4 w-4 text-green-600" />
                                      {children}
                                    </h3>
                                  );
                                }
                                if (content.includes("Breakfast")) {
                                  return (
                                    <h3 className="text-md font-medium mt-4 mb-2 flex items-center gap-1.5 text-amber-700">
                                      <Coffee className="h-4 w-4" />
                                      {children}
                                    </h3>
                                  );
                                }
                                if (content.includes("Lunch")) {
                                  return (
                                    <h3 className="text-md font-medium mt-4 mb-2 flex items-center gap-1.5 text-blue-700">
                                      <Utensils className="h-4 w-4" />
                                      {children}
                                    </h3>
                                  );
                                }
                                if (content.includes("Dinner")) {
                                  return (
                                    <h3 className="text-md font-medium mt-4 mb-2 flex items-center gap-1.5 text-indigo-700">
                                      <Utensils className="h-4 w-4" />
                                      {children}
                                    </h3>
                                  );
                                }
                                if (content.includes("Snacks")) {
                                  return (
                                    <h3 className="text-md font-medium mt-4 mb-2 flex items-center gap-1.5 text-green-700">
                                      <Apple className="h-4 w-4" />
                                      {children}
                                    </h3>
                                  );
                                }
                                
                                return <h3 className="text-md font-medium mt-4 mb-2">{children}</h3>;
                              },
                              p: ({ children }) => {
                                // If it's an empty paragraph (just line breaks), render minimal spacing
                                if (children === '' || children === ' ' || children === '\n') {
                                  return <div className="h-1"></div>;
                                }
                                return <p className="my-2">{children}</p>;
                              },
                              ul: ({ children }) => <ul className="list-disc pl-6 my-2 space-y-0.5">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal pl-6 my-2 space-y-0.5">{children}</ol>,
                              li: ({ children }) => {
                                // Check if this list item has content or is empty
                                const content = children?.toString() || '';
                                if (content.trim() === '') {
                                  return null; // Skip empty list items
                                }
                                return <li className="pl-1">{children}</li>;
                              },
                              hr: () => <hr className="my-3 border-gray-200" />,
                              blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-200 pl-4 italic my-3">{children}</blockquote>,
                              strong: ({ children }) => {
                                const content = children?.toString() || '';
                                // Special formatting for food items
                                if (content.includes("Scrambled Eggs") || 
                                    content.includes("Greek Yogurt") || 
                                    content.includes("Grilled Chicken") || 
                                    content.includes("Quinoa") || 
                                    content.includes("Salmon") || 
                                    content.includes("Tofu") || 
                                    content.includes("Cottage Cheese") || 
                                    content.includes("Almond Butter")) {
                                  return (
                                    <strong className="font-semibold text-fitness-charcoal block bg-gray-50 px-3 py-1.5 my-2 rounded-md border-l-2 border-fitness-purple/30">
                                      {children}
                                    </strong>
                                  );
                                }
                                // Special formatting for workout sections
                                if (content.includes("Day 1:") || 
                                    content.includes("Day 2:") || 
                                    content.includes("Day 3:") || 
                                    content.includes("Day 4:") || 
                                    content.includes("Day 5:") || 
                                    content.includes("Day 6:") || 
                                    content.includes("Day 7:")) {
                                  return (
                                    <strong className="font-semibold text-fitness-charcoal block bg-blue-50 px-3 py-1.5 my-2 rounded-md border-l-2 border-blue-300">
                                      {children}
                                    </strong>
                                  );
                                }
                                return <strong className="font-semibold text-fitness-charcoal">{children}</strong>;
                              },
                              pre: ({ children }) => <pre className="bg-gray-50 p-2 rounded my-2 text-sm overflow-x-auto">{children}</pre>,
                              code: ({ children }) => <code className="bg-gray-50 px-1.5 py-0.5 rounded text-pink-600 text-xs">{children}</code>,
                              em: ({ children }) => {
                                const content = children?.toString() || '';
                                // Special formatting for macros
                                if (content.includes("Macros: Approximately")) {
                                  return (
                                    <div className="mt-1 mb-3 bg-blue-50 rounded-md p-2 text-xs font-medium flex gap-2">
                                      <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded">
                                        {content.match(/(\d+g protein)/)?.[0] || 'protein'}
                                      </span>
                                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded">
                                        {content.match(/(\d+g carbs)/)?.[0] || 'carbs'}
                                      </span>
                                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                                        {content.match(/(\d+g fat)/)?.[0] || 'fat'}
                                      </span>
                                    </div>
                                  );
                                }
                                return <em className="italic">{children}</em>;
                              }
                            }}
                          >
                            {markdown
                              // Replace 3 or more consecutive line breaks with just 2
                              .replace(/\n{3,}/g, '\n\n')
                              // Remove whitespace only lines between list items
                              .replace(/^[ \t]*\n/gm, '\n')
                              // Special formatting for calorie calculations and measurements
                              .replace(/(BMR =.*calories\/day)/g, '**$1**')
                              .replace(/(Total Daily Calories =.*calories\/day)/g, '**$1**')
                              // Special formatting for macronutrient sections
                              .replace(/(Protein =.*protein)/g, '**$1**')
                              .replace(/(Fats =.*grams)/g, '**$1**')
                              .replace(/(Carbohydrates =.*grams)/g, '**$1**')
                              // Mark meal macros for special formatting
                              .replace(/(Macros: Approximately.*fat)/g, '_$1_')
                            }
                          </Markdown>
                        </div>
                      </div>
                    )}
                </div>
                </motion.div>
              )}
            </form>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
} 