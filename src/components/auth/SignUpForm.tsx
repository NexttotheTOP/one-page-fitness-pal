import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { defaultWorkouts } from "@/lib/defaultWorkouts";
import { createDefaultWorkouts, getUserWorkouts } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, UserPlus, CheckCircle2 } from "lucide-react";
import type { AuthError } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingUpProfile, setIsSettingUpProfile] = useState(false);
  const [setupProgress, setSetupProgress] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Focus name input on mount
  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, []);

  // Calculate password strength
  const calculatePasswordStrength = (pwd: string): number => {
    if (!pwd) return 0;
    
    let strength = 0;
    
    // Length check
    if (pwd.length >= 8) strength += 25;
    
    // Contains lowercase
    if (/[a-z]/.test(pwd)) strength += 25;
    
    // Contains uppercase
    if (/[A-Z]/.test(pwd)) strength += 25;
    
    // Contains number or special char
    if (/[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd)) strength += 25;
    
    return strength;
  };

  const passwordStrength = calculatePasswordStrength(password);

  // Setup progress simulation
  useEffect(() => {
    if (isSettingUpProfile) {
      const timer = setInterval(() => {
        setSetupProgress(prev => {
          if (prev < 80) {
            return prev + 5;
          }
          return prev;
        });
      }, 300);
      
      return () => clearInterval(timer);
    }
  }, [isSettingUpProfile]);

  const getErrorMessage = (error: AuthError) => {
    if (error.message.includes("security purposes")) {
      const waitSeconds = error.message.match(/\d+/)?.[0] || "few";
      return `Please wait ${waitSeconds} seconds before trying again.`;
    }
    
    switch (error.message) {
      case "User already registered":
        return "This email is already registered. Please try signing in instead.";
      case "Password should be at least 6 characters":
        return "Password should be at least 6 characters long.";
      default:
        return error.message;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading || isSettingUpProfile) return;
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords match.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // 1. Sign up the user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: name },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (signUpError) throw signUpError;

      if (!signUpData.user) {
        throw new Error("No user data received from signup");
      }

      // Clear form after successful signup
      setEmail("");
      setName("");
      setPassword("");
      setConfirmPassword("");
      
      // Switch to profile setup loading state
      setIsLoading(false);
      setIsSettingUpProfile(true);
      setSetupProgress(10);

      toast({
        title: "Account Created!",
        description: "Setting up your profile and workouts...",
      });

      // 2. Create default workouts
      try {
        await createDefaultWorkouts(signUpData.user.id, defaultWorkouts);
        console.log("Default workouts created successfully");
        setSetupProgress(50);
        
        // 3. Verify workouts were created by fetching them
        const workouts = await getUserWorkouts(signUpData.user.id);
        if (!workouts || workouts.length === 0) {
          throw new Error("Workouts were not created successfully");
        }

        setSetupProgress(80);

        // Wait for 3 seconds to ensure all workouts are properly loaded
        await new Promise(resolve => setTimeout(resolve, 3000));
        setSetupProgress(100);

        toast({
          title: "All Set!",
          description: "Your profile is ready. Redirecting to dashboard...",
        });

        // Wait for the final toast to be visible before redirecting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setIsSettingUpProfile(false);
        navigate("/");
        
      } catch (workoutError) {
        console.error("Error creating workouts:", workoutError);
        setIsSettingUpProfile(false);
        toast({
          title: "Warning",
          description: "Account created, but there was an error creating default workouts.",
          variant: "destructive",
        });
        // Still redirect after a delay, even if workout creation failed
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
      
    } catch (error) {
      console.error("Signup error:", error);
      setIsLoading(false);
      setIsSettingUpProfile(false);
      toast({
        title: "Error",
        description: error instanceof Error ? getErrorMessage(error as AuthError) : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {isSettingUpProfile ? (
        <div className="py-4 px-2">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative h-20 w-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-fitness-purple/20 animate-pulse"></div>
              <CheckCircle2 className="h-10 w-10 text-fitness-purple animate-bounce" />
            </div>
            <h3 className="text-xl font-semibold text-fitness-charcoal">Setting up your profile</h3>
            <p className="text-gray-500 text-sm">We're creating your account and setting up your default workouts</p>
            
            <div className="w-full pt-2">
              <Progress value={setupProgress} className="h-2 bg-gray-100" />
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>Creating account</span>
                <span>Setting up workouts</span>
                <span>Finishing</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">Display Name</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                ref={nameInputRef}
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
                className="pl-10 bg-white border-gray-200 focus-visible:ring-fitness-purple/25"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="pl-10 bg-white border-gray-200 focus-visible:ring-fitness-purple/25"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={6}
                className="pl-10 pr-10 bg-white border-gray-200 focus-visible:ring-fitness-purple/25"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            
            {password && (
              <div className="pt-1">
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${
                      passwordStrength < 50 
                        ? 'bg-red-500' 
                        : passwordStrength < 75 
                          ? 'bg-yellow-500' 
                          : 'bg-green-500'
                    }`} 
                    style={{ width: `${passwordStrength}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {passwordStrength < 50 
                    ? 'Weak password' 
                    : passwordStrength < 75 
                      ? 'Good password' 
                      : 'Strong password'}
                </p>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">Confirm Password</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={6}
                className="pl-10 pr-10 bg-white border-gray-200 focus-visible:ring-fitness-purple/25"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={toggleConfirmPasswordVisibility}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            {password && confirmPassword && password !== confirmPassword && (
              <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
            )}
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-11 mt-6 bg-gradient-to-br from-fitness-purple to-purple-600 hover:from-fitness-purple/90 hover:to-purple-600/90 transition-all duration-300 shadow-md hover:shadow-lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating account...
              </div>
            ) : (
              <div className="flex items-center">
                <UserPlus className="h-5 w-5 mr-2" />
                Create Account
              </div>
            )}
          </Button>
        </form>
      )}
    </motion.div>
  );
} 