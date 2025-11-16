import { useState, useEffect } from "react";
import { supabase, CalendarEventDB, CalendarSettingsDB } from "@/lib/supabase";
import { CalendarEvent, CalendarSettings } from "@/types/calendar";
import { toast } from "sonner";

const DEFAULT_SETTINGS: CalendarSettings = {
  defaultView: "month",
  weekStartsOn: 0,
  workingHours: { start: "09:00", end: "17:00" },
  showWeekends: true,
  showTodoWidget: true,
  showFinanceWidget: false,
  showHabitsWidget: true,
  showJournalWidget: false,
  backgroundType: "theme",
  backgroundTheme: "default",
  colorScheme: "system",
  syncWithTodos: true,
  syncWithHabits: true,
  syncWithJournal: false,
  showTodoDeadlines: true,
  showHabitStreaks: true,
  enableReminders: true,
  defaultReminderMinutes: 15
};

// Helper functions to convert between app types and database types
const dbEventToEvent = (dbEvent: CalendarEventDB): CalendarEvent => ({
  id: dbEvent.id,
  title: dbEvent.title,
  description: dbEvent.description,
  category: dbEvent.category as any,
  startDate: new Date(dbEvent.start_date),
  endDate: new Date(dbEvent.end_date),
  allDay: dbEvent.all_day,
  color: dbEvent.color,
  location: dbEvent.location,
  recurring: dbEvent.recurring,
  linkedTodoId: dbEvent.linked_todo_id,
  linkedHabitId: dbEvent.linked_habit_id,
  linkedJournalId: dbEvent.linked_journal_id,
  reminders: dbEvent.reminders,
  attachments: dbEvent.attachments,
  attendees: dbEvent.attendees,
  createdAt: new Date(dbEvent.created_at),
  updatedAt: new Date(dbEvent.updated_at),
});

const eventToDbEvent = (event: CalendarEvent, userId: string): Partial<CalendarEventDB> => ({
  user_id: userId,
  title: event.title,
  description: event.description,
  category: event.category,
  start_date: event.startDate.toISOString(),
  end_date: event.endDate.toISOString(),
  all_day: event.allDay,
  color: event.color,
  location: event.location,
  recurring: event.recurring,
  linked_todo_id: event.linkedTodoId,
  linked_habit_id: event.linkedHabitId,
  linked_journal_id: event.linkedJournalId,
  reminders: event.reminders,
  attachments: event.attachments,
  attendees: event.attendees,
});

const dbSettingsToSettings = (dbSettings: CalendarSettingsDB | null): CalendarSettings => {
  if (!dbSettings) return DEFAULT_SETTINGS;

  return {
    defaultView: dbSettings.default_view as any,
    weekStartsOn: dbSettings.week_starts_on,
    workingHours: {
      start: dbSettings.working_hours_start,
      end: dbSettings.working_hours_end,
    },
    showWeekends: dbSettings.show_weekends,
    showTodoWidget: dbSettings.show_todo_widget,
    showFinanceWidget: dbSettings.show_finance_widget,
    showHabitsWidget: dbSettings.show_habits_widget,
    showJournalWidget: dbSettings.show_journal_widget,
    backgroundType: dbSettings.background_type as any,
    backgroundTheme: dbSettings.background_theme,
    backgroundImage: dbSettings.background_image,
    colorScheme: dbSettings.color_scheme as any,
    syncWithTodos: dbSettings.sync_with_todos,
    syncWithHabits: dbSettings.sync_with_habits,
    syncWithJournal: dbSettings.sync_with_journal,
    showTodoDeadlines: dbSettings.show_todo_deadlines,
    showHabitStreaks: dbSettings.show_habit_streaks,
    enableReminders: dbSettings.enable_reminders,
    defaultReminderMinutes: dbSettings.default_reminder_minutes,
    dayColors: dbSettings.day_colors,
  };
};

const settingsToDbSettings = (settings: CalendarSettings, userId: string): Partial<CalendarSettingsDB> => ({
  user_id: userId,
  default_view: settings.defaultView,
  week_starts_on: settings.weekStartsOn,
  working_hours_start: settings.workingHours.start,
  working_hours_end: settings.workingHours.end,
  show_weekends: settings.showWeekends,
  show_todo_widget: settings.showTodoWidget,
  show_finance_widget: settings.showFinanceWidget,
  show_habits_widget: settings.showHabitsWidget,
  show_journal_widget: settings.showJournalWidget,
  background_type: settings.backgroundType,
  background_theme: settings.backgroundTheme,
  background_image: settings.backgroundImage,
  color_scheme: settings.colorScheme,
  sync_with_todos: settings.syncWithTodos,
  sync_with_habits: settings.syncWithHabits,
  sync_with_journal: settings.syncWithJournal,
  show_todo_deadlines: settings.showTodoDeadlines,
  show_habit_streaks: settings.showHabitStreaks,
  enable_reminders: settings.enableReminders,
  default_reminder_minutes: settings.defaultReminderMinutes,
  day_colors: settings.dayColors,
});

