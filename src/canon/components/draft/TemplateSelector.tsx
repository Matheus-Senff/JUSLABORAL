import { motion } from "framer-motion";
import { FileText, ArrowLeft } from "lucide-react";
import type { UserTemplate } from "@canon/hooks/useLibrary";

interface TemplateSelectorProps {
  templates: UserTemplate[];
  onSelect: (template: string) => void;
  onBack: () => void;
}

export default function TemplateSelector({ templates, onSelect, onBack }: TemplateSelectorProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="px-6 pt-3 shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-2.5 py-[5px] rounded-md border border-border text-[10px] hover:border-foreground transition-all text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" />
          Voltar
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-10 md:px-20">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-lg space-y-8"
        >
          <div className="text-center select-none">
            <h2 className="text-xl font-serif font-normal text-foreground mb-2">
              Selecione o Modelo
            </h2>
            <p className="text-xs text-muted-foreground">
              Escolha o modelo jurídico para gerar o rascunho com base nos documentos carregados.
            </p>
          </div>

          <div className="space-y-3">
            {templates.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border px-5 py-10 text-center">
                <FileText className="mx-auto mb-3 h-5 w-5 text-muted-foreground/40" />
                <p className="text-sm text-foreground">Nenhum modelo salvo</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Importe ou salve um modelo na Biblioteca para ele aparecer aqui.
                </p>
              </div>
            )}

            {templates.map((template, i) => (
              <motion.button
                key={template.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                onClick={() => onSelect(template.id)}
                className="w-full group flex items-center gap-4 p-4 rounded-lg border border-border bg-transparent hover:border-foreground hover:bg-foreground/5 transition-all text-left"
              >
                <div className="shrink-0 h-10 w-10 rounded-md border border-border flex items-center justify-center group-hover:border-foreground transition-colors">
                  <FileText className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{template.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {template.category} · {template.font_family || "Times New Roman"} {template.font_size || 12}pt
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
