import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useTasks = (eventId?: string) => {
  return useQuery({
    queryKey: ["tasks", eventId],
    queryFn: async () => {
      let query = supabase.from("tasks").select("*").order("created_at", { ascending: false });
      if (eventId) query = query.eq("event_id", eventId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!eventId,
  });
};

export const useAllTasks = () => {
  return useQuery({
    queryKey: ["all_tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (task: {
      event_id: string;
      name: string;
      assigned_to_user_id?: string;
      assigned_to_name?: string;
      due_date?: string;
      description?: string;
    }) => {
      const { data, error } = await supabase.from("tasks").insert(task).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["all_tasks"] });
    },
  });
};
