import { Goal, GoalSubgoal, GoalRequirement, GoalCost, GoalMilestone, GoalFeedback } from "@/types/goal";

// Generate unique IDs
export const generateGoalId = (): string => {
  return `goal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const generateSubgoalId = (): string => {
  return `subgoal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const generateRequirementId = (): string => {
  return `requirement-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const generateCostId = (): string => {
  return `cost-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const generateMilestoneId = (): string => {
  return `milestone-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const generateFeedbackId = (): string => {
  return `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Calculate goal progress based on subgoals and milestones
export const calculateGoalProgress = (goal: Goal): number => {
  if (goal.status === "completed") return 100;
  if (goal.status === "not-started") return 0;
  if (goal.status === "cancelled") return 0;

  let totalWeight = 0;
  let completedWeight = 0;

  // Count completed subgoals
  if (goal.subgoals.length > 0) {
    totalWeight += goal.subgoals.length;
    completedWeight += goal.subgoals.filter((sg) => sg.completed).length;
  }

  // Count completed milestones
  if (goal.milestones.length > 0) {
    totalWeight += goal.milestones.length;
    completedWeight += goal.milestones.filter((m) => m.completed).length;
  }

  // Count completed requirements
  if (goal.requirements.length > 0) {
    totalWeight += goal.requirements.length;
    completedWeight += goal.requirements.filter((r) => r.completed).length;
  }

  // If no items to track, return manual progress
  if (totalWeight === 0) return goal.progress;

  return Math.round((completedWeight / totalWeight) * 100);
};

// Calculate total estimated cost
export const calculateTotalCost = (goal: Goal, type?: "financial" | "time" | "resource"): number => {
  return goal.costs
    .filter((cost) => !type || cost.type === type)
    .reduce((sum, cost) => sum + cost.amount, 0);
};

// Calculate days until target date
export const calculateDaysUntilTarget = (goal: Goal): number | null => {
  if (!goal.targetDate) return null;
  const today = new Date();
  const target = new Date(goal.targetDate);
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Calculate days since start
export const calculateDaysSinceStart = (goal: Goal): number | null => {
  if (!goal.startDate) return null;
  const today = new Date();
  const start = new Date(goal.startDate);
  const diffTime = today.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Check if goal is overdue
export const isGoalOverdue = (goal: Goal): boolean => {
  if (!goal.targetDate || goal.status === "completed" || goal.status === "cancelled") {
    return false;
  }
  const today = new Date();
  const target = new Date(goal.targetDate);
  return today > target;
};

// Check if goal is approaching deadline (within 7 days)
export const isGoalApproachingDeadline = (goal: Goal): boolean => {
  const daysUntil = calculateDaysUntilTarget(goal);
  if (daysUntil === null || goal.status === "completed" || goal.status === "cancelled") {
    return false;
  }
  return daysUntil > 0 && daysUntil <= 7;
};

// Get next incomplete milestone
export const getNextMilestone = (goal: Goal): GoalMilestone | null => {
  const incomplete = goal.milestones.filter((m) => !m.completed);
  if (incomplete.length === 0) return null;

  // Sort by target date
  return incomplete.sort((a, b) => {
    if (!a.targetDate) return 1;
    if (!b.targetDate) return -1;
    return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
  })[0];
};

// Get completion percentage of requirements
export const getRequirementsCompletion = (goal: Goal): number => {
  if (goal.requirements.length === 0) return 100;
  const completed = goal.requirements.filter((r) => r.completed).length;
  return Math.round((completed / goal.requirements.length) * 100);
};

// Get completion percentage of subgoals
export const getSubgoalsCompletion = (goal: Goal): number => {
  if (goal.subgoals.length === 0) return 100;
  const completed = goal.subgoals.filter((sg) => sg.completed).length;
  return Math.round((completed / goal.subgoals.length) * 100);
};

// Get completion percentage of milestones
export const getMilestonesCompletion = (goal: Goal): number => {
  if (goal.milestones.length === 0) return 100;
  const completed = goal.milestones.filter((m) => m.completed).length;
  return Math.round((completed / goal.milestones.length) * 100);
};

// Format duration in days to readable string
export const formatDuration = (days: number): string => {
  if (days === 0) return "Today";
  if (days === 1) return "1 day";
  if (days < 7) return `${days} days`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return weeks === 1 ? "1 week" : `${weeks} weeks`;
  }
  if (days < 365) {
    const months = Math.floor(days / 30);
    return months === 1 ? "1 month" : `${months} months`;
  }
  const years = Math.floor(days / 365);
  return years === 1 ? "1 year" : `${years} years`;
};

// Sort goals by priority and status
export const sortGoals = (goals: Goal[]): Goal[] => {
  const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
  const statusWeight = { "in-progress": 4, "not-started": 3, "on-hold": 2, completed: 1, cancelled: 0 };

  return [...goals].sort((a, b) => {
    // First sort by status
    const statusDiff = statusWeight[b.status] - statusWeight[a.status];
    if (statusDiff !== 0) return statusDiff;

    // Then by priority
    const priorityDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
    if (priorityDiff !== 0) return priorityDiff;

    // Finally by creation date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};

// Filter goals by timeframe
export const filterGoalsByTimeframe = (goals: Goal[], timeframe: string): Goal[] => {
  if (timeframe === "all") return goals;
  return goals.filter((goal) => goal.timeframe === timeframe);
};

// Filter goals by status
export const filterGoalsByStatus = (goals: Goal[], status: string): Goal[] => {
  if (status === "all") return goals;
  return goals.filter((goal) => goal.status === status);
};

// Search goals by title, description, or tags
export const searchGoals = (goals: Goal[], query: string): Goal[] => {
  const lowerQuery = query.toLowerCase();
  return goals.filter(
    (goal) =>
      goal.title.toLowerCase().includes(lowerQuery) ||
      goal.description?.toLowerCase().includes(lowerQuery) ||
      goal.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
      goal.category?.toLowerCase().includes(lowerQuery)
  );
};
