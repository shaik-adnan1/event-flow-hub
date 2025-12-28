import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Manager {
  user_id: string;
  full_name: string | null;
  email: string | null;
}

export const useManagers = () => {
  return useQuery({
    queryKey: ["managers"],
    queryFn: async (): Promise<Manager[]> => {
      // Get all users with manager role
      const { data: managerRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "manager");

      if (rolesError) throw rolesError;
      if (!managerRoles || managerRoles.length === 0) return [];

      const managerIds = managerRoles.map(r => r.user_id);

      // Get profiles for managers
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .in("user_id", managerIds);

      if (profilesError) throw profilesError;

      return profiles || [];
    },
  });
};
