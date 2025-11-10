import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, PiggyBank, Info } from "lucide-react";
import { useSavingsStorage } from "@/hooks/useSavingsStorage";
import { useBudgetStorage } from "@/hooks/useBudgetStorage";
import { Savings, SAVINGS_CATEGORY_LABELS, SAVINGS_CATEGORY_COLORS } from "@/types/savings";
import { generateSavingsId } from "@/lib/utils-savings";
import { calculateExpenseForBudgetPeriod } from "@/lib/utils-budget";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils-expense";

const CreateSavings = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const budgetIdFromUrl = searchParams.get("budgetId");

  const { addSavingsGoal, settings: savingsSettings, isLoaded: savingsLoaded } = useSavingsStorage();
  const { budgets, settings: budgetSettings, isLoaded: budgetsLoaded } = useBudgetStorage();

  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("0");
  const [category, setCategory] = useState<Savings["category"]>("general");
  const [description, setDescription] = useState("");
  const [goalDate, setGoalDate] = useState("");
  const [linkedBudgetIds, setLinkedBudgetIds] = useState<string[]>(
    budgetIdFromUrl ? [budgetIdFromUrl] : []
  );
  const [autoContribute, setAutoContribute] = useState(false);
  const [recurringContributionAmount, setRecurringContributionAmount] = useState("");
  const [recurringContributionFrequency, setRecurringContributionFrequency] = useState<Savings["recurringContributionFrequency"]>("biweekly");

  // Calculate available budget remainder for suggestion
  const calculateBudgetRemainders = () => {
    if (!budgetsLoaded) return 0;

    return budgets.reduce((total, budget) => {
      if (!linkedBudgetIds.includes(budget.id)) return total;

      // Get linked expenses for this budget
      const linkedExpenses = budget.linkedExpenseIds || [];
      const storedExpenses = localStorage.getItem("daily-haven-expenses");
      if (!storedExpenses) return total;

      const allExpenses = JSON.parse(storedExpenses);
      const budgetExpenses = allExpenses.filter((exp: any) => linkedExpenses.includes(exp.id));

      // Calculate spent with period adjustment
      const spent = budgetExpenses.reduce((sum: number, exp: any) => {
        return sum + calculateExpenseForBudgetPeriod(exp, budget.period);
      }, 0);

      const remainder = Math.max(0, budget.amount - spent);
      return total + remainder;
    }, 0);
  };

  const toggleBudgetLink = (budgetId: string) => {
    setLinkedBudgetIds((prev) =>
      prev.includes(budgetId)
        ? prev.filter((id) => id !== budgetId)
        : [...prev, budgetId]
    );
  };

  const handleSuggestFromBudget = () => {
    const remainders = calculateBudgetRemainders();
    if (remainders > 0) {
      setTargetAmount(remainders.toFixed(2));
      toast.success(`Suggested ${budgetSettings.currencySymbol}${remainders.toFixed(2)} from linked budget remainders`);
    } else {
      toast.warning("No budget remainder available from linked budgets");
    }
  };

  const handleSubmit = () => {
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

    if (!savingsLoaded) {
      toast.error("Still loading... Please wait.");
      return;
    }

    const parsedRecurringAmount = recurringContributionAmount.trim() ? parseFloat(recurringContributionAmount) : undefined;
    if (recurringContributionAmount.trim() && (!parsedRecurringAmount || parsedRecurringAmount <= 0)) {
      toast.error("Recurring contribution amount must be greater than 0");
      return;
    }

    const newSavings: Savings = {
      id: generateSavingsId(),
      name: name.trim(),
      targetAmount: parsedTarget,
      currentAmount: parseFloat(currentAmount) || 0,
      category,
      description: description.trim() || undefined,
      goalDate: goalDate ? new Date(goalDate) : undefined,
      linkedBudgetIds: linkedBudgetIds.length > 0 ? linkedBudgetIds : undefined,
      autoContribute,
      recurringContributionAmount: parsedRecurringAmount,
      recurringContributionFrequency: parsedRecurringAmount ? recurringContributionFrequency : undefined,
      createdAt: new Date(),
    };

    console.log("Creating savings goal:", newSavings);
    addSavingsGoal(newSavings);
    toast.success(`Savings "${newSavings.name}" created successfully!`);

    // Add a small delay to ensure localStorage is updated
    setTimeout(() => {
      navigate("/savings");
    }, 100);
  };

  if (!savingsLoaded || !budgetsLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const budgetRemainders = calculateBudgetRemainders();

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Create Savings Goal" />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate("/savings")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Savings
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Savings Details */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">Savings Goal Details</h2>

            <div className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Goal Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Emergency Fund, New Car, Vacation"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {/* Category */}
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

              {/* Target Amount */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="targetAmount">Target Amount ({savingsSettings.currencySymbol}) - Optional</Label>
                  {linkedBudgetIds.length > 0 && budgetRemainders > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSuggestFromBudget}
                      className="flex items-center gap-1"
                    >
                      <PiggyBank className="h-3 w-3" />
                      Suggest from Budget
                    </Button>
                  )}
                </div>
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

              {/* Starting Amount */}
              <div className="space-y-2">
                <Label htmlFor="currentAmount">Starting Amount ({savingsSettings.currencySymbol})</Label>
                <Input
                  id="currentAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Optional: Enter any amount you've already saved
                </p>
              </div>

              {/* Goal Date */}
              <div className="space-y-2">
                <Label htmlFor="goalDate">Target Date (Optional)</Label>
                <Input
                  id="goalDate"
                  type="date"
                  value={goalDate}
                  onChange={(e) => setGoalDate(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Set a deadline to reach your savings goal
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Add notes about this savings goal..."
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

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => navigate("/savings")} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!name.trim()}
                  className="flex-1"
                >
                  Create Savings
                </Button>
              </div>
            </div>
          </Card>

          {/* Link Budgets */}
          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Link Budgets</h2>
              <p className="text-sm text-muted-foreground">
                Track budget remainders to contribute to this savings goal
              </p>
            </div>

            {budgets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No budgets available.</p>
                <Button
                  variant="link"
                  onClick={() => navigate("/budgets/create")}
                  className="mt-2"
                >
                  Create a Budget First
                </Button>
              </div>
            ) : (
              <>
                {linkedBudgetIds.length > 0 && (
                  <div className="mb-4 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-900 dark:text-green-100">
                        Available from linked budgets:
                      </span>
                      <span className="font-semibold text-green-700 dark:text-green-300">
                        {formatCurrency(budgetRemainders, budgetSettings.currencySymbol)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {budgets.map((budget) => {
                    const isLinked = linkedBudgetIds.includes(budget.id);

                    // Calculate budget remainder
                    const linkedExpenses = budget.linkedExpenseIds || [];
                    const storedExpenses = localStorage.getItem("daily-haven-expenses");
                    let remainder = budget.amount;

                    if (storedExpenses) {
                      const allExpenses = JSON.parse(storedExpenses);
                      const budgetExpenses = allExpenses.filter((exp: any) => linkedExpenses.includes(exp.id));
                      const spent = budgetExpenses.reduce((sum: number, exp: any) => {
                        return sum + calculateExpenseForBudgetPeriod(exp, budget.period);
                      }, 0);
                      remainder = Math.max(0, budget.amount - spent);
                    }

                    return (
                      <div
                        key={budget.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                          isLinked
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => toggleBudgetLink(budget.id)}
                      >
                        <Checkbox
                          checked={isLinked}
                          onCheckedChange={() => toggleBudgetLink(budget.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium truncate">{budget.name}</p>
                            <div className="flex flex-col items-end flex-shrink-0">
                              <span className="font-semibold text-green-600">
                                {formatCurrency(remainder, budgetSettings.currencySymbol)}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                remaining
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="secondary" className="text-xs">
                              {budget.period}
                            </Badge>
                            <span>
                              {formatCurrency(budget.amount, budgetSettings.currencySymbol)} budget
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </Card>
        </div>

        {/* Info Card */}
        <Card className="p-4 mt-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                How Budget Linking Works
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Linking budgets connects them for tracking purposes. When you add contributions to this savings,
                it will reduce the linked budget's available balance, helping you accurately track how money flows
                from budgets into savings. Target amounts are optional - you can track savings growth without a specific goal.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CreateSavings;
