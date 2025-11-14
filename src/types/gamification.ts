// Centralized gamification types for all apps

export interface UserProfile {
  totalXP: number;
  level: number;
  badges: string[]; // Badge IDs
  achievements: Achievement[];
  stats: {
    // Todo stats
    tasksCompleted: number;
    todoStreak: number;

    // Habit stats
    habitsCompleted: number;
    habitStreak: number;

    // Goal stats
    goalsCompleted: number;
    milestonesReached: number;

    // Expense/Budget stats
    expensesTracked: number;
    budgetsCreated: number;
    savingsGoalsReached: number;

    // Journal stats
    journalEntriesWritten: number;

    // Idea stats
    ideasCreated: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  unlockedAt?: Date;
}

export interface XPAction {
  type: string;
  xp: number;
  description: string;
}

// XP Rewards Configuration
export const XP_REWARDS = {
  // Todo Actions
  TODO_CREATE: 5,
  TODO_COMPLETE: 10,
  TODO_COMPLETE_HIGH_PRIORITY: 20,
  TODO_COMPLETE_WITH_SUBTASKS: 15,
  TODO_COMPLETE_EARLY: 25,
  TODO_STREAK_BONUS: 5, // per day

  // Habit Actions
  HABIT_CREATE: 10,
  HABIT_COMPLETE: 15,
  HABIT_STREAK_3: 20,
  HABIT_STREAK_7: 50,
  HABIT_STREAK_30: 150,

  // Goal Actions
  GOAL_CREATE: 15,
  GOAL_SUBGOAL_COMPLETE: 10,
  GOAL_MILESTONE_COMPLETE: 25,
  GOAL_COMPLETE: 100,

  // Expense/Budget Actions
  EXPENSE_ADD: 3,
  BUDGET_CREATE: 15,
  BUDGET_STAY_UNDER: 30,
  SAVINGS_GOAL_CREATE: 20,
  SAVINGS_GOAL_REACH: 50,
  SAVINGS_CONTRIBUTION: 5,

  // Journal Actions
  JOURNAL_ENTRY: 10,
  JOURNAL_STREAK_7: 35,

  // Idea Actions
  IDEA_CREATE: 5,
  IDEA_IMPLEMENT: 25,
};

// Level calculation
export const calculateLevel = (totalXP: number): number => {
  // Progressive leveling: Level 1 = 0-100 XP, Level 2 = 101-300 XP, etc.
  if (totalXP < 100) return 1;
  if (totalXP < 300) return 2;
  if (totalXP < 600) return 3;
  if (totalXP < 1000) return 4;
  if (totalXP < 1500) return 5;
  if (totalXP < 2100) return 6;
  if (totalXP < 2800) return 7;
  if (totalXP < 3600) return 8;
  if (totalXP < 4500) return 9;
  if (totalXP < 5500) return 10;

  // After level 10, each level requires 1000 more XP
  return Math.floor((totalXP - 5500) / 1000) + 11;
};

// Get XP needed for next level
export const getXPForNextLevel = (currentLevel: number): number => {
  const thresholds = [100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500];

  if (currentLevel <= thresholds.length) {
    return thresholds[currentLevel - 1];
  }

  // After level 10
  return 5500 + ((currentLevel - 10) * 1000);
};

// Get XP needed for current level
export const getXPForCurrentLevel = (currentLevel: number): number => {
  if (currentLevel === 1) return 0;

  const thresholds = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500];

  if (currentLevel <= thresholds.length) {
    return thresholds[currentLevel - 1];
  }

  // After level 10
  return 5500 + ((currentLevel - 11) * 1000);
};

