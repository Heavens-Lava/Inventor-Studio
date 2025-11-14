import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
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
import { ArrowLeft, Target } from "lucide-react";
import { useGoalStorage } from "@/hooks/useGoalStorage";
import { generateGoalId } from "@/lib/utils-goal";
import {
  Goal,
  GoalType,
  GoalTimeframe,
  GoalPriority,
  GoalStatus,
  GOAL_TYPE_LABELS,
  GOAL_TIMEFRAME_LABELS,
  GOAL_PRIORITY_LABELS,
} from "@/types/goal";
import { toast } from "sonner";

const CreateGoal = () => {
  const navigate = useNavigate();
  const { addGoal } = useGoalStorage();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<GoalType>("major");
  const [timeframe, setTimeframe] = useState<GoalTimeframe>("short-term");
  const [priority, setPriority] = useState<GoalPriority>("medium");
  const [targetDate, setTargetDate] = useState("");
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error("Please enter a goal title");
      return;
    }

    const newGoal: Goal = {
      id: generateGoalId(),
      title: title.trim(),
      description: description.trim() || undefined,
      type,
      timeframe,
      priority,
      status: "not-started",
      subgoals: [],
      requirements: [],
      costs: [],
      milestones: [],
      progress: 0,
      feedback: [],
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0),
      category: category.trim() || undefined,
      isPrivate: false,
      targetDate: targetDate ? new Date(targetDate) : undefined,
      createdAt: new Date(),
    };

    addGoal(newGoal);
    toast.success(`Goal "${newGoal.title}" created successfully!`);
    navigate(`/goals/${newGoal.id}/edit`);
  };

  return (
    <AppLayout title="Create New Goal" containerClassName="max-w-4xl" className="pb-20">
        <Button
          variant="ghost"
          onClick={() => navigate("/goals")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Goals
        </Button>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Target className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Create a New Goal</h2>
          </div>

          <div className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Goal Title <span className="text-red-600">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Enter your goal..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your goal in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            {/* Type and Timeframe */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Goal Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as GoalType)}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(GOAL_TYPE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeframe">Timeframe</Label>
                <Select
                  value={timeframe}
                  onValueChange={(v) => setTimeframe(v as GoalTimeframe)}
                >
                  <SelectTrigger id="timeframe">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(GOAL_TIMEFRAME_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Priority and Target Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={priority}
                  onValueChange={(v) => setPriority(v as GoalPriority)}
                >
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(GOAL_PRIORITY_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetDate">Target Date (Optional)</Label>
                <Input
                  id="targetDate"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                />
              </div>
            </div>

            {/* Category and Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category (Optional)</Label>
                <Input
                  id="category"
                  placeholder="e.g., Career, Health, Finance"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (Optional)</Label>
                <Input
                  id="tags"
                  placeholder="Separate with commas"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  E.g., personal, work, urgent
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => navigate("/goals")} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={!title.trim()} className="flex-1">
                Create Goal & Add Details
              </Button>
            </div>
          </div>
        </Card>

        {/* Info Box */}
        <Card className="p-4 mt-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            After creating your goal, you'll be able to add subgoals, milestones, requirements,
            costs, planning notes, and track your progress in detail.
          </p>
        </Card>
    </AppLayout>
  );
};

export default CreateGoal;
