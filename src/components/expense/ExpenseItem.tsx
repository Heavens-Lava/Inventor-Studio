import { useState } from "react";
import {
  Expense,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  PAYMENT_METHOD_LABELS,
  ExpenseCategory,
  PaymentMethod,
  RecurringFrequency,
  RECURRING_FREQUENCY_LABELS,
} from "@/types/expense";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Trash2,
  Edit,
  GripVertical,
  Calendar,
  CreditCard,
  Tag,
  MoreVertical,
  Repeat,
  Image as ImageIcon,
  TrendingUp,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, calculateSingleExpenseYearlyProjection } from "@/lib/utils-expense";
import { format } from "date-fns";

interface ExpenseItemProps {
  expense: Expense;
  onUpdate: (id: string, updates: Partial<Expense>) => void;
  onDelete: (id: string) => void;
  currencySymbol?: string;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  onDrop?: (e: React.DragEvent) => void;
}

export const ExpenseItem = ({
  expense,
  onUpdate,
  onDelete,
  currencySymbol = "$",
  onDragStart,
  onDragEnd,
  onDrop,
}: ExpenseItemProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(expense.title);

  // Edit form state
  const [editTitle, setEditTitle] = useState(expense.title);
  const [editAmount, setEditAmount] = useState(expense.amount.toString());
  const [editCategory, setEditCategory] = useState<ExpenseCategory>(expense.category);
  const [editDescription, setEditDescription] = useState(expense.description || "");
  const [editDate, setEditDate] = useState(
    new Date(expense.date).toISOString().split("T")[0]
  );
  const [editPaymentMethod, setEditPaymentMethod] = useState<PaymentMethod>(
    expense.paymentMethod || "cash"
  );
  const [editIsRecurring, setEditIsRecurring] = useState(expense.isRecurring);
  const [editRecurringFrequency, setEditRecurringFrequency] = useState<RecurringFrequency>(
    expense.recurringFrequency || "monthly"
  );
  const [editTags, setEditTags] = useState(expense.tags?.join(", ") || "");
  const [editReceiptImage, setEditReceiptImage] = useState(expense.receiptImage || "");

  const categoryColor = CATEGORY_COLORS[expense.category];
  const yearlyProjection = calculateSingleExpenseYearlyProjection(expense);

  const handleTitleClick = () => {
    setIsEditingTitle(true);
    setEditedTitle(expense.title);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (editedTitle.trim() && editedTitle !== expense.title) {
      onUpdate(expense.id, { title: editedTitle.trim(), updatedAt: new Date() });
    } else {
      setEditedTitle(expense.title);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTitleBlur();
    } else if (e.key === "Escape") {
      setIsEditingTitle(false);
      setEditedTitle(expense.title);
    }
  };

  const handleEditClick = () => {
    setEditTitle(expense.title);
    setEditAmount(expense.amount.toString());
    setEditCategory(expense.category);
    setEditDescription(expense.description || "");
    setEditDate(new Date(expense.date).toISOString().split("T")[0]);
    setEditPaymentMethod(expense.paymentMethod || "cash");
    setEditIsRecurring(expense.isRecurring);
    setEditRecurringFrequency(expense.recurringFrequency || "monthly");
    setEditTags(expense.tags?.join(", ") || "");
    setEditReceiptImage(expense.receiptImage || "");
    setShowEditDialog(true);
  };

  const handleEditSubmit = () => {
    if (!editTitle.trim() || !editAmount || parseFloat(editAmount) <= 0) {
      return;
    }

    const updates: Partial<Expense> = {
      title: editTitle.trim(),
      amount: parseFloat(editAmount),
      category: editCategory,
      date: new Date(editDate),
      description: editDescription.trim() || undefined,
      paymentMethod: editPaymentMethod,
      isRecurring: editIsRecurring,
      recurringFrequency: editIsRecurring ? editRecurringFrequency : undefined,
      tags: editTags ? editTags.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
      receiptImage: editReceiptImage.trim() || undefined,
      updatedAt: new Date(),
    };

    onUpdate(expense.id, updates);
    setShowEditDialog(false);
  };

  return (
    <>
      <Card
        className="p-4 hover:shadow-lg transition-shadow"
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
      >
        <div className="flex items-start gap-3">
          {/* Drag Handle */}
          <div
            className="flex items-center pt-1 cursor-grab active:cursor-grabbing select-none"
            draggable
            onDragStart={(e) => {
              e.stopPropagation();
              if (onDragStart) {
                onDragStart(e);
              }
            }}
            onDragEnd={onDragEnd}
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* Expense Icon */}
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
            style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}
          >
            {CATEGORY_ICONS[expense.category]}
          </div>

          {/* Expense Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {isEditingTitle ? (
                    <Input
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      onBlur={handleTitleBlur}
                      onKeyDown={handleTitleKeyDown}
                      autoFocus
                      className="font-semibold text-lg h-8 px-2"
                    />
                  ) : (
                    <h3
                      className="font-semibold text-lg truncate cursor-pointer hover:text-primary transition-colors"
                      onClick={handleTitleClick}
                      title="Click to edit"
                    >
                      {expense.title}
                    </h3>
                  )}
                  {expense.isRecurring && (
                    <Badge variant="secondary" className="flex-shrink-0">
                      <Repeat className="h-3 w-3 mr-1" />
                      Recurring
                    </Badge>
                  )}
                </div>
                {expense.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {expense.description}
                  </p>
                )}
              </div>

              {/* Amount */}
              <div className="text-right flex-shrink-0">
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(expense.amount, currencySymbol)}
                </p>
              </div>

              {/* Actions Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleEditClick}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Expense
                  </DropdownMenuItem>
                  {expense.receiptImage && (
                    <DropdownMenuItem onClick={() => setShowReceiptDialog(true)}>
                      <ImageIcon className="h-4 w-4 mr-2" />
                      View Receipt
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Expense
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Metadata Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge
                variant="outline"
                style={{
                  borderColor: categoryColor,
                  color: categoryColor,
                }}
              >
                <Tag className="h-3 w-3 mr-1" />
                {CATEGORY_LABELS[expense.category]}
              </Badge>

              <Badge variant="secondary">
                <Calendar className="h-3 w-3 mr-1" />
                {format(new Date(expense.date), "MMM d, yyyy")}
              </Badge>

              {expense.paymentMethod && (
                <Badge variant="secondary">
                  <CreditCard className="h-3 w-3 mr-1" />
                  {PAYMENT_METHOD_LABELS[expense.paymentMethod]}
                </Badge>
              )}

              {expense.tags && expense.tags.length > 0 && (
                <>
                  {expense.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </>
              )}

              {expense.receiptImage && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  <ImageIcon className="h-3 w-3 mr-1" />
                  Receipt
                </Badge>
              )}
            </div>

            {/* Additional Info */}
            <div className="flex items-center gap-4 flex-wrap">
              {expense.isRecurring && expense.recurringFrequency && (
                <div className="text-xs text-muted-foreground">
                  Repeats: {RECURRING_FREQUENCY_LABELS[expense.recurringFrequency]}
                </div>
              )}
              {yearlyProjection > 0 && (
                <div className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                  <TrendingUp className="h-3 w-3" />
                  <span>
                    {formatCurrency(yearlyProjection, currencySymbol)}/year
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Expense</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{expense.title}&quot;? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDelete(expense.id);
                setShowDeleteDialog(false);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Image Dialog */}
      {expense.receiptImage && (
        <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Receipt</DialogTitle>
              <DialogDescription>{expense.title}</DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <img
                src={expense.receiptImage}
                alt="Receipt"
                className="w-full h-auto rounded-lg border"
              />
            </div>
            <DialogFooter>
              <Button onClick={() => setShowReceiptDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Expense Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
            <DialogDescription>
              Update the details of your expense
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                placeholder="e.g., Grocery Shopping, Gas Fill-up"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
              />
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="edit-amount">Amount ({currencySymbol}) *</Label>
              <Input
                id="edit-amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={editCategory}
                  onValueChange={(v) => setEditCategory(v as ExpenseCategory)}
                >
                  <SelectTrigger id="edit-category">
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
                <Label htmlFor="edit-date">Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Optional notes about this expense..."
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={2}
              />
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label htmlFor="edit-paymentMethod">Payment Method</Label>
              <Select
                value={editPaymentMethod}
                onValueChange={(v) => setEditPaymentMethod(v as PaymentMethod)}
              >
                <SelectTrigger id="edit-paymentMethod">
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
              <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
              <Input
                id="edit-tags"
                placeholder="e.g., essential, impulse, planned"
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
              />
            </div>

            {/* Receipt Image URL */}
            <div className="space-y-2">
              <Label htmlFor="edit-receiptImage">Receipt Image URL</Label>
              <Input
                id="edit-receiptImage"
                type="url"
                placeholder="https://example.com/receipt.jpg"
                value={editReceiptImage}
                onChange={(e) => setEditReceiptImage(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Optional: Paste a URL to a receipt image
              </p>
            </div>

            {/* Recurring Toggle */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-isRecurring"
                checked={editIsRecurring}
                onCheckedChange={(checked) => setEditIsRecurring(checked as boolean)}
              />
              <Label htmlFor="edit-isRecurring" className="cursor-pointer">
                This is a recurring expense
              </Label>
            </div>

            {editIsRecurring && (
              <div className="space-y-2 ml-6">
                <Label htmlFor="edit-recurringFrequency">Frequency</Label>
                <Select
                  value={editRecurringFrequency}
                  onValueChange={(v) => setEditRecurringFrequency(v as RecurringFrequency)}
                >
                  <SelectTrigger id="edit-recurringFrequency">
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
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleEditSubmit}
              disabled={!editTitle.trim() || !editAmount || parseFloat(editAmount) <= 0}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
