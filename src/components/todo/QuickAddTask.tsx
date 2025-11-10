import { useState } from "react";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Task } from "@/types/todo";
import { generateId } from "@/lib/utils-todo";

interface QuickAddTaskProps {
  onAdd: (task: Task) => void;
}

export const QuickAddTask = ({ onAdd }: QuickAddTaskProps) => {
  const [title, setTitle] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    const newTask: Task = {
      id: generateId(),
      title: title.trim(),
      category: "other",
      priority: "medium",
      status: "pending",
      timeSpent: 0,
      subtasks: [],
      createdAt: new Date(),
      tags: [],
    };

    onAdd(newTask);
    setTitle("");
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Input
        placeholder="Quick add: Type a task and press Enter..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="pr-10 h-12 text-base"
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-accent rounded-md transition-colors"
        disabled={!title.trim()}
      >
        <Plus className="h-5 w-5 text-muted-foreground" />
      </button>
    </form>
  );
};
