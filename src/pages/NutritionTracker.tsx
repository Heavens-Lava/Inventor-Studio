import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFitnessData } from "@/hooks/useFitnessData";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ProgressRing } from "@/components/fitness/ProgressRing";
import { NutritionLog, Meal } from "@/types/fitness";
import {
  ArrowLeft,
  Plus,
  Apple,
  Droplets,
  Flame,
  TrendingUp,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const mealTypes = [
  { value: "breakfast", label: "Breakfast", emoji: "🍳" },
  { value: "lunch", label: "Lunch", emoji: "🍱" },
  { value: "dinner", label: "Dinner", emoji: "🍽️" },
  { value: "snack", label: "Snack", emoji: "🍎" },
];

export default function NutritionTracker() {
  const navigate = useNavigate();
  const { data, updateNutritionLog, getTodayNutrition } = useFitnessData();
  const [showAddMealDialog, setShowAddMealDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const currentLog = getTodayNutrition() || {
    date: selectedDate,
    meals: [],
    waterIntake: 0,
    waterGoal: 2000,
    totalCalories: 0,
    calorieGoal: 2000,
    macros: { protein: 0, carbs: 0, fats: 0 },
    macroGoals: { protein: 150, carbs: 200, fats: 65 },
  };

  const [mealForm, setMealForm] = useState({
    type: "breakfast" as "breakfast" | "lunch" | "dinner" | "snack",
    foodName: "",
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
  });

  const addWater = (amount: number) => {
    const newWaterIntake = currentLog.waterIntake + amount;
    updateNutritionLog({
      ...currentLog,
      waterIntake: newWaterIntake,
    });
    toast.success(`Added ${amount}ml of water! 💧`);
  };

  const handleAddMeal = () => {
    if (!mealForm.foodName || !mealForm.calories) {
      toast.error("Please enter food name and calories");
      return;
    }

    const calories = parseInt(mealForm.calories);
    const protein = parseInt(mealForm.protein) || 0;
    const carbs = parseInt(mealForm.carbs) || 0;
    const fats = parseInt(mealForm.fats) || 0;

    const newMeal: Meal = {
      id: crypto.randomUUID(),
      type: mealForm.type,
      time: new Date().toISOString(),
      foods: [
        {
          id: crypto.randomUUID(),
          name: mealForm.foodName,
          calories,
          protein,
          carbs,
          fats,
          servingSize: "1 serving",
          servings: 1,
        },
      ],
      totalCalories: calories,
      macros: { protein, carbs, fats },
    };

    const updatedMeals = [...currentLog.meals, newMeal];
    const totalCalories = updatedMeals.reduce((sum, m) => sum + m.totalCalories, 0);
    const totalMacros = updatedMeals.reduce(
      (acc, m) => ({
        protein: acc.protein + m.macros.protein,
        carbs: acc.carbs + m.macros.carbs,
        fats: acc.fats + m.macros.fats,
      }),
      { protein: 0, carbs: 0, fats: 0 }
    );

    updateNutritionLog({
      ...currentLog,
      meals: updatedMeals,
      totalCalories,
      macros: totalMacros,
    });

    toast.success("Meal logged successfully! 🍽️");
    setShowAddMealDialog(false);
    resetMealForm();
  };

  const resetMealForm = () => {
    setMealForm({
      type: "breakfast",
      foodName: "",
      calories: "",
      protein: "",
      carbs: "",
      fats: "",
    });
  };

  const deleteMeal = (mealId: string) => {
    const updatedMeals = currentLog.meals.filter((m) => m.id !== mealId);
    const totalCalories = updatedMeals.reduce((sum, m) => sum + m.totalCalories, 0);
    const totalMacros = updatedMeals.reduce(
      (acc, m) => ({
        protein: acc.protein + m.macros.protein,
        carbs: acc.carbs + m.macros.carbs,
        fats: acc.fats + m.macros.fats,
      }),
      { protein: 0, carbs: 0, fats: 0 }
    );

    updateNutritionLog({
      ...currentLog,
      meals: updatedMeals,
      totalCalories,
      macros: totalMacros,
    });

    toast.success("Meal deleted");
  };

  const calorieProgress = (currentLog.totalCalories / currentLog.calorieGoal) * 100;
  const waterProgress = (currentLog.waterIntake / currentLog.waterGoal) * 100;
  const proteinProgress = (currentLog.macros.protein / currentLog.macroGoals.protein) * 100;
  const carbsProgress = (currentLog.macros.carbs / currentLog.macroGoals.carbs) * 100;
  const fatsProgress = (currentLog.macros.fats / currentLog.macroGoals.fats) * 100;

  const mealsByType = currentLog.meals.reduce((acc, meal) => {
    if (!acc[meal.type]) acc[meal.type] = [];
    acc[meal.type].push(meal);
    return acc;
  }, {} as Record<string, Meal[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate("/fitness")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Apple className="w-6 h-6 text-green-500" />
                  Nutrition Tracker
                </h1>
                <p className="text-sm text-muted-foreground">Track meals and hydration</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto"
              />
              <Button onClick={() => setShowAddMealDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Meal
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 pb-24 md:pb-6">
        {/* Daily Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Calories */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              Calories
            </h3>
            <div className="flex items-center justify-center">
              <ProgressRing
                progress={calorieProgress}
                size={150}
                color="#F59E0B"
                value={currentLog.totalCalories.toString()}
                label={`Goal: ${currentLog.calorieGoal} cal`}
              />
            </div>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              {currentLog.calorieGoal - currentLog.totalCalories > 0
                ? `${currentLog.calorieGoal - currentLog.totalCalories} cal remaining`
                : `${currentLog.totalCalories - currentLog.calorieGoal} cal over goal`}
            </div>
          </Card>

          {/* Water Intake */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Droplets className="w-5 h-5 text-blue-500" />
              Hydration
            </h3>
            <div className="flex items-center justify-center">
              <ProgressRing
                progress={waterProgress}
                size={150}
                color="#06B6D4"
                value={`${currentLog.waterIntake}`}
                label={`Goal: ${currentLog.waterGoal} ml`}
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => addWater(250)}
                className="flex items-center gap-1"
              >
                <Droplets className="w-4 h-4" />
                +250ml
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addWater(500)}
                className="flex items-center gap-1"
              >
                <Droplets className="w-4 h-4" />
                +500ml
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addWater(1000)}
                className="flex items-center gap-1"
              >
                <Droplets className="w-4 h-4" />
                +1L
              </Button>
            </div>
          </Card>
        </div>

        {/* Macronutrients */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            Macronutrients
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Protein</span>
                <span className="text-sm text-muted-foreground">
                  {currentLog.macros.protein}g / {currentLog.macroGoals.protein}g
                </span>
              </div>
              <Progress value={proteinProgress} className="h-3" />
              <div className="mt-1 text-xs text-center text-muted-foreground">
                {Math.round(proteinProgress)}%
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Carbs</span>
                <span className="text-sm text-muted-foreground">
                  {currentLog.macros.carbs}g / {currentLog.macroGoals.carbs}g
                </span>
              </div>
              <Progress value={carbsProgress} className="h-3" />
              <div className="mt-1 text-xs text-center text-muted-foreground">
                {Math.round(carbsProgress)}%
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Fats</span>
                <span className="text-sm text-muted-foreground">
                  {currentLog.macros.fats}g / {currentLog.macroGoals.fats}g
                </span>
              </div>
              <Progress value={fatsProgress} className="h-3" />
              <div className="mt-1 text-xs text-center text-muted-foreground">
                {Math.round(fatsProgress)}%
              </div>
            </div>
          </div>
        </Card>

        {/* Meals by Type */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Today's Meals</h3>
          {currentLog.meals.length === 0 ? (
            <div className="text-center py-8">
              <Apple className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">No meals logged yet</p>
              <Button onClick={() => setShowAddMealDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Log Your First Meal
              </Button>
            </div>
          ) : (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">All</TabsTrigger>
                {mealTypes.map((type) => (
                  <TabsTrigger key={type.value} value={type.value}>
                    {type.emoji}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="all" className="space-y-3 mt-4">
                {mealTypes.map((type) => {
                  const meals = mealsByType[type.value] || [];
                  if (meals.length === 0) return null;

                  return (
                    <div key={type.value}>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                        {type.emoji} {type.label}
                      </h4>
                      {meals.map((meal) => (
                        <Card key={meal.id} className="p-4 mb-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium mb-2">
                                {meal.foods.map((f) => f.name).join(", ")}
                              </div>
                              <div className="grid grid-cols-4 gap-2 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Calories:</span>{" "}
                                  <span className="font-medium">{meal.totalCalories}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Protein:</span>{" "}
                                  <span className="font-medium">{meal.macros.protein}g</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Carbs:</span>{" "}
                                  <span className="font-medium">{meal.macros.carbs}g</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Fats:</span>{" "}
                                  <span className="font-medium">{meal.macros.fats}g</span>
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground mt-2">
                                {new Date(meal.time).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteMeal(meal.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  );
                })}
              </TabsContent>

              {mealTypes.map((type) => (
                <TabsContent key={type.value} value={type.value} className="space-y-3 mt-4">
                  {(mealsByType[type.value] || []).length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No {type.label.toLowerCase()} logged</p>
                    </div>
                  ) : (
                    (mealsByType[type.value] || []).map((meal) => (
                      <Card key={meal.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium mb-2">
                              {meal.foods.map((f) => f.name).join(", ")}
                            </div>
                            <div className="grid grid-cols-4 gap-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Calories:</span>{" "}
                                <span className="font-medium">{meal.totalCalories}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Protein:</span>{" "}
                                <span className="font-medium">{meal.macros.protein}g</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Carbs:</span>{" "}
                                <span className="font-medium">{meal.macros.carbs}g</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Fats:</span>{" "}
                                <span className="font-medium">{meal.macros.fats}g</span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteMeal(meal.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    ))
                  )}
                </TabsContent>
              ))}
            </Tabs>
          )}
        </Card>
      </div>

      {/* Add Meal Dialog */}
      <Dialog open={showAddMealDialog} onOpenChange={setShowAddMealDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Meal</DialogTitle>
            <DialogDescription>Add food to track your nutrition</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="mealType">Meal Type</Label>
              <Select
                value={mealForm.type}
                onValueChange={(value) =>
                  setMealForm({ ...mealForm, type: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mealTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.emoji} {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="foodName">Food Name</Label>
              <Input
                id="foodName"
                placeholder="e.g., Chicken Breast, Oatmeal"
                value={mealForm.foodName}
                onChange={(e) => setMealForm({ ...mealForm, foodName: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="calories">Calories</Label>
                <Input
                  id="calories"
                  type="number"
                  placeholder="250"
                  value={mealForm.calories}
                  onChange={(e) => setMealForm({ ...mealForm, calories: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="protein">Protein (g)</Label>
                <Input
                  id="protein"
                  type="number"
                  placeholder="25"
                  value={mealForm.protein}
                  onChange={(e) => setMealForm({ ...mealForm, protein: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="carbs">Carbs (g)</Label>
                <Input
                  id="carbs"
                  type="number"
                  placeholder="30"
                  value={mealForm.carbs}
                  onChange={(e) => setMealForm({ ...mealForm, carbs: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fats">Fats (g)</Label>
                <Input
                  id="fats"
                  type="number"
                  placeholder="10"
                  value={mealForm.fats}
                  onChange={(e) => setMealForm({ ...mealForm, fats: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddMealDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMeal}>
              <Plus className="w-4 h-4 mr-2" />
              Log Meal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
