import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Sparkles } from "lucide-react";
import { UserLevel } from "@/types/fitness";
import { cn } from "@/lib/utils";

interface LevelProgressProps {
  level: UserLevel;
  className?: string;
}

export const LevelProgress = ({ level, className }: LevelProgressProps) => {
  const progress = (level.currentXP / level.xpToNextLevel) * 100;

  const getLevelTier = (lvl: number) => {
    if (lvl >= 80) return { name: "Legendary", color: "text-purple-500", bg: "bg-purple-500/10" };
    if (lvl >= 60) return { name: "Master", color: "text-yellow-500", bg: "bg-yellow-500/10" };
    if (lvl >= 40) return { name: "Expert", color: "text-orange-500", bg: "bg-orange-500/10" };
    if (lvl >= 20) return { name: "Advanced", color: "text-blue-500", bg: "bg-blue-500/10" };
    return { name: "Beginner", color: "text-green-500", bg: "bg-green-500/10" };
  };

  const tier = getLevelTier(level.currentLevel);

  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn("p-2 rounded-lg", tier.bg)}>
            <Trophy className={cn("w-5 h-5", tier.color)} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">Level {level.currentLevel}</h3>
              <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", tier.bg, tier.color)}>
                {tier.name}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {level.currentXP.toLocaleString()} / {level.xpToNextLevel.toLocaleString()} XP
            </p>
          </div>
        </div>

        <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
      </div>

      <Progress value={progress} className="h-3" />

      <div className="mt-2 text-xs text-muted-foreground text-center">
        {Math.round(level.xpToNextLevel - level.currentXP).toLocaleString()} XP to level {level.currentLevel + 1}
      </div>
    </Card>
  );
};
