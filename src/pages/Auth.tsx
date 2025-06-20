import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SignInForm from "@/components/auth/SignInForm";
import SignUpForm from "@/components/auth/SignUpForm";
import { useAuth } from "@/lib/auth-context";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";
import { Dumbbell } from "lucide-react";
import { motion } from "framer-motion";

export default function Auth() {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [isProfileSetupInProgress, setIsProfileSetupInProgress] = useState(false);
  const { user } = useAuth();

  // Set page title
  useEffect(() => {
    document.title = activeTab === "signin" ? "Sign In - FitnessPal" : "Sign Up - FitnessPal";
    return () => {
      document.title = "One Page Fitness Pal";
    };
  }, [activeTab]);

  // Redirect if user is already logged in and profile setup is not in progress
  if (user && !isProfileSetupInProgress) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      <Header />
      
      <div className="flex-1 flex flex-col items-center px-4 py-12">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col items-center justify-center mb-8">
              <div className="h-16 w-16 bg-gradient-to-br from-fitness-purple to-purple-500 rounded-full flex items-center justify-center shadow-lg mb-4">
                <Dumbbell className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-fitness-charcoal">
                {activeTab === "signin" ? "Welcome Back" : "Join FitnessPal"}
              </h1>
              <p className="text-gray-500 mt-2 text-center max-w-sm">
                {activeTab === "signin" 
                  ? "Sign in to access your workouts and fitness data" 
                  : "Create an account to start tracking your fitness journey"}
              </p>
            </div>
            
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-6">
                <Tabs 
                  value={activeTab} 
                  onValueChange={(v) => setActiveTab(v as "signin" | "signup")}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 mb-8">
                    <TabsTrigger 
                      value="signin"
                      className="data-[state=active]:bg-fitness-purple data-[state=active]:text-white"
                    >
                      Sign In
                    </TabsTrigger>
                    <TabsTrigger 
                      value="signup"
                      className="data-[state=active]:bg-fitness-purple data-[state=active]:text-white"
                    >
                      Sign Up
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="signin">
                    <SignInForm />
                  </TabsContent>
                  <TabsContent value="signup">
                    <SignUpForm 
                      onProfileSetupStart={() => setIsProfileSetupInProgress(true)}
                      onProfileSetupComplete={() => setIsProfileSetupInProgress(false)}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            <p className="text-center text-sm text-gray-500 mt-8">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 