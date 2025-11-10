import { Search, X } from "lucide-react";
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
  HabitFilter,
  HabitCategory,
  HabitFrequency,
  HabitStatus,
  CATEGORY_LABELS,
  FREQUENCY_LABELS,
} from "@/types/habit";

interface HabitFiltersProps {
  filter: HabitFilter;
  onFilterChange: (filter: HabitFilter) => void;
  habitCounts: {
    total: number;
    active: number;
    paused: number;
    archived: number;
  };
}

const STATUS_LABELS: Record<HabitStatus, string> = {
  active: "Active",
  paused: "Paused",
  archived: "Archived",
};

export const HabitFilters = ({ filter, onFilterChange, habitCounts }: HabitFiltersProps) => {
  const hasActiveFilters =
    filter.category || filter.status || filter.frequency || filter.searchQuery;

  const clearFilters = () => {
    onFilterChange({});
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search habits..."
            value={filter.searchQuery || ""}
            onChange={(e) => onFilterChange({ ...filter, searchQuery: e.target.value || undefined })}
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
                onFilterChange({ ...filter, category: value === "all" ? undefined : (value as HabitCategory) })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {(Object.keys(CATEGORY_LABELS) as HabitCategory[]).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {CATEGORY_LABELS[cat]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Status</label>
            <Select
              value={filter.status || "all"}
              onValueChange={(value) =>
                onFilterChange({ ...filter, status: value === "all" ? undefined : (value as HabitStatus) })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {(Object.keys(STATUS_LABELS) as HabitStatus[]).map((status) => (
                  <SelectItem key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Frequency Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Frequency</label>
            <Select
              value={filter.frequency || "all"}
              onValueChange={(value) =>
                onFilterChange({ ...filter, frequency: value === "all" ? undefined : (value as HabitFrequency) })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Frequencies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Frequencies</SelectItem>
                {(Object.keys(FREQUENCY_LABELS) as HabitFrequency[]).map((freq) => (
                  <SelectItem key={freq} value={freq}>
                    {FREQUENCY_LABELS[freq]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters & Clear Button */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="text-sm text-muted-foreground">
              {Object.keys(filter).filter((key) => filter[key as keyof HabitFilter]).length} filter(s) applied
            </div>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t">
          <div className="text-center p-2 rounded-lg bg-secondary/50">
            <div className="text-xs text-muted-foreground">Total</div>
            <div className="text-lg font-bold">{habitCounts.total}</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-green-100 dark:bg-green-950">
            <div className="text-xs text-muted-foreground">Active</div>
            <div className="text-lg font-bold text-green-700 dark:text-green-400">
              {habitCounts.active}
            </div>
          </div>
          <div className="text-center p-2 rounded-lg bg-yellow-100 dark:bg-yellow-950">
            <div className="text-xs text-muted-foreground">Paused</div>
            <div className="text-lg font-bold text-yellow-700 dark:text-yellow-400">
              {habitCounts.paused}
            </div>
          </div>
          <div className="text-center p-2 rounded-lg bg-gray-100 dark:bg-gray-900">
            <div className="text-xs text-muted-foreground">Archived</div>
            <div className="text-lg font-bold text-gray-700 dark:text-gray-400">
              {habitCounts.archived}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
