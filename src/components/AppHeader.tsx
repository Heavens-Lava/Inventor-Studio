import { ArrowLeft, TrendingUp, Trophy, Star, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useGamification } from "@/hooks/useGamification";
import { ACHIEVEMENTS } from "@/types/gamification";

interface AppHeaderProps {
  title: string;
}

const AppHeader = ({ title }: AppHeaderProps) => {
  const navigate = useNavigate();
  const { profile, levelProgress, isLoaded } = useGamification();

  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="hover:bg-primary/10 hover:text-primary flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground truncate">{title}</h1>
          </div>

          {/* Gamification Display */}
          {true && (
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 px-2 sm:px-4 hover:bg-primary/10 hover:border-primary/50 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-xs sm:text-sm font-bold bg-gradient-to-r from-primary/20 to-primary/10"
                    >
                      <Zap className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-primary" />
                      Lv {profile.level}
                    </Badge>
                  </div>
                  <div className="hidden sm:flex items-center gap-1">
                    <span className="text-sm font-semibold text-primary">
                      {profile.totalXP}
                    </span>
                    <span className="text-xs text-muted-foreground">XP</span>
                  </div>
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader className="space-y-3">
                  <SheetTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    Your Progress
                  </SheetTitle>
                  <SheetDescription>
                    Track your productivity journey across all apps
                  </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                  {/* Level Progress Card */}
                  <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Current Level</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="default" className="text-lg font-bold px-3 py-1">
                              Level {levelProgress.currentLevel}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Total XP</p>
                          <p className="text-2xl font-bold text-primary mt-1">
                            {profile.totalXP}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Progress to Level {levelProgress.nextLevel}</span>
                          <span className="font-semibold">{Math.round(levelProgress.progressPercentage)}%</span>
                        </div>
                        <Progress value={levelProgress.progressPercentage} className="h-3" />
                        <p className="text-xs text-muted-foreground text-center">
                          {levelProgress.xpToNextLevel} XP until next level
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Separator />

                  {/* Stats Grid */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Your Statistics
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <Card className="p-3 bg-secondary/50">
                        <p className="text-xs text-muted-foreground mb-1">Tasks Completed</p>
                        <p className="text-2xl font-bold text-blue-600">{profile.stats.tasksCompleted}</p>
                      </Card>
                      <Card className="p-3 bg-secondary/50">
                        <p className="text-xs text-muted-foreground mb-1">Habits Done</p>
                        <p className="text-2xl font-bold text-green-600">{profile.stats.habitsCompleted}</p>
                      </Card>
                      <Card className="p-3 bg-secondary/50">
                        <p className="text-xs text-muted-foreground mb-1">Goals Achieved</p>
                        <p className="text-2xl font-bold text-purple-600">{profile.stats.goalsCompleted}</p>
                      </Card>
                      <Card className="p-3 bg-secondary/50">
                        <p className="text-xs text-muted-foreground mb-1">Journal Entries</p>
                        <p className="text-2xl font-bold text-amber-600">{profile.stats.journalEntriesWritten}</p>
                      </Card>
                      {profile.stats.expensesTracked > 0 && (
                        <Card className="p-3 bg-secondary/50">
                          <p className="text-xs text-muted-foreground mb-1">Expenses Tracked</p>
                          <p className="text-2xl font-bold text-red-600">{profile.stats.expensesTracked}</p>
                        </Card>
                      )}
                      {profile.stats.budgetsCreated > 0 && (
                        <Card className="p-3 bg-secondary/50">
                          <p className="text-xs text-muted-foreground mb-1">Budgets Created</p>
                          <p className="text-2xl font-bold text-teal-600">{profile.stats.budgetsCreated}</p>
                        </Card>
                      )}
                      {profile.stats.ideasCreated > 0 && (
                        <Card className="p-3 bg-secondary/50">
                          <p className="text-xs text-muted-foreground mb-1">Ideas Created</p>
                          <p className="text-2xl font-bold text-pink-600">{profile.stats.ideasCreated}</p>
                        </Card>
                      )}
                      {profile.stats.milestonesReached > 0 && (
                        <Card className="p-3 bg-secondary/50">
                          <p className="text-xs text-muted-foreground mb-1">Milestones</p>
                          <p className="text-2xl font-bold text-orange-600">{profile.stats.milestonesReached}</p>
                        </Card>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Achievements Section */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <Star className="h-4 w-4 text-amber-500" />
                        Achievements
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {profile.badges.length} / {ACHIEVEMENTS.length}
                      </Badge>
                    </div>

                    {profile.achievements.length > 0 ? (
                      <div className="space-y-2">
                        {profile.achievements.map((achievement) => (
                          <Card
                            key={achievement.id}
                            className="p-3 bg-gradient-to-r from-amber-50/50 to-transparent dark:from-amber-950/20 border-amber-200/50 dark:border-amber-800/30"
                          >
                            <div className="flex items-start gap-3">
                              <div className="text-2xl">{achievement.icon}</div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm">{achievement.name}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {achievement.description}
                                </p>
                                <Badge variant="outline" className="mt-2 text-xs">
                                  +{achievement.xpReward} XP
                                </Badge>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card className="p-6 text-center bg-secondary/30">
                        <Trophy className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground">
                          Start completing tasks to unlock achievements!
                        </p>
                      </Card>
                    )}

                    {/* Locked Achievements Preview */}
                    {profile.badges.length < ACHIEVEMENTS.length && (
                      <div className="mt-4">
                        <p className="text-xs text-muted-foreground mb-2">Upcoming Achievements:</p>
                        <div className="space-y-2">
                          {ACHIEVEMENTS
                            .filter(a => !profile.badges.includes(a.id))
                            .slice(0, 3)
                            .map((achievement) => (
                              <Card
                                key={achievement.id}
                                className="p-2 bg-secondary/30 opacity-60"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="text-lg opacity-50">{achievement.icon}</div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-xs">{achievement.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {achievement.description}
                                    </p>
                                  </div>
                                  <Badge variant="outline" className="text-xs flex-shrink-0">
                                    🔒 +{achievement.xpReward} XP
                                  </Badge>
                                </div>
                              </Card>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* XP Rewards Guide */}
                  <Card className="p-4 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/30">
                    <h4 className="text-sm font-semibold mb-2 text-blue-900 dark:text-blue-100">
                      💡 How to Earn XP
                    </h4>
                    <div className="space-y-1 text-xs text-blue-700 dark:text-blue-300">
                      <p>• Complete tasks: 5-25 XP</p>
                      <p>• Finish habits: 15 XP + streak bonuses</p>
                      <p>• Reach milestones: 25 XP</p>
                      <p>• Complete goals: 100 XP</p>
                      <p>• Track expenses: 3 XP each</p>
                      <p>• Create budgets: 15 XP</p>
                      <p>• Write journal entries: 10 XP</p>
                      <p>• Create ideas: 5 XP</p>
                    </div>
                  </Card>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
