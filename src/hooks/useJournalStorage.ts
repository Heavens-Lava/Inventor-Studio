import { useState, useEffect } from "react";
import { JournalEntry, JournalSettings } from "@/types/journal";

const STORAGE_KEY_ENTRIES = "daily-haven-journal-entries";
const STORAGE_KEY_SETTINGS = "daily-haven-journal-settings";

const DEFAULT_SETTINGS: JournalSettings = {
  defaultCategory: "personal",
  defaultTemplate: "plain-white",
  enableMoodTracking: true,
  dailyReminder: false,
  theme: "system"
};

export const useJournalStorage = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [settings, setSettings] = useState<JournalSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedEntries = localStorage.getItem(STORAGE_KEY_ENTRIES);
      const storedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);

      if (storedEntries) {
        const parsedEntries = JSON.parse(storedEntries);
        const entriesWithDates = parsedEntries.map((entry: JournalEntry) => ({
          ...entry,
          date: new Date(entry.date),
          createdAt: new Date(entry.createdAt),
          updatedAt: new Date(entry.updatedAt)
        }));
        setEntries(entriesWithDates);
      }

      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }
    } catch (error) {
      console.error("Error loading journal from localStorage:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save entries to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(entries));
      } catch (error) {
        console.error("Error saving entries to localStorage:", error);
      }
    }
  }, [entries, isLoaded]);

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

  const addEntry = (entry: JournalEntry) => {
    setEntries((prev) => [entry, ...prev]);
  };

  const updateEntry = (id: string, updates: Partial<JournalEntry>) => {
    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === id
          ? { ...entry, ...updates, updatedAt: new Date() }
          : entry
      )
    );
  };

  const deleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  const toggleFavorite = (id: string) => {
    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === id
          ? { ...entry, isFavorite: !entry.isFavorite, updatedAt: new Date() }
          : entry
      )
    );
  };

  const updateSettings = (newSettings: Partial<JournalSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const getEntriesByDate = (date: Date) => {
    return entries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return (
        entryDate.getFullYear() === date.getFullYear() &&
        entryDate.getMonth() === date.getMonth() &&
        entryDate.getDate() === date.getDate()
      );
    });
  };

  const getEntriesByMonth = (year: number, month: number) => {
    return entries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return (
        entryDate.getFullYear() === year &&
        entryDate.getMonth() === month
      );
    });
  };

  const getEntriesByMood = (mood: string) => {
    return entries.filter((entry) => entry.mood === mood);
  };

  const getEntriesByCategory = (category: string) => {
    return entries.filter((entry) => entry.category === category);
  };

  const getEntriesByTag = (tag: string) => {
    return entries.filter((entry) => entry.tags.includes(tag));
  };

  const getAllTags = () => {
    const tagSet = new Set<string>();
    entries.forEach((entry) => {
      entry.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  };

  return {
    entries,
    settings,
    isLoaded,
    addEntry,
    updateEntry,
    deleteEntry,
    toggleFavorite,
    updateSettings,
    getEntriesByDate,
    getEntriesByMonth,
    getEntriesByMood,
    getEntriesByCategory,
    getEntriesByTag,
    getAllTags
  };
};
