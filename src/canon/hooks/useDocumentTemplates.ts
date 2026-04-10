import { useCallback, useEffect, useState } from "react";
import { supabase } from "@canon/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

const DOCUMENT_TEMPLATES_BUCKET = "document-templates";

export interface DocumentVisualTemplate {
  id: string;
  user_id: string;
  name: string;
  image_path: string;
  image_filename: string | null;
  mime_type: string | null;
  created_at: string;
  updated_at: string;
  preview_url: string | null;
  kind: "docx" | "image";
}

const DOCX_MIME_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const inferTemplateKind = (fileName: string | null, mimeType: string | null): "docx" | "image" => {
  const normalizedName = fileName?.toLowerCase() || "";
  const normalizedMime = mimeType?.toLowerCase() || "";
  if (normalizedMime.includes("wordprocessingml") || normalizedName.endsWith(".docx")) return "docx";
  return "image";
};

const createSafeFileName = (fileName: string) =>
  fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();

export function useDocumentTemplates() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<DocumentVisualTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setTemplates([]);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("document_templates" as any)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setLoading(false);
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }

    const rows = ((data || []) as unknown) as Array<Omit<DocumentVisualTemplate, "preview_url" | "kind">>;

    const rowsWithPreview = await Promise.all(
      rows.map(async (template) => {
        const kind = inferTemplateKind(template.image_filename, template.mime_type);
        const signedUrlData = kind === "image"
          ? (await supabase.storage.from(DOCUMENT_TEMPLATES_BUCKET).createSignedUrl(template.image_path, 60 * 60)).data
          : null;

        return {
          ...template,
          preview_url: signedUrlData?.signedUrl || null,
          kind,
        } satisfies DocumentVisualTemplate;
      }),
    );

    setTemplates(rowsWithPreview);
    setLoading(false);
  }, [toast, user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const uploadTemplate = useCallback(async (name: string, file: File) => {
    if (!user) return;

    setUploading(true);

    const fileExt = file.name.split(".").pop()?.toLowerCase() || "docx";
    const filePath = `${user.id}/${crypto.randomUUID()}-${createSafeFileName(file.name)}`;

    const { error: uploadError } = await supabase.storage
      .from(DOCUMENT_TEMPLATES_BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      setUploading(false);
      toast({ title: "Erro no upload", description: uploadError.message, variant: "destructive" });
      return;
    }

    const { error: insertError } = await supabase.from("document_templates" as any).insert({
      user_id: user.id,
      name,
      image_path: filePath,
      image_filename: file.name,
        mime_type: file.type || (fileExt === "docx" ? DOCX_MIME_TYPE : `image/${fileExt}`),
    });

    if (insertError) {
      await supabase.storage.from(DOCUMENT_TEMPLATES_BUCKET).remove([filePath]);
      setUploading(false);
      toast({ title: "Erro", description: insertError.message, variant: "destructive" });
      return;
    }

    await refresh();
    setUploading(false);
    toast({ title: "Template salvo" });
  }, [refresh, toast, user]);

  const renameTemplate = useCallback(async (id: string, name: string) => {
    const { error } = await supabase
      .from("document_templates" as any)
      .update({ name })
      .eq("id", id);

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }

    setTemplates((prev) => prev.map((template) => (template.id === id ? { ...template, name } : template)));
    toast({ title: "Nome atualizado" });
  }, [toast]);

  const deleteTemplate = useCallback(async (template: DocumentVisualTemplate) => {
    const { error: storageError } = await supabase.storage
      .from(DOCUMENT_TEMPLATES_BUCKET)
      .remove([template.image_path]);

    if (storageError) {
      toast({ title: "Erro", description: storageError.message, variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("document_templates" as any).delete().eq("id", template.id);

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }

    setTemplates((prev) => prev.filter((item) => item.id !== template.id));
    toast({ title: "Template removido" });
  }, [toast]);

  return {
    templates,
    loading,
    uploading,
    refresh,
    uploadTemplate,
    renameTemplate,
    deleteTemplate,
  };
}
