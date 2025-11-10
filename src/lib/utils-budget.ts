import { Budget } from "@/types/budget";
import { Expense, ExpenseCategory } from "@/types/expense";
import {
  startOfDay,
  startOfWeek,
  startOfMonth,
  endOfDay,
  endOfWeek,
  endOfMonth,
  isWithinInterval,
} from "date-fns";

// Generate unique ID
export const generateBudgetId = (): string => {
  return `budget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Calculate expense amount adjusted to budget period
export const calculateExpenseForBudgetPeriod = (
  expense: Expense,
  budgetPeriod: "daily" | "weekly" | "monthly" | "yearly"
): number => {
  // If expense is not recurring, just return the one-time amount
  if (!expense.isRecurring || !expense.recurringFrequency || expense.recurringFrequency === "none") {
    return expense.amount;
  }

  // Calculate how much this expense costs per day
  let dailyAmount: number;
  switch (expense.recurringFrequency) {
    case "daily":
      dailyAmount = expense.amount;
      break;
    case "weekly":
      dailyAmount = expense.amount / 7;
      break;
    case "biweekly":
      dailyAmount = expense.amount / 14;
      break;
    case "monthly":
      dailyAmount = expense.amount / 30;
      break;
    case "yearly":
      dailyAmount = expense.amount / 365;
      break;
    default:
      dailyAmount = expense.amount;
  }

  // Convert daily amount to budget period
  switch (budgetPeriod) {
    case "daily":
      return dailyAmount;
    case "weekly":
      return dailyAmount * 7;
    case "monthly":
      return dailyAmount * 30;
    case "yearly":
      return dailyAmount * 365;
    default:
      return expense.amount;
  }
};

// Get expenses for a specific budget period
export const getBudgetExpenses = (budget: Budget, expenses: Expense[]): Expense[] => {
  let startDate: Date;
  let endDate: Date;

  const now = new Date();

  switch (budget.period) {
    case "daily":
      startDate = startOfDay(now);
      endDate = endOfDay(now);
      break;
    case "weekly":
      startDate = startOfWeek(now, { weekStartsOn: 1 });
      endDate = endOfWeek(now, { weekStartsOn: 1 });
      break;
    case "monthly":
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
      break;
    case "yearly":
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
      break;
    default:
      startDate = budget.startDate;
      endDate = budget.endDate || now;
  }

  let filtered = expenses.filter((expense) =>
    isWithinInterval(new Date(expense.date), { start: startDate, end: endDate })
  );

  // Filter by category if budget has one
  if (budget.category) {
    filtered = filtered.filter((expense) => expense.category === budget.category);
  }

  return filtered;
};

// Calculate total spent for a budget
export const calculateBudgetSpent = (budget: Budget, expenses: Expense[]): number => {
  const budgetExpenses = getBudgetExpenses(budget, expenses);
  return budgetExpenses.reduce((sum, expense) => sum + expense.amount, 0);
};

// Calculate budget remaining
export const calculateBudgetRemaining = (budget: Budget, expenses: Expense[]): number => {
  const spent = calculateBudgetSpent(budget, expenses);
  return budget.amount - spent;
};

// Calculate budget usage percentage
export const calculateBudgetUsagePercentage = (budget: Budget, expenses: Expense[]): number => {
  const spent = calculateBudgetSpent(budget, expenses);
  return (spent / budget.amount) * 100;
};

// Check if budget is exceeded
export const isBudgetExceeded = (budget: Budget, expenses: Expense[]): boolean => {
  const spent = calculateBudgetSpent(budget, expenses);
  return spent > budget.amount;
};

// Check if budget alert threshold is reached
export const isBudgetAlertThresholdReached = (budget: Budget, expenses: Expense[]): boolean => {
  if (!budget.alertThreshold) return false;
  const usagePercentage = calculateBudgetUsagePercentage(budget, expenses);
  return usagePercentage >= budget.alertThreshold;
};

// Create budget from expenses (analyze spending and suggest budget)
export const createBudgetFromExpenses = (
  expenses: Expense[],
  category?: ExpenseCategory,
  period: "daily" | "weekly" | "monthly" | "yearly" = "monthly"
): number => {
  let filteredExpenses = expenses;

  // Filter by category if specified
  if (category) {
    filteredExpenses = expenses.filter((expense) => expense.category === category);
  }

  if (filteredExpenses.length === 0) return 0;

  // Calculate average spending based on period
  const totalSpent = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Sort expenses by date to find the date range
  const sortedExpenses = [...filteredExpenses].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const firstDate = new Date(sortedExpenses[0].date);
  const lastDate = new Date(sortedExpenses[sortedExpenses.length - 1].date);
  const daysDiff = Math.max(
    1,
    Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
  );

  const dailyAverage = totalSpent / daysDiff;

  switch (period) {
    case "daily":
      return dailyAverage;
    case "weekly":
      return dailyAverage * 7;
    case "monthly":
      return dailyAverage * 30;
    case "yearly":
      return dailyAverage * 365;
    default:
      return dailyAverage * 30;
  }
};

// Get budget status color
export const getBudgetStatusColor = (budget: Budget, expenses: Expense[]): string => {
  const usagePercentage = calculateBudgetUsagePercentage(budget, expenses);

  if (usagePercentage >= 100) return "red";
  if (usagePercentage >= (budget.alertThreshold || 80)) return "orange";
  if (usagePercentage >= 50) return "yellow";
  return "green";
};

// Calculate total recurring savings contributions allocated from this budget
export const calculateSavingsAllocations = (
  budgetId: string,
  budgetPeriod: "daily" | "weekly" | "monthly" | "yearly"
): number => {
  try {
    const storedSavings = localStorage.getItem("daily-haven-savings");
    if (!storedSavings) return 0;

    const allSavings = JSON.parse(storedSavings);

    // Find all savings linked to this budget with recurring contributions
    const linkedSavings = allSavings.filter((saving: any) => {
      const linkedBudgetIds = saving.linkedBudgetIds || [];
      return linkedBudgetIds.includes(budgetId) &&
             saving.recurringContributionAmount &&
             saving.recurringContributionFrequency;
    });

    // Calculate total allocation adjusted to budget period
    return linkedSavings.reduce((total: number, saving: any) => {
      const recurringAmount = saving.recurringContributionAmount;
      const frequency = saving.recurringContributionFrequency;

      // Convert to daily amount first
      let dailyAmount = 0;
      switch (frequency) {
        case "daily":
          dailyAmount = recurringAmount;
          break;
        case "weekly":
          dailyAmount = recurringAmount / 7;
          break;
        case "biweekly":
          dailyAmount = recurringAmount / 14;
          break;
        case "monthly":
          dailyAmount = recurringAmount / 30;
          break;
        case "yearly":
          dailyAmount = recurringAmount / 365;
          break;
      }

      // Convert daily amount to budget period
      let periodAmount = 0;
      switch (budgetPeriod) {
        case "daily":
          periodAmount = dailyAmount;
          break;
        case "weekly":
          periodAmount = dailyAmount * 7;
          break;
        case "monthly":
          periodAmount = dailyAmount * 30;
          break;
        case "yearly":
          periodAmount = dailyAmount * 365;
          break;
      }

      return total + periodAmount;
    }, 0);
  } catch (error) {
    console.error("Error calculating savings allocations:", error);
    return 0;
  }
};
