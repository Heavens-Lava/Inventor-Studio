import { useState, useEffect } from "react";
import { Savings, SavingsContribution, SavingsSettings, DEFAULT_SAVINGS_SETTINGS } from "@/types/savings";

const SAVINGS_STORAGE_KEY = "daily-haven-savings";
const SAVINGS_CONTRIBUTIONS_STORAGE_KEY = "daily-haven-savings-contributions";
const SAVINGS_SETTINGS_STORAGE_KEY = "daily-haven-savings-settings";

export const useSavingsStorage = () => {
  const [savingsGoals, setSavingsGoals] = useState<Savings[]>([]);
  const [contributions, setContributions] = useState<SavingsContribution[]>([]);
  const [settings, setSettings] = useState<SavingsSettings>(DEFAULT_SAVINGS_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const storedSavings = localStorage.getItem(SAVINGS_STORAGE_KEY);
      const storedContributions = localStorage.getItem(SAVINGS_CONTRIBUTIONS_STORAGE_KEY);
      const storedSettings = localStorage.getItem(SAVINGS_SETTINGS_STORAGE_KEY);

      if (storedSavings) {
        const parsed = JSON.parse(storedSavings);
        // Convert date strings back to Date objects
        const savingsWithDates = parsed.map((savings: Savings) => ({
          ...savings,
          goalDate: savings.goalDate ? new Date(savings.goalDate) : undefined,
          createdAt: new Date(savings.createdAt),
          updatedAt: savings.updatedAt ? new Date(savings.updatedAt) : undefined,
        }));
        setSavingsGoals(savingsWithDates);
      }

      if (storedContributions) {
        const parsed = JSON.parse(storedContributions);
        const contributionsWithDates = parsed.map((contribution: SavingsContribution) => ({
          ...contribution,
          date: new Date(contribution.date),
          createdAt: new Date(contribution.createdAt),
        }));
        setContributions(contributionsWithDates);
      }

      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }
    } catch (error) {
      console.error("Error loading savings from localStorage:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save savings to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(SAVINGS_STORAGE_KEY, JSON.stringify(savingsGoals));
      } catch (error) {
        console.error("Error saving savings to localStorage:", error);
      }
    }
  }, [savingsGoals, isLoaded]);

  // Save contributions to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(SAVINGS_CONTRIBUTIONS_STORAGE_KEY, JSON.stringify(contributions));
      } catch (error) {
        console.error("Error saving contributions to localStorage:", error);
      }
    }
  }, [contributions, isLoaded]);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(SAVINGS_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      } catch (error) {
        console.error("Error saving savings settings to localStorage:", error);
      }
    }
  }, [settings, isLoaded]);

  const addSavingsGoal = (savings: Savings) => {
    setSavingsGoals((prev) => [savings, ...prev]);
  };

  const updateSavingsGoal = (id: string, updates: Partial<Savings>) => {
    setSavingsGoals((prev) =>
      prev.map((savings) =>
        savings.id === id ? { ...savings, ...updates, updatedAt: new Date() } : savings
      )
    );
  };

  const deleteSavingsGoal = (id: string) => {
    setSavingsGoals((prev) => prev.filter((savings) => savings.id !== id));
    // Also delete all contributions for this savings goal
    setContributions((prev) => prev.filter((contribution) => contribution.savingsId !== id));
  };

  const addContribution = (contribution: SavingsContribution) => {
    setContributions((prev) => [contribution, ...prev]);
    // Update the savings goal's current amount
    setSavingsGoals((prev) =>
      prev.map((savings) =>
        savings.id === contribution.savingsId
          ? { ...savings, currentAmount: savings.currentAmount + contribution.amount, updatedAt: new Date() }
          : savings
      )
    );
  };

  const deleteContribution = (id: string) => {
    const contribution = contributions.find((c) => c.id === id);
    if (contribution) {
      setContributions((prev) => prev.filter((c) => c.id !== id));
      // Update the savings goal's current amount
      setSavingsGoals((prev) =>
        prev.map((savings) =>
          savings.id === contribution.savingsId
            ? { ...savings, currentAmount: savings.currentAmount - contribution.amount, updatedAt: new Date() }
            : savings
        )
      );
    }
  };

  const getContributionsForSavings = (savingsId: string): SavingsContribution[] => {
    return contributions.filter((c) => c.savingsId === savingsId);
  };

  const updateSettings = (newSettings: Partial<SavingsSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return {
    savingsGoals,
    contributions,
    settings,
    isLoaded,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    addContribution,
    deleteContribution,
    getContributionsForSavings,
    updateSettings,
  };
};
