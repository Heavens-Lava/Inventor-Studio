import { useState, useEffect } from "react";
import { Goal } from "@/types/goal";

const STORAGE_KEY = "daily-haven-goals";

export const useGoalStorage = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load goals from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const goalsWithDates = parsed.map((goal: any) => ({
          ...goal,
          createdAt: new Date(goal.createdAt),
          updatedAt: goal.updatedAt ? new Date(goal.updatedAt) : undefined,
          startDate: goal.startDate ? new Date(goal.startDate) : undefined,
          targetDate: goal.targetDate ? new Date(goal.targetDate) : undefined,
          completedDate: goal.completedDate ? new Date(goal.completedDate) : undefined,
          subgoals: goal.subgoals.map((sg: any) => ({
            ...sg,
            createdAt: new Date(sg.createdAt),
            dueDate: sg.dueDate ? new Date(sg.dueDate) : undefined,
          })),
          milestones: goal.milestones.map((m: any) => ({
            ...m,
            targetDate: m.targetDate ? new Date(m.targetDate) : undefined,
            completedDate: m.completedDate ? new Date(m.completedDate) : undefined,
          })),
          feedback: goal.feedback.map((f: any) => ({
            ...f,
            date: new Date(f.date),
          })),
        }));
        setGoals(goalsWithDates);
      }
    } catch (error) {
      console.error("Error loading goals from localStorage:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save goals to localStorage whenever they change
  const saveGoals = (newGoals: Goal[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newGoals));
      setGoals(newGoals);
    } catch (error) {
      console.error("Error saving goals to localStorage:", error);
    }
  };

  // Add a new goal
  const addGoal = (goal: Goal) => {
    const newGoals = [...goals, goal];
    saveGoals(newGoals);
  };

  // Update an existing goal
  const updateGoal = (goalId: string, updates: Partial<Goal>) => {
    const newGoals = goals.map((goal) =>
      goal.id === goalId
        ? { ...goal, ...updates, updatedAt: new Date() }
        : goal
    );
    saveGoals(newGoals);
  };

  // Delete a goal
  const deleteGoal = (goalId: string) => {
    const newGoals = goals.filter((goal) => goal.id !== goalId);
    saveGoals(newGoals);
  };

  // Toggle subgoal completion
  const toggleSubgoal = (goalId: string, subgoalId: string) => {
    const newGoals = goals.map((goal) => {
      if (goal.id !== goalId) return goal;

      const updatedSubgoals = goal.subgoals.map((sg) =>
        sg.id === subgoalId ? { ...sg, completed: !sg.completed } : sg
      );

      return { ...goal, subgoals: updatedSubgoals, updatedAt: new Date() };
    });
    saveGoals(newGoals);
  };

  // Toggle requirement completion
  const toggleRequirement = (goalId: string, requirementId: string) => {
    const newGoals = goals.map((goal) => {
      if (goal.id !== goalId) return goal;

      const updatedRequirements = goal.requirements.map((r) =>
        r.id === requirementId ? { ...r, completed: !r.completed } : r
      );

      return { ...goal, requirements: updatedRequirements, updatedAt: new Date() };
    });
    saveGoals(newGoals);
  };

  // Toggle milestone completion
  const toggleMilestone = (goalId: string, milestoneId: string) => {
    const newGoals = goals.map((goal) => {
      if (goal.id !== goalId) return goal;

      const updatedMilestones = goal.milestones.map((m) =>
        m.id === milestoneId
          ? {
              ...m,
              completed: !m.completed,
              completedDate: !m.completed ? new Date() : undefined,
            }
          : m
      );

      return { ...goal, milestones: updatedMilestones, updatedAt: new Date() };
    });
    saveGoals(newGoals);
  };

  // Add feedback to a goal
  const addFeedback = (goalId: string, feedback: { content: string; author?: string; type?: "reflection" | "feedback" | "note" }) => {
    const newGoals = goals.map((goal) => {
      if (goal.id !== goalId) return goal;

      const newFeedback = {
        id: `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content: feedback.content,
        author: feedback.author || "self",
        date: new Date(),
        type: feedback.type || "note",
      };

      return {
        ...goal,
        feedback: [...goal.feedback, newFeedback],
        updatedAt: new Date(),
      };
    });
    saveGoals(newGoals);
  };

  // Update goal progress
  const updateProgress = (goalId: string, progress: number) => {
    const newGoals = goals.map((goal) =>
      goal.id === goalId
        ? { ...goal, progress: Math.min(100, Math.max(0, progress)), updatedAt: new Date() }
        : goal
    );
    saveGoals(newGoals);
  };

  return {
    goals,
    isLoaded,
    addGoal,
    updateGoal,
    deleteGoal,
    toggleSubgoal,
    toggleRequirement,
    toggleMilestone,
    addFeedback,
    updateProgress,
  };
};
