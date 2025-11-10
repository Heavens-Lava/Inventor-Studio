export type TaskCategory =
  | "work"
  | "school"
  | "home"
  | "hobby"
  | "leisure"
  | "rest"
  | "productivity"
  | "health"
  | "finance"
  | "social"
  | "other";

export type TaskPriority = "low" | "medium" | "high";

export type TaskStatus = "pending" | "in-progress" | "completed";

export type RecurringInterval = "daily" | "weekly" | "monthly" | "custom";

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface RecurringConfig {
  enabled: boolean;
  interval: RecurringInterval;
  customDays?: number; // For custom interval
  lastCompleted?: Date;
  nextDue?: Date;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  completionDates: Date[];
  lastCompletedDate?: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt?: Date;
  progress?: number;
  requirement: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  color?: string;
  estimatedTime?: number; // in minutes
  timeSpent?: number; // in minutes
  subtasks: Subtask[];
  createdAt: Date;
  completedAt?: Date;
  dueDate?: Date;
  tags?: string[];
  timerRunning?: boolean;
  timerStartedAt?: Date;
  recurring?: RecurringConfig;
  streak?: StreakData;
  points?: number;
}

export interface UserStats {
  totalPoints: number;
  level: number;
  badges: Badge[];
  tasksCompleted: number;
  currentStreak: number;
  longestStreak: number;
}

export interface TodoSettings {
  backgroundType: "theme" | "image" | "custom";
  backgroundTheme: string;
  backgroundImage?: string;
  colorScheme: "light" | "dark" | "system";
  showEstimatedTime: boolean;
  showTimer: boolean;
  enableAISuggestions: boolean;
  enableGamification: boolean;
  userStats?: UserStats;
}

export interface TodoFilter {
  category?: TaskCategory;
  priority?: TaskPriority;
  status?: TaskStatus;
  searchQuery?: string;
}

export const CATEGORY_COLORS: Record<TaskCategory, string> = {
  work: "#3b82f6",
  school: "#8b5cf6",
  home: "#10b981",
  hobby: "#f59e0b",
  leisure: "#ec4899",
  rest: "#6366f1",
  productivity: "#14b8a6",
  health: "#ef4444",
  finance: "#059669",
  social: "#f97316",
  other: "#6b7280"
};

export const CATEGORY_LABELS: Record<TaskCategory, string> = {
  work: "Work",
  school: "School",
  home: "Home",
  hobby: "Hobby",
  leisure: "Leisure",
  rest: "Rest",
  productivity: "Productivity",
  health: "Health",
  finance: "Finance",
  social: "Social",
  other: "Other"
};
