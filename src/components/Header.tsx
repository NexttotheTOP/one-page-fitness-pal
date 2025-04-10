
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Dumbbell, PieChart } from 'lucide-react';

const Header = () => {
  const location = useLocation();
  
  return (
    <header className="bg-secondary border-b border-border py-4 shadow-sm">
      <div className="fitness-container">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Dumbbell className="h-8 w-8 text-fitness-blue-light" />
            <h1 className="text-2xl font-bold text-foreground">FitnessPal</h1>
          </div>
          
          <nav className="flex items-center space-x-1">
            <Link
              to="/"
              className={`flex items-center space-x-1 px-4 py-2 rounded-md text-sm font-medium ${
                location.pathname === '/' 
                  ? 'bg-fitness-blue/20 text-fitness-blue-light'
                  : 'text-muted-foreground hover:text-fitness-blue-light hover:bg-secondary/50'
              }`}
            >
              <Dumbbell className="h-5 w-5" />
              <span>Workouts</span>
            </Link>
            
            <Link
              to="/calories"
              className={`flex items-center space-x-1 px-4 py-2 rounded-md text-sm font-medium ${
                location.pathname === '/calories' 
                  ? 'bg-fitness-blue/20 text-fitness-blue-light'
                  : 'text-muted-foreground hover:text-fitness-blue-light hover:bg-secondary/50'
              }`}
            >
              <PieChart className="h-5 w-5" />
              <span>Calories</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
