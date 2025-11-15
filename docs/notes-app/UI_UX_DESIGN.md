# UI/UX Design Specifications

## Design Principles

1. **Simplicity First** - Clean, uncluttered interface
2. **Progressive Disclosure** - Advanced features available but not overwhelming
3. **Context-Aware** - Tools appear when needed
4. **Consistency** - Familiar patterns across the app
5. **Accessibility** - Usable by everyone

## Layout Structure

### Main Layout
```
┌─────────────────────────────────────────────────────────────────┐
│  Header: App Title + Search + User Menu                         │
├──────────┬──────────────────────────────────────────────────────┤
│          │  Editor Toolbar: Text | Draw | Voice | Media | More  │
│  Sidebar ├──────────────────────────────────────────────────────┤
│          │                                                       │
│  Notes   │                                                       │
│  List    │           Main Editor / Canvas Area                  │
│          │                                                       │
│  + New   │                                                       │
│          │                                                       │
│  Folders ├──────────────────────────────────────────────────────┤
│  Tags    │  Status Bar: Word Count | Auto-save | Grid Toggle    │
└──────────┴──────────────────────────────────────────────────────┘
```

## Color Scheme

### Light Theme (Default)
- **Primary**: Blue (#3B82F6)
- **Background**: White (#FFFFFF)
- **Surface**: Light Gray (#F9FAFB)
- **Text Primary**: Dark Gray (#111827)
- **Text Secondary**: Medium Gray (#6B7280)
- **Border**: Light Border (#E5E7EB)
- **Accent**: Purple (#8B5CF6)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)

### Dark Theme
- **Primary**: Blue (#60A5FA)
- **Background**: Dark (#111827)
- **Surface**: Dark Gray (#1F2937)
- **Text Primary**: White (#F9FAFB)
- **Text Secondary**: Light Gray (#9CA3AF)
- **Border**: Dark Border (#374151)
- **Accent**: Purple (#A78BFA)
- **Success**: Green (#34D399)
- **Warning**: Yellow (#FBBF24)
- **Error**: Red (#F87171)

## Typography

### Font Families
- **Headings**: Inter, system-ui
- **Body Text**: Inter, system-ui
- **Monospace**: 'Fira Code', monospace

### Type Scale
- **H1**: 2.5rem (40px) - Bold
- **H2**: 2rem (32px) - Bold
- **H3**: 1.75rem (28px) - Semibold
- **H4**: 1.5rem (24px) - Semibold
- **H5**: 1.25rem (20px) - Semibold
- **H6**: 1.125rem (18px) - Semibold
- **Body**: 1rem (16px) - Regular
- **Small**: 0.875rem (14px) - Regular
- **Tiny**: 0.75rem (12px) - Regular

## Component Specifications

### 1. Notes Sidebar

**Layout:**
- Fixed width: 280px (expandable to 320px)
- Collapsible with toggle button
- Scrollable list with virtualization

**Elements:**
- Search bar at top
- "New Note" button (prominent)
- Filter/Sort dropdown
- Note cards with:
  - Title (truncated)
  - Preview text (2 lines max)
  - Timestamp
  - Tags (max 3 visible)
  - Thumbnail icon (if image present)

**Interactions:**
- Click to open note
- Right-click for context menu
- Drag to reorder (within folder)
- Hover shows full title tooltip

### 2. Main Toolbar

**Layout:**
- Horizontal bar below header
- Grouped tool buttons
- Overflow menu for less-used tools

**Tool Groups:**
1. **Text Tools**
   - Bold, Italic, Underline
   - Heading levels
   - Lists
   - Alignment

2. **Insert Tools**
   - Image
   - Drawing
   - Chart
   - Table
   - Link
   - Sticker

3. **Format Tools**
   - Font family
   - Font size
   - Text color
   - Highlight

4. **Special Tools**
   - Voice input
   - Grid toggle
   - Template
   - Theme

5. **Actions**
   - Export
   - Share
   - Print
   - More options

### 3. Editor Canvas

**Layout:**
- Full width with max-width: 900px (centered)
- Padding: 2rem on desktop, 1rem on mobile
- Background matches theme

**Features:**
- Click-to-edit title
- Auto-growing content area
- Floating toolbar on text selection
- Inline image placement
- Drawing overlay mode
- Grid background (toggleable)

**Visual Feedback:**
- Cursor indicates edit mode
- Selection highlights
- Auto-save indicator
- Unsaved changes warning

### 4. Drawing Tools Panel

**Layout:**
- Floating panel (right side)
- Collapsible sections
- Draggable position

**Sections:**
1. **Tools**
   - Pen
   - Pencil
   - Eraser
   - Shapes
   - Text
   - Select

2. **Properties**
   - Color picker
   - Stroke width slider
   - Opacity slider
   - Fill toggle

3. **Layers**
   - Layer list
   - Visibility toggles
   - Reorder layers
   - Lock layers

**Interactions:**
- Click tool to activate
- Double-click for quick settings
- Keyboard shortcuts displayed on hover

### 5. Voice Input Interface

**Layout:**
- Modal overlay or bottom sheet
- Large microphone button (center)
- Real-time transcript display

**Elements:**
- Microphone button (pulsing when active)
- Language selector
- Transcript text area
- Control buttons:
  - Pause/Resume
  - Clear
  - Insert to note
  - Cancel

**Visual Feedback:**
- Wave animation during recording
- Text appears as spoken
- Confidence indicators
- Error messages

### 6. Clipboard Manager

**Layout:**
- Slide-out panel (right side)
- OR modal dialog
- List of clipboard items

**Elements:**
- Search clipboard history
- Filter by type (text/image)
- Pin/unpin items
- Delete items
- Quick paste button

**Item Display:**
- Icon indicating type
- Preview (text truncated, image thumbnail)
- Timestamp
- Paste button

### 7. Template Browser

**Layout:**
- Modal dialog
- Grid layout for templates
- Category sidebar

**Elements:**
- Category filters
- Search bar
- Template cards with:
  - Preview thumbnail
  - Template name
  - Description
  - Use button

**Categories:**
- All Templates
- Recent
- Favorites
- Work
- Personal
- Creative
- Custom

### 8. Theme Selector

**Layout:**
- Modal dialog or settings panel
- Theme preview cards
- Custom theme editor

**Elements:**
- Pre-built themes (grid)
- Dark/Light mode toggle
- Custom theme builder:
  - Color pickers
  - Font selectors
  - Background options
  - Preview pane

### 9. Sticker Picker

**Layout:**
- Popover or modal
- Tabbed interface for categories
- Grid display

**Categories:**
- Emoji
- Seasonal
- Educational
- Decorative
- Custom

**Interactions:**
- Click to insert
- Drag to canvas
- Resize handles on canvas
- Rotation control

## Responsive Design

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Mobile Adaptations
- Collapsible sidebar (drawer)
- Bottom toolbar (FAB style)
- Full-screen editor
- Simplified toolbars
- Touch-optimized controls
- Swipe gestures

### Tablet Adaptations
- Optional sidebar visibility
- Condensed toolbars
- Split view option
- Touch + keyboard support

## Animation & Transitions

### Micro-interactions
- Button hover: scale(1.05)
- Panel slide: 300ms ease-out
- Fade in/out: 200ms
- Tool activation: pulse effect
- Success actions: checkmark animation

### Loading States
- Skeleton screens for notes list
- Progress indicators for exports
- Spinner for async operations

## Accessibility Features

### Keyboard Navigation
- Tab through all interactive elements
- Escape to close modals/panels
- Arrow keys for tool selection
- Ctrl+shortcuts for common actions

### Screen Reader Support
- Semantic HTML
- ARIA labels on all controls
- Announced state changes
- Descriptive alt text

### Visual Accessibility
- High contrast mode
- Adjustable font sizes
- Focus indicators
- Color-blind friendly palette
- Reduced motion option

## Iconography

### Icon Style
- Lucide React icons (consistent with app)
- 20px default size
- Stroke-based (not filled)
- 1.5px stroke width

### Common Icons
- **New Note**: Plus in document
- **Delete**: Trash can
- **Edit**: Pencil
- **Draw**: Brush
- **Voice**: Microphone
- **Image**: Picture
- **Chart**: Bar chart
- **Template**: Layers
- **Theme**: Palette
- **Settings**: Gear
- **Export**: Download
- **Search**: Magnifying glass

## Feedback & Notifications

### Toast Notifications
- **Position**: Top-right
- **Duration**: 3-5 seconds
- **Types**:
  - Success (green)
  - Error (red)
  - Warning (yellow)
  - Info (blue)

### In-app Messages
- Auto-save status (unobtrusive)
- Character/word count (status bar)
- Keyboard shortcuts (tooltips)
- Feature tips (dismissible)

## Empty States

### No Notes
- Large icon
- Friendly message
- "Create Your First Note" button
- Quick start guide link

### No Search Results
- Search icon
- "No results found" message
- Search suggestions
- Clear search button

### No Templates
- Templates icon
- "Create Custom Template" button
- Browse default templates link

## Loading States

### Initial Load
- App logo with spinner
- Progress indicator
- Estimated load time

### Content Load
- Skeleton screens
- Progressive loading
- Smooth transitions

## Error States

### Network Error
- Clear error message
- Retry button
- Offline mode indication

### Storage Error
- Error explanation
- Storage usage info
- Clear cache option

### Feature Unavailable
- Browser compatibility message
- Alternative suggestions
- Graceful degradation
