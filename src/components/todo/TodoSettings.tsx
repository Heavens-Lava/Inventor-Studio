import { Settings, Paintbrush, Clock, Sparkles, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TodoSettings as TodoSettingsType } from "@/types/todo";
import { Separator } from "@/components/ui/separator";

interface TodoSettingsProps {
  settings: TodoSettingsType;
  onSettingsChange: (settings: Partial<TodoSettingsType>) => void;
}

const BACKGROUND_THEMES = [
  { value: "default", label: "Default" },
  { value: "gradient-blue", label: "Ocean Blue" },
  { value: "gradient-purple", label: "Purple Dream" },
  { value: "gradient-green", label: "Forest Green" },
  { value: "gradient-orange", label: "Sunset Orange" },
  { value: "gradient-pink", label: "Cherry Blossom" },
];

export const TodoSettings = ({ settings, onSettingsChange }: TodoSettingsProps) => {
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      onSettingsChange({ backgroundImage: base64 });
    };
    reader.readAsDataURL(file);

    // Reset input value
    event.target.value = '';
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>
            Customize your to-do app experience
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Background Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Paintbrush className="h-5 w-5" />
              <h3 className="font-semibold">Background</h3>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="background-type">Background Type</Label>
                <Select
                  value={settings.backgroundType}
                  onValueChange={(value) =>
                    onSettingsChange({
                      backgroundType: value as "theme" | "image" | "custom"
                    })
                  }
                >
                  <SelectTrigger id="background-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="theme">Theme</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="custom">Custom Color</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {settings.backgroundType === "theme" && (
                <div className="space-y-2">
                  <Label htmlFor="background-theme">Theme</Label>
                  <Select
                    value={settings.backgroundTheme}
                    onValueChange={(value) =>
                      onSettingsChange({ backgroundTheme: value })
                    }
                  >
                    <SelectTrigger id="background-theme">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BACKGROUND_THEMES.map((theme) => (
                        <SelectItem key={theme.value} value={theme.value}>
                          {theme.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {settings.backgroundType === "image" && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="background-image">Image URL</Label>
                    <input
                      id="background-image"
                      type="text"
                      placeholder="Enter image URL..."
                      value={settings.backgroundImage || ""}
                      onChange={(e) =>
                        onSettingsChange({ backgroundImage: e.target.value })
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter a URL to a background image
                    </p>
                  </div>

                  <div className="relative">
                    <div className="flex items-center justify-center gap-2 my-2">
                      <div className="flex-1 h-px bg-border"></div>
                      <span className="text-xs text-muted-foreground">OR</span>
                      <div className="flex-1 h-px bg-border"></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="upload-image">Upload Image</Label>
                    <div className="flex gap-2">
                      <input
                        id="upload-image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => document.getElementById('upload-image')?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload from Computer
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Upload an image from your device
                    </p>
                  </div>

                  {settings.backgroundImage && (
                    <div className="space-y-2">
                      <Label>Preview</Label>
                      <div
                        className="w-full h-24 rounded-md bg-cover bg-center border"
                        style={{
                          backgroundImage: `url(${settings.backgroundImage})`
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onSettingsChange({ backgroundImage: '' })}
                        className="w-full"
                      >
                        Clear Image
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {settings.backgroundType === "custom" && (
                <div className="space-y-2">
                  <Label htmlFor="background-color">Custom Color</Label>
                  <div className="flex gap-2">
                    <input
                      id="background-color"
                      type="color"
                      value={settings.backgroundColor || "#ffffff"}
                      onChange={(e) =>
                        onSettingsChange({ backgroundColor: e.target.value })
                      }
                      className="h-10 w-20 rounded-md border border-input cursor-pointer"
                    />
                    <input
                      type="text"
                      placeholder="#ffffff"
                      value={settings.backgroundColor || "#ffffff"}
                      onChange={(e) =>
                        onSettingsChange({ backgroundColor: e.target.value })
                      }
                      className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Choose a custom background color
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Display Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <h3 className="font-semibold">Display Options</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-timer">Show Timer</Label>
                  <p className="text-sm text-muted-foreground">
                    Display time tracking for tasks
                  </p>
                </div>
                <Switch
                  id="show-timer"
                  checked={settings.showTimer}
                  onCheckedChange={(checked) =>
                    onSettingsChange({ showTimer: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-estimated-time">Show Estimated Time</Label>
                  <p className="text-sm text-muted-foreground">
                    Display time estimates for tasks
                  </p>
                </div>
                <Switch
                  id="show-estimated-time"
                  checked={settings.showEstimatedTime}
                  onCheckedChange={(checked) =>
                    onSettingsChange({ showEstimatedTime: checked })
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* AI Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <h3 className="font-semibold">AI Features</h3>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="ai-suggestions">AI Suggestions</Label>
                <p className="text-sm text-muted-foreground">
                  Get AI-powered task recommendations
                </p>
              </div>
              <Switch
                id="ai-suggestions"
                checked={settings.enableAISuggestions}
                onCheckedChange={(checked) =>
                  onSettingsChange({ enableAISuggestions: checked })
                }
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Note: AI features are currently in development
            </p>
          </div>

          <Separator />

          {/* Theme Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold">Color Scheme</h3>
            <Select
              value={settings.colorScheme}
              onValueChange={(value) =>
                onSettingsChange({
                  colorScheme: value as "light" | "dark" | "system"
                })
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
        </div>
      </SheetContent>
    </Sheet>
  );
};
