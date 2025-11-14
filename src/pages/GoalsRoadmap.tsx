import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  Search,
  Filter,
  Target,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  MoreVertical,
  Edit,
  Trash2,
  PlayCircle,
  PauseCircle,
  XCircle,
} from "lucide-react";
import { useGoalStorage } from "@/hooks/useGoalStorage";
import {
  sortGoals,
  filterGoalsByTimeframe,
  filterGoalsByStatus,
  searchGoals,
  calculateDaysUntilTarget,
  isGoalOverdue,
  isGoalApproachingDeadline,
  getSubgoalsCompletion,
} from "@/lib/utils-goal";
import {
  GOAL_TYPE_LABELS,
  GOAL_TIMEFRAME_LABELS,
  GOAL_PRIORITY_LABELS,
  GOAL_STATUS_LABELS,
  GOAL_PRIORITY_COLORS,
  GOAL_STATUS_COLORS,
  GoalTimeframe,
  GoalStatus,
} from "@/types/goal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { format } from "date-fns";

const GoalsRoadmap = () => {
  const navigate = useNavigate();
  const { goals, isLoaded, deleteGoal, updateGoal } = useGoalStorage();

  const [searchQuery, setSearchQuery] = useState("");
  const [timeframeFilter, setTimeframeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null);

  if (!isLoaded) {
    return (
      <AppLayout title="Goals & Roadmap">
        <p className="text-muted-foreground">Loading goals...</p>
      </AppLayout>
    );
  }

  // Apply filters and search
  let filteredGoals = goals;
  if (searchQuery) {
    filteredGoals = searchGoals(filteredGoals, searchQuery);
  }
  if (timeframeFilter !== "all") {
    filteredGoals = filterGoalsByTimeframe(filteredGoals, timeframeFilter);
  }
  if (statusFilter !== "all") {
    filteredGoals = filterGoalsByStatus(filteredGoals, statusFilter);
  }

  // Sort goals
  const sortedGoals = sortGoals(filteredGoals);

  const handleDeleteGoal = () => {
    if (goalToDelete) {
      deleteGoal(goalToDelete);
      toast.success("Goal deleted successfully");
      setGoalToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleStatusChange = (goalId: string, newStatus: GoalStatus) => {
    updateGoal(goalId, {
      status: newStatus,
      completedDate: newStatus === "completed" ? new Date() : undefined,
    });
    toast.success(`Goal status updated to ${GOAL_STATUS_LABELS[newStatus]}`);
  };

  const getStatusIcon = (status: GoalStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "in-progress":
        return <PlayCircle className="h-5 w-5 text-blue-600" />;
      case "on-hold":
        return <PauseCircle className="h-5 w-5 text-amber-600" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <AppLayout title="Goals & Roadmap" className="pb-20">
        {/* Header with Add Button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Your Goals</h2>
            <p className="text-muted-foreground text-sm">
              {goals.length} {goals.length === 1 ? "goal" : "goals"} total
            </p>
          </div>
          <Button onClick={() => navigate("/goals/create")} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            New Goal
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search goals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={timeframeFilter} onValueChange={setTimeframeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Timeframes</SelectItem>
              <SelectItem value="short-term">Short-term</SelectItem>
              <SelectItem value="long-term">Long-term</SelectItem>
              <SelectItem value="dream">Dream Goals</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="not-started">Not Started</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="on-hold">On Hold</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Goals List */}
        {sortedGoals.length === 0 ? (
          <Card className="p-12 text-center">
            <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No goals yet</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || timeframeFilter !== "all" || statusFilter !== "all"
                ? "No goals match your filters. Try adjusting your search."
                : "Start by creating your first goal to track your progress."}
            </p>
            <Button onClick={() => navigate("/goals/create")}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Goal
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {sortedGoals.map((goal) => {
              const daysUntil = calculateDaysUntilTarget(goal);
              const isOverdue = isGoalOverdue(goal);
              const isApproaching = isGoalApproachingDeadline(goal);
              const subgoalsCompletion = getSubgoalsCompletion(goal);

              return (
                <Card
                  key={goal.id}
                  className="p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/goals/${goal.id}/edit`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Title and Status Icon */}
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(goal.status)}
                        <h3 className="text-xl font-semibold">{goal.title}</h3>
                      </div>

                      {/* Description */}
                      {goal.description && (
                        <p className="text-muted-foreground mb-3 line-clamp-2">
                          {goal.description}
                        </p>
                      )}

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge
                          variant="outline"
                          style={{
                            borderColor: GOAL_PRIORITY_COLORS[goal.priority],
                            color: GOAL_PRIORITY_COLORS[goal.priority],
                          }}
                        >
                          {GOAL_PRIORITY_LABELS[goal.priority]}
                        </Badge>
                        <Badge
                          variant="outline"
                          style={{
                            borderColor: GOAL_STATUS_COLORS[goal.status],
                            color: GOAL_STATUS_COLORS[goal.status],
                          }}
                        >
                          {GOAL_STATUS_LABELS[goal.status]}
                        </Badge>
                        <Badge variant="secondary">
                          {GOAL_TIMEFRAME_LABELS[goal.timeframe]}
                        </Badge>
                        <Badge variant="secondary">
                          {GOAL_TYPE_LABELS[goal.type]}
                        </Badge>
                        {goal.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-semibold">{goal.progress}%</span>
                        </div>
                        <Progress value={goal.progress} className="h-2" />
                      </div>

                      {/* Stats */}
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {goal.subgoals.length > 0 && (
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>
                              {goal.subgoals.filter((sg) => sg.completed).length}/{goal.subgoals.length} subgoals
                            </span>
                          </div>
                        )}
                        {goal.targetDate && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span className={isOverdue ? "text-red-600" : isApproaching ? "text-amber-600" : ""}>
                              {isOverdue
                                ? `Overdue by ${Math.abs(daysUntil!)} days`
                                : daysUntil! > 0
                                ? `${daysUntil} days left`
                                : "Due today"}
                            </span>
                          </div>
                        )}
                        {goal.milestones.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Target className="h-4 w-4" />
                            <span>
                              {goal.milestones.filter((m) => m.completed).length}/{goal.milestones.length} milestones
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem onClick={() => navigate(`/goals/${goal.id}/edit`)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Goal
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleStatusChange(goal.id, "in-progress")}>
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Mark In Progress
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(goal.id, "on-hold")}>
                          <PauseCircle className="h-4 w-4 mr-2" />
                          Put On Hold
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(goal.id, "completed")}>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Mark Complete
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            setGoalToDelete(goal.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Goal
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Goal?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this goal and all its subgoals, milestones, and progress data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setGoalToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteGoal} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default GoalsRoadmap;
