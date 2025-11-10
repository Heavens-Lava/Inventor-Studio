import { useState, useMemo } from "react";
import AppHeader from "@/components/AppHeader";
import { useCalendarStorage } from "@/hooks/useCalendarStorage";
import { CalendarView, CalendarEvent } from "@/types/calendar";
import { AddEventForm } from "@/components/calendar/AddEventForm";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Palette } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, addWeeks, subWeeks, addDays, subDays } from "date-fns";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const BACKGROUND_GRADIENTS: Record<string, string> = {
  "default": "",
  "gradient-blue": "bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-blue-950 dark:via-cyan-950 dark:to-blue-900",
  "gradient-purple": "bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 dark:from-purple-950 dark:via-pink-950 dark:to-purple-900",
  "gradient-green": "bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 dark:from-green-950 dark:via-emerald-950 dark:to-green-900",
  "gradient-orange": "bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-orange-950 dark:via-amber-950 dark:to-orange-900",
  "gradient-pink": "bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 dark:from-pink-950 dark:via-rose-950 dark:to-pink-900",
};

const DAY_COLOR_PALETTE = [
  { name: "None", color: "transparent" },
  { name: "Light Blue", color: "#dbeafe" },
  { name: "Light Purple", color: "#e9d5ff" },
  { name: "Light Green", color: "#d1fae5" },
  { name: "Light Yellow", color: "#fef3c7" },
  { name: "Light Pink", color: "#fce7f3" },
  { name: "Light Red", color: "#fee2e2" },
  { name: "Light Orange", color: "#fed7aa" },
  { name: "Light Gray", color: "#f3f4f6" },
];

