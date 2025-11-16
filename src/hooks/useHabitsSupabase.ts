import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Habit, HabitSettings, CompletionRecord } from "@/types/habit";
import { toast } from "sonner";

const DEFAULT_SETTINGS: HabitSettings = {
  backgroundType: "theme",
  backgroundTheme: "default",
  colorScheme: "system",
  showTimeTracking: true,
  showReminders: true,
  enableGamification: true,
  enableFinancialTracking: true,
};

export const useHabitsSupabase = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [settings, setSettings] = useState<HabitSettings>(DEFAULT_SETTINGS);
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

  // Fetch habits and completions
  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        const { data: habitsData, error: habitsError } = await supabase
          .from("habits")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (habitsError) throw habitsError;

        // Fetch completions for all habits
        const { data: completionsData, error: completionsError } = await supabase
          .from("habit_completions")
          .select("*")
          .eq("user_id", userId)
          .order("completed_at", { ascending: false });

        if (completionsError) throw completionsError;

        // Combine habits with their completions
        const habitsWithCompletions = (habitsData || []).map((habit: any) => ({
          id: habit.id,
          name: habit.name,
          description: habit.description,
          category: habit.category as any,
          status: habit.status as any,
          color: habit.color,
          icon: habit.icon,
          frequency: habit.frequency as any,
          customDays: habit.custom_days,
          targetCount: habit.target_count,
          streak: habit.streak,
          completions: (completionsData || [])
            .filter((c: any) => c.habit_id === habit.id)
            .map((c: any) => ({
              id: c.id,
              habitId: c.habit_id,
              completedAt: new Date(c.completed_at),
              notes: c.notes,
              timeSpent: c.time_spent,
            })),
          totalCompletions: habit.total_completions,
          estimatedTime: habit.estimated_time,
          totalTimeSpent: habit.total_time_spent,
          reminder: habit.reminder,
          financialGoal: habit.financial_goal,
          points: habit.points,
          createdAt: new Date(habit.created_at),
          tags: habit.tags,
          notes: habit.notes,
          isPrivate: habit.is_private,
        }));

        setHabits(habitsWithCompletions);

        // Fetch settings
        const { data: settingsData, error: settingsError } = await supabase
          .from("habit_settings")
          .select("*")
          .eq("user_id", userId)
          .single();

        if (settingsError && settingsError.code !== "PGRST116") {
          throw settingsError;
        }

        if (settingsData) {
          setSettings({
            backgroundType: settingsData.background_type as any,
            backgroundTheme: settingsData.background_theme,
            backgroundImage: settingsData.background_image,
            colorScheme: settingsData.color_scheme as any,
            showTimeTracking: settingsData.show_time_tracking,
            showReminders: settingsData.show_reminders,
            enableGamification: settingsData.enable_gamification,
            enableFinancialTracking: settingsData.enable_financial_tracking,
            userStats: settingsData.user_stats,
          });
        }

        setIsLoaded(true);
      } catch (error: any) {
        console.error("Error fetching habits data:", error);
        toast.error("Failed to load habits");
        setIsLoaded(true);
      }
    };

    fetchData();
  }, [userId]);

  const addHabit = useCallback(async (habit: Habit) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("habits")
        .insert({
          user_id: userId,
          name: habit.name,
          description: habit.description,
          category: habit.category,
          status: habit.status,
          color: habit.color,
          icon: habit.icon,
          frequency: habit.frequency,
          custom_days: habit.customDays,
          target_count: habit.targetCount,
          streak: habit.streak,
          total_completions: 0,
          estimated_time: habit.estimatedTime,
          total_time_spent: 0,
          reminder: habit.reminder,
          financial_goal: habit.financialGoal,
          points: habit.points || 0,
          tags: habit.tags,
          notes: habit.notes,
          is_private: habit.isPrivate,
        })
        .select()
        .single();

      if (error) throw error;

      setHabits((prev) => [{ ...habit, id: data.id, completions: [] }, ...prev]);
      toast.success("Habit added!");
    } catch (error: any) {
      console.error("Error adding habit:", error);
      toast.error("Failed to add habit");
    }
  }, [userId]);

  const updateHabit = useCallback(async (id: string, updates: Partial<Habit>) => {
    if (!userId) return;

    try {
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.color !== undefined) dbUpdates.color = updates.color;
      if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
      if (updates.frequency !== undefined) dbUpdates.frequency = updates.frequency;
      if (updates.customDays !== undefined) dbUpdates.custom_days = updates.customDays;
      if (updates.targetCount !== undefined) dbUpdates.target_count = updates.targetCount;
      if (updates.streak !== undefined) dbUpdates.streak = updates.streak;
      if (updates.totalCompletions !== undefined) dbUpdates.total_completions = updates.totalCompletions;
      if (updates.estimatedTime !== undefined) dbUpdates.estimated_time = updates.estimatedTime;
      if (updates.totalTimeSpent !== undefined) dbUpdates.total_time_spent = updates.totalTimeSpent;
      if (updates.reminder !== undefined) dbUpdates.reminder = updates.reminder;
      if (updates.financialGoal !== undefined) dbUpdates.financial_goal = updates.financialGoal;
      if (updates.points !== undefined) dbUpdates.points = updates.points;
      if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.isPrivate !== undefined) dbUpdates.is_private = updates.isPrivate;

      const { error } = await supabase
        .from("habits")
        .update(dbUpdates)
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;

      setHabits((prev) =>
        prev.map((habit) => (habit.id === id ? { ...habit, ...updates } : habit))
      );
    } catch (error: any) {
      console.error("Error updating habit:", error);
      toast.error("Failed to update habit");
    }
  }, [userId]);

  const deleteHabit = useCallback(async (id: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from("habits")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;

      setHabits((prev) => prev.filter((habit) => habit.id !== id));
      toast.success("Habit deleted!");
    } catch (error: any) {
      console.error("Error deleting habit:", error);
      toast.error("Failed to delete habit");
    }
  }, [userId]);

  const reorderHabits = useCallback((newHabits: Habit[]) => {
    setHabits(newHabits);
  }, []);

  const addCompletion = useCallback(async (habitId: string, completion: CompletionRecord) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("habit_completions")
        .insert({
          user_id: userId,
          habit_id: habitId,
          completed_at: completion.completedAt.toISOString(),
          notes: completion.notes,
          time_spent: completion.timeSpent,
        })
        .select()
        .single();

      if (error) throw error;

      // Update habit's total completions and time spent
      const habit = habits.find(h => h.id === habitId);
      if (habit) {
        await updateHabit(habitId, {
          totalCompletions: habit.totalCompletions + 1,
          totalTimeSpent: (habit.totalTimeSpent || 0) + (completion.timeSpent || 0),
        });
      }

      setHabits((prev) =>
        prev.map((habit) => {
          if (habit.id === habitId) {
            return {
              ...habit,
              completions: [...habit.completions, {
                id: data.id,
                habitId: data.habit_id,
                completedAt: new Date(data.completed_at),
                notes: data.notes,
                timeSpent: data.time_spent,
              }],
              totalCompletions: habit.totalCompletions + 1,
              totalTimeSpent: (habit.totalTimeSpent || 0) + (completion.timeSpent || 0),
            };
          }
          return habit;
        })
      );
      toast.success("Completion recorded!");
    } catch (error: any) {
      console.error("Error adding completion:", error);
      toast.error("Failed to record completion");
    }
  }, [userId, habits, updateHabit]);

  const updateCompletion = useCallback(
    async (habitId: string, completionId: string, updates: Partial<CompletionRecord>) => {
      if (!userId) return;

      try {
        const dbUpdates: any = {};
        if (updates.completedAt !== undefined) dbUpdates.completed_at = updates.completedAt.toISOString();
        if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
        if (updates.timeSpent !== undefined) dbUpdates.time_spent = updates.timeSpent;

        const { error } = await supabase
          .from("habit_completions")
          .update(dbUpdates)
          .eq("id", completionId)
          .eq("user_id", userId);

        if (error) throw error;

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
      } catch (error: any) {
        console.error("Error updating completion:", error);
        toast.error("Failed to update completion");
      }
    },
    [userId]
  );

  const deleteCompletion = useCallback(async (habitId: string, completionId: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from("habit_completions")
        .delete()
        .eq("id", completionId)
        .eq("user_id", userId);

      if (error) throw error;

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
      toast.success("Completion deleted!");
    } catch (error: any) {
      console.error("Error deleting completion:", error);
      toast.error("Failed to delete completion");
    }
  }, [userId]);

  const updateSettings = useCallback(async (newSettings: Partial<HabitSettings>) => {
    if (!userId) return;

    try {
      const updatedSettings = { ...settings, ...newSettings };

      const { data: existing } = await supabase
        .from("habit_settings")
        .select("id")
        .eq("user_id", userId)
        .single();

      const dbSettings = {
        user_id: userId,
        background_type: updatedSettings.backgroundType,
        background_theme: updatedSettings.backgroundTheme,
        background_image: updatedSettings.backgroundImage,
        color_scheme: updatedSettings.colorScheme,
        show_time_tracking: updatedSettings.showTimeTracking,
        show_reminders: updatedSettings.showReminders,
        enable_gamification: updatedSettings.enableGamification,
        enable_financial_tracking: updatedSettings.enableFinancialTracking,
        user_stats: updatedSettings.userStats,
      };

      if (existing) {
        const { error } = await supabase
          .from("habit_settings")
          .update(dbSettings)
          .eq("user_id", userId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("habit_settings")
          .insert(dbSettings);
        if (error) throw error;
      }

      setSettings(updatedSettings);
    } catch (error: any) {
      console.error("Error updating settings:", error);
      toast.error("Failed to update settings");
    }
  }, [userId, settings]);

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
