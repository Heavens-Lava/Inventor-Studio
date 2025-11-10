import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Task } from "@/types/todo";
import { toast } from "sonner";

interface ExportImportProps {
  tasks: Task[];
  onImport: (tasks: Task[]) => void;
}

export const ExportImport = ({ tasks, onImport }: ExportImportProps) => {
  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(tasks, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `todo-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`Exported ${tasks.length} tasks successfully!`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export tasks");
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedTasks = JSON.parse(content) as Task[];

        // Validate and convert date strings back to Date objects
        const validatedTasks = importedTasks.map((task) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
          timerStartedAt: task.timerStartedAt ? new Date(task.timerStartedAt) : undefined,
        }));

        onImport(validatedTasks);
        toast.success(`Imported ${validatedTasks.length} tasks successfully!`);
      } catch (error) {
        console.error("Import error:", error);
        toast.error("Failed to import tasks. Please check the file format.");
      }
    };
    reader.readAsText(file);

    // Reset input
    event.target.value = "";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Download className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExport} className="gap-2">
          <Download className="h-4 w-4" />
          Export Tasks
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <label className="flex items-center gap-2 cursor-pointer">
            <Upload className="h-4 w-4" />
            Import Tasks
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
