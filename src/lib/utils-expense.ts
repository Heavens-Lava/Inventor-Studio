import {
  Expense,
  ExpenseCategory,
  ExpenseStats,
  SavingsOpportunity,
  Budget,
} from "@/types/expense";
import {
  startOfDay,
  startOfWeek,
  startOfMonth,
  endOfDay,
  endOfWeek,
  endOfMonth,
  isWithinInterval,
  differenceInDays,
  format,
} from "date-fns";

// Generate unique ID
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Format currency
export const formatCurrency = (amount: number, currencySymbol: string = "$"): string => {
  return `${currencySymbol}${amount.toFixed(2)}`;
};

// Calculate total expenses for a given period
export const calculateTotalExpenses = (
  expenses: Expense[],
  startDate?: Date,
  endDate?: Date
): number => {
  let filtered = expenses;

  if (startDate && endDate) {
    filtered = expenses.filter((expense) =>
      isWithinInterval(new Date(expense.date), { start: startDate, end: endDate })
    );
  }

  return filtered.reduce((sum, expense) => sum + expense.amount, 0);
};

// Calculate daily average
export const calculateDailyAverage = (expenses: Expense[]): number => {
  if (expenses.length === 0) return 0;

  const sortedExpenses = [...expenses].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const firstDate = startOfDay(new Date(sortedExpenses[0].date));
  const lastDate = startOfDay(new Date());
  const daysDiff = differenceInDays(lastDate, firstDate) + 1;

  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  return total / daysDiff;
};

// Calculate weekly average
export const calculateWeeklyAverage = (expenses: Expense[]): number => {
  return calculateDailyAverage(expenses) * 7;
};

// Calculate monthly average
export const calculateMonthlyAverage = (expenses: Expense[]): number => {
  return calculateDailyAverage(expenses) * 30;
};

// Calculate yearly projection based on recurring frequencies
export const calculateYearlyProjection = (expenses: Expense[]): number => {
  if (expenses.length === 0) return 0;

  let yearlyTotal = 0;

  expenses.forEach((expense) => {
    if (expense.isRecurring && expense.recurringFrequency) {
      // Calculate based on recurring frequency
      switch (expense.recurringFrequency) {
        case "daily":
          yearlyTotal += expense.amount * 365;
          break;
        case "weekly":
          yearlyTotal += expense.amount * 52; // 52 weeks in a year
          break;
        case "biweekly":
          yearlyTotal += expense.amount * 26; // 26 bi-weekly periods in a year
          break;
        case "monthly":
          yearlyTotal += expense.amount * 12;
          break;
        case "yearly":
          yearlyTotal += expense.amount;
          break;
        case "none":
        default:
          // One-time expenses don't project into the future
          break;
      }
    } else {
      // Non-recurring expenses don't project into the future
      // They're one-time only
    }
  });

  return yearlyTotal;
};

// Calculate monthly projection based on recurring frequencies
export const calculateMonthlyProjection = (expenses: Expense[]): number => {
  if (expenses.length === 0) return 0;

  let monthlyTotal = 0;

  expenses.forEach((expense) => {
    if (expense.isRecurring && expense.recurringFrequency) {
      // Calculate based on recurring frequency
      switch (expense.recurringFrequency) {
        case "daily":
          monthlyTotal += expense.amount * 30; // Approximate 30 days per month
          break;
        case "weekly":
          monthlyTotal += expense.amount * 4.33; // 4.33 weeks per month on average
          break;
        case "biweekly":
          monthlyTotal += expense.amount * 2.17; // 2.17 bi-weekly periods per month
          break;
        case "monthly":
          monthlyTotal += expense.amount;
          break;
        case "yearly":
          monthlyTotal += expense.amount / 12;
          break;
        case "none":
        default:
          // One-time expenses don't project into the future
          break;
      }
    } else {
      // Non-recurring expenses don't project into the future
    }
  });

  return monthlyTotal;
};

// Calculate yearly projection for a single expense
export const calculateSingleExpenseYearlyProjection = (expense: Expense): number => {
  if (!expense.isRecurring || !expense.recurringFrequency) {
    return 0; // One-time expenses don't project
  }

  switch (expense.recurringFrequency) {
    case "daily":
      return expense.amount * 365;
    case "weekly":
      return expense.amount * 52;
    case "biweekly":
      return expense.amount * 26;
    case "monthly":
      return expense.amount * 12;
    case "yearly":
      return expense.amount;
    case "none":
    default:
      return 0;
  }
};

// Get expenses for today
export const getTodayExpenses = (expenses: Expense[]): Expense[] => {
  const today = startOfDay(new Date());
  return expenses.filter((expense) =>
    isWithinInterval(new Date(expense.date), {
      start: today,
      end: endOfDay(new Date()),
    })
  );
};

