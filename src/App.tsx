import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/auth-context";
import { LoadingSpinner } from "./components/ui/loading-spinner";
import Index from "./pages/Index";
import CalorieTracker from "./pages/CalorieTracker";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import FitnessKnowledge from "./pages/FitnessKnowledge";
import FitnessProfile from "./pages/FitnessProfile";
import MuscleModelPage from "./pages/MuscleModel";
import { useEffect } from "react";
import { initModelControlApi } from "./lib/modelControlApi";

const queryClient = new QueryClient();

// Protected Route wrapper component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

const App = () => {
  useEffect(() => {
    let socket: any;
    let cleanup = () => {};
    // Only run on client
    if (typeof window !== "undefined") {
      (async () => {
        const { io } = await import("socket.io-client");
        // TODO: Replace with your backend URL/port
        socket = io("http://localhost:8000");
        initModelControlApi(socket);
        cleanup = () => socket.disconnect();
      })();
    }
    return () => cleanup();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/calories"
                element={
                  <ProtectedRoute>
                    <CalorieTracker />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/knowledge"
                element={
                  <ProtectedRoute>
                    <FitnessKnowledge />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <FitnessProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/muscle-model"
                element={
                  <ProtectedRoute>
                    <MuscleModelPage />
                  </ProtectedRoute>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
