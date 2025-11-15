import { useState, useMemo, useEffect } from "react";
import AppHeader from "@/components/AppHeader";
import { AddTodoForm } from "@/components/todo/AddTodoForm";
import { QuickAddTask } from "@/components/todo/QuickAddTask";
import { TodoItem } from "@/components/todo/TodoItem";
import { TodoFilters } from "@/components/todo/TodoFilters";
import { TodoSettings } from "@/components/todo/TodoSettings";
import { ExportImport } from "@/components/todo/ExportImport";
import { useTodoStorage } from "@/hooks/useTodoStorage";
import { Task, TodoFilter, UserStats } from "@/types/todo";
import { toast } from "sonner";
import {
  calculatePoints,
  calculateLevel,
  BADGES,
  checkBadgeEarned,
  updateStreakData,
  calculateRecurringNextDue,
} from "@/lib/gamification";
import { generateId } from "@/lib/utils-todo";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BACKGROUND_GRADIENTS: Record<string, string> = {
  default: "",
  "gradient-blue":
    "bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-blue-950 dark:via-cyan-950 dark:to-blue-900",
  "gradient-purple":
    "bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 dark:from-purple-950 dark:via-pink-950 dark:to-purple-900",
  "gradient-green":
    "bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 dark:from-green-950 dark:via-emerald-950 dark:to-green-900",
  "gradient-orange":
    "bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-orange-950 dark:via-amber-950 dark:to-orange-900",
  "gradient-pink":
    "bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 dark:from-pink-950 dark:via-rose-950 dark:to-pink-900",
};