// Get expenses for current week
export const getWeekExpenses = (expenses: Expense[]): Expense[] => {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

  return expenses.filter((expense) =>
    isWithinInterval(new Date(expense.date), { start: weekStart, end: weekEnd })
  );
};

// Get expenses for current month
export const getMonthExpenses = (expenses: Expense[]): Expense[] => {
  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());

  return expenses.filter((expense) =>
    isWithinInterval(new Date(expense.date), { start: monthStart, end: monthEnd })
  );
};

// Calculate category breakdown
export const calculateCategoryBreakdown = (
  expenses: Expense[]
): Record<ExpenseCategory, number> => {
  const breakdown: Record<string, number> = {};

  expenses.forEach((expense) => {
    if (!breakdown[expense.category]) {
      breakdown[expense.category] = 0;
    }
    breakdown[expense.category] += expense.amount;
  });

  return breakdown as Record<ExpenseCategory, number>;
};

// Get top spending category
export const getTopCategory = (expenses: Expense[]): ExpenseCategory | null => {
  if (expenses.length === 0) return null;

  const breakdown = calculateCategoryBreakdown(expenses);
  let topCategory: ExpenseCategory | null = null;
  let maxAmount = 0;

  Object.entries(breakdown).forEach(([category, amount]) => {
    if (amount > maxAmount) {
      maxAmount = amount;
      topCategory = category as ExpenseCategory;
    }
  });

  return topCategory;
};

// Calculate expense stats
export const calculateExpenseStats = (expenses: Expense[]): ExpenseStats => {
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const dailyAverage = calculateDailyAverage(expenses);
  const weeklyAverage = calculateWeeklyAverage(expenses);
  const monthlyAverage = calculateMonthlyAverage(expenses);
  const yearlyProjection = calculateYearlyProjection(expenses);
  const categoryBreakdown = calculateCategoryBreakdown(expenses);
  const topCategory = getTopCategory(expenses);

  // Payment method breakdown
  const paymentMethodBreakdown: any = {};
  expenses.forEach((expense) => {
    const method = expense.paymentMethod || "other";
    if (!paymentMethodBreakdown[method]) {
      paymentMethodBreakdown[method] = 0;
    }
    paymentMethodBreakdown[method] += expense.amount;
  });

  // Identify savings opportunities
  const savingsOpportunities = identifySavingsOpportunities(expenses, categoryBreakdown);

  return {
    totalExpenses,
    dailyAverage,
    weeklyAverage,
    monthlyAverage,
    yearlyProjection,
    categoryBreakdown,
    paymentMethodBreakdown,
    topCategory,
    savingsOpportunities,
  };
};

// Identify savings opportunities
export const identifySavingsOpportunities = (
  expenses: Expense[],
  categoryBreakdown: Record<ExpenseCategory, number>
): SavingsOpportunity[] => {
  const monthlyAverage = calculateMonthlyAverage(expenses);
  const opportunities: SavingsOpportunity[] = [];

  // Analyze each category for potential savings
  Object.entries(categoryBreakdown).forEach(([category, amount]) => {
    const categoryMonthly = (amount / expenses.length) * 30;
    const percentageOfTotal = (categoryMonthly / monthlyAverage) * 100;

    // If category is more than 15% of total spending, suggest reduction
    if (percentageOfTotal > 15) {
      const suggestedReduction = categoryMonthly * 0.1; // Suggest 10% reduction
      const potentialYearlySavings = suggestedReduction * 12;

      opportunities.push({
        category: category as ExpenseCategory,
        currentMonthlySpend: categoryMonthly,
        suggestedReduction,
        potentialYearlySavings,
        description: `Reducing ${category} spending by 10% could save you ${formatCurrency(
          potentialYearlySavings
        )} per year.`,
      });
    }
  });

  // Sort by potential savings (highest first)
  return opportunities.sort((a, b) => b.potentialYearlySavings - a.potentialYearlySavings);
};

// Check if budget is exceeded
export const isBudgetExceeded = (budget: Budget, expenses: Expense[]): boolean => {
  const budgetExpenses = getBudgetExpenses(budget, expenses);
  const totalSpent = budgetExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  return totalSpent > budget.amount;
};

// Get budget usage percentage
export const getBudgetUsagePercentage = (budget: Budget, expenses: Expense[]): number => {
  const budgetExpenses = getBudgetExpenses(budget, expenses);
  const totalSpent = budgetExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  return (totalSpent / budget.amount) * 100;
};

// Get expenses for a specific budget
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

// Format date range for display
export const formatDateRange = (startDate: Date, endDate: Date): string => {
  return `${format(startDate, "MMM d, yyyy")} - ${format(endDate, "MMM d, yyyy")}`;
};

// Get recurring expenses
export const getRecurringExpenses = (expenses: Expense[]): Expense[] => {
  return expenses.filter((expense) => expense.isRecurring);
};

// Calculate percentage change
export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};
