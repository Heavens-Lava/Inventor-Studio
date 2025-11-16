import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface Workout {
  id: string;
  name: string;
  type: string;
  duration?: number;
  caloriesBurned?: number;
  distance?: number;
  notes?: string;
  exercises?: any;
  completedAt: Date;
  createdAt: Date;
}

export const useFitnessSupabase = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) setUserId(session.user.id);
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        const { data, error } = await supabase.from("workouts").select("*").eq("user_id", userId).order("completed_at", { ascending: false });
        if (error) throw error;

        setWorkouts((data || []).map((w: any) => ({
          id: w.id,
          name: w.name,
          type: w.type,
          duration: w.duration,
          caloriesBurned: w.calories_burned,
          distance: w.distance ? parseFloat(w.distance) : undefined,
          notes: w.notes,
          exercises: w.exercises,
          completedAt: new Date(w.completed_at),
          createdAt: new Date(w.created_at),
        })));
        setIsLoaded(true);
      } catch (error: any) {
        console.error("Error fetching workouts:", error);
        toast.error("Failed to load workouts");
        setIsLoaded(true);
      }
    };

    fetchData();
  }, [userId]);

  const addWorkout = async (workout: Workout) => {
    if (!userId) return;
    try {
      const { error } = await supabase.from("workouts").insert({
        user_id: userId,
        name: workout.name,
        type: workout.type,
        duration: workout.duration,
        calories_burned: workout.caloriesBurned,
        distance: workout.distance,
        notes: workout.notes,
        exercises: workout.exercises,
        completed_at: workout.completedAt.toISOString(),
      });
      if (error) throw error;
      setWorkouts((prev) => [workout, ...prev]);
      toast.success("Workout logged!");
    } catch (error: any) {
      console.error("Error adding workout:", error);
      toast.error("Failed to log workout");
    }
  };

  const deleteWorkout = async (id: string) => {
    if (!userId) return;
    try {
      const { error } = await supabase.from("workouts").delete().eq("id", id).eq("user_id", userId);
      if (error) throw error;
      setWorkouts((prev) => prev.filter((w) => w.id !== id));
      toast.success("Workout deleted!");
    } catch (error: any) {
      console.error("Error deleting workout:", error);
      toast.error("Failed to delete workout");
    }
  };

  return { workouts, isLoaded, addWorkout, deleteWorkout };
};
