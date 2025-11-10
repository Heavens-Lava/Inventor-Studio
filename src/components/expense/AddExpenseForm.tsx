import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Expense,
  ExpenseCategory,
  PaymentMethod,
  RecurringFrequency,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  PAYMENT_METHOD_LABELS,
  RECURRING_FREQUENCY_LABELS,
} from "@/types/expense";
import { generateId } from "@/lib/utils-expense";

interface AddExpenseFormProps {
  onAdd: (expense: Expense) => void;
  defaultCategory?: ExpenseCategory;
  defaultPaymentMethod?: PaymentMethod;
  currencySymbol?: string;
}

export const AddExpenseForm = ({
  onAdd,
  defaultCategory = "other",
  defaultPaymentMethod = "cash",
  currencySymbol = "$",
}: AddExpenseFormProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>(defaultCategory);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(defaultPaymentMethod);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<RecurringFrequency>("monthly");
  const [tags, setTags] = useState("");
  const [receiptImage, setReceiptImage] = useState("");

  const handleSubmit = () => {
    if (!title.trim() || !amount || parseFloat(amount) <= 0) {
      return;
    }

    const newExpense: Expense = {
      id: generateId(),
      title: title.trim(),
      amount: parseFloat(amount),
      category,
      date: new Date(date),
      description: description.trim() || undefined,
      paymentMethod,
      isRecurring,
      recurringFrequency: isRecurring ? recurringFrequency : undefined,
      tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
      receiptImage: receiptImage.trim() || undefined,
      createdAt: new Date(),
    };

    onAdd(newExpense);
    handleReset();
    setOpen(false);
  };

  const handleReset = () => {
    setTitle("");
    setAmount("");
    setCategory(defaultCategory);
    setDescription("");
    setDate(new Date().toISOString().split("T")[0]);
    setPaymentMethod(defaultPaymentMethod);
    setIsRecurring(false);
    setRecurringFrequency("monthly");
    setTags("");
    setReceiptImage("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription>
            Record a new expense and track your spending
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Grocery Shopping, Gas Fill-up"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount ({currencySymbol}) *</Label>
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
              <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional notes about this expense..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select
              value={paymentMethod}
              onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
            >
              <SelectTrigger id="paymentMethod">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((method) => (
                  <SelectItem key={method} value={method}>
                    {PAYMENT_METHOD_LABELS[method]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              placeholder="e.g., essential, impulse, planned"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          {/* Receipt Image URL */}
          <div className="space-y-2">
            <Label htmlFor="receiptImage">Receipt Image URL</Label>
            <Input
              id="receiptImage"
              type="url"
              placeholder="https://example.com/receipt.jpg"
              value={receiptImage}
              onChange={(e) => setReceiptImage(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Optional: Paste a URL to a receipt image
            </p>
          </div>

          {/* Recurring Toggle */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isRecurring"
              checked={isRecurring}
              onCheckedChange={(checked) => setIsRecurring(checked as boolean)}
            />
            <Label htmlFor="isRecurring" className="cursor-pointer">
              This is a recurring expense
            </Label>
          </div>

          {isRecurring && (
            <div className="space-y-2 ml-6">
              <Label htmlFor="recurringFrequency">Frequency</Label>
              <Select
                value={recurringFrequency}
                onValueChange={(v) => setRecurringFrequency(v as RecurringFrequency)}
              >
                <SelectTrigger id="recurringFrequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(RECURRING_FREQUENCY_LABELS) as RecurringFrequency[])
                    .filter((f) => f !== "none")
                    .map((freq) => (
                      <SelectItem key={freq} value={freq}>
                        {RECURRING_FREQUENCY_LABELS[freq]}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              handleReset();
              setOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || !amount || parseFloat(amount) <= 0}
          >
            Add Expense
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
