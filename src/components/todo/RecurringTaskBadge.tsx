import { Repeat } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RecurringConfig } from "@/types/todo";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RecurringTaskBadgeProps {
  recurring: RecurringConfig;
}

export const RecurringTaskBadge = ({ recurring }: RecurringTaskBadgeProps) => {
  if (!recurring.enabled) return null;

  const getIntervalLabel = () => {
    switch (recurring.interval) {
      case "daily":
        return "Daily";
      case "weekly":
        return "Weekly";
      case "monthly":
        return "Monthly";
      case "custom":
        return `Every ${recurring.customDays} days`;
      default:
        return "Recurring";
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="secondary" className="gap-1">
          <Repeat className="h-3 w-3" />
          {getIntervalLabel()}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p>This task repeats {getIntervalLabel().toLowerCase()}</p>
        {recurring.nextDue && (
          <p className="text-xs">
            Next due: {new Date(recurring.nextDue).toLocaleDateString()}
          </p>
        )}
      </TooltipContent>
    </Tooltip>
  );
};
