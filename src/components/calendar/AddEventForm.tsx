import { useState, useEffect } from "react";
import { CalendarEvent, EventCategory, EVENT_CATEGORY_LABELS, EVENT_CATEGORY_COLORS, RecurringType } from "@/types/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus } from "lucide-react";
import { generateId } from "@/lib/utils-todo";

interface AddEventFormProps {
  onAdd: (event: CalendarEvent) => void;
  defaultDate?: Date;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export const AddEventForm = ({ onAdd, defaultDate, open: controlledOpen, onOpenChange, trigger }: AddEventFormProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<EventCategory>("personal");
  const [startDate, setStartDate] = useState(
    defaultDate ? defaultDate.toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)
  );
  const [endDate, setEndDate] = useState(
    defaultDate ? new Date(defaultDate.getTime() + 60 * 60 * 1000).toISOString().slice(0, 16) : new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [allDay, setAllDay] = useState(false);
  const [location, setLocation] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [recurringType, setRecurringType] = useState<RecurringType>("none");

  // Update dates when defaultDate changes
  useEffect(() => {
    if (defaultDate) {
      setStartDate(defaultDate.toISOString().slice(0, 16));
      setEndDate(new Date(defaultDate.getTime() + 60 * 60 * 1000).toISOString().slice(0, 16));
    }
  }, [defaultDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      return;
    }

    const newEvent: CalendarEvent = {
      id: generateId(),
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      allDay,
      location: location.trim() || undefined,
      color: EVENT_CATEGORY_COLORS[category],
      recurring: recurring ? {
        type: recurringType,
        interval: 1
      } : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    onAdd(newEvent);
    handleReset();
    setOpen(false);
  };

  const handleReset = () => {
    setTitle("");
    setDescription("");
    setCategory("personal");
    setStartDate(new Date().toISOString().slice(0, 16));
    setEndDate(new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16));
    setAllDay(false);
    setLocation("");
    setRecurring(false);
    setRecurringType("none");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger !== undefined ? (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Event
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription>
            Add a new event to your calendar
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter event title"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add event description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={(value) => setCategory(value as EventCategory)}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EVENT_CATEGORY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: EVENT_CATEGORY_COLORS[key as EventCategory] }}
                        />
                        {label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Add location"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="all-day"
              checked={allDay}
              onCheckedChange={setAllDay}
            />
            <Label htmlFor="all-day">All day event</Label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-date">Start Date & Time</Label>
              <Input
                id="start-date"
                type={allDay ? "date" : "datetime-local"}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="end-date">End Date & Time</Label>
              <Input
                id="end-date"
                type={allDay ? "date" : "datetime-local"}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="recurring"
              checked={recurring}
              onCheckedChange={setRecurring}
            />
            <Label htmlFor="recurring">Recurring event</Label>
          </div>

          {recurring && (
            <div>
              <Label htmlFor="recurring-type">Repeat</Label>
              <Select value={recurringType} onValueChange={(value) => setRecurringType(value as RecurringType)}>
                <SelectTrigger id="recurring-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Biweekly (Every 2 weeks)</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Event</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