const TodoApp = () => {
  const navigate = useNavigate();
  const {
    tasks,
    settings,
    isLoaded,
    addTask,
    updateTask,
    deleteTask,
    reorderTasks,
    updateSettings,
  } = useTodoStorage();

  const [filter, setFilter] = useState<TodoFilter>({});
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  // Initialize user stats if not present
  useEffect(() => {
    if (isLoaded && !settings.userStats) {
      updateSettings({
        enableGamification: true,
        userStats: {
          totalPoints: 0,
          level: 1,
          badges: BADGES.map((b) => ({ ...b })),
          tasksCompleted: 0,
          currentStreak: 0,
          longestStreak: 0,
        },
      });
    }
  }, [isLoaded, settings.userStats, updateSettings]);

  // Calculate user stats from tasks
  const userStats: UserStats = useMemo(() => {
    if (!settings.userStats) {
      return {
        totalPoints: 0,
        level: 1,
        badges: BADGES.map((b) => ({ ...b })),
        tasksCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
      };
    }

    const completedTasks = tasks.filter((t) => t.status === "completed");
    const totalPoints = completedTasks.reduce(
      (sum, task) => sum + (task.points || 0),
      0
    );
    const level = calculateLevel(totalPoints);

    // Calculate current streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let currentStreak = 0;
    let longestStreak = 0;

    tasks.forEach((task) => {
      if (task.streak) {
        currentStreak = Math.max(currentStreak, task.streak.currentStreak);
        longestStreak = Math.max(longestStreak, task.streak.longestStreak);
      }
    });

    // Update badge progress
    const badges = BADGES.map((badge) => {
      const earned = checkBadgeEarned(
        badge,
        {
          ...settings.userStats!,
          tasksCompleted: completedTasks.length,
          currentStreak,
          longestStreak,
          totalPoints,
        },
        tasks
      );

      return {
        ...badge,
        earnedAt: earned ? badge.earnedAt || new Date() : undefined,
        progress: badge.id.includes("task")
          ? completedTasks.length
          : badge.id.includes("streak")
          ? currentStreak
          : undefined,
      };
    });

    return {
      totalPoints,
      level,
      badges,
      tasksCompleted: completedTasks.length,
      currentStreak,
      longestStreak,
    };
  }, [tasks, settings.userStats]);

  // Filter and search tasks
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    if (filter.category) {
      result = result.filter((task) => task.category === filter.category);
    }

    if (filter.priority) {
      result = result.filter((task) => task.priority === filter.priority);
    }

    if (filter.status) {
      result = result.filter((task) => task.status === filter.status);
    }

    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query)
      );
    }

    // Sort: pending first, then in-progress, then completed
    result.sort((a, b) => {
      const statusOrder = { pending: 0, "in-progress": 1, completed: 2 };
      return statusOrder[a.status] - statusOrder[b.status];
    });

    return result;
  }, [tasks, filter]);

  // Task counts
  const taskCounts = useMemo(
    () => ({
      total: tasks.length,
      pending: tasks.filter((t) => t.status === "pending").length,
      inProgress: tasks.filter((t) => t.status === "in-progress").length,
      completed: tasks.filter((t) => t.status === "completed").length,
    }),
    [tasks]
  );

  const handleAddTask = (task: Task) => {
    addTask(task);
    toast.success("Task added successfully!");
  };

  const handleDeleteTask = (id: string) => {
    deleteTask(id);
    toast.success("Task deleted");
  };

  const handleUpdateTask = (id: string, updates: Partial<Task>) => {
    const currentTask = tasks.find((t) => t.id === id);
    if (!currentTask) return;

    let updatedTask = { ...currentTask, ...updates };

    // If completing a task
    if (updates.status === "completed" && currentTask.status !== "completed") {
      updatedTask.completedAt = new Date();
      updatedTask.points = calculatePoints(updatedTask);
      updatedTask = updateStreakData(updatedTask);

      // Check for new badges
      const newBadges = BADGES.filter((badge) => {
        const wasEarned = settings.userStats?.badges.find(
          (b) => b.id === badge.id
        )?.earnedAt;
        const isNowEarned = checkBadgeEarned(
          badge,
          {
            ...userStats,
            tasksCompleted: userStats.tasksCompleted + 1,
            totalPoints: userStats.totalPoints + (updatedTask.points || 0),
          },
          [...tasks.filter((t) => t.id !== id), updatedTask]
        );
        return !wasEarned && isNowEarned;
      });

      // Show notifications
      if (updatedTask.points) {
        toast.success(`Task completed! +${updatedTask.points} XP`);
      }

      newBadges.forEach((badge) => {
        toast.success(`🏆 Badge Unlocked: ${badge.name}!`);
      });

      const newLevel = calculateLevel(
        userStats.totalPoints + (updatedTask.points || 0)
      );
      if (newLevel > userStats.level) {
        toast.success(`🎉 Level Up! You're now Level ${newLevel}!`);
      }

      // Handle recurring task renewal
      if (updatedTask.recurring?.enabled) {
        const nextDue = calculateRecurringNextDue(
          updatedTask.recurring.interval,
          updatedTask.recurring.customDays,
          new Date()
        );

        // Create new instance of the recurring task
        const newRecurringTask: Task = {
          ...updatedTask,
          id: generateId(),
          status: "pending",
          completedAt: undefined,
          timerRunning: false,
          timerStartedAt: undefined,
          timeSpent: 0,
          createdAt: new Date(),
          dueDate: nextDue,
          recurring: {
            ...updatedTask.recurring,
            lastCompleted: new Date(),
            nextDue,
          },
        };

        addTask(newRecurringTask);
        toast.success(
          `📅 Recurring task renewed for ${nextDue.toLocaleDateString()}`
        );
      }
    }

    updateTask(id, updatedTask);
  };

  const handleImportTasks = (importedTasks: Task[]) => {
    reorderTasks(importedTasks);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e: React.DragEvent, targetTaskId: string) => {
    e.preventDefault();

    if (!draggedTaskId || draggedTaskId === targetTaskId) {
      setDraggedTaskId(null);
      return;
    }

    // Find indices in the filtered tasks (what's visible on screen)
    const draggedFilteredIndex = filteredTasks.findIndex(
      (t) => t.id === draggedTaskId
    );
    const targetFilteredIndex = filteredTasks.findIndex(
      (t) => t.id === targetTaskId
    );

    if (draggedFilteredIndex === -1 || targetFilteredIndex === -1) {
      setDraggedTaskId(null);
      return;
    }

    // Get the visible filtered tasks and reorder them
    const visibleTasks = filteredTasks.slice();
    const [draggedTask] = visibleTasks.splice(draggedFilteredIndex, 1);
    visibleTasks.splice(targetFilteredIndex, 0, draggedTask);

    // Rebuild the full tasks array with the new order
    // Keep non-visible tasks in their original positions
    const visibleTaskIds = new Set(filteredTasks.map((t) => t.id));
    const newTasks: Task[] = [];
    let visibleIndex = 0;

    for (const task of tasks) {
      if (visibleTaskIds.has(task.id)) {
        // This task is visible, use the reordered version
        if (visibleIndex < visibleTasks.length) {
          newTasks.push(visibleTasks[visibleIndex]);
          visibleIndex++;
        }
      } else {
        // This task is not visible, keep it in place
        newTasks.push(task);
      }
    }

    reorderTasks(newTasks);
    setDraggedTaskId(null);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
  };

  // Apply background style
  const backgroundClass =
    settings.backgroundType === "theme"
      ? BACKGROUND_GRADIENTS[settings.backgroundTheme] || ""
      : "";

  const backgroundStyle =
    settings.backgroundType === "image" && settings.backgroundImage
      ? {
          backgroundImage: `url(${settings.backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : settings.backgroundType === "custom" && settings.backgroundColor
      ? { backgroundColor: settings.backgroundColor }
      : {};

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${backgroundClass}`}
      style={backgroundStyle}
    >
      <AppHeader title="Ultimate To-Do App" />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">My Tasks</h1>
              {settings.enableGamification && settings.userStats && (
                <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full text-sm font-semibold">
                  <span className="text-lg">⭐</span>
                  <span>Level {userStats.level}</span>
                </div>
              )}
            </div>
            <p className="text-muted-foreground">
              Organize your tasks, track your progress, and boost productivity
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {settings.enableGamification && (
              <Button
                variant="outline"
                onClick={() => navigate("/todo/stats")}
                className="flex items-center gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                View Stats
              </Button>
            )}
            <ExportImport tasks={tasks} onImport={handleImportTasks} />
            <TodoSettings
              settings={settings}
              onSettingsChange={updateSettings}
            />
            <AddTodoForm onAdd={handleAddTask} />
          </div>
        </div>

        <div className="mb-6">
          <QuickAddTask onAdd={handleAddTask} />
        </div>

        <div className="mb-6">
          <TodoFilters
            filter={filter}
            onFilterChange={setFilter}
            taskCounts={taskCounts}
          />
        </div>

        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                {tasks.length === 0
                  ? "No tasks yet. Add your first task to get started!"
                  : `No tasks match your filters. (${tasks.length} total tasks)`}
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Showing {filteredTasks.length} of {tasks.length} tasks
              </p>
              <div className="space-y-4">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`transition-all duration-200 ${
                      draggedTaskId === task.id
                        ? "opacity-40 scale-95"
                        : draggedTaskId
                        ? "opacity-100"
                        : ""
                    }`}
                  >
                    <TodoItem
                      task={task}
                      onUpdate={handleUpdateTask}
                      onDelete={handleDeleteTask}
                      showTimer={settings.showTimer}
                      showEstimatedTime={settings.showEstimatedTime}
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragEnd={handleDragEnd}
                      onDrop={(e) => handleDrop(e, task.id)}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {tasks.length > 0 && (
          <div className="mt-8 p-4 bg-card rounded-lg border">
            <h3 className="font-semibold mb-2">Quick Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-bold">{taskCounts.total}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {taskCounts.pending}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">
                  {taskCounts.inProgress}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {taskCounts.completed}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoApp;
