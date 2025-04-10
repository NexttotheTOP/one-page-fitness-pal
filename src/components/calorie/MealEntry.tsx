
import React from 'react';
import { Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FoodItem } from '@/pages/CalorieTracker';

interface MealEntryProps {
  food: FoodItem;
  onRemove: () => void;
}

const MealEntry = ({ food, onRemove }: MealEntryProps) => {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex-grow">
        <div className="flex justify-between">
          <h4 className="font-medium">{food.name}</h4>
          <span className="text-fitness-purple font-medium">{food.calories} cal</span>
        </div>
        
        <div className="text-xs text-gray-500 mt-1 space-x-2">
          <span>P: {food.protein}g</span>
          <span>C: {food.carbs}g</span>
          <span>F: {food.fat}g</span>
          <span>Qty: {food.quantity}</span>
        </div>
      </div>
      
      <Button 
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-gray-400 hover:text-red-500"
        onClick={onRemove}
      >
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default MealEntry;
