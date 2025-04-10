
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Dumbbell, PieChart } from 'lucide-react';

const Header = () => {
  const location = useLocation();
  
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
        </div>
      </div>
    </header>
  );
};

export default Header;
