import { useState } from "react";
import { IdeasSettings as IdeasSettingsType } from "@/types/ideas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings } from "lucide-react";
import { toast } from "sonner";

interface IdeasSettingsProps {
  settings: IdeasSettingsType;
  onUpdate: (settings: Partial<IdeasSettingsType>) => void;
}

const BACKGROUND_COLORS = [
  { name: "White", value: "#ffffff" },
  { name: "Light Gray", value: "#f3f4f6" },
  { name: "Light Blue", value: "#dbeafe" },
  { name: "Light Green", value: "#d1fae5" },
  { name: "Light Purple", value: "#e9d5ff" },
  { name: "Light Pink", value: "#fce7f3" },
  { name: "Light Yellow", value: "#fef3c7" },
  { name: "Light Orange", value: "#fed7aa" },
];

export const IdeasSettings = ({ settings, onUpdate }: IdeasSettingsProps) => {
  const [open, setOpen] = useState(false);
  const [bgType, setBgType] = useState(settings.backgroundType);
  const [bgTheme, setBgTheme] = useState(settings.backgroundTheme);
  const [bgColor, setBgColor] = useState(settings.backgroundImage || "#ffffff");
  const [imageUrl, setImageUrl] = useState(settings.backgroundImage || "");

  const handleSave = () => {
    const updates: Partial<IdeasSettingsType> = {
      backgroundType: bgType,
      backgroundTheme: bgType === "theme" ? bgTheme : settings.backgroundTheme,
    };

    if (bgType === "color") {
      updates.backgroundImage = bgColor;
    } else if (bgType === "image") {
      updates.backgroundImage = imageUrl;
    }

    onUpdate(updates);
    setOpen(false);
    toast.success("Settings updated!");
  };

  const handleReset = () => {
    setBgType(settings.backgroundType);
    setBgTheme(settings.backgroundTheme);
    setBgColor(settings.backgroundImage || "#ffffff");
    setImageUrl(settings.backgroundImage || "");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) handleReset(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" title="Settings">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ideas Settings</DialogTitle>
          <DialogDescription>
            Customize your ideas board appearance
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Background Type */}
          <div>
            <Label htmlFor="bg-type">Background Type</Label>
            <Select value={bgType} onValueChange={setBgType}>
              <SelectTrigger id="bg-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="theme">Theme Gradient</SelectItem>
                <SelectItem value="color">Solid Color</SelectItem>
                <SelectItem value="image">Custom Image</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Theme Gradient Selection */}
          {bgType === "theme" && (
            <div>
              <Label htmlFor="bg-theme">Theme</Label>
              <Select value={bgTheme} onValueChange={setBgTheme}>
                <SelectTrigger id="bg-theme">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="gradient-blue">Blue Gradient</SelectItem>
                  <SelectItem value="gradient-purple">Purple Gradient</SelectItem>
                  <SelectItem value="gradient-green">Green Gradient</SelectItem>
                  <SelectItem value="gradient-orange">Orange Gradient</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Solid Color Selection */}
          {bgType === "color" && (
            <div>
              <Label htmlFor="bg-color">Background Color</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {BACKGROUND_COLORS.map((color) => (
                  <button
                    key={color.value}
                    className={`w-full h-12 rounded border-2 hover:scale-105 transition-transform ${
                      bgColor === color.value ? "border-primary ring-2 ring-primary" : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setBgColor(color.value)}
                    title={color.name}
                  >
                    <span className="sr-only">{color.name}</span>
                  </button>
                ))}
              </div>
              <div className="mt-3">
                <Label htmlFor="custom-color">Or enter custom color</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="custom-color"
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    placeholder="#ffffff"
                  />
                  <Input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-16"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Image URL Input */}
          {bgType === "image" && (
            <div>
              <Label htmlFor="bg-image">Image URL</Label>
              <Input
                id="bg-image"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter a URL to an image. For best results, use a high-resolution image.
              </p>
              {imageUrl && (
                <div className="mt-3 rounded border p-2">
                  <p className="text-xs font-medium mb-2">Preview:</p>
                  <img
                    src={imageUrl}
                    alt="Background preview"
                    className="w-full h-32 object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.src = "";
                      e.currentTarget.alt = "Failed to load image";
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
