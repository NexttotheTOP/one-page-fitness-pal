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
import { ChevronDown, ChevronUp, X, ClipboardList, Save, Loader2 } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { generateProfileOverview } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import Markdown from 'react-markdown'

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
  const eventSourceRef = useRef<EventSource | null>(null);
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

  // Cleanup EventSource on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

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

    try {
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
        (updatedMarkdown) => {
          // Clean up the markdown while preserving list formatting
          const cleanedMarkdown = updatedMarkdown
            // First, normalize all newlines
            .replace(/\r\n|\r/g, '\n')
            // Preserve list items by adding a temporary marker
            .replace(/^(\s*[-*])/gm, '§$1')
            .replace(/^(\s*\d+\.)/gm, '§$1')
            // Remove multiple consecutive newlines
            .replace(/\n{3,}/g, '\n\n')
            // Remove whitespace between newlines
            .replace(/\n\s+\n/g, '\n\n')
            // Ensure headers have space before them
            .replace(/\n#+/g, '\n\n#')
            // Restore list items and ensure proper spacing
            .replace(/§(\s*[-*])/g, '$1')
            .replace(/§(\s*\d+\.)/g, '$1')
            // Ensure list items are properly spaced
            .replace(/^([-*]|\d+\.)/gm, '\n$1')
            // Clean up any resulting multiple newlines again
            .replace(/\n{3,}/g, '\n\n')
            .trim();
          
          setMarkdown(cleanedMarkdown);
          if (!isGenerating) setIsGenerating(true);
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

  return (
    <Card className={className}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Fitness Profile</CardTitle>
              <CardDescription>
                Tell us what our AI needs to know about you  -- we store this in your global memory and use it to tailor your experience within the app.
              </CardDescription>
            </div>
            <CollapsibleTrigger asChild>
              <button className="rounded-full h-8 w-8 flex items-center justify-center hover:bg-gray-100 transition-colors">
                {isOpen ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information - Compact Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    required
                    min="1"
                    max="120"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={gender} onValueChange={setGender} required>
                    <SelectTrigger id="gender" className="mt-1">
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

                <div>
                  <Label htmlFor="height">Height</Label>
                  <Input
                    id="height"
                    type="text"
                    placeholder={'5\'10" / 178cm'}
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="weight">Weight</Label>
                  <Input
                    id="weight"
                    type="text"
                    placeholder="150lb / 68kg"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Activity Level and Goals */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="activity-level">Activity Level</Label>
                  <Select value={activityLevel} onValueChange={setActivityLevel} required>
                    <SelectTrigger id="activity-level" className="mt-1">
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

                <div>
                  <Label>Fitness Goals</Label>
                  <div className="flex gap-2">
                    <Select
                      value=""
                      onValueChange={(value) =>
                        addCustomItem(value, fitnessGoals, setFitnessGoals, () => {})
                      }
                    >
                      <SelectTrigger>
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
                      className="max-w-[100px]"
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
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {fitnessGoals.map((goal) => (
                      <Badge key={goal} variant="secondary" className="gap-1">
                        {goal}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeItem(goal, fitnessGoals, setFitnessGoals)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Diet and Health */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Dietary Preferences</Label>
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
                      <SelectTrigger>
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
                      className="max-w-[100px]"
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
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {dietaryPreferences.map((pref) => (
                      <Badge key={pref} variant="secondary" className="gap-1">
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

                <div>
                  <Label>Health Restrictions</Label>
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
                      <SelectTrigger>
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
                      className="max-w-[100px]"
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
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {healthRestrictions.map((restriction) => (
                      <Badge key={restriction} variant="secondary" className="gap-1">
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

              <div className="flex justify-end items-center gap-2 mt-4">
                <Button 
                  type="button" 
                  size="sm"
                  variant="ghost"
                  className="bg-fitness-purple-light text-fitness-purple hover:bg-fitness-purple-light/80"
                  onClick={handleGenerateOverview}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin text-fitness-purple" />
                  ) : (
                    <ClipboardList className="w-4 h-4 mr-1 text-fitness-purple" />
                  )}
                  {isGenerating ? "Generating..." : "Get overview"}
                </Button>

                <Button 
                  type="submit" 
                  size="sm"
                  variant="ghost"
                  className="bg-emerald-100 text-emerald-600 hover:bg-emerald-100/80"
                >
                  <Save className="w-4 h-4 mr-1 text-emerald-600" />
                  Save
                </Button>
              </div>

              {(markdown || isGenerating) && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg whitespace-pre-wrap h-[600px] overflow-y-auto">
                  <Markdown>{markdown}</Markdown>
                </div>
              )}
            </form>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
} 