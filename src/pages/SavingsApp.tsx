import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  PiggyBank,
  Target,
  TrendingUp,
  Calendar,
  Edit,
  Trash2,
  DollarSign,
} from "lucide-react";
import { useSavingsStorage } from "@/hooks/useSavingsStorage";
import { Savings, SAVINGS_CATEGORY_LABELS, SAVINGS_CATEGORY_COLORS } from "@/types/savings";
import {
  calculateSavingsProgress,
  calculateRemainingAmount,
  calculateDaysUntilGoal,
  isGoalReached,
  getSavingsStatusColor,
  calculateProjectedAmount,
  hasRecurringContributions,
} from "@/lib/utils-savings";
import { formatCurrency } from "@/lib/utils-expense";
import { toast } from "sonner";
import { format } from "date-fns";

const SavingsApp = () => {
  const navigate = useNavigate();
  const { savingsGoals, settings, isLoaded, deleteSavingsGoal, getContributionsForSavings } = useSavingsStorage();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Calculate summary statistics
  const totalSavingsGoals = savingsGoals.length;
  const totalTargetAmount = savingsGoals.reduce((sum, savings) => sum + (savings.targetAmount || 0), 0);
  const totalCurrentAmount = savingsGoals.reduce((sum, savings) => sum + savings.currentAmount, 0);
  const goalsReached = savingsGoals.filter((savings) => isGoalReached(savings)).length;
  const savingsWithTargets = savingsGoals.filter((s) => s.targetAmount && s.targetAmount > 0).length;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Savings Tracker" />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">My Savings Goals</h1>
              <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-sm font-semibold">
                <PiggyBank className="h-4 w-4" />
                <span>{totalSavingsGoals} Active</span>
              </div>
            </div>
            <p className="text-muted-foreground">
              Track your progress toward financial goals and build your savings
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button onClick={() => navigate("/savings/create")} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Savings Goal
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Goals</p>
              <Target className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold">{totalSavingsGoals}</p>
            <p className="text-xs text-muted-foreground">
              {savingsWithTargets > 0 ? `${goalsReached} of ${savingsWithTargets} completed` : "No target goals"}
            </p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Target</p>
              <PiggyBank className="h-4 w-4 text-purple-500" />
            </div>
            <p className="text-2xl font-bold">{formatCurrency(totalTargetAmount, settings.currencySymbol)}</p>
            <p className="text-xs text-muted-foreground">Across all goals</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Saved</p>
              <DollarSign className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(totalCurrentAmount, settings.currencySymbol)}
            </p>
            <p className="text-xs text-muted-foreground">
              {totalTargetAmount > 0 ? ((totalCurrentAmount / totalTargetAmount) * 100).toFixed(1) : 0}% of target
            </p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Remaining</p>
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </div>
            <p className="text-2xl font-bold text-orange-600">
              {formatCurrency(totalTargetAmount - totalCurrentAmount, settings.currencySymbol)}
            </p>
            <p className="text-xs text-muted-foreground">To reach all goals</p>
          </Card>
        </div>

        {/* Savings Goals List */}
        <div className="space-y-4">
          {savingsGoals.length === 0 ? (
            <Card className="p-12 text-center">
              <PiggyBank className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No savings goals yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first savings goal to start building toward your financial dreams
              </p>
              <Button onClick={() => navigate("/savings/create")}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Savings Goal
              </Button>
            </Card>
          ) : (
            savingsGoals.map((savings) => {
              const progress = calculateSavingsProgress(savings);
              const remaining = calculateRemainingAmount(savings);
              const daysUntilGoal = calculateDaysUntilGoal(savings);
              const goalReached = isGoalReached(savings);
              const statusColor = getSavingsStatusColor(savings);
              const contributions = getContributionsForSavings(savings.id);
              const projectedAmount = calculateProjectedAmount(savings);
              const hasRecurring = hasRecurringContributions(savings);

              return (
                <Card key={savings.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-semibold">{savings.name}</h3>
                        {goalReached && (
                          <Badge variant="default" className="bg-green-500">
                            Goal Reached!
                          </Badge>
                        )}
                        {savings.category && (
                          <Badge
                            variant="outline"
                            style={{
                              borderColor: SAVINGS_CATEGORY_COLORS[savings.category],
                              color: SAVINGS_CATEGORY_COLORS[savings.category],
                            }}
                          >
                            {SAVINGS_CATEGORY_LABELS[savings.category]}
                          </Badge>
                        )}
                      </div>
                      {savings.description && (
                        <p className="text-sm text-muted-foreground">{savings.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/savings/${savings.id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm(`Delete savings goal "${savings.name}"?`)) {
                            deleteSavingsGoal(savings.id);
                            toast.success("Savings goal deleted");
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {hasRecurring && savings.goalDate && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center justify-between text-sm">
                          <div>
                            <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">Projected by {format(savings.goalDate, "MMM d, yyyy")}</p>
                            <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                              {formatCurrency(projectedAmount, settings.currencySymbol)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-blue-700 dark:text-blue-300">
                              +{formatCurrency(savings.recurringContributionAmount || 0, settings.currencySymbol)}/{savings.recurringContributionFrequency}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <div>
                          <span className="text-muted-foreground">Saved: </span>
                          <span className="font-semibold text-green-600">
                            {formatCurrency(savings.currentAmount, settings.currencySymbol)}
                          </span>
                        </div>
                        {savings.targetAmount && savings.targetAmount > 0 ? (
                          <>
                            <div>
                              <span className="text-muted-foreground">Goal: </span>
                              <span className="font-semibold">
                                {formatCurrency(savings.targetAmount, settings.currencySymbol)}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Remaining: </span>
                              <span className="font-semibold text-orange-600">
                                {formatCurrency(remaining, settings.currencySymbol)}
                              </span>
                            </div>
                          </>
                        ) : (
                          <div>
                            <Badge variant="outline" className="text-xs">
                              No Target - Tracking Growth
                            </Badge>
                          </div>
                        )}
                      </div>
                      {savings.targetAmount && savings.targetAmount > 0 && (
                        <div className="text-right">
                          <span className="font-semibold">{progress.toFixed(1)}%</span>
                        </div>
                      )}
                    </div>

                    {savings.targetAmount && savings.targetAmount > 0 && (
                      <Progress
                        value={Math.min(progress, 100)}
                        className="h-3"
                        indicatorClassName={
                          statusColor === "green"
                            ? "bg-green-500"
                            : statusColor === "yellow"
                            ? "bg-yellow-500"
                            : statusColor === "orange"
                            ? "bg-orange-500"
                            : "bg-blue-500"
                        }
                      />
                    )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                      <div className="flex items-center gap-4">
                        <span>{contributions.length} contribution(s)</span>
                        {savings.goalDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              Target: {format(savings.goalDate, "MMM d, yyyy")}
                              {daysUntilGoal !== null && (
                                <span className="ml-1">
                                  ({daysUntilGoal > 0 ? `${daysUntilGoal} days left` : "Overdue"})
                                </span>
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-xs"
                        onClick={() => navigate(`/savings/${savings.id}/edit`)}
                      >
                        Manage & Contribute
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default SavingsApp;
