import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Achievement } from "@/types/fitness";
import { Award, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface BadgeDisplayProps {
  achievement: Achievement;
  size?: "sm" | "md" | "lg";
  showProgress?: boolean;
  className?: string;
}

export const BadgeDisplay = ({
  achievement,
  size = "md",
  showProgress = false,
  className,
}: BadgeDisplayProps) => {
  const isUnlocked = !!achievement.unlockedAt;

  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };

  const getTierColor = (tier: Achievement["tier"]) => {
    switch (tier) {
      case "bronze":
        return "from-orange-700 to-orange-500";
      case "silver":
        return "from-gray-400 to-gray-300";
      case "gold":
        return "from-yellow-500 to-yellow-300";
      case "platinum":
        return "from-purple-500 to-pink-500";
    }
  };

  const getTierBorder = (tier: Achievement["tier"]) => {
    switch (tier) {
      case "bronze":
        return "border-orange-500";
      case "silver":
        return "border-gray-400";
      case "gold":
        return "border-yellow-500";
      case "platinum":
        return "border-purple-500";
    }
  };

  return (
    <div className={cn("relative group", className)}>
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full border-4",
          sizeClasses[size],
          isUnlocked
            ? cn("bg-gradient-to-br", getTierColor(achievement.tier), getTierBorder(achievement.tier))
            : "bg-gray-200 border-gray-300 opacity-50"
        )}
      >
        {isUnlocked ? (
          <Award className={cn("text-white", size === "sm" ? "w-6 h-6" : size === "md" ? "w-8 h-8" : "w-12 h-12")} />
        ) : (
          <Lock className={cn("text-gray-500", size === "sm" ? "w-6 h-6" : size === "md" ? "w-8 h-8" : "w-12 h-12")} />
        )}

        {!isUnlocked && showProgress && achievement.progress !== undefined && (
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-white rounded-full px-2 py-0.5 border border-gray-300">
            <span className="text-xs font-medium">
              {Math.round((achievement.progress / achievement.requirement) * 100)}%
            </span>
          </div>
        )}
      </div>

      {/* Tooltip on hover */}
      <Card className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-3 w-48 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
        <div className="text-center">
          <div className="font-semibold text-sm mb-1">{achievement.name}</div>
          <div className="text-xs text-muted-foreground mb-2">{achievement.description}</div>
          <Badge variant="secondary" className="text-xs">
            {achievement.xpReward} XP
          </Badge>
          {!isUnlocked && achievement.progress !== undefined && (
            <div className="mt-2 text-xs">
              Progress: {achievement.progress} / {achievement.requirement}
            </div>
          )}
          {isUnlocked && achievement.unlockedAt && (
            <div className="mt-2 text-xs text-green-600 font-medium">
              Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
