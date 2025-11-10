import { useState, useEffect } from "react";
import { Task, TodoSettings } from "@/types/todo";

const STORAGE_KEY_TASKS = "daily-haven-todo-tasks";
const STORAGE_KEY_SETTINGS = "daily-haven-todo-settings";

const DEFAULT_SETTINGS: TodoSettings = {
  backgroundType: "theme",
  backgroundTheme: "default",
  colorScheme: "system",
  showEstimatedTime: true,
  showTimer: true,
  enableAISuggestions: false
};

export const useTodoStorage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [settings, setSettings] = useState<TodoSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedTasks = localStorage.getItem(STORAGE_KEY_TASKS);
      const storedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);

      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks);
        // Convert date strings back to Date objects
        const tasksWithDates = parsedTasks.map((task: Task) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
          timerStartedAt: task.timerStartedAt ? new Date(task.timerStartedAt) : undefined,
        }));
        setTasks(tasksWithDates);
      }

      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
      } catch (error) {
        console.error("Error saving tasks to localStorage:", error);
      }
    }
  }, [tasks, isLoaded]);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
      } catch (error) {
        console.error("Error saving settings to localStorage:", error);
      }
    }
  }, [settings, isLoaded]);

  const addTask = (task: Task) => {
    setTasks((prev) => [...prev, task]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const reorderTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
  };

  const updateSettings = (newSettings: Partial<TodoSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return {
    tasks,
    settings,
    isLoaded,
    addTask,
    updateTask,
    deleteTask,
    reorderTasks,
    updateSettings
  };
};
