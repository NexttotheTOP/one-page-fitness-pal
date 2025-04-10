
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FoodItem } from '@/pages/CalorieTracker';

// Sample food database
const foodDatabase = [
  { id: 101, name: 'Egg', calories: 70, protein: 6, carbs: 0, fat: 5 },
  { id: 102, name: 'Bread (1 slice)', calories: 80, protein: 3, carbs: 15, fat: 1 },
  { id: 103, name: 'Chicken Breast (100g)', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { id: 104, name: 'Apple', calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
  { id: 105, name: 'Avocado (1/2)', calories: 160, protein: 2, carbs: 8, fat: 15 },
  { id: 106, name: 'Pasta (1 cup cooked)', calories: 200, protein: 7, carbs: 40, fat: 1 },
  { id: 107, name: 'Salmon (100g)', calories: 208, protein: 20, carbs: 0, fat: 13 },
  { id: 108, name: 'Greek Yogurt (1 cup)', calories: 130, protein: 22, carbs: 9, fat: 0 },
  { id: 109, name: 'Almonds (1 oz)', calories: 160, protein: 6, carbs: 6, fat: 14 },
  { id: 110, name: 'Banana', calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
];

interface FoodSearchBarProps {
  onAddFood: (food: FoodItem) => void;
}

const FoodSearchBar = ({ onAddFood }: FoodSearchBarProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<typeof foodDatabase>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    
    const results = foodDatabase.filter(food => 
      food.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setSearchResults(results);
    setIsSearching(true);
  };
  
  const handleAddFood = (food: typeof foodDatabase[0]) => {
    onAddFood({
      ...food,
      quantity: 1,
    });
    
    // Reset search
    setSearchTerm('');
    setSearchResults([]);
    setIsSearching(false);
  };
  
  return (
    <div className="relative">
      <div className="flex space-x-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for food..."
            className="pl-9"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch}>
          Search
        </Button>
      </div>
      
      {isSearching && (
        <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-md shadow-lg">
          {searchResults.length > 0 ? (
            <ul className="max-h-60 overflow-auto">
              {searchResults.map((food) => (
                <li 
                  key={food.id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                  onClick={() => handleAddFood(food)}
                >
                  <span>{food.name}</span>
                  <span className="text-gray-500">{food.calories} cal</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-center text-gray-500">
              No foods found. Try a different search term.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FoodSearchBar;
