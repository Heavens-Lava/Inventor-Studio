import { Habit, HabitFrequency } from "@/types/habit";
import { startOfDay, addDays, addWeeks, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";

// Generate unique ID
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Check if habit should be shown today based on frequency
export const isHabitDueToday = (habit: Habit): boolean => {
  const today = new Date().getDay(); // 0-6 (Sunday-Saturday)

  if (habit.frequency === "daily") {
    return true;
  }

  if (habit.frequency === "custom" && habit.customDays) {
    return habit.customDays.includes(today);
  }

  // For weekly habits, show all days (user decides when to complete)
  return true;
};

// Get next due date for habit
export const getNextDueDate = (habit: Habit, fromDate: Date = new Date()): Date => {
  const today = startOfDay(fromDate);

  if (habit.frequency === "daily") {
    return addDays(today, 1);
  }

  if (habit.frequency === "weekly") {
    return addWeeks(today, 1);
  }

  if (habit.frequency === "custom" && habit.customDays && habit.customDays.length > 0) {
    const currentDay = fromDate.getDay();
    const sortedDays = [...habit.customDays].sort((a, b) => a - b);

    // Find next custom day
    for (const day of sortedDays) {
      if (day > currentDay) {
        const daysToAdd = day - currentDay;
        return addDays(today, daysToAdd);
      }
    }

    // If no day found this week, use first day of next week
    const daysToAdd = 7 - currentDay + sortedDays[0];
    return addDays(today, daysToAdd);
  }

  return addDays(today, 1);
};

// Get completion percentage for current week
export const getWeeklyCompletionPercentage = (habit: Habit): number => {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  let expectedDays = 0;
  let completedDays = 0;

  daysOfWeek.forEach((day) => {
    const dayOfWeek = day.getDay();
    let isDue = false;

    if (habit.frequency === "daily") {
      isDue = true;
    } else if (habit.frequency === "custom" && habit.customDays) {
      isDue = habit.customDays.includes(dayOfWeek);
    } else if (habit.frequency === "weekly") {
      isDue = true; // Weekly habits count all days
    }

    if (isDue && day <= now) {
      expectedDays++;

      const isCompleted = habit.completions.some((completion) =>
        isSameDay(startOfDay(new Date(completion.completedAt)), startOfDay(day))
      );

      if (isCompleted) {
        completedDays++;
      }
    }
  });

  return expectedDays > 0 ? (completedDays / expectedDays) * 100 : 0;
};

// Get habit completion rate (all time)
export const getOverallCompletionRate = (habit: Habit): number => {
  const createdDate = startOfDay(new Date(habit.createdAt));
  const today = startOfDay(new Date());
  const daysSinceCreation = Math.floor((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysSinceCreation === 0) return 0;

  let expectedCompletions = 0;

  if (habit.frequency === "daily") {
    expectedCompletions = daysSinceCreation + 1;
  } else if (habit.frequency === "weekly") {
    expectedCompletions = Math.ceil(daysSinceCreation / 7);
  } else if (habit.frequency === "custom" && habit.customDays) {
    const weeksElapsed = Math.ceil(daysSinceCreation / 7);
    expectedCompletions = weeksElapsed * habit.customDays.length;
  }

  return expectedCompletions > 0 ? (habit.totalCompletions / expectedCompletions) * 100 : 0;
};

// Format time spent (minutes to readable string)
export const formatTimeSpent = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (mins === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${mins}m`;
};

// Get habit priority score (for sorting)
export const getHabitPriorityScore = (habit: Habit): number => {
  let score = 0;

  // Higher score for habits not completed today
  if (!habit.completions.some((c) => isSameDay(new Date(c.completedAt), new Date()))) {
    score += 100;
  }

  // Higher score for longer streaks (to maintain them)
  if (habit.streak) {
    score += habit.streak.currentStreak * 10;
  }

  // Higher score for daily habits
  if (habit.frequency === "daily") {
    score += 50;
  }

  // Higher score for habits due today
  if (isHabitDueToday(habit)) {
    score += 30;
  }

  return score;
};

// Get day names from day numbers
export const getDayNames = (days: number[]): string[] => {
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days.map((day) => dayNames[day]);
};

// Get short day names from day numbers
export const getShortDayNames = (days: number[]): string[] => {
  const shortNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days.map((day) => shortNames[day]);
};
