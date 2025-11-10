import { useState, useEffect } from "react";
import { CalendarEvent, CalendarSettings } from "@/types/calendar";

const STORAGE_KEY_EVENTS = "daily-haven-calendar-events";
const STORAGE_KEY_SETTINGS = "daily-haven-calendar-settings";

const DEFAULT_SETTINGS: CalendarSettings = {
  defaultView: "month",
  weekStartsOn: 0, // Sunday
  workingHours: {
    start: "09:00",
    end: "17:00"
  },
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

export const useCalendarStorage = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [settings, setSettings] = useState<CalendarSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedEvents = localStorage.getItem(STORAGE_KEY_EVENTS);
      const storedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);

      if (storedEvents) {
        const parsedEvents = JSON.parse(storedEvents);
        // Convert date strings back to Date objects
        const eventsWithDates = parsedEvents.map((event: CalendarEvent) => ({
          ...event,
          startDate: new Date(event.startDate),
          endDate: new Date(event.endDate),
          createdAt: new Date(event.createdAt),
          updatedAt: new Date(event.updatedAt),
          recurring: event.recurring?.endDate
            ? { ...event.recurring, endDate: new Date(event.recurring.endDate) }
            : event.recurring
        }));
        setEvents(eventsWithDates);
      }

      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save events to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
      } catch (error) {
        console.error("Error saving events to localStorage:", error);
      }
    }
  }, [events, isLoaded]);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
      } catch (error) {
        console.error("Error saving settings to localStorage:", error);
      }
    }
  }, [settings, isLoaded]);

  const addEvent = (event: CalendarEvent) => {
    setEvents((prev) => [...prev, event]);
  };

  const updateEvent = (id: string, updates: Partial<CalendarEvent>) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === id
          ? { ...event, ...updates, updatedAt: new Date() }
          : event
      )
    );
  };

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((event) => event.id !== id));
  };

  const updateSettings = (newSettings: Partial<CalendarSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
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
