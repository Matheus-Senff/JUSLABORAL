import { useState, useEffect, useCallback } from "react";
import { supabase } from "@canon/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface UserTemplate {
  id: string;
  name: string;
  category: string;
  structure: Record<string, any>;
  font_family: string;
  font_size: number;
  margins: { top: number; bottom: number; left: number; right: number };
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface SavedPrompt {
  id: string;
  title: string;
  content: string;
  is_favorite: boolean;
  usage_count: number;
  created_at: string;
}

export interface HistoryEntry {
  id: string;
  template_name: string | null;
  prompt_used: string | null;
  extension_mode: string;
  effort_level: number;
  result_text: string;
  created_at: string;
}

export interface SharedTemplate {
  id: string;
  org_id: string;
  shared_by: string;
  name: string;
  category: string;
  structure: Record<string, any>;
  font_family: string;
  font_size: number;
  margins: { top: number; bottom: number; left: number; right: number };
  created_at: string;
}

export interface SharedPrompt {
  id: string;
  org_id: string;
  shared_by: string;
  title: string;
  content: string;
  usage_count: number;
  created_at: string;
}

export interface OrgInfo {
  id: string;
  name: string;
  plan: string;
}

export function useLibrary() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<UserTemplate[]>([]);
  const [prompts, setPrompts] = useState<SavedPrompt[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [sharedTemplates, setSharedTemplates] = useState<SharedTemplate[]>([]);
  const [sharedPrompts, setSharedPrompts] = useState<SharedPrompt[]>([]);
  const [orgInfo, setOrgInfo] = useState<OrgInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchTemplates = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("user_templates")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.warn("Erro ao carregar user_templates:", error?.message);
        setTemplates([]);
        return;
      }
      if (data) setTemplates(data as unknown as UserTemplate[]);
    } catch (err) {
      console.error("Erro ao buscar templates:", err);
      setTemplates([]);
    }
  }, [user]);

  const fetchPrompts = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("saved_prompts")
        .select("*")
        .order("is_favorite", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) {
        console.warn("Erro ao carregar saved_prompts:", error?.message);
        setPrompts([]);
        return;
      }
      if (data) setPrompts(data as unknown as SavedPrompt[]);
    } catch (err) {
      console.error("Erro ao buscar prompts:", err);
      setPrompts([]);
    }
  }, [user]);

  const fetchHistory = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("generation_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) {
        console.warn("Erro ao carregar generation_history:", error?.message);
        setHistory([]);
        return;
      }
      if (data) setHistory(data as unknown as HistoryEntry[]);
    } catch (err) {
      console.error("Erro ao buscar histórico:", err);
      setHistory([]);
    }
  }, [user]);

  const fetchOrgData = useCallback(async () => {
    if (!user) return;
    try {
      // Check if user belongs to an org
      const { data: membership, error: memberError } = await supabase
        .from("organization_members" as any)
        .select("org_id")
        .eq("user_id", user.id)
        .limit(1);

      if (memberError) {
        console.warn("Erro ao carregar organization_members:", memberError?.message);
        setOrgInfo(null);
        return;
      }

      if (!membership || membership.length === 0) {
        setOrgInfo(null);
        return;
      }

      const orgId = (membership[0] as any).org_id;

      // Get org info
      const { data: org, error: orgError } = await supabase
        .from("organizations" as any)
        .select("*")
        .eq("id", orgId)
        .single();

      if (orgError) {
        console.warn("Erro ao carregar organizations:", orgError?.message);
        setOrgInfo(null);
        return;
      }

      if (org) {
        const o = org as any;
        setOrgInfo({ id: o.id, name: o.name, plan: o.plan });

        const [templatesRes, promptsRes] = await Promise.all([
          supabase.from("shared_templates" as any).select("*").eq("org_id", orgId).order("created_at", { ascending: false }),
          supabase.from("shared_prompts" as any).select("*").eq("org_id", orgId).order("created_at", { ascending: false }),
        ]);
        if (templatesRes.data) setSharedTemplates(templatesRes.data as unknown as SharedTemplate[]);
        if (promptsRes.data) setSharedPrompts(promptsRes.data as unknown as SharedPrompt[]);
      }
    } catch (err) {
      console.error("Erro ao buscar dados da organização:", err);
      setOrgInfo(null);
    }
  }, [user]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchTemplates(), fetchPrompts(), fetchHistory(), fetchOrgData()]);
    setLoading(false);
  }, [fetchTemplates, fetchPrompts, fetchHistory, fetchOrgData]);

  useEffect(() => {
    if (user) refresh();
  }, [user, refresh]);

  // Realtime subscription for shared items
  useEffect(() => {
    if (!orgInfo?.id) return;

    const channel = supabase
      .channel("shared-assets")
      .on("postgres_changes", { event: "*", schema: "public", table: "shared_templates", filter: `org_id=eq.${orgInfo.id}` }, () => {
        fetchOrgData();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "shared_prompts", filter: `org_id=eq.${orgInfo.id}` }, () => {
        fetchOrgData();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [orgInfo?.id, orgInfo?.plan, fetchOrgData]);

  const addTemplate = useCallback(async (name: string, category: string, structure: Record<string, any> = {}) => {
    if (!user) return;
    try {
      const { error } = await supabase.from("user_templates").insert({
        user_id: user.id,
        name,
        category,
        structure,
      } as any);
      if (error) {
        console.error("Erro ao adicionar template:", error?.message);
        toast({ title: "Erro", description: error?.message || "Falha ao salvar modelo", variant: "destructive" });
      } else {
        toast({ title: "Modelo criado" });
        fetchTemplates();
      }
    } catch (err: any) {
      console.error("Erro ao criar template:", err);
      toast({ title: "Erro", description: err.message || "Falha ao salvar modelo", variant: "destructive" });
    }
  }, [user, toast, fetchTemplates]);

  const deleteTemplate = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from("user_templates").delete().eq("id", id);
      if (error) {
        console.error("Erro ao deletar template:", error?.message);
        toast({ title: "Erro", description: error?.message, variant: "destructive" });
      } else {
        setTemplates((prev) => prev.filter((t) => t.id !== id));
        toast({ title: "Modelo excluído" });
      }
    } catch (err: any) {
      console.error("Erro ao deletar template:", err);
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  }, [toast]);

  const savePrompt = useCallback(async (title: string, content: string) => {
    if (!user) return;
    const { error } = await supabase.from("saved_prompts").insert({
      user_id: user.id,
      title,
      content,
    } as any);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Prompt salvo" });
      fetchPrompts();
    }
  }, [user, toast, fetchPrompts]);

  const toggleFavorite = useCallback(async (id: string, current: boolean) => {
    const { error } = await supabase
      .from("saved_prompts")
      .update({ is_favorite: !current } as any)
      .eq("id", id);
    if (!error) {
      setPrompts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_favorite: !current } : p))
      );
    }
  }, []);

  const deletePrompt = useCallback(async (id: string) => {
    const { error } = await supabase.from("saved_prompts").delete().eq("id", id);
    if (!error) {
      setPrompts((prev) => prev.filter((p) => p.id !== id));
      toast({ title: "Prompt excluído" });
    }
  }, [toast]);

  const saveToHistory = useCallback(async (entry: Omit<HistoryEntry, "id" | "created_at">) => {
    if (!user) return;
    await supabase.from("generation_history").insert({
      user_id: user.id,
      ...entry,
    } as any);
    fetchHistory();
  }, [user, fetchHistory]);

  const updateTemplate = useCallback(async (id: string, updates: Partial<UserTemplate>) => {
    try {
      const { error } = await supabase
        .from("user_templates")
        .update(updates as any)
        .eq("id", id);
      if (error) {
        console.error("Erro ao atualizar template:", error?.message);
        toast({ title: "Erro", description: error?.message, variant: "destructive" });
      } else {
        fetchTemplates();
        toast({ title: "Modelo atualizado" });
      }
    } catch (err: any) {
      console.error("Erro ao atualizar template:", err);
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  }, [toast, fetchTemplates]);

  // Shared asset operations
  const shareTemplate = useCallback(async (name: string, category: string) => {
    if (!user || !orgInfo) return;
    const { error } = await supabase.from("shared_templates" as any).insert({
      org_id: orgInfo.id,
      shared_by: user.id,
      name,
      category,
      structure: {},
    });
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Modelo compartilhado" });
      fetchOrgData();
    }
  }, [user, orgInfo, toast, fetchOrgData]);

  const sharePrompt = useCallback(async (title: string, content: string) => {
    if (!user || !orgInfo) return;
    const { error } = await supabase.from("shared_prompts" as any).insert({
      org_id: orgInfo.id,
      shared_by: user.id,
      title,
      content,
    });
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Prompt compartilhado" });
      fetchOrgData();
    }
  }, [user, orgInfo, toast, fetchOrgData]);

  const deleteSharedTemplate = useCallback(async (id: string) => {
    const { error } = await supabase.from("shared_templates" as any).delete().eq("id", id);
    if (!error) {
      setSharedTemplates((prev) => prev.filter((t) => t.id !== id));
      toast({ title: "Modelo removido da equipe" });
    }
  }, [toast]);

  const deleteSharedPrompt = useCallback(async (id: string) => {
    const { error } = await supabase.from("shared_prompts" as any).delete().eq("id", id);
    if (!error) {
      setSharedPrompts((prev) => prev.filter((p) => p.id !== id));
      toast({ title: "Prompt removido da equipe" });
    }
  }, [toast]);

  return {
    templates, prompts, history, loading,
    sharedTemplates, sharedPrompts, orgInfo,
    addTemplate, deleteTemplate, updateTemplate,
    savePrompt, toggleFavorite, deletePrompt,
    saveToHistory, refresh,
    shareTemplate, sharePrompt, deleteSharedTemplate, deleteSharedPrompt,
  };
}
