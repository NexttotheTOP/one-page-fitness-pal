import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Dumbbell, PieChart, Brain, User, LogOut, BarChart, LayoutGrid, Calendar, Target, Menu } from 'lucide-react';
import { useAuth } from "@/lib/auth-context";
import { getUserDisplayName } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Header = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const displayName = getUserDisplayName(user);
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 py-3 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-2 lg:px-4 xl:px-6 w-full max-w-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2 pr-4">
              <div className="p-1.5 bg-gradient-to-br from-fitness-purple to-purple-400 rounded-lg shadow-sm">
                <Dumbbell className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-fitness-charcoal flex items-center">
                  OpenFit-AI
                </h1>
                <div className="text-xs text-gray-500 font-medium mt-0.5">Open-source fitness expertise by AI</div>
              </div>
            </div>
            
            {/* Mobile Menu Button - only shown on small screens */}
            <Button variant="ghost" className="p-1.5 lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
            
            {/* Main Navigation - hidden on small screens */}
            <nav className="hidden lg:flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
              <Link
                to="/"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === '/' 
                    ? 'bg-fitness-purple text-white shadow-sm'
                    : 'text-gray-600 hover:text-fitness-purple hover:bg-gray-100'
                }`}
              >
                <Dumbbell className="h-4 w-4" />
                <span>Workouts</span>
              </Link>
              
              <Link
                to="/profile"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === '/profile' 
                    ? 'bg-fitness-purple text-white shadow-sm'
                    : 'text-gray-600 hover:text-fitness-purple hover:bg-gray-100'
                }`}
              >
                <User className="h-4 w-4" />
                <span>Overview</span>
              </Link>
              
              <Link
                to="/knowledge"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === '/knowledge' 
                    ? 'bg-fitness-purple text-white shadow-sm'
                    : 'text-gray-600 hover:text-fitness-purple hover:bg-gray-100'
                }`}
              >
                <Brain className="h-4 w-4" />
                <span>Knowledge</span>
              </Link>
              
              <Link
                to="/muscle-model"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === '/muscle-model' 
                    ? 'bg-fitness-purple text-white shadow-sm'
                    : 'text-gray-600 hover:text-fitness-purple hover:bg-gray-100'
                }`}
              >
                <BarChart className="h-4 w-4" />
                <span>3D Muscles</span>
              </Link>
            </nav>
          </div>

          {/* User profile and actions */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden md:flex items-center gap-1.5 text-gray-600 border-gray-200">
              <Target className="h-4 w-4" />
              <span>Progress</span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8 border border-gray-200">
                    <AvatarFallback className="bg-purple-100 text-fitness-purple">{initials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {displayName && (
                      <p className="font-medium">{displayName}</p>
                    )}
                    {user?.email && (
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="w-full cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600 cursor-pointer"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
