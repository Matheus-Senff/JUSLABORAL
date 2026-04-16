import { useState } from "react";
import { Star, Pencil, Trash2, MessageSquarePlus } from "lucide-react";
import { useChat, type ChatThread } from "@canon/contexts/ChatContext";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarHistoryProps {
  expanded: boolean;
  onToggle: () => void;
}

function groupByDate(threads: ChatThread[]) {
  const now = Date.now();
  const dayMs = 86_400_000;
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const yesterdayStart = todayStart - dayMs;
  const last30Start = todayStart - 30 * dayMs;

  const pinned: ChatThread[] = [];
  const today: ChatThread[] = [];
  const yesterday: ChatThread[] = [];
  const last30: ChatThread[] = [];
  const older: ChatThread[] = [];

  for (const t of threads) {
    if (t.isPinned) { pinned.push(t); continue; }
    if (t.lastModified >= todayStart) today.push(t);
    else if (t.lastModified >= yesterdayStart) yesterday.push(t);
    else if (t.lastModified >= last30Start) last30.push(t);
    else older.push(t);
  }

  return { pinned, today, yesterday, last30, older };
}

export default function SidebarHistory({ expanded, onToggle }: SidebarHistoryProps) {
  const { threads, activeThreadId, setActiveThread, createThread, deleteThread, renameThread, pinThread } = useChat();
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);

  const sorted = [...threads].sort((a, b) => b.lastModified - a.lastModified);
  const groups = groupByDate(sorted);

  const startRename = (t: ChatThread) => {
    setRenamingId(t.id);
    setRenameValue(t.title);
  };

  const commitRename = () => {
    if (renamingId && renameValue.trim()) {
      renameThread(renamingId, renameValue.trim());
    }
    setRenamingId(null);
  };

  const handleNewChat = () => {
    createThread("livre");
  };

  const renderThread = (t: ChatThread) => {
    const isActive = t.id === activeThreadId;

    return (
      <div
        key={t.id}
        onClick={() => setActiveThread(t.id)}
        className={`group flex items-center gap-1.5 rounded-lg px-2 py-1.5 cursor-pointer transition-colors text-xs ${
          isActive ? "bg-primary/15 text-foreground" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
        }`}
      >
        {renamingId === t.id ? (
          <input
            autoFocus
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") setRenamingId(null); }}
            className="flex-1 min-w-0 bg-transparent border-b border-primary/40 outline-none text-xs text-foreground"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="flex-1 truncate">{t.title}</span>
        )}

        <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); pinThread(t.id); }}
            className={`p-0.5 rounded hover:bg-secondary ${t.isPinned ? "text-yellow-400" : ""}`}
            title={t.isPinned ? "Desfavoritar" : "Favoritar"}
          >
            <Star className={`h-3 w-3 ${t.isPinned ? "fill-yellow-400" : ""}`} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); startRename(t); }}
            className="p-0.5 rounded hover:bg-secondary"
            title="Renomear"
          >
            <Pencil className="h-3 w-3" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); deleteThread(t.id); }}
            className="p-0.5 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
            title="Excluir"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
    );
  };

  const renderGroup = (label: string, items: ChatThread[]) => {
    if (!items.length) return null;
    return (
      <div className="space-y-0.5">
        <p className="px-2 pt-2 pb-1 text-[9px] uppercase tracking-wider text-muted-foreground/60 font-semibold">{label}</p>
        {items.map(renderThread)}
      </div>
    );
  };

  return (
    <AnimatePresence initial={false}>
      <motion.aside
        initial={{ width: expanded ? 220 : 0 }}
        animate={{ width: expanded ? 220 : 0 }}
        transition={{ duration: 0.2 }}
        className="relative shrink-0 border-r border-border/50 bg-card/30 flex flex-col overflow-visible"
      >
        {expanded && (
          <div className="flex flex-col h-full w-[220px] overflow-hidden">
            {/* Botões principais centralizados horizontalmente, ocupando toda a largura */}
            <div className="flex flex-col gap-1.5 px-2 py-2 border-b border-border/40">
              <button
                onClick={handleNewChat}
                className="flex items-center justify-center gap-2 w-full px-2 py-2 text-xs font-medium rounded-lg bg-primary/15 text-primary hover:bg-primary/25 transition-colors"
              >
                <MessageSquarePlus className="h-3.5 w-3.5" />
                Nova Conversa
              </button>
              <button
                onClick={() => setShowFavorites(v => !v)}
                className={`flex items-center justify-center gap-2 w-full px-2 py-2 text-xs font-medium rounded-lg transition-colors ${
                  showFavorites ? "bg-yellow-500/20 text-yellow-400" : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                }`}
              >
                <Star className="h-3.5 w-3.5" />
                Favoritos
              </button>
            </div>

            {/* Lista de conversas */}
            <div className="flex-1 px-1 py-1 space-y-1 overflow-y-auto">
              {threads.length === 0 ? (
                <p className="text-[10px] text-muted-foreground/60 text-center py-8">Nenhuma conversa ainda</p>
              ) : showFavorites ? (
                <>
                  <p className="px-2 pt-2 pb-1 text-[9px] uppercase tracking-wider text-muted-foreground/60 font-semibold">Favoritos</p>
                  {groups.pinned.length === 0 ? (
                    <p className="text-[10px] text-muted-foreground/60 text-center py-4">Nenhum favorito ainda</p>
                  ) : groups.pinned.map(renderThread)}
                </>
              ) : (
                <>
                  <p className="px-2 pt-2 pb-1 text-[9px] uppercase tracking-wider text-muted-foreground/60 font-semibold">Conversa</p>
                  {renderGroup("Hoje", groups.today)}
                  {renderGroup("Ontem", groups.yesterday)}
                  {renderGroup("Últimos 30 dias", groups.last30)}
                  {renderGroup("Mais antigas", groups.older)}
                </>
              )}
            </div>
          </div>
        )}
      </motion.aside>
    </AnimatePresence>
  );
}
