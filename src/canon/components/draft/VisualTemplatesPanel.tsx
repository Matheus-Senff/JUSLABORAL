import { useRef, useState } from "react";
import { Check, FileText, Pencil, Trash2, Upload, X } from "lucide-react";
import { Button } from "@canon/components/ui/button";
import { Input } from "@canon/components/ui/input";
import type { DocumentVisualTemplate } from "@canon/hooks/useDocumentTemplates";

interface VisualTemplatesPanelProps {
  templates: DocumentVisualTemplate[];
  loading: boolean;
  uploading: boolean;
  onUpload: (name: string, file: File) => Promise<void> | void;
  onRename: (id: string, name: string) => Promise<void> | void;
  onDelete: (template: DocumentVisualTemplate) => Promise<void> | void;
}

export default function VisualTemplatesPanel({
  templates,
  loading,
  uploading,
  onUpload,
  onRename,
  onDelete,
}: VisualTemplatesPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [templateName, setTemplateName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const handleSubmit = async () => {
    if (!selectedFile || !templateName.trim()) return;
    await onUpload(templateName.trim(), selectedFile);
    setTemplateName("");
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-secondary/30 p-4 space-y-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Templates .docx</p>
          <p className="text-xs text-muted-foreground">
            Envie arquivos Word (.docx) para usar como base oficial da exportação.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <Input
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="Nome do template, ex: Petição Inicial Padrão"
            className="rounded-xl"
          />
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
            Escolher .docx
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            setSelectedFile(file);
            if (file && !templateName.trim()) {
              setTemplateName(file.name.replace(/\.docx$/i, ""));
            }
          }}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
          <span>{selectedFile ? `Arquivo selecionado: ${selectedFile.name}` : "Nenhum arquivo selecionado"}</span>
          <Button
            type="button"
            className="rounded-xl"
            disabled={!selectedFile || !templateName.trim() || uploading}
            onClick={handleSubmit}
          >
            {uploading ? "Salvando..." : "Salvar template"}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-border bg-secondary/20 p-6 text-center text-sm text-muted-foreground">
          Carregando templates...
        </div>
      ) : templates.length === 0 ? (
        <div className="rounded-2xl border border-border bg-secondary/20 p-8 text-center">
          <FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm font-medium text-foreground">Nenhum template .docx salvo</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Seus arquivos Word aparecerão aqui para seleção na exportação.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {templates.map((template) => {
            const isEditing = editingId === template.id;

            return (
              <div key={template.id} className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
                <div className="aspect-[4/5] bg-secondary/30 flex flex-col items-center justify-center gap-3 px-4 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-background/70">
                    <FileText className="h-8 w-8 text-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Template Word</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{template.kind === "docx" ? "Pronto para exportar" : "Formato legado"}</p>
                  </div>
                </div>

                <div className="space-y-3 p-3">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="h-9 rounded-xl"
                      />
                      <Button
                        type="button"
                        size="icon"
                        className="h-9 w-9 rounded-xl"
                        disabled={!editingName.trim()}
                        onClick={async () => {
                          await onRename(template.id, editingName.trim());
                          setEditingId(null);
                          setEditingName("");
                        }}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="h-9 w-9 rounded-xl"
                        onClick={() => {
                          setEditingId(null);
                          setEditingName("");
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">{template.name}</p>
                        <p className="truncate text-[11px] text-muted-foreground">{template.image_filename || "Template .docx"}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-xl"
                          onClick={() => {
                            setEditingId(template.id);
                            setEditingName(template.name);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-xl text-muted-foreground hover:text-destructive"
                          onClick={() => onDelete(template)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
