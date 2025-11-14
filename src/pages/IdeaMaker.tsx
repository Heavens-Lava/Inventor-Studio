import { useState, useMemo, useRef, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { useIdeasStorage } from "@/hooks/useIdeasStorage";
import { IdeaCard as IdeaCardComponent } from "@/components/ideas/IdeaCard";
import { AddIdeaForm } from "@/components/ideas/AddIdeaForm";
import { DrawingCanvas } from "@/components/ideas/DrawingCanvas";
import { DrawingDisplay } from "@/components/ideas/DrawingDisplay";
import { IdeasSettings } from "@/components/ideas/IdeasSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  LayoutGrid,
  Search,
  Filter,
  Plus,
  Folders,
  Grid3x3,
  List,
  Pencil
} from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { generateId } from "@/lib/utils-todo";
import { IdeaBoard, IdeaLayout, ArrowConnection } from "@/types/ideas";
import { cn } from "@/lib/utils";

const IdeaMaker = () => {
  const {
    boards,
    currentBoard,
    currentBoardId,
    setCurrentBoardId,
    settings,
    isLoaded,
    addBoard,
    updateBoard,
    deleteBoard,
    addIdea,
    updateIdea,
    deleteIdea,
    updateSettings
  } = useIdeasStorage();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showNewBoardDialog, setShowNewBoardDialog] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showDrawing, setShowDrawing] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [connectionStart, setConnectionStart] = useState<string | null>(null);
  const [quickNotePosition, setQuickNotePosition] = useState<{ x: number; y: number } | null>(null);
  const [quickNoteText, setQuickNoteText] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const quickNoteInputRef = useRef<HTMLInputElement>(null);

  // Filter ideas based on search and status
  const filteredIdeas = useMemo(() => {
    if (!currentBoard) return [];

    return currentBoard.ideas.filter((idea) => {
      const matchesSearch =
        idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        idea.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        idea.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === "all" || idea.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [currentBoard, searchQuery, statusFilter]);

  // Update canvas size when container resizes
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        const height = Math.max(containerRef.current.offsetHeight, 500);
        setCanvasSize({ width, height });
      }
    };

    // Use setTimeout to ensure DOM has updated
    const timeoutId = setTimeout(updateSize, 50);

    window.addEventListener("resize", updateSize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", updateSize);
    };
  }, [showDrawing, filteredIdeas.length]);

  // Create first board if none exist
  const handleCreateFirstBoard = () => {
    const firstBoard: IdeaBoard = {
      id: generateId(),
      name: "My Ideas",
      layout: "grid",
      ideas: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    addBoard(firstBoard);
  };

  const handleAddBoard = () => {
    if (!newBoardName.trim()) return;

    const board: IdeaBoard = {
      id: generateId(),
      name: newBoardName.trim(),
      layout: settings.defaultLayout,
      ideas: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    addBoard(board);
    setNewBoardName("");
    setShowNewBoardDialog(false);
    toast.success("Board created!");
  };

  // Handle card connection
  const handleConnectionStart = (cardId: string) => {
    if (connectionStart === null) {
      // First card selected
      setConnectionStart(cardId);
      toast.info("Select another card to connect");
    } else if (connectionStart === cardId) {
      // Same card clicked, cancel
      setConnectionStart(null);
      toast.info("Connection cancelled");
    } else {
      // Second card selected, create arrow
      const newArrow: ArrowConnection = {
        id: generateId(),
        fromCardId: connectionStart,
        toCardId: cardId,
        color: "#3b82f6"
      };

      const currentArrows = currentBoard?.arrows || [];
      updateBoard(currentBoardId!, {
        arrows: [...currentArrows, newArrow]
      });

      setConnectionStart(null);
      toast.success("Connection created!");
    }
  };

  // Handle canvas click to create quick note
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only in freeform mode and not while drawing
    if (currentBoard?.layout !== "freeform" || showDrawing) {
      return;
    }

    // Check if we're clicking on a card or other interactive element
    const target = e.target as HTMLElement;

    // Don't create note if clicking on cards or interactive elements
    if (
      target.closest('[data-card]') ||
      target.closest('button') ||
      target.closest('input') ||
      target.closest('textarea') ||
      target.closest('[role="button"]')
    ) {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setQuickNotePosition({ x, y });
    setQuickNoteText("");
  };

  // Focus input when quick note appears
  useEffect(() => {
    if (quickNotePosition && quickNoteInputRef.current) {
      quickNoteInputRef.current.focus();
    }
  }, [quickNotePosition]);

  // Handle quick note creation
  const handleQuickNoteSubmit = () => {
    if (!quickNoteText.trim() || !quickNotePosition) return;

    const newIdea = {
      id: generateId(),
      title: quickNoteText.trim(),
      color: settings.defaultCardColor,
      tags: [],
      status: "draft" as const,
      position: quickNotePosition,
      createdAt: new Date(),
      updatedAt: new Date(),
      votes: 0
    };

    addIdea(currentBoardId!, newIdea);
    setQuickNotePosition(null);
    setQuickNoteText("");
    toast.success("Note created!");
  };

  // Handle quick note cancel
  const handleQuickNoteCancel = () => {
    setQuickNotePosition(null);
    setQuickNoteText("");
  };

  const backgroundStyle: React.CSSProperties = (() => {
    if (settings.backgroundType === "image" && settings.backgroundImage) {
      return {
        backgroundImage: `url(${settings.backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed"
      };
    }
    if (settings.backgroundType === "color" && settings.backgroundImage) {
      return { backgroundColor: settings.backgroundImage };
    }
    return {};
  })();

  if (!isLoaded) {
    return (
      <AppLayout title="Daily Haven Suite">
        <p className="text-muted-foreground">Loading...</p>
      </AppLayout>
    );
  }

  // No boards exist
  if (boards.length === 0) {
    return (
      <AppLayout
        title="Daily Haven Suite"
        backgroundGradient={settings.backgroundType === "theme" ? settings.backgroundTheme : "default"}
        style={backgroundStyle}
        containerClassName="max-w-4xl"
      >
          <div className="text-center py-12">
            <Folders className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Idea Boards Yet</h2>
            <p className="text-muted-foreground mb-6">
              Create your first board to start capturing brilliant ideas
            </p>
            <Button onClick={handleCreateFirstBoard} size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Create First Board
            </Button>
          </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Daily Haven Suite"
      backgroundGradient={settings.backgroundType === "theme" ? settings.backgroundTheme : "default"}
      style={backgroundStyle}
      containerClassName="max-w-7xl"
    >
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 truncate">Ideas</h1>
            <p className="text-sm text-muted-foreground">
              Capture and organize your creative thoughts
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <IdeasSettings settings={settings} onUpdate={updateSettings} />

            <Dialog open={showNewBoardDialog} onOpenChange={setShowNewBoardDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1 sm:flex-initial">
                  <Folders className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">New Board</span>
                  <span className="sm:hidden">Board</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Board</DialogTitle>
                  <DialogDescription>
                    Start a new idea collection board
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="board-name">Board Name</Label>
                  <Input
                    id="board-name"
                    value={newBoardName}
                    onChange={(e) => setNewBoardName(e.target.value)}
                    placeholder="My Project Ideas"
                    onKeyDown={(e) => e.key === "Enter" && handleAddBoard()}
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowNewBoardDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddBoard}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {currentBoard && (
              <AddIdeaForm
                onAdd={(idea) => {
                  addIdea(currentBoardId!, idea);
                  toast.success("Idea added!");
                }}
                defaultColor={settings.defaultCardColor}
              />
            )}
          </div>
        </div>

        {/* Board Selector & Controls */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Board Selector */}
            <div className="flex-1">
              <Label htmlFor="board-select" className="text-xs mb-1.5 block">
                Current Board
              </Label>
              <Select value={currentBoardId || undefined} onValueChange={setCurrentBoardId}>
                <SelectTrigger id="board-select">
                  <SelectValue placeholder="Select a board" />
                </SelectTrigger>
                <SelectContent>
                  {boards.map((board) => (
                    <SelectItem key={board.id} value={board.id}>
                      {board.name} ({board.ideas.length} ideas)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div className="flex-1">
              <Label htmlFor="search" className="text-xs mb-1.5 block">
                Search Ideas
              </Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex-1">
              <Label htmlFor="status-filter" className="text-xs mb-1.5 block">
                Filter by Status
              </Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Toggle */}
            <div className="flex gap-2 items-end">
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
                variant={showDrawing ? "default" : "outline"}
                size="icon"
                onClick={() => setShowDrawing(!showDrawing)}
                title={showDrawing ? "Hide Drawing Tools" : "Show Drawing Tools"}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Ideas Grid/List */}
        {currentBoard && (
          <div
            ref={containerRef}
            className="relative min-h-[500px]"
            onClick={handleCanvasClick}
          >
            {/* Drawing Display (Always Visible) */}
            <DrawingDisplay
              strokes={currentBoard.drawingStrokes || []}
              arrows={currentBoard.arrows || []}
              ideas={currentBoard.ideas}
              width={canvasSize.width}
              height={canvasSize.height}
            />

            {/* Interactive Drawing Canvas (Only when drawing mode enabled) */}
            {showDrawing && (
              <DrawingCanvas
                strokes={currentBoard.drawingStrokes || []}
                arrows={currentBoard.arrows || []}
                onStrokesChange={(strokes) =>
                  updateBoard(currentBoardId!, { drawingStrokes: strokes })
                }
                onArrowsChange={(arrows) =>
                  updateBoard(currentBoardId!, { arrows })
                }
                width={canvasSize.width}
                height={canvasSize.height}
              />
            )}

            {/* Quick Note Input */}
            {quickNotePosition && (
              <div
                className="absolute z-[100] pointer-events-auto"
                style={{
                  left: `${quickNotePosition.x}px`,
                  top: `${quickNotePosition.y}px`
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <Card className="p-3 shadow-xl border-2 border-primary">
                  <Input
                    ref={quickNoteInputRef}
                    type="text"
                    value={quickNoteText}
                    onChange={(e) => setQuickNoteText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleQuickNoteSubmit();
                      } else if (e.key === "Escape") {
                        handleQuickNoteCancel();
                      }
                    }}
                    placeholder="Enter note title..."
                    className="mb-2"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleQuickNoteSubmit}>
                      Create
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleQuickNoteCancel}>
                      Cancel
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {filteredIdeas.length === 0 ? (
              <div className="text-center py-12">
                <LayoutGrid className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery || statusFilter !== "all" ? "No ideas match your filters" : "No ideas yet"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || statusFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "Start by adding your first idea to this board"}
                </p>
                {!searchQuery && statusFilter === "all" && (
                  <AddIdeaForm
                    onAdd={(idea) => {
                      addIdea(currentBoardId!, idea);
                      toast.success("Idea added!");
                    }}
                    defaultColor={settings.defaultCardColor}
                  />
                )}
              </div>
            ) : (
              <div
                className={cn(
                  currentBoard.layout === "freeform"
                    ? "relative w-full h-full"
                    : viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    : "flex flex-col gap-4"
                )}
              >
                {filteredIdeas.map((idea, index) => {
                  // Initialize position for freeform layout if not set
                  const needsPosition = currentBoard.layout === "freeform" && !idea.position;
                  if (needsPosition) {
                    const x = 50 + (index % 3) * 280;
                    const y = 50 + Math.floor(index / 3) * 230;
                    updateIdea(currentBoardId!, idea.id, {
                      position: { x, y }
                    });
                  }

                  return (
                    <IdeaCardComponent
                      key={idea.id}
                      idea={idea}
                      onUpdate={(id, updates) => updateIdea(currentBoardId!, id, updates)}
                      onDelete={(id) => {
                        deleteIdea(currentBoardId!, id);
                        toast.success("Idea deleted");
                      }}
                      enableVoting={settings.enableVoting}
                      draggable={currentBoard.layout === "freeform"}
                      onConnectionStart={handleConnectionStart}
                      isConnectionMode={connectionStart !== null}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}
    </AppLayout>
  );
};

export default IdeaMaker;
