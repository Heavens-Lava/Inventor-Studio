import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFitnessData } from "@/hooks/useFitnessData";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProgressRing } from "@/components/fitness/ProgressRing";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Activity,
  Footprints,
  Clock,
  Flame,
  MapPin,
  Plus,
  Edit,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

export default function ActivityTracker() {
  const navigate = useNavigate();
  const { data, updateDailyActivity, getTodayActivity } = useFitnessData();
  const [showLogDialog, setShowLogDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const todayActivity = getTodayActivity() || {
    date: selectedDate,
    steps: 0,
    stepsGoal: 10000,
    activeMinutes: 0,
    activeMinutesGoal: 30,
    caloriesBurned: 0,
    distance: 0,
    sedentaryMinutes: 0,
  };

  const [activityForm, setActivityForm] = useState({
    steps: todayActivity.steps.toString(),
    activeMinutes: todayActivity.activeMinutes.toString(),
    caloriesBurned: todayActivity.caloriesBurned.toString(),
    distance: todayActivity.distance.toString(),
  });

  const handleLogActivity = () => {
    const steps = parseInt(activityForm.steps) || 0;
    const activeMinutes = parseInt(activityForm.activeMinutes) || 0;
    const caloriesBurned = parseInt(activityForm.caloriesBurned) || 0;
    const distance = parseFloat(activityForm.distance) || 0;

    updateDailyActivity({
      date: selectedDate,
      steps,
      stepsGoal: todayActivity.stepsGoal,
      activeMinutes,
      activeMinutesGoal: todayActivity.activeMinutesGoal,
      caloriesBurned,
      distance,
      sedentaryMinutes: todayActivity.sedentaryMinutes,
    });

    toast.success("Activity logged successfully! 🎯");
    setShowLogDialog(false);
  };

  const quickAddSteps = (amount: number) => {
    const newSteps = todayActivity.steps + amount;
    const estimatedDistance = (newSteps * 0.0008); // Rough estimate: 1 step ≈ 0.8m
    const estimatedCalories = Math.floor(newSteps * 0.04); // Rough estimate: 1 step ≈ 0.04 cal

    updateDailyActivity({
      ...todayActivity,
      steps: newSteps,
      distance: todayActivity.distance + estimatedDistance,
      caloriesBurned: todayActivity.caloriesBurned + estimatedCalories,
    });

    toast.success(`Added ${amount} steps! 👣`);
  };

  const quickAddMinutes = (amount: number) => {
    const newMinutes = todayActivity.activeMinutes + amount;
    const estimatedCalories = Math.floor(amount * 5); // Rough estimate: 5 cal/min

    updateDailyActivity({
      ...todayActivity,
      activeMinutes: newMinutes,
      caloriesBurned: todayActivity.caloriesBurned + estimatedCalories,
    });

    toast.success(`Added ${amount} active minutes! ⏱️`);
  };

  // Get activity history
  const activityHistory = data.dailyActivities
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7);

  // Calculate weekly stats
  const weeklyStats = activityHistory.reduce(
    (acc, activity) => ({
      totalSteps: acc.totalSteps + activity.steps,
      totalMinutes: acc.totalMinutes + activity.activeMinutes,
      totalCalories: acc.totalCalories + activity.caloriesBurned,
      totalDistance: acc.totalDistance + activity.distance,
    }),
    { totalSteps: 0, totalMinutes: 0, totalCalories: 0, totalDistance: 0 }
  );

  const avgDailySteps = activityHistory.length > 0
    ? Math.floor(weeklyStats.totalSteps / activityHistory.length)
    : 0;

  const stepsProgress = (todayActivity.steps / todayActivity.stepsGoal) * 100;
  const minutesProgress = (todayActivity.activeMinutes / todayActivity.activeMinutesGoal) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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
                  <Activity className="w-6 h-6 text-blue-500" />
                  Activity Tracker
                </h1>
                <p className="text-sm text-muted-foreground">Track your daily movement and activity</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto"
              />
              <Button
                onClick={() => {
                  setActivityForm({
                    steps: todayActivity.steps.toString(),
                    activeMinutes: todayActivity.activeMinutes.toString(),
                    caloriesBurned: todayActivity.caloriesBurned.toString(),
                    distance: todayActivity.distance.toString(),
                  });
                  setShowLogDialog(true);
                }}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Activity
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 pb-24 md:pb-6">
        {/* Today's Progress */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Footprints className="w-5 h-5 text-blue-500" />
              Steps Today
            </h3>
            <div className="flex items-center justify-center mb-4">
              <ProgressRing
                progress={stepsProgress}
                size={180}
                color="#3B82F6"
                value={todayActivity.steps.toLocaleString()}
                label={`Goal: ${todayActivity.stepsGoal.toLocaleString()} steps`}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => quickAddSteps(1000)}
              >
                +1K
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => quickAddSteps(2500)}
              >
                +2.5K
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => quickAddSteps(5000)}
              >
                +5K
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-500" />
              Active Minutes
            </h3>
            <div className="flex items-center justify-center mb-4">
              <ProgressRing
                progress={minutesProgress}
                size={180}
                color="#10B981"
                value={todayActivity.activeMinutes.toString()}
                label={`Goal: ${todayActivity.activeMinutesGoal} minutes`}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => quickAddMinutes(10)}
              >
                +10 min
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => quickAddMinutes(20)}
              >
                +20 min
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => quickAddMinutes(30)}
              >
                +30 min
              </Button>
            </div>
          </Card>
        </div>

        {/* Today's Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-muted-foreground">Calories</span>
            </div>
            <div className="text-2xl font-bold">{todayActivity.caloriesBurned}</div>
            <div className="text-xs text-muted-foreground">burned</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-muted-foreground">Distance</span>
            </div>
            <div className="text-2xl font-bold">{todayActivity.distance.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">km</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Avg Steps</span>
            </div>
            <div className="text-2xl font-bold">{avgDailySteps.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">last 7 days</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Weekly</span>
            </div>
            <div className="text-2xl font-bold">{weeklyStats.totalMinutes}</div>
            <div className="text-xs text-muted-foreground">active min</div>
          </Card>
        </div>

        {/* Weekly Summary */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-500" />
            7-Day Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Total Steps</div>
              <div className="text-2xl font-bold text-blue-500">
                {weeklyStats.totalSteps.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Total Minutes</div>
              <div className="text-2xl font-bold text-green-500">
                {weeklyStats.totalMinutes}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Total Calories</div>
              <div className="text-2xl font-bold text-orange-500">
                {weeklyStats.totalCalories.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Total Distance</div>
              <div className="text-2xl font-bold text-purple-500">
                {weeklyStats.totalDistance.toFixed(2)} km
              </div>
            </div>
          </div>
        </Card>

        {/* Activity History */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Recent Activity
          </h3>

          {activityHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No activity logged yet. Start tracking your daily movement!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activityHistory.map((activity) => {
                const date = new Date(activity.date);
                const isToday = activity.date === new Date().toISOString().split("T")[0];
                const stepsProgress = (activity.steps / activity.stepsGoal) * 100;

                return (
                  <Card key={activity.date} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-medium">
                          {isToday ? "Today" : date.toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {Math.round(stepsProgress)}% of steps goal
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-500">
                          {activity.steps.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">steps</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Active:</span>{" "}
                        <span className="font-medium">{activity.activeMinutes} min</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Calories:</span>{" "}
                        <span className="font-medium">{activity.caloriesBurned}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Distance:</span>{" "}
                        <span className="font-medium">{activity.distance.toFixed(2)} km</span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(100, stepsProgress)}%` }}
                        />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Edit Activity Dialog */}
      <Dialog open={showLogDialog} onOpenChange={setShowLogDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Activity</DialogTitle>
            <DialogDescription>
              Manually update your activity data for {selectedDate}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="steps">Steps</Label>
              <Input
                id="steps"
                type="number"
                placeholder="0"
                value={activityForm.steps}
                onChange={(e) => setActivityForm({ ...activityForm, steps: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="activeMinutes">Active Minutes</Label>
              <Input
                id="activeMinutes"
                type="number"
                placeholder="0"
                value={activityForm.activeMinutes}
                onChange={(e) => setActivityForm({ ...activityForm, activeMinutes: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="caloriesBurned">Calories Burned</Label>
              <Input
                id="caloriesBurned"
                type="number"
                placeholder="0"
                value={activityForm.caloriesBurned}
                onChange={(e) => setActivityForm({ ...activityForm, caloriesBurned: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="distance">Distance (km)</Label>
              <Input
                id="distance"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={activityForm.distance}
                onChange={(e) => setActivityForm({ ...activityForm, distance: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLogDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleLogActivity}>
              <Plus className="w-4 h-4 mr-2" />
              Save Activity
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
