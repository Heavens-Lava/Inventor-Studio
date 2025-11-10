import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TodoFilter, TaskCategory, TaskPriority, TaskStatus, CATEGORY_LABELS } from "@/types/todo";

interface TodoFiltersProps {
  filter: TodoFilter;
  onFilterChange: (filter: TodoFilter) => void;
  taskCounts: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
  };
}

export const TodoFilters = ({ filter, onFilterChange, taskCounts }: TodoFiltersProps) => {
  const hasActiveFilters = filter.category || filter.priority || filter.status || filter.searchQuery;

  const clearFilters = () => {
    onFilterChange({});
  };

  const updateFilter = (key: keyof TodoFilter, value: string | undefined) => {
    onFilterChange({
      ...filter,
      [key]: value || undefined
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={filter.searchQuery || ""}
            onChange={(e) => updateFilter("searchQuery", e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2">
          <Select value={filter.category || "all"} onValueChange={(value) => updateFilter("category", value === "all" ? undefined : value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filter.priority || "all"} onValueChange={(value) => updateFilter("priority", value === "all" ? undefined : value)}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filter.status || "all"} onValueChange={(value) => updateFilter("status", value === "all" ? undefined : value)}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" size="icon" onClick={clearFilters}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary" className="text-sm">
          Total: {taskCounts.total}
        </Badge>
        <Badge variant="outline" className="text-sm bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
          Pending: {taskCounts.pending}
        </Badge>
        <Badge variant="outline" className="text-sm bg-blue-500/10 text-blue-700 dark:text-blue-400">
          In Progress: {taskCounts.inProgress}
        </Badge>
        <Badge variant="outline" className="text-sm bg-green-500/10 text-green-700 dark:text-green-400">
          Completed: {taskCounts.completed}
        </Badge>
      </div>
    </div>
  );
};
