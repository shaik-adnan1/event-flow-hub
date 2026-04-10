import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface QualityEngineer {
  user_id: string;
  full_name: string | null;
  email: string | null;
}

export const useQualityEngineers = () => {
  return useQuery({
    queryKey: ["quality_engineers"],
    queryFn: async (): Promise<QualityEngineer[]> => {
      const { data: qeRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "quality_engineer");

      if (rolesError) throw rolesError;
      if (!qeRoles || qeRoles.length === 0) return [];

      const qeIds = qeRoles.map(r => r.user_id);

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .in("user_id", qeIds);

      if (profilesError) throw profilesError;
      return profiles || [];
    },
  });
};
