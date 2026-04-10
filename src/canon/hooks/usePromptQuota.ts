import { useCallback, useEffect, useState } from "react";
import { supabase } from "@canon/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

const ADMIN_EMAIL = "senffcontatos@gmail.com";

interface PromptQuotaState {
  promptCount: number;
  promptLimit: number;
  accessBlocked: boolean;
}

const DEFAULT_STATE: PromptQuotaState = {
  promptCount: 0,
  promptLimit: 50,
  accessBlocked: false,
};

export function usePromptQuota() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [state, setState] = useState<PromptQuotaState>(DEFAULT_STATE);
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.email === ADMIN_EMAIL;

  const fetchQuota = useCallback(async () => {
    if (!user) {
      setState(DEFAULT_STATE);
      setLoading(false);
      return;
    }

    if (isAdmin) {
      setState({ promptCount: 0, promptLimit: 999999, accessBlocked: false });
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await (supabase.from("profiles") as any)
      .select("prompt_count, prompt_limit, access_blocked")
      .eq("id", user.id)
      .single();

    if (error) {
      setState(DEFAULT_STATE);
    } else {
      const promptCount = Number(data?.prompt_count ?? 0);
      const promptLimit = Number(data?.prompt_limit ?? 50);
      const accessBlocked = Boolean(data?.access_blocked) || promptCount >= promptLimit;
      setState({ promptCount, promptLimit, accessBlocked });
    }

    setLoading(false);
  }, [isAdmin, user]);

  useEffect(() => {
    fetchQuota();
  }, [fetchQuota]);

  const consumePrompt = useCallback(async () => {
    if (!user) return false;
    if (isAdmin) return true;

    const { data, error } = await (supabase as any).rpc("consume_prompt_quota", { _user_id: user.id });

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível validar o limite de uso.",
        variant: "destructive",
      });
      return false;
    }

    const quota = Array.isArray(data) ? data[0] : data;
    const nextState = {
      promptCount: Number(quota?.prompt_count ?? state.promptCount),
      promptLimit: Number(quota?.prompt_limit ?? state.promptLimit),
      accessBlocked: Boolean(quota?.access_blocked),
    };

    setState(nextState);

    if (!quota?.allowed) {
      toast({
        title: "Limite atingido",
        description: "Seu teste terminou. Escolha um plano para continuar.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  }, [isAdmin, state.promptCount, state.promptLimit, toast, user]);

  return {
    ...state,
    remaining: Math.max(state.promptLimit - state.promptCount, 0),
    loading,
    fetchQuota,
    consumePrompt,
  };
}
