export type CalendarView = "month" | "week" | "day" | "agenda";

export type EventCategory = "personal" | "work" | "meeting" | "deadline" | "reminder" | "other";

export type RecurringType = "none" | "daily" | "weekly" | "biweekly" | "monthly" | "yearly" | "custom";

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  category: EventCategory;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  color?: string;
  location?: string;

  // Recurring event settings
  recurring?: {
    type: RecurringType;
    interval?: number; // Every N days/weeks/months
    endDate?: Date; // When to stop recurring
    daysOfWeek?: number[]; // For weekly: 0=Sunday, 1=Monday, etc.
    dayOfMonth?: number; // For monthly
  };

  // Integration with other apps
  linkedTodoId?: string; // Link to To-Do task
  linkedHabitId?: string; // Link to Habit
  linkedJournalId?: string; // Link to Journal entry

  // Reminders
  reminders?: {
    minutes: number; // Minutes before event
    enabled: boolean;
  }[];

  // Attachments
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
  }[];

  // Collaboration
  attendees?: {
    email: string;
    name: string;
    status: "pending" | "accepted" | "declined";
  }[];

  createdAt: Date;
  updatedAt: Date;
}

export interface CalendarSettings {
  defaultView: CalendarView;
  weekStartsOn: number; // 0=Sunday, 1=Monday
  workingHours: {
    start: string; // "09:00"
    end: string; // "17:00"
  };

  // Display settings
  showWeekends: boolean;
  showTodoWidget: boolean;
  showFinanceWidget: boolean;
  showHabitsWidget: boolean;
  showJournalWidget: boolean;

  // Theme
  backgroundType: "theme" | "image";
  backgroundTheme: string;
  backgroundImage?: string;
  colorScheme: "light" | "dark" | "system";

  // Integrations
  syncWithTodos: boolean;
  syncWithHabits: boolean;
  syncWithJournal: boolean;
  showTodoDeadlines: boolean;
  showHabitStreaks: boolean;

  // Notifications
  enableReminders: boolean;
  defaultReminderMinutes: number;

  // Custom day colors (key is date string in YYYY-MM-DD format)
  dayColors?: Record<string, string>;
}

export const EVENT_CATEGORY_LABELS: Record<EventCategory, string> = {
  personal: "Personal",
  work: "Work",
  meeting: "Meeting",
  deadline: "Deadline",
  reminder: "Reminder",
  other: "Other"
};

export const EVENT_CATEGORY_COLORS: Record<EventCategory, string> = {
  personal: "#3b82f6", // blue
  work: "#8b5cf6", // purple
  meeting: "#10b981", // green
  deadline: "#ef4444", // red
  reminder: "#f59e0b", // amber
  other: "#6b7280" // gray
};
