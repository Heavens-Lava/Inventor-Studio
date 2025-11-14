// Core User Types
export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  age?: number;
  height?: number; // in cm
  gender?: 'male' | 'female' | 'other';
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
  createdAt: string;
}

export interface UserPreferences {
  units: 'metric' | 'imperial';
  theme: 'light' | 'dark' | 'auto';
  colorScheme?: string;
  notifications: NotificationSettings;
  language?: string;
}

export interface NotificationSettings {
  enabled: boolean;
  dailyReminders: boolean;
  hydrationReminders: boolean;
  sedentaryAlerts: boolean;
  bedtimeReminders: boolean;
  achievementAlerts: boolean;
  streakProtection: boolean;
}

// Gamification Types
export interface UserLevel {
  currentLevel: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'workout' | 'streak' | 'activity' | 'nutrition' | 'health' | 'special';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  xpReward: number;
  unlockedAt?: string;
  progress?: number;
  requirement: number;
}

export interface Streak {
  type: 'workout' | 'steps' | 'nutrition' | 'water' | 'sleep' | 'mood' | 'overall';
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: string;
  freezesAvailable: number;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  category: 'workout' | 'activity' | 'nutrition' | 'health' | 'wellness';
  goal: number;
  progress: number;
  startDate: string;
  endDate: string;
  xpReward: number;
  badgeId?: string;
  isActive: boolean;
  isCompleted: boolean;
}

// Workout Types
export interface Workout {
  id: string;
  date: string;
  type: WorkoutType;
  name: string;
  duration: number; // in minutes
  caloriesBurned: number;
  exercises: Exercise[];
  intensity: 'low' | 'moderate' | 'high' | 'extreme';
  notes?: string;
  feeling?: 'terrible' | 'bad' | 'okay' | 'good' | 'great' | 'amazing';
  xpEarned: number;
}

export type WorkoutType =
  | 'cardio'
  | 'strength'
  | 'flexibility'
  | 'hiit'
  | 'sports'
  | 'yoga'
  | 'pilates'
  | 'swimming'
  | 'cycling'
  | 'running'
  | 'walking'
  | 'custom';

export interface Exercise {
  id: string;
  name: string;
  type: 'strength' | 'cardio' | 'flexibility';
  muscleGroup?: string[];
  sets?: number;
  reps?: number;
  weight?: number; // in kg or lbs
  duration?: number; // in seconds
  distance?: number; // in km or miles
  restTime?: number; // in seconds
  notes?: string;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  type: WorkoutType;
  exercises: Exercise[];
  estimatedDuration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description?: string;
}

// Activity Tracking Types
export interface DailyActivity {
  date: string;
  steps: number;
  stepsGoal: number;
  activeMinutes: number;
  activeMinutesGoal: number;
  caloriesBurned: number;
  distance: number; // in km or miles
  sedentaryMinutes: number;
}

// Nutrition Types
export interface NutritionLog {
  date: string;
  meals: Meal[];
  waterIntake: number; // in ml or oz
  waterGoal: number;
  totalCalories: number;
  calorieGoal: number;
  macros: Macros;
  macroGoals: Macros;
}

export interface Meal {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  time: string;
  foods: FoodItem[];
  totalCalories: number;
  macros: Macros;
  photo?: string;
  notes?: string;
}

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number; // in grams
  carbs: number; // in grams
  fats: number; // in grams
  fiber?: number;
  sugar?: number;
  servingSize: string;
  servings: number;
}

export interface Macros {
  protein: number;
  carbs: number;
  fats: number;
}

// Health Metrics Types
export interface BodyMeasurement {
  date: string;
  weight?: number; // in kg or lbs
  bodyFat?: number; // percentage
  muscleMass?: number; // in kg or lbs
  bmi?: number;
  customMeasurements?: CustomMeasurement[];
  photo?: string;
  notes?: string;
}

export interface CustomMeasurement {
  name: string;
  value: number;
  unit: string;
}

