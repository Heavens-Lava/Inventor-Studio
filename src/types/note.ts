export interface DrawingElement {
  type: 'pen' | 'rectangle' | 'circle' | 'line' | 'eraser';
  points: Array<{ x: number; y: number }>;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  plainText: string;

  // Organization
  notebookId: string | null;
  tags: string[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;

  // Flags
  isFavorite: boolean;
  isArchived: boolean;
  isPinned: boolean;

  // Stats
  wordCount: number;
  characterCount: number;

  // Drawing data
  drawingData?: DrawingElement[];
}

export interface Notebook {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
  noteCount: number;
  order: number;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
  createdAt: Date;
  noteCount: number;
}

export type SortOption = 'updatedAt' | 'createdAt' | 'title';
export type SortDirection = 'asc' | 'desc';

export interface NotesFilter {
  notebookId?: string | null;
  tags?: string[];
  isFavorite?: boolean;
  isArchived?: boolean;
  searchQuery?: string;
}

export interface NotesSortConfig {
  sortBy: SortOption;
  direction: SortDirection;
}
