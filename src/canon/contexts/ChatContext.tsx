import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatThread {
  id: string;
  title: string;
  messages: ChatMessage[];
  isPinned: boolean;
  lastModified: number;
  mode: "livre" | "restrito";
}

interface ChatContextValue {
  threads: ChatThread[];
  activeThreadId: string | null;
  activeThread: ChatThread | null;
  createThread: (mode: "livre" | "restrito") => string;
  deleteThread: (id: string) => void;
  renameThread: (id: string, title: string) => void;
  pinThread: (id: string) => void;
  setActiveThread: (id: string | null) => void;
  addMessage: (threadId: string, message: ChatMessage) => void;
  clearThread: (id: string) => void;
}

const STORAGE_KEY = "canon-chat-threads";

function loadThreads(): ChatThread[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveThreads(threads: ChatThread[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
  } catch {
    // quota exceeded — silently fail
  }
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [threads, setThreads] = useState<ChatThread[]>(loadThreads);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  useEffect(() => {
    saveThreads(threads);
  }, [threads]);

  const activeThread = threads.find((t) => t.id === activeThreadId) ?? null;

  const createThread = useCallback((mode: "livre" | "restrito") => {
    const id = crypto.randomUUID();
    const thread: ChatThread = {
      id,
      title: "Nova conversa",
      messages: [],
      isPinned: false,
      lastModified: Date.now(),
      mode,
    };
    setThreads((prev) => [thread, ...prev]);
    setActiveThreadId(id);
    return id;
  }, []);

  const deleteThread = useCallback((id: string) => {
    setThreads((prev) => prev.filter((t) => t.id !== id));
    setActiveThreadId((prev) => (prev === id ? null : prev));
  }, []);

  const renameThread = useCallback((id: string, title: string) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === id ? { ...t, title, lastModified: Date.now() } : t))
    );
  }, []);

  const pinThread = useCallback((id: string) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isPinned: !t.isPinned, lastModified: Date.now() } : t))
    );
  }, []);

  const addMessage = useCallback((threadId: string, message: ChatMessage) => {
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id !== threadId) return t;
        const updated = { ...t, messages: [...t.messages, message], lastModified: Date.now() };
        // Auto-title from first user message
        if (t.title === "Nova conversa" && message.role === "user") {
          updated.title = message.content.slice(0, 50) + (message.content.length > 50 ? "..." : "");
        }
        return updated;
      })
    );
  }, []);

  const clearThread = useCallback((id: string) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === id ? { ...t, messages: [], lastModified: Date.now() } : t))
    );
  }, []);

  return (
    <ChatContext.Provider
      value={{
        threads,
        activeThreadId,
        activeThread,
        createThread,
        deleteThread,
        renameThread,
        pinThread,
        setActiveThread: setActiveThreadId,
        addMessage,
        clearThread,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}
