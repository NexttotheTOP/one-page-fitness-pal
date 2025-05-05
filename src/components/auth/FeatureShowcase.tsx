import { useEffect, useState } from "react";
import { motion, AnimatePresence, MotionValue, useAnimation, useTransform } from "framer-motion";
import {
  Dumbbell,
  Brain,
  Sparkles,
  BarChart3,
  Utensils,
  Calendar,
  UserCircle2,
  MessageSquare,
  Bot,
  Activity,
  Scale,
  Users,
  LineChart,
  Clock,
} from "lucide-react";
import React from "react";

const features = [
  {
    title: "Personal Assessment",
    icon: UserCircle2,
    description: "Create your fitness profile with goals, experience, and body metrics",
    color: "from-blue-500 to-cyan-400",
    animation: "fadeIn",
  },
  {
    title: "AI Fitness Coach",
    icon: Bot,
    description: "Your virtual coach analyzes your data to create personalized plans",
    color: "from-fitness-purple to-indigo-500",
    animation: "slideUp",
  },
  {
    title: "Progress Tracking",
    icon: LineChart,
    description: "Track your improvements over time with detailed metrics",
    color: "from-green-500 to-emerald-400",
    animation: "scaleUp",
  },
  {
    title: "Workout Creator",
    icon: Dumbbell,
    description: "AI-generated workout routines tailored to your goals",
    color: "from-orange-500 to-amber-400",
    animation: "slideLeft",
  },
  {
    title: "Nutrition Guidance",
    icon: Utensils,
    description: "Personalized meal recommendations based on your goals",
    color: "from-red-500 to-rose-400",
    animation: "slideRight",
  },
  {
    title: "Expert Knowledge",
    icon: Brain,
    description: "Science-based answers from top fitness experts",
    color: "from-violet-500 to-purple-400",
    animation: "bounce",
  },
];

// Agent characters
const agents = [
  {
    name: "Head Coach",
    icon: Users,
    color: "bg-fitness-purple",
  },
  {
    name: "Nutrition Expert",
    icon: Utensils,
    color: "bg-green-500",
  },
  {
    name: "Fitness Trainer",
    icon: Dumbbell,
    color: "bg-blue-500",
  },
  {
    name: "Knowledge Base",
    icon: Brain,
    color: "bg-amber-500",
  },
];

