import { CheckSquare, Wallet, Lightbulb, Target, BookOpen, Calendar, TrendingUp, DollarSign, PiggyBank, Activity, Sparkles, Zap } from "lucide-react";
import AppCard from "@/components/AppCard";

const Index = () => {
  const apps = [
    {
      title: "To-Do",
      description: "Organize your tasks and boost productivity with smart task management",
      icon: CheckSquare,
      route: "/todo",
      gradient: "bg-gradient-to-br from-blue-500 to-blue-600",
    },
    {
      title: "Calendar",
      description: "Plan your schedule, manage events, and stay organized with your calendar",
      icon: Calendar,
      route: "/calendar",
      gradient: "bg-gradient-to-br from-purple-500 to-purple-600",
    },
    {
      title: "Finance",
      description: "Track expenses, manage budgets, and visualize your financial health",
      icon: Wallet,
      route: "/finance",
      gradient: "bg-gradient-to-br from-emerald-500 to-emerald-600",
    },
    {
      title: "Ideas",
      description: "Capture, develop, and organize your creative thoughts and innovations",
      icon: Lightbulb,
      route: "/ideas",
      gradient: "bg-gradient-to-br from-amber-500 to-amber-600",
    },
    {
      title: "Goals",
      description: "Plan your journey and track progress towards your aspirations",
      icon: Target,
      route: "/goals",
      gradient: "bg-gradient-to-br from-rose-500 to-rose-600",
    },
    {
      title: "Journal",
      description: "Reflect on your day and document your personal growth journey",
      icon: BookOpen,
      route: "/journal",
      gradient: "bg-gradient-to-br from-indigo-500 to-indigo-600",
    },
    {
      title: "Habits",
      description: "Build positive routines and track your daily habit streaks",
      icon: TrendingUp,
      route: "/habits",
      gradient: "bg-gradient-to-br from-teal-500 to-teal-600",
    },
    {
      title: "Expenses",
      description: "Track daily spending, analyze trends, and discover savings opportunities",
      icon: DollarSign,
      route: "/expenses",
      gradient: "bg-gradient-to-br from-red-500 to-red-600",
    },
    {
      title: "Budgets",
      description: "Set spending limits, monitor budgets, and stay financially on track",
      icon: Wallet,
      route: "/budgets",
      gradient: "bg-gradient-to-br from-cyan-500 to-cyan-600",
    },
    {
      title: "Savings",
      description: "Build toward your financial goals and track savings progress",
      icon: PiggyBank,
      route: "/savings",
      gradient: "bg-gradient-to-br from-pink-500 to-pink-600",
    },
    {
      title: "Fitness Tracker",
      description: "Track workouts, nutrition, wellness with gamification and achievements",
      icon: Activity,
      route: "/fitness",
      gradient: "bg-gradient-to-br from-orange-500 to-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-slate-900 dark:to-gray-900">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Header */}
      <header className="relative border-b border-slate-200/50 dark:border-slate-800/50 backdrop-blur-sm bg-white/30 dark:bg-gray-900/30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Inventor Studio
            </h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20 md:py-28 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-lg">
              <Zap className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Your Complete Productivity Ecosystem
              </span>
            </div>

            <h2 className="text-5xl md:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-slate-100 dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
                Create. Organize.
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Achieve More.
              </span>
            </h2>

            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Everything you need to organize your life, track your progress, and unlock your full potential — all in one place.
            </p>

            <div className="flex items-center justify-center gap-6 pt-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{apps.length}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Powerful Apps</div>
              </div>
              <div className="h-12 w-px bg-slate-300 dark:bg-slate-700" />
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600">∞</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Possibilities</div>
              </div>
              <div className="h-12 w-px bg-slate-300 dark:bg-slate-700" />
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">100%</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Free</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Apps Grid */}
      <section className="relative container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            Choose Your Tool
          </h3>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Select an app to get started on your productivity journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {apps.map((app) => (
            <AppCard key={app.title} {...app} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-slate-200/50 dark:border-slate-800/50 backdrop-blur-sm bg-white/30 dark:bg-gray-900/30 mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Inventor Studio
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              Empowering creators, dreamers, and doers to bring their ideas to life.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500">
              Built with passion for productivity
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
