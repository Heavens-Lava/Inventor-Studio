import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Habit,
  HabitCategory,
  HabitFrequency,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  FREQUENCY_LABELS,
} from "@/types/habit";
import { generateId } from "@/lib/utils-habit";

interface AddHabitFormProps {
  onAdd: (habit: Habit) => void;
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday", short: "Sun" },
  { value: 1, label: "Monday", short: "Mon" },
  { value: 2, label: "Tuesday", short: "Tue" },
  { value: 3, label: "Wednesday", short: "Wed" },
  { value: 4, label: "Thursday", short: "Thu" },
  { value: 5, label: "Friday", short: "Fri" },
  { value: 6, label: "Saturday", short: "Sat" },
];

export const AddHabitForm = ({ onAdd }: AddHabitFormProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<HabitCategory>("health");
  const [frequency, setFrequency] = useState<HabitFrequency>("daily");
  const [customDays, setCustomDays] = useState<number[]>([]);
  const [estimatedTime, setEstimatedTime] = useState("");
  const [enableReminder, setEnableReminder] = useState(false);
  const [reminderTime, setReminderTime] = useState("09:00");
  const [enableFinancialGoal, setEnableFinancialGoal] = useState(false);
  const [financialType, setFinancialType] = useState<"saving" | "spending" | "budgeting">(
    "saving"
  );
  const [targetAmount, setTargetAmount] = useState("");
  const [tags, setTags] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) return;

    const newHabit: Habit = {
      id: generateId(),
      name: name.trim(),
      description: description.trim() || undefined,
      category,
      status: "active",
      frequency,
      customDays: frequency === "custom" ? customDays : undefined,
      estimatedTime: estimatedTime ? parseInt(estimatedTime) : undefined,
      completions: [],
      totalCompletions: 0,
      totalTimeSpent: 0,
      createdAt: new Date(),
      tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
      reminder:
        enableReminder
          ? {
              enabled: true,
              time: reminderTime,
              days: frequency === "custom" ? customDays : undefined,
            }
          : undefined,
      financialGoal: enableFinancialGoal
        ? {
            type: financialType,
            targetAmount: targetAmount ? parseFloat(targetAmount) : undefined,
            currentAmount: 0,
            currency: "USD",
          }
        : undefined,
    };

    onAdd(newHabit);
    handleReset();
    setOpen(false);
  };

  const handleReset = () => {
    setName("");
    setDescription("");
    setCategory("health");
    setFrequency("daily");
    setCustomDays([]);
    setEstimatedTime("");
    setEnableReminder(false);
    setReminderTime("09:00");
    setEnableFinancialGoal(false);
    setFinancialType("saving");
    setTargetAmount("");
    setTags("");
  };

  const toggleCustomDay = (day: number) => {
    setCustomDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort((a, b) => a - b)
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Habit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Habit</DialogTitle>
          <DialogDescription>
            Create a new habit to track and build consistency
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Habit Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Habit Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Morning Exercise, Read for 30 minutes"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional description of your habit..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as HabitCategory)}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(CATEGORY_LABELS) as HabitCategory[]).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: CATEGORY_COLORS[cat] }}
                      />
                      {CATEGORY_LABELS[cat]}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select value={frequency} onValueChange={(v) => setFrequency(v as HabitFrequency)}>
              <SelectTrigger id="frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(FREQUENCY_LABELS) as HabitFrequency[]).map((freq) => (
                  <SelectItem key={freq} value={freq}>
                    {FREQUENCY_LABELS[freq]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Days Selection */}
          {frequency === "custom" && (
            <div className="space-y-2">
              <Label>Select Days</Label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <Button
                    key={day.value}
                    type="button"
                    variant={customDays.includes(day.value) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleCustomDay(day.value)}
                    className="w-16"
                  >
                    {day.short}
                  </Button>
                ))}
              </div>
              {customDays.length === 0 && (
                <p className="text-xs text-muted-foreground">Please select at least one day</p>
              )}
            </div>
          )}

          {/* Estimated Time */}
          <div className="space-y-2">
            <Label htmlFor="estimatedTime">Estimated Time (minutes)</Label>
            <Input
              id="estimatedTime"
              type="number"
              min="1"
              placeholder="e.g., 30"
              value={estimatedTime}
              onChange={(e) => setEstimatedTime(e.target.value)}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              placeholder="e.g., morning, wellness, routine"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          {/* Reminder Toggle */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="enableReminder"
              checked={enableReminder}
              onCheckedChange={(checked) => setEnableReminder(checked as boolean)}
            />
            <Label htmlFor="enableReminder" className="cursor-pointer">
              Enable Reminder
            </Label>
          </div>

          {enableReminder && (
            <div className="space-y-2 ml-6">
              <Label htmlFor="reminderTime">Reminder Time</Label>
              <Input
                id="reminderTime"
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
              />
            </div>
          )}

          {/* Financial Goal Toggle */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="enableFinancialGoal"
              checked={enableFinancialGoal}
              onCheckedChange={(checked) => setEnableFinancialGoal(checked as boolean)}
            />
            <Label htmlFor="enableFinancialGoal" className="cursor-pointer">
              Track Financial Goal
            </Label>
          </div>

          {enableFinancialGoal && (
            <div className="space-y-3 ml-6">
              <div className="space-y-2">
                <Label htmlFor="financialType">Goal Type</Label>
                <Select
                  value={financialType}
                  onValueChange={(v) => setFinancialType(v as "saving" | "spending" | "budgeting")}
                >
                  <SelectTrigger id="financialType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="saving">Saving</SelectItem>
                    <SelectItem value="spending">Spending Limit</SelectItem>
                    <SelectItem value="budgeting">Budgeting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetAmount">Target Amount ($)</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g., 1000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              handleReset();
              setOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !name.trim() || (frequency === "custom" && customDays.length === 0)
            }
          >
            Add Habit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
