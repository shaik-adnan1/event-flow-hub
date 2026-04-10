import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useBugs = (eventId?: string) => {
  return useQuery({
    queryKey: ["bugs", eventId],
    queryFn: async () => {
      let query = supabase.from("bugs").select("*").order("created_at", { ascending: false });
      if (eventId) query = query.eq("event_id", eventId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!eventId,
  });
};

export const useAllBugs = () => {
  return useQuery({
    queryKey: ["all_bugs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bugs")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useBugComments = (bugId?: string) => {
  return useQuery({
    queryKey: ["bug_comments", bugId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bug_comments")
        .select("*")
        .eq("bug_id", bugId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!bugId,
  });
};

export const useCreateBug = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bug: {
      task_id: string;
      event_id: string;
      raised_by: string;
      description: string;
      photo_url?: string;
    }) => {
      const { data, error } = await supabase.from("bugs").insert(bug).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bugs"] });
      queryClient.invalidateQueries({ queryKey: ["all_bugs"] });
    },
  });
};

export const useUpdateBugStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ bugId, status }: { bugId: string; status: string }) => {
      const { data, error } = await supabase
        .from("bugs")
        .update({ status })
        .eq("id", bugId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bugs"] });
      queryClient.invalidateQueries({ queryKey: ["all_bugs"] });
    },
  });
};

export const useAddBugComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (comment: {
      bug_id: string;
      user_id: string;
      comment: string;
      photo_url?: string;
    }) => {
      const { data, error } = await supabase.from("bug_comments").insert(comment).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bug_comments", variables.bug_id] });
    },
  });
};
