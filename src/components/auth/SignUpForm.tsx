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
    
    if (isLoading) return;
    
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

      // 2. Create default workouts
      try {
        await createDefaultWorkouts(signUpData.user.id, defaultWorkouts);
        console.log("Default workouts created successfully");
        
        // 3. Verify workouts were created by fetching them
        const workouts = await getUserWorkouts(signUpData.user.id);
        if (!workouts || workouts.length === 0) {
          throw new Error("Workouts were not created successfully");
        }
        
        // Show success message and redirect
        toast({
          title: "Success",
          description: "Account created successfully! Redirecting to dashboard...",
        });

        // Clear form
        setEmail("");
        setName("");
        setPassword("");
        setConfirmPassword("");

        // Small delay to ensure state is updated
        setTimeout(() => {
          navigate("/");
        }, 500);
        
      } catch (workoutError) {
        console.error("Error creating workouts:", workoutError);
        toast({
          title: "Warning",
          description: "Account created, but there was an error creating default workouts.",
          variant: "destructive",
        });
        // Still redirect after a delay, even if workout creation failed
        setTimeout(() => {
          navigate("/");
        }, 500);
      }
      
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? getErrorMessage(error as AuthError) : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
          disabled={isLoading}
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
          disabled={isLoading}
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
          disabled={isLoading}
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
          disabled={isLoading}
          minLength={6}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating account..." : "Create Account"}
      </Button>
    </form>
  );
} 