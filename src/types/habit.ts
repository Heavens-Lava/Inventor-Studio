export type HabitCategory =
  | "health"
  | "productivity"
  | "finance"
  | "wellness"
  | "social"
  | "learning"
  | "fitness"
  | "mindfulness"
  | "creativity"
  | "other";

export type HabitFrequency = "daily" | "weekly" | "custom";

export type HabitStatus = "active" | "paused" | "archived";

export interface CompletionRecord {
  id: string;
  habitId: string;
  completedAt: Date;
  notes?: string;
  timeSpent?: number; // in minutes
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: Date;
  completionDates: Date[];
}

export interface Reminder {
  enabled: boolean;
  time?: string; // HH:MM format
  days?: number[]; // 0-6 (Sunday-Saturday)
}

export interface FinancialGoal {
  type: "saving" | "spending" | "budgeting";
  targetAmount?: number;
  currentAmount?: number;
  currency?: string;
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

export interface Habit {
  id: string;
  name: string;
  description?: string;
  category: HabitCategory;
  status: HabitStatus;
  color?: string;
  icon?: string;

  // Frequency and scheduling
  frequency: HabitFrequency;
  customDays?: number[]; // For custom frequency (0-6, Sunday-Saturday)
  targetCount?: number; // How many times per period

  // Progress tracking
  streak?: StreakData;
  completions: CompletionRecord[];
  totalCompletions: number;

  // Time tracking
  estimatedTime?: number; // in minutes
  totalTimeSpent?: number; // in minutes

  // Reminders
  reminder?: Reminder;

  // Financial habits
  financialGoal?: FinancialGoal;

  // Gamification
  points?: number;

  // Metadata
  createdAt: Date;
  tags?: string[];
  notes?: string;

  // Privacy
  isPrivate?: boolean;
}

export interface UserHabitStats {
  totalPoints: number;
  level: number;
  badges: Badge[];
  habitsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  totalTimeSpent: number;
}

export interface HabitSettings {
  backgroundType: "theme" | "image" | "custom";
  backgroundTheme: string;
  backgroundImage?: string;
  colorScheme: "light" | "dark" | "system";
  showTimeTracking: boolean;
  showReminders: boolean;
  enableGamification: boolean;
  enableFinancialTracking: boolean;
  userStats?: UserHabitStats;
}

export interface HabitFilter {
  category?: HabitCategory;
  status?: HabitStatus;
  frequency?: HabitFrequency;
  searchQuery?: string;
}

export const CATEGORY_COLORS: Record<HabitCategory, string> = {
  health: "#ef4444",
  productivity: "#14b8a6",
  finance: "#059669",
  wellness: "#8b5cf6",
  social: "#f97316",
  learning: "#3b82f6",
  fitness: "#10b981",
  mindfulness: "#6366f1",
  creativity: "#ec4899",
  other: "#6b7280"
};

export const CATEGORY_LABELS: Record<HabitCategory, string> = {
  health: "Health",
  productivity: "Productivity",
  finance: "Finance",
  wellness: "Wellness",
  social: "Social",
  learning: "Learning",
  fitness: "Fitness",
  mindfulness: "Mindfulness",
  creativity: "Creativity",
  other: "Other"
};

export const CATEGORY_ICONS: Record<HabitCategory, string> = {
  health: "❤️",
  productivity: "⚡",
  finance: "💰",
  wellness: "🌸",
  social: "👥",
  learning: "📚",
  fitness: "💪",
  mindfulness: "🧘",
  creativity: "🎨",
  other: "⭐"
};

export const FREQUENCY_LABELS: Record<HabitFrequency, string> = {
  daily: "Daily",
  weekly: "Weekly",
  custom: "Custom"
};
