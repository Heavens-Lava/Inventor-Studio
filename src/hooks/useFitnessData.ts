import { useState, useEffect } from 'react';
import {
  FitnessData,
  UserProfile,
  Workout,
  DailyActivity,
  NutritionLog,
  Goal,
  Achievement,
  Challenge,
  Streak,
  SleepLog,
  MoodLog,
  BodyMeasurement,
  calculateLevel,
  XP_REWARDS,
} from '@/types/fitness';

const STORAGE_KEY = 'fitness_tracker_data';

// UUID generator that works in all environments
const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback UUID generation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const getInitialData = (): FitnessData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error parsing fitness data:', error);
    }
  }

  // Return initial empty data structure
  return {
    user: {
      profile: {
        id: generateUUID(),
        name: 'Fitness User',
        createdAt: new Date().toISOString(),
      },
      preferences: {
        units: 'metric',
        theme: 'auto',
        notifications: {
          enabled: true,
          dailyReminders: true,
          hydrationReminders: true,
          sedentaryAlerts: true,
          bedtimeReminders: true,
          achievementAlerts: true,
          streakProtection: true,
        },
      },
      level: {
        currentLevel: 1,
        currentXP: 0,
        xpToNextLevel: 100,
        totalXP: 0,
      },
    },
    workouts: [],
    dailyActivities: [],
    nutrition: [],
    health: {
      measurements: [],
      sleep: [],
    },
    wellness: {
      mood: [],
      meditation: [],
      gratitude: [],
    },
    goals: [],
    achievements: [],
    streaks: {},
    challenges: [],
    templates: [],
  };
};

