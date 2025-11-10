import { useState, useMemo } from "react";
import AppHeader from "@/components/AppHeader";
import { AddExpenseForm } from "@/components/expense/AddExpenseForm";
import { ExpenseItem } from "@/components/expense/ExpenseItem";
import { ExpenseFilters } from "@/components/expense/ExpenseFilters";
import { ExpenseSettings } from "@/components/expense/ExpenseSettings";
import { useExpenseStorage } from "@/hooks/useExpenseStorage";
import { Expense, ExpenseFilter } from "@/types/expense";
import { toast } from "sonner";
import {
  calculateExpenseStats,
  getTodayExpenses,
  getWeekExpenses,
  getMonthExpenses,
  calculateMonthlyProjection,
  formatCurrency,
} from "@/lib/utils-expense";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BACKGROUND_GRADIENTS: Record<string, string> = {
  default: "",
  "gradient-blue":
    "bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-blue-950 dark:via-cyan-950 dark:to-blue-900",
  "gradient-purple":
    "bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 dark:from-purple-950 dark:via-pink-950 dark:to-purple-900",
  "gradient-green":
    "bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 dark:from-green-950 dark:via-emerald-950 dark:to-green-900",
  "gradient-orange":
    "bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-orange-950 dark:via-amber-950 dark:to-orange-900",
  "gradient-pink":
    "bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 dark:from-pink-950 dark:via-rose-950 dark:to-pink-900",
};

