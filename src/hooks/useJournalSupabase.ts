import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { JournalEntry } from "@/types/journal";
import { toast } from "sonner";

export const useJournalSupabase = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
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
        const { data, error } = await supabase
          .from("journal_entries")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) throw error;

        setEntries((data || []).map((entry: any) => ({
          id: entry.id,
          title: entry.title || "",
          content: entry.content,
          date: new Date(entry.created_at),
          mood: entry.mood,
          category: "personal",
          tags: entry.tags || [],
          stickers: [],
          images: entry.photos?.map((url: string, i: number) => ({ id: `img-${i}`, url })) || [],
          backgroundColor: undefined,
          template: undefined,
          isFavorite: entry.is_favorite,
          isPrivate: entry.is_private,
          createdAt: new Date(entry.created_at),
          updatedAt: new Date(entry.updated_at),
        })));
        setIsLoaded(true);
      } catch (error: any) {
        console.error("Error fetching journal entries:", error);
        toast.error("Failed to load journal");
        setIsLoaded(true);
      }
    };

    fetchData();
  }, [userId]);

  const addEntry = async (entry: JournalEntry) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("journal_entries")
        .insert({
          user_id: userId,
          title: entry.title,
          content: entry.content,
          mood: entry.mood,
          tags: entry.tags,
          is_favorite: entry.isFavorite,
          is_private: entry.isPrivate,
          photos: entry.images.map(img => img.url),
        })
        .select()
        .single();

      if (error) throw error;
      setEntries((prev) => [entry, ...prev]);
      toast.success("Journal entry added!");
    } catch (error: any) {
      console.error("Error adding entry:", error);
      toast.error("Failed to add entry");
    }
  };

  const updateEntry = async (id: string, updates: Partial<JournalEntry>) => {
    if (!userId) return;

    try {
      const dbUpdates: any = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.content !== undefined) dbUpdates.content = updates.content;
      if (updates.mood !== undefined) dbUpdates.mood = updates.mood;
      if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
      if (updates.isFavorite !== undefined) dbUpdates.is_favorite = updates.isFavorite;
      if (updates.isPrivate !== undefined) dbUpdates.is_private = updates.isPrivate;
      if (updates.images !== undefined) dbUpdates.photos = updates.images.map(img => img.url);

      const { error } = await supabase
        .from("journal_entries")
        .update(dbUpdates)
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;
      setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
    } catch (error: any) {
      console.error("Error updating entry:", error);
      toast.error("Failed to update entry");
    }
  };

  const deleteEntry = async (id: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from("journal_entries")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;
      setEntries((prev) => prev.filter((e) => e.id !== id));
      toast.success("Entry deleted!");
    } catch (error: any) {
      console.error("Error deleting entry:", error);
      toast.error("Failed to delete entry");
    }
  };

  return { entries, isLoaded, addEntry, updateEntry, deleteEntry };
};
