import { useState, useEffect, useCallback } from 'react';
import type { Note, Notebook, Tag, NotesFilter, NotesSortConfig } from '@/types/note';
import {
  initNotesDB,
  getAllFromStore,
  getByIdFromStore,
  putInStore,
  deleteFromStore,
  searchNotes as searchNotesInDB,
  STORES,
} from '@/utils/notesIndexedDB';

/**
 * Hook for managing notes with IndexedDB persistence
 */
export function useNotesStorage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  // Initialize database and load data
  useEffect(() => {
    const loadData = async () => {
      try {
        await initNotesDB();
        const [loadedNotes, loadedNotebooks, loadedTags] = await Promise.all([
          getAllFromStore<Note>(STORES.NOTES),
          getAllFromStore<Notebook>(STORES.NOTEBOOKS),
          getAllFromStore<Tag>(STORES.TAGS),
        ]);

        setNotes(loadedNotes);
        setNotebooks(loadedNotebooks);
        setTags(loadedTags);
        setIsLoaded(true);
      } catch (error) {
        console.error('Failed to load notes data:', error);
        setIsLoaded(true);
      }
    };

    loadData();
  }, []);

  /**
   * Create a new note
   */
  const createNote = useCallback(async (title: string = 'Untitled Note'): Promise<Note> => {
    const newNote: Note = {
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      content: '',
      plainText: '',
      notebookId: null,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isFavorite: false,
      isArchived: false,
      isPinned: false,
      wordCount: 0,
      characterCount: 0,
    };

    await putInStore(STORES.NOTES, newNote);
    setNotes((prev) => [newNote, ...prev]);
    setActiveNoteId(newNote.id);

    return newNote;
  }, []);

  /**
   * Update an existing note
   */
  const updateNote = useCallback(async (noteId: string, updates: Partial<Note>): Promise<void> => {
    const note = notes.find((n) => n.id === noteId);
    if (!note) return;

    const updatedNote: Note = {
      ...note,
      ...updates,
      updatedAt: new Date(),
    };

    await putInStore(STORES.NOTES, updatedNote);
    setNotes((prev) => prev.map((n) => (n.id === noteId ? updatedNote : n)));
  }, [notes]);

  /**
   * Delete a note
   */
  const deleteNote = useCallback(async (noteId: string): Promise<void> => {
    await deleteFromStore(STORES.NOTES, noteId);
    setNotes((prev) => prev.filter((n) => n.id !== noteId));

    if (activeNoteId === noteId) {
      setActiveNoteId(null);
    }
  }, [activeNoteId]);

  /**
   * Get a note by ID
   */
  const getNote = useCallback(async (noteId: string): Promise<Note | null> => {
    return await getByIdFromStore<Note>(STORES.NOTES, noteId);
  }, []);

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
   * Search notes
   */
  const searchNotes = useCallback(async (query: string): Promise<Note[]> => {
    if (!query.trim()) return notes;
    return await searchNotesInDB(query);
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
    const newNotebook: Notebook = {
      id: `notebook-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
      noteCount: 0,
      order: notebooks.length,
    };

    await putInStore(STORES.NOTEBOOKS, newNotebook);
    setNotebooks((prev) => [...prev, newNotebook]);

    return newNotebook;
  }, [notebooks]);

  /**
   * Create a new tag
   */
  const createTag = useCallback(async (name: string, color?: string): Promise<Tag> => {
    // Check if tag already exists
    const existing = tags.find((t) => t.name.toLowerCase() === name.toLowerCase());
    if (existing) return existing;

    const newTag: Tag = {
      id: `tag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      color,
      createdAt: new Date(),
      noteCount: 0,
    };

    await putInStore(STORES.TAGS, newTag);
    setTags((prev) => [...prev, newTag]);

    return newTag;
  }, [tags]);

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

  return {
    // State
    notes,
    notebooks,
    tags,
    isLoaded,
    activeNoteId,
    setActiveNoteId,

    // Note operations
    createNote,
    updateNote,
    deleteNote,
    getNote,
    toggleFavorite,
    toggleArchive,
    searchNotes,
    filterAndSortNotes,

    // Notebook operations
    createNotebook,

    // Tag operations
    createTag,
    addTagToNote,
    removeTagFromNote,
  };
}