const ExpenseApp = () => {
  const navigate = useNavigate();
  const {
    expenses,
    budgets,
    savingsGoals,
    settings,
    isLoaded,
    addExpense,
    updateExpense,
    deleteExpense,
    reorderExpenses,
    updateSettings,
  } = useExpenseStorage();

  const [filter, setFilter] = useState<ExpenseFilter>({});
  const [draggedExpenseId, setDraggedExpenseId] = useState<string | null>(null);

  // Calculate stats
  const stats = useMemo(() => calculateExpenseStats(expenses), [expenses]);

  const todayExpenses = useMemo(() => getTodayExpenses(expenses), [expenses]);
  const weekExpenses = useMemo(() => getWeekExpenses(expenses), [expenses]);
  const monthExpenses = useMemo(() => getMonthExpenses(expenses), [expenses]);

  const todayTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
  const weekTotal = weekExpenses.reduce((sum, e) => sum + e.amount, 0);
  const monthTotal = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const monthlyProjection = useMemo(() => calculateMonthlyProjection(expenses), [expenses]);

  // Filter expenses
  const filteredExpenses = useMemo(() => {
    let result = [...expenses];

    if (filter.category) {
      result = result.filter((expense) => expense.category === filter.category);
    }

    if (filter.paymentMethod) {
      result = result.filter((expense) => expense.paymentMethod === filter.paymentMethod);
    }

    if (filter.startDate && filter.endDate) {
      result = result.filter((expense) => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= filter.startDate! && expenseDate <= filter.endDate!;
      });
    }

    if (filter.minAmount !== undefined) {
      result = result.filter((expense) => expense.amount >= filter.minAmount!);
    }

    if (filter.maxAmount !== undefined) {
      result = result.filter((expense) => expense.amount <= filter.maxAmount!);
    }

    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      result = result.filter(
        (expense) =>
          expense.title.toLowerCase().includes(query) ||
          expense.description?.toLowerCase().includes(query)
      );
    }

    if (filter.isRecurring !== undefined) {
      result = result.filter((expense) => expense.isRecurring === filter.isRecurring);
    }

    // Sort by date (newest first)
    result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return result;
  }, [expenses, filter]);

  // Expense counts
  const expenseCounts = useMemo(
    () => ({
      total: expenses.length,
      today: todayExpenses.length,
      week: weekExpenses.length,
      month: monthExpenses.length,
      recurring: expenses.filter((e) => e.isRecurring).length,
    }),
    [expenses, todayExpenses, weekExpenses, monthExpenses]
  );

  const handleAddExpense = (expense: Expense) => {
    addExpense(expense);
    toast.success("Expense added successfully!");
  };

  const handleDeleteExpense = (id: string) => {
    deleteExpense(id);
    toast.success("Expense deleted");
  };

  const handleUpdateExpense = (id: string, updates: Partial<Expense>) => {
    updateExpense(id, updates);
    toast.success("Expense updated");
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, expenseId: string) => {
    setDraggedExpenseId(expenseId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e: React.DragEvent, targetExpenseId: string) => {
    e.preventDefault();

    if (!draggedExpenseId || draggedExpenseId === targetExpenseId) {
      setDraggedExpenseId(null);
      return;
    }

    const draggedFilteredIndex = filteredExpenses.findIndex((e) => e.id === draggedExpenseId);
    const targetFilteredIndex = filteredExpenses.findIndex((e) => e.id === targetExpenseId);

    if (draggedFilteredIndex === -1 || targetFilteredIndex === -1) {
      setDraggedExpenseId(null);
      return;
    }

    const visibleExpenses = filteredExpenses.slice();
    const [draggedExpense] = visibleExpenses.splice(draggedFilteredIndex, 1);
    visibleExpenses.splice(targetFilteredIndex, 0, draggedExpense);

    const visibleExpenseIds = new Set(filteredExpenses.map((e) => e.id));
    const newExpenses: Expense[] = [];
    let visibleIndex = 0;

    for (const expense of expenses) {
      if (visibleExpenseIds.has(expense.id)) {
        if (visibleIndex < visibleExpenses.length) {
          newExpenses.push(visibleExpenses[visibleIndex]);
          visibleIndex++;
        }
      } else {
        newExpenses.push(expense);
      }
    }

    reorderExpenses(newExpenses);
    setDraggedExpenseId(null);
  };

  const handleDragEnd = () => {
    setDraggedExpenseId(null);
  };

  // Apply background style
  const backgroundClass =
    settings.backgroundType === "theme"
      ? BACKGROUND_GRADIENTS[settings.backgroundTheme] || ""
      : "";

  const backgroundStyle =
    settings.backgroundType === "image" && settings.backgroundImage
      ? {
          backgroundImage: `url(${settings.backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : {};

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${backgroundClass}`}
      style={backgroundStyle}
    >
      <AppHeader title="Expense Tracker" />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">My Expenses</h1>
              <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-sm font-semibold">
                <DollarSign className="h-4 w-4" />
                <span>{formatCurrency(monthTotal, settings.currencySymbol)}/mo</span>
              </div>
            </div>
            <p className="text-muted-foreground">
              Track your spending, analyze trends, and save smarter
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => navigate("/budgets/create")}
              className="flex items-center gap-2"
            >
              <Wallet className="h-4 w-4" />
              Create Budget
            </Button>
            {settings.enableSavingsInsights && (
              <Button
                variant="outline"
                onClick={() => navigate("/expenses/insights")}
                className="flex items-center gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                Insights
              </Button>
            )}
            <ExpenseSettings settings={settings} onSettingsChange={updateSettings} />
            <AddExpenseForm
              onAdd={handleAddExpense}
              defaultCategory={settings.defaultCategory}
              defaultPaymentMethod={settings.defaultPaymentMethod}
              currencySymbol={settings.currencySymbol}
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="p-4 bg-card border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Today</p>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </div>
            <p className="text-2xl font-bold">{formatCurrency(todayTotal, settings.currencySymbol)}</p>
            <p className="text-xs text-muted-foreground">{todayExpenses.length} expenses</p>
          </div>

          <div className="p-4 bg-card border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">This Week</p>
              <TrendingDown className="h-4 w-4 text-orange-500" />
            </div>
            <p className="text-2xl font-bold">{formatCurrency(weekTotal, settings.currencySymbol)}</p>
            <p className="text-xs text-muted-foreground">{weekExpenses.length} expenses</p>
          </div>

          <div className="p-4 bg-card border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">This Month</p>
              <TrendingDown className="h-4 w-4 text-purple-500" />
            </div>
            <p className="text-2xl font-bold">{formatCurrency(monthTotal, settings.currencySymbol)}</p>
            <p className="text-xs text-muted-foreground">{monthExpenses.length} expenses</p>
          </div>

          <div className="p-4 bg-card border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Monthly Projection</p>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold">
              {formatCurrency(monthlyProjection, settings.currencySymbol)}
            </p>
            <p className="text-xs text-muted-foreground">Recurring expenses</p>
          </div>

          <div className="p-4 bg-card border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Yearly Projection</p>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold">
              {formatCurrency(stats.yearlyProjection, settings.currencySymbol)}
            </p>
            <p className="text-xs text-muted-foreground">Recurring expenses</p>
          </div>
        </div>

        <div className="mb-6">
          <ExpenseFilters
            filter={filter}
            onFilterChange={setFilter}
            expenseCounts={expenseCounts}
          />
        </div>

        <div className="space-y-4">
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                {expenses.length === 0
                  ? "No expenses yet. Add your first expense to get started!"
                  : `No expenses match your filters. (${expenses.length} total expenses)`}
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Showing {filteredExpenses.length} of {expenses.length} expenses
              </p>
              <div className="space-y-4">
                {filteredExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className={`transition-all duration-200 ${
                      draggedExpenseId === expense.id
                        ? "opacity-40 scale-95"
                        : draggedExpenseId
                        ? "opacity-100"
                        : ""
                    }`}
                  >
                    <ExpenseItem
                      expense={expense}
                      onUpdate={handleUpdateExpense}
                      onDelete={handleDeleteExpense}
                      currencySymbol={settings.currencySymbol}
                      onDragStart={(e) => handleDragStart(e, expense.id)}
                      onDragEnd={handleDragEnd}
                      onDrop={(e) => handleDrop(e, expense.id)}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseApp;
