import { Savings, SavingsContribution } from "@/types/savings";
import { differenceInDays } from "date-fns";

// Generate unique ID for savings
export const generateSavingsId = (): string => {
  return `savings-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Generate unique ID for contributions
export const generateContributionId = (): string => {
  return `contribution-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Calculate progress percentage
export const calculateSavingsProgress = (savings: Savings): number => {
  if (!savings.targetAmount || savings.targetAmount === 0) return 0;
  return (savings.currentAmount / savings.targetAmount) * 100;
};

// Calculate remaining amount to reach goal
export const calculateRemainingAmount = (savings: Savings): number => {
  if (!savings.targetAmount) return 0;
  return Math.max(0, savings.targetAmount - savings.currentAmount);
};

// Calculate if goal is reached
export const isGoalReached = (savings: Savings): boolean => {
  if (!savings.targetAmount) return false;
  return savings.currentAmount >= savings.targetAmount;
};

// Check if savings has a target
export const hasTarget = (savings: Savings): boolean => {
  return savings.targetAmount !== undefined && savings.targetAmount > 0;
};

// Calculate days until goal date
export const calculateDaysUntilGoal = (savings: Savings): number | null => {
  if (!savings.goalDate) return null;
  const today = new Date();
  return differenceInDays(savings.goalDate, today);
};

// Calculate suggested monthly contribution to reach goal by date
export const calculateSuggestedContribution = (
  savings: Savings,
  frequency: "daily" | "weekly" | "monthly" | "yearly" = "monthly"
): number => {
  const remaining = calculateRemainingAmount(savings);
  if (remaining <= 0) return 0;

  const daysUntilGoal = calculateDaysUntilGoal(savings);
  if (!daysUntilGoal || daysUntilGoal <= 0) {
    // No goal date or already passed, suggest based on a default timeframe
    const defaultDays = 365; // 1 year default
    const dailyAmount = remaining / defaultDays;
    return convertDailyToFrequency(dailyAmount, frequency);
  }

  const dailyAmount = remaining / daysUntilGoal;
  return convertDailyToFrequency(dailyAmount, frequency);
};

// Helper function to convert daily amount to different frequencies
const convertDailyToFrequency = (
  dailyAmount: number,
  frequency: "daily" | "weekly" | "monthly" | "yearly"
): number => {
  switch (frequency) {
    case "daily":
      return dailyAmount;
    case "weekly":
      return dailyAmount * 7;
    case "monthly":
      return dailyAmount * 30;
    case "yearly":
      return dailyAmount * 365;
    default:
      return dailyAmount * 30;
  }
};

// Get status color based on progress and time remaining
export const getSavingsStatusColor = (savings: Savings): string => {
  const progress = calculateSavingsProgress(savings);
  const daysUntilGoal = calculateDaysUntilGoal(savings);

  if (progress >= 100) return "green"; // Goal reached
  if (!daysUntilGoal) return "blue"; // No deadline

  // Calculate if on track
  const today = new Date();
  const startDate = savings.createdAt;
  const totalDays = differenceInDays(savings.goalDate!, startDate);
  const daysPassed = differenceInDays(today, startDate);
  const expectedProgress = (daysPassed / totalDays) * 100;

  if (progress >= expectedProgress) return "green"; // On track or ahead
  if (progress >= expectedProgress * 0.8) return "yellow"; // Slightly behind
  return "orange"; // Behind schedule
};

// Calculate total contributions
export const calculateTotalContributions = (contributions: SavingsContribution[]): number => {
  return contributions.reduce((sum, contribution) => sum + contribution.amount, 0);
};

// Get contribution summary by source
export const getContributionSummary = (
  contributions: SavingsContribution[]
): Record<string, number> => {
  const summary: Record<string, number> = {
    manual: 0,
    budget_remainder: 0,
    income: 0,
  };

  contributions.forEach((contribution) => {
    const source = contribution.source || "manual";
    summary[source] = (summary[source] || 0) + contribution.amount;
  });

  return summary;
};

// Calculate projected amount by goal date based on recurring contributions
export const calculateProjectedAmount = (savings: Savings): number => {
  if (!savings.recurringContributionAmount || !savings.recurringContributionFrequency || !savings.goalDate) {
    return savings.currentAmount;
  }

  const today = new Date();
  const daysUntilGoal = differenceInDays(savings.goalDate, today);

  if (daysUntilGoal <= 0) {
    return savings.currentAmount;
  }

  // Convert recurring contribution to daily amount
  let dailyContribution = 0;
  switch (savings.recurringContributionFrequency) {
    case "daily":
      dailyContribution = savings.recurringContributionAmount;
      break;
    case "weekly":
      dailyContribution = savings.recurringContributionAmount / 7;
      break;
    case "biweekly":
      dailyContribution = savings.recurringContributionAmount / 14;
      break;
    case "monthly":
      dailyContribution = savings.recurringContributionAmount / 30;
      break;
    case "yearly":
      dailyContribution = savings.recurringContributionAmount / 365;
      break;
  }

  const totalRecurringContributions = dailyContribution * daysUntilGoal;
  return savings.currentAmount + totalRecurringContributions;
};

// Check if savings has recurring contributions set up
export const hasRecurringContributions = (savings: Savings): boolean => {
  return !!(savings.recurringContributionAmount &&
            savings.recurringContributionAmount > 0 &&
            savings.recurringContributionFrequency);
};
