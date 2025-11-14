import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Plus, Trash2, TrendingUp, Calendar } from "lucide-react";
import { useSavingsStorage } from "@/hooks/useSavingsStorage";
import { useBudgetStorage } from "@/hooks/useBudgetStorage";
import { Savings, SavingsContribution, SAVINGS_CATEGORY_LABELS, SAVINGS_CATEGORY_COLORS } from "@/types/savings";
import {
  generateContributionId,
  calculateSavingsProgress,
  calculateRemainingAmount,
  calculateDaysUntilGoal,
  calculateSuggestedContribution,
  calculateProjectedAmount,
  hasRecurringContributions,
} from "@/lib/utils-savings";
import { calculateExpenseForBudgetPeriod } from "@/lib/utils-budget";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils-expense";
import { format } from "date-fns";

const EditSavings = () => {
  const navigate = useNavigate();
  const { savingsId } = useParams<{ savingsId: string }>();
  const {
    savingsGoals,
    updateSavingsGoal,
    settings: savingsSettings,
    isLoaded: savingsLoaded,
    addContribution,
    deleteContribution,
    getContributionsForSavings,
  } = useSavingsStorage();
  const { budgets, settings: budgetSettings, isLoaded: budgetsLoaded } = useBudgetStorage();

  const savingsGoal = savingsGoals.find((s) => s.id === savingsId);

  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [category, setCategory] = useState<Savings["category"]>("general");
  const [description, setDescription] = useState("");
  const [goalDate, setGoalDate] = useState("");
  const [linkedBudgetIds, setLinkedBudgetIds] = useState<string[]>([]);
  const [recurringContributionAmount, setRecurringContributionAmount] = useState("");
  const [recurringContributionFrequency, setRecurringContributionFrequency] = useState<Savings["recurringContributionFrequency"]>("biweekly");

  // Contribution dialog state
  const [showContributionDialog, setShowContributionDialog] = useState(false);
  const [contributionAmount, setContributionAmount] = useState("");
  const [contributionDescription, setContributionDescription] = useState("");
  const [contributionDate, setContributionDate] = useState(new Date().toISOString().split("T")[0]);

  // Initialize form with savings data when loaded
  useEffect(() => {
    if (savingsGoal) {
      setName(savingsGoal.name);
      setTargetAmount(savingsGoal.targetAmount ? savingsGoal.targetAmount.toString() : "");
      setCategory(savingsGoal.category || "general");
      setDescription(savingsGoal.description || "");
      setGoalDate(savingsGoal.goalDate ? new Date(savingsGoal.goalDate).toISOString().split("T")[0] : "");
      setLinkedBudgetIds(savingsGoal.linkedBudgetIds || []);
      setRecurringContributionAmount(savingsGoal.recurringContributionAmount ? savingsGoal.recurringContributionAmount.toString() : "");
      setRecurringContributionFrequency(savingsGoal.recurringContributionFrequency || "biweekly");
    }
  }, [savingsGoal]);

  const toggleBudgetLink = (budgetId: string) => {
    setLinkedBudgetIds((prev) =>
      prev.includes(budgetId)
        ? prev.filter((id) => id !== budgetId)
        : [...prev, budgetId]
    );
  };

  const handleSubmit = () => {
    if (!savingsId || !savingsGoal) {
      toast.error("Savings not found");
      return;
    }

    if (!name.trim()) {
      toast.error("Please enter a savings name");
      return;
    }

    // Target amount is optional
    const parsedTarget = targetAmount.trim() ? parseFloat(targetAmount) : undefined;
    if (targetAmount.trim() && (!parsedTarget || parsedTarget <= 0)) {
      toast.error("Target amount must be greater than 0");
      return;
    }

    const parsedRecurringAmount = recurringContributionAmount.trim() ? parseFloat(recurringContributionAmount) : undefined;
    if (recurringContributionAmount.trim() && (!parsedRecurringAmount || parsedRecurringAmount <= 0)) {
      toast.error("Recurring contribution amount must be greater than 0");
      return;
    }

    console.log("Updating savings:", savingsId, {
      name: name.trim(),
      targetAmount: parsedTarget,
      category,
      description: description.trim() || undefined,
      goalDate: goalDate ? new Date(goalDate) : undefined,
      linkedBudgetIds: linkedBudgetIds.length > 0 ? linkedBudgetIds : undefined,
      recurringContributionAmount: parsedRecurringAmount,
      recurringContributionFrequency: parsedRecurringAmount ? recurringContributionFrequency : undefined,
    });

    updateSavingsGoal(savingsId, {
      name: name.trim(),
      targetAmount: parsedTarget,
      category,
      description: description.trim() || undefined,
      goalDate: goalDate ? new Date(goalDate) : undefined,
      linkedBudgetIds: linkedBudgetIds.length > 0 ? linkedBudgetIds : undefined,
      recurringContributionAmount: parsedRecurringAmount,
      recurringContributionFrequency: parsedRecurringAmount ? recurringContributionFrequency : undefined,
    });

    toast.success(`Savings "${name}" updated successfully!`);

    setTimeout(() => {
      navigate("/savings");
    }, 100);
  };

  const handleAddContribution = () => {
    if (!savingsId || !savingsGoal) return;

    if (!contributionAmount || parseFloat(contributionAmount) <= 0) {
      toast.error("Please enter a valid contribution amount");
      return;
    }

    const newContribution: SavingsContribution = {
      id: generateContributionId(),
      savingsId,
      amount: parseFloat(contributionAmount),
      date: new Date(contributionDate),
      description: contributionDescription.trim() || undefined,
      source: "manual",
      createdAt: new Date(),
    };

    addContribution(newContribution);
    toast.success(`Added ${formatCurrency(newContribution.amount, savingsSettings.currencySymbol)} to savings`);

    // Reset form
    setContributionAmount("");
    setContributionDescription("");
    setContributionDate(new Date().toISOString().split("T")[0]);
    setShowContributionDialog(false);
  };

  if (!savingsLoaded || !budgetsLoaded) {
    return (
      <AppLayout title="Edit Savings Goal">
        <p className="text-muted-foreground">Loading...</p>
      </AppLayout>
    );
  }

  if (!savingsGoal) {
    return (
      <AppLayout title="Edit Savings Goal">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Savings goal not found</p>
          <Button onClick={() => navigate("/savings")}>Back to Savings</Button>
        </div>
      </AppLayout>
    );
  }

  const progress = calculateSavingsProgress(savingsGoal);
  const remaining = calculateRemainingAmount(savingsGoal);
  const daysUntilGoal = calculateDaysUntilGoal(savingsGoal);
  const suggestedMonthly = calculateSuggestedContribution(savingsGoal, "monthly");
  const contributions = getContributionsForSavings(savingsId);
  const projectedAmount = calculateProjectedAmount(savingsGoal);
  const hasRecurring = hasRecurringContributions(savingsGoal);

  // Calculate budget remainders
  const budgetRemainders = linkedBudgetIds.reduce((total, budgetId) => {
    const budget = budgets.find((b) => b.id === budgetId);
    if (!budget) return total;

    const linkedExpenses = budget.linkedExpenseIds || [];
    const storedExpenses = localStorage.getItem("daily-haven-expenses");
    if (!storedExpenses) return total + budget.amount;

    const allExpenses = JSON.parse(storedExpenses);
    const budgetExpenses = allExpenses.filter((exp: any) => linkedExpenses.includes(exp.id));
    const spent = budgetExpenses.reduce((sum: number, exp: any) => {
      return sum + calculateExpenseForBudgetPeriod(exp, budget.period);
    }, 0);

    return total + Math.max(0, budget.amount - spent);
  }, 0);

  return (
    <AppLayout title="Edit Savings Goal" containerClassName="max-w-6xl">
        <Button variant="ghost" onClick={() => navigate("/savings")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Savings
        </Button>

        {/* Progress Overview */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">{savingsGoal.name}</h2>
              <p className="text-muted-foreground">Track progress and manage contributions</p>
            </div>
            <Badge
              variant="outline"
              style={{
                borderColor: savingsGoal.category ? SAVINGS_CATEGORY_COLORS[savingsGoal.category] : undefined,
                color: savingsGoal.category ? SAVINGS_CATEGORY_COLORS[savingsGoal.category] : undefined,
              }}
            >
              {savingsGoal.category && SAVINGS_CATEGORY_LABELS[savingsGoal.category]}
            </Badge>
          </div>

          {hasRecurring && savingsGoal.goalDate && (
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                    Projected by {format(savingsGoal.goalDate, "MMM d, yyyy")}
                  </p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {formatCurrency(projectedAmount, savingsSettings.currencySymbol)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Recurring: +{formatCurrency(savingsGoal.recurringContributionAmount || 0, savingsSettings.currencySymbol)}/{savingsGoal.recurringContributionFrequency}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    Total projected growth: +{formatCurrency(projectedAmount - savingsGoal.currentAmount, savingsSettings.currencySymbol)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Current Amount</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(savingsGoal.currentAmount, savingsSettings.currencySymbol)}
              </p>
            </div>
            {savingsGoal.targetAmount && savingsGoal.targetAmount > 0 ? (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Target Amount</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(savingsGoal.targetAmount, savingsSettings.currencySymbol)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Remaining</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatCurrency(remaining, savingsSettings.currencySymbol)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Progress</p>
                  <p className="text-2xl font-bold">{progress.toFixed(1)}%</p>
                </div>
              </>
            ) : (
              <div className="col-span-3">
                <p className="text-sm text-muted-foreground">Mode</p>
                <p className="text-lg font-semibold text-blue-600">Tracking Growth (No Target Set)</p>
              </div>
            )}
          </div>

          {savingsGoal.targetAmount && savingsGoal.targetAmount > 0 && (
            <Progress value={Math.min(progress, 100)} className="h-3 mb-4" />
          )}

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              {savingsGoal.goalDate && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Target: {format(savingsGoal.goalDate, "MMM d, yyyy")}
                    {daysUntilGoal !== null && (
                      <span className="ml-1">
                        ({daysUntilGoal > 0 ? `${daysUntilGoal} days left` : "Overdue"})
                      </span>
                    )}
                  </span>
                </div>
              )}
              {suggestedMonthly > 0 && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span>
                    Suggested: {formatCurrency(suggestedMonthly, savingsSettings.currencySymbol)}/month
                  </span>
                </div>
              )}
            </div>
            <Button onClick={() => setShowContributionDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Contribution
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Savings Details */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Savings Details</h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Goal Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Emergency Fund"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={category}
                  onValueChange={(v) => setCategory(v as Savings["category"])}
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(SAVINGS_CATEGORY_LABELS) as Array<keyof typeof SAVINGS_CATEGORY_LABELS>).map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: SAVINGS_CATEGORY_COLORS[cat] }}
                          />
                          {SAVINGS_CATEGORY_LABELS[cat]}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAmount">Target Amount ({savingsSettings.currencySymbol}) - Optional</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00 (Leave empty to track without a goal)"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Optional: Set a savings goal or leave empty to just track growth
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goalDate">Target Date (Optional)</Label>
                <Input
                  id="goalDate"
                  type="date"
                  value={goalDate}
                  onChange={(e) => setGoalDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Add notes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Recurring Contributions */}
              <div className="space-y-3 pt-4 border-t">
                <div>
                  <Label className="text-base font-semibold">Recurring Contributions (Optional)</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Set up automatic recurring deposits to track projected savings
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recurringAmount">Contribution Amount ({savingsSettings.currencySymbol})</Label>
                  <Input
                    id="recurringAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g., 300.00"
                    value={recurringContributionAmount}
                    onChange={(e) => setRecurringContributionAmount(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recurringFrequency">Frequency</Label>
                  <Select
                    value={recurringContributionFrequency}
                    onValueChange={(v) => setRecurringContributionFrequency(v as Savings["recurringContributionFrequency"])}
                  >
                    <SelectTrigger id="recurringFrequency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Every 2 Weeks (Biweekly)</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    How often you plan to add money to this savings goal
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => navigate("/savings")} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!name.trim()}
                  className="flex-1"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </Card>

          {/* Contributions & Budgets */}
          <div className="space-y-6">
            {/* Linked Budgets */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Linked Budgets</h2>

              {linkedBudgetIds.length > 0 && (
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-900 dark:text-green-100">
                      Available from budgets:
                    </span>
                    <span className="font-semibold text-green-700 dark:text-green-300">
                      {formatCurrency(budgetRemainders, budgetSettings.currencySymbol)}
                    </span>
                  </div>
                </div>
              )}

              {budgets.length === 0 ? (
                <p className="text-sm text-muted-foreground">No budgets available</p>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {budgets.map((budget) => {
                    const isLinked = linkedBudgetIds.includes(budget.id);

                    return (
                      <div
                        key={budget.id}
                        className={`flex items-center gap-2 p-2 rounded border cursor-pointer ${
                          isLinked ? "border-primary bg-primary/10" : "border-border"
                        }`}
                        onClick={() => toggleBudgetLink(budget.id)}
                      >
                        <Checkbox checked={isLinked} onCheckedChange={() => toggleBudgetLink(budget.id)} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{budget.name}</p>
                          <p className="text-xs text-muted-foreground">{budget.period}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Contributions List */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Contribution History</h2>

              {contributions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No contributions yet
                </p>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {contributions.map((contribution) => (
                    <div
                      key={contribution.id}
                      className="flex items-center justify-between p-3 rounded border"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-green-600">
                            +{formatCurrency(contribution.amount, savingsSettings.currencySymbol)}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {contribution.source || "manual"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {format(contribution.date, "MMM d, yyyy")}
                          {contribution.description && ` • ${contribution.description}`}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm("Delete this contribution?")) {
                            deleteContribution(contribution.id);
                            toast.success("Contribution deleted");
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>

      {/* Add Contribution Dialog */}
      <Dialog open={showContributionDialog} onOpenChange={setShowContributionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Contribution</DialogTitle>
            <DialogDescription>
              Add money to your savings goal
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="contrib-amount">Amount ({savingsSettings.currencySymbol}) *</Label>
              <Input
                id="contrib-amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={contributionAmount}
                onChange={(e) => setContributionAmount(e.target.value)}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contrib-date">Date</Label>
              <Input
                id="contrib-date"
                type="date"
                value={contributionDate}
                onChange={(e) => setContributionDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contrib-description">Description (Optional)</Label>
              <Input
                id="contrib-description"
                placeholder="e.g., Monthly savings"
                value={contributionDescription}
                onChange={(e) => setContributionDescription(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowContributionDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddContribution}
              disabled={!contributionAmount || parseFloat(contributionAmount) <= 0}
            >
              Add Contribution
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default EditSavings;
