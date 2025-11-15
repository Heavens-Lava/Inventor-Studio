# Data Models & Storage Strategy

## Storage Architecture

### IndexedDB Structure

**Database Name:** `DailyHavenNotesDB`
**Version:** 1

#### Object Stores

```javascript
{
  notes: {
    keyPath: 'id',
    indexes: [
      'title',
      'createdAt',
      'updatedAt',
      'notebookId',
      'tags',
      'isFavorite',
      'isArchived'
    ]
  },
  notebooks: {
    keyPath: 'id',
    indexes: ['name', 'createdAt']
  },
  tags: {
    keyPath: 'id',
    indexes: ['name', 'noteCount']
  },
  media: {
    keyPath: 'id',
    indexes: ['noteId', 'type', 'uploadedAt']
  },
  templates: {
    keyPath: 'id',
    indexes: ['category', 'isCustom', 'createdAt']
  },
  drawings: {
    keyPath: 'id',
    indexes: ['noteId', 'createdAt']
  },
  clipboardHistory: {
    keyPath: 'id',
    indexes: ['copiedAt', 'isPinned']
  },
  themes: {
    keyPath: 'id',
    indexes: ['name', 'isCustom']
  }
}
```

## Data Models

### 1. Note Model

```typescript
interface Note {
  id: string;                          // UUID
  title: string;
  content: string;                     // HTML or Markdown
  plainText: string;                   // For search indexing
  notebookId: string | null;           // Reference to notebook
  tags: string[];                      // Array of tag IDs

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastEditedBy?: string;               // Future: user tracking

  // Organization
  isFavorite: boolean;
  isArchived: boolean;
  isPinned: boolean;
  color?: string;                      // Note accent color

  // Content references
  mediaIds: string[];                  // References to media items
  drawingIds: string[];                // References to drawings
  chartIds: string[];                  // Embedded charts

  // Settings
  template?: string;                   // Template used
  gridType?: GridType;                 // Active grid
  wordCount: number;
  characterCount: number;

  // Version history
  version: number;
  previousVersions?: NoteVersion[];    // Optional history tracking
}

interface NoteVersion {
  version: number;
  content: string;
  timestamp: Date;
  changeDescription?: string;
}
```

### 2. Notebook Model

```typescript
interface Notebook {
  id: string;
  name: string;
  description?: string;
  parentId: string | null;             // For nested notebooks
  icon?: string;                       // Emoji or icon name
  color?: string;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  noteCount: number;                   // Cached count

  // Organization
  order: number;                       // Display order
  isArchived: boolean;
}
```

### 3. Tag Model

```typescript
interface Tag {
  id: string;
  name: string;
  color?: string;
  icon?: string;

  // Metadata
  createdAt: Date;
  noteCount: number;                   // Cached count

  // Organization
  category?: string;                   // Tag grouping
}
```

### 4. Media Model

```typescript
interface Media {
  id: string;
  noteId: string;                      // Parent note
  type: MediaType;                     // 'image' | 'audio' | 'video'

  // File data
  fileName: string;
  mimeType: string;
  size: number;                        // Bytes
  blob: Blob;                          // Actual file data
  dataUrl?: string;                    // Base64 for quick access

  // Image-specific
  width?: number;
  height?: number;
  thumbnail?: string;                  // Compressed thumbnail

  // Metadata
  uploadedAt: Date;
  description?: string;
  altText?: string;
}

type MediaType = 'image' | 'audio' | 'video' | 'file';
```

### 5. Template Model

```typescript
interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;

  // Content
  content: string;                     // HTML template
  structure: TemplateSection[];        // Structured sections

  // Appearance
  thumbnail?: string;                  // Preview image
  icon?: string;
  defaultGridType?: GridType;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  isCustom: boolean;
  isPublic: boolean;                   // Future: sharing
  usageCount: number;

  // Settings
  defaultTheme?: string;
  defaultTags?: string[];
}

interface TemplateSection {
  id: string;
  type: 'heading' | 'text' | 'list' | 'table' | 'drawing';
  label: string;
  placeholder?: string;
  required?: boolean;
}

type TemplateCategory =
  | 'work'
  | 'personal'
  | 'education'
  | 'creative'
  | 'planning'
  | 'custom';
```

### 6. Drawing Model

```typescript
interface Drawing {
  id: string;
  noteId: string;

  // Canvas data
  canvasData: CanvasData;              // Fabric.js JSON or similar
  thumbnail: string;                   // PNG data URL

  // Properties
  width: number;
  height: number;
  layers: DrawingLayer[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;

  // Settings
  gridEnabled: boolean;
  gridSize: number;
  backgroundColor: string;
}

interface CanvasData {
  version: string;                     // Canvas library version
  objects: any[];                      // Drawing objects
  background?: string;
}

interface DrawingLayer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  objects: string[];                   // Object IDs in this layer
}
```

### 7. Chart Model

```typescript
interface Chart {
  id: string;
  noteId: string;

  // Chart properties
  type: ChartType;
  title: string;
  data: ChartData;
  options: ChartOptions;

  // Metadata
  createdAt: Date;
  updatedAt: Date;

  // Display
  width?: number;
  height?: number;
}

type ChartType = 'bar' | 'line' | 'pie' | 'scatter' | 'area' | 'radar';

interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

interface ChartOptions {
  responsive: boolean;
  maintainAspectRatio: boolean;
  plugins: {
    legend?: {
      display: boolean;
      position?: 'top' | 'bottom' | 'left' | 'right';
    };
    title?: {
      display: boolean;
      text?: string;
    };
  };
  scales?: any;                        // Chart-specific scales
}
```

