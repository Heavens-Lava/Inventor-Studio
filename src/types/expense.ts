export type ExpenseCategory =
  | "food"
  | "gas"
  | "transportation"
  | "hobbies"
  | "entertainment"
  | "bills"
  | "subscriptions"
  | "shopping"
  | "health"
  | "education"
  | "other";

export type PaymentMethod = "cash" | "credit" | "debit" | "digital" | "other";

export type RecurringFrequency = "daily" | "weekly" | "biweekly" | "monthly" | "yearly" | "none";

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: Date;
  description?: string;
  paymentMethod?: PaymentMethod;
  isRecurring: boolean;
  recurringFrequency?: RecurringFrequency;
  tags?: string[];
  receiptImage?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Budget {
  id: string;
  category?: ExpenseCategory;
  amount: number;
  period: "daily" | "weekly" | "monthly" | "yearly";
  startDate: Date;
  endDate?: Date;
  alertThreshold?: number; // Percentage (e.g., 80 means alert at 80% of budget)
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: Date;
  category?: ExpenseCategory;
  description?: string;
  createdAt: Date;
}

export interface ExpenseStats {
  totalExpenses: number;
  dailyAverage: number;
  weeklyAverage: number;
  monthlyAverage: number;
  yearlyProjection: number;
  categoryBreakdown: Record<ExpenseCategory, number>;
  paymentMethodBreakdown: Record<PaymentMethod, number>;
  topCategory: ExpenseCategory | null;
  savingsOpportunities: SavingsOpportunity[];
}

export interface SavingsOpportunity {
  category: ExpenseCategory;
  currentMonthlySpend: number;
  suggestedReduction: number;
  potentialYearlySavings: number;
  description: string;
}

export interface ExpenseSettings {
  currency: string;
  currencySymbol: string;
  defaultCategory: ExpenseCategory;
  defaultPaymentMethod: PaymentMethod;
  showReceiptUpload: boolean;
  enableBudgetAlerts: boolean;
  enableSavingsInsights: boolean;
  backgroundType: "theme" | "image" | "custom";
  backgroundTheme: string;
  backgroundImage?: string;
  colorScheme: "light" | "dark" | "system";
}

export interface ExpenseFilter {
  category?: ExpenseCategory;
  paymentMethod?: PaymentMethod;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  searchQuery?: string;
  isRecurring?: boolean;
}

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  food: "#ef4444",
  gas: "#f59e0b",
  transportation: "#3b82f6",
  hobbies: "#ec4899",
  entertainment: "#8b5cf6",
  bills: "#6366f1",
  subscriptions: "#14b8a6",
  shopping: "#10b981",
  health: "#059669",
  education: "#0891b2",
  other: "#6b7280",
};

export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  food: "Food & Dining",
  gas: "Gas & Fuel",
  transportation: "Transportation",
  hobbies: "Hobbies",
  entertainment: "Entertainment",
  bills: "Bills & Utilities",
  subscriptions: "Subscriptions",
  shopping: "Shopping",
  health: "Health & Wellness",
  education: "Education",
  other: "Other",
};

export const CATEGORY_ICONS: Record<ExpenseCategory, string> = {
  food: "🍔",
  gas: "⛽",
  transportation: "🚗",
  hobbies: "🎨",
  entertainment: "🎬",
  bills: "📄",
  subscriptions: "📱",
  shopping: "🛍️",
  health: "💊",
  education: "📚",
  other: "💰",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Cash",
  credit: "Credit Card",
  debit: "Debit Card",
  digital: "Digital Wallet",
  other: "Other",
};

export const RECURRING_FREQUENCY_LABELS: Record<RecurringFrequency, string> = {
  none: "One-time",
  daily: "Daily",
  weekly: "Weekly",
  biweekly: "Bi-weekly (Every 2 weeks)",
  monthly: "Monthly",
  yearly: "Yearly",
};
