import { Card } from "@/components/ui/card";
import { Flame, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { Streak } from "@/types/fitness";

interface StreakDisplayProps {
  streak: Streak;
  title: string;
  className?: string;
}

export const StreakDisplay = ({ streak, title, className }: StreakDisplayProps) => {
  const getStreakColor = (days: number) => {
    if (days >= 30) return "text-purple-500";
    if (days >= 14) return "text-orange-500";
    if (days >= 7) return "text-yellow-500";
    return "text-blue-500";
  };

  const getStreakGlow = (days: number) => {
    if (days >= 30) return "shadow-purple-500/50";
    if (days >= 14) return "shadow-orange-500/50";
    if (days >= 7) return "shadow-yellow-500/50";
    return "shadow-blue-500/50";
  };

  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <div className="flex items-center gap-2">
            <Flame
              className={cn(
                "w-8 h-8",
                getStreakColor(streak.currentStreak),
                streak.currentStreak > 0 && "animate-pulse"
              )}
            />
            <div>
              <div className="text-2xl font-bold">
                {streak.currentStreak} {streak.currentStreak === 1 ? "day" : "days"}
              </div>
              {streak.longestStreak > 0 && (
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  Best: {streak.longestStreak} days
                </div>
              )}
            </div>
          </div>
        </div>

        {streak.currentStreak >= 7 && (
          <div
            className={cn(
              "px-3 py-1 rounded-full text-xs font-semibold",
              "bg-gradient-to-r from-orange-500 to-pink-500 text-white",
              "shadow-lg",
              getStreakGlow(streak.currentStreak)
            )}
          >
            {streak.currentStreak >= 30 && "Legendary"}
            {streak.currentStreak >= 14 && streak.currentStreak < 30 && "On Fire!"}
            {streak.currentStreak >= 7 && streak.currentStreak < 14 && "Hot Streak"}
          </div>
        )}
      </div>
    </Card>
  );
};
