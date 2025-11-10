import { useState, useEffect } from "react";
import { JournalEntry, MoodType, JournalCategory, MOOD_EMOJIS, MOOD_LABELS, CATEGORY_LABELS, CATEGORY_ICONS, BACKGROUND_TEMPLATES, STICKER_OPTIONS } from "@/types/journal";
import { RichTextEditor } from "./RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Tag, Palette, Smile, Lock, X } from "lucide-react";
import { generateId } from "@/lib/utils-todo";
import { toast } from "sonner";

interface JournalEntryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (entry: JournalEntry) => void;
  entry?: JournalEntry | null;
  defaultDate?: Date;
}

export const JournalEntryForm = ({
  open,
  onOpenChange,
  onSave,
  entry,
  defaultDate = new Date()
}: JournalEntryFormProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [mood, setMood] = useState<MoodType | undefined>();
  const [category, setCategory] = useState<JournalCategory>("personal");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedStickers, setSelectedStickers] = useState<string[]>([]);

  // Initialize form with entry data if editing - only when dialog opens
  useEffect(() => {
    if (open) {
      if (entry) {
        setTitle(entry.title);
        setContent(entry.content);
        setDate(new Date(entry.date));
        setMood(entry.mood);
        setCategory(entry.category);
        setTags(entry.tags);
        setBackgroundColor(entry.backgroundColor || "#ffffff");
        setIsPrivate(entry.isPrivate);
        setSelectedStickers(entry.stickers.map(s => s.emoji));
      } else {
        // Reset form for new entry
        setTitle("");
        setContent("");
        setDate(new Date());
        setMood(undefined);
        setCategory("personal");
        setTags([]);
        setBackgroundColor("#ffffff");
        setIsPrivate(false);
        setSelectedStickers([]);
      }
    }
  }, [open, entry]);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleToggleSticker = (sticker: string) => {
    if (selectedStickers.includes(sticker)) {
      setSelectedStickers(selectedStickers.filter(s => s !== sticker));
    } else {
      setSelectedStickers([...selectedStickers, sticker]);
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    const journalEntry: JournalEntry = {
      id: entry?.id || generateId(),
      title: title.trim(),
      content,
      date,
      mood,
      category,
      tags,
      stickers: selectedStickers.map((emoji, index) => ({
        id: generateId(),
        emoji,
        x: 0,
        y: 0
      })),
      images: entry?.images || [],
      backgroundColor,
      isFavorite: entry?.isFavorite || false,
      isPrivate,
      createdAt: entry?.createdAt || new Date(),
      updatedAt: new Date()
    };

    onSave(journalEntry);
    onOpenChange(false);
    toast.success(entry ? "Entry updated!" : "Entry created!");
  };

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{entry ? "Edit Entry" : "New Journal Entry"}</DialogTitle>
          <DialogDescription>
            {entry ? "Update your journal entry" : "Capture your thoughts and memories"}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="mood">Mood</TabsTrigger>
            <TabsTrigger value="decoration">Decoration</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's on your mind?"
              />
            </div>

            <div>
              <Label htmlFor="date">Date</Label>
              <div className="relative">
                <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="date"
                  type="date"
                  value={formatDateForInput(date)}
                  onChange={(e) => setDate(new Date(e.target.value))}
                  className="pl-8"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="content">Content</Label>
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Start writing your thoughts..."
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={(value) => setCategory(value as JournalCategory)}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {CATEGORY_ICONS[key as JournalCategory]} {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  id="tags"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Add a tag..."
                />
                <Button type="button" onClick={handleAddTag}>
                  <Tag className="h-4 w-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Mood Tab */}
          <TabsContent value="mood" className="space-y-4">
            <div>
              <Label>How are you feeling?</Label>
              <div className="grid grid-cols-5 gap-3 mt-2">
                {Object.entries(MOOD_EMOJIS).map(([moodKey, emoji]) => (
                  <button
                    key={moodKey}
                    type="button"
                    onClick={() => setMood(moodKey === mood ? undefined : moodKey as MoodType)}
                    className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                      mood === moodKey
                        ? "border-primary bg-primary/10 shadow-md"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-4xl mb-1">{emoji}</div>
                    <div className="text-xs font-medium">
                      {MOOD_LABELS[moodKey as MoodType]}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Decoration Tab */}
          <TabsContent value="decoration" className="space-y-4">
            <div>
              <Label>Background Color</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {BACKGROUND_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => setBackgroundColor(template.color)}
                    className={`h-12 rounded border-2 hover:scale-105 transition-transform ${
                      backgroundColor === template.color
                        ? "border-primary ring-2 ring-primary"
                        : "border-gray-300"
                    }`}
                    style={{ backgroundColor: template.color }}
                    title={template.name}
                  >
                    <span className="sr-only">{template.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Stickers</Label>
              <div className="grid grid-cols-8 gap-2 mt-2">
                {STICKER_OPTIONS.map((sticker) => (
                  <button
                    key={sticker}
                    type="button"
                    onClick={() => handleToggleSticker(sticker)}
                    className={`p-2 text-2xl rounded border-2 hover:scale-110 transition-all ${
                      selectedStickers.includes(sticker)
                        ? "border-primary bg-primary/10"
                        : "border-gray-200"
                    }`}
                  >
                    {sticker}
                  </button>
                ))}
              </div>
              {selectedStickers.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground">
                    Selected: {selectedStickers.join(" ")}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Private Entry</p>
                  <p className="text-sm text-muted-foreground">
                    Only you can see this entry
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant={isPrivate ? "default" : "outline"}
                onClick={() => setIsPrivate(!isPrivate)}
              >
                {isPrivate ? "Private" : "Public"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {entry ? "Update Entry" : "Create Entry"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
