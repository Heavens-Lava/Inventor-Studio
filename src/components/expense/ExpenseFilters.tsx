import { useState } from "react";
import { Search, X, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import {
  ExpenseFilter,
  ExpenseCategory,
  PaymentMethod,
  CATEGORY_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/types/expense";

interface ExpenseFiltersProps {
  filter: ExpenseFilter;
  onFilterChange: (filter: ExpenseFilter) => void;
  expenseCounts: {
    total: number;
    today: number;
    week: number;
    month: number;
    recurring: number;
  };
}

export const ExpenseFilters = ({
  filter,
  onFilterChange,
  expenseCounts,
}: ExpenseFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasActiveFilters =
    filter.category ||
    filter.paymentMethod ||
    filter.searchQuery ||
    filter.startDate ||
    filter.endDate ||
    filter.minAmount ||
    filter.maxAmount ||
    filter.isRecurring !== undefined;

  const clearFilters = () => {
    onFilterChange({});
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Collapsible Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">Filters & Search</h3>
            {hasActiveFilters && (
              <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                {Object.keys(filter).filter((key) => filter[key as keyof ExpenseFilter] !== undefined).length}
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1"
          >
            {isExpanded ? (
              <>
                <span className="text-sm">Collapse</span>
                <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                <span className="text-sm">Expand</span>
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {/* Collapsible Content */}
        {isExpanded && (
          <>
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search expenses..."
                value={filter.searchQuery || ""}
                onChange={(e) =>
                  onFilterChange({ ...filter, searchQuery: e.target.value || undefined })
                }
                className="pl-9 pr-9"
              />
              {filter.searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFilterChange({ ...filter, searchQuery: undefined })}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Category Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Category</label>
            <Select
              value={filter.category || "all"}
              onValueChange={(value) =>
                onFilterChange({
                  ...filter,
                  category: value === "all" ? undefined : (value as ExpenseCategory),
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {(Object.keys(CATEGORY_LABELS) as ExpenseCategory[]).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {CATEGORY_LABELS[cat]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Payment Method Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Payment Method</label>
            <Select
              value={filter.paymentMethod || "all"}
              onValueChange={(value) =>
                onFilterChange({
                  ...filter,
                  paymentMethod: value === "all" ? undefined : (value as PaymentMethod),
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Methods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((method) => (
                  <SelectItem key={method} value={method}>
                    {PAYMENT_METHOD_LABELS[method]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Recurring Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Type</label>
            <Select
              value={
                filter.isRecurring === undefined
                  ? "all"
                  : filter.isRecurring
                  ? "recurring"
                  : "one-time"
              }
              onValueChange={(value) =>
                onFilterChange({
                  ...filter,
                  isRecurring:
                    value === "all"
                      ? undefined
                      : value === "recurring"
                      ? true
                      : false,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="one-time">One-time</SelectItem>
                <SelectItem value="recurring">Recurring</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Date Range Filters */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Start Date</label>
            <Input
              type="date"
              value={filter.startDate ? filter.startDate.toISOString().split("T")[0] : ""}
              onChange={(e) =>
                onFilterChange({
                  ...filter,
                  startDate: e.target.value ? new Date(e.target.value) : undefined,
                })
              }
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">End Date</label>
            <Input
              type="date"
              value={filter.endDate ? filter.endDate.toISOString().split("T")[0] : ""}
              onChange={(e) =>
                onFilterChange({
                  ...filter,
                  endDate: e.target.value ? new Date(e.target.value) : undefined,
                })
              }
            />
          </div>
        </div>

        {/* Amount Range Filters */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Min Amount</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={filter.minAmount || ""}
              onChange={(e) =>
                onFilterChange({
                  ...filter,
                  minAmount: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Max Amount</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={filter.maxAmount || ""}
              onChange={(e) =>
                onFilterChange({
                  ...filter,
                  maxAmount: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
            />
          </div>
        </div>

            {/* Active Filters & Clear Button */}
            {hasActiveFilters && (
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="text-sm text-muted-foreground">
                  {Object.keys(filter).filter((key) => filter[key as keyof ExpenseFilter] !== undefined)
                    .length}{" "}
                  filter(s) applied
                </div>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              </div>
            )}
          </>
        )}

        {/* Quick Stats - Always visible */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t">
          <div className="text-center p-2 rounded-lg bg-secondary/50">
            <div className="text-xs text-muted-foreground">Total</div>
            <div className="text-lg font-bold">{expenseCounts.total}</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-red-100 dark:bg-red-950">
            <div className="text-xs text-muted-foreground">Today</div>
            <div className="text-lg font-bold text-red-700 dark:text-red-400">
              {expenseCounts.today}
            </div>
          </div>
          <div className="text-center p-2 rounded-lg bg-orange-100 dark:bg-orange-950">
            <div className="text-xs text-muted-foreground">Week</div>
            <div className="text-lg font-bold text-orange-700 dark:text-orange-400">
              {expenseCounts.week}
            </div>
          </div>
          <div className="text-center p-2 rounded-lg bg-purple-100 dark:bg-purple-950">
            <div className="text-xs text-muted-foreground">Month</div>
            <div className="text-lg font-bold text-purple-700 dark:text-purple-400">
              {expenseCounts.month}
            </div>
          </div>
          <div className="text-center p-2 rounded-lg bg-blue-100 dark:bg-blue-950">
            <div className="text-xs text-muted-foreground">Recurring</div>
            <div className="text-lg font-bold text-blue-700 dark:text-blue-400">
              {expenseCounts.recurring}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
