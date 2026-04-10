import { motion } from "framer-motion";
import { ArrowLeft, Clock, FileText } from "lucide-react";
import { ScrollArea } from "@canon/components/ui/scroll-area";
import type { HistoryEntry } from "@canon/hooks/useLibrary";

interface HistoryPanelProps {
  history: HistoryEntry[];
  onBack: () => void;
  onReuse: (entry: HistoryEntry) => void;
}

export default function HistoryPanel({ history, onBack, onReuse }: HistoryPanelProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="px-6 pt-4 pb-3 shrink-0 border-b border-border/50">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border text-[11px] hover:border-foreground transition-all text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3 w-3" />
            Voltar
          </button>
          <h2 className="text-base font-semibold text-foreground">Histórico</h2>
          <div className="w-16" />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-3">
          {history.length === 0 && (
            <div className="text-center py-16 text-muted-foreground/50">
              <Clock className="h-8 w-8 mx-auto mb-3 opacity-30" />
              <p className="text-xs">Nenhuma geração registrada</p>
            </div>
          )}

          {history.map((entry, i) => (
            <motion.button
              key={entry.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => onReuse(entry)}
              className="w-full text-left p-3 rounded-lg border border-border hover:border-foreground/30 transition-all group">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-md border border-border flex items-center justify-center shrink-0 mt-0.5">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">
                    {entry.prompt_used || entry.template_name || "Geração sem prompt"}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {entry.template_name && `Modelo: ${entry.template_name} · `}
                    Nível {entry.effort_level} · {entry.extension_mode}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                    {new Date(entry.created_at).toLocaleDateString("pt-BR", {
                      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                  <p className="text-[10px] text-muted-foreground line-clamp-2 mt-1.5">
                    {entry.result_text.slice(0, 120)}...
                  </p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