### 8. Clipboard History Model

```typescript
interface ClipboardItem {
  id: string;
  type: 'text' | 'image' | 'html';

  // Content
  content: string;                     // Text or data URL
  htmlContent?: string;                // Rich text
  preview: string;                     // Display preview

  // Metadata
  copiedAt: Date;
  source?: string;                     // Which note it came from

  // Organization
  isPinned: boolean;
  label?: string;                      // User label
}
```

### 9. Theme Model

```typescript
interface Theme {
  id: string;
  name: string;
  description?: string;

  // Colors
  colors: ThemeColors;

  // Typography
  fonts: ThemeFonts;

  // Other
  borderRadius: string;
  backgroundPattern?: string;
  backgroundImage?: string;

  // Metadata
  createdAt: Date;
  isCustom: boolean;
  isBuiltIn: boolean;
  author?: string;
}

interface ThemeColors {
  // Base
  primary: string;
  secondary: string;
  accent: string;

  // Background
  background: string;
  surface: string;
  card: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;

  // States
  success: string;
  warning: string;
  error: string;
  info: string;

  // Borders
  border: string;
  divider: string;
}

interface ThemeFonts {
  heading: string;
  body: string;
  mono: string;
}
```

### 10. User Preferences

```typescript
interface UserPreferences {
  // Editor
  defaultFont: string;
  defaultFontSize: number;
  lineHeight: number;
  spellCheck: boolean;
  autoSave: boolean;
  autoSaveInterval: number;            // Milliseconds

  // View
  theme: string;                       // Theme ID
  sidebarWidth: number;
  editorWidth: number;
  showWordCount: boolean;
  showGrid: boolean;
  defaultGridType: GridType;

  // Drawing
  defaultStrokeColor: string;
  defaultStrokeWidth: number;
  defaultFillColor: string;

  // Voice
  voiceLanguage: string;
  voiceAutoPunctuation: boolean;

  // Clipboard
  clipboardHistorySize: number;
  clipboardAutoSave: boolean;

  // Organization
  defaultNotebook: string | null;
  sortNotesBy: SortOption;
  sortDirection: 'asc' | 'desc';

  // Privacy
  enableAnalytics: boolean;
  encryptNotes: boolean;

  // Shortcuts
  customShortcuts: Record<string, string>;
}

type SortOption =
  | 'updatedAt'
  | 'createdAt'
  | 'title'
  | 'manual';

type GridType =
  | 'none'
  | 'square'
  | 'dots'
  | 'lines'
  | 'graph';
```

## Storage Strategies

### 1. Data Size Management

**Limits:**
- Max note size: 10 MB
- Max media per note: 50 MB
- Max total storage: 500 MB (with warnings at 80%)
- Clipboard history: Last 100 items

**Compression:**
- Images compressed to max 1920px width
- Thumbnail generation for images (200px)
- JSON content gzipped if >1KB

### 2. Indexing Strategy

**Full-text search indexes:**
- Note title
- Note plain text content
- Tags
- Notebook names

**Query optimization:**
- Compound indexes for common queries
- Cache frequently accessed notes
- Lazy load media content

### 3. Data Migration

**Version tracking:**
```typescript
interface DatabaseVersion {
  version: number;
  migrations: Migration[];
}

interface Migration {
  from: number;
  to: number;
  migrate: (db: IDBDatabase) => Promise<void>;
}
```

### 4. Backup & Export

**Export formats:**
- JSON (full data backup)
- Markdown (notes only)
- PDF (formatted notes)
- ZIP (notes + media)

**Export structure:**
```json
{
  "version": "1.0",
  "exportDate": "2025-01-15T12:00:00Z",
  "notes": [...],
  "notebooks": [...],
  "tags": [...],
  "media": [...],
  "preferences": {...}
}
```

### 5. Sync Strategy (Future)

**Conflict resolution:**
- Last-write-wins for preferences
- Merge strategies for notes
- User prompt for major conflicts

**Sync metadata:**
```typescript
interface SyncMetadata {
  lastSyncAt: Date;
  syncStatus: 'synced' | 'pending' | 'error';
  conflictCount: number;
  deviceId: string;
}
```

## Performance Considerations

### Caching
- Keep active note in memory
- Cache note list metadata
- Lazy load note content
- Cache search results (5 min TTL)

### Batch Operations
- Bulk insert for imports
- Transaction batching
- Debounced saves

### Cleanup
- Delete old versions (keep last 10)
- Compress old clipboard items
- Archive deleted notes (30 days)
- Auto-delete archived (90 days)

## Data Validation

### Schema Validation
```typescript
const noteSchema = {
  id: (v: any) => typeof v === 'string' && v.length > 0,
  title: (v: any) => typeof v === 'string',
  content: (v: any) => typeof v === 'string',
  createdAt: (v: any) => v instanceof Date,
  tags: (v: any) => Array.isArray(v),
  // ... more validators
};

function validateNote(note: any): note is Note {
  return Object.entries(noteSchema).every(
    ([key, validator]) => validator(note[key])
  );
}
```

### Sanitization
- HTML sanitization for note content
- File type validation for media
- Size limits enforcement
- XSS prevention
