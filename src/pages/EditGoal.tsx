import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Target,
  DollarSign,
  Clock,
  MessageSquare,
  Wrench,
  FileText,
} from "lucide-react";
import { useGoalStorage } from "@/hooks/useGoalStorage";
import { useGamification } from "@/hooks/useGamification";
import {
  calculateGoalProgress,
  generateSubgoalId,
  generateRequirementId,
  generateCostId,
  generateMilestoneId,
  getSubgoalsCompletion,
  getRequirementsCompletion,
  getMilestonesCompletion,
  formatDuration,
  calculateDaysUntilTarget,
} from "@/lib/utils-goal";
import {
  GoalType,
  GoalTimeframe,
  GoalPriority,
  GoalStatus,
  GOAL_TYPE_LABELS,
  GOAL_TIMEFRAME_LABELS,
  GOAL_PRIORITY_LABELS,
  GOAL_STATUS_LABELS,
  GoalSubgoal,
  GoalRequirement,
  GoalCost,
  GoalMilestone,
} from "@/types/goal";
import { toast } from "sonner";
import { format } from "date-fns";

const EditGoal = () => {
  const navigate = useNavigate();
  const { goalId } = useParams();
  const { goals, isLoaded, updateGoal, toggleSubgoal, toggleRequirement, toggleMilestone, addFeedback } = useGoalStorage();
  const { recordGoalComplete, recordMilestoneComplete, addXP } = useGamification();

  const goal = goals.find((g) => g.id === goalId);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<GoalType>("major");
  const [timeframe, setTimeframe] = useState<GoalTimeframe>("short-term");
  const [priority, setPriority] = useState<GoalPriority>("medium");
  const [status, setStatus] = useState<GoalStatus>("not-started");
  const [targetDate, setTargetDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState("");
  const [planningNotes, setPlanningNotes] = useState("");
  const [scopeDescription, setScopeDescription] = useState("");
  const [boundaries, setBoundaries] = useState("");
  const [impact, setImpact] = useState("");

  // Subgoals
  const [subgoals, setSubgoals] = useState<GoalSubgoal[]>([]);
  const [showSubgoalDialog, setShowSubgoalDialog] = useState(false);
  const [newSubgoalTitle, setNewSubgoalTitle] = useState("");
  const [newSubgoalDescription, setNewSubgoalDescription] = useState("");

  // Requirements
  const [requirements, setRequirements] = useState<GoalRequirement[]>([]);
  const [showRequirementDialog, setShowRequirementDialog] = useState(false);
  const [newRequirementTitle, setNewRequirementTitle] = useState("");
  const [newRequirementType, setNewRequirementType] = useState<"resource" | "skill" | "milestone" | "tool">("resource");

  // Milestones
  const [milestones, setMilestones] = useState<GoalMilestone[]>([]);
  const [showMilestoneDialog, setShowMilestoneDialog] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");
  const [newMilestoneDate, setNewMilestoneDate] = useState("");

  // Costs
  const [costs, setCosts] = useState<GoalCost[]>([]);
  const [showCostDialog, setShowCostDialog] = useState(false);
  const [newCostType, setNewCostType] = useState<"financial" | "time" | "resource">("financial");
  const [newCostAmount, setNewCostAmount] = useState("");
  const [newCostUnit, setNewCostUnit] = useState("");
  const [newCostDescription, setNewCostDescription] = useState("");

  // Feedback
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [newFeedbackContent, setNewFeedbackContent] = useState("");
  const [newFeedbackType, setNewFeedbackType] = useState<"reflection" | "feedback" | "note">("note");

  // Tools
  const [toolsNeeded, setToolsNeeded] = useState<string[]>([]);
  const [newTool, setNewTool] = useState("");

  useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setDescription(goal.description || "");
      setType(goal.type);
      setTimeframe(goal.timeframe);
      setPriority(goal.priority);
      setStatus(goal.status);
      setTargetDate(goal.targetDate ? new Date(goal.targetDate).toISOString().split("T")[0] : "");
      setStartDate(goal.startDate ? new Date(goal.startDate).toISOString().split("T")[0] : "");
      setTags(goal.tags.join(", "));
      setCategory(goal.category || "");
      setPlanningNotes(goal.planningNotes || "");
      setScopeDescription(goal.scopeDescription || "");
      setBoundaries(goal.boundaries || "");
      setImpact(goal.impact || "");
      setSubgoals(goal.subgoals);
      setRequirements(goal.requirements);
      setMilestones(goal.milestones);
      setCosts(goal.costs);
      setToolsNeeded(goal.toolsNeeded || []);
    }
  }, [goal]);

  if (!isLoaded) {
    return (
      <AppLayout title="Edit Goal">
        <p className="text-muted-foreground">Loading...</p>
      </AppLayout>
    );
  }

  if (!goal) {
    return (
      <AppLayout title="Edit Goal">
        <p className="text-red-600">Goal not found</p>
        <Button onClick={() => navigate("/goals")} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Goals
        </Button>
      </AppLayout>
    );
  }

  const handleSubmit = () => {
    if (!goalId || !title.trim()) {
      toast.error("Please enter a goal title");
      return;
    }

    // Check if goal was just completed
    const wasCompleted = goal?.status === "completed";
    const isNowCompleted = status === "completed";

    updateGoal(goalId, {
      title: title.trim(),
      description: description.trim() || undefined,
      type,
      timeframe,
      priority,
      status,
      targetDate: targetDate ? new Date(targetDate) : undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0),
      category: category.trim() || undefined,
      planningNotes: planningNotes.trim() || undefined,
      scopeDescription: scopeDescription.trim() || undefined,
      boundaries: boundaries.trim() || undefined,
      impact: impact.trim() || undefined,
      subgoals,
      requirements,
      milestones,
      costs,
      toolsNeeded: toolsNeeded.length > 0 ? toolsNeeded : undefined,
      progress: calculateGoalProgress({...goal, subgoals, requirements, milestones}),
      completedDate: status === "completed" ? new Date() : undefined,
    });

    // Award XP if goal was just completed
    if (!wasCompleted && isNowCompleted) {
      recordGoalComplete();
    }

    toast.success("Goal updated successfully!");
    navigate("/goals");
  };

  const handleAddSubgoal = () => {
    if (!newSubgoalTitle.trim()) {
      toast.error("Please enter a subgoal title");
      return;
    }

    const newSubgoal: GoalSubgoal = {
      id: generateSubgoalId(),
      title: newSubgoalTitle.trim(),
      description: newSubgoalDescription.trim() || undefined,
      completed: false,
      createdAt: new Date(),
    };

    setSubgoals([...subgoals, newSubgoal]);
    setNewSubgoalTitle("");
    setNewSubgoalDescription("");
    setShowSubgoalDialog(false);
    toast.success("Subgoal added");
  };

  const handleAddRequirement = () => {
    if (!newRequirementTitle.trim()) {
      toast.error("Please enter a requirement title");
      return;
    }

    const newRequirement: GoalRequirement = {
      id: generateRequirementId(),
      title: newRequirementTitle.trim(),
      type: newRequirementType,
      completed: false,
    };

    setRequirements([...requirements, newRequirement]);
    setNewRequirementTitle("");
    setShowRequirementDialog(false);
    toast.success("Requirement added");
  };

  const handleAddMilestone = () => {
    if (!newMilestoneTitle.trim()) {
      toast.error("Please enter a milestone title");
      return;
    }

    const newMilestone: GoalMilestone = {
      id: generateMilestoneId(),
      title: newMilestoneTitle.trim(),
      targetDate: newMilestoneDate ? new Date(newMilestoneDate) : undefined,
      completed: false,
    };

    setMilestones([...milestones, newMilestone]);
    setNewMilestoneTitle("");
    setNewMilestoneDate("");
    setShowMilestoneDialog(false);
    toast.success("Milestone added");
  };

  const handleAddCost = () => {
    const amount = parseFloat(newCostAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid cost amount");
      return;
    }

    const newCost: GoalCost = {
      id: generateCostId(),
      type: newCostType,
      amount,
      unit: newCostUnit.trim() || undefined,
      description: newCostDescription.trim() || undefined,
    };

    setCosts([...costs, newCost]);
    setNewCostAmount("");
    setNewCostUnit("");
    setNewCostDescription("");
    setShowCostDialog(false);
    toast.success("Cost added");
  };

  const handleAddFeedback = () => {
    if (!goalId || !newFeedbackContent.trim()) {
      toast.error("Please enter feedback content");
      return;
    }

    addFeedback(goalId, {
      content: newFeedbackContent.trim(),
      type: newFeedbackType,
    });

    setNewFeedbackContent("");
    setShowFeedbackDialog(false);
    toast.success("Feedback added");
  };

  const handleAddTool = () => {
    if (!newTool.trim()) return;
    setToolsNeeded([...toolsNeeded, newTool.trim()]);
    setNewTool("");
    toast.success("Tool added");
  };

  const progressPercentage = calculateGoalProgress({...goal, subgoals, requirements, milestones});
  const daysUntil = calculateDaysUntilTarget({...goal, targetDate: targetDate ? new Date(targetDate) : undefined});

  return (
    <AppLayout title="Edit Goal" containerClassName="max-w-6xl" className="pb-20">
        <Button variant="ghost" onClick={() => navigate("/goals")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Goals
        </Button>

        {/* Progress Overview */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-1">{title || "Untitled Goal"}</h2>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{GOAL_STATUS_LABELS[status]}</Badge>
                <Badge variant="secondary">{GOAL_PRIORITY_LABELS[priority]}</Badge>
              </div>
            </div>
            <Target className="h-12 w-12 text-primary" />
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-semibold text-lg">{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Subgoals</p>
              <p className="font-semibold">{getSubgoalsCompletion({...goal, subgoals})}% complete</p>
            </div>
            <div>
              <p className="text-muted-foreground">Requirements</p>
              <p className="font-semibold">{getRequirementsCompletion({...goal, requirements})}% complete</p>
            </div>
            <div>
              <p className="text-muted-foreground">Milestones</p>
              <p className="font-semibold">{getMilestonesCompletion({...goal, milestones})}% complete</p>
            </div>
          </div>

          {daysUntil !== null && (
            <p className="text-sm text-muted-foreground mt-4">
              {daysUntil > 0 ? `${formatDuration(daysUntil)} remaining` : "Deadline passed"}
            </p>
          )}
        </Card>

        {/* Tabbed Sections */}
        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="planning">Planning</TabsTrigger>
            <TabsTrigger value="subgoals">Subgoals</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={type} onValueChange={(v) => setType(v as GoalType)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(GOAL_TYPE_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Timeframe</Label>
                    <Select value={timeframe} onValueChange={(v) => setTimeframe(v as GoalTimeframe)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(GOAL_TIMEFRAME_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={priority} onValueChange={(v) => setPriority(v as GoalPriority)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(GOAL_PRIORITY_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={status} onValueChange={(v) => setStatus(v as GoalStatus)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(GOAL_STATUS_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label>Target Date</Label>
                    <Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g., Career" />
                  </div>

                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Separate with commas" />
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Planning Tab */}
          <TabsContent value="planning">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Planning & Scope</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Planning Notes</Label>
                  <Textarea
                    value={planningNotes}
                    onChange={(e) => setPlanningNotes(e.target.value)}
                    placeholder="Outline steps, strategies, and action plans..."
                    rows={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Scope Description</Label>
                  <Textarea
                    value={scopeDescription}
                    onChange={(e) => setScopeDescription(e.target.value)}
                    placeholder="Define what this goal encompasses..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Boundaries</Label>
                  <Textarea
                    value={boundaries}
                    onChange={(e) => setBoundaries(e.target.value)}
                    placeholder="What's included and excluded from this goal..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Expected Impact</Label>
                  <Textarea
                    value={impact}
                    onChange={(e) => setImpact(e.target.value)}
                    placeholder="What will achieving this goal accomplish..."
                    rows={3}
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Subgoals Tab */}
          <TabsContent value="subgoals">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Subgoals ({subgoals.length})</h3>
                <Button onClick={() => setShowSubgoalDialog(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subgoal
                </Button>
              </div>

              {subgoals.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No subgoals yet. Break down your goal into smaller, actionable steps.
                </p>
              ) : (
                <div className="space-y-3">
                  {subgoals.map((subgoal) => (
                    <div key={subgoal.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <Checkbox
                        checked={subgoal.completed}
                        onCheckedChange={() => {
                          const wasCompleted = subgoal.completed;
                          setSubgoals(subgoals.map(sg =>
                            sg.id === subgoal.id ? {...sg, completed: !sg.completed} : sg
                          ));
                          // Award XP when subgoal is completed
                          if (!wasCompleted) {
                            addXP(10, "Subgoal completed");
                          }
                        }}
                      />
                      <div className="flex-1">
                        <p className={subgoal.completed ? "line-through text-muted-foreground" : ""}>
                          {subgoal.title}
                        </p>
                        {subgoal.description && (
                          <p className="text-sm text-muted-foreground mt-1">{subgoal.description}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSubgoals(subgoals.filter(sg => sg.id !== subgoal.id))}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Milestones Tab */}
          <TabsContent value="milestones">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Milestones ({milestones.length})</h3>
                <Button onClick={() => setShowMilestoneDialog(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Milestone
                </Button>
              </div>

              {milestones.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No milestones yet. Add key checkpoints to track progress.
                </p>
              ) : (
                <div className="space-y-3">
                  {milestones.map((milestone) => (
                    <div key={milestone.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <Checkbox
                        checked={milestone.completed}
                        onCheckedChange={() => {
                          const wasCompleted = milestone.completed;
                          setMilestones(milestones.map(m =>
                            m.id === milestone.id ? {...m, completed: !m.completed, completedDate: !m.completed ? new Date() : undefined} : m
                          ));
                          // Award XP when milestone is completed
                          if (!wasCompleted) {
                            recordMilestoneComplete();
                          }
                        }}
                      />
                      <div className="flex-1">
                        <p className={milestone.completed ? "line-through text-muted-foreground" : ""}>
                          {milestone.title}
                        </p>
                        {milestone.targetDate && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Target: {format(milestone.targetDate, "MMM d, yyyy")}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setMilestones(milestones.filter(m => m.id !== milestone.id))}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources">
            <div className="space-y-4">
              {/* Requirements */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Requirements ({requirements.length})</h3>
                  <Button onClick={() => setShowRequirementDialog(true)} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Requirement
                  </Button>
                </div>

                {requirements.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No requirements yet. List resources, skills, or tools needed.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {requirements.map((req) => (
                      <div key={req.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <Checkbox
                          checked={req.completed}
                          onCheckedChange={() => {
                            setRequirements(requirements.map(r =>
                              r.id === req.id ? {...r, completed: !r.completed} : r
                            ));
                          }}
                        />
                        <div className="flex-1">
                          <p className={req.completed ? "line-through text-muted-foreground" : ""}>
                            {req.title}
                          </p>
                          {req.type && (
                            <Badge variant="outline" className="mt-1">{req.type}</Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setRequirements(requirements.filter(r => r.id !== req.id))}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Tools Needed */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Tools Needed ({toolsNeeded.length})</h3>
                </div>

                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="Enter tool name..."
                    value={newTool}
                    onChange={(e) => setNewTool(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddTool()}
                  />
                  <Button onClick={handleAddTool}>Add</Button>
                </div>

                {toolsNeeded.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {toolsNeeded.map((tool, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-2">
                        {tool}
                        <button
                          onClick={() => setToolsNeeded(toolsNeeded.filter((_, i) => i !== index))}
                          className="hover:text-red-600"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </Card>

              {/* Costs */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Costs ({costs.length})</h3>
                  <Button onClick={() => setShowCostDialog(true)} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Cost
                  </Button>
                </div>

                {costs.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No costs yet. Track financial, time, or resource costs.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {costs.map((cost) => (
                      <div key={cost.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{cost.type}</Badge>
                            <p className="font-semibold">
                              {cost.amount} {cost.unit}
                            </p>
                          </div>
                          {cost.description && (
                            <p className="text-sm text-muted-foreground mt-1">{cost.description}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setCosts(costs.filter(c => c.id !== cost.id))}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Feedback & Notes ({goal.feedback.length})</h3>
                <Button onClick={() => setShowFeedbackDialog(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </div>

              {goal.feedback.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No feedback yet. Add reflections, notes, or feedback.
                </p>
              ) : (
                <div className="space-y-4">
                  {goal.feedback.map((feedback) => (
                    <div key={feedback.id} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{feedback.type}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {format(feedback.date, "MMM d, yyyy 'at' h:mm a")}
                        </span>
                      </div>
                      <p>{feedback.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={() => navigate("/goals")} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex-1">
            Save Changes
          </Button>
        </div>

      {/* Dialogs */}
      <Dialog open={showSubgoalDialog} onOpenChange={setShowSubgoalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Subgoal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={newSubgoalTitle}
                onChange={(e) => setNewSubgoalTitle(e.target.value)}
                placeholder="Enter subgoal..."
              />
            </div>
            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Textarea
                value={newSubgoalDescription}
                onChange={(e) => setNewSubgoalDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubgoalDialog(false)}>Cancel</Button>
            <Button onClick={handleAddSubgoal}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRequirementDialog} onOpenChange={setShowRequirementDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Requirement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={newRequirementTitle}
                onChange={(e) => setNewRequirementTitle(e.target.value)}
                placeholder="Enter requirement..."
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={newRequirementType} onValueChange={(v: any) => setNewRequirementType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="resource">Resource</SelectItem>
                  <SelectItem value="skill">Skill</SelectItem>
                  <SelectItem value="milestone">Milestone</SelectItem>
                  <SelectItem value="tool">Tool</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequirementDialog(false)}>Cancel</Button>
            <Button onClick={handleAddRequirement}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showMilestoneDialog} onOpenChange={setShowMilestoneDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Milestone</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={newMilestoneTitle}
                onChange={(e) => setNewMilestoneTitle(e.target.value)}
                placeholder="Enter milestone..."
              />
            </div>
            <div className="space-y-2">
              <Label>Target Date (Optional)</Label>
              <Input
                type="date"
                value={newMilestoneDate}
                onChange={(e) => setNewMilestoneDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMilestoneDialog(false)}>Cancel</Button>
            <Button onClick={handleAddMilestone}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCostDialog} onOpenChange={setShowCostDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Cost</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={newCostType} onValueChange={(v: any) => setNewCostType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="time">Time</SelectItem>
                  <SelectItem value="resource">Resource</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount *</Label>
              <Input
                type="number"
                value={newCostAmount}
                onChange={(e) => setNewCostAmount(e.target.value)}
                placeholder="Enter amount..."
              />
            </div>
            <div className="space-y-2">
              <Label>Unit</Label>
              <Input
                value={newCostUnit}
                onChange={(e) => setNewCostUnit(e.target.value)}
                placeholder="e.g., USD, hours, items"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={newCostDescription}
                onChange={(e) => setNewCostDescription(e.target.value)}
                placeholder="Optional description..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCostDialog(false)}>Cancel</Button>
            <Button onClick={handleAddCost}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Feedback</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={newFeedbackType} onValueChange={(v: any) => setNewFeedbackType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="note">Note</SelectItem>
                  <SelectItem value="reflection">Reflection</SelectItem>
                  <SelectItem value="feedback">Feedback</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Content *</Label>
              <Textarea
                value={newFeedbackContent}
                onChange={(e) => setNewFeedbackContent(e.target.value)}
                placeholder="Write your note..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFeedbackDialog(false)}>Cancel</Button>
            <Button onClick={handleAddFeedback}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default EditGoal;
