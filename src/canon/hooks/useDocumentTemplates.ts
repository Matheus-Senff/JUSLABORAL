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
    try {
      const { data, error } = await supabase
        .from("document_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Erro ao carregar templates do Supabase:", error);
        // Se der erro (tabela não existe, sem permissão, etc), usa array vazio
        setTemplates([]);
        setLoading(false);
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
    } catch (err) {
      console.error("Erro ao processar templates:", err);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, [toast, user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const uploadTemplate = useCallback(async (name: string, file: File) => {
    if (!user) return;

    setUploading(true);

    const fileExt = file.name.split(".").pop()?.toLowerCase() || "docx";
    const effectiveMimeType = file.type || (fileExt === "docx" ? DOCX_MIME_TYPE : `image/${fileExt}`);
    const filePath = `${user.id}/${crypto.randomUUID()}-${createSafeFileName(file.name)}`;

    const { error: uploadError } = await supabase.storage
      .from(DOCUMENT_TEMPLATES_BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        contentType: effectiveMimeType,
        upsert: false,
      });

    if (uploadError) {
      setUploading(false);
      const detail = uploadError.message?.includes("Bucket not found")
        ? "Bucket 'document-templates' não existe. Execute o schema.sql no Supabase."
        : uploadError.message;
      toast({ title: "Erro no upload", description: detail, variant: "destructive" });
      return;
    }

    const { error: insertError } = await supabase.from("document_templates").insert({
      user_id: user.id,
      name,
      image_path: filePath,
      image_filename: file.name,
      mime_type: effectiveMimeType,
    });

    if (insertError) {
      await supabase.storage.from(DOCUMENT_TEMPLATES_BUCKET).remove([filePath]);
      setUploading(false);
      const detail = [insertError.message, insertError.details, insertError.hint].filter(Boolean).join(" — ");
      toast({ title: "Erro ao salvar template", description: detail || "Verifique as políticas RLS no Supabase", variant: "destructive" });
      return;
    }

    await refresh();
    setUploading(false);
    toast({ title: "Template salvo" });
  }, [refresh, toast, user]);

  const renameTemplate = useCallback(async (id: string, name: string) => {
    try {
      const { error } = await supabase
        .from("document_templates")
        .update({ name })
        .eq("id", id);

      if (error) {
        console.error("Erro ao renomear template:", error);
        toast({ title: "Erro", description: error.message, variant: "destructive" });
        return;
      }

      setTemplates((prev) => prev.map((template) => (template.id === id ? { ...template, name } : template)));
      toast({ title: "Nome atualizado" });
    } catch (err: any) {
      console.error("Erro ao renomear:", err);
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  }, [toast]);

  const deleteTemplate = useCallback(async (template: DocumentVisualTemplate) => {
    try {
      const { error: storageError } = await supabase.storage
        .from(DOCUMENT_TEMPLATES_BUCKET)
        .remove([template.image_path]);

      if (storageError) {
        console.error("Erro ao deletar storage:", storageError);
        toast({ title: "Erro", description: storageError.message, variant: "destructive" });
        return;
      }

      const { error } = await supabase.from("document_templates").delete().eq("id", template.id);

      if (error) {
        console.error("Erro ao deletar template do DB:", error);
        toast({ title: "Erro", description: error.message, variant: "destructive" });
        return;
      }

      setTemplates((prev) => prev.filter((item) => item.id !== template.id));
      toast({ title: "Template removido" });
    } catch (err: any) {
      console.error("Erro ao remover template:", err);
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  }, [toast]);

  // Converter DOCX para template de texto - permite usar Modelos Word como templates
  const convertDocxToTextTemplate = useCallback(async (file: File, templateName: string) => {
    try {
      // Importar função de extração localmente aqui
      const { extractStructuredTextFromFile } = await import("@canon/lib/document-text");

      const extracted = await extractStructuredTextFromFile(file);
      if (!extracted.text.trim()) {
        toast({ title: "Erro", description: "Não foi possível extrair texto do arquivo DOCX", variant: "destructive" });
        return null;
      }

      return {
        name: templateName || file.name.replace(/\.docx?$/i, ""),
        category: "modelo", // categoria detectada automaticamente
        structure: {
          content: extracted.text,
          texto: extracted.text,
          kind: "docx",
          sourceFile: file.name,
          extractedAt: new Date().toISOString(),
        }
      };
    } catch (err: any) {
      console.error("Erro ao converter DOCX para template:", err);
      toast({ title: "Erro", description: "Falha ao processar arquivo DOCX", variant: "destructive" });
      return null;
    }
  }, [toast]);

  return {
    templates,
    loading,
    uploading,
    refresh,
    uploadTemplate,
    renameTemplate,
    deleteTemplate,
    convertDocxToTextTemplate, // Nova funcionalidade
  };
}
