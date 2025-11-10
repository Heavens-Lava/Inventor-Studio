import { Habit, StreakData, Badge, UserHabitStats, CompletionRecord } from "@/types/habit";
import { differenceInDays, startOfDay, isSameDay } from "date-fns";

// Points calculation based on habit completion
export const calculatePoints = (habit: Habit, completion: CompletionRecord): number => {
  let basePoints = 10;

  // Bonus for time spent
  if (completion.timeSpent) {
    basePoints += Math.floor(completion.timeSpent / 10); // +1 point per 10 minutes
  }

  // Bonus for streak
  if (habit.streak && habit.streak.currentStreak > 0) {
    basePoints += Math.min(habit.streak.currentStreak, 20); // Max +20 points for streak
  }

  // Bonus for financial goals
  if (habit.financialGoal) {
    basePoints += 15;
  }

  return basePoints;
};

// Calculate level from total points
export const calculateLevel = (totalPoints: number): number => {
  return Math.floor(Math.sqrt(totalPoints / 100)) + 1;
};

// Update streak data when completing a habit
export const updateStreakData = (habit: Habit, completionDate: Date = new Date()): StreakData => {
  const today = startOfDay(completionDate);
  const currentStreak = habit.streak || {
    currentStreak: 0,
    longestStreak: 0,
    completionDates: [],
  };

  // Get all completion dates
  const allDates = [...currentStreak.completionDates, today];
  const uniqueDates = Array.from(
    new Set(allDates.map((d) => startOfDay(d).getTime()))
  ).map((time) => new Date(time));

  // Sort dates
  uniqueDates.sort((a, b) => a.getTime() - b.getTime());

  // Calculate current streak
  let streak = 1;
  const lastDate = uniqueDates[uniqueDates.length - 1];

  for (let i = uniqueDates.length - 2; i >= 0; i--) {
    const diff = differenceInDays(uniqueDates[i + 1], uniqueDates[i]);
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }

  // Update longest streak
  const longestStreak = Math.max(currentStreak.longestStreak, streak);

  return {
    currentStreak: streak,
    longestStreak,
    completionDates: uniqueDates,
    lastCompletedDate: lastDate,
  };
};

// Check if habit was completed today
export const isCompletedToday = (habit: Habit): boolean => {
  const today = startOfDay(new Date());
  return habit.completions.some((completion) =>
    isSameDay(startOfDay(new Date(completion.completedAt)), today)
  );
};

// Get completion count for today
export const getTodayCompletionCount = (habit: Habit): number => {
  const today = startOfDay(new Date());
  return habit.completions.filter((completion) =>
    isSameDay(startOfDay(new Date(completion.completedAt)), today)
  ).length;
};

// Habit badges
export const HABIT_BADGES: Badge[] = [
  {
    id: "first-habit",
    name: "First Steps",
    description: "Complete your first habit",
    icon: "🌱",
    requirement: 1,
  },
  {
    id: "habit-10",
    name: "Getting Started",
    description: "Complete 10 habits",
    icon: "🌿",
    requirement: 10,
  },
  {
    id: "habit-50",
    name: "Habit Builder",
    description: "Complete 50 habits",
    icon: "🌳",
    requirement: 50,
  },
  {
    id: "habit-100",
    name: "Consistency Master",
    description: "Complete 100 habits",
    icon: "🏆",
    requirement: 100,
  },
  {
    id: "streak-3",
    name: "Three Day Streak",
    description: "Maintain a 3-day streak",
    icon: "🔥",
    requirement: 3,
  },
  {
    id: "streak-7",
    name: "Week Warrior",
    description: "Maintain a 7-day streak",
    icon: "⚡",
    requirement: 7,
  },
  {
    id: "streak-30",
    name: "Month Master",
    description: "Maintain a 30-day streak",
    icon: "💫",
    requirement: 30,
  },
  {
    id: "streak-100",
    name: "Legendary",
    description: "Maintain a 100-day streak",
    icon: "👑",
    requirement: 100,
  },
  {
    id: "time-60",
    name: "Hour Power",
    description: "Spend 60 minutes on habits in one day",
    icon: "⏰",
    requirement: 60,
  },
  {
    id: "time-600",
    name: "10 Hour Hero",
    description: "Spend 600 minutes total on habits",
    icon: "⌛",
    requirement: 600,
  },
  {
    id: "financial-goal",
    name: "Money Matters",
    description: "Complete a financial habit",
    icon: "💰",
    requirement: 1,
  },
  {
    id: "categories-5",
    name: "Well Rounded",
    description: "Complete habits in 5 different categories",
    icon: "🌈",
    requirement: 5,
  },
];

// Check if a badge is earned
export const checkBadgeEarned = (
  badge: Badge,
  stats: UserHabitStats,
  habits: Habit[]
): boolean => {
  if (badge.id.includes("habit-")) {
    const requirement = parseInt(badge.id.split("-")[1]);
    return stats.habitsCompleted >= requirement;
  }

  if (badge.id.includes("streak-")) {
    const requirement = parseInt(badge.id.split("-")[1]);
    return stats.longestStreak >= requirement;
  }

  if (badge.id.includes("time-")) {
    const requirement = parseInt(badge.id.split("-")[1]);
    return stats.totalTimeSpent >= requirement;
  }

  if (badge.id === "financial-goal") {
    return habits.some(
      (h) => h.financialGoal && h.totalCompletions > 0
    );
  }

  if (badge.id === "categories-5") {
    const completedCategories = new Set(
      habits
        .filter((h) => h.totalCompletions > 0)
        .map((h) => h.category)
    );
    return completedCategories.size >= 5;
  }

  return false;
};

// Calculate progress towards next level
export const getLevelProgress = (totalPoints: number): {
  currentLevel: number;
  nextLevel: number;
  pointsToNextLevel: number;
  progressPercentage: number;
} => {
  const currentLevel = calculateLevel(totalPoints);
  const nextLevel = currentLevel + 1;
  const pointsForCurrentLevel = (currentLevel - 1) ** 2 * 100;
  const pointsForNextLevel = currentLevel ** 2 * 100;
  const pointsToNextLevel = pointsForNextLevel - totalPoints;
  const progressPercentage =
    ((totalPoints - pointsForCurrentLevel) / (pointsForNextLevel - pointsForCurrentLevel)) * 100;

  return {
    currentLevel,
    nextLevel,
    pointsToNextLevel,
    progressPercentage: Math.min(100, Math.max(0, progressPercentage)),
  };
};