export interface SleepLog {
  id: string;
  date: string;
  bedtime: string;
  waketime: string;
  duration: number; // in hours
  quality: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  interruptions?: number;
  feltRested: boolean;
}

// Mental Wellness Types
export interface MoodLog {
  id: string;
  date: string;
  time: string;
  mood: 'terrible' | 'bad' | 'okay' | 'good' | 'great' | 'fantastic';
  stress: number; // 1-10 scale
  energy: number; // 1-10 scale
  emotions: string[]; // tags like 'anxious', 'happy', 'calm', etc.
  notes?: string;
}

export interface MeditationSession {
  id: string;
  date: string;
  duration: number; // in minutes
  type: 'guided' | 'unguided' | 'breathing' | 'body-scan' | 'visualization';
  notes?: string;
}

export interface GratitudeEntry {
  id: string;
  date: string;
  items: string[];
}

// Goals Types
export interface Goal {
  id: string;
  type: 'weight' | 'fitness' | 'habit' | 'nutrition' | 'activity';
  name: string;
  description?: string;
  target: number;
  current: number;
  unit: string;
  startDate: string;
  targetDate: string;
  milestones: Milestone[];
  isCompleted: boolean;
  completedAt?: string;
}

export interface Milestone {
  id: string;
  name: string;
  target: number;
  isCompleted: boolean;
  completedAt?: string;
}

// Stats and Analytics Types
export interface WeeklySummary {
  weekStart: string;
  weekEnd: string;
  totalWorkouts: number;
  totalActiveMinutes: number;
  totalCaloriesBurned: number;
  totalSteps: number;
  totalDistance: number;
  averageSleep: number;
  averageMood: number;
  goalsCompleted: number;
  xpEarned: number;
  achievementsUnlocked: number;
}

export interface MonthlySummary {
  month: string;
  year: number;
  totalWorkouts: number;
  totalActiveMinutes: number;
  totalCaloriesBurned: number;
  totalSteps: number;
  totalDistance: number;
  averageSleep: number;
  weightChange: number;
  goalsCompleted: number;
  xpEarned: number;
  achievementsUnlocked: number;
  levelUps: number;
}

// Complete User Data Structure
export interface FitnessData {
  user: {
    profile: UserProfile;
    preferences: UserPreferences;
    level: UserLevel;
  };
  workouts: Workout[];
  dailyActivities: DailyActivity[];
  nutrition: NutritionLog[];
  health: {
    measurements: BodyMeasurement[];
    sleep: SleepLog[];
  };
  wellness: {
    mood: MoodLog[];
    meditation: MeditationSession[];
    gratitude: GratitudeEntry[];
  };
  goals: Goal[];
  achievements: Achievement[];
  streaks: { [key: string]: Streak };
  challenges: Challenge[];
  templates: WorkoutTemplate[];
}

// XP Calculation Constants
export const XP_REWARDS = {
  DAILY_GOALS_COMPLETE: 50,
  WORKOUT_LOG: 25,
  WORKOUT_BONUS_PER_MINUTE: 1,
  MEAL_LOG: 10,
  WATER_GOAL: 20,
  SLEEP_LOG: 15,
  MOOD_CHECKIN: 10,
  STREAK_MULTIPLIER: 1.5,
  CHALLENGE_COMPLETE: 100,
  ACHIEVEMENT_UNLOCK: 50,
};

// Level Calculation
export const calculateXPForLevel = (level: number): number => {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

export const calculateLevel = (totalXP: number): UserLevel => {
  let level = 1;
  let xpForCurrentLevel = 0;
  let xpForNextLevel = calculateXPForLevel(1);

  while (totalXP >= xpForNextLevel && level < 100) {
    level++;
    xpForCurrentLevel = xpForNextLevel;
    xpForNextLevel = xpForCurrentLevel + calculateXPForLevel(level);
  }

  return {
    currentLevel: level,
    currentXP: totalXP - xpForCurrentLevel,
    xpToNextLevel: xpForNextLevel - xpForCurrentLevel,
    totalXP,
  };
};
