import { useNavigate } from "react-router-dom";
import { useFitnessData } from "@/hooks/useFitnessData";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProgressRing } from "@/components/fitness/ProgressRing";
import { StatCard } from "@/components/fitness/StatCard";
import { StreakDisplay } from "@/components/fitness/StreakDisplay";
import { LevelProgress } from "@/components/fitness/LevelProgress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Activity,
  Dumbbell,
  Apple,
  Heart,
  Trophy,
  Target,
  TrendingUp,
  Droplets,
  Flame,
  Moon,
  Smile,
  ArrowLeft,
  Plus,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const motivationalQuotes = [
  "Your only limit is you!",
  "Make yourself proud today!",
  "Progress, not perfection.",
  "One step at a time.",
  "Stronger every day!",
  "You've got this!",
  "Consistency is key!",
  "Believe in yourself!",
];

export default function FitnessApp() {
  const navigate = useNavigate();
  const { data, getTodayActivity, getTodayNutrition, updateDailyActivity, updateNutritionLog } = useFitnessData();
  const [quote] = useState(() => motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
  const [showGoalsDialog, setShowGoalsDialog] = useState(false);

  const todayActivity = getTodayActivity();
  const todayNutrition = getTodayNutrition();
  const today = new Date().toISOString().split('T')[0];

  // Get today's data or defaults
  const steps = todayActivity?.steps || 0;
  const stepsGoal = todayActivity?.stepsGoal || 10000;
  const activeMinutes = todayActivity?.activeMinutes || 0;
  const activeMinutesGoal = todayActivity?.activeMinutesGoal || 30;
  const caloriesBurned = todayActivity?.caloriesBurned || 0;
  const waterIntake = todayNutrition?.waterIntake || 0;
  const waterGoal = todayNutrition?.waterGoal || 2000;
  const caloriesConsumed = todayNutrition?.totalCalories || 0;
  const calorieGoal = todayNutrition?.calorieGoal || 2000;

  // Goals form state
  const [goalsForm, setGoalsForm] = useState({
    stepsGoal: stepsGoal.toString(),
    activeMinutesGoal: activeMinutesGoal.toString(),
    waterGoal: waterGoal.toString(),
    calorieGoal: calorieGoal.toString(),
  });

  const handleSaveGoals = () => {
    const newStepsGoal = parseInt(goalsForm.stepsGoal) || 10000;
    const newActiveMinutesGoal = parseInt(goalsForm.activeMinutesGoal) || 30;
    const newWaterGoal = parseInt(goalsForm.waterGoal) || 2000;
    const newCalorieGoal = parseInt(goalsForm.calorieGoal) || 2000;

    // Update activity goals
    updateDailyActivity({
      date: today,
      steps,
      stepsGoal: newStepsGoal,
      activeMinutes,
      activeMinutesGoal: newActiveMinutesGoal,
      caloriesBurned,
      distance: todayActivity?.distance || 0,
      sedentaryMinutes: todayActivity?.sedentaryMinutes || 0,
    });

    // Update nutrition goals
    updateNutritionLog({
      date: today,
      meals: todayNutrition?.meals || [],
      waterIntake,
      waterGoal: newWaterGoal,
      totalCalories: caloriesConsumed,
      calorieGoal: newCalorieGoal,
      macros: todayNutrition?.macros || { protein: 0, carbs: 0, fats: 0 },
      macroGoals: todayNutrition?.macroGoals || { protein: 150, carbs: 200, fats: 65 },
    });

    toast.success("Daily goals updated! 🎯");
    setShowGoalsDialog(false);
  };

  // Get recent workouts
  const recentWorkouts = data.workouts
    .filter((w) => w.date === today)
    .slice(0, 3);

  // Get streaks
  const workoutStreak = data.streaks.workout || {
    type: 'workout' as const,
    currentStreak: 0,
    longestStreak: 0,
    freezesAvailable: 1,
  };

  const stepsStreak = data.streaks.steps || {
    type: 'steps' as const,
    currentStreak: 0,
    longestStreak: 0,
    freezesAvailable: 1,
  };

  // Get active challenges
  const activeChallenges = data.challenges.filter((c) => c.isActive && !c.isCompleted).slice(0, 3);

  // Get recent achievements
  const recentAchievements = data.achievements.slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Activity className="w-6 h-6 text-blue-500" />
                  Fitness Tracker
                </h1>
                <p className="text-sm text-muted-foreground">{quote}</p>
              </div>
            </div>
            <Button
              onClick={() => {
                setGoalsForm({
                  stepsGoal: stepsGoal.toString(),
                  activeMinutesGoal: activeMinutesGoal.toString(),
                  waterGoal: waterGoal.toString(),
                  calorieGoal: calorieGoal.toString(),
                });
                setShowGoalsDialog(true);
              }}
              variant="outline"
              size="sm"
            >
              <Settings className="w-4 h-4 mr-2" />
              Edit Goals
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Level Progress */}
        <LevelProgress level={data.user.level} />

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button
            onClick={() => navigate("/fitness/workout")}
            className="h-20 flex-col gap-1"
            variant="outline"
          >
            <Dumbbell className="w-5 h-5" />
            <span className="text-xs">Log Workout</span>
          </Button>
          <Button
            onClick={() => navigate("/fitness/nutrition")}
            className="h-20 flex-col gap-1"
            variant="outline"
          >
            <Apple className="w-5 h-5" />
            <span className="text-xs">Log Meal</span>
          </Button>
          <Button
            onClick={() => navigate("/fitness/wellness")}
            className="h-20 flex-col gap-1"
            variant="outline"
          >
            <Heart className="w-5 h-5" />
            <span className="text-xs">Check Mood</span>
          </Button>
          <Button
            onClick={() => navigate("/fitness/goals")}
            className="h-20 flex-col gap-1"
            variant="outline"
          >
            <Target className="w-5 h-5" />
            <span className="text-xs">Goals</span>
          </Button>
        </div>

        {/* Daily Progress Rings */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Today's Progress
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setGoalsForm({
                  stepsGoal: stepsGoal.toString(),
                  activeMinutesGoal: activeMinutesGoal.toString(),
                  waterGoal: waterGoal.toString(),
                  calorieGoal: calorieGoal.toString(),
                });
                setShowGoalsDialog(true);
              }}
            >
              <Settings className="w-4 h-4 mr-2" />
              Edit Goals
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <ProgressRing
              progress={(steps / stepsGoal) * 100}
              color="#3B82F6"
              value={steps.toLocaleString()}
              label={`Goal: ${stepsGoal.toLocaleString()} steps`}
            />
            <ProgressRing
              progress={(activeMinutes / activeMinutesGoal) * 100}
              color="#10B981"
              value={`${activeMinutes}`}
              label={`Goal: ${activeMinutesGoal} min`}
            />
            <ProgressRing
              progress={(waterIntake / waterGoal) * 100}
              color="#06B6D4"
              value={`${waterIntake}`}
              label={`Goal: ${waterGoal} ml`}
            />
            <ProgressRing
              progress={(caloriesConsumed / calorieGoal) * 100}
              color="#F59E0B"
              value={`${caloriesConsumed}`}
              label={`Goal: ${calorieGoal} cal`}
            />
          </div>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Steps Today"
            value={steps.toLocaleString()}
            unit="steps"
            icon={Activity}
            iconColor="text-blue-500"
            progress={(steps / stepsGoal) * 100}
            onClick={() => navigate("/fitness/activity")}
          />
          <StatCard
            title="Calories Burned"
            value={caloriesBurned}
            unit="cal"
            icon={Flame}
            iconColor="text-orange-500"
            onClick={() => navigate("/fitness/activity")}
          />
          <StatCard
            title="Workouts Today"
            value={recentWorkouts.length}
            icon={Dumbbell}
            iconColor="text-purple-500"
            onClick={() => navigate("/fitness/workout")}
          />
        </div>

        {/* Streaks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StreakDisplay streak={workoutStreak} title="Workout Streak" />
          <StreakDisplay streak={stepsStreak} title="Steps Goal Streak" />
        </div>

        {/* Recent Workouts */}
        {recentWorkouts.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-purple-500" />
                Today's Workouts
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/fitness/workout")}
              >
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {recentWorkouts.map((workout) => (
                <div
                  key={workout.id}
                  className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                >
                  <div>
                    <div className="font-medium">{workout.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {workout.duration} min • {workout.caloriesBurned} cal
                    </div>
                  </div>
                  <div className="text-sm font-medium text-blue-500">
                    +{workout.xpEarned} XP
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Active Challenges */}
        {activeChallenges.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Target className="w-5 h-5 text-green-500" />
                Active Challenges
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/fitness/challenges")}
              >
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {activeChallenges.map((challenge) => (
                <div key={challenge.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{challenge.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {challenge.progress} / {challenge.goal}
                    </div>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (challenge.progress / challenge.goal) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Recent Achievements */}
        {recentAchievements.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Recent Achievements
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/fitness/achievements")}
              >
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {recentAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-center gap-3 p-3 bg-secondary rounded-lg"
                >
                  <Trophy className="w-8 h-8 text-yellow-500" />
                  <div className="flex-1">
                    <div className="font-medium">{achievement.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {achievement.description}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-blue-500">
                    +{achievement.xpReward} XP
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Getting Started */}
        {data.workouts.length === 0 && (
          <Card className="p-6 border-2 border-dashed">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                  <Dumbbell className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Start Your Fitness Journey!</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Log your first workout, track your meals, or set a fitness goal to get started.
                </p>
                <div className="flex gap-2 justify-center flex-wrap">
                  <Button onClick={() => navigate("/fitness/workout")}>
                    <Dumbbell className="w-4 h-4 mr-2" />
                    Log Workout
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/fitness/goals")}>
                    <Target className="w-4 h-4 mr-2" />
                    Set Goals
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Bottom Navigation (Mobile) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t shadow-lg">
        <div className="grid grid-cols-5 gap-1 p-2">
          <Button
            variant="ghost"
            className="flex-col h-16 gap-1"
            onClick={() => navigate("/fitness")}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-xs">Home</span>
          </Button>
          <Button
            variant="ghost"
            className="flex-col h-16 gap-1"
            onClick={() => navigate("/fitness/activity")}
          >
            <Activity className="w-5 h-5" />
            <span className="text-xs">Activity</span>
          </Button>
          <Button
            variant="ghost"
            className="flex-col h-16 gap-1"
            onClick={() => navigate("/fitness/workout")}
          >
            <Dumbbell className="w-5 h-5" />
            <span className="text-xs">Workout</span>
          </Button>
          <Button
            variant="ghost"
            className="flex-col h-16 gap-1"
            onClick={() => navigate("/fitness/nutrition")}
          >
            <Apple className="w-5 h-5" />
            <span className="text-xs">Nutrition</span>
          </Button>
          <Button
            variant="ghost"
            className="flex-col h-16 gap-1"
            onClick={() => navigate("/fitness/achievements")}
          >
            <Trophy className="w-5 h-5" />
            <span className="text-xs">Rewards</span>
          </Button>
        </div>
      </div>

      {/* Add padding for mobile bottom nav */}
      <div className="h-20 md:hidden" />

      {/* Edit Goals Dialog */}
      <Dialog open={showGoalsDialog} onOpenChange={setShowGoalsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Daily Goals</DialogTitle>
            <DialogDescription>
              Customize your daily targets for steps, activity, water, and calories
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="stepsGoal">Daily Steps Goal</Label>
              <Input
                id="stepsGoal"
                type="number"
                placeholder="10000"
                value={goalsForm.stepsGoal}
                onChange={(e) => setGoalsForm({ ...goalsForm, stepsGoal: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Recommended: 8,000 - 12,000 steps</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="activeMinutesGoal">Active Minutes Goal</Label>
              <Input
                id="activeMinutesGoal"
                type="number"
                placeholder="30"
                value={goalsForm.activeMinutesGoal}
                onChange={(e) => setGoalsForm({ ...goalsForm, activeMinutesGoal: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Recommended: 30 - 60 minutes</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="waterGoal">Daily Water Goal (ml)</Label>
              <Input
                id="waterGoal"
                type="number"
                placeholder="2000"
                value={goalsForm.waterGoal}
                onChange={(e) => setGoalsForm({ ...goalsForm, waterGoal: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Recommended: 2,000 - 3,000 ml</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="calorieGoal">Daily Calorie Goal</Label>
              <Input
                id="calorieGoal"
                type="number"
                placeholder="2000"
                value={goalsForm.calorieGoal}
                onChange={(e) => setGoalsForm({ ...goalsForm, calorieGoal: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Adjust based on your fitness goals</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGoalsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveGoals}>
              <Target className="w-4 h-4 mr-2" />
              Save Goals
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
