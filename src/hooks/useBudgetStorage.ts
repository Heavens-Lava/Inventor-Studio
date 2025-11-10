import { useState, useEffect } from "react";
import { Budget, BudgetSettings, DEFAULT_BUDGET_SETTINGS } from "@/types/budget";

const BUDGETS_STORAGE_KEY = "daily-haven-budgets";
const BUDGET_SETTINGS_STORAGE_KEY = "daily-haven-budget-settings";

export const useBudgetStorage = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [settings, setSettings] = useState<BudgetSettings>(DEFAULT_BUDGET_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const storedBudgets = localStorage.getItem(BUDGETS_STORAGE_KEY);
      const storedSettings = localStorage.getItem(BUDGET_SETTINGS_STORAGE_KEY);

      if (storedBudgets) {
        const parsed = JSON.parse(storedBudgets);
        // Convert date strings back to Date objects
        const budgetsWithDates = parsed.map((budget: Budget) => ({
          ...budget,
          startDate: new Date(budget.startDate),
          endDate: budget.endDate ? new Date(budget.endDate) : undefined,
          createdAt: new Date(budget.createdAt),
          updatedAt: budget.updatedAt ? new Date(budget.updatedAt) : undefined,
        }));
        setBudgets(budgetsWithDates);
      }

      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }
    } catch (error) {
      console.error("Error loading budgets from localStorage:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save budgets to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(BUDGETS_STORAGE_KEY, JSON.stringify(budgets));
      } catch (error) {
        console.error("Error saving budgets to localStorage:", error);
      }
    }
  }, [budgets, isLoaded]);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(BUDGET_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      } catch (error) {
        console.error("Error saving budget settings to localStorage:", error);
      }
    }
  }, [settings, isLoaded]);

  const addBudget = (budget: Budget) => {
    setBudgets((prev) => [budget, ...prev]);
  };

  const updateBudget = (id: string, updates: Partial<Budget>) => {
    setBudgets((prev) =>
      prev.map((budget) =>
        budget.id === id ? { ...budget, ...updates, updatedAt: new Date() } : budget
      )
    );
  };

  const deleteBudget = (id: string) => {
    setBudgets((prev) => prev.filter((budget) => budget.id !== id));
  };

  const updateSettings = (newSettings: Partial<BudgetSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return {
    budgets,
    settings,
    isLoaded,
    addBudget,
    updateBudget,
    deleteBudget,
    updateSettings,
  };
};
