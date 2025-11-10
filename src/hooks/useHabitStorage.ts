import { useState, useEffect, useCallback } from "react";
import { Habit, HabitSettings, CompletionRecord } from "@/types/habit";

const HABITS_STORAGE_KEY = "daily-haven-habits";
const HABIT_SETTINGS_KEY = "daily-haven-habit-settings";

const DEFAULT_SETTINGS: HabitSettings = {
  backgroundType: "theme",
  backgroundTheme: "default",
  colorScheme: "system",
  showTimeTracking: true,
  showReminders: true,
  enableGamification: true,
  enableFinancialTracking: true,
};

export const useHabitStorage = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [settings, setSettings] = useState<HabitSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load habits and settings from localStorage
  useEffect(() => {
    try {
      const storedHabits = localStorage.getItem(HABITS_STORAGE_KEY);
      const storedSettings = localStorage.getItem(HABIT_SETTINGS_KEY);

      if (storedHabits) {
        const parsedHabits = JSON.parse(storedHabits, (key, value) => {
          // Convert date strings back to Date objects
          if (key === "createdAt" || key === "completedAt" || key === "lastCompletedDate" || key === "earnedAt") {
            return value ? new Date(value) : value;
          }
          if (key === "completionDates") {
            return Array.isArray(value) ? value.map((d: string) => new Date(d)) : [];
          }
          return value;
        });
        setHabits(parsedHabits);
      }

      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings, (key, value) => {
          if (key === "earnedAt") {
            return value ? new Date(value) : value;
          }
          return value;
        });
        setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
      }
    } catch (error) {
      console.error("Error loading habits from localStorage:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save habits to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits));
      } catch (error) {
        console.error("Error saving habits to localStorage:", error);
      }
    }
  }, [habits, isLoaded]);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(HABIT_SETTINGS_KEY, JSON.stringify(settings));
      } catch (error) {
        console.error("Error saving settings to localStorage:", error);
      }
    }
  }, [settings, isLoaded]);

  // Add a new habit
  const addHabit = useCallback((habit: Habit) => {
    setHabits((prev) => [...prev, habit]);
  }, []);

  // Update a habit
  const updateHabit = useCallback((id: string, updates: Partial<Habit>) => {
    setHabits((prev) =>
      prev.map((habit) => (habit.id === id ? { ...habit, ...updates } : habit))
    );
  }, []);

  // Delete a habit
  const deleteHabit = useCallback((id: string) => {
    setHabits((prev) => prev.filter((habit) => habit.id !== id));
  }, []);

  // Reorder habits
  const reorderHabits = useCallback((newHabits: Habit[]) => {
    setHabits(newHabits);
  }, []);

  // Add a completion record
  const addCompletion = useCallback((habitId: string, completion: CompletionRecord) => {
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id === habitId) {
          return {
            ...habit,
            completions: [...habit.completions, completion],
            totalCompletions: habit.totalCompletions + 1,
            totalTimeSpent: (habit.totalTimeSpent || 0) + (completion.timeSpent || 0),
          };
        }
        return habit;
      })
    );
  }, []);

  // Update completion record
  const updateCompletion = useCallback(
    (habitId: string, completionId: string, updates: Partial<CompletionRecord>) => {
      setHabits((prev) =>
        prev.map((habit) => {
          if (habit.id === habitId) {
            return {
              ...habit,
              completions: habit.completions.map((c) =>
                c.id === completionId ? { ...c, ...updates } : c
              ),
            };
          }
          return habit;
        })
      );
    },
    []
  );

  // Delete a completion record
  const deleteCompletion = useCallback((habitId: string, completionId: string) => {
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id === habitId) {
          const completionToDelete = habit.completions.find((c) => c.id === completionId);
          return {
            ...habit,
            completions: habit.completions.filter((c) => c.id !== completionId),
            totalCompletions: Math.max(0, habit.totalCompletions - 1),
            totalTimeSpent: Math.max(
              0,
              (habit.totalTimeSpent || 0) - (completionToDelete?.timeSpent || 0)
            ),
          };
        }
        return habit;
      })
    );
  }, []);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<HabitSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  return {
    habits,
    settings,
    isLoaded,
    addHabit,
    updateHabit,
    deleteHabit,
    reorderHabits,
    addCompletion,
    updateCompletion,
    deleteCompletion,
    updateSettings,
  };
};