// Calculate progress to next level
export const getLevelProgress = (totalXP: number): {
  currentLevel: number;
  nextLevel: number;
  currentLevelXP: number;
  nextLevelXP: number;
  xpToNextLevel: number;
  progressPercentage: number;
} => {
  const currentLevel = calculateLevel(totalXP);
  const nextLevel = currentLevel + 1;
  const currentLevelXP = getXPForCurrentLevel(currentLevel);
  const nextLevelXP = getXPForNextLevel(currentLevel);
  const xpToNextLevel = nextLevelXP - totalXP;
  const progressPercentage = ((totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

  return {
    currentLevel,
    nextLevel,
    currentLevelXP,
    nextLevelXP,
    xpToNextLevel,
    progressPercentage: Math.min(100, Math.max(0, progressPercentage)),
  };
};

// Achievements/Badges
export const ACHIEVEMENTS: Achievement[] = [
  // Todo Achievements
  {
    id: "first-task",
    name: "Getting Started",
    description: "Complete your first task",
    icon: "🎯",
    xpReward: 10,
  },
  {
    id: "task-warrior-10",
    name: "Task Warrior",
    description: "Complete 10 tasks",
    icon: "⚔️",
    xpReward: 50,
  },
  {
    id: "task-master-50",
    name: "Task Master",
    description: "Complete 50 tasks",
    icon: "👑",
    xpReward: 150,
  },
  {
    id: "task-centurion",
    name: "Centurion",
    description: "Complete 100 tasks",
    icon: "💯",
    xpReward: 300,
  },

  // Habit Achievements
  {
    id: "first-habit",
    name: "First Steps",
    description: "Complete your first habit",
    icon: "🌱",
    xpReward: 10,
  },
  {
    id: "habit-builder-50",
    name: "Habit Builder",
    description: "Complete 50 habits",
    icon: "🌳",
    xpReward: 150,
  },
  {
    id: "streak-master",
    name: "Streak Master",
    description: "Maintain a 30-day streak",
    icon: "🔥",
    xpReward: 200,
  },

  // Goal Achievements
  {
    id: "goal-setter",
    name: "Goal Setter",
    description: "Create your first goal",
    icon: "🎯",
    xpReward: 15,
  },
  {
    id: "goal-achiever",
    name: "Goal Achiever",
    description: "Complete your first major goal",
    icon: "🏆",
    xpReward: 100,
  },

  // Financial Achievements
  {
    id: "budget-master",
    name: "Budget Master",
    description: "Stay under budget for 3 consecutive months",
    icon: "💰",
    xpReward: 100,
  },
  {
    id: "savings-starter",
    name: "Savings Starter",
    description: "Reach your first savings goal",
    icon: "🎁",
    xpReward: 75,
  },

  // Level Milestones
  {
    id: "level-5",
    name: "Rising Star",
    description: "Reach Level 5",
    icon: "⭐",
    xpReward: 50,
  },
  {
    id: "level-10",
    name: "Productivity Pro",
    description: "Reach Level 10",
    icon: "💫",
    xpReward: 100,
  },
  {
    id: "level-25",
    name: "Legendary",
    description: "Reach Level 25",
    icon: "👑",
    xpReward: 500,
  },
];

// Check if achievement is earned
export const checkAchievementEarned = (
  achievement: Achievement,
  profile: UserProfile
): boolean => {
  if (profile.badges.includes(achievement.id)) {
    return true; // Already earned
  }

  const { stats } = profile;

  switch (achievement.id) {
    case "first-task":
      return stats.tasksCompleted >= 1;
    case "task-warrior-10":
      return stats.tasksCompleted >= 10;
    case "task-master-50":
      return stats.tasksCompleted >= 50;
    case "task-centurion":
      return stats.tasksCompleted >= 100;

    case "first-habit":
      return stats.habitsCompleted >= 1;
    case "habit-builder-50":
      return stats.habitsCompleted >= 50;
    case "streak-master":
      return stats.habitStreak >= 30 || stats.todoStreak >= 30;

    case "goal-setter":
      return stats.goalsCompleted >= 0; // Created at least one
    case "goal-achiever":
      return stats.goalsCompleted >= 1;

    case "budget-master":
      return stats.budgetsCreated >= 3; // Simplified check
    case "savings-starter":
      return stats.savingsGoalsReached >= 1;

    case "level-5":
      return profile.level >= 5;
    case "level-10":
      return profile.level >= 10;
    case "level-25":
      return profile.level >= 25;

    default:
      return false;
  }
};
