import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Dumbbell, PieChart } from 'lucide-react';
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
import { LogOut, User } from "lucide-react";

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
    <header className="bg-white border-b border-gray-200 py-4 shadow-sm">
      <div className="fitness-container">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Dumbbell className="h-8 w-8 text-fitness-purple" />
            <h1 className="text-2xl font-bold text-fitness-charcoal">FitnessPal</h1>
          </div>
          
          <nav className="flex items-center space-x-1">
            <Link
              to="/"
              className={`flex items-center space-x-1 px-4 py-2 rounded-md text-sm font-medium ${
                location.pathname === '/' 
                  ? 'bg-fitness-purple-light text-fitness-purple'
                  : 'text-gray-600 hover:text-fitness-purple hover:bg-gray-100'
              }`}
            >
              <Dumbbell className="h-5 w-5" />
              <span>Workouts</span>
            </Link>
            
            <Link
              to="/calories"
              className={`flex items-center space-x-1 px-4 py-2 rounded-md text-sm font-medium ${
                location.pathname === '/calories' 
                  ? 'bg-fitness-purple-light text-fitness-purple'
                  : 'text-gray-600 hover:text-fitness-purple hover:bg-gray-100'
              }`}
            >
              <PieChart className="h-5 w-5" />
              <span>Calories</span>
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarFallback>{initials}</AvatarFallback>
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
