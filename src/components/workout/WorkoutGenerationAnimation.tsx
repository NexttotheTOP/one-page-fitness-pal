import { motion, AnimatePresence } from 'framer-motion';
import { User, Scale, Activity, Target, FileText, Pen, Brain, Dumbbell, ChevronRight, ClipboardCheck, Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react';

const steps = [
  {
    key: 'profile',
    icon: <User className="h-8 w-8 text-fitness-purple" />,
    title: 'Profile Analysis Agent',
    description: 'First, we retrieve and deeply analyze all the info and assessments we have about you (your fitness profile assessment, body composition, any health considerations, ...). This ensures we understand your unique needs and starting point.',
    caption: 'Analyzing your profile and goals…',
    visuals: (
      <div className="flex items-center gap-2">
        <User className="h-8 w-8 text-fitness-purple" />
        <Target className="h-7 w-7 text-green-500" />
        <Scale className="h-7 w-7 text-blue-400" />
        <Activity className="h-7 w-7 text-amber-500" />
        <ChevronRight className="h-5 w-5 text-gray-400" />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-3 py-1 shadow-md"
        >
          <Brain className="h-6 w-6 text-fitness-purple" />
        </motion.div>
      </div>
    )
  },
  {
    key: 'plan',
    icon: <FileText className="h-8 w-8 text-blue-600" />,
    title: 'Plan Proposal Agent',
    description: 'Next, a dedicated planning agent reviews your profile analysis and your workout request. It designs a comprehensive workout plan structure—choosing the right number of workouts, the best split (like upper/lower or push/pull/legs), and the focus areas that will help you reach your goals.',
    caption: 'Designing your personalized workout plan structure…',
    visuals: (
      <div className="flex items-center gap-2">
        <FileText className="h-9 w-9 text-blue-600" />
        <Pen className="h-7 w-7 text-fitness-purple" />
        <ClipboardCheck className="h-7 w-7 text-green-500" />
        <ChevronRight className="h-5 w-5 text-gray-400" />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-1 bg-white border border-blue-200 rounded-lg px-3 py-1 shadow-md"
        >
          <Brain className="h-6 w-6 text-fitness-purple" />
        </motion.div>
      </div>
    )
  },
  {
    key: 'workout',
    icon: <Dumbbell className="h-8 w-8 text-green-600" />,
    title: 'Workout Creation Agent',
    description: 'Finally, our expert workout creation agent uses this plan to generate detailed, step-by-step workouts just for you. Every exercise, set, and rep is tailored to your profile and the plan we\'ve built together.',
    caption: 'Building your detailed workouts…',
    visuals: (
      <div className="flex items-center gap-2">
        <Brain className="h-9 w-9 text-fitness-purple" />
        <ChevronRight className="h-5 w-5 text-gray-400" />
        <Dumbbell className="h-9 w-9 text-green-600" />
        <ClipboardCheck className="h-7 w-7 text-blue-600" />
      </div>
    )
  },
  {
    key: 'done',
    icon: <Sparkles className="h-8 w-8 text-yellow-500" />,
    title: 'Your personalized workouts are ready!',
    description: 'We analyze your profile, design a custom workout plan structure, and then generate detailed workouts—so every step is tailored just for you.',
    caption: 'All done! Your personalized workouts are ready.',
    visuals: (
      <div className="flex items-center gap-2">
        <Sparkles className="h-10 w-10 text-yellow-500 animate-bounce" />
        <Dumbbell className="h-9 w-9 text-green-600" />
        <ClipboardCheck className="h-8 w-8 text-blue-600" />
      </div>
    )
  }
];

export default function WorkoutGenerationAnimation() {
  const [currentStep, setCurrentStep] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to clear and restart timer
  const restartTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 6000);
  };

  // Auto-advance effect
  useEffect(() => {
    restartTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  // Manual navigation
  const goToStep = (idx: number) => {
    setCurrentStep(idx);
    restartTimer();
  };
  const goPrev = () => {
    if (currentStep > 0) goToStep(currentStep - 1);
  };
  const goNext = () => {
    if (currentStep < steps.length - 1) goToStep(currentStep + 1);
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
     
      <div className="relative flex items-center justify-center mb-8 h-24">
        {/* Animated flow of icons */}
        <AnimatePresence mode="wait">
          <motion.div
            key={steps[currentStep].key + '-visuals'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            className="w-full flex items-center justify-center"
          >
            {steps[currentStep].visuals}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="w-full max-w-md text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={steps[currentStep].key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="mb-2"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              {steps[currentStep].icon}
              <span className="font-semibold text-lg text-fitness-charcoal">
                {steps[currentStep].title}
              </span>
            </div>
            <p className="text-muted-foreground text-base mb-1">
              {steps[currentStep].caption}
            </p>
            <p className="text-gray-500 text-sm">
              {steps[currentStep].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
      {/* Manual navigation arrows */}
      <div className="flex items-center justify-center gap-4 mt-4">
        <button
          onClick={goPrev}
          disabled={currentStep === 0}
          className={`p-2 rounded-full border transition-colors ${currentStep === 0 ? 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed' : 'bg-white text-fitness-purple border-fitness-purple hover:bg-purple-50'}`}
          aria-label="Previous step"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          {steps.map((step, i) => (
            <span
              key={step.key}
              className={`h-2 w-2 rounded-full transition-all duration-300 ${
                i === currentStep ? 'bg-fitness-purple' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        <button
          onClick={goNext}
          disabled={currentStep === steps.length - 1}
          className={`p-2 rounded-full border transition-colors ${currentStep === steps.length - 1 ? 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed' : 'bg-white text-fitness-purple border-fitness-purple hover:bg-purple-50'}`}
          aria-label="Next step"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
} 