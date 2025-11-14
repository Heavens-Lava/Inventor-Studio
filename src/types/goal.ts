export type GoalType = "major" | "minor";
export type GoalTimeframe = "short-term" | "long-term" | "dream";
export type GoalPriority = "low" | "medium" | "high" | "critical";
export type GoalStatus = "not-started" | "in-progress" | "on-hold" | "completed" | "cancelled";

export interface GoalSubgoal {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: Date;
  createdAt: Date;
}

export interface GoalRequirement {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  type?: "resource" | "skill" | "milestone" | "tool";
}

export interface GoalCost {
  id: string;
  type: "financial" | "time" | "resource";
  amount: number;
  unit?: string; // For financial: currency, for time: hours/days, for resource: custom
  description?: string;
}

export interface GoalMilestone {
  id: string;
  title: string;
  description?: string;
  targetDate?: Date;
  completed: boolean;
  completedDate?: Date;
}

export interface GoalFeedback {
  id: string;
  content: string;
  author?: string; // "self" or collaborator name
  date: Date;
  type?: "reflection" | "feedback" | "note";
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  type: GoalType;
  timeframe: GoalTimeframe;
  priority: GoalPriority;
  status: GoalStatus;

  // Planning
  planningNotes?: string;
  steps?: string[]; // List of action steps

  // Subgoals
  subgoals: GoalSubgoal[];

  // Requirements & Resources
  requirements: GoalRequirement[];
  toolsNeeded?: string[]; // List of tools/apps/materials

  // Costs
  costs: GoalCost[];

  // Time tracking
  estimatedDuration?: number; // in days
  actualDuration?: number; // in days
  startDate?: Date;
  targetDate?: Date;
  completedDate?: Date;

  // Milestones
  milestones: GoalMilestone[];

  // Progress
  progress: number; // 0-100

  // Feedback & Notes
  feedback: GoalFeedback[];

  // Scope
  scopeDescription?: string;
  boundaries?: string; // What's included/excluded
  impact?: string; // Expected impact or outcome

  // Organization
  tags: string[];
  category?: string; // Custom category

  // Collaboration
  isPrivate: boolean;
  collaborators?: string[]; // List of collaborator names/emails

  // Metadata
  createdAt: Date;
  updatedAt?: Date;
}

export const GOAL_TYPE_LABELS: Record<GoalType, string> = {
  major: "Major Goal",
  minor: "Minor Goal",
};

export const GOAL_TIMEFRAME_LABELS: Record<GoalTimeframe, string> = {
  "short-term": "Short-term",
  "long-term": "Long-term",
  dream: "Dream Goal",
};

export const GOAL_PRIORITY_LABELS: Record<GoalPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export const GOAL_STATUS_LABELS: Record<GoalStatus, string> = {
  "not-started": "Not Started",
  "in-progress": "In Progress",
  "on-hold": "On Hold",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const GOAL_PRIORITY_COLORS: Record<GoalPriority, string> = {
  low: "#6b7280", // gray
  medium: "#3b82f6", // blue
  high: "#f59e0b", // amber
  critical: "#ef4444", // red
};

export const GOAL_STATUS_COLORS: Record<GoalStatus, string> = {
  "not-started": "#6b7280", // gray
  "in-progress": "#3b82f6", // blue
  "on-hold": "#f59e0b", // amber
  completed: "#10b981", // green
  cancelled: "#ef4444", // red
};
