import { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel,
  useReactFlow,
  ReactFlowProvider,
  EdgeMouseHandler,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useGoalMapStorage } from '@/hooks/useGoalMapStorage';
import { useGoalStorage } from '@/hooks/useGoalStorage';
import { GoalMapCard } from '@/components/GoalMapCard';
import { MilestoneCard } from '@/components/MilestoneCard';
import { RequirementCard } from '@/components/RequirementCard';
import { NoteCard } from '@/components/NoteCard';
import { CustomEdge } from '@/components/CustomEdge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ConnectionMode, edgeStyles } from '@/types/goalMap';

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

type CardType = 'goal' | 'milestone' | 'requirement' | 'note';

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
    clearCanvas,
    hasGoalNode,
  } = useGoalMapStorage();

  const [isAddGoalDialogOpen, setIsAddGoalDialogOpen] = useState(false);
  const [isAddCardDialogOpen, setIsAddCardDialogOpen] = useState(false);
  const [isEditEdgeDialogOpen, setIsEditEdgeDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCardType, setSelectedCardType] = useState<CardType>('milestone');
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [edgeRelationType, setEdgeRelationType] = useState<ConnectionMode>('related');

  // Form states for new cards
  const [milestoneForm, setMilestoneForm] = useState({
    title: '',
    description: '',
    targetDate: '',
    completed: false,
    color: 'blue',
  });

  const [requirementForm, setRequirementForm] = useState({
    title: '',
    description: '',
    requirementType: 'skill' as const,
    completed: false,
    cost: 0,
    priority: 'medium' as const,
  });

  const [noteForm, setNoteForm] = useState({
    title: '',
    description: '',
    content: '',
    color: 'yellow',
    tags: [] as string[],
  });

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
  const handleAddGoal = useCallback((goalId: string) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;

    const position = screenToFlowPosition({
      x: window.innerWidth / 2 - 140,
      y: window.innerHeight / 2 - 150,
    });

    addGoalNode(goal, position);
    toast.success(`Added "${goal.title}" to canvas`);
    setIsAddGoalDialogOpen(false);
    setSearchQuery('');
  }, [goals, addGoalNode, screenToFlowPosition]);

  // Handle adding a new card (milestone, requirement, note)
  const handleAddCard = useCallback(() => {
    const position = screenToFlowPosition({
      x: window.innerWidth / 2 - 120,
      y: window.innerHeight / 2 - 100,
    });

    try {
      if (selectedCardType === 'milestone') {
        if (!milestoneForm.title.trim()) {
          toast.error('Please enter a milestone title');
          return;
        }
        addMilestoneNode(milestoneForm, position);
        toast.success('Milestone added to canvas');
        setMilestoneForm({
          title: '',
          description: '',
          targetDate: '',
          completed: false,
          color: 'blue',
        });
      } else if (selectedCardType === 'requirement') {
        if (!requirementForm.title.trim()) {
          toast.error('Please enter a requirement title');
          return;
        }
        addRequirementNode(requirementForm, position);
        toast.success('Requirement added to canvas');
        setRequirementForm({
          title: '',
          description: '',
          requirementType: 'skill',
          completed: false,
          cost: 0,
          priority: 'medium',
        });
      } else if (selectedCardType === 'note') {
        if (!noteForm.title.trim()) {
          toast.error('Please enter a note title');
          return;
        }
        addNoteNode(noteForm, position);
        toast.success('Note added to canvas');
        setNoteForm({
          title: '',
          description: '',
          content: '',
          color: 'yellow',
          tags: [],
        });
      }

      setIsAddCardDialogOpen(false);
    } catch (error) {
      toast.error('Failed to add card');
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
    setEdgeRelationType((edge.data?.relationshipType as ConnectionMode) || 'related');
    setIsEditEdgeDialogOpen(true);
  }, []);

  // Handle edge relationship type update
  const handleUpdateEdge = useCallback(() => {
    if (selectedEdgeId) {
      updateEdge(selectedEdgeId, { relationshipType: edgeRelationType });
      toast.success('Connection updated');
      setIsEditEdgeDialogOpen(false);
      setSelectedEdgeId(null);
    }
  }, [selectedEdgeId, edgeRelationType, updateEdge]);

  // Handle clearing the canvas
  const handleClearCanvas = useCallback(() => {
    if (nodes.length === 0) {
      toast.info('Canvas is already empty');
      return;
    }

    if (confirm('Are you sure you want to clear the entire canvas? This cannot be undone.')) {
      clearCanvas();
      toast.success('Canvas cleared');
    }
  }, [nodes.length, clearCanvas]);

  // Handle fit view
  const handleFitView = useCallback(() => {
    fitView({ padding: 0.2, duration: 300 });
  }, [fitView]);

  // Update viewport when it changes
  const handleMoveEnd = useCallback(
    (event: any, viewport: any) => {
      // Viewport is auto-saved via the hook
    },
    []
  );

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
          <Button variant="ghost" size="sm" onClick={() => navigate('/goals')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Goals
          </Button>
          <div className="h-6 w-px bg-gray-300" />
          <Target className="w-5 h-5 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900">Goal Map</h1>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {nodes.length} {nodes.length === 1 ? 'card' : 'cards'} on canvas
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
          onMoveEnd={handleMoveEnd}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          minZoom={0.1}
          maxZoom={2}
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: true,
            style: { strokeWidth: 2 },
          }}
        >
          <Background color="#e5e7eb" gap={16} />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              if (node.type === 'goalCard') {
                const status = node.data.status;
                if (status === 'completed') return '#22c55e';
                if (status === 'in-progress') return '#3b82f6';
                if (status === 'on-hold') return '#f59e0b';
                return '#9ca3af';
              }
              if (node.type === 'milestoneCard') return '#3b82f6';
              if (node.type === 'requirementCard') return '#10b981';
              if (node.type === 'noteCard') return '#fbbf24';
              return '#6b7280';
            }}
            maskColor="rgba(0, 0, 0, 0.1)"
          />

          {/* Toolbar Panel */}
          <Panel position="top-right" className="space-y-2">
            <Card className="p-2 space-y-2 shadow-lg">
              <Dialog open={isAddGoalDialogOpen} onOpenChange={setIsAddGoalDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="w-full">
                    <Target className="w-4 h-4 mr-2" />
                    Add Goal
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                  <DialogHeader>
                    <DialogTitle>Add Goal to Canvas</DialogTitle>
                    <DialogDescription>Select a goal from your goals list to add to the canvas</DialogDescription>
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
                              Create new goals in the{' '}
                              <button
                                onClick={() => navigate('/goals/create')}
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
                              <h3 className="font-semibold text-sm mb-1">{goal.title}</h3>
                              {goal.description && (
                                <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                                  {goal.description}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-1">
                                <Badge variant="outline" className="text-xs">
                                  {goal.type}
                                </Badge>
                                <Badge variant="outline" className="text-xs capitalize">
                                  {goal.status.replace('-', ' ')}
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

              <Dialog open={isAddCardDialogOpen} onOpenChange={setIsAddCardDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Card
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Card</DialogTitle>
                    <DialogDescription>Create a milestone, requirement, or note card</DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div>
                      <Label>Card Type</Label>
                      <Select value={selectedCardType} onValueChange={(v) => setSelectedCardType(v as CardType)}>
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

                    {selectedCardType === 'milestone' && (
                      <>
                        <div>
                          <Label>Title *</Label>
                          <Input
                            value={milestoneForm.title}
                            onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
                            placeholder="Milestone title"
                          />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={milestoneForm.description}
                            onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
                            placeholder="Optional description"
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label>Target Date</Label>
                          <Input
                            type="date"
                            value={milestoneForm.targetDate}
                            onChange={(e) => setMilestoneForm({ ...milestoneForm, targetDate: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Color</Label>
                          <Select
                            value={milestoneForm.color}
                            onValueChange={(v) => setMilestoneForm({ ...milestoneForm, color: v })}
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

                    {selectedCardType === 'requirement' && (
                      <>
                        <div>
                          <Label>Title *</Label>
                          <Input
                            value={requirementForm.title}
                            onChange={(e) => setRequirementForm({ ...requirementForm, title: e.target.value })}
                            placeholder="Requirement title"
                          />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={requirementForm.description}
                            onChange={(e) => setRequirementForm({ ...requirementForm, description: e.target.value })}
                            placeholder="Optional description"
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label>Type</Label>
                          <Select
                            value={requirementForm.requirementType}
                            onValueChange={(v: any) => setRequirementForm({ ...requirementForm, requirementType: v })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="skill">Skill</SelectItem>
                              <SelectItem value="resource">Resource</SelectItem>
                              <SelectItem value="tool">Tool</SelectItem>
                              <SelectItem value="knowledge">Knowledge</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Priority</Label>
                          <Select
                            value={requirementForm.priority}
                            onValueChange={(v: any) => setRequirementForm({ ...requirementForm, priority: v })}
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
                              setRequirementForm({ ...requirementForm, cost: parseFloat(e.target.value) || 0 })
                            }
                            placeholder="0"
                          />
                        </div>
                      </>
                    )}

                    {selectedCardType === 'note' && (
                      <>
                        <div>
                          <Label>Title *</Label>
                          <Input
                            value={noteForm.title}
                            onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                            placeholder="Note title"
                          />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Input
                            value={noteForm.description}
                            onChange={(e) => setNoteForm({ ...noteForm, description: e.target.value })}
                            placeholder="Optional subtitle"
                          />
                        </div>
                        <div>
                          <Label>Content</Label>
                          <Textarea
                            value={noteForm.content}
                            onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                            placeholder="Note content..."
                            rows={4}
                          />
                        </div>
                        <div>
                          <Label>Color</Label>
                          <Select value={noteForm.color} onValueChange={(v) => setNoteForm({ ...noteForm, color: v })}>
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
                      Add {selectedCardType.charAt(0).toUpperCase() + selectedCardType.slice(1)}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="h-px bg-gray-200" />

              <Button size="sm" variant="outline" className="w-full" onClick={handleFitView}>
                <Maximize className="w-4 h-4 mr-2" />
                Fit View
              </Button>

              <Button size="sm" variant="outline" className="w-full" onClick={() => zoomIn()}>
                <ZoomIn className="w-4 h-4 mr-2" />
                Zoom In
              </Button>

              <Button size="sm" variant="outline" className="w-full" onClick={() => zoomOut()}>
                <ZoomOut className="w-4 h-4 mr-2" />
                Zoom Out
              </Button>

              <div className="h-px bg-gray-200" />

              <Button size="sm" variant="destructive" className="w-full" onClick={handleClearCanvas}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Canvas
              </Button>
            </Card>
          </Panel>

          {/* Empty State */}
          {nodes.length === 0 && (
            <Panel position="top-center" className="pointer-events-none">
              <Card className="p-6 text-center bg-white/90 backdrop-blur">
                <Target className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <h2 className="text-lg font-semibold mb-2">Start Mapping Your Goals</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Add goals, milestones, requirements, and notes to the canvas and connect them
                </p>
                <div className="flex gap-2 justify-center pointer-events-auto">
                  <Button size="sm" onClick={() => setIsAddGoalDialogOpen(true)}>
                    <Target className="w-4 h-4 mr-2" />
                    Add Goal
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsAddCardDialogOpen(true)}>
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
      <Dialog open={isEditEdgeDialogOpen} onOpenChange={setIsEditEdgeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Connection</DialogTitle>
            <DialogDescription>Choose the relationship type for this connection</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Relationship Type</Label>
              <Select value={edgeRelationType} onValueChange={(v) => setEdgeRelationType(v as ConnectionMode)}>
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

            <div className="flex gap-2">
              <Button onClick={handleUpdateEdge} className="flex-1">
                <Edit className="w-4 h-4 mr-2" />
                Update
              </Button>
              <Button variant="outline" onClick={() => setIsEditEdgeDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Instructions Footer */}
      <div className="bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex items-center justify-center gap-6 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span>Drag cards to reposition</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span>Connect handles to link items</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span>Click connections to edit</span>
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
