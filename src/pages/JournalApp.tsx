import { useState, useMemo } from "react";
import AppLayout from "@/components/AppLayout";
import { useJournalStorage } from "@/hooks/useJournalStorage";
import { JournalEntry } from "@/types/journal";
import { JournalEntryCard } from "@/components/journal/JournalEntryCard";
import { JournalEntryForm } from "@/components/journal/JournalEntryForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  Calendar,
  Grid3x3,
  List,
  Heart,
  BookOpen
} from "lucide-react";
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";

const JournalApp = () => {
  const {
    entries,
    isLoaded,
    addEntry,
    updateEntry,
    deleteEntry,
    toggleFavorite,
    getAllTags
  } = useJournalStorage();

  const [showEntryForm, setShowEntryForm] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [viewEntry, setViewEntry] = useState<JournalEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterMood, setFilterMood] = useState<string>("all");
  const [filterTag, setFilterTag] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list" | "calendar">("grid");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Filter entries
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesSearch =
        entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = filterCategory === "all" || entry.category === filterCategory;
      const matchesMood = filterMood === "all" || entry.mood === filterMood;
      const matchesTag = filterTag === "all" || entry.tags.includes(filterTag);
      const matchesFavorite = !showFavoritesOnly || entry.isFavorite;

      return matchesSearch && matchesCategory && matchesMood && matchesTag && matchesFavorite;
    });
  }, [entries, searchQuery, filterCategory, filterMood, filterTag, showFavoritesOnly]);

  const handleNewEntry = () => {
    setSelectedEntry(null);
    setShowEntryForm(true);
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setShowEntryForm(true);
  };

  const handleSaveEntry = (entry: JournalEntry) => {
    if (selectedEntry) {
      updateEntry(entry.id, entry);
    } else {
      addEntry(entry);
    }
  };

  const handleDeleteEntry = (id: string) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      deleteEntry(id);
      toast.success("Entry deleted");
    }
  };

  const handleViewEntry = (entry: JournalEntry) => {
    setViewEntry(entry);
  };

  // Get entries for calendar view
  const currentMonth = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const daysInMonth = eachDayOfInterval({ start: currentMonth, end: monthEnd });

  const getEntriesForDay = (day: Date) => {
    return entries.filter(entry => isSameDay(new Date(entry.date), day));
  };

  if (!isLoaded) {
    return (
      <AppLayout title="Daily Haven Suite">
        <p className="text-muted-foreground">Loading...</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Daily Haven Suite" containerClassName="max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-2">
              <BookOpen className="h-8 w-8" />
              Daily Journal
            </h1>
            <p className="text-sm text-muted-foreground">
              Capture your thoughts, memories, and reflections
            </p>
          </div>
          <Button onClick={handleNewEntry} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            New Entry
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-2xl font-bold">{entries.length}</div>
            <div className="text-sm text-muted-foreground">Total Entries</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold">
              {entries.filter(e => isSameDay(new Date(e.date), new Date())).length}
            </div>
            <div className="text-sm text-muted-foreground">Today</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold">
              {entries.filter(e => e.isFavorite).length}
            </div>
            <div className="text-sm text-muted-foreground">Favorites</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold">{getAllTags().length}</div>
            <div className="text-sm text-muted-foreground">Tags</div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col gap-4">
            {/* Search and View Toggle */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search entries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={showFavoritesOnly ? "default" : "outline"}
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  title="Show Favorites"
                >
                  <Heart className={`h-4 w-4 ${showFavoritesOnly ? "fill-current" : ""}`} />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  title="Grid View"
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  title="List View"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "calendar" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("calendar")}
                  title="Calendar View"
                >
                  <Calendar className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="filter-category" className="text-xs mb-1.5 block">
                  Category
                </Label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger id="filter-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="travel">Travel</SelectItem>
                    <SelectItem value="gratitude">Gratitude</SelectItem>
                    <SelectItem value="goals">Goals</SelectItem>
                    <SelectItem value="dreams">Dreams</SelectItem>
                    <SelectItem value="memories">Memories</SelectItem>
                    <SelectItem value="thoughts">Thoughts</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="filter-mood" className="text-xs mb-1.5 block">
                  Mood
                </Label>
                <Select value={filterMood} onValueChange={setFilterMood}>
                  <SelectTrigger id="filter-mood">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Moods</SelectItem>
                    <SelectItem value="amazing">Amazing</SelectItem>
                    <SelectItem value="happy">Happy</SelectItem>
                    <SelectItem value="okay">Okay</SelectItem>
                    <SelectItem value="sad">Sad</SelectItem>
                    <SelectItem value="anxious">Anxious</SelectItem>
                    <SelectItem value="stressed">Stressed</SelectItem>
                    <SelectItem value="excited">Excited</SelectItem>
                    <SelectItem value="calm">Calm</SelectItem>
                    <SelectItem value="grateful">Grateful</SelectItem>
                    <SelectItem value="tired">Tired</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="filter-tag" className="text-xs mb-1.5 block">
                  Tag
                </Label>
                <Select value={filterTag} onValueChange={setFilterTag}>
                  <SelectTrigger id="filter-tag">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tags</SelectItem>
                    {getAllTags().map(tag => (
                      <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* Entries Display */}
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="text-lg font-semibold mb-2">
              {entries.length === 0 ? "No entries yet" : "No entries match your filters"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {entries.length === 0
                ? "Start documenting your thoughts and memories"
                : "Try adjusting your search or filters"}
            </p>
            {entries.length === 0 && (
              <Button onClick={handleNewEntry}>
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Entry
              </Button>
            )}
          </div>
        ) : viewMode === "calendar" ? (
          /* Calendar View */
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {format(selectedDate, "MMMM yyyy")}
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedDate(new Date())}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                <div key={day} className="text-center font-semibold text-sm p-2">
                  {day}
                </div>
              ))}
              {daysInMonth.map(day => {
                const dayEntries = getEntriesForDay(day);
                return (
                  <Card
                    key={day.toISOString()}
                    className={`p-2 min-h-[100px] ${
                      isSameDay(day, new Date()) ? "border-primary" : ""
                    }`}
                  >
                    <div className="text-sm font-semibold mb-1">
                      {format(day, "d")}
                    </div>
                    {dayEntries.map(entry => (
                      <div
                        key={entry.id}
                        className="text-xs p-1 mb-1 bg-primary/10 rounded cursor-pointer hover:bg-primary/20"
                        onClick={() => handleViewEntry(entry)}
                      >
                        {entry.mood && <span className="mr-1">{entry.mood}</span>}
                        {entry.title.substring(0, 15)}...
                      </div>
                    ))}
                  </Card>
                );
              })}
            </div>
          </div>
        ) : (
          /* Grid/List View */
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                : "flex flex-col gap-4"
            }
          >
            {filteredEntries.map((entry) => (
              <JournalEntryCard
                key={entry.id}
                entry={entry}
                onEdit={handleEditEntry}
                onDelete={handleDeleteEntry}
                onToggleFavorite={toggleFavorite}
                onClick={() => handleViewEntry(entry)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Entry Form Dialog */}
      <JournalEntryForm
        open={showEntryForm}
        onOpenChange={setShowEntryForm}
        onSave={handleSaveEntry}
        entry={selectedEntry}
      />

      {/* View Entry Dialog */}
      <Dialog open={!!viewEntry} onOpenChange={() => setViewEntry(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {viewEntry?.mood && (
                <span className="text-2xl">{viewEntry.mood}</span>
              )}
              {viewEntry?.title}
              {viewEntry?.isFavorite && (
                <Heart className="h-4 w-4 text-red-500 fill-red-500" />
              )}
            </DialogTitle>
            <div className="text-sm text-muted-foreground">
              {viewEntry && format(new Date(viewEntry.date), "MMMM d, yyyy")}
            </div>
          </DialogHeader>
          {viewEntry && (
            <div
              className="prose prose-sm max-w-none p-6 rounded-lg"
              style={{ backgroundColor: viewEntry.backgroundColor }}
            >
              <div dangerouslySetInnerHTML={{ __html: viewEntry.content }} />

              {viewEntry.stickers.length > 0 && (
                <div className="flex gap-2 mt-4">
                  {viewEntry.stickers.map(sticker => (
                    <span key={sticker.id} className="text-2xl">
                      {sticker.emoji}
                    </span>
                  ))}
                </div>
              )}

              {viewEntry.images.length > 0 && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {viewEntry.images.map(image => (
                    <div key={image.id}>
                      <img
                        src={image.url}
                        alt={image.caption || "Journal image"}
                        className="w-full rounded"
                      />
                      {image.caption && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {image.caption}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {viewEntry.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {viewEntry.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default JournalApp;
