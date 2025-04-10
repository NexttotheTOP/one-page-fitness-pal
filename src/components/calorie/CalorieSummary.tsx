
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface CalorieSummaryProps {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const CalorieSummary = ({ calories, protein, carbs, fat }: CalorieSummaryProps) => {
  // Fictitious daily goals
  const calorieGoal = 2000;
  const proteinGoal = 150;
  const carbsGoal = 200;
  const fatGoal = 65;
  
  const caloriePercentage = Math.min(100, Math.round((calories / calorieGoal) * 100));
  const proteinPercentage = Math.min(100, Math.round((protein / proteinGoal) * 100));
  const carbsPercentage = Math.min(100, Math.round((carbs / carbsGoal) * 100));
  const fatPercentage = Math.min(100, Math.round((fat / fatGoal) * 100));
  
  const calculateCaloriesRemaining = () => {
    const remaining = calorieGoal - calories;
    return remaining > 0 ? remaining : 0;
  };
  
  const calculateMacroPercentages = () => {
    const total = (protein * 4) + (carbs * 4) + (fat * 9);
    if (total === 0) return { protein: 0, carbs: 0, fat: 0 };
    
    return {
      protein: Math.round((protein * 4 / total) * 100),
      carbs: Math.round((carbs * 4 / total) * 100),
      fat: Math.round((fat * 9 / total) * 100),
    };
  };
  
  const macroPercentages = calculateMacroPercentages();
  
  return (
    <div className="space-y-6">
      <Card className="fitness-card">
        <CardHeader>
          <CardTitle>Calories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-2">
            <span className="text-gray-500">Consumed</span>
            <span className="font-medium">{calories} cal</span>
          </div>
          <div className="flex justify-between mb-4">
            <span className="text-gray-500">Remaining</span>
            <span className="font-medium">{calculateCaloriesRemaining()} cal</span>
          </div>
          
          <Progress value={caloriePercentage} className="h-2 mb-2" />
          
          <div className="text-xs text-gray-500 text-center mt-1">
            {caloriePercentage}% of daily goal
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="font-medium mb-3">Calorie Breakdown</h4>
            <div className="flex gap-2 mb-4">
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden flex">
                <div 
                  className="bg-blue-500 h-full" 
                  style={{ width: `${macroPercentages.protein}%` }}
                />
                <div 
                  className="bg-green-500 h-full" 
                  style={{ width: `${macroPercentages.carbs}%` }}
                />
                <div 
                  className="bg-yellow-500 h-full" 
                  style={{ width: `${macroPercentages.fat}%` }}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
                <span>Protein {macroPercentages.protein}%</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                <span>Carbs {macroPercentages.carbs}%</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
                <span>Fat {macroPercentages.fat}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="fitness-card">
        <CardHeader>
          <CardTitle>Macronutrients</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Protein</span>
              <span className="text-sm text-gray-500">{protein}g / {proteinGoal}g</span>
            </div>
            <Progress value={proteinPercentage} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Carbs</span>
              <span className="text-sm text-gray-500">{carbs}g / {carbsGoal}g</span>
            </div>
            <Progress value={carbsPercentage} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Fat</span>
              <span className="text-sm text-gray-500">{fat}g / {fatGoal}g</span>
            </div>
            <Progress value={fatPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalorieSummary;
