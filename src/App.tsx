import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TodoApp from "./pages/TodoApp";
import TodoStats from "./pages/TodoStats";
import CalendarApp from "./pages/CalendarApp";
import FinanceApp from "./pages/FinanceApp";
import IdeaMaker from "./pages/IdeaMaker";
import GoalsRoadmap from "./pages/GoalsRoadmap";
import CreateGoal from "./pages/CreateGoal";
import EditGoal from "./pages/EditGoal";
import GoalMapCanvas from "./pages/GoalMapCanvas";
import JournalApp from "./pages/JournalApp";
import HabitsApp from "./pages/HabitsApp";
import ExpenseApp from "./pages/ExpenseApp";
import BudgetApp from "./pages/BudgetApp";
import CreateBudget from "./pages/CreateBudget";
import EditBudget from "./pages/EditBudget";
import SavingsApp from "./pages/SavingsApp";
import CreateSavings from "./pages/CreateSavings";
import EditSavings from "./pages/EditSavings";
import FitnessApp from "./pages/FitnessApp";
import WorkoutTracker from "./pages/WorkoutTracker";
import NutritionTracker from "./pages/NutritionTracker";
import FitnessAchievements from "./pages/FitnessAchievements";
import FitnessWellness from "./pages/FitnessWellness";
import ActivityTracker from "./pages/ActivityTracker";
import FitnessGoals from "./pages/FitnessGoals";
import NotesApp from "./pages/NotesApp";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/todo" element={<TodoApp />} />
          <Route path="/todo/stats" element={<TodoStats />} />
          <Route path="/calendar" element={<CalendarApp />} />
          <Route path="/finance" element={<FinanceApp />} />
          <Route path="/ideas" element={<IdeaMaker />} />
          <Route path="/goals" element={<GoalsRoadmap />} />
          <Route path="/goals/create" element={<CreateGoal />} />
          <Route path="/goals/map" element={<GoalMapCanvas />} />
          <Route path="/goals/:goalId/edit" element={<EditGoal />} />
          <Route path="/journal" element={<JournalApp />} />
          <Route path="/habits" element={<HabitsApp />} />
          <Route path="/expenses" element={<ExpenseApp />} />
          <Route path="/budgets" element={<BudgetApp />} />
          <Route path="/budgets/create" element={<CreateBudget />} />
          <Route path="/budgets/:budgetId/edit" element={<EditBudget />} />
          <Route path="/savings" element={<SavingsApp />} />
          <Route path="/savings/create" element={<CreateSavings />} />
          <Route path="/savings/:savingsId/edit" element={<EditSavings />} />
          <Route path="/fitness" element={<FitnessApp />} />
          <Route path="/fitness/activity" element={<ActivityTracker />} />
          <Route path="/fitness/workout" element={<WorkoutTracker />} />
          <Route path="/fitness/nutrition" element={<NutritionTracker />} />
          <Route path="/fitness/wellness" element={<FitnessWellness />} />
          <Route path="/fitness/goals" element={<FitnessGoals />} />
          <Route
            path="/fitness/achievements"
            element={<FitnessAchievements />}
          />
          <Route path="/notes" element={<NotesApp />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
