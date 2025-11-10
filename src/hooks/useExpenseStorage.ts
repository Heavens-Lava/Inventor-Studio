import { useState, useEffect, useCallback } from "react";
import { Expense, ExpenseSettings, Budget, SavingsGoal } from "@/types/expense";

const EXPENSES_STORAGE_KEY = "daily-haven-expenses";
const BUDGETS_STORAGE_KEY = "daily-haven-budgets";
const SAVINGS_GOALS_STORAGE_KEY = "daily-haven-savings-goals";
const EXPENSE_SETTINGS_KEY = "daily-haven-expense-settings";

const DEFAULT_SETTINGS: ExpenseSettings = {
  currency: "USD",
  currencySymbol: "$",
  defaultCategory: "other",
  defaultPaymentMethod: "cash",
  showReceiptUpload: true,
  enableBudgetAlerts: true,
  enableSavingsInsights: true,
  backgroundType: "theme",
  backgroundTheme: "default",
  colorScheme: "system",
};

export const useExpenseStorage = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [settings, setSettings] = useState<ExpenseSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from localStorage
  useEffect(() => {
    try {
      const storedExpenses = localStorage.getItem(EXPENSES_STORAGE_KEY);
      const storedBudgets = localStorage.getItem(BUDGETS_STORAGE_KEY);
      const storedSavingsGoals = localStorage.getItem(SAVINGS_GOALS_STORAGE_KEY);
      const storedSettings = localStorage.getItem(EXPENSE_SETTINGS_KEY);

      if (storedExpenses) {
        const parsedExpenses = JSON.parse(storedExpenses, (key, value) => {
          if (key === "date" || key === "createdAt" || key === "updatedAt" || key === "startDate" || key === "endDate" || key === "deadline") {
            return value ? new Date(value) : value;
          }
          return value;
        });
        setExpenses(parsedExpenses);
      }

      if (storedBudgets) {
        const parsedBudgets = JSON.parse(storedBudgets, (key, value) => {
          if (key === "startDate" || key === "endDate") {
            return value ? new Date(value) : value;
          }
          return value;
        });
        setBudgets(parsedBudgets);
      }

      if (storedSavingsGoals) {
        const parsedGoals = JSON.parse(storedSavingsGoals, (key, value) => {
          if (key === "createdAt" || key === "deadline") {
            return value ? new Date(value) : value;
          }
          return value;
        });
        setSavingsGoals(parsedGoals);
      }

      if (storedSettings) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) });
      }
    } catch (error) {
      console.error("Error loading expense data from localStorage:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save expenses to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expenses));
      } catch (error) {
        console.error("Error saving expenses to localStorage:", error);
      }
    }
  }, [expenses, isLoaded]);

  // Save budgets to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(BUDGETS_STORAGE_KEY, JSON.stringify(budgets));
      } catch (error) {
        console.error("Error saving budgets to localStorage:", error);
      }
    }
  }, [budgets, isLoaded]);

  // Save savings goals to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(SAVINGS_GOALS_STORAGE_KEY, JSON.stringify(savingsGoals));
      } catch (error) {
        console.error("Error saving savings goals to localStorage:", error);
      }
    }
  }, [savingsGoals, isLoaded]);

  // Save settings to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(EXPENSE_SETTINGS_KEY, JSON.stringify(settings));
      } catch (error) {
        console.error("Error saving settings to localStorage:", error);
      }
    }
  }, [settings, isLoaded]);

  // Expense CRUD operations
  const addExpense = useCallback((expense: Expense) => {
    setExpenses((prev) => [expense, ...prev]);
  }, []);

  const updateExpense = useCallback((id: string, updates: Partial<Expense>) => {
    setExpenses((prev) =>
      prev.map((expense) =>
        expense.id === id ? { ...expense, ...updates, updatedAt: new Date() } : expense
      )
    );
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((expense) => expense.id !== id));
  }, []);

  const reorderExpenses = useCallback((newExpenses: Expense[]) => {
    setExpenses(newExpenses);
  }, []);

  // Budget CRUD operations
  const addBudget = useCallback((budget: Budget) => {
    setBudgets((prev) => [...prev, budget]);
  }, []);

  const updateBudget = useCallback((id: string, updates: Partial<Budget>) => {
    setBudgets((prev) =>
      prev.map((budget) => (budget.id === id ? { ...budget, ...updates } : budget))
    );
  }, []);

  const deleteBudget = useCallback((id: string) => {
    setBudgets((prev) => prev.filter((budget) => budget.id !== id));
  }, []);

  // Savings Goal CRUD operations
  const addSavingsGoal = useCallback((goal: SavingsGoal) => {
    setSavingsGoals((prev) => [...prev, goal]);
  }, []);

  const updateSavingsGoal = useCallback((id: string, updates: Partial<SavingsGoal>) => {
    setSavingsGoals((prev) =>
      prev.map((goal) => (goal.id === id ? { ...goal, ...updates } : goal))
    );
  }, []);

  const deleteSavingsGoal = useCallback((id: string) => {
    setSavingsGoals((prev) => prev.filter((goal) => goal.id !== id));
  }, []);

  // Settings operations
  const updateSettings = useCallback((newSettings: Partial<ExpenseSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  return {
    expenses,
    budgets,
    savingsGoals,
    settings,
    isLoaded,
    addExpense,
    updateExpense,
    deleteExpense,
    reorderExpenses,
    addBudget,
    updateBudget,
    deleteBudget,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    updateSettings,
  };
};
