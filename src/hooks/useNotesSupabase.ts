import { useState, useEffect, useCallback } from 'react';
import { supabase, NoteDB, NotebookDB, NoteTagDB, NotesSettingsDB } from '@/lib/supabase';
import type { Note, Notebook, Tag, NotesFilter, NotesSortConfig, NotesSettings } from '@/types/note';
import { toast } from 'sonner';
import { NOTES_BADGES } from '@/lib/notesGamification';

// Helper functions to convert between app types and database types
const dbNoteToNote = (dbNote: NoteDB): Note => ({
  id: dbNote.id,
  title: dbNote.title,
  content: dbNote.content,
  plainText: dbNote.plain_text,
  notebookId: dbNote.notebook_id || null,
  tags: dbNote.tags || [],
  createdAt: new Date(dbNote.created_at),
  updatedAt: new Date(dbNote.updated_at),
  isFavorite: dbNote.is_favorite,
  isArchived: dbNote.is_archived,
  isPinned: dbNote.is_pinned,
  wordCount: dbNote.word_count,
  characterCount: dbNote.character_count,
  drawingData: dbNote.drawing_data || [],
  points: dbNote.points,
  streak: dbNote.streak,
});

const noteToDbNote = (note: Note, userId: string): Partial<NoteDB> => ({
  user_id: userId,
  title: note.title,
  content: note.content,
  plain_text: note.plainText,
  notebook_id: note.notebookId || undefined,
  tags: note.tags,
  is_favorite: note.isFavorite,
  is_archived: note.isArchived,
  is_pinned: note.isPinned,
  word_count: note.wordCount,
  character_count: note.characterCount,
  drawing_data: note.drawingData,
  points: note.points,
  streak: note.streak,
});

const dbNotebookToNotebook = (dbNotebook: NotebookDB): Notebook => ({
  id: dbNotebook.id,
  name: dbNotebook.name,
  description: dbNotebook.description,
  icon: dbNotebook.icon,
  color: dbNotebook.color,
  createdAt: new Date(dbNotebook.created_at),
  updatedAt: new Date(dbNotebook.updated_at),
  noteCount: dbNotebook.note_count,
  order: dbNotebook.display_order,
});

const notebookToDbNotebook = (notebook: Notebook, userId: string): Partial<NotebookDB> => ({
  user_id: userId,
  name: notebook.name,
  description: notebook.description,
  icon: notebook.icon,
  color: notebook.color,
  note_count: notebook.noteCount,
  display_order: notebook.order,
});

const dbTagToTag = (dbTag: NoteTagDB): Tag => ({
  id: dbTag.id,
  name: dbTag.name,
  color: dbTag.color,
  createdAt: new Date(dbTag.created_at),
  noteCount: dbTag.note_count,
});

const tagToDbTag = (tag: Tag, userId: string): Partial<NoteTagDB> => ({
  user_id: userId,
  name: tag.name,
  color: tag.color,
  note_count: tag.noteCount,
});

const dbSettingsToSettings = (dbSettings: NotesSettingsDB | null): NotesSettings => {
  if (!dbSettings) {
    return {
      enableGamification: true,
      userStats: {
        totalPoints: 0,
        level: 1,
        badges: NOTES_BADGES.map(b => ({ ...b })),
        notesCreated: 0,
        totalWords: 0,
        currentStreak: 0,
        longestStreak: 0,
      },
    };
  }

  return {
    enableGamification: dbSettings.enable_gamification,
    userStats: dbSettings.user_stats,
  };
};

const settingsToDbSettings = (settings: NotesSettings, userId: string): Partial<NotesSettingsDB> => ({
  user_id: userId,
  enable_gamification: settings.enableGamification,
  user_stats: settings.userStats,
});

/**
 * Hook for managing notes with Supabase persistence
 */
