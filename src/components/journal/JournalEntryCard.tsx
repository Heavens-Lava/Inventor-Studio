import { JournalEntry, MOOD_EMOJIS, MOOD_LABELS, CATEGORY_ICONS } from "@/types/journal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Edit,
  Trash2,
  Heart,
  Calendar,
  Tag,
  Lock
} from "lucide-react";
import { format } from "date-fns";

interface JournalEntryCardProps {
  entry: JournalEntry;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onClick?: () => void;
}

export const JournalEntryCard = ({
  entry,
  onEdit,
  onDelete,
  onToggleFavorite,
  onClick
}: JournalEntryCardProps) => {
  const stripHtml = (html: string) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const previewText = stripHtml(entry.content).substring(0, 150);

  return (
    <Card
      className="p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer relative group"
      style={{ backgroundColor: entry.backgroundColor }}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex justify-between items-start gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {entry.mood && (
              <span className="text-2xl" title={MOOD_LABELS[entry.mood]}>
                {MOOD_EMOJIS[entry.mood]}
              </span>
            )}
            <h3 className="font-semibold text-lg truncate">
              {entry.title}
            </h3>
            {entry.isFavorite && (
              <Heart className="h-4 w-4 text-red-500 fill-red-500 flex-shrink-0" />
            )}
            {entry.isPrivate && (
              <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{format(new Date(entry.date), "MMMM d, yyyy")}</span>
            <span className="mx-1">•</span>
            <span>{CATEGORY_ICONS[entry.category]} {entry.category}</span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onEdit(entry);
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(entry.id);
              }}
            >
              <Heart className="h-4 w-4 mr-2" />
              {entry.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete(entry.id);
              }}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content Preview */}
      <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
        {previewText}
        {stripHtml(entry.content).length > 150 && "..."}
      </p>

      {/* Images Preview */}
      {entry.images.length > 0 && (
        <div className="flex gap-2 mb-3 overflow-x-auto">
          {entry.images.slice(0, 3).map((image) => (
            <img
              key={image.id}
              src={image.url}
              alt={image.caption || "Journal image"}
              className="h-16 w-16 object-cover rounded border"
              onClick={(e) => e.stopPropagation()}
            />
          ))}
          {entry.images.length > 3 && (
            <div className="h-16 w-16 bg-muted rounded border flex items-center justify-center text-xs text-muted-foreground">
              +{entry.images.length - 3}
            </div>
          )}
        </div>
      )}

      {/* Stickers Preview */}
      {entry.stickers.length > 0 && (
        <div className="flex gap-1 mb-3">
          {entry.stickers.slice(0, 5).map((sticker) => (
            <span key={sticker.id} className="text-lg">
              {sticker.emoji}
            </span>
          ))}
          {entry.stickers.length > 5 && (
            <span className="text-xs text-muted-foreground">
              +{entry.stickers.length - 5}
            </span>
          )}
        </div>
      )}

      {/* Tags */}
      {entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {entry.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              <Tag className="h-3 w-3 mr-1" />
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </Card>
  );
};