export const useFitnessData = () => {
  const [data, setData] = useState<FitnessData>(getInitialData);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  // Helper to add XP and update level
  const addXP = (amount: number) => {
    setData((prev) => {
      const newTotalXP = prev.user.level.totalXP + amount;
      const newLevel = calculateLevel(newTotalXP);
      return {
        ...prev,
        user: {
          ...prev.user,
          level: newLevel,
        },
      };
    });
  };

  // User Profile Management
  const updateProfile = (profile: Partial<UserProfile>) => {
    setData((prev) => ({
      ...prev,
      user: {
        ...prev.user,
        profile: { ...prev.user.profile, ...profile },
      },
    }));
  };

  const updatePreferences = (preferences: Partial<typeof data.user.preferences>) => {
    setData((prev) => ({
      ...prev,
      user: {
        ...prev.user,
        preferences: { ...prev.user.preferences, ...preferences },
      },
    }));
  };

  // Workout Management
  const addWorkout = (workout: Omit<Workout, 'id' | 'xpEarned'>) => {
    const xpEarned = XP_REWARDS.WORKOUT_LOG + workout.duration * XP_REWARDS.WORKOUT_BONUS_PER_MINUTE;
    const newWorkout: Workout = {
      ...workout,
      id: generateUUID(),
      xpEarned,
    };

    setData((prev) => ({
      ...prev,
      workouts: [newWorkout, ...prev.workouts],
    }));

    addXP(xpEarned);
    updateStreak('workout');
    return newWorkout;
  };

  const updateWorkout = (id: string, updates: Partial<Workout>) => {
    setData((prev) => ({
      ...prev,
      workouts: prev.workouts.map((w) => (w.id === id ? { ...w, ...updates } : w)),
    }));
  };

  const deleteWorkout = (id: string) => {
    setData((prev) => ({
      ...prev,
      workouts: prev.workouts.filter((w) => w.id !== id),
    }));
  };

  // Daily Activity Management
  const updateDailyActivity = (activity: DailyActivity) => {
    setData((prev) => {
      const existing = prev.dailyActivities.find((a) => a.date === activity.date);
      if (existing) {
        return {
          ...prev,
          dailyActivities: prev.dailyActivities.map((a) =>
            a.date === activity.date ? activity : a
          ),
        };
      }
      return {
        ...prev,
        dailyActivities: [activity, ...prev.dailyActivities],
      };
    });
  };

  // Nutrition Management
  const updateNutritionLog = (log: NutritionLog) => {
    setData((prev) => {
      const existing = prev.nutrition.find((n) => n.date === log.date);
      if (existing) {
        return {
          ...prev,
          nutrition: prev.nutrition.map((n) => (n.date === log.date ? log : n)),
        };
      }
      return {
        ...prev,
        nutrition: [log, ...prev.nutrition],
      };
    });

    // Award XP for logging meals
    if (log.meals.length > 0) {
      addXP(log.meals.length * XP_REWARDS.MEAL_LOG);
    }

    // Check water goal
    if (log.waterIntake >= log.waterGoal) {
      addXP(XP_REWARDS.WATER_GOAL);
      updateStreak('water');
    }

    updateStreak('nutrition');
  };

  // Health Metrics Management
  const addBodyMeasurement = (measurement: BodyMeasurement) => {
    setData((prev) => ({
      ...prev,
      health: {
        ...prev.health,
        measurements: [measurement, ...prev.health.measurements],
      },
    }));
  };

  const addSleepLog = (sleep: Omit<SleepLog, 'id'>) => {
    const newSleep: SleepLog = {
      ...sleep,
      id: generateUUID(),
    };

    setData((prev) => ({
      ...prev,
      health: {
        ...prev.health,
        sleep: [newSleep, ...prev.health.sleep],
      },
    }));

    addXP(XP_REWARDS.SLEEP_LOG);
    updateStreak('sleep');
    return newSleep;
  };

  // Mental Wellness Management
  const addMoodLog = (mood: Omit<MoodLog, 'id'>) => {
    const newMood: MoodLog = {
      ...mood,
      id: generateUUID(),
    };

    setData((prev) => ({
      ...prev,
      wellness: {
        ...prev.wellness,
        mood: [newMood, ...prev.wellness.mood],
      },
    }));

    addXP(XP_REWARDS.MOOD_CHECKIN);
    updateStreak('mood');
    return newMood;
  };

  // Goals Management
  const addGoal = (goal: Omit<Goal, 'id'>) => {
    const newGoal: Goal = {
      ...goal,
      id: generateUUID(),
    };

    setData((prev) => ({
      ...prev,
      goals: [newGoal, ...prev.goals],
    }));
    return newGoal;
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setData((prev) => ({
      ...prev,
      goals: prev.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    }));
  };

  const deleteGoal = (id: string) => {
    setData((prev) => ({
      ...prev,
      goals: prev.goals.filter((g) => g.id !== id),
    }));
  };

  // Streak Management
  const updateStreak = (type: Streak['type']) => {
    const today = new Date().toISOString().split('T')[0];

    setData((prev) => {
      const currentStreak = prev.streaks[type] || {
        type,
        currentStreak: 0,
        longestStreak: 0,
        freezesAvailable: 1,
      };

      const lastActivity = currentStreak.lastActivityDate;
      let newCurrentStreak = currentStreak.currentStreak;

      if (!lastActivity) {
        newCurrentStreak = 1;
      } else {
        const lastDate = new Date(lastActivity);
        const todayDate = new Date(today);
        const diffTime = todayDate.getTime() - lastDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          // Continue streak
          newCurrentStreak += 1;
        } else if (diffDays === 0) {
          // Same day, no change
          newCurrentStreak = currentStreak.currentStreak;
        } else {
          // Streak broken, start new
          newCurrentStreak = 1;
        }
      }

      const newLongestStreak = Math.max(currentStreak.longestStreak, newCurrentStreak);

      return {
        ...prev,
        streaks: {
          ...prev.streaks,
          [type]: {
            ...currentStreak,
            currentStreak: newCurrentStreak,
            longestStreak: newLongestStreak,
            lastActivityDate: today,
          },
        },
      };
    });
  };

  // Achievement Management
  const unlockAchievement = (achievement: Achievement) => {
    const alreadyUnlocked = data.achievements.find((a) => a.id === achievement.id);
    if (alreadyUnlocked) return;

    const unlockedAchievement: Achievement = {
      ...achievement,
      unlockedAt: new Date().toISOString(),
    };

    setData((prev) => ({
      ...prev,
      achievements: [unlockedAchievement, ...prev.achievements],
    }));

    addXP(achievement.xpReward);
  };

  // Challenge Management
  const addChallenge = (challenge: Omit<Challenge, 'id' | 'progress' | 'isCompleted'>) => {
    const newChallenge: Challenge = {
      ...challenge,
      id: generateUUID(),
      progress: 0,
      isCompleted: false,
    };

    setData((prev) => ({
      ...prev,
      challenges: [newChallenge, ...prev.challenges],
    }));
    return newChallenge;
  };

  const updateChallengeProgress = (id: string, progress: number) => {
    setData((prev) => ({
      ...prev,
      challenges: prev.challenges.map((c) => {
        if (c.id === id) {
          const isCompleted = progress >= c.goal;
          if (isCompleted && !c.isCompleted) {
            // Newly completed
            addXP(c.xpReward);
          }
          return { ...c, progress, isCompleted };
        }
        return c;
      }),
    }));
  };

  // Data Export/Import
  const exportData = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fitness-tracker-backup-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importData = (jsonData: string) => {
    try {
      const imported = JSON.parse(jsonData);
      setData(imported);
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  };

  const clearAllData = () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete all fitness data? This cannot be undone.'
    );
    if (confirmed) {
      localStorage.removeItem(STORAGE_KEY);
      setData(getInitialData());
    }
  };

  // Helper functions for getting today's data
  const getTodayActivity = (): DailyActivity | undefined => {
    const today = new Date().toISOString().split('T')[0];
    return data.dailyActivities.find((a) => a.date === today);
  };

  const getTodayNutrition = (): NutritionLog | undefined => {
    const today = new Date().toISOString().split('T')[0];
    return data.nutrition.find((n) => n.date === today);
  };

  return {
    data,
    // User
    updateProfile,
    updatePreferences,
    addXP,
    // Workouts
    addWorkout,
    updateWorkout,
    deleteWorkout,
    // Activity
    updateDailyActivity,
    getTodayActivity,
    // Nutrition
    updateNutritionLog,
    getTodayNutrition,
    // Health
    addBodyMeasurement,
    addSleepLog,
    // Wellness
    addMoodLog,
    // Goals
    addGoal,
    updateGoal,
    deleteGoal,
    // Streaks
    updateStreak,
    // Achievements
    unlockAchievement,
    // Challenges
    addChallenge,
    updateChallengeProgress,
    // Data Management
    exportData,
    importData,
    clearAllData,
  };
};