const CalendarApp = () => {
  const { events, settings, isLoaded, addEvent, updateEvent, deleteEvent, updateSettings } = useCalendarStorage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>(settings.defaultView);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);

  // Get events for a specific date
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return events.filter(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);

      if (event.allDay) {
        return isSameDay(eventStart, date);
      }

      return (
        (isSameDay(eventStart, date)) ||
        (date >= eventStart && date <= eventEnd)
      );
    });
  };

  // Month view calendar days
  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: settings.weekStartsOn });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: settings.weekStartsOn });
    return eachDayOfInterval({ start, end });
  }, [currentDate, settings.weekStartsOn]);

  // Week view days
  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: settings.weekStartsOn });
    const end = endOfWeek(currentDate, { weekStartsOn: settings.weekStartsOn });
    return eachDayOfInterval({ start, end });
  }, [currentDate, settings.weekStartsOn]);

  // Navigation handlers
  const handlePrevious = () => {
    if (view === "month") {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (view === "week") {
      setCurrentDate(subWeeks(currentDate, 1));
    } else if (view === "day") {
      setCurrentDate(subDays(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (view === "month") {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (view === "week") {
      setCurrentDate(addWeeks(currentDate, 1));
    } else if (view === "day") {
      setCurrentDate(addDays(currentDate, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleSetDayColor = (date: Date, color: string) => {
    const dateKey = format(date, "yyyy-MM-dd");
    const newDayColors = { ...(settings.dayColors || {}) };

    if (color === "transparent") {
      delete newDayColors[dateKey];
    } else {
      newDayColors[dateKey] = color;
    }

    updateSettings({ dayColors: newDayColors });
    toast.success("Day color updated");
  };

  const getDayColor = (date: Date): string | undefined => {
    const dateKey = format(date, "yyyy-MM-dd");
    return settings.dayColors?.[dateKey];
  };

  // Get title based on view
  const getViewTitle = () => {
    if (view === "month") {
      return format(currentDate, "MMMM yyyy");
    } else if (view === "week") {
      const start = startOfWeek(currentDate, { weekStartsOn: settings.weekStartsOn });
      const end = endOfWeek(currentDate, { weekStartsOn: settings.weekStartsOn });
      return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
    } else if (view === "day") {
      return format(currentDate, "EEEE, MMMM d, yyyy");
    }
    return "";
  };

  // Apply background style
  const backgroundClass = settings.backgroundType === "theme"
    ? BACKGROUND_GRADIENTS[settings.backgroundTheme] || ""
    : "";

  const backgroundStyle = settings.backgroundType === "image" && settings.backgroundImage
    ? { backgroundImage: `url(${settings.backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center" }
    : {};

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading calendar...</p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${backgroundClass}`}
      style={backgroundStyle}
    >
      <AppHeader title="Daily Haven Suite" />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">Calendar</h1>
            <p className="text-muted-foreground">
              Plan your schedule and stay organized
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleToday} variant="outline">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Today
            </Button>
            <AddEventForm
              onAdd={(event) => {
                addEvent(event);
                toast.success("Event created successfully!");
                setShowEventForm(false);
              }}
              defaultDate={selectedDate || undefined}
              open={showEventForm}
              onOpenChange={setShowEventForm}
            />
          </div>
        </div>

        {/* Calendar Controls */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handlePrevious}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold min-w-[250px] text-center">
                {getViewTitle()}
              </h2>
              <Button variant="outline" size="icon" onClick={handleNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant={view === "month" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("month")}
              >
                Month
              </Button>
              <Button
                variant={view === "week" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("week")}
              >
                Week
              </Button>
              <Button
                variant={view === "day" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("day")}
              >
                Day
              </Button>
            </div>
          </div>
        </Card>

        {/* Month View */}
        {view === "month" && (
          <Card className="p-4">
            <div className="grid grid-cols-7 gap-2 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
                <div
                  key={day}
                  className={cn(
                    "text-center font-semibold text-sm py-2",
                    !settings.showWeekends && (index === 0 || index === 6) && "hidden"
                  )}
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {monthDays.map((day, index) => {
                const dayEvents = getEventsForDate(day);
                const isToday = isSameDay(day, new Date());
                const isCurrentMonth = isSameMonth(day, currentDate);
                const dayOfWeek = day.getDay();
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                if (!settings.showWeekends && isWeekend) {
                  return null;
                }

                // Get unique event colors for this day
                const eventColors = [...new Set(dayEvents.map(e => e.color || "#3b82f6"))];
                const dayBgColor = getDayColor(day);

                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      "min-h-[100px] p-2 border rounded-lg cursor-pointer transition-colors hover:shadow-sm relative group",
                      !isCurrentMonth && "opacity-40",
                      isToday && "border-2 border-primary"
                    )}
                    style={{ backgroundColor: dayBgColor || (isToday ? "rgb(var(--primary) / 0.05)" : undefined) }}
                    onClick={() => {
                      setSelectedDate(day);
                      setShowEventForm(true);
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div
                        className={cn(
                          "text-sm font-medium",
                          isToday && "text-primary font-bold"
                        )}
                      >
                        {format(day, "d")}
                      </div>
                      <div className="flex items-center gap-1">
                        {/* Color dots indicator */}
                        {dayEvents.length > 0 && (
                          <div className="flex gap-0.5">
                            {eventColors.slice(0, 3).map((color, idx) => (
                              <div
                                key={idx}
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: color }}
                                title={`${dayEvents.filter(e => (e.color || "#3b82f6") === color).length} event(s)`}
                              />
                            ))}
                          </div>
                        )}
                        {/* Color picker */}
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-accent rounded"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Palette className="h-3 w-3" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-2" onClick={(e) => e.stopPropagation()}>
                            <div className="grid grid-cols-3 gap-2">
                              {DAY_COLOR_PALETTE.map((item) => (
                                <button
                                  key={item.name}
                                  className="w-10 h-10 rounded border-2 hover:scale-110 transition-transform"
                                  style={{ backgroundColor: item.color, borderColor: dayBgColor === item.color ? "#000" : "#ccc" }}
                                  onClick={() => handleSetDayColor(day, item.color)}
                                  title={item.name}
                                />
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map(event => (
                        <div
                          key={event.id}
                          className="text-xs p-1 rounded truncate"
                          style={{ backgroundColor: `${event.color || "#3b82f6"}20`, borderLeft: `3px solid ${event.color || "#3b82f6"}` }}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Week View */}
        {view === "week" && (
          <Card className="p-4">
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map(day => {
                const dayEvents = getEventsForDate(day);
                const isToday = isSameDay(day, new Date());

                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      "min-h-[400px] p-3 border rounded-lg",
                      isToday && "border-2 border-primary bg-primary/5"
                    )}
                  >
                    <div className={cn("text-center mb-3", isToday && "text-primary font-bold")}>
                      <div className="text-sm font-medium">{format(day, "EEE")}</div>
                      <div className="text-2xl font-bold">{format(day, "d")}</div>
                    </div>
                    <div className="space-y-2">
                      {dayEvents.map(event => (
                        <div
                          key={event.id}
                          className="text-xs p-2 rounded"
                          style={{ backgroundColor: `${event.color || "#3b82f6"}20`, borderLeft: `3px solid ${event.color || "#3b82f6"}` }}
                        >
                          <div className="font-medium truncate">{event.title}</div>
                          {!event.allDay && (
                            <div className="text-muted-foreground">
                              {format(new Date(event.startDate), "h:mm a")}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Day View */}
        {view === "day" && (
          <Card className="p-6">
            <div className="space-y-3">
              {getEventsForDate(currentDate).length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No events scheduled for this day
                </div>
              ) : (
                getEventsForDate(currentDate).map(event => (
                  <div
                    key={event.id}
                    className="p-4 rounded-lg border-l-4"
                    style={{ borderColor: event.color || "#3b82f6", backgroundColor: `${event.color || "#3b82f6"}10` }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{event.title}</h3>
                        {event.description && (
                          <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          {!event.allDay && (
                            <span>
                              {format(new Date(event.startDate), "h:mm a")} - {format(new Date(event.endDate), "h:mm a")}
                            </span>
                          )}
                          {event.allDay && <span className="text-muted-foreground">All day</span>}
                          {event.location && (
                            <span className="text-muted-foreground">📍 {event.location}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CalendarApp;
