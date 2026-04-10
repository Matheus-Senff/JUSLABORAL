import { useState, useEffect, useCallback } from "react";
import { supabase } from "@canon/integrations/supabase/client";
import { useAuth } from "./useAuth";

const ADMIN_EMAIL = "senffcontatos@gmail.com";

export function useCredits() {
  const { user } = useAuth();
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.email === ADMIN_EMAIL;

  const fetchCredits = useCallback(async () => {
    if (!user) { setCredits(null); setLoading(false); return; }
    if (isAdmin) { setCredits(9999); setLoading(false); return; }
    const { data } = await supabase
      .from("profiles")
      .select("credits")
      .eq("id", user.id)
      .single();
    setCredits((data as any)?.credits ?? 0);
    setLoading(false);
  }, [user, isAdmin]);

  useEffect(() => { fetchCredits(); }, [fetchCredits]);

  const deductCredit = useCallback(async () => {
    if (isAdmin) return true;
    if (!user || credits === null || credits <= 0) return false;
    const { error } = await supabase
      .from("profiles")
      .update({ credits: credits - 1 } as any)
      .eq("id", user.id);
    if (error) return false;
    setCredits(credits - 1);
    return true;
  }, [user, credits, isAdmin]);

  return { credits, loading, deductCredit, refetch: fetchCredits, hasCredits: isAdmin || (credits ?? 0) > 0, isAdmin };
}
