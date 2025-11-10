import { Trophy, Star, TrendingUp, Award, Flame } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { UserStats } from "@/types/todo";
import { getNextLevelPoints } from "@/lib/gamification";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface GamificationDashboardProps {
  stats: UserStats;
}

export const GamificationDashboard = ({ stats }: GamificationDashboardProps) => {
  const nextLevelPoints = getNextLevelPoints(stats.level);
  const progressToNextLevel = (stats.totalPoints / nextLevelPoints) * 100;
  const earnedBadges = stats.badges.filter(b => b.earnedAt);
  const unearnedBadges = stats.badges.filter(b => !b.earnedAt);

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold">
            {stats.level}
          </div>
          <div>
            <h3 className="font-bold text-xl">Level {stats.level}</h3>
            <p className="text-sm text-muted-foreground">
              {stats.totalPoints} / {nextLevelPoints} XP
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <Tooltip>
            <TooltipTrigger>
              <div className="text-center">
                <div className="flex items-center gap-1 text-orange-500">
                  <Flame className="h-5 w-5" />
                  <span className="font-bold text-lg">{stats.currentStreak}</span>
                </div>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Current streak: {stats.currentStreak} days</p>
              <p>Longest streak: {stats.longestStreak} days</p>
            </TooltipContent>
          </Tooltip>

          <div className="text-center">
            <div className="flex items-center gap-1 text-blue-500">
              <Trophy className="h-5 w-5" />
              <span className="font-bold text-lg">{earnedBadges.length}</span>
            </div>
            <p className="text-xs text-muted-foreground">Badges</p>
          </div>

          <div className="text-center">
            <div className="flex items-center gap-1 text-green-500">
              <Star className="h-5 w-5" />
              <span className="font-bold text-lg">{stats.tasksCompleted}</span>
            </div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-6">
        <div className="flex justify-between text-sm">
          <span>Progress to Level {stats.level + 1}</span>
          <span className="font-medium">{Math.round(progressToNextLevel)}%</span>
        </div>
        <Progress value={progressToNextLevel} className="h-3" />
      </div>

      {earnedBadges.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <Award className="h-4 w-4" />
            Recent Badges
          </h4>
          <div className="flex flex-wrap gap-2">
            {earnedBadges.slice(-6).map((badge) => (
              <Tooltip key={badge.id}>
                <TooltipTrigger>
                  <Badge
                    variant="secondary"
                    className="text-lg px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700"
                  >
                    {badge.icon}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-semibold">{badge.name}</p>
                  <p className="text-sm">{badge.description}</p>
                  {badge.earnedAt && (
                    <p className="text-xs text-muted-foreground">
                      Earned: {new Date(badge.earnedAt).toLocaleDateString()}
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
      )}

      {unearnedBadges.length > 0 && (
        <div className="space-y-3 mt-4">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Available Badges
          </h4>
          <div className="flex flex-wrap gap-2">
            {unearnedBadges.slice(0, 6).map((badge) => (
              <Tooltip key={badge.id}>
                <TooltipTrigger>
                  <Badge
                    variant="outline"
                    className="text-lg px-3 py-1 opacity-50 hover:opacity-100 transition-opacity"
                  >
                    {badge.icon}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-semibold">{badge.name}</p>
                  <p className="text-sm">{badge.description}</p>
                  {badge.progress !== undefined && (
                    <p className="text-xs text-muted-foreground">
                      Progress: {badge.progress}/{badge.requirement}
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
