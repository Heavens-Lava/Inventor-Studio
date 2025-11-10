import { useState } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HabitSettings as HabitSettingsType } from "@/types/habit";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface HabitSettingsProps {
  settings: HabitSettingsType;
  onSettingsChange: (settings: Partial<HabitSettingsType>) => void;
}

const THEME_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "gradient-blue", label: "Ocean Blue" },
  { value: "gradient-purple", label: "Purple Dream" },
  { value: "gradient-green", label: "Forest Green" },
  { value: "gradient-orange", label: "Sunset Orange" },
  { value: "gradient-pink", label: "Pink Blossom" },
];

export const HabitSettings = ({ settings, onSettingsChange }: HabitSettingsProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Habit Tracker Settings</DialogTitle>
          <DialogDescription>
            Customize your habit tracking experience
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Time Tracking</Label>
                  <p className="text-sm text-muted-foreground">
                    Display time spent on habits
                  </p>
                </div>
                <Switch
                  checked={settings.showTimeTracking}
                  onCheckedChange={(checked) =>
                    onSettingsChange({ showTimeTracking: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable habit reminders and notifications
                  </p>
                </div>
                <Switch
                  checked={settings.showReminders}
                  onCheckedChange={(checked) =>
                    onSettingsChange({ showReminders: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Gamification</Label>
                  <p className="text-sm text-muted-foreground">
                    Track points, levels, and badges
                  </p>
                </div>
                <Switch
                  checked={settings.enableGamification}
                  onCheckedChange={(checked) =>
                    onSettingsChange({ enableGamification: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Financial Tracking</Label>
                  <p className="text-sm text-muted-foreground">
                    Track financial habits and goals
                  </p>
                </div>
                <Switch
                  checked={settings.enableFinancialTracking}
                  onCheckedChange={(checked) =>
                    onSettingsChange({ enableFinancialTracking: checked })
                  }
                />
              </div>
            </div>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-4 pt-4">
            <div className="space-y-4">
              {/* Color Scheme */}
              <div className="space-y-2">
                <Label>Color Scheme</Label>
                <Select
                  value={settings.colorScheme}
                  onValueChange={(value) =>
                    onSettingsChange({ colorScheme: value as "light" | "dark" | "system" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Background Type */}
              <div className="space-y-2">
                <Label>Background Type</Label>
                <Select
                  value={settings.backgroundType}
                  onValueChange={(value) =>
                    onSettingsChange({ backgroundType: value as "theme" | "image" | "custom" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="theme">Theme</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Theme Selection (if theme background type) */}
              {settings.backgroundType === "theme" && (
                <div className="space-y-2">
                  <Label>Background Theme</Label>
                  <Select
                    value={settings.backgroundTheme}
                    onValueChange={(value) => onSettingsChange({ backgroundTheme: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {THEME_OPTIONS.map((theme) => (
                        <SelectItem key={theme.value} value={theme.value}>
                          {theme.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Background Image URL (if image background type) */}
              {settings.backgroundType === "image" && (
                <div className="space-y-2">
                  <Label>Background Image URL</Label>
                  <input
                    type="url"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="https://example.com/image.jpg"
                    value={settings.backgroundImage || ""}
                    onChange={(e) => onSettingsChange({ backgroundImage: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter a URL to a background image
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Feature Settings */}
          <TabsContent value="features" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted/50">
                <h4 className="font-semibold mb-2">Feature Information</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• <strong>Time Tracking:</strong> Monitor how much time you spend on each habit</li>
                  <li>• <strong>Reminders:</strong> Get notified when it's time to complete your habits</li>
                  <li>• <strong>Gamification:</strong> Earn points, level up, and unlock badges</li>
                  <li>• <strong>Financial Tracking:</strong> Set and track financial goals for money-related habits</li>
                </ul>
              </div>

              {settings.enableGamification && settings.userStats && (
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-3">Your Progress</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Level</p>
                      <p className="text-lg font-bold">{settings.userStats.level}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total XP</p>
                      <p className="text-lg font-bold">{settings.userStats.totalPoints}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Habits Completed</p>
                      <p className="text-lg font-bold">{settings.userStats.habitsCompleted}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Current Streak</p>
                      <p className="text-lg font-bold">{settings.userStats.currentStreak}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
