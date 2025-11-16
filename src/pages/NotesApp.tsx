import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotesStorage } from '@/hooks/useNotesStorage';
import { NoteEditor } from '@/components/notes/NoteEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  ArrowLeft,
  Plus,
  Search,
  Star,
  Trash2,
  Book,
  StickyNote,
  Pin,
  Tag as TagIcon,
  X,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { TagInput } from '@/components/notes/TagInput';
import { Badge } from '@/components/ui/badge';
import {
  calculateNotePoints,
  calculateNotesLevel,
  updateWritingStreak,
  checkNotesBadgeEarned,
  NOTES_BADGES,
} from '@/lib/notesGamification';
import { NotesUserStats } from '@/types/note';

export default function NotesApp() {
  const navigate = useNavigate();
  const {
    notes,
    isLoaded,
    activeNoteId,
    setActiveNoteId,
    createNote,
    deleteNote,
    updateNote,
    toggleFavorite,
    togglePin,
    filterAndSortNotes,
    addTagToNote,
    removeTagFromNote,
    settings,
    updateSettings,
  } = useNotesStorage();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [editingDrawingData, setEditingDrawingData] = useState<any[]>([]);

  // Calculate user stats from notes
  const userStats: NotesUserStats = useMemo(() => {
    if (!settings.userStats) {
      return {
        totalPoints: 0,
        level: 1,
        badges: NOTES_BADGES.map(b => ({ ...b })),
        notesCreated: 0,
        totalWords: 0,
        currentStreak: 0,
        longestStreak: 0,
      };
    }

    const totalWords = notes.reduce((sum, note) => sum + note.wordCount, 0);
    const totalPoints = notes.reduce((sum, note) => sum + (note.points || 0), 0);
    const level = calculateNotesLevel(totalPoints);

    // Calculate current streak
    let currentStreak = 0;
    let longestStreak = 0;

    notes.forEach((note) => {
      if (note.streak) {
        currentStreak = Math.max(currentStreak, note.streak.currentStreak);
        longestStreak = Math.max(longestStreak, note.streak.longestStreak);
      }
    });

    // Update badge progress
    const badges = NOTES_BADGES.map((badge) => {
      const earned = checkNotesBadgeEarned(
        badge,
        {
          ...settings.userStats!,
          notesCreated: notes.length,
          totalWords,
          currentStreak,
          longestStreak,
          totalPoints,
        },
        notes
      );

      return {
        ...badge,
        earnedAt: earned ? badge.earnedAt || new Date() : undefined,
      };
    });

    return {
      totalPoints,
      level,
      badges,
      notesCreated: notes.length,
      totalWords,
      currentStreak,
      longestStreak,
    };
  }, [notes, settings.userStats]);

  // Get all unique tags from all notes
  const allTags = Array.from(
    new Set(notes.flatMap((note) => note.tags || []))
  ).sort();

  // Get filtered notes (non-archived by default, sorted by updated date)
  const filteredNotes = filterAndSortNotes(
    {
      isArchived: false,
      searchQuery,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
    },
    {
      sortBy: 'updatedAt',
      direction: 'desc',
    }
  );

  // Get active note
  const activeNote = notes.find((n) => n.id === activeNoteId);

  // Handle creating a new note
  const handleCreateNote = async () => {
    try {
      await createNote('Untitled Note');
      toast.success('New note created');
    } catch (error) {
      toast.error('Failed to create note');
      console.error(error);
    }
  };

  // Handle deleting a note
  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      await deleteNote(noteId);
      toast.success('Note deleted');
    } catch (error) {
      toast.error('Failed to delete note');
      console.error(error);
    }
  };

  // Handle toggling favorite
  const handleToggleFavorite = async (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await toggleFavorite(noteId);
    } catch (error) {
      toast.error('Failed to update favorite status');
      console.error(error);
    }
  };

  // Handle toggling pin
  const handleTogglePin = async (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await togglePin(noteId);
    } catch (error) {
      toast.error('Failed to update pin status');
      console.error(error);
    }
  };

  // Handle tag changes for active note
  const handleTagsChange = async (newTags: string[]) => {
    if (!activeNoteId) return;

    const currentTags = activeNote?.tags || [];
    const tagsToAdd = newTags.filter((tag) => !currentTags.includes(tag));
    const tagsToRemove = currentTags.filter((tag) => !newTags.includes(tag));

    try {
      for (const tag of tagsToAdd) {
        await addTagToNote(activeNoteId, tag);
      }
      for (const tag of tagsToRemove) {
        await removeTagFromNote(activeNoteId, tag);
      }
    } catch (error) {
      toast.error('Failed to update tags');
      console.error(error);
    }
  };

  // Toggle tag filter
  const toggleTagFilter = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Handle saving content with debounce
  const handleContentChange = useCallback((content: string) => {
    setEditingContent(content);
  }, []);

  // Handle drawing data changes
  const handleDrawingChange = useCallback((data: any[]) => {
    setEditingDrawingData(data);
  }, []);

  // Auto-save effect with debounce
  useEffect(() => {
    if (!activeNoteId || !activeNote) return;

    const timer = setTimeout(async () => {
      const plainText = editingContent.replace(/<[^>]*>/g, '');
      const wordCount = plainText.trim().split(/\s+/).filter(Boolean).length;

      try {
        // Prepare note update with gamification
        let noteUpdate = {
          content: editingContent,
          plainText,
          wordCount,
          characterCount: plainText.length,
          drawingData: editingDrawingData,
        };

        // Calculate gamification if enabled
        if (settings.enableGamification) {
          const updatedNoteData = {
            ...activeNote,
            ...noteUpdate,
          };

          // Update streak
          const noteWithStreak = updateWritingStreak(updatedNoteData);

          // Calculate points
          const points = calculateNotePoints(noteWithStreak);

          // Check for new badges
          const newBadges = NOTES_BADGES.filter((badge) => {
            const wasEarned = settings.userStats?.badges.find(
              (b) => b.id === badge.id
            )?.earnedAt;
            const isNowEarned = checkNotesBadgeEarned(
              badge,
              {
                ...userStats,
                totalWords: userStats.totalWords + wordCount - activeNote.wordCount,
                totalPoints: userStats.totalPoints + points - (activeNote.points || 0),
              },
              notes.map(n => n.id === activeNoteId ? noteWithStreak : n)
            );
            return !wasEarned && isNowEarned;
          });

          // Show notifications for new badges
          newBadges.forEach((badge) => {
            toast.success(`🏆 Badge Unlocked: ${badge.name}!`);
          });

          // Add gamification data to update
          noteUpdate = {
            ...noteUpdate,
            points,
            streak: noteWithStreak.streak,
          };
        }

        await updateNote(activeNoteId, noteUpdate);
      } catch (error) {
        console.error('Failed to save content:', error);
      }
    }, 1000); // Auto-save after 1 second of no typing

    return () => clearTimeout(timer);
  }, [editingContent, editingDrawingData, activeNoteId, activeNote, updateNote, settings.enableGamification, settings.userStats, userStats, notes]);

  // Start editing a note
  const handleSelectNote = (noteId: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (note) {
      setActiveNoteId(noteId);
      setEditingContent(note.content);
      setEditingDrawingData(note.drawingData || []);
    }
  };

  // Sync drawing data when active note changes
  useEffect(() => {
    if (activeNote) {
      setEditingDrawingData(activeNote.drawingData || []);
    }
  }, [activeNoteId, activeNote]);

  // Handle updating title
  const handleUpdateTitle = async (noteId: string, newTitle: string) => {
    try {
      await updateNote(noteId, { title: newTitle.trim() || 'Untitled Note' });
      setEditingTitle(null);
    } catch (error) {
      toast.error('Failed to update title');
      console.error(error);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="h-6 w-px bg-gray-300" />
          <Book className="w-5 h-5 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900">Notes</h1>
          {settings.enableGamification && settings.userStats && (
            <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full text-sm font-semibold">
              <span className="text-lg">⭐</span>
              <span>Level {userStats.level}</span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {settings.enableGamification && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/notes/stats')}
              className="flex items-center gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              View Stats
            </Button>
          )}
          <Button onClick={handleCreateNote}>
            <Plus className="w-4 h-4 mr-2" />
            New Note
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Tag Filters */}
          {allTags.length > 0 && (
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <TagIcon className="w-4 h-4 text-gray-600" />
                <h3 className="text-sm font-semibold text-gray-700">Filter by tags</h3>
                {selectedTags.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTags([])}
                    className="h-5 px-2 text-xs ml-auto"
                  >
                    Clear
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                    className={`cursor-pointer transition-all ${
                      selectedTags.includes(tag)
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => toggleTagFilter(tag)}
                  >
                    <TagIcon className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Notes List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {filteredNotes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <StickyNote className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No notes yet</p>
                <p className="text-sm mt-1">Create your first note to get started</p>
              </div>
            ) : (
              filteredNotes.map((note) => (
                <Card
                  key={note.id}
                  className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                    activeNoteId === note.id ? 'border-2 border-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => handleSelectNote(note.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{note.title}</h3>
                      <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                        {note.plainText || 'No content'}
                      </p>
                      {note.tags && note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {note.tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="px-1.5 py-0 text-xs bg-blue-100 text-blue-800"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {note.tags.length > 3 && (
                            <Badge variant="secondary" className="px-1.5 py-0 text-xs">
                              +{note.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <span>{note.wordCount} words</span>
                        <span>•</span>
                        <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={(e) => handleTogglePin(note.id, e)}
                      >
                        <Pin
                          className={`w-3 h-3 ${
                            note.isPinned ? 'fill-blue-600 text-blue-600' : ''
                          }`}
                        />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={(e) => handleToggleFavorite(note.id, e)}
                      >
                        <Star
                          className={`w-3 h-3 ${
                            note.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''
                          }`}
                        />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNote(note.id);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 bg-white flex flex-col">
          {activeNote ? (
            <>
              {/* Editor Header */}
              <div className="border-b border-gray-200 p-4 space-y-3">
                {editingTitle === activeNote.id ? (
                  <Input
                    value={activeNote.title}
                    onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
                    onBlur={() => setEditingTitle(null)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleUpdateTitle(activeNote.id, activeNote.title);
                      }
                      if (e.key === 'Escape') {
                        setEditingTitle(null);
                      }
                    }}
                    autoFocus
                    className="text-2xl font-bold border-none shadow-none focus-visible:ring-0"
                  />
                ) : (
                  <h2
                    className="text-2xl font-bold cursor-pointer hover:text-blue-600"
                    onClick={() => setEditingTitle(activeNote.id)}
                  >
                    {activeNote.title}
                  </h2>
                )}
                <div className="flex items-center gap-3">
                  <p className="text-sm text-gray-500">
                    Last edited {new Date(activeNote.updatedAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TagIcon className="w-4 h-4 text-gray-600" />
                    <h3 className="text-sm font-semibold text-gray-700">Tags</h3>
                  </div>
                  <TagInput
                    tags={activeNote.tags || []}
                    onTagsChange={handleTagsChange}
                    availableTags={allTags}
                    placeholder="Add a tag..."
                  />
                </div>
              </div>

              {/* Rich Text Editor */}
              <div className="flex-1 overflow-hidden">
                <NoteEditor
                  content={editingContent}
                  onChange={handleContentChange}
                  drawingData={editingDrawingData}
                  onDrawingChange={handleDrawingChange}
                  placeholder="Start typing your note..."
                  noteId={activeNoteId || undefined}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <StickyNote className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-semibold">No note selected</p>
                <p className="text-sm mt-1">Select a note or create a new one to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
