
import React, { useState } from 'react';
import Header from '@/components/Header';
import { Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FoodSearchBar from '@/components/calorie/FoodSearchBar';
import MealEntry from '@/components/calorie/MealEntry';
import CalorieSummary from '@/components/calorie/CalorieSummary';

export interface FoodItem {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity: number;
}

export interface MealData {
  id: string;
  name: string;
  items: FoodItem[];
}

const CalorieTracker = () => {
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // Sample meal data
  const [meals, setMeals] = useState<MealData[]>([
    {
      id: 'breakfast',
      name: 'Breakfast',
      items: [
        { id: 1, name: 'Oatmeal', calories: 150, protein: 5, carbs: 27, fat: 3, quantity: 1 },
        { id: 2, name: 'Banana', calories: 105, protein: 1, carbs: 27, fat: 0, quantity: 1 },
      ],
    },
    {
      id: 'lunch',
      name: 'Lunch',
      items: [
        { id: 3, name: 'Chicken Salad', calories: 350, protein: 25, carbs: 10, fat: 20, quantity: 1 },
      ],
    },
    {
      id: 'dinner',
      name: 'Dinner',
      items: [
        { id: 4, name: 'Salmon', calories: 280, protein: 22, carbs: 0, fat: 18, quantity: 1 },
        { id: 5, name: 'Brown Rice', calories: 215, protein: 5, carbs: 45, fat: 2, quantity: 1 },
      ],
    },
    {
      id: 'snacks',
      name: 'Snacks',
      items: [
        { id: 6, name: 'Protein Bar', calories: 180, protein: 15, carbs: 20, fat: 5, quantity: 1 },
      ],
    },
  ]);

  const totalCalories = meals.reduce(
    (sum, meal) => sum + meal.items.reduce((mealSum, item) => mealSum + item.calories * item.quantity, 0),
    0
  );

  const totalProtein = meals.reduce(
    (sum, meal) => sum + meal.items.reduce((mealSum, item) => mealSum + item.protein * item.quantity, 0),
    0
  );

  const totalCarbs = meals.reduce(
    (sum, meal) => sum + meal.items.reduce((mealSum, item) => mealSum + item.carbs * item.quantity, 0),
    0
  );

  const totalFat = meals.reduce(
    (sum, meal) => sum + meal.items.reduce((mealSum, item) => mealSum + item.fat * item.quantity, 0),
    0
  );

  const handleAddFood = (mealId: string, food: FoodItem) => {
    setMeals(meals.map(meal => {
      if (meal.id === mealId) {
        return {
          ...meal,
          items: [...meal.items, { ...food, id: Date.now() }]
        };
      }
      return meal;
    }));
  };

  const handleRemoveFood = (mealId: string, foodId: number) => {
    setMeals(meals.map(meal => {
      if (meal.id === mealId) {
        return {
          ...meal,
          items: meal.items.filter(item => item.id !== foodId)
        };
      }
      return meal;
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="fitness-container py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-fitness-charcoal">Calorie Tracker</h2>
            <div className="flex items-center text-gray-500 mt-1">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{formattedDate}</span>
            </div>
          </div>
          
          <Button className="fitness-btn-primary">
            <Plus className="h-4 w-4 mr-1" />
            Quick Add
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="fitness-card mb-6">
              <CardHeader>
                <CardTitle>Today's Meals</CardTitle>
              </CardHeader>
              
              <CardContent>
                <Tabs defaultValue="breakfast">
                  <TabsList className="grid grid-cols-4 mb-4">
                    <TabsTrigger value="breakfast">Breakfast</TabsTrigger>
                    <TabsTrigger value="lunch">Lunch</TabsTrigger>
                    <TabsTrigger value="dinner">Dinner</TabsTrigger>
                    <TabsTrigger value="snacks">Snacks</TabsTrigger>
                  </TabsList>
                  
                  {meals.map((meal) => (
                    <TabsContent key={meal.id} value={meal.id} className="space-y-4">
                      <FoodSearchBar onAddFood={(food) => handleAddFood(meal.id, food)} />
                      
                      <div className="space-y-2 mt-4">
                        {meal.items.map((item) => (
                          <MealEntry 
                            key={item.id} 
                            food={item} 
                            onRemove={() => handleRemoveFood(meal.id, item.id)} 
                          />
                        ))}
                        
                        {meal.items.length === 0 && (
                          <div className="text-center py-6 text-gray-400">
                            <p>No food items added to {meal.name.toLowerCase()} yet.</p>
                            <p className="text-sm">Use the search bar above to add food.</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <CalorieSummary 
              calories={totalCalories} 
              protein={totalProtein} 
              carbs={totalCarbs} 
              fat={totalFat} 
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default CalorieTracker;
