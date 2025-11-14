import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFitnessData } from "@/hooks/useFitnessData";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Workout, WorkoutType } from "@/types/fitness";
import {
  ArrowLeft,
  Plus,
  Dumbbell,
  Calendar,
  Clock,
  Flame,
  TrendingUp,
  Trash2,
  Edit,
} from "lucide-react";
import { toast } from "sonner";

const workoutTypeOptions: { value: WorkoutType; label: string; emoji: string }[] = [
  { value: "cardio", label: "Cardio", emoji: "🏃" },
  { value: "strength", label: "Strength Training", emoji: "💪" },
  { value: "flexibility", label: "Flexibility", emoji: "🧘" },
  { value: "yoga", label: "Yoga", emoji: "🕉️" },
  { value: "hiit", label: "HIIT", emoji: "⚡" },
  { value: "sports", label: "Sports", emoji: "⚽" },
  { value: "running", label: "Running", emoji: "🏃‍♂️" },
  { value: "cycling", label: "Cycling", emoji: "🚴" },
  { value: "swimming", label: "Swimming", emoji: "🏊" },
  { value: "walking", label: "Walking", emoji: "🚶" },
  { value: "custom", label: "Custom", emoji: "✨" },
];

const intensityOptions = [
  { value: "low", label: "Low", color: "bg-green-100 text-green-800" },
  { value: "moderate", label: "Moderate", color: "bg-yellow-100 text-yellow-800" },
  { value: "high", label: "High", color: "bg-orange-100 text-orange-800" },
  { value: "extreme", label: "Extreme", color: "bg-red-100 text-red-800" },
];

const feelingOptions = [
  { value: "terrible", label: "Terrible", emoji: "😫" },
  { value: "bad", label: "Bad", emoji: "😞" },
  { value: "okay", label: "Okay", emoji: "😐" },
  { value: "good", label: "Good", emoji: "🙂" },
  { value: "great", label: "Great", emoji: "😊" },
  { value: "amazing", label: "Amazing", emoji: "🤩" },
];

