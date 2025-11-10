import { useState } from "react";
import { IdeaCard, IdeaStatus, IDEA_COLORS } from "@/types/ideas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { generateId } from "@/lib/utils-todo";

interface AddIdeaFormProps {
  onAdd: (idea: IdeaCard) => void;
  defaultColor?: string;
}

export const AddIdeaForm = ({ onAdd, defaultColor }: AddIdeaFormProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [color, setColor] = useState(defaultColor || IDEA_COLORS[0]);
  const [status, setStatus] = useState<IdeaStatus>("draft");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      return;
    }

    const newIdea: IdeaCard = {
      id: generateId(),
      title: title.trim(),
      description: description.trim() || undefined,
      color,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      status,
      createdAt: new Date(),
      updatedAt: new Date(),
      votes: 0
    };

    onAdd(newIdea);
    handleReset();
    setOpen(false);
  };

  const handleReset = () => {
    setTitle("");
    setDescription("");
    setTags("");
    setColor(defaultColor || IDEA_COLORS[0]);
    setStatus("draft");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Idea
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Idea</DialogTitle>
          <DialogDescription>
            Capture your creative thought or concept
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your idea a catchy title"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your idea in detail..."
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="innovation, feature, design"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as IdeaStatus)}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="color">Card Color</Label>
              <Select value={color} onValueChange={setColor}>
                <SelectTrigger id="color">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: color }}
                    />
                    <span>Color</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {IDEA_COLORS.map((c) => (
                    <SelectItem key={c} value={c}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: c }}
                        />
                        <span className="capitalize">{c}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Idea</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
