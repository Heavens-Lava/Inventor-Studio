import { useState, useEffect, useCallback } from "react";
import {
  UserProfile,
  XP_REWARDS,
  calculateLevel,
  getLevelProgress,
  ACHIEVEMENTS,
  checkAchievementEarned,
} from "@/types/gamification";
import { toast } from "sonner";

const STORAGE_KEY = "daily-haven-gamification";

const DEFAULT_PROFILE: UserProfile = {
  totalXP: 0,
  level: 1,
  badges: [],
  achievements: [],
  stats: {
    tasksCompleted: 0,
    todoStreak: 0,
    habitsCompleted: 0,
    habitStreak: 0,
    goalsCompleted: 0,
    milestonesReached: 0,
    expensesTracked: 0,
    budgetsCreated: 0,
    savingsGoalsReached: 0,
    journalEntriesWritten: 0,
    ideasCreated: 0,
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const useGamification = () => {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load profile from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setProfile({
          ...parsed,
          createdAt: new Date(parsed.createdAt),
          updatedAt: new Date(parsed.updatedAt),
          achievements: parsed.achievements.map((a: any) => ({
            ...a,
            unlockedAt: a.unlockedAt ? new Date(a.unlockedAt) : undefined,
          })),
        });
      }
    } catch (error) {
      console.error("Error loading gamification profile:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save profile to localStorage
  const saveProfile = useCallback((newProfile: UserProfile) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
      setProfile(newProfile);
    } catch (error) {
      console.error("Error saving gamification profile:", error);
    }
  }, []);

  // Add XP and check for level up
  const addXP = useCallback(
    (amount: number, reason?: string) => {
      const oldLevel = profile.level;
      const newTotalXP = profile.totalXP + amount;
      const newLevel = calculateLevel(newTotalXP);

      const newProfile = {
        ...profile,
        totalXP: newTotalXP,
        level: newLevel,
        updatedAt: new Date(),
      };

      saveProfile(newProfile);

      // Show XP gain toast
      if (reason) {
        toast.success(`+${amount} XP - ${reason}`, {
          description: `Total XP: ${newTotalXP}`,
        });
      }

      // Check for level up
      if (newLevel > oldLevel) {
        toast.success(`🎉 Level Up! You're now Level ${newLevel}!`, {
          description: `You've reached a new level of productivity!`,
          duration: 5000,
        });

        // Check for level milestone achievements
        checkAndUnlockAchievements(newProfile);
      }
    },
    [profile, saveProfile]
  );

  // Update stats
  const updateStats = useCallback(
    (updates: Partial<UserProfile["stats"]>) => {
      const newProfile = {
        ...profile,
        stats: {
          ...profile.stats,
          ...updates,
        },
        updatedAt: new Date(),
      };

      saveProfile(newProfile);

      // Check for achievements after stats update
      checkAndUnlockAchievements(newProfile);
    },
    [profile, saveProfile]
  );

  // Check and unlock achievements
  const checkAndUnlockAchievements = useCallback(
    (currentProfile: UserProfile) => {
      const newAchievements: typeof currentProfile.achievements = [];
      const newBadges: string[] = [...currentProfile.badges];

      ACHIEVEMENTS.forEach((achievement) => {
        if (!currentProfile.badges.includes(achievement.id)) {
          if (checkAchievementEarned(achievement, currentProfile)) {
            newAchievements.push({
              ...achievement,
              unlockedAt: new Date(),
            });
            newBadges.push(achievement.id);

            // Show achievement toast
            toast.success(`🏆 Achievement Unlocked: ${achievement.name}`, {
              description: `${achievement.description} (+${achievement.xpReward} XP)`,
              duration: 5000,
            });

            // Add achievement XP
            currentProfile.totalXP += achievement.xpReward;
          }
        }
      });

      if (newAchievements.length > 0) {
        const updatedProfile = {
          ...currentProfile,
          badges: newBadges,
          achievements: [...currentProfile.achievements, ...newAchievements],
          level: calculateLevel(currentProfile.totalXP),
          updatedAt: new Date(),
        };

        saveProfile(updatedProfile);
      }
    },
    [saveProfile]
  );

  // Convenience methods for common actions
  const recordTaskComplete = useCallback(
    (isHighPriority: boolean = false, hasSubtasks: boolean = false, isEarly: boolean = false) => {
      let xp = XP_REWARDS.TODO_COMPLETE;

      if (isHighPriority) {
        xp = XP_REWARDS.TODO_COMPLETE_HIGH_PRIORITY;
      }
      if (hasSubtasks) {
        xp += 5; // Bonus for completing subtasks
      }
      if (isEarly) {
        xp = XP_REWARDS.TODO_COMPLETE_EARLY;
      }

      addXP(xp, "Task completed");
      updateStats({ tasksCompleted: profile.stats.tasksCompleted + 1 });
    },
    [addXP, updateStats, profile.stats.tasksCompleted]
  );

  const recordHabitComplete = useCallback(
    (streakBonus: number = 0) => {
      let xp = XP_REWARDS.HABIT_COMPLETE;

      if (streakBonus > 0) {
        xp += streakBonus;
      }

      addXP(xp, "Habit completed");
      updateStats({ habitsCompleted: profile.stats.habitsCompleted + 1 });
    },
    [addXP, updateStats, profile.stats.habitsCompleted]
  );

  const recordGoalComplete = useCallback(() => {
    addXP(XP_REWARDS.GOAL_COMPLETE, "Goal completed");
    updateStats({ goalsCompleted: profile.stats.goalsCompleted + 1 });
  }, [addXP, updateStats, profile.stats.goalsCompleted]);

  const recordMilestoneComplete = useCallback(() => {
    addXP(XP_REWARDS.GOAL_MILESTONE_COMPLETE, "Milestone reached");
    updateStats({ milestonesReached: profile.stats.milestonesReached + 1 });
  }, [addXP, updateStats, profile.stats.milestonesReached]);

  const recordExpenseAdded = useCallback(() => {
    addXP(XP_REWARDS.EXPENSE_ADD, "Expense tracked");
    updateStats({ expensesTracked: profile.stats.expensesTracked + 1 });
  }, [addXP, updateStats, profile.stats.expensesTracked]);

  const recordBudgetCreated = useCallback(() => {
    addXP(XP_REWARDS.BUDGET_CREATE, "Budget created");
    updateStats({ budgetsCreated: profile.stats.budgetsCreated + 1 });
  }, [addXP, updateStats, profile.stats.budgetsCreated]);

  const recordSavingsGoalReached = useCallback(() => {
    addXP(XP_REWARDS.SAVINGS_GOAL_REACH, "Savings goal reached");
    updateStats({ savingsGoalsReached: profile.stats.savingsGoalsReached + 1 });
  }, [addXP, updateStats, profile.stats.savingsGoalsReached]);

  const recordJournalEntry = useCallback(() => {
    addXP(XP_REWARDS.JOURNAL_ENTRY, "Journal entry written");
    updateStats({ journalEntriesWritten: profile.stats.journalEntriesWritten + 1 });
  }, [addXP, updateStats, profile.stats.journalEntriesWritten]);

  const recordIdeaCreated = useCallback(() => {
    addXP(XP_REWARDS.IDEA_CREATE, "Idea created");
    updateStats({ ideasCreated: profile.stats.ideasCreated + 1 });
  }, [addXP, updateStats, profile.stats.ideasCreated]);

  // Get level progress
  const levelProgress = getLevelProgress(profile.totalXP);

  return {
    profile,
    isLoaded,
    addXP,
    updateStats,
    levelProgress,
    // Convenience methods
    recordTaskComplete,
    recordHabitComplete,
    recordGoalComplete,
    recordMilestoneComplete,
    recordExpenseAdded,
    recordBudgetCreated,
    recordSavingsGoalReached,
    recordJournalEntry,
    recordIdeaCreated,
  };
};
