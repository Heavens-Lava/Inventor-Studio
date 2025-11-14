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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Check } from "lucide-react";
import { useBudgetStorage } from "@/hooks/useBudgetStorage";
import {
  ExpenseCategory,
  Expense,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
} from "@/types/expense";
import { calculateExpenseForBudgetPeriod, calculateSavingsAllocations } from "@/lib/utils-budget";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils-expense";
import { format } from "date-fns";

const EditBudget = () => {
  const navigate = useNavigate();
  const { budgetId } = useParams<{ budgetId: string }>();
  const { budgets, updateBudget, settings, isLoaded } = useBudgetStorage();

  const budget = budgets.find((b) => b.id === budgetId);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory | "all">("all");
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly");
  const [description, setDescription] = useState("");
  const [alertThreshold, setAlertThreshold] = useState("80");
  const [linkedExpenseIds, setLinkedExpenseIds] = useState<string[]>([]);
  const [availableExpenses, setAvailableExpenses] = useState<Expense[]>([]);

  // Initialize form with budget data when budget is loaded
  useEffect(() => {
    if (budget) {
      setName(budget.name);
      setAmount(budget.amount.toString());
      setCategory(budget.category || "all");
      setPeriod(budget.period);
      setDescription(budget.description || "");
      setAlertThreshold(budget.alertThreshold?.toString() || "80");
      setLinkedExpenseIds(budget.linkedExpenseIds || []);
    }
  }, [budget]);

  // Load available expenses
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
        setAvailableExpenses(expensesWithDates);
      }
    } catch (error) {
      console.error("Error loading expenses:", error);
    }
  }, []);

  const toggleExpenseLink = (expenseId: string) => {
    setLinkedExpenseIds((prev) =>
      prev.includes(expenseId)
        ? prev.filter((id) => id !== expenseId)
        : [...prev, expenseId]
    );
  };

  const handleSubmit = () => {
    if (!budgetId || !budget) {
      toast.error("Budget not found");
      return;
    }

    if (!name.trim() || !amount || parseFloat(amount) <= 0) {
      toast.error("Please fill in required fields");
      return;
    }

    console.log("Updating budget:", budgetId, {
      name: name.trim(),
      amount: parseFloat(amount),
      category: category === "all" ? undefined : category,
      period,
      description: description.trim() || undefined,
      alertThreshold: parseFloat(alertThreshold),
      linkedExpenseIds,
    });

    updateBudget(budgetId, {
      name: name.trim(),
      amount: parseFloat(amount),
      category: category === "all" ? undefined : category,
      period,
      description: description.trim() || undefined,
      alertThreshold: parseFloat(alertThreshold),
      linkedExpenseIds,
    });

    toast.success(`Budget "${name}" updated successfully!`);

    // Add a small delay to ensure localStorage is updated
    setTimeout(() => {
      navigate("/budgets");
    }, 100);
  };

  if (!isLoaded) {
    return (
      <AppLayout title="Edit Budget">
        <p className="text-muted-foreground">Loading...</p>
      </AppLayout>
    );
  }

  if (!budget) {
    return (
      <AppLayout title="Edit Budget">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Budget not found</p>
          <Button onClick={() => navigate("/budgets")}>Back to Budgets</Button>
        </div>
      </AppLayout>
    );
  }

  const linkedExpenses = availableExpenses.filter((exp) =>
    linkedExpenseIds.includes(exp.id)
  );
  // Calculate total adjusted for budget period
  const totalLinkedAmount = linkedExpenses.reduce((sum, exp) =>
    sum + calculateExpenseForBudgetPeriod(exp, period), 0);
  // Calculate savings allocations
  const savingsAllocated = budgetId ? calculateSavingsAllocations(budgetId, period) : 0;
  const available = parseFloat(amount) - totalLinkedAmount - savingsAllocated;

  return (
    <AppLayout title="Edit Budget" containerClassName="max-w-4xl">
        <Button variant="ghost" onClick={() => navigate("/budgets")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Budgets
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Budget Details */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">Budget Details</h2>

            <div className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Budget Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Monthly Groceries"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Budget Amount ({settings.currencySymbol}) *</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={category}
                    onValueChange={(v) => setCategory(v as ExpenseCategory | "all")}
                  >
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {(Object.keys(CATEGORY_LABELS) as ExpenseCategory[]).map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: CATEGORY_COLORS[cat] }}
                            />
                            {CATEGORY_LABELS[cat]}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Period */}
                <div className="space-y-2">
                  <Label htmlFor="period">Period</Label>
                  <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
                    <SelectTrigger id="period">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Alert Threshold */}
              <div className="space-y-2">
                <Label htmlFor="alertThreshold">Alert Threshold (%)</Label>
                <Input
                  id="alertThreshold"
                  type="number"
                  min="0"
                  max="100"
                  step="5"
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(e.target.value)}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Add notes about this budget..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => navigate("/budgets")} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!name.trim() || !amount || parseFloat(amount) <= 0}
                  className="flex-1"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </Card>

          {/* Link Expenses */}
          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Link Expenses</h2>
              <p className="text-sm text-muted-foreground">
                Select which expenses count toward this budget
              </p>
            </div>

            {/* Summary */}
            <div className="mb-4 p-4 bg-secondary/50 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Linked Expenses:</span>
                <Badge variant="secondary">{linkedExpenseIds.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Expenses Total:</span>
                <span className="font-semibold text-red-600">
                  {formatCurrency(totalLinkedAmount, settings.currencySymbol)}
                </span>
              </div>
              {savingsAllocated > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Savings Allocated:</span>
                  <span className="font-semibold text-blue-600">
                    {formatCurrency(savingsAllocated, settings.currencySymbol)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm font-medium">Available:</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(available, settings.currencySymbol)}
                </span>
              </div>
            </div>

            {/* Expense List */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {availableExpenses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No expenses available.</p>
                  <Button
                    variant="link"
                    onClick={() => navigate("/expenses")}
                    className="mt-2"
                  >
                    Go to Expense Tracker
                  </Button>
                </div>
              ) : (
                availableExpenses.map((expense) => {
                  const isLinked = linkedExpenseIds.includes(expense.id);
                  const periodAdjustedAmount = calculateExpenseForBudgetPeriod(expense, period);
                  const isDifferentAmount = periodAdjustedAmount !== expense.amount;

                  return (
                    <div
                      key={expense.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                        isLinked
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => toggleExpenseLink(expense.id)}
                    >
                      <Checkbox checked={isLinked} onCheckedChange={() => toggleExpenseLink(expense.id)} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium truncate">{expense.title}</p>
                          <div className="flex flex-col items-end flex-shrink-0">
                            <span className="font-semibold text-red-600">
                              {formatCurrency(periodAdjustedAmount, settings.currencySymbol)}
                            </span>
                            {isDifferentAmount && expense.isRecurring && (
                              <span className="text-xs text-muted-foreground">
                                {formatCurrency(expense.amount, settings.currencySymbol)}/{expense.recurringFrequency}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {CATEGORY_LABELS[expense.category]}
                          </Badge>
                          <span>{format(expense.date, "MMM d, yyyy")}</span>
                          {expense.isRecurring && isDifferentAmount && (
                            <Badge variant="secondary" className="text-xs">
                              ≈ {formatCurrency(periodAdjustedAmount, settings.currencySymbol)}/{period}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
    </AppLayout>
  );
};

export default EditBudget;
