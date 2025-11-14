import { useMemo } from "react";
import AppLayout from "@/components/AppLayout";
import { GamificationDashboard } from "@/components/todo/GamificationDashboard";
import { ProgressChart } from "@/components/todo/ProgressChart";
import { useTodoStorage } from "@/hooks/useTodoStorage";
import { UserStats } from "@/types/todo";
import { calculateLevel, BADGES, checkBadgeEarned } from "@/lib/gamification";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy, TrendingUp, Target, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const TodoStats = () => {
  const navigate = useNavigate();
  const { tasks, settings, isLoaded } = useTodoStorage();

  // Calculate user stats from tasks
  const userStats: UserStats = useMemo(() => {
    if (!settings.userStats) {
      return {
        totalPoints: 0,
        level: 1,
        badges: BADGES.map(b => ({ ...b })),
        tasksCompleted: 0,
        currentStreak: 0,
        longestStreak: 0
      };
    }

    const completedTasks = tasks.filter(t => t.status === "completed");
    const totalPoints = completedTasks.reduce((sum, task) => sum + (task.points || 0), 0);
    const level = calculateLevel(totalPoints);

    // Calculate current streak
    let currentStreak = 0;
    let longestStreak = 0;

    tasks.forEach(task => {
      if (task.streak) {
        currentStreak = Math.max(currentStreak, task.streak.currentStreak);
        longestStreak = Math.max(longestStreak, task.streak.longestStreak);
      }
    });

    // Update badge progress
    const badges = BADGES.map(badge => {
      const earned = checkBadgeEarned(badge, {
        ...settings.userStats!,
        tasksCompleted: completedTasks.length,
        currentStreak,
        longestStreak,
        totalPoints
      }, tasks);

      return {
        ...badge,
        earnedAt: earned ? (badge.earnedAt || new Date()) : undefined,
        progress: badge.id.includes('task') ? completedTasks.length :
                 badge.id.includes('streak') ? currentStreak : undefined
      };
    });

    return {
      totalPoints,
      level,
      badges,
      tasksCompleted: completedTasks.length,
      currentStreak,
      longestStreak
    };
  }, [tasks, settings.userStats]);

  // Task statistics
  const taskStats = useMemo(() => {
    const completedTasks = tasks.filter(t => t.status === "completed");
    const completedWithTimer = completedTasks.filter(t => t.timeSpent && t.timeSpent > 0);
    const totalTimeSpent = tasks.reduce((sum, task) => sum + (task.timeSpent || 0), 0);

    const completedEarly = completedTasks.filter(t =>
      t.dueDate && t.completedAt && new Date(t.completedAt) < new Date(t.dueDate)
    ).length;

    const recurringTasks = tasks.filter(t => t.recurring?.enabled).length;

    return {
      totalTasks: tasks.length,
      completed: completedTasks.length,
      pending: tasks.filter(t => t.status === "pending").length,
      inProgress: tasks.filter(t => t.status === "in-progress").length,
      completedWithTimer: completedWithTimer.length,
      totalTimeSpent,
      averageTimePerTask: completedWithTimer.length > 0
        ? Math.round(totalTimeSpent / completedWithTimer.length)
        : 0,
      completedEarly,
      recurringTasks
    };
  }, [tasks]);

  // Apply background style - for AppLayout style prop
  const backgroundStyle = settings.backgroundType === "image" && settings.backgroundImage
    ? { backgroundImage: `url(${settings.backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center" }
    : {};

  if (!isLoaded) {
    return (
      <AppLayout title="Ultimate To-Do App">
        <p className="text-muted-foreground">Loading...</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Ultimate To-Do App"
      backgroundGradient={settings.backgroundType === "theme" ? settings.backgroundTheme : "default"}
      style={backgroundStyle}
      containerClassName="max-w-6xl"
      className="transition-all duration-300"
    >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex-1">
            <Button
              variant="ghost"
              onClick={() => navigate("/todo")}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tasks
            </Button>
            <h1 className="text-3xl font-bold mb-2">Statistics & Progress</h1>
            <p className="text-muted-foreground">
              Track your productivity, achievements, and progress over time
            </p>
          </div>
        </div>

        {settings.enableGamification && settings.userStats && (
          <div className="mb-6">
            <GamificationDashboard stats={userStats} />
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-bold">{taskStats.totalTasks}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Trophy className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{taskStats.completed}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">
                  {taskStats.totalTasks > 0
                    ? Math.round((taskStats.completed / taskStats.totalTasks) * 100)
                    : 0}%
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Early Completion</p>
                <p className="text-2xl font-bold">{taskStats.completedEarly}</p>
              </div>
            </div>
          </Card>
        </div>

        {tasks.length > 0 && (
          <div className="mb-6">
            <ProgressChart tasks={tasks} />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Time Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Time Tracked</span>
                <span className="font-medium">
                  {Math.floor(taskStats.totalTimeSpent / 60)}h {taskStats.totalTimeSpent % 60}m
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Tasks with Timer</span>
                <span className="font-medium">{taskStats.completedWithTimer}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Avg Time per Task</span>
                <span className="font-medium">{taskStats.averageTimePerTask}m</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Task Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Pending</span>
                <span className="font-medium text-yellow-600">{taskStats.pending}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">In Progress</span>
                <span className="font-medium text-blue-600">{taskStats.inProgress}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Recurring Tasks</span>
                <span className="font-medium text-purple-600">{taskStats.recurringTasks}</span>
              </div>
            </div>
          </Card>
        </div>
    </AppLayout>
  );
};

export default TodoStats;
