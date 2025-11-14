import { CheckSquare, Wallet, Lightbulb, Target, BookOpen, Calendar, TrendingUp, DollarSign, PiggyBank, TrendingDown } from "lucide-react";
import AppCard from "@/components/AppCard";
import AppHeader from "@/components/AppHeader";

const Index = () => {
  const apps = [
    {
      title: "To-Do",
      description: "Organize your tasks and boost productivity with smart task management",
      icon: CheckSquare,
      route: "/todo",
      gradient: "bg-gradient-primary",
    },
    {
      title: "Calendar",
      description: "Plan your schedule, manage events, and stay organized with your calendar",
      icon: Calendar,
      route: "/calendar",
      gradient: "bg-secondary",
    },
    {
      title: "Finance",
      description: "Track expenses, manage budgets, and visualize your financial health",
      icon: Wallet,
      route: "/finance",
      gradient: "bg-accent",
    },
    {
      title: "Ideas",
      description: "Capture, develop, and organize your creative thoughts and innovations",
      icon: Lightbulb,
      route: "/ideas",
      gradient: "bg-gradient-primary",
    },
    {
      title: "Goals",
      description: "Plan your journey and track progress towards your aspirations",
      icon: Target,
      route: "/goals",
      gradient: "bg-secondary",
    },
    {
      title: "Journal",
      description: "Reflect on your day and document your personal growth journey",
      icon: BookOpen,
      route: "/journal",
      gradient: "bg-accent",
    },
    {
      title: "Habits",
      description: "Build positive routines and track your daily habit streaks",
      icon: TrendingUp,
      route: "/habits",
      gradient: "bg-gradient-primary",
    },
    {
      title: "Expenses",
      description: "Track daily spending, analyze trends, and discover savings opportunities",
      icon: DollarSign,
      route: "/expenses",
      gradient: "bg-secondary",
    },
    {
      title: "Budgets",
      description: "Set spending limits, monitor budgets, and stay financially on track",
      icon: Wallet,
      route: "/budgets",
      gradient: "bg-accent",
    },
    {
      title: "Savings",
      description: "Build toward your financial goals and track savings progress",
      icon: PiggyBank,
      route: "/savings",
      gradient: "bg-gradient-primary",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Daily Haven Suite" />
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10" />
        <div className="container mx-auto px-4 py-16 relative">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Your Personal App Suite
            </h1>
            <p className="text-xl text-muted-foreground">
              Everything you need to organize your life, achieve your goals, and unlock your potential
            </p>
          </div>
        </div>
      </section>

      {/* Apps Grid */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {apps.map((app) => (
            <AppCard key={app.title} {...app} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-12">
        <p className="text-center text-sm text-muted-foreground">
          Your journey to productivity starts here
        </p>
      </footer>
    </div>
  );
};

export default Index;
