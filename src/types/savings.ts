export interface Savings {
  id: string;
  name: string;
  targetAmount?: number; // Optional - can track savings without a goal
  currentAmount: number;
  goalDate?: Date;
  description?: string;
  category?: "emergency" | "vacation" | "car" | "house" | "education" | "general";
  linkedBudgetIds?: string[]; // IDs of budgets connected for tracking (contributions reduce budget)
  autoContribute?: boolean; // Automatically add budget remainders
  contributionFrequency?: "daily" | "weekly" | "biweekly" | "monthly" | "yearly";
  recurringContributionAmount?: number; // Amount to add at each interval
  recurringContributionFrequency?: "daily" | "weekly" | "biweekly" | "monthly" | "yearly";
  createdAt: Date;
  updatedAt?: Date;
}

export interface SavingsContribution {
  id: string;
  savingsId: string;
  amount: number;
  date: Date;
  description?: string;
  source?: "manual" | "budget_remainder" | "income";
  budgetId?: string; // If from budget remainder
  createdAt: Date;
}

export interface SavingsSettings {
  currency: string;
  currencySymbol: string;
  defaultCategory: string;
}

export const DEFAULT_SAVINGS_SETTINGS: SavingsSettings = {
  currency: "USD",
  currencySymbol: "$",
  defaultCategory: "general",
};

export const SAVINGS_CATEGORY_LABELS: Record<NonNullable<Savings["category"]>, string> = {
  emergency: "Emergency Fund",
  vacation: "Vacation",
  car: "Car/Vehicle",
  house: "House/Property",
  education: "Education",
  general: "General Savings",
};

export const SAVINGS_CATEGORY_COLORS: Record<NonNullable<Savings["category"]>, string> = {
  emergency: "#ef4444", // red
  vacation: "#3b82f6", // blue
  car: "#8b5cf6", // purple
  house: "#10b981", // green
  education: "#f59e0b", // amber
  general: "#6b7280", // gray
};
