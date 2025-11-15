import { useCallback, useMemo, useState, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel,
  useReactFlow,
  ReactFlowProvider,
  EdgeMouseHandler,
  useKeyPress,
} from "reactflow";
import "reactflow/dist/style.css";
import { useGoalMapStorage } from "@/hooks/useGoalMapStorage";
import { useGoalStorage } from "@/hooks/useGoalStorage";
import { useUndoRedo } from "@/hooks/useUndoRedo";
import { GoalMapCard } from "@/components/GoalMapCard";
import { MilestoneCard } from "@/components/MilestoneCard";
import { RequirementCard } from "@/components/RequirementCard";
import { NoteCard } from "@/components/NoteCard";
import { CustomEdge } from "@/components/CustomEdge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize,
  Target,
  ArrowLeft,
  Search,
  Flag,
  Wrench,
  StickyNote,
  Edit,
  Undo2,
  Redo2,
  Copy,
  Keyboard,
  Menu,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ConnectionMode, edgeStyles } from "@/types/goalMap";

// Define node types for ReactFlow
const nodeTypes = {
  goalCard: GoalMapCard,
  milestoneCard: MilestoneCard,
  requirementCard: RequirementCard,
  noteCard: NoteCard,
};

// Define edge types for ReactFlow
const edgeTypes = {
  smoothstep: CustomEdge,
};

type CardType = "goal" | "milestone" | "requirement" | "note";

/**
 * GoalMapCanvasInner Component
 * Main canvas component (must be wrapped in ReactFlowProvider)
 */
