# Technical Architecture

## Technology Stack

### Frontend Framework
- **React 18+** with TypeScript
- **Vite** for build tooling
- **React Router** for navigation

### UI Libraries
- **shadcn/ui** - Component library (already integrated)
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Radix UI** - Headless UI primitives

### Advanced Features Libraries
- **Drawing Tools:**
  - `fabric.js` or `konva` - Canvas manipulation and drawing
  - `react-sketch-canvas` - Alternative lightweight option

- **Rich Text Editor:**
  - `@tiptap/react` - Extensible rich text editor
  - `prosemirror` - Core editor framework (used by Tiptap)

- **Voice Recognition:**
  - Web Speech API (native browser)
  - Fallback: `react-speech-recognition`

- **Charts/Graphs:**
  - `recharts` - React chart library
  - `chart.js` with `react-chartjs-2` - Alternative option

- **Image Handling:**
  - `react-image-crop` - Image cropping
  - `browser-image-compression` - Client-side compression

- **File Operations:**
  - `file-saver` - Download/export files
  - `mammoth` - DOCX export
  - `jspdf` - PDF generation

### State Management
- **Zustand** - Lightweight state management
- **React Context** - For theme and preferences
- **Local state** - Component-level state with hooks

### Storage
- **IndexedDB** - Primary storage for notes and media
  - Using `idb` wrapper for promises
- **localStorage** - Settings and preferences
- **sessionStorage** - Temporary clipboard data

## Component Architecture

### Core Structure
```
src/
├── components/
│   ├── notes/
│   │   ├── NotesApp.tsx              # Main notes container
│   │   ├── NoteEditor.tsx            # Note editing interface
│   │   ├── NotesList.tsx             # Notes sidebar/list
│   │   ├── NotesToolbar.tsx          # Main toolbar
│   │   └── NotePreview.tsx           # Note preview card
│   │
│   ├── editor/
│   │   ├── TextEditor.tsx            # Rich text editor
│   │   ├── EditorToolbar.tsx         # Text formatting toolbar
│   │   ├── EditorMenuBar.tsx         # Menu options
│   │   └── EditorBubbleMenu.tsx      # Contextual formatting
│   │
│   ├── drawing/
│   │   ├── DrawingCanvas.tsx         # Main canvas component
│   │   ├── DrawingToolbar.tsx        # Drawing tools
│   │   ├── ColorPicker.tsx           # Color selection
│   │   ├── ShapeTool.tsx             # Shape drawing
│   │   └── LayerPanel.tsx            # Layer management
│   │
│   ├── grid/
│   │   ├── GridOverlay.tsx           # Grid display
│   │   ├── GridSettings.tsx          # Grid configuration
│   │   └── GridTypes.tsx             # Grid pattern presets
│   │
│   ├── voice/
│   │   ├── VoiceRecorder.tsx         # Voice input interface
│   │   ├── VoiceControls.tsx         # Recording controls
│   │   ├── TranscriptDisplay.tsx     # Real-time transcript
│   │   └── LanguageSelector.tsx      # Language options
│   │
│   ├── clipboard/
│   │   ├── ClipboardManager.tsx      # Clipboard UI
│   │   ├── ClipboardHistory.tsx      # History viewer
│   │   └── ClipboardItem.tsx         # Individual item
│   │
│   ├── media/
│   │   ├── ImageUploader.tsx         # Image upload
│   │   ├── ImageGallery.tsx          # Image gallery
│   │   ├── ImageEditor.tsx           # Image editing
│   │   └── MediaLibrary.tsx          # All media assets
│   │
│   ├── templates/
│   │   ├── TemplateBrowser.tsx       # Template selection
│   │   ├── TemplatePreview.tsx       # Template preview
│   │   ├── TemplateEditor.tsx        # Custom template creator
│   │   └── TemplateCategories.tsx    # Template organization
│   │
│   ├── charts/
│   │   ├── ChartBuilder.tsx          # Chart creation
│   │   ├── ChartEditor.tsx           # Chart customization
│   │   ├── DataTableEditor.tsx       # Data input
│   │   └── ChartTypes.tsx            # Chart type selection
│   │
│   ├── themes/
│   │   ├── ThemeSelector.tsx         # Theme picker
│   │   ├── ThemeEditor.tsx           # Custom theme builder
│   │   ├── ThemePreview.tsx          # Theme preview
│   │   └── ThemeProvider.tsx         # Theme context
│   │
│   ├── stickers/
│   │   ├── StickerPicker.tsx         # Sticker selection
│   │   ├── StickerLibrary.tsx        # Sticker browser
│   │   ├── StickerEditor.tsx         # Custom sticker creator
│   │   └── StickerCanvas.tsx         # Sticker placement
│   │
│   └── organization/
│       ├── NotebookManager.tsx       # Folder/notebook mgmt
│       ├── TagManager.tsx            # Tag system
│       ├── SearchPanel.tsx           # Search interface
│       └── FilterOptions.tsx         # Filtering UI
│
├── hooks/
│   ├── useNotesStorage.ts            # Notes CRUD operations
│   ├── useDrawing.ts                 # Drawing state
│   ├── useVoiceRecognition.ts        # Voice input
│   ├── useClipboard.ts               # Clipboard management
│   ├── useTheme.ts                   # Theme management
│   ├── useMediaUpload.ts             # Image/media handling
│   ├── useExport.ts                  # Export functionality
│   └── useAutoSave.ts                # Auto-save logic
│
├── store/
│   ├── notesStore.ts                 # Zustand store for notes
│   ├── editorStore.ts                # Editor state
│   ├── uiStore.ts                    # UI preferences
│   └── clipboardStore.ts             # Clipboard state
│
├── types/
│   ├── note.ts                       # Note data types
│   ├── drawing.ts                    # Drawing types
│   ├── chart.ts                      # Chart types
│   ├── template.ts                   # Template types
│   └── theme.ts                      # Theme types
│
├── utils/
│   ├── indexedDB.ts                  # IndexedDB wrapper
│   ├── export.ts                     # Export utilities
│   ├── import.ts                     # Import utilities
│   ├── imageProcessing.ts            # Image optimization
│   ├── speechRecognition.ts          # Voice utilities
│   └── shortcuts.ts                  # Keyboard shortcuts
│
└── pages/
    ├── Notes.tsx                     # Main notes page
    └── NoteView.tsx                  # Full-screen note view
```

