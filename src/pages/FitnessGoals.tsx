import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFitnessData } from "@/hooks/useFitnessData";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
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
import {
  ArrowLeft,
  Target,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  Trophy,
  TrendingUp,
  Calendar,
  Flag,
} from "lucide-react";
import { toast } from "sonner";
import { Goal } from "@/types/fitness";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const goalTypes = [
  { value: "weight", label: "Weight Goal", emoji: "⚖️", unit: "kg" },
  { value: "fitness", label: "Fitness Milestone", emoji: "🏃", unit: "" },
  { value: "habit", label: "Habit Goal", emoji: "📅", unit: "days" },
  { value: "nutrition", label: "Nutrition Goal", emoji: "🥗", unit: "" },
  { value: "activity", label: "Activity Goal", emoji: "🎯", unit: "" },
];

export default function FitnessGoals() {
  const navigate = useNavigate();
  const { data, addGoal, updateGoal, deleteGoal } = useFitnessData();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const [goalForm, setGoalForm] = useState({
    type: "weight" as Goal["type"],
    name: "",
    description: "",
    target: "",
    current: "",
    unit: "kg",
    targetDate: "",
  });

  const resetForm = () => {
    setGoalForm({
      type: "weight",
      name: "",
      description: "",
      target: "",
      current: "",
      unit: "kg",
      targetDate: "",
    });
  };

  const handleCreateGoal = () => {
    if (!goalForm.name || !goalForm.target) {
      toast.error("Please fill in goal name and target");
      return;
    }

    const target = parseFloat(goalForm.target);
    const current = parseFloat(goalForm.current) || 0;

    const newGoal = addGoal({
      type: goalForm.type,
      name: goalForm.name,
      description: goalForm.description,
      target,
      current,
      unit: goalForm.unit,
      startDate: new Date().toISOString().split("T")[0],
      targetDate: goalForm.targetDate,
      milestones: [],
      isCompleted: false,
    });

    toast.success("Goal created! 🎯");
    setShowCreateDialog(false);
    resetForm();
  };

  const handleUpdateProgress = (goalId: string, newCurrent: number) => {
    const goal = data.goals.find((g) => g.id === goalId);
    if (!goal) return;

    const isCompleted = newCurrent >= goal.target;

    updateGoal(goalId, {
      current: newCurrent,
      isCompleted,
      completedAt: isCompleted ? new Date().toISOString() : undefined,
    });

    if (isCompleted && !goal.isCompleted) {
      toast.success("Goal completed! Congratulations! 🎉");
    } else {
      toast.success("Progress updated! 📈");
    }
  };

  const handleEditGoal = () => {
    if (!selectedGoal) return;

    updateGoal(selectedGoal.id, {
      name: goalForm.name,
      description: goalForm.description,
      target: parseFloat(goalForm.target),
      targetDate: goalForm.targetDate,
    });

    toast.success("Goal updated! ✨");
    setShowEditDialog(false);
    setSelectedGoal(null);
    resetForm();
  };

  const handleDeleteGoal = (goalId: string) => {
    if (window.confirm("Are you sure you want to delete this goal?")) {
      deleteGoal(goalId);
      toast.success("Goal deleted");
    }
  };

  const openEditDialog = (goal: Goal) => {
    setSelectedGoal(goal);
    setGoalForm({
      type: goal.type,
      name: goal.name,
      description: goal.description || "",
      target: goal.target.toString(),
      current: goal.current.toString(),
      unit: goal.unit,
      targetDate: goal.targetDate,
    });
    setShowEditDialog(true);
  };

  const activeGoals = data.goals.filter((g) => !g.isCompleted);
  const completedGoals = data.goals.filter((g) => g.isCompleted);

  const getGoalProgress = (goal: Goal) => {
    return Math.min(100, (goal.current / goal.target) * 100);
  };

  const getDaysRemaining = (targetDate: string) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getGoalTypeInfo = (type: Goal["type"]) => {
    return goalTypes.find((t) => t.value === type) || goalTypes[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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
                  <Target className="w-6 h-6 text-green-500" />
                  Fitness Goals
                </h1>
                <p className="text-sm text-muted-foreground">Set and track your fitness goals</p>
              </div>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Goal
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 pb-24 md:pb-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Total Goals</span>
            </div>
            <div className="text-2xl font-bold">{data.goals.length}</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Active</span>
            </div>
            <div className="text-2xl font-bold">{activeGoals.length}</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-muted-foreground">Completed</span>
            </div>
            <div className="text-2xl font-bold">{completedGoals.length}</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-muted-foreground">Success Rate</span>
            </div>
            <div className="text-2xl font-bold">
              {data.goals.length > 0
                ? Math.round((completedGoals.length / data.goals.length) * 100)
                : 0}%
            </div>
          </Card>
        </div>

        {/* Goals Tabs */}
        <Card className="p-6">
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active">
                Active Goals ({activeGoals.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({completedGoals.length})
              </TabsTrigger>
            </TabsList>

            {/* Active Goals */}
            <TabsContent value="active" className="mt-6">
              {activeGoals.length === 0 ? (
                <div className="text-center py-12">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 rounded-full bg-green-100 dark:bg-green-900">
                      <Target className="w-12 h-12 text-green-500" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No Active Goals</h3>
                  <p className="text-muted-foreground mb-6">
                    Set your first fitness goal to start your journey!
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Goal
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeGoals.map((goal) => {
                    const typeInfo = getGoalTypeInfo(goal.type);
                    const progress = getGoalProgress(goal);
                    const daysRemaining = goal.targetDate ? getDaysRemaining(goal.targetDate) : null;

                    return (
                      <Card key={goal.id} className="p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-2xl">{typeInfo.emoji}</span>
                              <h3 className="text-xl font-semibold">{goal.name}</h3>
                              <Badge variant="secondary">{typeInfo.label}</Badge>
                            </div>
                            {goal.description && (
                              <p className="text-sm text-muted-foreground mb-3">
                                {goal.description}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(goal)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteGoal(goal.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {/* Progress */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">Progress</span>
                              <span className="text-sm text-muted-foreground">
                                {goal.current} / {goal.target} {goal.unit}
                              </span>
                            </div>
                            <Progress value={progress} className="h-3" />
                            <div className="text-xs text-center text-muted-foreground mt-1">
                              {Math.round(progress)}% Complete
                            </div>
                          </div>

                          {/* Update Progress */}
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              placeholder={`Current: ${goal.current}`}
                              id={`progress-${goal.id}`}
                              className="flex-1"
                            />
                            <Button
                              onClick={() => {
                                const input = document.getElementById(
                                  `progress-${goal.id}`
                                ) as HTMLInputElement;
                                const newValue = parseFloat(input.value);
                                if (newValue && !isNaN(newValue)) {
                                  handleUpdateProgress(goal.id, newValue);
                                  input.value = "";
                                }
                              }}
                            >
                              Update
                            </Button>
                          </div>

                          {/* Info Row */}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>Started {new Date(goal.startDate).toLocaleDateString()}</span>
                            </div>
                            {daysRemaining !== null && (
                              <div className="flex items-center gap-1">
                                <Flag className="w-4 h-4" />
                                <span
                                  className={
                                    daysRemaining < 7
                                      ? "text-red-500 font-medium"
                                      : daysRemaining < 30
                                      ? "text-yellow-600 font-medium"
                                      : ""
                                  }
                                >
                                  {daysRemaining > 0
                                    ? `${daysRemaining} days left`
                                    : daysRemaining === 0
                                    ? "Due today!"
                                    : "Overdue"}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Completed Goals */}
            <TabsContent value="completed" className="mt-6">
              {completedGoals.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No completed goals yet. Keep working towards your active goals!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {completedGoals.map((goal) => {
                    const typeInfo = getGoalTypeInfo(goal.type);

                    return (
                      <Card
                        key={goal.id}
                        className="p-6 border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle2 className="w-6 h-6 text-green-500" />
                              <span className="text-xl">{typeInfo.emoji}</span>
                              <h3 className="text-xl font-semibold">{goal.name}</h3>
                              <Badge className="bg-green-500">Completed</Badge>
                            </div>
                            {goal.description && (
                              <p className="text-sm text-muted-foreground mb-3">
                                {goal.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div>
                                Achieved: {goal.current} {goal.unit}
                              </div>
                              {goal.completedAt && (
                                <div className="flex items-center gap-1">
                                  <Trophy className="w-4 h-4 text-yellow-500" />
                                  <span>
                                    Completed {new Date(goal.completedAt).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      {/* Create Goal Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Goal</DialogTitle>
            <DialogDescription>
              Set a new fitness goal and track your progress
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="goalType">Goal Type</Label>
              <Select
                value={goalForm.type}
                onValueChange={(value) => {
                  const typeInfo = goalTypes.find((t) => t.value === value);
                  setGoalForm({
                    ...goalForm,
                    type: value as Goal["type"],
                    unit: typeInfo?.unit || "",
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {goalTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.emoji} {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goalName">Goal Name</Label>
              <Input
                id="goalName"
                placeholder="e.g., Lose 10kg, Run 5km, Workout 5x per week"
                value={goalForm.name}
                onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goalDescription">Description (optional)</Label>
              <Textarea
                id="goalDescription"
                placeholder="What motivates you to achieve this goal?"
                value={goalForm.description}
                onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="current">Current Value</Label>
                <div className="flex gap-2">
                  <Input
                    id="current"
                    type="number"
                    placeholder="0"
                    value={goalForm.current}
                    onChange={(e) => setGoalForm({ ...goalForm, current: e.target.value })}
                  />
                  {goalForm.unit && (
                    <span className="flex items-center px-3 bg-secondary rounded-md text-sm">
                      {goalForm.unit}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target">Target Value</Label>
                <div className="flex gap-2">
                  <Input
                    id="target"
                    type="number"
                    placeholder="100"
                    value={goalForm.target}
                    onChange={(e) => setGoalForm({ ...goalForm, target: e.target.value })}
                  />
                  {goalForm.unit && (
                    <span className="flex items-center px-3 bg-secondary rounded-md text-sm">
                      {goalForm.unit}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetDate">Target Date</Label>
              <Input
                id="targetDate"
                type="date"
                value={goalForm.targetDate}
                onChange={(e) => setGoalForm({ ...goalForm, targetDate: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateGoal}>
              <Plus className="w-4 h-4 mr-2" />
              Create Goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Goal Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Goal</DialogTitle>
            <DialogDescription>Update your goal details</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editGoalName">Goal Name</Label>
              <Input
                id="editGoalName"
                value={goalForm.name}
                onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editGoalDescription">Description</Label>
              <Textarea
                id="editGoalDescription"
                value={goalForm.description}
                onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editTarget">Target Value</Label>
              <div className="flex gap-2">
                <Input
                  id="editTarget"
                  type="number"
                  value={goalForm.target}
                  onChange={(e) => setGoalForm({ ...goalForm, target: e.target.value })}
                />
                {goalForm.unit && (
                  <span className="flex items-center px-3 bg-secondary rounded-md text-sm">
                    {goalForm.unit}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editTargetDate">Target Date</Label>
              <Input
                id="editTargetDate"
                type="date"
                value={goalForm.targetDate}
                onChange={(e) => setGoalForm({ ...goalForm, targetDate: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditGoal}>
              <Edit className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
