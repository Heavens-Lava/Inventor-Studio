import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PiggyBank,
  Target,
  AlertTriangle,
  Plus,
  CreditCard,
  Calendar,
  BarChart3,
} from "lucide-react";
import { useExpenseStorage } from "@/hooks/useExpenseStorage";
import { useBudgetStorage } from "@/hooks/useBudgetStorage";
import { useSavingsStorage } from "@/hooks/useSavingsStorage";
import { formatCurrency } from "@/lib/utils-expense";
import {
  getMonthExpenses,
  getTodayExpenses,
  getWeekExpenses,
} from "@/lib/utils-expense";
import { calculateExpenseForBudgetPeriod } from "@/lib/utils-budget";
import { isGoalReached } from "@/lib/utils-savings";

export default function FinanceApp() {
  const navigate = useNavigate();

  // Load data from all financial apps
  const { expenses, settings: expenseSettings, isLoaded: expensesLoaded } = useExpenseStorage();
  const { budgets, settings: budgetSettings, isLoaded: budgetsLoaded } = useBudgetStorage();
  const { savingsGoals, settings: savingsSettings, isLoaded: savingsLoaded } = useSavingsStorage();

  const [monthlyIncome, setMonthlyIncome] = useState(5000); // Default, can be made editable

  const isLoaded = expensesLoaded && budgetsLoaded && savingsLoaded;

  // Calculate this month's expenses
  const monthExpenses = useMemo(() => getMonthExpenses(expenses), [expenses]);
  const monthTotal = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

  const todayExpenses = useMemo(() => getTodayExpenses(expenses), [expenses]);
  const todayTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

  const weekExpenses = useMemo(() => getWeekExpenses(expenses), [expenses]);
  const weekTotal = weekExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Calculate net savings
  const netSavings = monthlyIncome - monthTotal;
  const savingsRate = monthlyIncome > 0 ? (netSavings / monthlyIncome) * 100 : 0;

  // Calculate budget health
  const activeBudgets = budgets.filter((b) => !b.isArchived);
  const budgetHealthScores = activeBudgets.map((budget) => {
    const linkedExpenseIds = budget.linkedExpenseIds || [];
    const budgetExpenses = expenses.filter((e) => linkedExpenseIds.includes(e.id));
    const spent = budgetExpenses.reduce(
      (sum, exp) => sum + calculateExpenseForBudgetPeriod(exp, budget.period),
      0
    );
    const remaining = Math.max(0, budget.amount - spent);
    return (remaining / budget.amount) * 100;
  });

  const avgBudgetHealth =
    budgetHealthScores.length > 0
      ? budgetHealthScores.reduce((sum, score) => sum + score, 0) / budgetHealthScores.length
      : 100;

  // Calculate savings totals
  const totalSavingsBalance = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalSavingsTarget = savingsGoals.reduce(
    (sum, goal) => sum + (goal.targetAmount || 0),
    0
  );
  const goalsReached = savingsGoals.filter((goal) => isGoalReached(goal)).length;

  // Budget alerts
  const budgetAlerts = activeBudgets.filter((budget) => {
    const linkedExpenseIds = budget.linkedExpenseIds || [];
    const budgetExpenses = expenses.filter((e) => linkedExpenseIds.includes(e.id));
    const spent = budgetExpenses.reduce(
      (sum, exp) => sum + calculateExpenseForBudgetPeriod(exp, budget.period),
      0
    );
    return spent / budget.amount >= 0.8; // 80% or more used
  });

  // Category breakdown
  const categoryTotals = monthExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const topCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const currencySymbol = expenseSettings?.currencySymbol || "$";

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading financial data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Wallet className="w-6 h-6 text-blue-500" />
                  Financial Dashboard
                </h1>
                <p className="text-sm text-muted-foreground">
                  Your complete financial overview
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 pb-6">
        {/* Financial Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Monthly Income</span>
            </div>
            <div className="text-2xl font-bold">{formatCurrency(monthlyIncome, currencySymbol)}</div>
            <div className="text-xs text-muted-foreground mt-1">This month</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-4 h-4 text-red-500" />
              <span className="text-sm text-muted-foreground">Expenses</span>
            </div>
            <div className="text-2xl font-bold">{formatCurrency(monthTotal, currencySymbol)}</div>
            <div className="text-xs text-muted-foreground mt-1">This month</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              {netSavings >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm text-muted-foreground">Net Savings</span>
            </div>
            <div
              className={`text-2xl font-bold ${
                netSavings >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatCurrency(netSavings, currencySymbol)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {savingsRate.toFixed(1)}% savings rate
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <PiggyBank className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-muted-foreground">Total Savings</span>
            </div>
            <div className="text-2xl font-bold">
              {formatCurrency(totalSavingsBalance, currencySymbol)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {goalsReached} goals reached
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-500" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              onClick={() => navigate("/expenses")}
            >
              <CreditCard className="w-6 h-6 text-red-500" />
              <span className="text-sm">Add Expense</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              onClick={() => navigate("/budgets")}
            >
              <Target className="w-6 h-6 text-blue-500" />
              <span className="text-sm">View Budgets</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              onClick={() => navigate("/savings")}
            >
              <PiggyBank className="w-6 h-6 text-purple-500" />
              <span className="text-sm">Savings Goals</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              onClick={() => navigate("/expenses")}
            >
              <BarChart3 className="w-6 h-6 text-green-500" />
              <span className="text-sm">View Analytics</span>
            </Button>
          </div>
        </Card>

        {/* Budget Alerts */}
        {budgetAlerts.length > 0 && (
          <Card className="p-6 border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-950/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                  Budget Alerts
                </h3>
                <div className="space-y-2">
                  {budgetAlerts.map((budget) => {
                    const linkedExpenseIds = budget.linkedExpenseIds || [];
                    const budgetExpenses = expenses.filter((e) =>
                      linkedExpenseIds.includes(e.id)
                    );
                    const spent = budgetExpenses.reduce(
                      (sum, exp) => sum + calculateExpenseForBudgetPeriod(exp, budget.period),
                      0
                    );
                    const percentage = (spent / budget.amount) * 100;

                    return (
                      <div
                        key={budget.id}
                        className="text-sm text-orange-800 dark:text-orange-200"
                      >
                        • <span className="font-medium">{budget.name}</span> is{" "}
                        <span className="font-bold">{percentage.toFixed(0)}%</span> used (
                        {formatCurrency(spent, currencySymbol)} of{" "}
                        {formatCurrency(budget.amount, currencySymbol)})
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Budget Status */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              Budget Status
            </h3>
            <Button variant="ghost" size="sm" onClick={() => navigate("/budgets")}>
              View All
            </Button>
          </div>

          {activeBudgets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="mb-4">No active budgets</p>
              <Button onClick={() => navigate("/budgets/create")}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Budget
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {activeBudgets.slice(0, 5).map((budget) => {
                const linkedExpenseIds = budget.linkedExpenseIds || [];
                const budgetExpenses = expenses.filter((e) => linkedExpenseIds.includes(e.id));
                const spent = budgetExpenses.reduce(
                  (sum, exp) => sum + calculateExpenseForBudgetPeriod(exp, budget.period),
                  0
                );
                const remaining = Math.max(0, budget.amount - spent);
                const percentage = (spent / budget.amount) * 100;

                const getColor = () => {
                  if (percentage >= 100) return "text-red-500";
                  if (percentage >= 90) return "text-orange-500";
                  if (percentage >= 70) return "text-yellow-600";
                  return "text-green-500";
                };

                return (
                  <div key={budget.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{budget.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(spent, currencySymbol)} of{" "}
                          {formatCurrency(budget.amount, currencySymbol)}
                        </div>
                      </div>
                      <div className={`text-sm font-semibold ${getColor()}`}>
                        {percentage.toFixed(0)}%
                      </div>
                    </div>
                    <Progress value={Math.min(100, percentage)} className="h-2" />
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Spending Categories */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-500" />
              Top Spending Categories
            </h3>

            {topCategories.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No expenses this month</p>
              </div>
            ) : (
              <div className="space-y-4">
                {topCategories.map(([category, amount]) => {
                  const percentage = (amount / monthTotal) * 100;

                  return (
                    <div key={category}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium capitalize">{category}</span>
                        <div className="text-sm">
                          <span className="font-semibold">
                            {formatCurrency(amount, currencySymbol)}
                          </span>
                          <span className="text-muted-foreground ml-2">
                            {percentage.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Savings Goals */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <PiggyBank className="w-5 h-5 text-purple-500" />
                Savings Goals
              </h3>
              <Button variant="ghost" size="sm" onClick={() => navigate("/savings")}>
                View All
              </Button>
            </div>

            {savingsGoals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <PiggyBank className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="mb-4">No savings goals set</p>
                <Button onClick={() => navigate("/savings/create")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Goal
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {savingsGoals.slice(0, 3).map((goal) => {
                  const progress = goal.targetAmount
                    ? (goal.currentAmount / goal.targetAmount) * 100
                    : 0;
                  const isComplete = isGoalReached(goal);

                  return (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {goal.name}
                            {isComplete && (
                              <Badge className="bg-green-500">Reached!</Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatCurrency(goal.currentAmount, currencySymbol)}
                            {goal.targetAmount &&
                              ` of ${formatCurrency(goal.targetAmount, currencySymbol)}`}
                          </div>
                        </div>
                        {goal.targetAmount && (
                          <div className="text-sm font-semibold text-purple-600">
                            {Math.min(100, progress).toFixed(0)}%
                          </div>
                        )}
                      </div>
                      {goal.targetAmount && (
                        <Progress value={Math.min(100, progress)} className="h-2" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Recent Expenses
            </h3>
            <Button variant="ghost" size="sm" onClick={() => navigate("/expenses")}>
              View All
            </Button>
          </div>

          {expenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="mb-4">No expenses logged yet</p>
              <Button onClick={() => navigate("/expenses")}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Expense
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.slice(0, 5).map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-3 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer"
                  onClick={() => navigate("/expenses")}
                >
                  <div className="flex-1">
                    <div className="font-medium">{expense.title}</div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {expense.category} • {new Date(expense.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {formatCurrency(expense.amount, currencySymbol)}
                    </div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {expense.paymentMethod}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Financial Insights */}
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-900">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Financial Insights
          </h3>
          <div className="space-y-3">
            {netSavings > 0 && (
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
                <p className="text-sm">
                  You're saving <span className="font-semibold">{savingsRate.toFixed(1)}%</span> of
                  your income this month - {savingsRate >= 20 ? "Great job!" : "Keep it up!"}
                </p>
              </div>
            )}
            {weekTotal > 0 && (
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                <p className="text-sm">
                  This week you spent {formatCurrency(weekTotal, currencySymbol)} across{" "}
                  {weekExpenses.length} transactions
                </p>
              </div>
            )}
            {topCategories.length > 0 && (
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5" />
                <p className="text-sm">
                  Your top spending category is{" "}
                  <span className="font-semibold capitalize">{topCategories[0][0]}</span> (
                  {formatCurrency(topCategories[0][1], currencySymbol)})
                </p>
              </div>
            )}
            {avgBudgetHealth < 30 && activeBudgets.length > 0 && (
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5" />
                <p className="text-sm">
                  Your budgets are running low. Consider reviewing your spending or adjusting
                  budget amounts.
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
