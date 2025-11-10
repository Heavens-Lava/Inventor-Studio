import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Download, Sparkles } from "lucide-react";
import { useBudgetStorage } from "@/hooks/useBudgetStorage";
import { Budget } from "@/types/budget";
import {
  ExpenseCategory,
  Expense,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
} from "@/types/expense";
import { generateBudgetId, createBudgetFromExpenses } from "@/lib/utils-budget";
import { toast } from "sonner";

const CreateBudget = () => {
  const navigate = useNavigate();
  const { addBudget, settings, isLoaded } = useBudgetStorage();

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory | "all">("all");
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly");
  const [description, setDescription] = useState("");
  const [alertThreshold, setAlertThreshold] = useState("80");
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Load expenses on mount
  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = () => {
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
        setExpenses(expensesWithDates);
      }
    } catch (error) {
      console.error("Error loading expenses:", error);
    }
  };

  const handleSuggestBudget = () => {
    if (expenses.length === 0) {
      toast.error("No expenses found. Add expenses first to get suggestions.");
      return;
    }

    const suggestedAmount = createBudgetFromExpenses(
      expenses,
      category === "all" ? undefined : category,
      period
    );

    if (suggestedAmount === 0) {
      toast.warning("No expenses found for this category/period");
      return;
    }

    // Round up to nearest 10
    const roundedAmount = Math.ceil(suggestedAmount / 10) * 10;
    setAmount(roundedAmount.toString());

    toast.success(
      `Suggested budget: ${settings.currencySymbol}${roundedAmount.toFixed(2)} based on your spending history`
    );
  };

  const handleSubmit = () => {
    if (!name.trim() || !amount || parseFloat(amount) <= 0) {
      toast.error("Please fill in required fields");
      return;
    }

    if (!isLoaded) {
      toast.error("Still loading... Please wait.");
      return;
    }

    const newBudget: Budget = {
      id: generateBudgetId(),
      name: name.trim(),
      amount: parseFloat(amount),
      category: category === "all" ? undefined : category,
      period,
      startDate: new Date(),
      description: description.trim() || undefined,
      alertThreshold: parseFloat(alertThreshold),
      linkedExpenseIds: [], // Start with no linked expenses
      createdAt: new Date(),
    };

    console.log("Creating budget:", newBudget);
    addBudget(newBudget);
    toast.success(`Budget "${newBudget.name}" created successfully!`);

    // Add a small delay to ensure localStorage is updated
    setTimeout(() => {
      navigate("/budgets");
    }, 100);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Create Budget" />

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/budgets")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Budgets
        </Button>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Create New Budget</h2>
            {expenses.length > 0 && (
              <Badge variant="secondary">
                {expenses.length} expenses available
              </Badge>
            )}
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Budget Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Monthly Groceries, Weekly Entertainment"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Amount with Smart Suggestion */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="amount">Budget Amount ({settings.currencySymbol}) *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSuggestBudget}
                  className="flex items-center gap-1"
                >
                  <Sparkles className="h-3 w-3" />
                  Suggest from Expenses
                </Button>
              </div>
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
              <p className="text-xs text-muted-foreground">
                Click "Suggest from Expenses" to automatically calculate based on your spending history
              </p>
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
                placeholder="80"
                value={alertThreshold}
                onChange={(e) => setAlertThreshold(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Get notified when you reach this percentage of your budget
              </p>
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
                Create Budget
              </Button>
            </div>
          </div>
        </Card>

        {/* Info Card */}
        <Card className="p-4 mt-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <div className="flex gap-3">
            <Download className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Smart Budget Suggestions
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                We analyze your expense history to suggest realistic budget amounts. The suggestion
                is based on your average spending for the selected category and period.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CreateBudget;
