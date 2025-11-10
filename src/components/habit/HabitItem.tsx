import { useState } from "react";
import { Habit, CATEGORY_COLORS, CATEGORY_LABELS, CATEGORY_ICONS } from "@/types/habit";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Circle,
  Trash2,
  Edit,
  GripVertical,
  Clock,
  Flame,
  Calendar,
  Play,
  Pause,
  Archive,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { isCompletedToday, getTodayCompletionCount } from "@/lib/gamification-habits";
import { formatTimeSpent, getWeeklyCompletionPercentage } from "@/lib/utils-habit";
import { format } from "date-fns";

interface HabitItemProps {
  habit: Habit;
  onComplete: (habitId: string, timeSpent?: number, notes?: string) => void;
  onUpdate: (id: string, updates: Partial<Habit>) => void;
  onDelete: (id: string) => void;
  showTimeTracking?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  onDrop?: (e: React.DragEvent) => void;
}

export const HabitItem = ({
  habit,
  onComplete,
  onUpdate,
  onDelete,
  showTimeTracking = true,
  onDragStart,
  onDragEnd,
  onDrop,
}: HabitItemProps) => {
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [completionTimeSpent, setCompletionTimeSpent] = useState("");
  const [completionNotes, setCompletionNotes] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const completedToday = isCompletedToday(habit);
  const todayCount = getTodayCompletionCount(habit);
  const weeklyPercentage = getWeeklyCompletionPercentage(habit);

  const handleCompleteClick = () => {
    setShowCompleteDialog(true);
    setCompletionTimeSpent("");
    setCompletionNotes("");
  };

  const handleConfirmComplete = () => {
    const timeSpent = completionTimeSpent ? parseInt(completionTimeSpent) : undefined;
    onComplete(habit.id, timeSpent, completionNotes || undefined);
    setShowCompleteDialog(false);
  };

  const handleStatusChange = (status: "active" | "paused" | "archived") => {
    onUpdate(habit.id, { status });
  };

  const categoryColor = CATEGORY_COLORS[habit.category];

  return (
    <>
      <Card
        className="p-4 hover:shadow-lg transition-shadow"
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
      >
        <div className="flex items-start gap-3">
          {/* Drag Handle */}
          <div
            className="flex items-center pt-1 cursor-grab active:cursor-grabbing select-none"
            draggable
            onDragStart={(e) => {
              e.stopPropagation();
              if (onDragStart) {
                onDragStart(e);
              }
            }}
            onDragEnd={onDragEnd}
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* Complete Button */}
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-auto hover:bg-transparent"
            onClick={handleCompleteClick}
            disabled={habit.status !== "active"}
          >
            {completedToday ? (
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            ) : (
              <Circle className="h-6 w-6 text-muted-foreground hover:text-green-600" />
            )}
          </Button>

          {/* Habit Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg truncate">{habit.name}</h3>
                  <span className="text-xl flex-shrink-0">
                    {CATEGORY_ICONS[habit.category]}
                  </span>
                </div>
                {habit.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {habit.description}
                  </p>
                )}
              </div>

              {/* Actions Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => {}}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Habit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {habit.status === "active" && (
                    <DropdownMenuItem onClick={() => handleStatusChange("paused")}>
                      <Pause className="h-4 w-4 mr-2" />
                      Pause Habit
                    </DropdownMenuItem>
                  )}
                  {habit.status === "paused" && (
                    <DropdownMenuItem onClick={() => handleStatusChange("active")}>
                      <Play className="h-4 w-4 mr-2" />
                      Resume Habit
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => handleStatusChange("archived")}>
                    <Archive className="h-4 w-4 mr-2" />
                    Archive Habit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Habit
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Badges and Stats */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge
                variant="outline"
                style={{
                  borderColor: categoryColor,
                  color: categoryColor,
                }}
              >
                {CATEGORY_LABELS[habit.category]}
              </Badge>

              {habit.frequency && (
                <Badge variant="secondary">
                  <Calendar className="h-3 w-3 mr-1" />
                  {habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)}
                </Badge>
              )}

              {habit.streak && habit.streak.currentStreak > 0 && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                  <Flame className="h-3 w-3 mr-1" />
                  {habit.streak.currentStreak} day streak
                </Badge>
              )}

              {completedToday && todayCount > 1 && (
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  ✓ {todayCount}x today
                </Badge>
              )}

              {habit.status !== "active" && (
                <Badge variant="secondary">
                  {habit.status === "paused" ? "Paused" : "Archived"}
                </Badge>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Weekly Progress</span>
                <span>{Math.round(weeklyPercentage)}%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                  style={{ width: `${weeklyPercentage}%` }}
                />
              </div>
            </div>

            {/* Additional Stats */}
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              {showTimeTracking && habit.totalTimeSpent !== undefined && habit.totalTimeSpent > 0 && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatTimeSpent(habit.totalTimeSpent)} total</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                <span>{habit.totalCompletions} completions</span>
              </div>
              {habit.streak && habit.streak.longestStreak > 0 && (
                <div className="flex items-center gap-1">
                  <Flame className="h-3 w-3" />
                  <span>{habit.streak.longestStreak} longest streak</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Complete Habit Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Habit</DialogTitle>
            <DialogDescription>
              Mark &quot;{habit.name}&quot; as completed for today
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {showTimeTracking && (
              <div className="space-y-2">
                <Label htmlFor="timeSpent">Time Spent (minutes)</Label>
                <Input
                  id="timeSpent"
                  type="number"
                  min="0"
                  placeholder="Optional"
                  value={completionTimeSpent}
                  onChange={(e) => setCompletionTimeSpent(e.target.value)}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Optional notes or reflections..."
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompleteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmComplete}>Complete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Habit</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{habit.name}&quot;? This action cannot be
              undone and will remove all completion history.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDelete(habit.id);
                setShowDeleteDialog(false);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
