import { useState, useEffect } from "react";
import { supabase, TodoTask, TodoUserSettings } from "@/lib/supabase";
import { Task, TodoSettings } from "@/types/todo";
import { toast } from "sonner";

// Helper functions to convert between app types and database types
const dbTaskToTask = (dbTask: TodoTask): Task => ({
  id: dbTask.id,
  title: dbTask.title,
  description: dbTask.description,
  category: dbTask.category as any,
  priority: dbTask.priority as any,
  status: dbTask.status as any,
  color: dbTask.color,
  estimatedTime: dbTask.estimated_time,
  timeSpent: dbTask.time_spent,
  subtasks: dbTask.subtasks || [],
  createdAt: new Date(dbTask.created_at),
  completedAt: dbTask.completed_at ? new Date(dbTask.completed_at) : undefined,
  dueDate: dbTask.due_date ? new Date(dbTask.due_date) : undefined,
  tags: dbTask.tags,
  timerRunning: dbTask.timer_running,
  timerStartedAt: dbTask.timer_started_at ? new Date(dbTask.timer_started_at) : undefined,
  recurring: dbTask.recurring,
  streak: dbTask.streak,
  points: dbTask.points,
});

const taskToDbTask = (task: Task, userId: string): Partial<TodoTask> => ({
  user_id: userId,
  title: task.title,
  description: task.description,
  category: task.category,
  priority: task.priority,
  status: task.status,
  color: task.color,
  estimated_time: task.estimatedTime,
  time_spent: task.timeSpent,
  subtasks: task.subtasks,
  completed_at: task.completedAt?.toISOString(),
  due_date: task.dueDate?.toISOString(),
  tags: task.tags,
  timer_running: task.timerRunning,
  timer_started_at: task.timerStartedAt?.toISOString(),
  recurring: task.recurring,
  streak: task.streak,
  points: task.points,
});

const dbSettingsToSettings = (dbSettings: TodoUserSettings | null): TodoSettings => {
  if (!dbSettings) {
    return {
      backgroundType: "theme",
      backgroundTheme: "default",
      colorScheme: "system",
      showEstimatedTime: true,
      showTimer: true,
      enableAISuggestions: false,
      enableGamification: true,
    };
  }

  return {
    backgroundType: dbSettings.background_type as any,
    backgroundTheme: dbSettings.background_theme,
    backgroundImage: dbSettings.background_image,
    colorScheme: dbSettings.color_scheme as any,
    showEstimatedTime: dbSettings.show_estimated_time,
    showTimer: dbSettings.show_timer,
    enableAISuggestions: dbSettings.enable_ai_suggestions,
    enableGamification: dbSettings.enable_gamification,
    userStats: dbSettings.user_stats,
  };
};

const settingsToDbSettings = (settings: TodoSettings, userId: string): Partial<TodoUserSettings> => ({
  user_id: userId,
  background_type: settings.backgroundType,
  background_theme: settings.backgroundTheme,
  background_image: settings.backgroundImage,
  color_scheme: settings.colorScheme,
  show_estimated_time: settings.showEstimatedTime,
  show_timer: settings.showTimer,
  enable_ai_suggestions: settings.enableAISuggestions,
  enable_gamification: settings.enableGamification,
  user_stats: settings.userStats,
});

export const useTodoSupabase = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [settings, setSettings] = useState<TodoSettings>({
    backgroundType: "theme",
    backgroundTheme: "default",
    colorScheme: "system",
    showEstimatedTime: true,
    showTimer: true,
    enableAISuggestions: false,
    enableGamification: true,
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
      }
    };
    getCurrentUser();
  }, []);

  // Fetch tasks and settings
  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        // Fetch tasks
        const { data: tasksData, error: tasksError } = await supabase
          .from("todos")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (tasksError) throw tasksError;

        const convertedTasks = (tasksData || []).map(dbTaskToTask);
        setTasks(convertedTasks);

        // Fetch settings
        const { data: settingsData, error: settingsError } = await supabase
          .from("todo_settings")
          .select("*")
          .eq("user_id", userId)
          .single();

        if (settingsError && settingsError.code !== "PGRST116") {
          throw settingsError;
        }

        setSettings(dbSettingsToSettings(settingsData));
        setIsLoaded(true);
      } catch (error: any) {
        console.error("Error fetching todo data:", error);
        toast.error("Failed to load tasks");
        setIsLoaded(true);
      }
    };

    fetchData();
  }, [userId]);

  const addTask = async (task: Task) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("todos")
        .insert(taskToDbTask(task, userId))
        .select()
        .single();

      if (error) throw error;

      const newTask = dbTaskToTask(data);
      setTasks((prev) => [newTask, ...prev]);
      toast.success("Task added!");
    } catch (error: any) {
      console.error("Error adding task:", error);
      toast.error("Failed to add task");
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    if (!userId) return;

    try {
      const dbUpdates: any = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.color !== undefined) dbUpdates.color = updates.color;
      if (updates.estimatedTime !== undefined) dbUpdates.estimated_time = updates.estimatedTime;
      if (updates.timeSpent !== undefined) dbUpdates.time_spent = updates.timeSpent;
      if (updates.subtasks !== undefined) dbUpdates.subtasks = updates.subtasks;
      if (updates.completedAt !== undefined) dbUpdates.completed_at = updates.completedAt?.toISOString();
      if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate?.toISOString();
      if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
      if (updates.timerRunning !== undefined) dbUpdates.timer_running = updates.timerRunning;
      if (updates.timerStartedAt !== undefined) dbUpdates.timer_started_at = updates.timerStartedAt?.toISOString();
      if (updates.recurring !== undefined) dbUpdates.recurring = updates.recurring;
      if (updates.streak !== undefined) dbUpdates.streak = updates.streak;
      if (updates.points !== undefined) dbUpdates.points = updates.points;

      const { data, error } = await supabase
        .from("todos")
        .update(dbUpdates)
        .eq("id", taskId)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;

      const updatedTask = dbTaskToTask(data);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));
    } catch (error: any) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from("todos")
        .delete()
        .eq("id", taskId)
        .eq("user_id", userId);

      if (error) throw error;

      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      toast.success("Task deleted!");
    } catch (error: any) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  };

  const reorderTasks = async (newTasks: Task[]) => {
    // For now, just update local state
    // You could add a 'position' field to the database if you want persistent ordering
    setTasks(newTasks);
  };

  const updateSettings = async (newSettings: Partial<TodoSettings>) => {
    if (!userId) return;

    try {
      const updatedSettings = { ...settings, ...newSettings };

      // Check if settings exist
      const { data: existing } = await supabase
        .from("todo_settings")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from("todo_settings")
          .update(settingsToDbSettings(updatedSettings, userId))
          .eq("user_id", userId);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from("todo_settings")
          .insert(settingsToDbSettings(updatedSettings, userId));

        if (error) throw error;
      }

      setSettings(updatedSettings);
    } catch (error: any) {
      console.error("Error updating settings:", error);
      toast.error("Failed to update settings");
    }
  };

  return {
    tasks,
    settings,
    isLoaded,
    addTask,
    updateTask,
    deleteTask,
    reorderTasks,
    updateSettings,
  };
};
