import { useState, useEffect, useCallback } from "react";
import { supabase } from "@canon/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

// chave usada pra persistir modelos localmente como backup
const LS_TEMPLATES_KEY = "canon_user_templates_v1";

function lsLoadTemplates(userId: string): UserTemplate[] {
  try {
    const raw = localStorage.getItem(`${LS_TEMPLATES_KEY}_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function lsSaveTemplates(userId: string, list: UserTemplate[]) {
  try {
    localStorage.setItem(`${LS_TEMPLATES_KEY}_${userId}`, JSON.stringify(list));
  } catch { /* quota exceeded */ }
}

function lsRemoveTemplate(userId: string, id: string) {
  const current = lsLoadTemplates(userId);
  lsSaveTemplates(userId, current.filter((t) => t.id !== id));
}

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

export interface OrgMember {
  id: string;
  org_id: string;
  nome: string;
  email: string;
  nivel: string;
  equipe: string;
  setor: string;
  created_at?: string;
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
  const [orgMembers, setOrgMembers] = useState<OrgMember[]>([]);
  const [orgInfo, setOrgInfo] = useState<OrgInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchTemplates = useCallback(async () => {
    if (!user) return;
    // carrega local primeiro pra não travar a UI
    const local = lsLoadTemplates(user.id);
    if (local.length > 0) setTemplates(local);

    try {
      const { data, error } = await supabase
        .from("user_templates")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) {
        // Supabase falhou — usa o que veio do localStorage
        if (local.length === 0) setTemplates([]);
        return;
      }
      if (data && data.length > 0) {
        const merged = data as unknown as UserTemplate[];
        // mescla: local tem priority se o id não veio do supabase
        const supabaseIds = new Set(merged.map((t) => t.id));
        const onlyLocal = local.filter((t) => !supabaseIds.has(t.id));
        const combined = [...merged, ...onlyLocal].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setTemplates(combined);
        lsSaveTemplates(user.id, combined);
      } else if (local.length > 0) {
        setTemplates(local);
      } else {
        setTemplates([]);
      }
    } catch (err) {
      // fallback silencioso pro localStorage
      if (local.length === 0) setTemplates([]);
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

        const [templatesRes, promptsRes, membersRes] = await Promise.all([
          supabase.from("shared_templates" as any).select("*").eq("org_id", orgId).order("created_at", { ascending: false }),
          supabase.from("shared_prompts" as any).select("*").eq("org_id", orgId).order("created_at", { ascending: false }),
          supabase.from("team_members" as any).select("*").eq("org_id", orgId).order("created_at", { ascending: false }),
        ]);
        if (templatesRes.data) setSharedTemplates(templatesRes.data as unknown as SharedTemplate[]);
        if (promptsRes.data) setSharedPrompts(promptsRes.data as unknown as SharedPrompt[]);
        if (membersRes.data) setOrgMembers(membersRes.data as unknown as OrgMember[]);
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

    const now = new Date().toISOString();
    const localEntry: UserTemplate = {
      id: crypto.randomUUID(),
      name,
      category,
      structure,
      font_family: "Times New Roman",
      font_size: 12,
      margins: { top: 30, bottom: 20, left: 30, right: 20 },
      is_default: false,
      created_at: now,
      updated_at: now,
    };

    try {
      const { data, error } = await supabase.from("user_templates").insert({
        user_id: user.id,
        name,
        category,
        structure,
      } as any).select().single();

      if (error) {
        // RLS ou sem conexão — persiste só no localStorage
        const current = lsLoadTemplates(user.id);
        const updated = [localEntry, ...current];
        lsSaveTemplates(user.id, updated);
        setTemplates(updated);
        toast({ title: "Modelo salvo localmente", description: "Sincronize quando as políticas do banco estiverem configuradas." });
      } else {
        const saved = (data ?? localEntry) as unknown as UserTemplate;
        const current = lsLoadTemplates(user.id);
        const updated = [saved, ...current.filter((t) => t.id !== saved.id)];
        lsSaveTemplates(user.id, updated);
        setTemplates(updated);
        toast({ title: "Modelo criado" });
      }
    } catch {
      const current = lsLoadTemplates(user.id);
      const updated = [localEntry, ...current];
      lsSaveTemplates(user.id, updated);
      setTemplates(updated);
      toast({ title: "Modelo salvo localmente" });
    }
  }, [user, toast]);

  const deleteTemplate = useCallback(async (id: string) => {
    if (!user) return;
    try {
      const { error } = await supabase.from("user_templates").delete().eq("id", id);
      if (error) {
        toast({ title: "Erro ao excluir no servidor", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Modelo excluído" });
      }
    } catch { /* ignora erro de rede */ }
    // remove localmente independente do resultado remoto
    lsRemoveTemplate(user.id, id);
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  }, [user, toast]);

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

  const addOrgMember = useCallback(async (member: Omit<OrgMember, "id" | "org_id" | "created_at">) => {
    if (!orgInfo) return;
    try {
      const { error } = await supabase.from("team_members" as any).insert({
        org_id: orgInfo.id,
        ...member,
      });
      if (error) {
        toast({ title: "Erro ao adicionar membro", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Membro adicionado" });
        fetchOrgData();
      }
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  }, [orgInfo, toast, fetchOrgData]);

  const updateOrgMember = useCallback(async (id: string, updates: Partial<OrgMember>) => {
    try {
      const { error } = await supabase.from("team_members" as any).update(updates).eq("id", id);
      if (error) {
        toast({ title: "Erro ao atualizar membro", description: error.message, variant: "destructive" });
      } else {
        setOrgMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
        toast({ title: "Membro atualizado" });
      }
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  }, [toast]);

  const removeOrgMember = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from("team_members" as any).delete().eq("id", id);
      if (error) {
        toast({ title: "Erro ao remover membro", description: error.message, variant: "destructive" });
      } else {
        setOrgMembers((prev) => prev.filter((m) => m.id !== id));
        toast({ title: "Membro removido" });
      }
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  }, [toast]);

  return {
    templates, prompts, history, loading,
    sharedTemplates, sharedPrompts, orgInfo,
    orgMembers,
    addTemplate, deleteTemplate, updateTemplate,
    savePrompt, toggleFavorite, deletePrompt,
    saveToHistory, refresh,
    shareTemplate, sharePrompt, deleteSharedTemplate, deleteSharedPrompt,
    addOrgMember, updateOrgMember, removeOrgMember,
  };
}