## Data Flow

### Note Creation Flow
```
User Action → Component Event → Store Update → IndexedDB Save → UI Update
```

### Auto-Save Flow
```
User Edit → Debounced Hook → Validate Changes → IndexedDB Update → Success Toast
```

### Drawing Flow
```
Canvas Interaction → Fabric.js Event → Drawing Hook → Canvas State → Export Data
```

### Voice Input Flow
```
Mic Button → Web Speech API → Real-time Transcript → Text Editor Insert → Save
```

## State Management Strategy

### Global State (Zustand)
- Active note ID
- Notes list metadata
- User preferences
- UI state (sidebar open/closed, active view)

### Local State (Component)
- Form inputs
- Temporary UI states
- Dialog open/closed
- Loading states

### Persistent State (IndexedDB)
- Full note content
- Drawing data
- Images/media
- Templates
- Clipboard history

## Performance Optimizations

### Code Splitting
- Lazy load heavy components (Drawing, Charts)
- Dynamic imports for features
- Route-based splitting

### Rendering Optimizations
- React.memo for expensive components
- useMemo/useCallback for complex computations
- Virtual scrolling for long lists
- Debounced auto-save

### Storage Optimizations
- Image compression before storage
- Lazy load note content
- Index strategy for fast queries
- Periodic cleanup of deleted items

## Security Considerations

### Data Protection
- Client-side encryption option
- Sanitize user input (prevent XSS)
- Secure export formats
- No sensitive data in localStorage

### Privacy
- Local-first architecture
- No analytics without consent
- Clear data ownership
- Export all data capability

## Browser API Usage

### Required APIs
- Canvas API (drawing)
- Web Speech API (voice)
- Clipboard API (clipboard management)
- File API (image upload)
- IndexedDB (storage)
- Web Workers (background processing)

### Progressive Enhancement
- Fallbacks for unsupported browsers
- Feature detection
- Graceful degradation
- Clear error messages
