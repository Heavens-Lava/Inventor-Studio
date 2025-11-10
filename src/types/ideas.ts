export type IdeaLayout = "grid" | "freeform" | "mindmap";

export type IdeaStatus = "draft" | "in-progress" | "completed" | "archived";

export type DrawingTool = "pen" | "eraser" | "arrow" | "line" | "select";

export interface DrawingStroke {
  id: string;
  tool: DrawingTool;
  color: string;
  width: number;
  points: { x: number; y: number }[];
}

export interface ArrowConnection {
  id: string;
  fromCardId: string;
  toCardId: string;
  color: string;
  label?: string;
}

export interface IdeaCard {
  id: string;
  title: string;
  description?: string;
  color: string;
  tags: string[];
  status: IdeaStatus;

  // Position for freeform layout
  position?: {
    x: number;
    y: number;
  };

  // Size for resizable cards
  size?: {
    width: number;
    height: number;
  };

  // Attachments
  images?: string[];
  audioNotes?: string[];

  // Connections
  connectedTo?: string[]; // IDs of other ideas this connects to

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  votes?: number;
}

export interface IdeaBoard {
  id: string;
  name: string;
  description?: string;
  layout: IdeaLayout;
  ideas: IdeaCard[];
  backgroundColor?: string;
  drawingStrokes?: DrawingStroke[];
  arrows?: ArrowConnection[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IdeasSettings {
  defaultLayout: IdeaLayout;
  defaultCardColor: string;
  enableVoting: boolean;
  showGrid: boolean;

  // Theme
  backgroundType: "theme" | "image";
  backgroundTheme: string;
  backgroundImage?: string;
  colorScheme: "light" | "dark" | "system";
}

export const IDEA_COLORS = [
  "#fef3c7", // yellow
  "#dbeafe", // blue
  "#fce7f3", // pink
  "#d1fae5", // green
  "#e9d5ff", // purple
  "#fed7aa", // orange
  "#fee2e2", // red
  "#f3f4f6", // gray
  "#fbcfe8", // magenta
  "#d1d5db", // neutral
];

export const STATUS_COLORS: Record<IdeaStatus, string> = {
  draft: "#94a3b8",
  "in-progress": "#3b82f6",
  completed: "#10b981",
  archived: "#6b7280"
};

export const STATUS_LABELS: Record<IdeaStatus, string> = {
  draft: "Draft",
  "in-progress": "In Progress",
  completed: "Completed",
  archived: "Archived"
};
