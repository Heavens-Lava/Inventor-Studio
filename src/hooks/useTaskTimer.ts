import { useState, useEffect, useCallback } from "react";

export const useTaskTimer = (
  taskId: string,
  initialTimeSpent: number = 0,
  isRunning: boolean = false,
  onTimeUpdate?: (taskId: string, timeSpent: number) => void
) => {
  const [timeSpent, setTimeSpent] = useState(initialTimeSpent);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(isRunning);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive) {
      interval = setInterval(() => {
        setSeconds((s) => {
          const newSeconds = s + 1;
          // Update minutes every 60 seconds
          if (newSeconds >= 60) {
            setTimeSpent((time) => {
              const newTime = time + 1;
              if (onTimeUpdate) {
                onTimeUpdate(taskId, newTime);
              }
              return newTime;
            });
            return 0;
          }
          return newSeconds;
        });
      }, 1000); // Update every second
    } else if (interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, taskId, onTimeUpdate]);

  const start = useCallback(() => {
    setIsActive(true);
  }, []);

  const pause = useCallback(() => {
    setIsActive(false);
  }, []);

  const reset = useCallback(() => {
    setIsActive(false);
    setTimeSpent(0);
    setSeconds(0);
    if (onTimeUpdate) {
      onTimeUpdate(taskId, 0);
    }
  }, [taskId, onTimeUpdate]);

  const formatTime = (minutes: number, secs: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m ${secs}s`;
    }
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  return {
    timeSpent,
    isActive,
    start,
    pause,
    reset,
    formatTime: () => formatTime(timeSpent, seconds)
  };
};
