import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFitnessData } from "@/hooks/useFitnessData";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ArrowLeft, Heart, Smile, Moon, Plus, Brain } from "lucide-react";
import { toast } from "sonner";

const moodOptions = [
  { value: "terrible", label: "Terrible", emoji: "😫", color: "bg-red-500" },
  { value: "bad", label: "Bad", emoji: "😞", color: "bg-orange-500" },
  { value: "okay", label: "Okay", emoji: "😐", color: "bg-yellow-500" },
  { value: "good", label: "Good", emoji: "🙂", color: "bg-green-500" },
  { value: "great", label: "Great", emoji: "😊", color: "bg-blue-500" },
  { value: "fantastic", label: "Fantastic", emoji: "🤩", color: "bg-purple-500" },
];

export default function FitnessWellness() {
  const navigate = useNavigate();
  const { data, addMoodLog, addSleepLog } = useFitnessData();
  const [showMoodDialog, setShowMoodDialog] = useState(false);
  const [showSleepDialog, setShowSleepDialog] = useState(false);

  const [moodForm, setMoodForm] = useState({
    mood: "good" as any,
    stress: 5,
    energy: 5,
    notes: "",
  });

  const [sleepForm, setSleepForm] = useState({
    date: new Date().toISOString().split("T")[0],
    bedtime: "22:00",
    waketime: "06:00",
    quality: 3 as 1 | 2 | 3 | 4 | 5,
    notes: "",
  });

  const handleAddMood = () => {
    addMoodLog({
      date: new Date().toISOString().split("T")[0],
      time: new Date().toISOString(),
      mood: moodForm.mood,
      stress: moodForm.stress,
      energy: moodForm.energy,
      emotions: [],
      notes: moodForm.notes,
    });

    toast.success("Mood logged successfully! 😊");
    setShowMoodDialog(false);
    setMoodForm({ mood: "good", stress: 5, energy: 5, notes: "" });
  };

  const handleAddSleep = () => {
    const bedtime = new Date(`${sleepForm.date}T${sleepForm.bedtime}`);
    const waketime = new Date(`${sleepForm.date}T${sleepForm.waketime}`);
    if (waketime < bedtime) {
      waketime.setDate(waketime.getDate() + 1);
    }
    const duration = (waketime.getTime() - bedtime.getTime()) / (1000 * 60 * 60);

    addSleepLog({
      date: sleepForm.date,
      bedtime: bedtime.toISOString(),
      waketime: waketime.toISOString(),
      duration: Math.round(duration * 10) / 10,
      quality: sleepForm.quality,
      notes: sleepForm.notes,
      feltRested: sleepForm.quality >= 3,
    });

    toast.success("Sleep logged successfully! 😴");
    setShowSleepDialog(false);
  };

  const recentMoods = data.wellness.mood.slice(0, 7);
  const recentSleep = data.health.sleep.slice(0, 7);

  const avgMoodThisWeek = recentMoods.length > 0
    ? moodOptions.findIndex((m) => m.value === recentMoods[0].mood) + 1
    : 0;

  const avgSleepThisWeek = recentSleep.length > 0
    ? recentSleep.reduce((sum, s) => sum + s.duration, 0) / recentSleep.length
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate("/fitness")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Heart className="w-6 h-6 text-pink-500" />
                  Wellness Tracker
                </h1>
                <p className="text-sm text-muted-foreground">Track mood, sleep, and mental health</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 pb-24 md:pb-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => setShowMoodDialog(true)}
            className="h-24 flex-col gap-2"
            variant="outline"
          >
            <Smile className="w-8 h-8" />
            <span>Log Mood</span>
          </Button>
          <Button
            onClick={() => setShowSleepDialog(true)}
            className="h-24 flex-col gap-2"
            variant="outline"
          >
            <Moon className="w-8 h-8" />
            <span>Log Sleep</span>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Smile className="w-6 h-6 text-yellow-500" />
              <div>
                <div className="text-sm text-muted-foreground">Avg Mood</div>
                <div className="text-2xl font-bold">
                  {avgMoodThisWeek > 0 ? moodOptions[avgMoodThisWeek - 1]?.emoji : "—"}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Moon className="w-6 h-6 text-blue-500" />
              <div>
                <div className="text-sm text-muted-foreground">Avg Sleep</div>
                <div className="text-2xl font-bold">
                  {avgSleepThisWeek > 0 ? `${avgSleepThisWeek.toFixed(1)}h` : "—"}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Brain className="w-6 h-6 text-purple-500" />
              <div>
                <div className="text-sm text-muted-foreground">Check-ins</div>
                <div className="text-2xl font-bold">{data.wellness.mood.length}</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Mood Logs */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Smile className="w-5 h-5 text-yellow-500" />
              Recent Mood Logs
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setShowMoodDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>

          {recentMoods.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Smile className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No mood logs yet. Start tracking your mood!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentMoods.map((mood) => {
                const moodOption = moodOptions.find((m) => m.value === mood.mood);
                return (
                  <Card key={mood.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{moodOption?.emoji}</span>
                        <div>
                          <div className="font-medium">{moodOption?.label}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(mood.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>Stress: {mood.stress}/10</div>
                        <div>Energy: {mood.energy}/10</div>
                      </div>
                    </div>
                    {mood.notes && (
                      <div className="mt-3 text-sm text-muted-foreground p-2 bg-secondary rounded">
                        {mood.notes}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </Card>

        {/* Recent Sleep Logs */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Moon className="w-5 h-5 text-blue-500" />
              Recent Sleep Logs
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setShowSleepDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>

          {recentSleep.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Moon className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No sleep logs yet. Start tracking your sleep!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSleep.map((sleep) => (
                <Card key={sleep.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        {new Date(sleep.date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {sleep.duration}h sleep • Quality: {"⭐".repeat(sleep.quality)}
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div>{new Date(sleep.bedtime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                      <div>to</div>
                      <div>{new Date(sleep.waketime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                    </div>
                  </div>
                  {sleep.notes && (
                    <div className="mt-3 text-sm text-muted-foreground p-2 bg-secondary rounded">
                      {sleep.notes}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Mood Dialog */}
      <Dialog open={showMoodDialog} onOpenChange={setShowMoodDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Mood</DialogTitle>
            <DialogDescription>How are you feeling today?</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Mood</Label>
              <div className="grid grid-cols-3 gap-2">
                {moodOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={moodForm.mood === option.value ? "default" : "outline"}
                    onClick={() => setMoodForm({ ...moodForm, mood: option.value })}
                    className="h-20 flex-col gap-1"
                  >
                    <span className="text-2xl">{option.emoji}</span>
                    <span className="text-xs">{option.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Stress Level: {moodForm.stress}/10</Label>
              <Input
                type="range"
                min="1"
                max="10"
                value={moodForm.stress}
                onChange={(e) => setMoodForm({ ...moodForm, stress: parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label>Energy Level: {moodForm.energy}/10</Label>
              <Input
                type="range"
                min="1"
                max="10"
                value={moodForm.energy}
                onChange={(e) => setMoodForm({ ...moodForm, energy: parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                placeholder="What's on your mind?"
                value={moodForm.notes}
                onChange={(e) => setMoodForm({ ...moodForm, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMoodDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMood}>
              <Plus className="w-4 h-4 mr-2" />
              Log Mood
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sleep Dialog */}
      <Dialog open={showSleepDialog} onOpenChange={setShowSleepDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Sleep</DialogTitle>
            <DialogDescription>Record your sleep details</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={sleepForm.date}
                onChange={(e) => setSleepForm({ ...sleepForm, date: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bedtime</Label>
                <Input
                  type="time"
                  value={sleepForm.bedtime}
                  onChange={(e) => setSleepForm({ ...sleepForm, bedtime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Wake Time</Label>
                <Input
                  type="time"
                  value={sleepForm.waketime}
                  onChange={(e) => setSleepForm({ ...sleepForm, waketime: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Sleep Quality</Label>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Button
                    key={rating}
                    variant={sleepForm.quality === rating ? "default" : "outline"}
                    onClick={() => setSleepForm({ ...sleepForm, quality: rating as any })}
                  >
                    {"⭐".repeat(rating)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                placeholder="How did you sleep?"
                value={sleepForm.notes}
                onChange={(e) => setSleepForm({ ...sleepForm, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSleepDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSleep}>
              <Plus className="w-4 h-4 mr-2" />
              Log Sleep
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
