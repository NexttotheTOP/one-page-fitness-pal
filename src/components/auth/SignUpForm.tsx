import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { defaultWorkouts } from "@/lib/defaultWorkouts";
import { createDefaultWorkouts, getUserWorkouts } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import type { AuthError } from "@supabase/supabase-js";

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingUpProfile, setIsSettingUpProfile] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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
        title: "Error",
        description: "Passwords do not match.",
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

      toast({
        title: "Account Created!",
        description: "Setting up your profile and workouts...",
      });

      // 2. Create default workouts
      try {
        await createDefaultWorkouts(signUpData.user.id, defaultWorkouts);
        console.log("Default workouts created successfully");
        
        // 3. Verify workouts were created by fetching them
        const workouts = await getUserWorkouts(signUpData.user.id);
        if (!workouts || workouts.length === 0) {
          throw new Error("Workouts were not created successfully");
        }

        // Wait for 3 seconds to ensure all workouts are properly loaded
        await new Promise(resolve => setTimeout(resolve, 3000));

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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Display Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isLoading || isSettingUpProfile}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="m@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading || isSettingUpProfile}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading || isSettingUpProfile}
          minLength={6}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirm Password</Label>
        <Input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={isLoading || isSettingUpProfile}
          minLength={6}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading || isSettingUpProfile}>
        {isLoading ? "Creating account..." : isSettingUpProfile ? "Setting up profile..." : "Create Account"}
      </Button>
    </form>
  );
} 