export const useCalendarSupabase = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [settings, setSettings] = useState<CalendarSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
      }
    };
    getCurrentUser();
  }, []);

  // Fetch events and settings
  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        // Fetch events
        const { data: eventsData, error: eventsError } = await supabase
          .from("calendar_events")
          .select("*")
          .eq("user_id", userId)
          .order("start_date", { ascending: true });

        if (eventsError) throw eventsError;

        const convertedEvents = (eventsData || []).map(dbEventToEvent);
        setEvents(convertedEvents);

        // Fetch settings
        const { data: settingsData, error: settingsError } = await supabase
          .from("calendar_settings")
          .select("*")
          .eq("user_id", userId)
          .single();

        if (settingsError && settingsError.code !== "PGRST116") {
          throw settingsError;
        }

        setSettings(dbSettingsToSettings(settingsData));
        setIsLoaded(true);
      } catch (error: any) {
        console.error("Error fetching calendar data:", error);
        toast.error("Failed to load calendar");
        setIsLoaded(true);
      }
    };

    fetchData();
  }, [userId]);

  const addEvent = async (event: CalendarEvent) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("calendar_events")
        .insert(eventToDbEvent(event, userId))
        .select()
        .single();

      if (error) throw error;

      const newEvent = dbEventToEvent(data);
      setEvents((prev) => [...prev, newEvent]);
      toast.success("Event added!");
    } catch (error: any) {
      console.error("Error adding event:", error);
      toast.error("Failed to add event");
    }
  };

  const updateEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    if (!userId) return;

    try {
      const dbUpdates: any = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate.toISOString();
      if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate.toISOString();
      if (updates.allDay !== undefined) dbUpdates.all_day = updates.allDay;
      if (updates.color !== undefined) dbUpdates.color = updates.color;
      if (updates.location !== undefined) dbUpdates.location = updates.location;
      if (updates.recurring !== undefined) dbUpdates.recurring = updates.recurring;
      if (updates.linkedTodoId !== undefined) dbUpdates.linked_todo_id = updates.linkedTodoId;
      if (updates.linkedHabitId !== undefined) dbUpdates.linked_habit_id = updates.linkedHabitId;
      if (updates.linkedJournalId !== undefined) dbUpdates.linked_journal_id = updates.linkedJournalId;
      if (updates.reminders !== undefined) dbUpdates.reminders = updates.reminders;
      if (updates.attachments !== undefined) dbUpdates.attachments = updates.attachments;
      if (updates.attendees !== undefined) dbUpdates.attendees = updates.attendees;

      const { data, error } = await supabase
        .from("calendar_events")
        .update(dbUpdates)
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;

      const updatedEvent = dbEventToEvent(data);
      setEvents((prev) => prev.map((e) => (e.id === id ? updatedEvent : e)));
    } catch (error: any) {
      console.error("Error updating event:", error);
      toast.error("Failed to update event");
    }
  };

  const deleteEvent = async (id: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from("calendar_events")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;

      setEvents((prev) => prev.filter((e) => e.id !== id));
      toast.success("Event deleted!");
    } catch (error: any) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    }
  };

  const updateSettings = async (newSettings: Partial<CalendarSettings>) => {
    if (!userId) return;

    try {
      const updatedSettings = { ...settings, ...newSettings };

      // Check if settings exist
      const { data: existing } = await supabase
        .from("calendar_settings")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from("calendar_settings")
          .update(settingsToDbSettings(updatedSettings, userId))
          .eq("user_id", userId);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from("calendar_settings")
          .insert(settingsToDbSettings(updatedSettings, userId));

        if (error) throw error;
      }

      setSettings(updatedSettings);
    } catch (error: any) {
      console.error("Error updating settings:", error);
      toast.error("Failed to update settings");
    }
  };

  return {
    events,
    settings,
    isLoaded,
    addEvent,
    updateEvent,
    deleteEvent,
    updateSettings
  };
};
