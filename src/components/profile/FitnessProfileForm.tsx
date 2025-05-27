import { useState, useEffect, useRef, useMemo } from "react";
import React from "react";
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
import { ChevronDown, ChevronUp, X, ClipboardList, Save, Loader2, User, Activity, Ruler, Weight, Heart, AlignLeft, Coffee, Utensils, Apple, Moon, Eye, Trash2, LineChart, Info, ChevronLeft, ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { generateProfileOverview } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import Markdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { motion } from "framer-motion";
import remarkGfm from 'remark-gfm';
import { saveProfileGeneration, getUserProfileGenerations, deleteProfileGeneration, updateProfileGenerationLabel } from "@/lib/db";
import { useAuth } from "@/lib/auth-context";
import ProfileQASection from "./ProfileQASection";

interface FitnessProfileFormProps {
  onSubmit: (data: FitnessProfileData) => void;
  className?: string;
  initiallyExpanded?: boolean;
  initialData?: FitnessProfileData;
  imagePaths?: {
    front: string[];
    side: string[];
    back: string[];
  };
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

// Function to generate a new thread ID
function generateThreadId(): string {
  return crypto.randomUUID();
}

// Utility to extract h2 headings from markdown and generate slugs
function extractHeadings(markdown: string) {
  const headingRegex = /^##\s+(.+)$/gm;
  const headings: { text: string; id: string }[] = [];
  let match;
  while ((match = headingRegex.exec(markdown)) !== null) {
    const text = match[1].trim();
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    headings.push({ text, id });
  }
  return headings;
}

// Define markdownComponents once to avoid duplicate object literal keys
const markdownComponents = {
  h1: ({ children }: { children: React.ReactNode }) => <h1 className="text-xl font-bold text-fitness-charcoal mt-6 mb-4">{children}</h1>,
  h2: ({ children }: { children: React.ReactNode }) => {
    const text = children?.toString() || '';
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    return (
      <h2
        id={id}
        className="text-lg font-semibold text-fitness-purple mt-5 mb-3 flex items-center gap-2 scroll-mt-24"
      >
        {text.includes("Dietary") ? 
          <Utensils className="h-4 w-4 text-green-600" /> : 
          text.includes("Body Composition") ? 
          <Ruler className="h-4 w-4 text-blue-600" /> :
          text.includes("Fitness") ? 
          <Activity className="h-4 w-4 text-orange-600" /> :
          text.includes("Progress") ? 
          <LineChart className="h-4 w-4 text-indigo-600" /> :
          text.includes("Profile Assessment") ? 
          <User className="h-4 w-4 text-purple-600" /> :
          <Activity className="h-4 w-4 text-blue-600" />}
        {children}
      </h2>
    );
  },
  h3: ({ children }: { children: React.ReactNode }) => {
    const content = children?.toString() || '';
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
  p: ({ children }: { children: React.ReactNode }) => {
    // If it's an empty paragraph (just line breaks), render minimal spacing
    if (children === '' || children === ' ' || children === '\n') {
      return <div className="h-1"></div>;
    }
    return <p className="my-2">{children}</p>;
  },
  ul: ({ children }: { children: React.ReactNode }) => <ul className="list-disc pl-6 my-2 space-y-0.5">{children}</ul>,
  ol: ({ children }: { children: React.ReactNode }) => <ol className="list-decimal pl-6 my-2 space-y-0.5">{children}</ol>,
  li: ({ children }: { children: React.ReactNode }) => {
    const content = children?.toString() || '';
    if (content.trim() === '') {
      return null; // Skip empty list items
    }
    return <li className="pl-1">{children}</li>;
  },
  hr: () => <hr className="my-3 border-gray-200" />,
  blockquote: ({ children }: { children: React.ReactNode }) => <blockquote className="border-l-4 border-gray-200 pl-4 italic my-3">{children}</blockquote>,
  strong: ({ children }: { children: React.ReactNode }) => {
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
  pre: ({ children }: { children: React.ReactNode }) => <pre className="bg-gray-50 p-2 rounded my-2 text-sm overflow-x-auto">{children}</pre>,
  code: ({ children }: { children: React.ReactNode }) => <code className="bg-gray-50 px-1.5 py-0.5 rounded text-pink-600 text-xs">{children}</code>,
  em: ({ children }: { children: React.ReactNode }) => {
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
};

export default function FitnessProfileForm({ 
  onSubmit, 
  className = "", 
  initiallyExpanded = true,
  initialData,
  imagePaths
}: FitnessProfileFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(initiallyExpanded);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingGenerations, setIsLoadingGenerations] = useState(false);
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
  
  // Reference to the overview section for smooth scrolling
  const overviewSectionRef = useRef<HTMLDivElement>(null);
  // Reference to the content area for auto-scrolling during generation
  const contentAreaRef = useRef<HTMLDivElement>(null);

  // Table of Contents headings
  const tocHeadings = useMemo(() => extractHeadings(markdown), [markdown]);

  // Collapsible TOC state
  const [tocOpen, setTocOpen] = useState(false);
  // Active section for highlight
  const [activeId, setActiveId] = useState<string | null>(null);

  // Intersection Observer for active section
  useEffect(() => {
    if (!tocOpen || tocHeadings.length === 0) return;
    const handleScroll = () => {
      let found = null;
      for (const h of tocHeadings) {
        const el = document.getElementById(h.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top < 120) {
            found = h.id;
          }
        }
      }
      setActiveId(found);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [tocHeadings, tocOpen]);

  // Effect to auto-scroll the content area when markdown updates during generation
  useEffect(() => {
    if (isGenerating && contentAreaRef.current) {
      contentAreaRef.current.scrollTop = contentAreaRef.current.scrollHeight;
    }
  }, [markdown, isGenerating]);

  // Load saved generations from Supabase
  useEffect(() => {
    const loadSavedGenerations = async () => {
      if (!user) return;
      
      setIsLoadingGenerations(true);
      try {
        const generations = await getUserProfileGenerations(user.id);
        setSavedGenerations(generations);
      } catch (err) {
        console.error('Error loading saved generations:', err);
        toast({
          title: "Error",
          description: "Failed to load your saved fitness plans.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingGenerations(false);
      }
    };
    
    loadSavedGenerations();
  }, [user, toast]);

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

  // Update the handleGenerateOverview function to generate a new thread_id for each call
  const handleGenerateOverview = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to generate a profile overview.",
        variant: "destructive",
      });
      return;
    }
    
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

    // Generate a new thread_id for this specific overview
    const newThreadId = generateThreadId();
    
    // Scroll to the overview section with smooth behavior
    setTimeout(() => {
      overviewSectionRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);

    // Show a better styled toast when generation begins
    toast({
      title: "Generating your fitness profile",
      description: "Content is being generated in backend. The complete profile will be saved when finished. You can safely leave this page.",
      className: "bg-blue-50 border border-blue-100 text-blue-800",
      duration: 10000,
    });

    try {
      // Track the final content
      let finalContent = '';
      
      // Use the streaming callback to update the UI in real-time
      await generateProfileOverview(
        {
          user_id: user.id,
          thread_id: newThreadId,
          age: parseInt(age),
          gender,
          height,
          weight,
          activity_level: activityLevel,
          fitness_goals: fitnessGoals,
          dietary_preferences: dietaryPreferences,
          health_restrictions: healthRestrictions,
          // Include imagePaths if available
          ...(imagePaths && { imagePaths }),
        },
        (streamedContent) => {
          // Update the markdown in real-time as tokens are streamed
          setMarkdown(streamedContent);
          finalContent = streamedContent;
        }
      );
      
      setIsGenerating(false);
      
      // Save the final content to Supabase
      if (user && finalContent) {
        const newGeneration = {
          timestamp: new Date().toISOString(),
          content: finalContent,
          label: `Generation ${new Date().toLocaleString()}`
        };
        
        try {
          const savedGeneration = await saveProfileGeneration(user.id, newGeneration);
          setSavedGenerations(prev => [savedGeneration, ...prev]);
          
          toast({
            title: "Generation Saved",
            description: "Your fitness profile has been generated and saved for future reference.",
          });
        } catch (error) {
          console.error('Error saving generation:', error);
          toast({
            title: "Warning",
            description: "Generated overview was created but couldn't be saved to your account.",
            variant: "destructive",
          });
        }
      }
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
  
  const deleteGeneration = async (id: string) => {
    if (!user) return;
    
    try {
      await deleteProfileGeneration(user.id, id);
      setSavedGenerations(prev => prev.filter(gen => gen.id !== id));
      
      // If the deleted generation was selected, clear the selection
      if (selectedGeneration?.id === id) {
        setSelectedGeneration(null);
      }
      
      toast({
        title: "Generation Deleted",
        description: "The saved generation has been removed.",
      });
    } catch (error) {
      console.error('Error deleting generation:', error);
      toast({
        title: "Error",
        description: "Failed to delete the generation. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const renameGeneration = async (id: string, newLabel: string) => {
    if (!user) return;
    
    try {
      await updateProfileGenerationLabel(user.id, id, newLabel);
      setSavedGenerations(prev => 
        prev.map(gen => 
          gen.id === id 
            ? {...gen, label: newLabel} 
            : gen
        )
      );
      
      toast({
        title: "Generation Renamed",
        description: "The label has been updated successfully.",
      });
    } catch (error) {
      console.error('Error renaming generation:', error);
      toast({
        title: "Error",
        description: "Failed to rename the generation. Please try again.",
        variant: "destructive",
      });
    }
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
                  className="gap-1 text-fitness-purple hover:text-fitness-purple/80"
                  onClick={() => setShowSavedGenerations(!showSavedGenerations)}
                  disabled={isLoadingGenerations}
                >
                  {isLoadingGenerations ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <ClipboardList className="w-4 h-4" />
                      {showSavedGenerations ? "Hide Saved Plans" : `Saved Plans (${savedGenerations.length})`}
                    </>
                  )}
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
                      {imagePaths && (imagePaths.front.length > 0 || imagePaths.side.length > 0 || imagePaths.back.length > 0) 
                        ? "Generate AI Overview with Analysis" 
                        : "Generate AI Overview"}
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
              {showSavedGenerations && (
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
                  
                  {isLoadingGenerations ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-fitness-purple" />
                    </div>
                  ) : savedGenerations.length > 0 ? (
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
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <p>You haven't saved any fitness plans yet.</p>
                      <p className="text-sm mt-1">Generate a profile overview to get started.</p>
                    </div>
                  )}
                </motion.div>
              )}

              {(markdown || isGenerating) && (
                <div className="relative flex">
                  {/* Minimalistic, collapsible TOC Sidebar */}
                  {tocHeadings.length > 0 && (
                    <div className="hidden md:flex flex-col sticky top-24 self-start mr-2 z-10 min-w-[40px] max-w-[120px]">
                      {tocOpen ? (
                        <>
                          <button
                            type="button"
                            aria-label="Collapse TOC"
                            className="mb-2 ml-auto p-1 rounded hover:bg-fitness-purple/10 text-fitness-purple"
                            onClick={() => setTocOpen(false)}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <ul className="space-y-1 border-l border-fitness-purple/20 pl-2">
                            <li className="text-[11px] font-semibold text-fitness-purple mb-1 tracking-wide uppercase pl-1">Sections</li>
                            {tocHeadings.map((h) => (
                              <li key={h.id} className="relative">
                                {activeId === h.id && (
                                  <span className="absolute -left-2 top-1/2 -translate-y-1/2 w-1.5 h-4 bg-fitness-purple rounded-r"></span>
                                )}
                                <a
                                  href={`#${h.id}`}
                                  className={cn(
                                    "block px-1 py-1 rounded text-gray-500 hover:text-fitness-purple hover:bg-fitness-purple/10 transition-colors text-xs leading-tight",
                                    activeId === h.id ? "text-fitness-purple font-semibold" : ""
                                  )}
                                >
                                  {h.text}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </>
                      ) : (
                        <button
                          type="button"
                          aria-label="Expand TOC"
                          className="p-1 rounded hover:bg-fitness-purple/10 text-fitness-purple"
                          onClick={() => setTocOpen(true)}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                  {/* Main Content */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1 p-5 bg-gradient-to-r from-gray-50 to-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-col"
                    ref={overviewSectionRef}
                  >
                    <div className="flex justify-between items-center mb-3 sticky top-0 z-20 bg-gradient-to-r from-gray-50 to-white pt-1 pb-2">
                      <h3 className="text-md font-semibold flex items-center gap-2 text-fitness-charcoal">
                        <ClipboardList className="h-4 w-4 text-fitness-purple" />
                        {selectedGeneration 
                          ? <span>Viewing: <span className="text-fitness-purple">{selectedGeneration.label}</span></span>
                          : "Personal Fitness Overview"
                        }
                      </h3>
                    </div>
                    <hr className="border-t border-gray-200 mb-4" />
                    <div className="flex-1 relative">
                      {/* Scrollable overview content, with bottom padding for sticky bar */}
                      <div className="p-6 max-h-[800px] overflow-y-auto pb-32" ref={contentAreaRef}>
                        {isGenerating ? (
                          <div className="relative">
                            <div className="prose prose-sm max-w-none text-gray-700">
                              <Markdown
                                remarkPlugins={[remarkGfm]}
                                components={markdownComponents}
                              >
                                {markdown.replace(/---##/g, '---\n\n##')
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
                              <div className="flex items-center justify-center mt-4">
                                <Loader2 className="h-5 w-5 animate-spin text-fitness-purple/40" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="prose prose-sm max-w-none text-gray-700">
                            <div>
                              <Markdown
                                remarkPlugins={[remarkGfm]}
                                components={markdownComponents}
                              >
                                {markdown.replace(/---##/g, '---\n\n##')
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
                      {/* Sticky Q&A input bar at the bottom of the overview box */}
                      <div className="sticky left-0 right-0 bottom-0 z-30 bg-gradient-to-r from-gray-50 to-white border-t border-gray-100 px-6 py-4">
                        <ProfileQASection 
                          userId={user?.id} 
                          threadId={selectedGeneration?.id} 
                          disabled={!user}
                          minimal={true}
                          prominent={true}
                        />
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </form>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
} 