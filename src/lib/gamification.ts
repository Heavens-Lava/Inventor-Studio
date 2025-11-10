import { Badge, Task, UserStats } from "@/types/todo";

export const BADGES: Badge[] = [
  {
    id: "first-task",
    name: "Getting Started",
    description: "Complete your first task",
    icon: "🎯",
    requirement: 1
  },
  {
    id: "task-warrior-10",
    name: "Task Warrior",
    description: "Complete 10 tasks",
    icon: "⚔️",
    requirement: 10
  },
  {
    id: "task-master-50",
    name: "Task Master",
    description: "Complete 50 tasks",
    icon: "👑",
    requirement: 50
  },
  {
    id: "centurion",
    name: "Centurion",
    description: "Complete 100 tasks",
    icon: "💯",
    requirement: 100
  },
  {
    id: "streak-3",
    name: "On a Roll",
    description: "Maintain a 3-day streak",
    icon: "🔥",
    requirement: 3
  },
  {
    id: "streak-7",
    name: "Week Warrior",
    description: "Maintain a 7-day streak",
    icon: "⭐",
    requirement: 7
  },
  {
    id: "streak-30",
    name: "Monthly Master",
    description: "Maintain a 30-day streak",
    icon: "🏆",
    requirement: 30
  },
  {
    id: "early-bird",
    name: "Early Bird",
    description: "Complete a task before its due date",
    icon: "🌅",
    requirement: 1
  },
  {
    id: "perfectionist",
    name: "Perfectionist",
    description: "Complete all subtasks in 10 tasks",
    icon: "✨",
    requirement: 10
  },
  {
    id: "time-tracker",
    name: "Time Tracker",
    description: "Use the timer on 20 tasks",
    icon: "⏱️",
    requirement: 20
  }
];

export const calculatePoints = (task: Task): number => {
  let points = 10; // Base points

  // Priority bonus
  if (task.priority === "high") points += 15;
  else if (task.priority === "medium") points += 10;
  else points += 5;

  // Subtask bonus
  const completedSubtasks = task.subtasks.filter(st => st.completed).length;
  points += completedSubtasks * 5;

  // Early completion bonus
  if (task.dueDate && task.completedAt) {
    if (new Date(task.completedAt) < new Date(task.dueDate)) {
      points += 20;
    }
  }

  // Timer bonus
  if (task.timeSpent && task.timeSpent > 0) {
    points += 10;
  }

  // Streak bonus
  if (task.streak && task.streak.currentStreak > 0) {
    points += task.streak.currentStreak * 2;
  }

  return points;
};

export const calculateLevel = (totalPoints: number): number => {
  // Level 1: 0-100 points
  // Level 2: 101-300 points
  // Level 3: 301-600 points
  // etc. (incremental leveling)
  if (totalPoints < 100) return 1;
  if (totalPoints < 300) return 2;
  if (totalPoints < 600) return 3;
  if (totalPoints < 1000) return 4;
  if (totalPoints < 1500) return 5;
  if (totalPoints < 2100) return 6;
  if (totalPoints < 2800) return 7;
  if (totalPoints < 3600) return 8;
  if (totalPoints < 4500) return 9;
  return Math.floor(totalPoints / 500) + 1;
};

export const getNextLevelPoints = (currentLevel: number): number => {
  const thresholds = [100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500];
  if (currentLevel < thresholds.length) {
    return thresholds[currentLevel];
  }
  return currentLevel * 500;
};

export const checkBadgeEarned = (badge: Badge, stats: UserStats, tasks: Task[]): boolean => {
  switch (badge.id) {
    case "first-task":
    case "task-warrior-10":
    case "task-master-50":
    case "centurion":
      return stats.tasksCompleted >= badge.requirement;

    case "streak-3":
    case "streak-7":
    case "streak-30":
      return stats.currentStreak >= badge.requirement;

    case "early-bird":
      return tasks.some(t =>
        t.status === "completed" &&
        t.dueDate &&
        t.completedAt &&
        new Date(t.completedAt) < new Date(t.dueDate)
      );

    case "perfectionist":
      const tasksWithAllSubtasks = tasks.filter(t =>
        t.status === "completed" &&
        t.subtasks.length > 0 &&
        t.subtasks.every(st => st.completed)
      );
      return tasksWithAllSubtasks.length >= badge.requirement;

    case "time-tracker":
      const tasksWithTimer = tasks.filter(t =>
        t.status === "completed" &&
        t.timeSpent &&
        t.timeSpent > 0
      );
      return tasksWithTimer.length >= badge.requirement;

    default:
      return false;
  }
};

export const updateStreakData = (task: Task): Task => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (!task.streak) {
    task.streak = {
      currentStreak: 1,
      longestStreak: 1,
      completionDates: [now],
      lastCompletedDate: now
    };
    return task;
  }

  const lastCompleted = task.streak.lastCompletedDate ? new Date(task.streak.lastCompletedDate) : null;

  if (lastCompleted) {
    lastCompleted.setHours(0, 0, 0, 0);
    const daysDiff = Math.floor((now.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) {
      // Same day, don't increment streak
      return task;
    } else if (daysDiff === 1) {
      // Consecutive day, increment streak
      task.streak.currentStreak++;
      task.streak.longestStreak = Math.max(task.streak.longestStreak, task.streak.currentStreak);
    } else {
      // Streak broken, reset to 1
      task.streak.currentStreak = 1;
    }
  }

  task.streak.completionDates.push(now);
  task.streak.lastCompletedDate = now;

  return task;
};

export const calculateRecurringNextDue = (
  interval: string,
  customDays?: number,
  lastCompleted?: Date
): Date => {
  const base = lastCompleted ? new Date(lastCompleted) : new Date();
  const next = new Date(base);

  switch (interval) {
    case "daily":
      next.setDate(next.getDate() + 1);
      break;
    case "weekly":
      next.setDate(next.getDate() + 7);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;
    case "custom":
      next.setDate(next.getDate() + (customDays || 1));
      break;
  }

  return next;
};
