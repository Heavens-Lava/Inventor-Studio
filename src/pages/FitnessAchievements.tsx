import { useNavigate } from "react-router-dom";
import { useFitnessData } from "@/hooks/useFitnessData";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LevelProgress } from "@/components/fitness/LevelProgress";
import { BadgeDisplay } from "@/components/fitness/BadgeDisplay";
import { Achievement } from "@/types/fitness";
import {
  ArrowLeft,
  Trophy,
  Award,
  Star,
  Sparkles,
  TrendingUp,
  Lock,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Sample achievements database
const allAchievements: Achievement[] = [
  // Workout Achievements
  {
    id: "first_workout",
    name: "First Steps",
    description: "Complete your first workout",
    icon: "dumbbell",
    category: "workout",
    tier: "bronze",
    xpReward: 50,
    requirement: 1,
  },
  {
    id: "10_workouts",
    name: "Getting Started",
    description: "Complete 10 workouts",
    icon: "dumbbell",
    category: "workout",
    tier: "silver",
    xpReward: 100,
    requirement: 10,
  },
  {
    id: "50_workouts",
    name: "Fitness Enthusiast",
    description: "Complete 50 workouts",
    icon: "dumbbell",
    category: "workout",
    tier: "gold",
    xpReward: 250,
    requirement: 50,
  },
  {
    id: "100_workouts",
    name: "Workout Warrior",
    description: "Complete 100 workouts",
    icon: "dumbbell",
    category: "workout",
    tier: "platinum",
    xpReward: 500,
    requirement: 100,
  },

  // Streak Achievements
  {
    id: "3_day_streak",
    name: "On a Roll",
    description: "Maintain a 3-day workout streak",
    icon: "flame",
    category: "streak",
    tier: "bronze",
    xpReward: 50,
    requirement: 3,
  },
  {
    id: "7_day_streak",
    name: "Week Warrior",
    description: "Maintain a 7-day workout streak",
    icon: "flame",
    category: "streak",
    tier: "silver",
    xpReward: 150,
    requirement: 7,
  },
  {
    id: "30_day_streak",
    name: "Consistency King",
    description: "Maintain a 30-day workout streak",
    icon: "flame",
    category: "streak",
    tier: "gold",
    xpReward: 300,
    requirement: 30,
  },
  {
    id: "100_day_streak",
    name: "Legendary Streak",
    description: "Maintain a 100-day workout streak",
    icon: "flame",
    category: "streak",
    tier: "platinum",
    xpReward: 1000,
    requirement: 100,
  },

  // Activity Achievements
  {
    id: "10k_steps",
    name: "Step Master",
    description: "Reach 10,000 steps in a day",
    icon: "footsteps",
    category: "activity",
    tier: "bronze",
    xpReward: 50,
    requirement: 1,
  },
  {
    id: "10k_steps_week",
    name: "Walking Champion",
    description: "Reach 10,000 steps for 7 consecutive days",
    icon: "footsteps",
    category: "activity",
    tier: "silver",
    xpReward: 150,
    requirement: 7,
  },
  {
    id: "marathon_distance",
    name: "Marathon Runner",
    description: "Walk or run a cumulative 42.2 km",
    icon: "runner",
    category: "activity",
    tier: "gold",
    xpReward: 300,
    requirement: 42200,
  },

  // Nutrition Achievements
  {
    id: "hydration_hero",
    name: "Hydration Hero",
    description: "Meet your water goal for 7 consecutive days",
    icon: "droplet",
    category: "nutrition",
    tier: "bronze",
    xpReward: 100,
    requirement: 7,
  },
  {
    id: "macro_master",
    name: "Macro Master",
    description: "Hit all macro goals in a single day",
    icon: "chart",
    category: "nutrition",
    tier: "silver",
    xpReward: 150,
    requirement: 1,
  },
  {
    id: "calorie_tracker",
    name: "Calorie Conscious",
    description: "Log meals for 30 consecutive days",
    icon: "apple",
    category: "nutrition",
    tier: "gold",
    xpReward: 250,
    requirement: 30,
  },

  // Health Achievements
  {
    id: "sleep_champion",
    name: "Sleep Champion",
    description: "Get 8+ hours of sleep for 7 consecutive days",
    icon: "moon",
    category: "health",
    tier: "silver",
    xpReward: 150,
    requirement: 7,
  },
  {
    id: "weight_goal",
    name: "Goal Crusher",
    description: "Reach your weight goal",
    icon: "target",
    category: "health",
    tier: "gold",
    xpReward: 500,
    requirement: 1,
  },

  // Special Achievements
  {
    id: "early_adopter",
    name: "Early Adopter",
    description: "Start your fitness journey",
    icon: "star",
    category: "special",
    tier: "bronze",
    xpReward: 25,
    requirement: 1,
  },
  {
    id: "data_enthusiast",
    name: "Data Enthusiast",
    description: "Log all metrics in a single day",
    icon: "chart",
    category: "special",
    tier: "silver",
    xpReward: 100,
    requirement: 1,
  },
  {
    id: "overachiever",
    name: "Overachiever",
    description: "Exceed all daily goals in one day",
    icon: "sparkles",
    category: "special",
    tier: "gold",
    xpReward: 200,
    requirement: 1,
  },
];

export default function FitnessAchievements() {
  const navigate = useNavigate();
  const { data } = useFitnessData();

  // Calculate progress for locked achievements
  const achievementsWithProgress = allAchievements.map((achievement) => {
    const unlocked = data.achievements.find((a) => a.id === achievement.id);

    if (unlocked) {
      return { ...achievement, ...unlocked };
    }

    // Calculate progress based on achievement type
    let progress = 0;
    switch (achievement.id) {
      case "first_workout":
      case "10_workouts":
      case "50_workouts":
      case "100_workouts":
        progress = data.workouts.length;
        break;
      case "3_day_streak":
      case "7_day_streak":
      case "30_day_streak":
      case "100_day_streak":
        progress = data.streaks.workout?.currentStreak || 0;
        break;
      // Add more progress calculations as needed
      default:
        progress = 0;
    }

    return { ...achievement, progress };
  });

  const unlockedAchievements = achievementsWithProgress.filter((a) => a.unlockedAt);
  const lockedAchievements = achievementsWithProgress.filter((a) => !a.unlockedAt);

  const achievementsByCategory = {
    workout: achievementsWithProgress.filter((a) => a.category === "workout"),
    streak: achievementsWithProgress.filter((a) => a.category === "streak"),
    activity: achievementsWithProgress.filter((a) => a.category === "activity"),
    nutrition: achievementsWithProgress.filter((a) => a.category === "nutrition"),
    health: achievementsWithProgress.filter((a) => a.category === "health"),
    special: achievementsWithProgress.filter((a) => a.category === "special"),
  };

  const totalXPFromAchievements = unlockedAchievements.reduce(
    (sum, a) => sum + a.xpReward,
    0
  );

  const completionPercentage = Math.round(
    (unlockedAchievements.length / allAchievements.length) * 100
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/fitness")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  Achievements
                </h1>
                <p className="text-sm text-muted-foreground">
                  {unlockedAchievements.length} / {allAchievements.length} unlocked
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 pb-24 md:pb-6">
        {/* Level Progress */}
        <LevelProgress level={data.user.level} />

        {/* Achievement Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900">
                <Trophy className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{unlockedAchievements.length}</div>
                <div className="text-sm text-muted-foreground">Achievements Unlocked</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalXPFromAchievements.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total XP Earned</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{completionPercentage}%</div>
                <div className="text-sm text-muted-foreground">Completion Rate</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Overall Progress */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Overall Progress</h3>
            <span className="text-sm text-muted-foreground">
              {unlockedAchievements.length} / {allAchievements.length}
            </span>
          </div>
          <Progress value={completionPercentage} className="h-3" />
        </Card>

        {/* Achievement Categories */}
        <Card className="p-6">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="workout">Workout</TabsTrigger>
              <TabsTrigger value="streak">Streak</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
              <TabsTrigger value="health">Health</TabsTrigger>
              <TabsTrigger value="special">Special</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <div className="space-y-6">
                {/* Unlocked Section */}
                {unlockedAchievements.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5 text-yellow-500" />
                      Unlocked ({unlockedAchievements.length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {unlockedAchievements.map((achievement) => (
                        <BadgeDisplay
                          key={achievement.id}
                          achievement={achievement}
                          size="md"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Locked Section */}
                {lockedAchievements.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Lock className="w-5 h-5 text-gray-400" />
                      Locked ({lockedAchievements.length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {lockedAchievements.map((achievement) => (
                        <BadgeDisplay
                          key={achievement.id}
                          achievement={achievement}
                          size="md"
                          showProgress={true}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {Object.entries(achievementsByCategory).map(([category, achievements]) => (
              <TabsContent key={category} value={category} className="mt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {achievements.map((achievement) => (
                    <BadgeDisplay
                      key={achievement.id}
                      achievement={achievement}
                      size="md"
                      showProgress={!achievement.unlockedAt}
                    />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </Card>

        {/* Motivational Message */}
        {lockedAchievements.length > 0 && (
          <Card className="p-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8" />
              <div>
                <h3 className="font-semibold text-lg">Keep Going!</h3>
                <p className="text-sm opacity-90">
                  You have {lockedAchievements.length} more achievements to unlock.
                  Stay consistent and reach your goals!
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