function GoalMapCanvasInner() {
  const navigate = useNavigate();
  const { fitView, zoomIn, zoomOut, screenToFlowPosition } = useReactFlow();
  const { goals, isLoaded: goalsLoaded } = useGoalStorage();
  const {
    nodes,
    edges,
    isLoaded: mapLoaded,
    addGoalNode,
    addMilestoneNode,
    addRequirementNode,
    addNoteNode,
    onNodesChange,
    onEdgesChange,
    onConnect,
    updateEdge,
    removeEdge,
    clearCanvas,
    hasGoalNode,
    duplicateNode,
    duplicateNodes,
    removeNodes,
    updateNode,
    setNodesState,
    setEdgesState,
  } = useGoalMapStorage();

  const { canUndo, canRedo, undo, redo, pushHistory, clearHistory } = useUndoRedo();

  const [isAddGoalDialogOpen, setIsAddGoalDialogOpen] = useState(false);
  const [isAddCardDialogOpen, setIsAddCardDialogOpen] = useState(false);
  const [isEditEdgeDialogOpen, setIsEditEdgeDialogOpen] = useState(false);
  const [isShortcutsDialogOpen, setIsShortcutsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCardType, setSelectedCardType] =
    useState<CardType>("milestone");
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [edgeRelationType, setEdgeRelationType] =
    useState<ConnectionMode>("related");
  const [edgeAnimationDirection, setEdgeAnimationDirection] = useState<
    "forward" | "reverse"
  >("forward");
  const [lastHistoryPush, setLastHistoryPush] = useState(0);

  // Form states for new cards
  const [milestoneForm, setMilestoneForm] = useState({
    title: "",
    description: "",
    targetDate: "",
    completed: false,
    color: "blue",
  });

  const [requirementForm, setRequirementForm] = useState({
    title: "",
    description: "",
    requirementType: "skill" as const,
    completed: false,
    cost: 0,
    priority: "medium" as const,
  });

  const [noteForm, setNoteForm] = useState({
    title: "",
    description: "",
    content: "",
    color: "yellow",
    tags: [] as string[],
  });

  // Push to history when nodes or edges change (debounced)
  useEffect(() => {
    if (!mapLoaded) return;

    const timer = setTimeout(() => {
      pushHistory({ nodes, edges });
      setLastHistoryPush(Date.now());
    }, 500);

    return () => clearTimeout(timer);
  }, [nodes, edges, mapLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for inline editing events from cards
  useEffect(() => {
    const handleUpdateNodeData = (event: Event) => {
      const customEvent = event as CustomEvent<{ id: string; data: any }>;
      const { id, data } = customEvent.detail;
      updateNode(id, data);
      toast.success('Card updated');
    };

    window.addEventListener('updateNodeData', handleUpdateNodeData);
    return () => window.removeEventListener('updateNodeData', handleUpdateNodeData);
  }, [updateNode]);

  // Get selected nodes
  const selectedNodes = useMemo(() => {
    return nodes.filter((node) => node.selected);
  }, [nodes]);

  // Filter goals that are not already on the canvas
  const availableGoals = useMemo(() => {
    return goals.filter((goal) => !hasGoalNode(goal.id));
  }, [goals, hasGoalNode]);

  // Further filter by search query
  const filteredGoals = useMemo(() => {
    if (!searchQuery.trim()) return availableGoals;
    const query = searchQuery.toLowerCase();
    return availableGoals.filter(
      (goal) =>
        goal.title.toLowerCase().includes(query) ||
        goal.description?.toLowerCase().includes(query) ||
        goal.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  }, [availableGoals, searchQuery]);

  // Handle adding a goal to the canvas
  const handleAddGoal = useCallback(
    (goalId: string) => {
      const goal = goals.find((g) => g.id === goalId);
      if (!goal) return;

      const position = screenToFlowPosition({
        x: window.innerWidth / 2 - 140,
        y: window.innerHeight / 2 - 150,
      });

      addGoalNode(goal, position);
      toast.success(`Added "${goal.title}" to canvas`);
      setIsAddGoalDialogOpen(false);
      setSearchQuery("");
    },
    [goals, addGoalNode, screenToFlowPosition]
  );

  // Handle adding a new card (milestone, requirement, note)
  const handleAddCard = useCallback(() => {
    const position = screenToFlowPosition({
      x: window.innerWidth / 2 - 120,
      y: window.innerHeight / 2 - 100,
    });

    try {
      if (selectedCardType === "milestone") {
        if (!milestoneForm.title.trim()) {
          toast.error("Please enter a milestone title");
          return;
        }
        addMilestoneNode(milestoneForm, position);
        toast.success("Milestone added to canvas");
        setMilestoneForm({
          title: "",
          description: "",
          targetDate: "",
          completed: false,
          color: "blue",
        });
      } else if (selectedCardType === "requirement") {
        if (!requirementForm.title.trim()) {
          toast.error("Please enter a requirement title");
          return;
        }
        addRequirementNode(requirementForm, position);
        toast.success("Requirement added to canvas");
        setRequirementForm({
          title: "",
          description: "",
          requirementType: "skill",
          completed: false,
          cost: 0,
          priority: "medium",
        });
      } else if (selectedCardType === "note") {
        if (!noteForm.title.trim()) {
          toast.error("Please enter a note title");
          return;
        }
        addNoteNode(noteForm, position);
        toast.success("Note added to canvas");
        setNoteForm({
          title: "",
          description: "",
          content: "",
          color: "yellow",
          tags: [],
        });
      }

      setIsAddCardDialogOpen(false);
    } catch (error) {
      toast.error("Failed to add card");
      console.error(error);
    }
  }, [
    selectedCardType,
    milestoneForm,
    requirementForm,
    noteForm,
    addMilestoneNode,
    addRequirementNode,
    addNoteNode,
    screenToFlowPosition,
  ]);

  // Handle edge click for editing
  const handleEdgeClick: EdgeMouseHandler = useCallback((event, edge) => {
    event.stopPropagation();
    setSelectedEdgeId(edge.id);
    setEdgeRelationType(
      (edge.data?.relationshipType as ConnectionMode) || "related"
    );
    setEdgeAnimationDirection(edge.data?.animationDirection || "forward");
    setIsEditEdgeDialogOpen(true);
  }, []);

  // Handle edge relationship type update
  const handleUpdateEdge = useCallback(() => {
    if (selectedEdgeId) {
      updateEdge(selectedEdgeId, {
        relationshipType: edgeRelationType,
        animationDirection: edgeAnimationDirection,
      });
      toast.success("Connection updated");
      setIsEditEdgeDialogOpen(false);
      setSelectedEdgeId(null);
    }
  }, [selectedEdgeId, edgeRelationType, edgeAnimationDirection, updateEdge]);

  // Handle edge deletion
  const handleDeleteEdge = useCallback(() => {
    if (selectedEdgeId) {
      if (confirm("Are you sure you want to delete this connection?")) {
        removeEdge(selectedEdgeId);
        toast.success("Connection deleted");
        setIsEditEdgeDialogOpen(false);
        setSelectedEdgeId(null);
      }
    }
  }, [selectedEdgeId, removeEdge]);

  // Handle edge rewiring (drag edge endpoint to reconnect)
  const handleEdgeUpdate = useCallback((oldEdge: any, newConnection: any) => {
    const updatedEdges = edges.map((edge) => {
      if (edge.id === oldEdge.id) {
        return {
          ...edge,
          source: newConnection.source,
          target: newConnection.target,
          sourceHandle: newConnection.sourceHandle,
          targetHandle: newConnection.targetHandle,
        };
      }
      return edge;
    });

    setEdgesState(updatedEdges);
    toast.success("Connection rewired");
  }, [edges, setEdgesState]);

  // Handle clearing the canvas
  const handleClearCanvas = useCallback(() => {
    if (nodes.length === 0) {
      toast.info("Canvas is already empty");
      return;
    }

    if (
      confirm(
        "Are you sure you want to clear the entire canvas? This cannot be undone."
      )
    ) {
      clearCanvas();
      clearHistory();
      toast.success("Canvas cleared");
    }
  }, [nodes.length, clearCanvas, clearHistory]);

  // Handle undo
  const handleUndo = useCallback(() => {
    const prevState = undo();
    if (prevState) {
      setNodesState(prevState.nodes);
      setEdgesState(prevState.edges);
      toast.success("Undone");
    }
  }, [undo, setNodesState, setEdgesState]);

  // Handle redo
  const handleRedo = useCallback(() => {
    const nextState = redo();
    if (nextState) {
      setNodesState(nextState.nodes);
      setEdgesState(nextState.edges);
      toast.success("Redone");
    }
  }, [redo, setNodesState, setEdgesState]);

  // Handle duplicate selected nodes
  const handleDuplicate = useCallback(() => {
    if (selectedNodes.length === 0) {
      toast.info("Select cards to duplicate");
      return;
    }

    const nodeIds = selectedNodes.map((n) => n.id);
    duplicateNodes(nodeIds);
    toast.success(`Duplicated ${selectedNodes.length} card${selectedNodes.length > 1 ? 's' : ''}`);
  }, [selectedNodes, duplicateNodes]);

  // Handle delete selected nodes
  const handleDeleteSelected = useCallback(() => {
    if (selectedNodes.length === 0) {
      toast.info("Select cards to delete");
      return;
    }

    if (confirm(`Delete ${selectedNodes.length} selected card${selectedNodes.length > 1 ? 's' : ''}?`)) {
      const nodeIds = selectedNodes.map((n) => n.id);
      removeNodes(nodeIds);
      toast.success(`Deleted ${selectedNodes.length} card${selectedNodes.length > 1 ? 's' : ''}`);
    }
  }, [selectedNodes, removeNodes]);

  // Handle fit view
  const handleFitView = useCallback(() => {
    fitView({ padding: 0.2, duration: 300 });
  }, [fitView]);

  // Update viewport when it changes
  const handleMoveEnd = useCallback((event: any, viewport: any) => {
    // Viewport is auto-saved via the hook
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? event.metaKey : event.ctrlKey;

      // Ctrl/Cmd + Z = Undo
      if (cmdOrCtrl && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        handleUndo();
      }
      // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y = Redo
      else if ((cmdOrCtrl && event.key === 'z' && event.shiftKey) || (cmdOrCtrl && event.key === 'y')) {
        event.preventDefault();
        handleRedo();
      }
      // Ctrl/Cmd + D = Duplicate
      else if (cmdOrCtrl && event.key === 'd') {
        event.preventDefault();
        handleDuplicate();
      }
      // Delete or Backspace = Delete selected
      else if ((event.key === 'Delete' || event.key === 'Backspace') && !cmdOrCtrl) {
        event.preventDefault();
        handleDeleteSelected();
      }
      // Ctrl/Cmd + A = Select all
      else if (cmdOrCtrl && event.key === 'a') {
        event.preventDefault();
        // ReactFlow handles this internally
      }
      // ? = Show keyboard shortcuts
      else if (event.key === '?') {
        event.preventDefault();
        setIsShortcutsDialogOpen(true);
      }
      // F = Fit view
      else if (event.key === 'f' && !cmdOrCtrl) {
        event.preventDefault();
        handleFitView();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, handleDuplicate, handleDeleteSelected, handleFitView]);

  if (!goalsLoaded || !mapLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading goal map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/goals")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Goals
          </Button>
          <div className="h-6 w-px bg-gray-300" />
          <Target className="w-5 h-5 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900">Goal Map</h1>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {nodes.length} {nodes.length === 1 ? "card" : "cards"} on canvas
          </Badge>
        </div>
      </div>

      {/* ReactFlow Canvas */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgeClick={handleEdgeClick}
          onEdgeUpdate={handleEdgeUpdate}
          onMoveEnd={handleMoveEnd}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          minZoom={0.1}
          maxZoom={2}
          selectionOnDrag
          panOnDrag={[1, 2]}
          selectionMode="partial"
          edgeUpdaterRadius={10}
          defaultEdgeOptions={{
            type: "smoothstep",
            animated: true,
            style: { strokeWidth: 2 },
          }}
        >
          <Background color="#e5e7eb" gap={16} />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              if (node.type === "goalCard") {
                const status = node.data.status;
                if (status === "completed") return "#22c55e";
                if (status === "in-progress") return "#3b82f6";
                if (status === "on-hold") return "#f59e0b";
                return "#9ca3af";
              }
              if (node.type === "milestoneCard") return "#3b82f6";
              if (node.type === "requirementCard") return "#10b981";
              if (node.type === "noteCard") return "#fbbf24";
              return "#6b7280";
            }}
            maskColor="rgba(0, 0, 0, 0.1)"
          />

          {/* Toolbar Panel - Hidden on mobile */}
          <Panel position="top-right" className="hidden lg:block space-y-2">
            <Card className="p-2 space-y-2 shadow-lg">
              {/* Undo/Redo Controls */}
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleUndo}
                  disabled={!canUndo}
                  className="flex-1"
                  title="Undo (Ctrl+Z)"
                >
                  <Undo2 className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRedo}
                  disabled={!canRedo}
                  className="flex-1"
                  title="Redo (Ctrl+Y)"
                >
                  <Redo2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="h-px bg-gray-200" />

              <Dialog
                open={isAddGoalDialogOpen}
                onOpenChange={setIsAddGoalDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button size="sm" className="w-full">
                    <Target className="w-4 h-4 mr-2" />
                    Add Goal
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                  <DialogHeader>
                    <DialogTitle>Add Goal to Canvas</DialogTitle>
                    <DialogDescription>
                      Select a goal from your goals list to add to the canvas
                    </DialogDescription>
                  </DialogHeader>

                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search goals..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2">
                    {filteredGoals.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        {availableGoals.length === 0 ? (
                          <>
                            <Target className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                            <p>All goals are already on the canvas!</p>
                            <p className="text-sm mt-1">
                              Create new goals in the{" "}
                              <button
                                onClick={() => navigate("/goals/create")}
                                className="text-blue-600 hover:underline"
                              >
                                Goals page
                              </button>
                            </p>
                          </>
                        ) : (
                          <>
                            <Search className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                            <p>No goals match your search</p>
                          </>
                        )}
                      </div>
                    ) : (
                      filteredGoals.map((goal) => (
                        <Card
                          key={goal.id}
                          className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => handleAddGoal(goal.id)}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm mb-1">
                                {goal.title}
                              </h3>
                              {goal.description && (
                                <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                                  {goal.description}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-1">
                                <Badge variant="outline" className="text-xs">
                                  {goal.type}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className="text-xs capitalize"
                                >
                                  {goal.status.replace("-", " ")}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {goal.progress}%
                                </Badge>
                              </div>
                            </div>
                            <Button size="sm" variant="ghost">
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog
                open={isAddCardDialogOpen}
                onOpenChange={setIsAddCardDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Card
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Card</DialogTitle>
                    <DialogDescription>
                      Create a milestone, requirement, or note card
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div>
                      <Label>Card Type</Label>
                      <Select
                        value={selectedCardType}
                        onValueChange={(v) =>
                          setSelectedCardType(v as CardType)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="milestone">
                            <div className="flex items-center gap-2">
                              <Flag className="w-4 h-4" />
                              Milestone
                            </div>
                          </SelectItem>
                          <SelectItem value="requirement">
                            <div className="flex items-center gap-2">
                              <Wrench className="w-4 h-4" />
                              Requirement
                            </div>
                          </SelectItem>
                          <SelectItem value="note">
                            <div className="flex items-center gap-2">
                              <StickyNote className="w-4 h-4" />
                              Note
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedCardType === "milestone" && (
                      <>
                        <div>
                          <Label>Title *</Label>
                          <Input
                            value={milestoneForm.title}
                            onChange={(e) =>
                              setMilestoneForm({
                                ...milestoneForm,
                                title: e.target.value,
                              })
                            }
                            placeholder="Milestone title"
                          />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={milestoneForm.description}
                            onChange={(e) =>
                              setMilestoneForm({
                                ...milestoneForm,
                                description: e.target.value,
                              })
                            }
                            placeholder="Optional description"
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label>Target Date</Label>
                          <Input
                            type="date"
                            value={milestoneForm.targetDate}
                            onChange={(e) =>
                              setMilestoneForm({
                                ...milestoneForm,
                                targetDate: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label>Color</Label>
                          <Select
                            value={milestoneForm.color}
                            onValueChange={(v) =>
                              setMilestoneForm({ ...milestoneForm, color: v })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="blue">Blue</SelectItem>
                              <SelectItem value="green">Green</SelectItem>
                              <SelectItem value="purple">Purple</SelectItem>
                              <SelectItem value="pink">Pink</SelectItem>
                              <SelectItem value="yellow">Yellow</SelectItem>
                              <SelectItem value="gray">Gray</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}

                    {selectedCardType === "requirement" && (
                      <>
                        <div>
                          <Label>Title *</Label>
                          <Input
                            value={requirementForm.title}
                            onChange={(e) =>
                              setRequirementForm({
                                ...requirementForm,
                                title: e.target.value,
                              })
                            }
                            placeholder="Requirement title"
                          />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={requirementForm.description}
                            onChange={(e) =>
                              setRequirementForm({
                                ...requirementForm,
                                description: e.target.value,
                              })
                            }
                            placeholder="Optional description"
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label>Type</Label>
                          <Select
                            value={requirementForm.requirementType}
                            onValueChange={(v: any) =>
                              setRequirementForm({
                                ...requirementForm,
                                requirementType: v,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="skill">Skill</SelectItem>
                              <SelectItem value="resource">Resource</SelectItem>
                              <SelectItem value="tool">Tool</SelectItem>
                              <SelectItem value="knowledge">
                                Knowledge
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Priority</Label>
                          <Select
                            value={requirementForm.priority}
                            onValueChange={(v: any) =>
                              setRequirementForm({
                                ...requirementForm,
                                priority: v,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Cost (optional)</Label>
                          <Input
                            type="number"
                            value={requirementForm.cost}
                            onChange={(e) =>
                              setRequirementForm({
                                ...requirementForm,
                                cost: parseFloat(e.target.value) || 0,
                              })
                            }
                            placeholder="0"
                          />
                        </div>
                      </>
                    )}

                    {selectedCardType === "note" && (
                      <>
                        <div>
                          <Label>Title *</Label>
                          <Input
                            value={noteForm.title}
                            onChange={(e) =>
                              setNoteForm({
                                ...noteForm,
                                title: e.target.value,
                              })
                            }
                            placeholder="Note title"
                          />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Input
                            value={noteForm.description}
                            onChange={(e) =>
                              setNoteForm({
                                ...noteForm,
                                description: e.target.value,
                              })
                            }
                            placeholder="Optional subtitle"
                          />
                        </div>
                        <div>
                          <Label>Content</Label>
                          <Textarea
                            value={noteForm.content}
                            onChange={(e) =>
                              setNoteForm({
                                ...noteForm,
                                content: e.target.value,
                              })
                            }
                            placeholder="Note content..."
                            rows={4}
                          />
                        </div>
                        <div>
                          <Label>Color</Label>
                          <Select
                            value={noteForm.color}
                            onValueChange={(v) =>
                              setNoteForm({ ...noteForm, color: v })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="yellow">Yellow</SelectItem>
                              <SelectItem value="blue">Blue</SelectItem>
                              <SelectItem value="green">Green</SelectItem>
                              <SelectItem value="purple">Purple</SelectItem>
                              <SelectItem value="pink">Pink</SelectItem>
                              <SelectItem value="gray">Gray</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}

                    <Button onClick={handleAddCard} className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add{" "}
                      {selectedCardType.charAt(0).toUpperCase() +
                        selectedCardType.slice(1)}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="h-px bg-gray-200" />

              {/* Bulk Operations */}
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={handleDuplicate}
                disabled={selectedNodes.length === 0}
                title="Duplicate selected (Ctrl+D)"
              >
                <Copy className="w-4 h-4 mr-2" />
                Duplicate {selectedNodes.length > 0 && `(${selectedNodes.length})`}
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleDeleteSelected}
                disabled={selectedNodes.length === 0}
                title="Delete selected (Del)"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete {selectedNodes.length > 0 && `(${selectedNodes.length})`}
              </Button>

              <div className="h-px bg-gray-200" />

              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={handleFitView}
              >
                <Maximize className="w-4 h-4 mr-2" />
                Fit View
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => zoomIn()}
              >
                <ZoomIn className="w-4 h-4 mr-2" />
                Zoom In
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => zoomOut()}
              >
                <ZoomOut className="w-4 h-4 mr-2" />
                Zoom Out
              </Button>

              <div className="h-px bg-gray-200" />

              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => setIsShortcutsDialogOpen(true)}
              >
                <Keyboard className="w-4 h-4 mr-2" />
                Shortcuts
              </Button>

              <Button
                size="sm"
                variant="destructive"
                className="w-full"
                onClick={handleClearCanvas}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Canvas
              </Button>
            </Card>
          </Panel>

          {/* Mobile Compact Toolbar - Hidden on desktop */}
          <Panel position="bottom-right" className="lg:hidden">
            <div className="flex flex-col gap-2">
              <Button
                size="lg"
                className="rounded-full w-12 h-12 shadow-lg"
                onClick={() => setIsAddGoalDialogOpen(true)}
                title="Add Goal"
              >
                <Target className="w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full w-12 h-12 shadow-lg bg-white"
                onClick={() => setIsAddCardDialogOpen(true)}
                title="Add Card"
              >
                <Plus className="w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full w-12 h-12 shadow-lg bg-white"
                onClick={handleUndo}
                disabled={!canUndo}
                title="Undo"
              >
                <Undo2 className="w-5 h-5" />
              </Button>
            </div>
          </Panel>

          {/* Empty State */}
          {nodes.length === 0 && (
            <Panel position="top-center" className="pointer-events-none">
              <Card className="p-6 text-center bg-white/90 backdrop-blur">
                <Target className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <h2 className="text-lg font-semibold mb-2">
                  Start Mapping Your Goals
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Add goals, milestones, requirements, and notes to the canvas
                  and connect them
                </p>
                <div className="flex gap-2 justify-center pointer-events-auto">
                  <Button
                    size="sm"
                    onClick={() => setIsAddGoalDialogOpen(true)}
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Add Goal
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsAddCardDialogOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Card
                  </Button>
                </div>
              </Card>
            </Panel>
          )}
        </ReactFlow>
      </div>

      {/* Edge Edit Dialog */}
      <Dialog
        open={isEditEdgeDialogOpen}
        onOpenChange={setIsEditEdgeDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Connection</DialogTitle>
            <DialogDescription>
              Customize the connection between cards
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Relationship Type</Label>
              <Select
                value={edgeRelationType}
                onValueChange={(v) => setEdgeRelationType(v as ConnectionMode)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(edgeStyles).map(([key, style]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-1 rounded"
                          style={{ backgroundColor: style.stroke }}
                        />
                        {style.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Animation Direction</Label>
              <Select
                value={edgeAnimationDirection}
                onValueChange={(v) =>
                  setEdgeAnimationDirection(v as "forward" | "reverse")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="forward">
                    Forward (Source → Target)
                  </SelectItem>
                  <SelectItem value="reverse">
                    Reverse (Target → Source)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleUpdateEdge} className="flex-1">
                <Edit className="w-4 h-4 mr-2" />
                Update
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditEdgeDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>

            <div className="border-t pt-4">
              <Button
                variant="destructive"
                onClick={handleDeleteEdge}
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Connection
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Keyboard Shortcuts Dialog */}
      <Dialog
        open={isShortcutsDialogOpen}
        onOpenChange={setIsShortcutsDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
            <DialogDescription>
              Boost your productivity with these keyboard shortcuts
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="font-medium">Undo</div>
              <div className="text-gray-600">Ctrl/Cmd + Z</div>

              <div className="font-medium">Redo</div>
              <div className="text-gray-600">Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y</div>

              <div className="font-medium">Duplicate selected</div>
              <div className="text-gray-600">Ctrl/Cmd + D</div>

              <div className="font-medium">Delete selected</div>
              <div className="text-gray-600">Delete or Backspace</div>

              <div className="font-medium">Select all</div>
              <div className="text-gray-600">Ctrl/Cmd + A</div>

              <div className="font-medium">Fit view</div>
              <div className="text-gray-600">F</div>

              <div className="font-medium">Show shortcuts</div>
              <div className="text-gray-600">?</div>
            </div>

            <div className="border-t pt-3">
              <h4 className="font-medium text-sm mb-2">Selection & Navigation</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-medium">Box select</div>
                <div className="text-gray-600">Click and drag on canvas</div>

                <div className="font-medium">Pan canvas</div>
                <div className="text-gray-600">Middle/right mouse drag or scroll wheel</div>
              </div>
            </div>

            <div className="border-t pt-3">
              <h4 className="font-medium text-sm mb-2">Connections</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-medium">Create connection</div>
                <div className="text-gray-600">Drag from handle to handle</div>

                <div className="font-medium">Rewire connection</div>
                <div className="text-gray-600">Drag from connection endpoint</div>

                <div className="font-medium">Edit connection</div>
                <div className="text-gray-600">Click on connection line</div>
              </div>
            </div>

            <div className="border-t pt-3">
              <h4 className="font-medium text-sm mb-2">Inline Editing</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-medium">Edit card title</div>
                <div className="text-gray-600">Double-click title</div>

                <div className="font-medium">Edit description</div>
                <div className="text-gray-600">Double-click description</div>

                <div className="font-medium">Save edits</div>
                <div className="text-gray-600">Enter (Ctrl+Enter for description)</div>

                <div className="font-medium">Cancel edits</div>
                <div className="text-gray-600">Escape</div>
              </div>
            </div>
          </div>

          <Button onClick={() => setIsShortcutsDialogOpen(false)}>
            Got it!
          </Button>
        </DialogContent>
      </Dialog>

      {/* Instructions Footer */}
      <div className="bg-white border-t border-gray-200 px-2 sm:px-4 py-2">
        <div className="flex items-center justify-center gap-2 sm:gap-6 text-xs text-gray-600 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span className="hidden sm:inline">Drag cards to reposition • Click & drag canvas for box select</span>
            <span className="sm:hidden">Drag cards</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span className="hidden sm:inline">Drag connection endpoints to rewire</span>
            <span className="sm:hidden">Rewire</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span className="hidden sm:inline">Double-click to edit • Press ? for shortcuts</span>
            <span className="sm:hidden">Press ?</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * GoalMapCanvas Component
 * Wrapper with ReactFlowProvider
 */
export default function GoalMapCanvas() {
  return (
    <ReactFlowProvider>
      <GoalMapCanvasInner />
    </ReactFlowProvider>
  );
}
