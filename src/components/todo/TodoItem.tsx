import { useState, useMemo } from "react";
import {
  Check,
  Clock,
  Edit,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  Plus,
  ChevronDown,
  ChevronUp,
  Palette,
  GripVertical,
  Calendar,
  Flame,
  Star,
  Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Task, Subtask, TaskCategory, CATEGORY_LABELS, CATEGORY_COLORS } from "@/types/todo";
import { useTaskTimer } from "@/hooks/useTaskTimer";
import { generateId } from "@/lib/utils-todo";
import { RecurringTaskBadge } from "./RecurringTaskBadge";
import { calculatePoints } from "@/lib/gamification";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface TodoItemProps {
  task: Task;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  showTimer?: boolean;
  showEstimatedTime?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  onDrop?: (e: React.DragEvent) => void;
}

const COLOR_PALETTE = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16",
  "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9",
  "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
  "#ec4899", "#f43f5e"
];

export const TodoItem = ({
  task,
  onUpdate,
  onDelete,
  showTimer = true,
  showEstimatedTime = true,
  onDragStart,
  onDragEnd,
  onDrop
}: TodoItemProps) => {
  const [expanded, setExpanded] = useState(true); // Changed to true to show subtasks by default
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editedSubtaskTitle, setEditedSubtaskTitle] = useState("");
  const [draggedSubtaskId, setDraggedSubtaskId] = useState<string | null>(null);

  const handleTimeUpdate = (taskId: string, timeSpent: number) => {
    onUpdate(taskId, { timeSpent });
  };

  const { timeSpent, isActive, start, pause, reset, formatTime } = useTaskTimer(
    task.id,
    task.timeSpent || 0,
    task.timerRunning,
    handleTimeUpdate
  );

  const handleToggleComplete = () => {
    if (task.status === "completed") {
      onUpdate(task.id, {
        status: "pending",
        completedAt: undefined
      });
    } else {
      onUpdate(task.id, {
        status: "completed",
        completedAt: new Date(),
        timerRunning: false
      });
      if (isActive) {
        pause();
      }
    }
  };

  const handleToggleTimer = () => {
    if (isActive) {
      pause();
      onUpdate(task.id, { timerRunning: false });
    } else {
      start();
      onUpdate(task.id, {
        timerRunning: true,
        timerStartedAt: new Date(),
        status: task.status === "pending" ? "in-progress" : task.status
      });
    }
  };

  const handleResetTimer = () => {
    reset();
    onUpdate(task.id, {
      timeSpent: 0,
      timerRunning: false,
      timerStartedAt: undefined
    });
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;

    const newSubtask: Subtask = {
      id: generateId(),
      title: newSubtaskTitle.trim(),
      completed: false
    };

    onUpdate(task.id, {
      subtasks: [...task.subtasks, newSubtask]
    });

    setNewSubtaskTitle("");
  };

  const handleToggleSubtask = (subtaskId: string) => {
    const updatedSubtasks = task.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    onUpdate(task.id, { subtasks: updatedSubtasks });
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    const updatedSubtasks = task.subtasks.filter((st) => st.id !== subtaskId);
    onUpdate(task.id, { subtasks: updatedSubtasks });
  };

  const handleEditSubtask = (subtaskId: string, title: string) => {
    setEditingSubtaskId(subtaskId);
    setEditedSubtaskTitle(title);
  };

  const handleSubtaskTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedSubtaskTitle(e.target.value);
  };

  const handleSubtaskTitleBlur = () => {
    if (editingSubtaskId && editedSubtaskTitle.trim()) {
      const updatedSubtasks = task.subtasks.map((st) =>
        st.id === editingSubtaskId ? { ...st, title: editedSubtaskTitle.trim() } : st
      );
      onUpdate(task.id, { subtasks: updatedSubtasks });
    }
    setEditingSubtaskId(null);
    setEditedSubtaskTitle("");
  };

  const handleSubtaskKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubtaskTitleBlur();
    } else if (e.key === "Escape") {
      setEditingSubtaskId(null);
      setEditedSubtaskTitle("");
    }
  };

  const handleSubtaskDragStart = (e: React.DragEvent, subtaskId: string) => {
    setDraggedSubtaskId(subtaskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleSubtaskDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleSubtaskDrop = (e: React.DragEvent, targetSubtaskId: string) => {
    e.preventDefault();

    if (!draggedSubtaskId || draggedSubtaskId === targetSubtaskId) {
      setDraggedSubtaskId(null);
      return;
    }

    const draggedIndex = task.subtasks.findIndex((st) => st.id === draggedSubtaskId);
    const targetIndex = task.subtasks.findIndex((st) => st.id === targetSubtaskId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedSubtaskId(null);
      return;
    }

    const newSubtasks = [...task.subtasks];
    const [draggedSubtask] = newSubtasks.splice(draggedIndex, 1);
    newSubtasks.splice(targetIndex, 0, draggedSubtask);

    onUpdate(task.id, { subtasks: newSubtasks });
    setDraggedSubtaskId(null);
  };

  const handleSubtaskDragEnd = () => {
    setDraggedSubtaskId(null);
  };

  const handleColorChange = (color: string) => {
    onUpdate(task.id, { color });
    setShowColorPicker(false);
  };

  const handleBgColorChange = (bgColor: string) => {
    onUpdate(task.id, {
      tags: [...(task.tags || []).filter(tag => !tag.startsWith('bg:')), `bg:${bgColor}`]
    });
    setShowBgColorPicker(false);
  };

  const handleCategoryChange = (category: TaskCategory) => {
    onUpdate(task.id, { category });
    setShowCategoryPicker(false);
  };

  const handleTitleClick = () => {
    if (task.status !== "completed") {
      setIsEditingTitle(true);
      setEditedTitle(task.title);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedTitle(e.target.value);
  };

  const handleTitleBlur = () => {
    if (editedTitle.trim() && editedTitle !== task.title) {
      onUpdate(task.id, { title: editedTitle.trim() });
    } else {
      setEditedTitle(task.title);
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleTitleBlur();
    } else if (e.key === "Escape") {
      setEditedTitle(task.title);
      setIsEditingTitle(false);
    }
  };

  const categoryColor = task.color || CATEGORY_COLORS[task.category];
  const bgColorTag = task.tags?.find(tag => tag.startsWith('bg:'));
  const taskBgColor = bgColorTag ? bgColorTag.replace('bg:', '') : undefined;
  const completedSubtasks = task.subtasks.filter(st => st.completed).length;
  const totalSubtasks = task.subtasks.length;

  const priorityColors = {
    low: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    medium: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    high: "bg-red-500/10 text-red-700 dark:text-red-400"
  };

  // Calculate potential XP for incomplete tasks
  const potentialXP = useMemo(() => {
    if (task.status === "completed") return null;
    return calculatePoints({ ...task, status: "completed", completedAt: new Date() });
  }, [task]);

  return (
    <Card
      className={cn(
        "p-4 transition-all duration-200 hover:shadow-md",
        task.status === "completed" && "opacity-60"
      )}
      style={{
        borderLeft: `4px solid ${categoryColor}`,
        backgroundColor: taskBgColor || undefined
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex items-center pt-1 cursor-grab active:cursor-grabbing select-none"
          draggable
          onDragStart={(e) => {
            // Prevent text selection during drag
            e.stopPropagation();
            if (onDragStart) {
              onDragStart(e);
            }
          }}
          onDragEnd={onDragEnd}
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>

        <Checkbox
          checked={task.status === "completed"}
          onCheckedChange={handleToggleComplete}
          className="mt-1"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              {isEditingTitle ? (
                <Input
                  value={editedTitle}
                  onChange={handleTitleChange}
                  onBlur={handleTitleBlur}
                  onKeyDown={handleTitleKeyDown}
                  className="font-medium text-lg h-auto p-1 -ml-1"
                  autoFocus
                />
              ) : (
                <h3
                  className={cn(
                    "font-medium text-lg cursor-pointer hover:bg-accent/50 rounded px-1 -ml-1 transition-colors",
                    task.status === "completed" && "line-through text-muted-foreground"
                  )}
                  onClick={handleTitleClick}
                  title="Click to edit"
                >
                  {task.title}
                </h3>
              )}
              {task.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {task.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Popover open={showBgColorPicker} onOpenChange={setShowBgColorPicker}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" title="Change background color">
                    <div className="h-4 w-4 rounded border-2 border-foreground" style={{ backgroundColor: taskBgColor || 'transparent' }} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3">
                  <div className="space-y-2">
                    <p className="text-xs font-medium">Background Color</p>
                    <div className="grid grid-cols-6 gap-2">
                      <button
                        className="h-8 w-8 rounded border-2 border-foreground hover:scale-110 transition-transform bg-transparent"
                        onClick={() => handleBgColorChange('transparent')}
                        title="No background"
                      >
                        <div className="w-full h-full flex items-center justify-center text-xs">✕</div>
                      </button>
                      {COLOR_PALETTE.map((color) => (
                        <button
                          key={color}
                          className="h-8 w-8 rounded border-2 border-background hover:scale-110 transition-transform"
                          style={{ backgroundColor: `${color}20` }}
                          onClick={() => handleBgColorChange(`${color}20`)}
                        />
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" title="Change border color">
                    <Palette className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3">
                  <div className="space-y-2">
                    <p className="text-xs font-medium">Border Color</p>
                    <div className="grid grid-cols-6 gap-2">
                      {COLOR_PALETTE.map((color) => (
                        <button
                          key={color}
                          className="h-8 w-8 rounded-full border-2 border-background hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                          onClick={() => handleColorChange(color)}
                        />
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Task</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this task? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(task.id)}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-3">
            <Badge variant="outline" className={priorityColors[task.priority]}>
              {task.priority}
            </Badge>

            <Popover open={showCategoryPicker} onOpenChange={setShowCategoryPicker}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-auto py-0.5 px-2.5 text-xs font-semibold"
                  title="Click to change category"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {CATEGORY_LABELS[task.category]}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-52 p-3">
                <div className="space-y-2">
                  <p className="text-xs font-medium">Change Category</p>
                  <Select value={task.category} onValueChange={handleCategoryChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(CATEGORY_LABELS) as TaskCategory[]).map((cat) => (
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
              </PopoverContent>
            </Popover>

            {showEstimatedTime && task.estimatedTime && (
              <Badge variant="secondary" className="gap-1">
                <Clock className="h-3 w-3" />
                {task.estimatedTime}m estimated
              </Badge>
            )}

            {showTimer && (
              <Badge variant="secondary" className="gap-1">
                <Clock className="h-3 w-3" />
                {formatTime()} spent
              </Badge>
            )}

            {totalSubtasks > 0 && (
              <Badge variant="secondary">
                {completedSubtasks}/{totalSubtasks} subtasks
              </Badge>
            )}

            {task.dueDate && (
              <Badge
                variant="outline"
                className={cn(
                  "gap-1",
                  new Date(task.dueDate) < new Date() && task.status !== "completed"
                    ? "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500"
                    : ""
                )}
              >
                <Calendar className="h-3 w-3" />
                Due: {new Date(task.dueDate).toLocaleDateString()}
              </Badge>
            )}

            {task.recurring && <RecurringTaskBadge recurring={task.recurring} />}

            {task.streak && task.streak.currentStreak > 0 && (
              <Badge variant="secondary" className="gap-1 bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700">
                <Flame className="h-3 w-3 text-orange-500" />
                {task.streak.currentStreak} day streak
              </Badge>
            )}

            {task.status === "completed" && task.points && task.points > 0 && (
              <Badge variant="secondary" className="gap-1 bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700">
                <Star className="h-3 w-3 text-yellow-500" />
                {task.points} XP
              </Badge>
            )}

            {task.status !== "completed" && potentialXP && potentialXP > 0 && (
              <Badge variant="outline" className="gap-1 bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400">
                <Star className="h-3 w-3" />
                +{potentialXP} XP
              </Badge>
            )}
          </div>

          {showTimer && task.status !== "completed" && (
            <div className="flex items-center gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleTimer}
                className="gap-2"
              >
                {isActive ? (
                  <>
                    <Pause className="h-4 w-4" />
                    Pause Timer
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Start Timer
                  </>
                )}
              </Button>

              {(timeSpent > 0 || isActive) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetTimer}
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              )}
            </div>
          )}

          {expanded && (
            <div className="mt-4 space-y-3 border-t pt-3">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Subtasks</h4>
                {task.subtasks.map((subtask) => (
                  <div
                    key={subtask.id}
                    draggable
                    onDragStart={(e) => handleSubtaskDragStart(e, subtask.id)}
                    onDragOver={handleSubtaskDragOver}
                    onDrop={(e) => handleSubtaskDrop(e, subtask.id)}
                    onDragEnd={handleSubtaskDragEnd}
                    className={cn(
                      "flex items-center gap-2 ml-2 transition-opacity",
                      draggedSubtaskId === subtask.id && "opacity-50"
                    )}
                  >
                    <div className="cursor-grab active:cursor-grabbing">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Checkbox
                      checked={subtask.completed}
                      onCheckedChange={() => handleToggleSubtask(subtask.id)}
                    />
                    {editingSubtaskId === subtask.id ? (
                      <Input
                        value={editedSubtaskTitle}
                        onChange={handleSubtaskTitleChange}
                        onBlur={handleSubtaskTitleBlur}
                        onKeyDown={handleSubtaskKeyDown}
                        className="h-7 text-sm flex-1"
                        autoFocus
                      />
                    ) : (
                      <span
                        className={cn(
                          "flex-1 text-sm cursor-pointer hover:bg-accent/50 rounded px-1 -ml-1 transition-colors",
                          subtask.completed && "line-through text-muted-foreground"
                        )}
                        onClick={() => handleEditSubtask(subtask.id, subtask.title)}
                        title="Click to edit"
                      >
                        {subtask.title}
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleDeleteSubtask(subtask.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}

                <div className="flex items-center gap-2 ml-2">
                  <Input
                    placeholder="Add subtask..."
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddSubtask()}
                    className="h-8 text-sm"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={handleAddSubtask}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
