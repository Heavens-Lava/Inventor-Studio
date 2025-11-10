import { ExpenseCategory } from "./expense";

export interface Budget {
  id: string;
  name: string;
  category?: ExpenseCategory;
  amount: number;
  period: "daily" | "weekly" | "monthly" | "yearly";
  startDate: Date;
  endDate?: Date;
  alertThreshold?: number; // Percentage (e.g., 80 means alert at 80% of budget)
  description?: string;
  linkedExpenseIds?: string[]; // IDs of expenses manually linked to this budget
  createdAt: Date;
  updatedAt?: Date;
}

export interface BudgetSettings {
  currency: string;
  currencySymbol: string;
  defaultPeriod: "daily" | "weekly" | "monthly" | "yearly";
  defaultAlertThreshold: number;
  enableNotifications: boolean;
}

export const DEFAULT_BUDGET_SETTINGS: BudgetSettings = {
  currency: "USD",
  currencySymbol: "$",
  defaultPeriod: "monthly",
  defaultAlertThreshold: 80,
  enableNotifications: true,
};