export default function WorkoutTracker() {
  const navigate = useNavigate();
  const { data, addWorkout, deleteWorkout } = useFitnessData();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "cardio" as WorkoutType,
    name: "",
    duration: "",
    caloriesBurned: "",
    intensity: "moderate" as const,
    feeling: "good" as const,
    notes: "",
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.duration) {
      toast.error("Please fill in workout name and duration");
      return;
    }

    const duration = parseInt(formData.duration);
    const calories = parseInt(formData.caloriesBurned) || Math.floor(duration * 5); // Estimate 5 cal/min

    addWorkout({
      date: formData.date,
      type: formData.type,
      name: formData.name,
      duration,
      caloriesBurned: calories,
      exercises: [],
      intensity: formData.intensity,
      feeling: formData.feeling,
      notes: formData.notes,
    });

    toast.success("Workout logged successfully! 💪");
    setShowAddDialog(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split("T")[0],
      type: "cardio",
      name: "",
      duration: "",
      caloriesBurned: "",
      intensity: "moderate",
      feeling: "good",
      notes: "",
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this workout?")) {
      deleteWorkout(id);
      toast.success("Workout deleted");
    }
  };

  // Group workouts by date
  const workoutsByDate = data.workouts.reduce((acc, workout) => {
    if (!acc[workout.date]) {
      acc[workout.date] = [];
    }
    acc[workout.date].push(workout);
    return acc;
  }, {} as Record<string, Workout[]>);

  const sortedDates = Object.keys(workoutsByDate).sort((a, b) => b.localeCompare(a));

  // Calculate stats
  const totalWorkouts = data.workouts.length;
  const totalMinutes = data.workouts.reduce((sum, w) => sum + w.duration, 0);
  const totalCalories = data.workouts.reduce((sum, w) => sum + w.caloriesBurned, 0);
  const thisWeekWorkouts = data.workouts.filter((w) => {
    const date = new Date(w.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return date >= weekAgo;
  }).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/fitness")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Dumbbell className="w-6 h-6 text-purple-500" />
                  Workout Tracker
                </h1>
                <p className="text-sm text-muted-foreground">Track and manage your workouts</p>
              </div>
            </div>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Workout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 pb-24 md:pb-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Dumbbell className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-muted-foreground">Total Workouts</span>
            </div>
            <div className="text-2xl font-bold">{totalWorkouts}</div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Total Time</span>
            </div>
            <div className="text-2xl font-bold">{totalMinutes}</div>
            <div className="text-xs text-muted-foreground">minutes</div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-muted-foreground">Calories Burned</span>
            </div>
            <div className="text-2xl font-bold">{totalCalories.toLocaleString()}</div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-muted-foreground">This Week</span>
            </div>
            <div className="text-2xl font-bold">{thisWeekWorkouts}</div>
            <div className="text-xs text-muted-foreground">workouts</div>
          </Card>
        </div>

        {/* Workout History */}
        {sortedDates.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-purple-100 dark:bg-purple-900">
                <Dumbbell className="w-12 h-12 text-purple-500" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">No workouts yet</h3>
            <p className="text-muted-foreground mb-6">
              Start your fitness journey by logging your first workout!
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Log Your First Workout
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {sortedDates.map((date) => {
              const workouts = workoutsByDate[date];
              const dateObj = new Date(date);
              const isToday = date === new Date().toISOString().split("T")[0];

              return (
                <div key={date}>
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <h3 className="font-semibold">
                      {isToday ? "Today" : dateObj.toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                    </h3>
                    <Badge variant="secondary">{workouts.length} workouts</Badge>
                  </div>

                  <div className="space-y-3">
                    {workouts.map((workout) => {
                      const typeOption = workoutTypeOptions.find((t) => t.value === workout.type);
                      const intensityOption = intensityOptions.find((i) => i.value === workout.intensity);
                      const feelingOption = feelingOptions.find((f) => f.value === workout.feeling);

                      return (
                        <Card key={workout.id} className="p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xl">{typeOption?.emoji}</span>
                                <h4 className="font-semibold text-lg">{workout.name}</h4>
                                <Badge className={intensityOption?.color}>
                                  {workout.intensity}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                                <div>
                                  <div className="text-sm text-muted-foreground">Duration</div>
                                  <div className="font-medium">{workout.duration} min</div>
                                </div>
                                <div>
                                  <div className="text-sm text-muted-foreground">Calories</div>
                                  <div className="font-medium">{workout.caloriesBurned}</div>
                                </div>
                                <div>
                                  <div className="text-sm text-muted-foreground">Type</div>
                                  <div className="font-medium">{typeOption?.label}</div>
                                </div>
                                <div>
                                  <div className="text-sm text-muted-foreground">Feeling</div>
                                  <div className="font-medium">
                                    {feelingOption?.emoji} {feelingOption?.label}
                                  </div>
                                </div>
                              </div>

                              {workout.notes && (
                                <div className="text-sm text-muted-foreground mt-2 p-2 bg-secondary rounded">
                                  {workout.notes}
                                </div>
                              )}

                              <div className="mt-2 text-sm font-medium text-blue-500">
                                +{workout.xpEarned} XP Earned
                              </div>
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(workout.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Workout Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Log Workout</DialogTitle>
            <DialogDescription>
              Record your workout details to track your progress and earn XP
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Workout Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as WorkoutType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {workoutTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.emoji} {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Workout Name</Label>
              <Input
                id="name"
                placeholder="e.g., Morning Run, Chest Day, Yoga Session"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="30"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="calories">Calories Burned (optional)</Label>
                <Input
                  id="calories"
                  type="number"
                  placeholder="Auto-calculated if empty"
                  value={formData.caloriesBurned}
                  onChange={(e) => setFormData({ ...formData, caloriesBurned: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Intensity</Label>
              <div className="grid grid-cols-4 gap-2">
                {intensityOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={formData.intensity === option.value ? "default" : "outline"}
                    onClick={() => setFormData({ ...formData, intensity: option.value as any })}
                    className="w-full"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>How did you feel?</Label>
              <div className="grid grid-cols-3 gap-2">
                {feelingOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={formData.feeling === option.value ? "default" : "outline"}
                    onClick={() => setFormData({ ...formData, feeling: option.value as any })}
                    className="w-full"
                  >
                    {option.emoji} {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="How was the workout? Any personal records?"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              <Plus className="w-4 h-4 mr-2" />
              Log Workout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
