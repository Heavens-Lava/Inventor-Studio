import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  Download,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Wallet,
  Edit,
  Trash2,
  PiggyBank,
} from "lucide-react";
import { useBudgetStorage } from "@/hooks/useBudgetStorage";
import { Budget } from "@/types/budget";
import { Expense } from "@/types/expense";
import {
  calculateBudgetSpent,
  calculateBudgetRemaining,
  calculateBudgetUsagePercentage,
  isBudgetExceeded,
  getBudgetStatusColor,
  calculateExpenseForBudgetPeriod,
  calculateSavingsAllocations,
} from "@/lib/utils-budget";
import { formatCurrency } from "@/lib/utils-expense";
import { toast } from "sonner";

const BudgetApp = () => {
  const navigate = useNavigate();
  const { budgets, settings, isLoaded, addBudget, updateBudget, deleteBudget } = useBudgetStorage();
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  // Load all available expenses (for display only, not auto-linked)
  useEffect(() => {
    try {
      const storedExpenses = localStorage.getItem("daily-haven-expenses");
      if (storedExpenses) {
        const parsed = JSON.parse(storedExpenses);
        const expensesWithDates = parsed.map((expense: Expense) => ({
          ...expense,
          date: new Date(expense.date),
          createdAt: new Date(expense.createdAt),
          updatedAt: expense.updatedAt ? new Date(expense.updatedAt) : undefined,
        }));
        setAllExpenses(expensesWithDates);
      }
    } catch (error) {
      console.error("Error loading expenses:", error);
    }
  }, []);

  // Get expenses linked to a specific budget
  const getBudgetLinkedExpenses = (budget: Budget): Expense[] => {
    if (!budget.linkedExpenseIds || budget.linkedExpenseIds.length === 0) {
      return [];
    }
    return allExpenses.filter((expense) => budget.linkedExpenseIds?.includes(expense.id));
  };

  // Calculate summary statistics based on linked expenses (period-aware)
  const totalBudgeted = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent = budgets.reduce((sum, budget) => {
    const linkedExpenses = getBudgetLinkedExpenses(budget);
    return sum + linkedExpenses.reduce((expSum, exp) =>
      expSum + calculateExpenseForBudgetPeriod(exp, budget.period), 0);
  }, 0);
  const totalRemaining = totalBudgeted - totalSpent;
  const exceededBudgets = budgets.filter((budget) => {
    const linkedExpenses = getBudgetLinkedExpenses(budget);
    const spent = linkedExpenses.reduce((sum, exp) =>
      sum + calculateExpenseForBudgetPeriod(exp, budget.period), 0);
    return spent > budget.amount;
  });

  if (!isLoaded) {
    return (
      <AppLayout title="Budget Manager">
        <p className="text-muted-foreground">Loading...</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Budget Manager" containerClassName="max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">My Budgets</h1>
              <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full text-sm font-semibold">
                <Wallet className="h-4 w-4" />
                <span>{budgets.length} Active</span>
              </div>
            </div>
            <p className="text-muted-foreground">
              Track your spending limits and stay within budget
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {budgets.length > 0 && (
              <Button
                variant="outline"
                onClick={() => navigate("/savings/create")}
                className="flex items-center gap-2"
              >
                <PiggyBank className="h-4 w-4" />
                Create Savings
              </Button>
            )}
            <Button onClick={() => navigate("/budgets/create")} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Budget
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Budgeted</p>
              <Wallet className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold">{formatCurrency(totalBudgeted, settings.currencySymbol)}</p>
            <p className="text-xs text-muted-foreground">{budgets.length} budgets</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Spent</p>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </div>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(totalSpent, settings.currencySymbol)}
            </p>
            <p className="text-xs text-muted-foreground">
              {budgets.reduce((sum, b) => sum + (b.linkedExpenseIds?.length || 0), 0)} linked expenses
            </p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Remaining</p>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(totalRemaining, settings.currencySymbol)}
            </p>
            <p className="text-xs text-muted-foreground">
              {totalBudgeted > 0 ? ((totalRemaining / totalBudgeted) * 100).toFixed(1) : 0}% left
            </p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Exceeded</p>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </div>
            <p className="text-2xl font-bold text-orange-600">{exceededBudgets.length}</p>
            <p className="text-xs text-muted-foreground">Over budget</p>
          </Card>
        </div>

        {/* Budgets List */}
        <div className="space-y-4">
          {budgets.length === 0 ? (
            <Card className="p-12 text-center">
              <Wallet className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No budgets yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first budget to start tracking your spending limits
              </p>
              <Button onClick={() => navigate("/budgets/create")}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Budget
              </Button>
            </Card>
          ) : (
            budgets.map((budget) => {
              const linkedExpenses = getBudgetLinkedExpenses(budget);
              // Calculate spent amount adjusted for budget period
              const spent = linkedExpenses.reduce((sum, exp) =>
                sum + calculateExpenseForBudgetPeriod(exp, budget.period), 0);
              // Calculate savings allocations for this budget
              const savingsAllocated = calculateSavingsAllocations(budget.id, budget.period);
              const remaining = budget.amount - spent - savingsAllocated;
              const usagePercentage = ((spent + savingsAllocated) / budget.amount) * 100;
              const isExceeded = spent > budget.amount;
              const statusColor =
                usagePercentage >= 100
                  ? "red"
                  : usagePercentage >= (budget.alertThreshold || 80)
                  ? "orange"
                  : usagePercentage >= 50
                  ? "yellow"
                  : "green";

              return (
                <Card key={budget.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-semibold">{budget.name}</h3>
                        <Badge variant={isExceeded ? "destructive" : "secondary"}>
                          {budget.period}
                        </Badge>
                        {budget.category && (
                          <Badge variant="outline">{budget.category}</Badge>
                        )}
                      </div>
                      {budget.description && (
                        <p className="text-sm text-muted-foreground">{budget.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/budgets/${budget.id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm(`Delete budget "${budget.name}"?`)) {
                            deleteBudget(budget.id);
                            toast.success("Budget deleted");
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <div>
                          <span className="text-muted-foreground">Spent: </span>
                          <span className="font-semibold text-red-600">
                            {formatCurrency(spent, settings.currencySymbol)}
                          </span>
                        </div>
                        {savingsAllocated > 0 && (
                          <div>
                            <span className="text-muted-foreground">Savings: </span>
                            <span className="font-semibold text-blue-600">
                              {formatCurrency(savingsAllocated, settings.currencySymbol)}
                            </span>
                          </div>
                        )}
                        <div>
                          <span className="text-muted-foreground">Budget: </span>
                          <span className="font-semibold">
                            {formatCurrency(budget.amount, settings.currencySymbol)}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Available: </span>
                          <span
                            className={`font-semibold ${
                              isExceeded ? "text-red-600" : "text-green-600"
                            }`}
                          >
                            {formatCurrency(remaining, settings.currencySymbol)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold">{usagePercentage.toFixed(1)}%</span>
                      </div>
                    </div>

                    <Progress
                      value={Math.min(usagePercentage, 100)}
                      className="h-3"
                      indicatorClassName={
                        statusColor === "red"
                          ? "bg-red-500"
                          : statusColor === "orange"
                          ? "bg-orange-500"
                          : statusColor === "yellow"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }
                    />

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                      <span>{linkedExpenses.length} expense(s) linked to this budget</span>
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-xs"
                        onClick={() => navigate(`/budgets/${budget.id}/edit`)}
                      >
                        {linkedExpenses.length > 0 ? "Manage Expenses" : "Link Expenses"}
                      </Button>
                    </div>

                    {isExceeded && (
                      <div className="flex items-center gap-2 text-sm text-red-600">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Over budget by {formatCurrency(Math.abs(remaining), settings.currencySymbol)}</span>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>
    </AppLayout>
  );
};

export default BudgetApp;
