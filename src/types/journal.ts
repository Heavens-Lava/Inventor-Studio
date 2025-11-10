export type MoodType =
  | "amazing"
  | "happy"
  | "okay"
  | "sad"
  | "anxious"
  | "stressed"
  | "excited"
  | "calm"
  | "grateful"
  | "tired";

export type JournalCategory =
  | "personal"
  | "work"
  | "travel"
  | "gratitude"
  | "goals"
  | "dreams"
  | "memories"
  | "thoughts"
  | "other";

export interface JournalSticker {
  id: string;
  emoji: string;
  x: number;
  y: number;
}

export interface JournalImage {
  id: string;
  url: string;
  caption?: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string; // Rich text content
  date: Date;
  mood?: MoodType;
  category: JournalCategory;
  tags: string[];
  stickers: JournalSticker[];
  images: JournalImage[];
  backgroundColor?: string;
  template?: string;
  isFavorite: boolean;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface JournalSettings {
  defaultCategory: JournalCategory;
  defaultTemplate: string;
  enableMoodTracking: boolean;
  dailyReminder: boolean;
  reminderTime?: string;
  theme: "light" | "dark" | "system";
}

export const MOOD_EMOJIS: Record<MoodType, string> = {
  amazing: "🤩",
  happy: "😊",
  okay: "😐",
  sad: "😢",
  anxious: "😰",
  stressed: "😫",
  excited: "🎉",
  calm: "😌",
  grateful: "🙏",
  tired: "😴"
};

export const MOOD_LABELS: Record<MoodType, string> = {
  amazing: "Amazing",
  happy: "Happy",
  okay: "Okay",
  sad: "Sad",
  anxious: "Anxious",
  stressed: "Stressed",
  excited: "Excited",
  calm: "Calm",
  grateful: "Grateful",
  tired: "Tired"
};

export const MOOD_COLORS: Record<MoodType, string> = {
  amazing: "#f59e0b",
  happy: "#10b981",
  okay: "#6b7280",
  sad: "#3b82f6",
  anxious: "#8b5cf6",
  stressed: "#ef4444",
  excited: "#ec4899",
  calm: "#06b6d4",
  grateful: "#84cc16",
  tired: "#64748b"
};

export const CATEGORY_LABELS: Record<JournalCategory, string> = {
  personal: "Personal",
  work: "Work",
  travel: "Travel",
  gratitude: "Gratitude",
  goals: "Goals",
  dreams: "Dreams",
  memories: "Memories",
  thoughts: "Thoughts",
  other: "Other"
};

export const CATEGORY_ICONS: Record<JournalCategory, string> = {
  personal: "👤",
  work: "💼",
  travel: "✈️",
  gratitude: "🙏",
  goals: "🎯",
  dreams: "💭",
  memories: "📸",
  thoughts: "💡",
  other: "📝"
};

export const STICKER_OPTIONS = [
  "❤️", "⭐", "✨", "🌈", "🌸", "🌺", "🌻", "🌼",
  "🦋", "🐝", "🎈", "🎉", "🎊", "🎁", "💝", "💖",
  "☀️", "🌙", "⚡", "💫", "🔥", "💧", "🌊", "🌿",
  "🍀", "🌹", "🎵", "🎨", "📚", "✏️", "💭", "💬"
];

export const BACKGROUND_TEMPLATES = [
  { id: "plain-white", name: "Plain White", color: "#ffffff" },
  { id: "soft-yellow", name: "Soft Yellow", color: "#fef3c7" },
  { id: "light-blue", name: "Light Blue", color: "#dbeafe" },
  { id: "mint-green", name: "Mint Green", color: "#d1fae5" },
  { id: "lavender", name: "Lavender", color: "#e9d5ff" },
  { id: "peach", name: "Peach", color: "#fed7aa" },
  { id: "rose", name: "Rose", color: "#fce7f3" },
  { id: "sage", name: "Sage", color: "#dcfce7" }
];
