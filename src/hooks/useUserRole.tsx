import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "moderator" | "user";

interface UseUserRoleReturn {
  role: AppRole | null;
  loading: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  isUser: boolean;
  refetch: () => Promise<void>;
}

export const useUserRole = (): UseUserRoleReturn => {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRole = useCallback(async () => {
    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.rpc("get_user_role", {
        _user_id: user.id,
      });

      if (error) {
        console.error("Error fetching user role:", error);
        setRole("user");
      } else {
        setRole(data as AppRole || "user");
      }
    } catch (err) {
      console.error("Error fetching role:", err);
      setRole("user");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRole();
  }, [fetchRole]);

  return {
    role,
    loading,
    isAdmin: role === "admin",
    isModerator: role === "moderator",
    isUser: role === "user",
    refetch: fetchRole,
  };
};
