import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: Date;
  paymentMethod?: string;
  notes?: string;
  isRecurring?: boolean;
  recurringConfig?: any;
  tags?: string[];
  createdAt: Date;
}

export const useExpensesSupabase = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
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
        const { data, error } = await supabase.from("expenses").select("*").eq("user_id", userId).order("date", { ascending: false });
        if (error) throw error;

        setExpenses((data || []).map((exp: any) => ({
          id: exp.id,
          title: exp.title,
          amount: parseFloat(exp.amount),
          category: exp.category,
          date: new Date(exp.date),
          paymentMethod: exp.payment_method,
          notes: exp.notes,
          isRecurring: exp.is_recurring,
          recurringConfig: exp.recurring_config,
          tags: exp.tags || [],
          createdAt: new Date(exp.created_at),
        })));
        setIsLoaded(true);
      } catch (error: any) {
        console.error("Error fetching expenses:", error);
        toast.error("Failed to load expenses");
        setIsLoaded(true);
      }
    };

    fetchData();
  }, [userId]);

  const addExpense = async (expense: Expense) => {
    if (!userId) return;
    try {
      const { error } = await supabase.from("expenses").insert({
        user_id: userId,
        title: expense.title,
        amount: expense.amount,
        category: expense.category,
        date: expense.date.toISOString(),
        payment_method: expense.paymentMethod,
        notes: expense.notes,
        is_recurring: expense.isRecurring,
        recurring_config: expense.recurringConfig,
        tags: expense.tags,
      });
      if (error) throw error;
      setExpenses((prev) => [expense, ...prev]);
      toast.success("Expense added!");
    } catch (error: any) {
      console.error("Error adding expense:", error);
      toast.error("Failed to add expense");
    }
  };

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    if (!userId) return;
    try {
      const dbUpdates: any = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.date !== undefined) dbUpdates.date = updates.date.toISOString();
      if (updates.paymentMethod !== undefined) dbUpdates.payment_method = updates.paymentMethod;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.tags !== undefined) dbUpdates.tags = updates.tags;

      const { error } = await supabase.from("expenses").update(dbUpdates).eq("id", id).eq("user_id", userId);
      if (error) throw error;
      setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
    } catch (error: any) {
      console.error("Error updating expense:", error);
      toast.error("Failed to update expense");
    }
  };

  const deleteExpense = async (id: string) => {
    if (!userId) return;
    try {
      const { error } = await supabase.from("expenses").delete().eq("id", id).eq("user_id", userId);
      if (error) throw error;
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      toast.success("Expense deleted!");
    } catch (error: any) {
      console.error("Error deleting expense:", error);
      toast.error("Failed to delete expense");
    }
  };

  return { expenses, isLoaded, addExpense, updateExpense, deleteExpense };
};