export default function FeatureShowcase() {
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);
  const [showAgents, setShowAgents] = useState(false);
  const controls = useAnimation();

  // Auto-advance features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeatureIndex((prev) => (prev + 1) % features.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Show agents after showing all features
  useEffect(() => {
    if (activeFeatureIndex === 0) {
      setTimeout(() => {
        setShowAgents(true);
        setTimeout(() => setShowAgents(false), 4000);
      }, 2000);
    }
  }, [activeFeatureIndex]);

  // Animation for the data flow
  useEffect(() => {
    const animateFlow = async () => {
      await controls.start({
        pathLength: 1,
        transition: { duration: 2, ease: "easeInOut" }
      });
      await controls.start({
        pathLength: 0,
        transition: { duration: 0.5, ease: "easeInOut" }
      });
    };
    
    animateFlow();
    
    const interval = setInterval(animateFlow, 5000);
    return () => clearInterval(interval);
  }, [controls]);

  const getAnimationVariants = (type: string) => {
    switch (type) {
      case "fadeIn":
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { duration: 1 } },
        };
      case "slideUp":
        return {
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
        };
      case "scaleUp":
        return {
          hidden: { opacity: 0, scale: 0.8 },
          visible: { opacity: 1, scale: 1, transition: { duration: 0.7 } },
        };
      case "slideLeft":
        return {
          hidden: { opacity: 0, x: 20 },
          visible: { opacity: 1, x: 0, transition: { duration: 0.7 } },
        };
      case "slideRight":
        return {
          hidden: { opacity: 0, x: -20 },
          visible: { opacity: 1, x: 0, transition: { duration: 0.7 } },
        };
      case "bounce":
        return {
          hidden: { opacity: 0, y: -20 },
          visible: { 
            opacity: 1, 
            y: 0, 
            transition: { 
              duration: 0.7,
              type: "spring", 
              stiffness: 300, 
              damping: 10 
            } 
          },
        };
      default:
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { duration: 0.7 } },
        };
    }
  };

  return (
    <div className="mt-16 mb-10">
      <h2 className="text-xl font-semibold text-center text-fitness-charcoal mb-10">
        Your All-in-One Fitness Companion
      </h2>

      <div className="relative">
        {/* User profile in the center */}
        <div className="flex justify-center mb-6">
          <motion.div 
            className="relative z-10 h-16 w-16 bg-gradient-to-br from-fitness-purple to-purple-500 rounded-full flex items-center justify-center shadow-lg"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <UserCircle2 className="h-8 w-8 text-white" />
            
            {/* Pulsing ring effect */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-fitness-purple"
              initial={{ scale: 1, opacity: 1 }}
              animate={{ 
                scale: [1, 1.2, 1], 
                opacity: [1, 0.2, 1] 
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                repeatType: "loop"
              }}
            />
          </motion.div>
        </div>

        {/* Connection lines to agents */}
        <div className="relative h-60">
          <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 400 200" fill="none">
            <motion.path 
              d="M200,0 C200,100 100,150 50,150" 
              stroke="url(#purpleGradient)" 
              strokeWidth="2" 
              strokeDasharray="1"
              initial={{ pathLength: 0 }}
              animate={controls}
            />
            <motion.path 
              d="M200,0 C200,100 300,150 350,150" 
              stroke="url(#greenGradient)" 
              strokeWidth="2" 
              strokeDasharray="1"
              initial={{ pathLength: 0 }}
              animate={controls}
            />
            <motion.path 
              d="M200,0 C200,80 150,150 125,150" 
              stroke="url(#blueGradient)" 
              strokeWidth="2" 
              strokeDasharray="1"
              initial={{ pathLength: 0 }}
              animate={controls}
            />
            <motion.path 
              d="M200,0 C200,80 250,150 275,150" 
              stroke="url(#amberGradient)" 
              strokeWidth="2" 
              strokeDasharray="1"
              initial={{ pathLength: 0 }}
              animate={controls}
            />
            
            {/* Gradients for the paths */}
            <defs>
              <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#6d28d9" />
              </linearGradient>
              <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
              <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>
              <linearGradient id="amberGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Agent icons */}
          <div className="absolute top-0 left-0 w-full h-full flex justify-center">
            <div className="relative w-full max-w-3xl h-full">
              {/* Head Coach */}
              <motion.div 
                className="absolute top-36 left-12"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: showAgents ? 1 : 0.5, scale: showAgents ? 1 : 0.9 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 bg-fitness-purple rounded-full flex items-center justify-center shadow-md mb-2">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">Head Coach</span>
                </div>
              </motion.div>
              
              {/* Nutrition Expert */}
              <motion.div 
                className="absolute top-36 right-12"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: showAgents ? 1 : 0.5, scale: showAgents ? 1 : 0.9 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 bg-green-500 rounded-full flex items-center justify-center shadow-md mb-2">
                    <Utensils className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">Nutrition Expert</span>
                </div>
              </motion.div>
              
              {/* Fitness Trainer */}
              <motion.div 
                className="absolute top-36 left-1/3 translate-x-4"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: showAgents ? 1 : 0.5, scale: showAgents ? 1 : 0.9 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center shadow-md mb-2">
                    <Dumbbell className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">Fitness Trainer</span>
                </div>
              </motion.div>
              
              {/* Knowledge Base */}
              <motion.div 
                className="absolute top-36 right-1/3 -translate-x-4"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: showAgents ? 1 : 0.5, scale: showAgents ? 1 : 0.9 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 bg-amber-500 rounded-full flex items-center justify-center shadow-md mb-2">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">Knowledge Base</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Features carousel */}
        <div className="mt-8">
          <div className="mb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeatureIndex}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0 }}
                variants={getAnimationVariants(features[activeFeatureIndex].animation)}
                className="flex flex-col items-center text-center"
              >
                <div className={`h-14 w-14 bg-gradient-to-br ${features[activeFeatureIndex].color} rounded-xl flex items-center justify-center shadow-lg mb-3`}>
                  {React.createElement(features[activeFeatureIndex].icon, { className: "h-7 w-7 text-white" })}
                </div>
                <h3 className="text-lg font-semibold text-fitness-charcoal mb-1">
                  {features[activeFeatureIndex].title}
                </h3>
                <p className="text-sm text-gray-600 max-w-xs">
                  {features[activeFeatureIndex].description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Feature indicator dots */}
          <div className="flex justify-center space-x-2">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveFeatureIndex(index)}
                className="p-0.5"
              >
                <div
                  className={`h-2 w-2 rounded-full transition-all duration-300 ${
                    index === activeFeatureIndex
                      ? "bg-fitness-purple w-5"
                      : "bg-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 