export function useNotesSupabase() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [settings, setSettings] = useState<NotesSettings>({
    enableGamification: true,
    userStats: {
      totalPoints: 0,
      level: 1,
      badges: NOTES_BADGES.map(b => ({ ...b })),
      notesCreated: 0,
      totalWords: 0,
      currentStreak: 0,
      longestStreak: 0,
    },
  });
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

  // Fetch notes, notebooks, tags, and settings
  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        // Fetch notes
        const { data: notesData, error: notesError } = await supabase
          .from('notes')
          .select('*')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false });

        if (notesError) throw notesError;

        const convertedNotes = (notesData || []).map(dbNoteToNote);
        setNotes(convertedNotes);

        // Fetch notebooks
        const { data: notebooksData, error: notebooksError } = await supabase
          .from('notebooks')
          .select('*')
          .eq('user_id', userId)
          .order('display_order', { ascending: true });

        if (notebooksError) throw notebooksError;

        const convertedNotebooks = (notebooksData || []).map(dbNotebookToNotebook);
        setNotebooks(convertedNotebooks);

        // Fetch tags
        const { data: tagsData, error: tagsError } = await supabase
          .from('note_tags')
          .select('*')
          .eq('user_id', userId)
          .order('name', { ascending: true });

        if (tagsError) throw tagsError;

        const convertedTags = (tagsData || []).map(dbTagToTag);
        setTags(convertedTags);

        // Fetch settings
        const { data: settingsData, error: settingsError } = await supabase
          .from('notes_settings')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (settingsError && settingsError.code !== 'PGRST116') {
          throw settingsError;
        }

        setSettings(dbSettingsToSettings(settingsData));
        setIsLoaded(true);
      } catch (error: any) {
        console.error('Error fetching notes data:', error);
        toast.error('Failed to load notes');
        setIsLoaded(true);
      }
    };

    fetchData();
  }, [userId]);

  /**
   * Create a new note
   */
  const createNote = useCallback(async (title: string = 'Untitled Note'): Promise<Note> => {
    if (!userId) throw new Error('User not authenticated');

    const newNoteData: Partial<NoteDB> = {
      user_id: userId,
      title,
      content: '',
      plain_text: '',
      notebook_id: undefined,
      tags: [],
      is_favorite: false,
      is_archived: false,
      is_pinned: false,
      word_count: 0,
      character_count: 0,
      drawing_data: [],
    };

    try {
      const { data, error } = await supabase
        .from('notes')
        .insert(newNoteData)
        .select()
        .single();

      if (error) throw error;

      const newNote = dbNoteToNote(data);
      setNotes((prev) => [newNote, ...prev]);
      setActiveNoteId(newNote.id);

      return newNote;
    } catch (error: any) {
      console.error('Error creating note:', error);
      toast.error('Failed to create note');
      throw error;
    }
  }, [userId]);

  /**
   * Update an existing note
   */
  const updateNote = useCallback(async (noteId: string, updates: Partial<Note>): Promise<void> => {
    if (!userId) return;

    try {
      const dbUpdates: any = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.content !== undefined) dbUpdates.content = updates.content;
      if (updates.plainText !== undefined) dbUpdates.plain_text = updates.plainText;
      if (updates.notebookId !== undefined) dbUpdates.notebook_id = updates.notebookId;
      if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
      if (updates.isFavorite !== undefined) dbUpdates.is_favorite = updates.isFavorite;
      if (updates.isArchived !== undefined) dbUpdates.is_archived = updates.isArchived;
      if (updates.isPinned !== undefined) dbUpdates.is_pinned = updates.isPinned;
      if (updates.wordCount !== undefined) dbUpdates.word_count = updates.wordCount;
      if (updates.characterCount !== undefined) dbUpdates.character_count = updates.characterCount;
      if (updates.drawingData !== undefined) dbUpdates.drawing_data = updates.drawingData;
      if (updates.points !== undefined) dbUpdates.points = updates.points;
      if (updates.streak !== undefined) dbUpdates.streak = updates.streak;

      const { data, error } = await supabase
        .from('notes')
        .update(dbUpdates)
        .eq('id', noteId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      const updatedNote = dbNoteToNote(data);
      setNotes((prev) => prev.map((n) => (n.id === noteId ? updatedNote : n)));
    } catch (error: any) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
    }
  }, [userId]);

  /**
   * Delete a note
   */
  const deleteNote = useCallback(async (noteId: string): Promise<void> => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', userId);

      if (error) throw error;

      setNotes((prev) => prev.filter((n) => n.id !== noteId));

      if (activeNoteId === noteId) {
        setActiveNoteId(null);
      }
    } catch (error: any) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  }, [userId, activeNoteId]);

  /**
   * Get a note by ID
   */
  const getNote = useCallback(async (noteId: string): Promise<Note | null> => {
    const note = notes.find((n) => n.id === noteId);
    return note || null;
  }, [notes]);

  /**
   * Toggle favorite status
   */
  const toggleFavorite = useCallback(async (noteId: string): Promise<void> => {
    const note = notes.find((n) => n.id === noteId);
    if (!note) return;

    await updateNote(noteId, { isFavorite: !note.isFavorite });
  }, [notes, updateNote]);

  /**
   * Toggle archive status
   */
  const toggleArchive = useCallback(async (noteId: string): Promise<void> => {
    const note = notes.find((n) => n.id === noteId);
    if (!note) return;

    await updateNote(noteId, { isArchived: !note.isArchived });
  }, [notes, updateNote]);

  /**
   * Toggle pin status
   */
  const togglePin = useCallback(async (noteId: string): Promise<void> => {
    const note = notes.find((n) => n.id === noteId);
    if (!note) return;

    await updateNote(noteId, { isPinned: !note.isPinned });
  }, [notes, updateNote]);

  /**
   * Search notes
   */
  const searchNotes = useCallback(async (query: string): Promise<Note[]> => {
    if (!query.trim()) return notes;

    const lowerQuery = query.toLowerCase();
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(lowerQuery) ||
        note.plainText.toLowerCase().includes(lowerQuery)
    );
  }, [notes]);

  /**
   * Filter and sort notes
   */
  const filterAndSortNotes = useCallback((
    filter?: NotesFilter,
    sortConfig?: NotesSortConfig
  ): Note[] => {
    let filtered = [...notes];

    // Apply filters
    if (filter) {
      if (filter.notebookId !== undefined) {
        filtered = filtered.filter((note) => note.notebookId === filter.notebookId);
      }
      if (filter.tags && filter.tags.length > 0) {
        filtered = filtered.filter((note) =>
          filter.tags!.some((tag) => note.tags.includes(tag))
        );
      }
      if (filter.isFavorite !== undefined) {
        filtered = filtered.filter((note) => note.isFavorite === filter.isFavorite);
      }
      if (filter.isArchived !== undefined) {
        filtered = filtered.filter((note) => note.isArchived === filter.isArchived);
      }
      if (filter.searchQuery) {
        const query = filter.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (note) =>
            note.title.toLowerCase().includes(query) ||
            note.plainText.toLowerCase().includes(query)
        );
      }
    }

    // Apply sorting
    if (sortConfig) {
      filtered.sort((a, b) => {
        let comparison = 0;

        switch (sortConfig.sortBy) {
          case 'title':
            comparison = a.title.localeCompare(b.title);
            break;
          case 'createdAt':
            comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            break;
          case 'updatedAt':
          default:
            comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
            break;
        }

        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    // Pinned notes always on top
    return filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });
  }, [notes]);

  /**
   * Create a new notebook
   */
  const createNotebook = useCallback(async (name: string): Promise<Notebook> => {
    if (!userId) throw new Error('User not authenticated');

    const newNotebookData: Partial<NotebookDB> = {
      user_id: userId,
      name,
      note_count: 0,
      display_order: notebooks.length,
    };

    try {
      const { data, error } = await supabase
        .from('notebooks')
        .insert(newNotebookData)
        .select()
        .single();

      if (error) throw error;

      const newNotebook = dbNotebookToNotebook(data);
      setNotebooks((prev) => [...prev, newNotebook]);

      return newNotebook;
    } catch (error: any) {
      console.error('Error creating notebook:', error);
      toast.error('Failed to create notebook');
      throw error;
    }
  }, [userId, notebooks]);

  /**
   * Create a new tag
   */
  const createTag = useCallback(async (name: string, color?: string): Promise<Tag> => {
    if (!userId) throw new Error('User not authenticated');

    // Check if tag already exists
    const existing = tags.find((t) => t.name.toLowerCase() === name.toLowerCase());
    if (existing) return existing;

    const newTagData: Partial<NoteTagDB> = {
      user_id: userId,
      name,
      color,
      note_count: 0,
    };

    try {
      const { data, error } = await supabase
        .from('note_tags')
        .insert(newTagData)
        .select()
        .single();

      if (error) throw error;

      const newTag = dbTagToTag(data);
      setTags((prev) => [...prev, newTag]);

      return newTag;
    } catch (error: any) {
      console.error('Error creating tag:', error);
      toast.error('Failed to create tag');
      throw error;
    }
  }, [userId, tags]);

  /**
   * Add tag to note
   */
  const addTagToNote = useCallback(async (noteId: string, tagName: string): Promise<void> => {
    const note = notes.find((n) => n.id === noteId);
    if (!note) return;

    // Create tag if it doesn't exist
    await createTag(tagName);

    // Add tag to note if not already present
    if (!note.tags.includes(tagName)) {
      await updateNote(noteId, {
        tags: [...note.tags, tagName],
      });
    }
  }, [notes, createTag, updateNote]);

  /**
   * Remove tag from note
   */
  const removeTagFromNote = useCallback(async (noteId: string, tagName: string): Promise<void> => {
    const note = notes.find((n) => n.id === noteId);
    if (!note) return;

    await updateNote(noteId, {
      tags: note.tags.filter((t) => t !== tagName),
    });
  }, [notes, updateNote]);

  /**
   * Update settings
   */
  const updateSettings = useCallback(async (updates: Partial<NotesSettings>) => {
    if (!userId) return;

    try {
      const updatedSettings = { ...settings, ...updates };

      // Check if settings exist
      const { data: existing } = await supabase
        .from('notes_settings')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('notes_settings')
          .update(settingsToDbSettings(updatedSettings, userId))
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('notes_settings')
          .insert(settingsToDbSettings(updatedSettings, userId));

        if (error) throw error;
      }

      setSettings(updatedSettings);
    } catch (error: any) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    }
  }, [userId, settings]);

  return {
    // State
    notes,
    notebooks,
    tags,
    isLoaded,
    activeNoteId,
    setActiveNoteId,
    settings,

    // Note operations
    createNote,
    updateNote,
    deleteNote,
    getNote,
    toggleFavorite,
    toggleArchive,
    togglePin,
    searchNotes,
    filterAndSortNotes,

    // Notebook operations
    createNotebook,

    // Tag operations
    createTag,
    addTagToNote,
    removeTagFromNote,

    // Settings
    updateSettings,
  };
}
