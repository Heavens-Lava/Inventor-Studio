import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface Idea {
  id: string;
  title: string;
  description?: string;
  category: string;
  status: string;
  priority: string;
  tags: string[];
  attachments?: any;
  isFavorite: boolean;
  votes: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const useIdeasSupabase = () => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
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
        const { data, error } = await supabase.from("ideas").select("*").eq("user_id", userId).order("created_at", { ascending: false });
        if (error) throw error;

        setIdeas((data || []).map((idea: any) => ({
          id: idea.id,
          title: idea.title,
          description: idea.description,
          category: idea.category,
          status: idea.status,
          priority: idea.priority,
          tags: idea.tags || [],
          attachments: idea.attachments,
          isFavorite: idea.is_favorite,
          votes: idea.votes || 0,
          notes: idea.notes,
          createdAt: new Date(idea.created_at),
          updatedAt: new Date(idea.updated_at),
        })));
        setIsLoaded(true);
      } catch (error: any) {
        console.error("Error fetching ideas:", error);
        toast.error("Failed to load ideas");
        setIsLoaded(true);
      }
    };

    fetchData();
  }, [userId]);

  const addIdea = async (idea: Idea) => {
    if (!userId) return;
    try {
      const { error } = await supabase.from("ideas").insert({
        user_id: userId,
        title: idea.title,
        description: idea.description,
        category: idea.category,
        status: idea.status,
        priority: idea.priority,
        tags: idea.tags,
        attachments: idea.attachments,
        is_favorite: idea.isFavorite,
        votes: idea.votes,
        notes: idea.notes,
      });
      if (error) throw error;
      setIdeas((prev) => [idea, ...prev]);
      toast.success("Idea added!");
    } catch (error: any) {
      console.error("Error adding idea:", error);
      toast.error("Failed to add idea");
    }
  };

  const updateIdea = async (id: string, updates: Partial<Idea>) => {
    if (!userId) return;
    try {
      const dbUpdates: any = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
      if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
      if (updates.isFavorite !== undefined) dbUpdates.is_favorite = updates.isFavorite;
      if (updates.votes !== undefined) dbUpdates.votes = updates.votes;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

      const { error } = await supabase.from("ideas").update(dbUpdates).eq("id", id).eq("user_id", userId);
      if (error) throw error;
      setIdeas((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));
    } catch (error: any) {
      console.error("Error updating idea:", error);
      toast.error("Failed to update idea");
    }
  };

  const deleteIdea = async (id: string) => {
    if (!userId) return;
    try {
      const { error } = await supabase.from("ideas").delete().eq("id", id).eq("user_id", userId);
      if (error) throw error;
      setIdeas((prev) => prev.filter((i) => i.id !== id));
      toast.success("Idea deleted!");
    } catch (error: any) {
      console.error("Error deleting idea:", error);
      toast.error("Failed to delete idea");
    }
  };

  return { ideas, isLoaded, addIdea, updateIdea, deleteIdea };
};
