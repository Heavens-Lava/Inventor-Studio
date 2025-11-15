import { Note, NotesBadge, NotesUserStats } from "@/types/note";

export const NOTES_BADGES: NotesBadge[] = [
  {
    id: "first-note",
    name: "First Steps",
    description: "Create your first note",
    icon: "📝",
    requirement: 1
  },
  {
    id: "note-taker-10",
    name: "Note Taker",
    description: "Create 10 notes",
    icon: "📚",
    requirement: 10
  },
  {
    id: "note-master-50",
    name: "Note Master",
    description: "Create 50 notes",
    icon: "🎓",
    requirement: 50
  },
  {
    id: "note-legend-100",
    name: "Note Legend",
    description: "Create 100 notes",
    icon: "👑",
    requirement: 100
  },
  {
    id: "wordsmith-1k",
    name: "Wordsmith",
    description: "Write 1,000 words total",
    icon: "✍️",
    requirement: 1000
  },
  {
    id: "wordsmith-10k",
    name: "Wordsmith Master",
    description: "Write 10,000 words total",
    icon: "📖",
    requirement: 10000
  },
  {
    id: "wordsmith-50k",
    name: "Novelist",
    description: "Write 50,000 words total",
    icon: "🏆",
    requirement: 50000
  },
  {
    id: "streak-3",
    name: "Getting Consistent",
    description: "Write for 3 days in a row",
    icon: "🔥",
    requirement: 3
  },
  {
    id: "streak-7",
    name: "Week Writer",
    description: "Write for 7 days in a row",
    icon: "⭐",
    requirement: 7
  },
  {
    id: "streak-30",
    name: "Monthly Dedication",
    description: "Write for 30 days in a row",
    icon: "💎",
    requirement: 30
  },
  {
    id: "long-note",
    name: "Essay Writer",
    description: "Write a note with 500+ words",
    icon: "📄",
    requirement: 500
  },
  {
    id: "organized",
    name: "Organized Mind",
    description: "Use tags on 10 notes",
    icon: "🏷️",
    requirement: 10
  },
  {
    id: "favorite-collector",
    name: "Favorite Collector",
    description: "Mark 5 notes as favorite",
    icon: "⭐",
    requirement: 5
  },
  {
    id: "artist",
    name: "Visual Thinker",
    description: "Add drawings to 10 notes",
    icon: "🎨",
    requirement: 10
  }
];

/**
 * Calculate points for a note based on various factors
 */
export const calculateNotePoints = (note: Note): number => {
  let points = 5; // Base points for creating/updating a note

  // Word count bonus (1 point per 10 words, capped at 50 points)
  const wordPoints = Math.min(Math.floor(note.wordCount / 10), 50);
  points += wordPoints;

  // Long note bonus (500+ words)
  if (note.wordCount >= 500) {
    points += 20;
  }

  // Tags bonus (5 points per tag, capped at 15 points)
  if (note.tags && note.tags.length > 0) {
    points += Math.min(note.tags.length * 5, 15);
  }

  // Drawing bonus
  if (note.drawingData && note.drawingData.length > 0) {
    points += 10;
  }

  // Favorite bonus
  if (note.isFavorite) {
    points += 5;
  }

  // Streak bonus
  if (note.streak && note.streak.currentStreak > 0) {
    points += note.streak.currentStreak * 2;
  }

  return points;
};

/**
 * Calculate level based on total points
 */
export const calculateNotesLevel = (totalPoints: number): number => {
  if (totalPoints < 100) return 1;
  if (totalPoints < 300) return 2;
  if (totalPoints < 600) return 3;
  if (totalPoints < 1000) return 4;
  if (totalPoints < 1500) return 5;
  if (totalPoints < 2100) return 6;
  if (totalPoints < 2800) return 7;
  if (totalPoints < 3600) return 8;
  if (totalPoints < 4500) return 9;
  return Math.floor(totalPoints / 500) + 1;
};

/**
 * Get points needed for next level
 */
export const getNextNotesLevelPoints = (currentLevel: number): number => {
  const thresholds = [100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500];
  if (currentLevel < thresholds.length) {
    return thresholds[currentLevel];
  }
  return currentLevel * 500;
};

/**
 * Check if a badge has been earned
 */
export const checkNotesBadgeEarned = (
  badge: NotesBadge,
  stats: NotesUserStats,
  notes: Note[]
): boolean => {
  switch (badge.id) {
    case "first-note":
    case "note-taker-10":
    case "note-master-50":
    case "note-legend-100":
      return stats.notesCreated >= badge.requirement;

    case "wordsmith-1k":
    case "wordsmith-10k":
    case "wordsmith-50k":
      return stats.totalWords >= badge.requirement;

    case "streak-3":
    case "streak-7":
    case "streak-30":
      return stats.currentStreak >= badge.requirement;

    case "long-note":
      return notes.some(note => note.wordCount >= badge.requirement);

    case "organized":
      const notesWithTags = notes.filter(note => note.tags && note.tags.length > 0);
      return notesWithTags.length >= badge.requirement;

    case "favorite-collector":
      const favoriteNotes = notes.filter(note => note.isFavorite);
      return favoriteNotes.length >= badge.requirement;

    case "artist":
      const notesWithDrawings = notes.filter(
        note => note.drawingData && note.drawingData.length > 0
      );
      return notesWithDrawings.length >= badge.requirement;

    default:
      return false;
  }
};

/**
 * Update streak data when a note is created or updated
 */
export const updateWritingStreak = (note: Note): Note => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (!note.streak) {
    note.streak = {
      currentStreak: 1,
      longestStreak: 1,
      writingDates: [now],
      lastWriteDate: now
    };
    return note;
  }

  const lastWrite = note.streak.lastWriteDate ? new Date(note.streak.lastWriteDate) : null;

  if (lastWrite) {
    lastWrite.setHours(0, 0, 0, 0);
    const daysDiff = Math.floor((now.getTime() - lastWrite.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) {
      // Same day, don't increment streak
      return note;
    } else if (daysDiff === 1) {
      // Consecutive day, increment streak
      note.streak.currentStreak++;
      note.streak.longestStreak = Math.max(note.streak.longestStreak, note.streak.currentStreak);
    } else {
      // Streak broken, reset to 1
      note.streak.currentStreak = 1;
    }
  }

  note.streak.writingDates.push(now);
  note.streak.lastWriteDate = now;

  return note;
};
