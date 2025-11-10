import { useState, useMemo, useEffect } from "react";
import AppHeader from "@/components/AppHeader";
import { AddHabitForm } from "@/components/habit/AddHabitForm";
import { HabitItem } from "@/components/habit/HabitItem";
import { HabitFilters } from "@/components/habit/HabitFilters";
import { HabitSettings } from "@/components/habit/HabitSettings";
import { useHabitStorage } from "@/hooks/useHabitStorage";
import { Habit, HabitFilter, UserHabitStats, CompletionRecord } from "@/types/habit";
import { toast } from "sonner";
import {
  calculatePoints,
  calculateLevel,
  HABIT_BADGES,
  checkBadgeEarned,
  updateStreakData,
} from "@/lib/gamification-habits";
import { generateId, isHabitDueToday, getHabitPriorityScore } from "@/lib/utils-habit";
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

const HabitsApp = () => {
  const navigate = useNavigate();
  const {
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
  } = useHabitStorage();

  const [filter, setFilter] = useState<HabitFilter>({});
  const [draggedHabitId, setDraggedHabitId] = useState<string | null>(null);

  // Initialize user stats if not present
  useEffect(() => {
    if (isLoaded && !settings.userStats) {
      updateSettings({
        enableGamification: true,
        userStats: {
          totalPoints: 0,
          level: 1,
          badges: HABIT_BADGES.map((b) => ({ ...b })),
          habitsCompleted: 0,
          currentStreak: 0,
          longestStreak: 0,
          totalTimeSpent: 0,
        },
      });
    }
  }, [isLoaded, settings.userStats, updateSettings]);

  // Calculate user stats from habits
  const userStats: UserHabitStats = useMemo(() => {
    if (!settings.userStats) {
      return {
        totalPoints: 0,
        level: 1,
        badges: HABIT_BADGES.map((b) => ({ ...b })),
        habitsCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalTimeSpent: 0,
      };
    }

    const totalCompletions = habits.reduce((sum, h) => sum + h.totalCompletions, 0);
    const totalPoints = habits.reduce((sum, h) => sum + (h.points || 0), 0);
    const totalTimeSpent = habits.reduce((sum, h) => sum + (h.totalTimeSpent || 0), 0);
    const level = calculateLevel(totalPoints);

    // Calculate current and longest streak
    let currentStreak = 0;
    let longestStreak = 0;

    habits.forEach((habit) => {
      if (habit.streak) {
        currentStreak = Math.max(currentStreak, habit.streak.currentStreak);
        longestStreak = Math.max(longestStreak, habit.streak.longestStreak);
      }
    });

    // Update badge progress
    const badges = HABIT_BADGES.map((badge) => {
      const earned = checkBadgeEarned(
        badge,
        {
          ...settings.userStats!,
          habitsCompleted: totalCompletions,
          currentStreak,
          longestStreak,
          totalPoints,
          totalTimeSpent,
        },
        habits
      );

      return {
        ...badge,
        earnedAt: earned ? badge.earnedAt || new Date() : undefined,
        progress:
          badge.id.includes("habit") ? totalCompletions :
          badge.id.includes("streak") ? currentStreak :
          badge.id.includes("time") ? totalTimeSpent : undefined,
      };
    });

    return {
      totalPoints,
      level,
      badges,
      habitsCompleted: totalCompletions,
      currentStreak,
      longestStreak,
      totalTimeSpent,
    };
  }, [habits, settings.userStats]);

  // Filter habits
  const filteredHabits = useMemo(() => {
    let result = [...habits];

    if (filter.category) {
      result = result.filter((habit) => habit.category === filter.category);
    }

    if (filter.status) {
      result = result.filter((habit) => habit.status === filter.status);
    }

    if (filter.frequency) {
      result = result.filter((habit) => habit.frequency === filter.frequency);
    }

    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      result = result.filter(
        (habit) =>
          habit.name.toLowerCase().includes(query) ||
          habit.description?.toLowerCase().includes(query)
      );
    }

    // Sort by priority (incomplete due today first, then by streak)
    result.sort((a, b) => {
      const scoreA = getHabitPriorityScore(a);
      const scoreB = getHabitPriorityScore(b);
      return scoreB - scoreA;
    });

    return result;
  }, [habits, filter]);

  // Habit counts
  const habitCounts = useMemo(
    () => ({
      total: habits.length,
      active: habits.filter((h) => h.status === "active").length,
      paused: habits.filter((h) => h.status === "paused").length,
      archived: habits.filter((h) => h.status === "archived").length,
    }),
    [habits]
  );

  const handleAddHabit = (habit: Habit) => {
    addHabit(habit);
    toast.success("Habit added successfully!");
  };

  const handleDeleteHabit = (id: string) => {
    deleteHabit(id);
    toast.success("Habit deleted");
  };

  const handleUpdateHabit = (id: string, updates: Partial<Habit>) => {
    updateHabit(id, updates);
  };

  const handleCompleteHabit = (habitId: string, timeSpent?: number, notes?: string) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    const completion: CompletionRecord = {
      id: generateId(),
      habitId,
      completedAt: new Date(),
      timeSpent,
      notes,
    };

    // Calculate points
    const points = calculatePoints(habit, completion);

    // Update streak
    const updatedStreak = updateStreakData(habit);

    // Add completion
    addCompletion(habitId, completion);

    // Update habit with new streak and points
    updateHabit(habitId, {
      streak: updatedStreak,
      points: (habit.points || 0) + points,
    });

    // Check for new badges
    const newBadges = HABIT_BADGES.filter((badge) => {
      const wasEarned = settings.userStats?.badges.find((b) => b.id === badge.id)?.earnedAt;
      const isNowEarned = checkBadgeEarned(
        badge,
        {
          ...userStats,
          habitsCompleted: userStats.habitsCompleted + 1,
          totalPoints: userStats.totalPoints + points,
          totalTimeSpent: userStats.totalTimeSpent + (timeSpent || 0),
        },
        habits
      );
      return !wasEarned && isNowEarned;
    });

    // Show notifications
    toast.success(`Habit completed! +${points} XP`);

    newBadges.forEach((badge) => {
      toast.success(`🏆 Badge Unlocked: ${badge.name}!`);
    });

    const newLevel = calculateLevel(userStats.totalPoints + points);
    if (newLevel > userStats.level) {
      toast.success(`🎉 Level Up! You're now Level ${newLevel}!`);
    }

    // Show streak notification
    if (updatedStreak.currentStreak > 1) {
      toast.success(`🔥 ${updatedStreak.currentStreak} day streak!`);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, habitId: string) => {
    setDraggedHabitId(habitId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e: React.DragEvent, targetHabitId: string) => {
    e.preventDefault();

    if (!draggedHabitId || draggedHabitId === targetHabitId) {
      setDraggedHabitId(null);
      return;
    }

    // Find indices in the filtered habits
    const draggedFilteredIndex = filteredHabits.findIndex((h) => h.id === draggedHabitId);
    const targetFilteredIndex = filteredHabits.findIndex((h) => h.id === targetHabitId);

    if (draggedFilteredIndex === -1 || targetFilteredIndex === -1) {
      setDraggedHabitId(null);
      return;
    }

    // Get the visible filtered habits and reorder them
    const visibleHabits = filteredHabits.slice();
    const [draggedHabit] = visibleHabits.splice(draggedFilteredIndex, 1);
    visibleHabits.splice(targetFilteredIndex, 0, draggedHabit);

    // Rebuild the full habits array with the new order
    const visibleHabitIds = new Set(filteredHabits.map((h) => h.id));
    const newHabits: Habit[] = [];
    let visibleIndex = 0;

    for (const habit of habits) {
      if (visibleHabitIds.has(habit.id)) {
        if (visibleIndex < visibleHabits.length) {
          newHabits.push(visibleHabits[visibleIndex]);
          visibleIndex++;
        }
      } else {
        newHabits.push(habit);
      }
    }

    reorderHabits(newHabits);
    setDraggedHabitId(null);
  };

  const handleDragEnd = () => {
    setDraggedHabitId(null);
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
      <AppHeader title="Habit Tracker" />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">My Habits</h1>
              {settings.enableGamification && settings.userStats && (
                <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full text-sm font-semibold">
                  <span className="text-lg">⭐</span>
                  <span>Level {userStats.level}</span>
                </div>
              )}
            </div>
            <p className="text-muted-foreground">
              Build better habits, track your progress, and achieve your goals
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {settings.enableGamification && (
              <Button
                variant="outline"
                onClick={() => navigate("/habits/stats")}
                className="flex items-center gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                View Stats
              </Button>
            )}
            <HabitSettings settings={settings} onSettingsChange={updateSettings} />
            <AddHabitForm onAdd={handleAddHabit} />
          </div>
        </div>

        <div className="mb-6">
          <HabitFilters
            filter={filter}
            onFilterChange={setFilter}
            habitCounts={habitCounts}
          />
        </div>

        <div className="space-y-4">
          {filteredHabits.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                {habits.length === 0
                  ? "No habits yet. Add your first habit to get started!"
                  : `No habits match your filters. (${habits.length} total habits)`}
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Showing {filteredHabits.length} of {habits.length} habits
              </p>
              <div className="space-y-4">
                {filteredHabits.map((habit) => (
                  <div
                    key={habit.id}
                    className={`transition-all duration-200 ${
                      draggedHabitId === habit.id
                        ? "opacity-40 scale-95"
                        : draggedHabitId
                        ? "opacity-100"
                        : ""
                    }`}
                  >
                    <HabitItem
                      habit={habit}
                      onComplete={handleCompleteHabit}
                      onUpdate={handleUpdateHabit}
                      onDelete={handleDeleteHabit}
                      showTimeTracking={settings.showTimeTracking}
                      onDragStart={(e) => handleDragStart(e, habit.id)}
                      onDragEnd={handleDragEnd}
                      onDrop={(e) => handleDrop(e, habit.id)}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {habits.length > 0 && (
          <div className="mt-8 p-4 bg-card rounded-lg border">
            <h3 className="font-semibold mb-2">Quick Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Habits</p>
                <p className="text-2xl font-bold">{habitCounts.total}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">{habitCounts.active}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold text-orange-600">{userStats.currentStreak}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total XP</p>
                <p className="text-2xl font-bold text-purple-600">{userStats.totalPoints}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HabitsApp;
