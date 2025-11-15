import { useState } from "react";
import { Search, ArrowLeft, CheckSquare, Wallet, Lightbulb, Target, BookOpen, Calendar, TrendingUp, DollarSign, PiggyBank, Activity, StickyNote } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import AppCard from "@/components/AppCard";

export default function AppsExplorer() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const apps = [
    {
      title: "To-Do",
      description: "Organize your tasks and boost productivity with smart task management",
      icon: CheckSquare,
      route: "/todo",
      gradient: "bg-gradient-to-br from-blue-500 to-blue-600",
      category: "productivity",
    },
    {
      title: "Calendar",
      description: "Plan your schedule, manage events, and stay organized with your calendar",
      icon: Calendar,
      route: "/calendar",
      gradient: "bg-gradient-to-br from-purple-500 to-purple-600",
      category: "productivity",
    },
    {
      title: "Finance",
      description: "Track expenses, manage budgets, and visualize your financial health",
      icon: Wallet,
      route: "/finance",
      gradient: "bg-gradient-to-br from-emerald-500 to-emerald-600",
      category: "finance",
    },
    {
      title: "Ideas",
      description: "Capture, develop, and organize your creative thoughts and innovations",
      icon: Lightbulb,
      route: "/ideas",
      gradient: "bg-gradient-to-br from-amber-500 to-amber-600",
      category: "creativity",
    },
    {
      title: "Goals",
      description: "Plan your journey and track progress towards your aspirations",
      icon: Target,
      route: "/goals",
      gradient: "bg-gradient-to-br from-rose-500 to-rose-600",
      category: "productivity",
    },
    {
      title: "Journal",
      description: "Reflect on your day and document your personal growth journey",
      icon: BookOpen,
      route: "/journal",
      gradient: "bg-gradient-to-br from-indigo-500 to-indigo-600",
      category: "personal",
    },
    {
      title: "Habits",
      description: "Build positive routines and track your daily habit streaks",
      icon: TrendingUp,
      route: "/habits",
      gradient: "bg-gradient-to-br from-teal-500 to-teal-600",
      category: "personal",
    },
    {
      title: "Expenses",
      description: "Track daily spending, analyze trends, and discover savings opportunities",
      icon: DollarSign,
      route: "/expenses",
      gradient: "bg-gradient-to-br from-red-500 to-red-600",
      category: "finance",
    },
    {
      title: "Budgets",
      description: "Set spending limits, monitor budgets, and stay financially on track",
      icon: Wallet,
      route: "/budgets",
      gradient: "bg-gradient-to-br from-cyan-500 to-cyan-600",
      category: "finance",
    },
    {
      title: "Savings",
      description: "Build toward your financial goals and track savings progress",
      icon: PiggyBank,
      route: "/savings",
      gradient: "bg-gradient-to-br from-pink-500 to-pink-600",
      category: "finance",
    },
    {
      title: "Fitness Tracker",
      description: "Track workouts, nutrition, wellness with gamification and achievements",
      icon: Activity,
      route: "/fitness",
      gradient: "bg-gradient-to-br from-orange-500 to-orange-600",
      category: "health",
    },
    {
      title: "Notes",
      description: "Advanced note-taking with rich editing, drawing, voice input, and more",
      icon: StickyNote,
      route: "/notes",
      gradient: "bg-gradient-to-br from-yellow-500 to-yellow-600",
      category: "productivity",
    },
  ];

  const filteredApps = apps.filter(
    (app) =>
      app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <div className="relative z-10 container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate('/')} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button onClick={() => navigate('/signup')}>
              Sign Up
            </Button>
          </div>
        </div>

        {/* Search Section */}
        <div className="max-w-2xl mx-auto mb-12">
          <h1 className="text-5xl font-bold text-center mb-4">
            Explore <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Apps</span>
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Discover powerful tools to organize your life and boost productivity
          </p>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search apps by name, description, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-500"
            />
          </div>

          {searchQuery && (
            <p className="text-sm text-gray-600 mt-3">
              Found {filteredApps.length} app{filteredApps.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Apps Grid */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto pb-16">
          {filteredApps.length > 0 ? (
            filteredApps.map((app) => (
              <AppCard
                key={app.title}
                title={app.title}
                description={app.description}
                icon={app.icon}
                route={app.route}
                gradient={app.gradient}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <p className="text-gray-500 text-lg">No apps found matching "{searchQuery}"</p>
              <Button
                variant="outline"
                onClick={() => setSearchQuery("")}
                className="mt-4"
              >
                Clear Search
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
