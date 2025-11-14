import { useCallback, useMemo, useState, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useGoalMapStorage } from '@/hooks/useGoalMapStorage';
import { useGoalStorage } from '@/hooks/useGoalStorage';
import { GoalMapCard } from '@/components/GoalMapCard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Plus,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize,
  Target,
  ArrowLeft,
  Search,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Define node types for ReactFlow
const nodeTypes = {
  goalCard: GoalMapCard,
};

/**
 * GoalMapCanvasInner Component
 * Main canvas component (must be wrapped in ReactFlowProvider)
 */
function GoalMapCanvasInner() {
  const navigate = useNavigate();
  const { fitView, zoomIn, zoomOut } = useReactFlow();
  const { goals, isLoaded: goalsLoaded } = useGoalStorage();
  const {
    nodes,
    edges,
    isLoaded: mapLoaded,
    addGoalNode,
    removeNode,
    onNodesChange,
    onEdgesChange,
    onConnect,
    updateViewport,
    hasGoalNode,
    clearCanvas,
  } = useGoalMapStorage();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

    // Calculate a random position in the center area
    const position = {
      x: Math.random() * 400 + 100,
      y: Math.random() * 400 + 100,
    };

    addGoalNode(goal, position);
    toast.success(`Added "${goal.title}" to canvas`);
    setIsAddDialogOpen(false);
    setSearchQuery('');
  }, [goals, addGoalNode]);

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
  const handleMoveEnd = useCallback((event: any, viewport: any) => {
    updateViewport(viewport);
  }, [updateViewport]);

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
            {nodes.length} {nodes.length === 1 ? 'goal' : 'goals'} on canvas
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
          onMoveEnd={handleMoveEnd}
          nodeTypes={nodeTypes}
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
              const status = node.data.status;
              if (status === 'completed') return '#22c55e';
              if (status === 'in-progress') return '#3b82f6';
              if (status === 'on-hold') return '#f59e0b';
              return '#9ca3af';
            }}
            maskColor="rgba(0, 0, 0, 0.1)"
          />

          {/* Toolbar Panel */}
          <Panel position="top-right" className="space-y-2">
            <Card className="p-2 space-y-2 shadow-lg">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Goal
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                  <DialogHeader>
                    <DialogTitle>Add Goal to Canvas</DialogTitle>
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
                variant="destructive"
                className="w-full"
                onClick={handleClearCanvas}
              >
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
                  Add goals to the canvas and connect them to visualize your roadmap
                </p>
                <Button
                  size="sm"
                  onClick={() => setIsAddDialogOpen(true)}
                  className="pointer-events-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Goal
                </Button>
              </Card>
            </Panel>
          )}
        </ReactFlow>
      </div>

      {/* Instructions Footer */}
      <div className="bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex items-center justify-center gap-6 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span>Drag cards to reposition</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span>Connect handles to link goals</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span>Right-click edges to delete</span>
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
