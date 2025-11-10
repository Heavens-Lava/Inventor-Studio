import { useState, useRef, useEffect } from "react";
import { IdeaCard as IdeaCardType, STATUS_LABELS } from "@/types/ideas";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  MoreVertical,
  Edit,
  Trash2,
  Tag,
  ThumbsUp,
  GripVertical,
  Link2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface IdeaCardProps {
  idea: IdeaCardType;
  onUpdate: (id: string, updates: Partial<IdeaCardType>) => void;
  onDelete: (id: string) => void;
  enableVoting?: boolean;
  draggable?: boolean;
  onConnectionStart?: (cardId: string) => void;
  isConnectionMode?: boolean;
}

type ResizeHandle = "nw" | "ne" | "sw" | "se" | null;

export const IdeaCard = ({
  idea,
  onUpdate,
  onDelete,
  enableVoting,
  draggable,
  onConnectionStart,
  isConnectionMode
}: IdeaCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(idea.title);
  const [editDescription, setEditDescription] = useState(idea.description || "");
  const [editTags, setEditTags] = useState(idea.tags.join(", "));

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const cardRef = useRef<HTMLDivElement>(null);

  const handleSave = () => {
    onUpdate(idea.id, {
      title: editTitle,
      description: editDescription,
      tags: editTags.split(",").map(t => t.trim()).filter(Boolean)
    });
    setIsEditing(false);
  };

  const handleVote = () => {
    onUpdate(idea.id, { votes: (idea.votes || 0) + 1 });
  };

  // Dragging handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!draggable || isResizing || e.button !== 0) return;

    // Don't drag if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('[role="button"]') ||
      target.closest('input') ||
      target.closest('textarea') ||
      target.closest('select')
    ) {
      return;
    }

    // Prevent default and stop propagation to avoid triggering canvas click
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);
    setDragStart({
      x: e.clientX - (idea.position?.x || 0),
      y: e.clientY - (idea.position?.y || 0)
    });
  };

  // Resizing handlers
  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement>, handle: ResizeHandle) => {
    if (!draggable) return;

    e.preventDefault();
    e.stopPropagation();

    setIsResizing(true);
    setResizeHandle(handle);

    const currentWidth = idea.size?.width || 250;
    const currentHeight = idea.size?.height || 200;

    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: currentWidth,
      height: currentHeight
    });
  };

  // Mouse event listeners
  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e: MouseEvent) => {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      onUpdate(idea.id, {
        position: { x: newX, y: newY }
      });
    };

    const handleUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [isDragging, dragStart.x, dragStart.y, idea.id, onUpdate]);

  useEffect(() => {
    if (!isResizing || !resizeHandle) return;

    const handleMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;

      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;
      let newX = idea.position?.x || 0;
      let newY = idea.position?.y || 0;

      switch (resizeHandle) {
        case "se":
          newWidth = Math.max(200, resizeStart.width + deltaX);
          newHeight = Math.max(150, resizeStart.height + deltaY);
          break;
        case "sw":
          newWidth = Math.max(200, resizeStart.width - deltaX);
          newHeight = Math.max(150, resizeStart.height + deltaY);
          newX = (idea.position?.x || 0) + deltaX;
          break;
        case "ne":
          newWidth = Math.max(200, resizeStart.width + deltaX);
          newHeight = Math.max(150, resizeStart.height - deltaY);
          newY = (idea.position?.y || 0) + deltaY;
          break;
        case "nw":
          newWidth = Math.max(200, resizeStart.width - deltaX);
          newHeight = Math.max(150, resizeStart.height - deltaY);
          newX = (idea.position?.x || 0) + deltaX;
          newY = (idea.position?.y || 0) + deltaY;
          break;
      }

      onUpdate(idea.id, {
        size: { width: newWidth, height: newHeight },
        position: { x: newX, y: newY }
      });
    };

    const handleUp = () => {
      setIsResizing(false);
      setResizeHandle(null);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [isResizing, resizeHandle, resizeStart, idea.id, idea.position, onUpdate]);

  const cardStyle: React.CSSProperties = {
    backgroundColor: idea.color,
    ...(draggable && idea.position ? {
      position: 'absolute',
      left: `${idea.position.x}px`,
      top: `${idea.position.y}px`,
      width: `${idea.size?.width || 250}px`,
      height: `${idea.size?.height || 200}px`
    } : {})
  };

  return (
    <>
      <Card
        ref={cardRef}
        data-card="true"
        className={cn(
          "p-4 transition-shadow duration-200 hover:shadow-md relative group overflow-auto",
          draggable && !isDragging && "cursor-grab",
          isDragging && "cursor-grabbing shadow-2xl",
          isResizing && "cursor-nwse-resize"
        )}
        style={{
          ...cardStyle,
          zIndex: isDragging ? 1000 : draggable ? 10 : 1
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Drag Handle */}
        {draggable && (
          <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
        )}

        {/* Resize Handles */}
        {draggable && (
          <>
            {/* Top-left */}
            <div
              className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize opacity-0 group-hover:opacity-100 hover:bg-primary/20 rounded-tl"
              onMouseDown={(e) => handleResizeStart(e, "nw")}
            />
            {/* Top-right */}
            <div
              className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize opacity-0 group-hover:opacity-100 hover:bg-primary/20 rounded-tr"
              onMouseDown={(e) => handleResizeStart(e, "ne")}
            />
            {/* Bottom-left */}
            <div
              className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize opacity-0 group-hover:opacity-100 hover:bg-primary/20 rounded-bl"
              onMouseDown={(e) => handleResizeStart(e, "sw")}
            />
            {/* Bottom-right */}
            <div
              className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize opacity-0 group-hover:opacity-100 hover:bg-primary/20 rounded-br"
              onMouseDown={(e) => handleResizeStart(e, "se")}
            />
          </>
        )}

        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="font-semibold text-base flex-1 break-words">
            {idea.title}
          </h3>
          <div className="flex gap-1">
            {/* Connection Button */}
            {draggable && onConnectionStart && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onConnectionStart(idea.id);
                }}
                title="Create connection"
              >
                <Link2 className="h-4 w-4" />
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(idea.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {idea.description && (
          <p className="text-sm text-muted-foreground mb-3 break-words overflow-auto">
            {idea.description}
          </p>
        )}

        <div className="flex flex-wrap gap-1.5 mb-2">
          {idea.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              <Tag className="h-3 w-3 mr-1" />
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between mt-3 pt-2 border-t">
          <Badge variant="outline" className="text-xs">
            {STATUS_LABELS[idea.status]}
          </Badge>

          {enableVoting && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleVote}
              className="h-7 text-xs"
            >
              <ThumbsUp className="h-3 w-3 mr-1" />
              {idea.votes || 0}
            </Button>
          )}
        </div>
      </Card>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Idea</DialogTitle>
            <DialogDescription>
              Make changes to your idea
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Idea title"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Describe your idea..."
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                placeholder="tag1, tag2, tag3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
