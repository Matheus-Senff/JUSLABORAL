import { useState, useEffect } from "react";
import { supabase } from "@canon/integrations/supabase/client";

export function useAdminStatus(userId: string | undefined) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function check() {
      const { data } = await supabase
        .from("organization_members")
        .select("org_id, role")
        .eq("user_id", userId!)
        .in("role", ["admin", "owner"])
        .limit(1)
        .single();

      if (data) {
        setIsAdmin(true);
        setOrgId(data.org_id);
      }
      setLoading(false);
    }
    check();
  }, [userId]);

  return { isAdmin, orgId, loading };
}
