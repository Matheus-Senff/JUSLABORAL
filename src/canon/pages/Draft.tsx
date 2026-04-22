import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import LayoutIA from "../../components/LayoutIA";
import "../../components/IAGenerator.css";

import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import jusAmigoImg from "@canon/assets/jus-amigo.png";
import {
  FileText, Sparkles,
  Download, Loader2,
  FolderOpen, Cloud, UploadCloud, Mail,
  LayoutTemplate, Library, History, Mic, Star, RotateCcw, Send, User, ScanSearch, Plus, Image, FileAudio, HardDrive, ChevronRight, ChevronLeft
} from
  "lucide-react";
import { useChat } from "@canon/contexts/ChatContext";
import { useExternalConnectors } from "@canon/hooks/useExternalConnectors";
import SidebarHistory from "@canon/components/draft/SidebarHistory";
import { Button } from "@canon/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@canon/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@canon/components/ui/popover";
import { ScrollArea } from "@canon/components/ui/scroll-area";
import { Textarea } from "@canon/components/ui/textarea";
import { Input } from "@canon/components/ui/input";
import { Label } from "@canon/components/ui/label";
import { useToast } from "@canon/hooks/use-toast";
import { useLibrary } from "@canon/hooks/useLibrary";
import { useDocumentTemplates } from "@canon/hooks/useDocumentTemplates";
import { supabase } from "@canon/integrations/supabase/client";
import { extractStructuredTextFromFile } from "@canon/lib/document-text";
import { buildOverlappingChunks, isImageFile } from "@canon/lib/document-preprocessing";
import { mergeContentIntoDocxTemplate } from "@canon/lib/docx-template-merge";
import { supabase as sbClient } from "@canon/integrations/supabase/client";
import { isRichHtmlEmpty, markdownToRichHtml } from "@canon/lib/rich-text";
import { cleanScannedText, createEmptyExtractedTemplateData, extractTemplateData, extractTemplatePlaceholders, type ExtractedTemplateData, fillTemplatePlaceholders } from "@canon/lib/template-placeholder-fill";
import TemplateSelector from "@canon/components/draft/TemplateSelector";
import LibraryPanel, { type LibraryPanelTab } from "@canon/components/draft/LibraryPanel";
import HistoryPanel from "@canon/components/draft/HistoryPanel";
import WordStyleEditor from "@canon/components/draft/WordStyleEditor";
import ReactMarkdown from "react-markdown";

function escapeHtml(value: string) {
  return value.
    replace(/&/g, "&amp;").
    replace(/</g, "&lt;").
    replace(/>/g, "&gt;").
    replace(/\"/g, "&quot;").
    replace(/'/g, "&#39;");
}

function buildRestrictedResultHtml(content: string) {
  const escaped = escapeHtml(content);
  // Mark remaining unresolved placeholders with red styling
  const PLACEHOLDER_VISUAL_RE = /(?:\(([^()]{2,120})\)|\[([^\[\]]{2,120})\])/g;
  const withHighlights = escaped.replace(PLACEHOLDER_VISUAL_RE, (full) => {
    return `<span data-unresolved-placeholder="true">${full}</span>`;
  });
  return withHighlights.
    split(/\n{2,}/).
    map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br />")}</p>`).
    join("");
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface UploadedDoc {
  id: string;
  name: string;
  type: string;
  size: string;
  status: "loaded" | "syncing" | "ready";
  progress: number;
  textContent?: string;
  chunks?: Array<{ id: string; label: string; content: string; }>;
}

interface DocumentDataState {
  rawText: string;
  fields: ExtractedTemplateData;
}

const extractedFieldLabels: Array<{ key: keyof ExtractedTemplateData; label: string; placeholder: string; }> = [
  { key: "nome", label: "Nome", placeholder: "Nome da parte" },
  { key: "cpf", label: "CPF", placeholder: "000.000.000-00" },
  { key: "rg", label: "RG", placeholder: "Documento de identidade" },
  { key: "endereco", label: "Endereço", placeholder: "Rua, número, bairro" }];





const importSources = [
  { id: "local", label: "Armazenamento Local", icon: FolderOpen, enabled: true },
  { id: "drive", label: "Google Drive", icon: Cloud, enabled: true },
  { id: "cloud", label: "Nuvem", icon: UploadCloud, enabled: true },
  { id: "email", label: "E-mail", icon: Mail, enabled: true }];


const RESTRICTED_PETITION_BASE_PROMPT = `Aja como um Especialista em Redação Jurídica e Gestão de Documentos. Sua função é extrair dados de documentos anexados e gerar uma Petição Inicial estruturada.

Regras obrigatórias:
- Divida a minuta em: **ENDEREÇAMENTO**, **QUALIFICAÇÃO DAS PARTES**, **DOS FATOS**, **DO DIREITO**, **DOS PEDIDOS** e **FECHAMENTO**.
- Use **negrito** para títulos de seção, nomes e números de documentos.
- Mantenha hierarquia visual limpa, com aparência de peça processual oficial.
- Transcreva nomes, RG e CPF exatamente como constam no documento.
- Quando um dado não for localizado, preencha com [____].
- Nunca invente dados.
- Entregue apenas a minuta estruturada, sem comentários extras.`;

function getDocumentTypeLabel(file: File) {
  if (isImageFile(file)) return "IMG";
  if (file.name.toLowerCase().endsWith(".pdf")) return "PDF";
  if (file.name.toLowerCase().endsWith(".txt") || file.name.toLowerCase().endsWith(".md")) return "TXT";
  return "DOCX";
}


export default function Draft() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const cloudFileInputRef = useRef<HTMLInputElement>(null);
  const externalFileInputRef = useRef<HTMLInputElement>(null);
  const emailFileInputRef = useRef<HTMLInputElement>(null);
  const library = useLibrary();
  const visualTemplates = useDocumentTemplates();

  const chat = useChat();
  const { isConnected, getEmail, openService, connecting: connectingService } = useExternalConnectors();
  const [showAttachMenu, setShowAttachMenu] = useState(false);

  const [connectingSource, setConnectingSource] = useState<string | null>(null);

  const [documents, setDocuments] = useState<UploadedDoc[]>([]);
  const [fileObjects, setFileObjects] = useState<Map<string, File>>(new Map());
  const [selectedLevel, setSelectedLevel] = useState(3);
  const [commandText, setCommandText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [mainView, setMainView] = useState<"editor" | "templates" | "library" | "history">("editor");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [modelReady, setModelReady] = useState(false);
  const [extensionMode, setExtensionMode] = useState<"curto" | "longo">("curto");
  const [aiMode, setAiMode] = useState<"restrito" | "livre">("restrito");
  const [showQuickAccess, setShowQuickAccess] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [libraryInitialTab, setLibraryInitialTab] = useState<LibraryPanelTab>("modelos");
  const [levelMenuOpen, setLevelMenuOpen] = useState(false);
  const [modeMenuOpen, setModeMenuOpen] = useState(false);
  const [documentData, setDocumentData] = useState<DocumentDataState>({
    rawText: "",
    fields: createEmptyExtractedTemplateData()
  });
  const [extractedFields, setExtractedFields] = useState<ExtractedTemplateData>(createEmptyExtractedTemplateData());
  const [isSyncingDocuments, setIsSyncingDocuments] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (aiMode === "livre" && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, aiMode]);

  // Sync active thread messages into local state
  useEffect(() => {
    if (chat.activeThread) {
      setChatMessages(chat.activeThread.messages);
    } else {
      setChatMessages([]);
    }
  }, [chat.activeThreadId]);

  const toggleVoiceInput = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ title: "Não suportado", description: "Seu navegador não suporta reconhecimento de voz." });
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognitionRef.current = recognition;
    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      if (transcript.toLowerCase().includes("salvar este comando")) {
        const cleanedText = transcript.replace(/salvar este comando/gi, "").trim();
        if (cleanedText) {
          library.savePrompt(cleanedText.slice(0, 40), cleanedText);
          recognition.stop();
          setIsListening(false);
          return;
        }
      }
      setCommandText(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
    setIsListening(true);
  }, [isListening, toast, library]);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    processFiles(Array.from(e.dataTransfer.files));
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(Array.from(e.target.files));
  }, []);

  const openFilePicker = () => fileInputRef.current?.click();

  const triggerImportSource = (sourceId: string) => {
    if (sourceId === "local") {
      openFilePicker();
      return;
    }

    setConnectingSource(sourceId);

    const delay = sourceId === "drive" ? 800 : sourceId === "cloud" ? 500 : 600;

    window.setTimeout(() => {
      if (sourceId === "drive" || sourceId === "cloud") {
        cloudFileInputRef.current?.click();
      }

      if (sourceId === "email") {
        emailFileInputRef.current?.click();
      }

      setConnectingSource(null);
    }, delay);
  };

  const getDocumentText = useCallback((sourceDocuments: UploadedDoc[]) => {
    const readyDocuments = sourceDocuments.filter((doc) => doc.status === "ready");
    const documentChunks = readyDocuments.flatMap((doc) =>
      (doc.chunks || []).map((chunk) => ({
        ...chunk,
        documentName: doc.name
      }))
    );

    if (documentChunks.length > 0) {
      return documentChunks.
        map((chunk) => `[${chunk.documentName} • ${chunk.label}]\n${chunk.content}`).
        join("\n\n---\n\n");
    }

    return readyDocuments.
      map((doc) => doc.textContent || "").
      filter(Boolean).
      join("\n\n---\n\n");
  }, []);

  const buildScannerCommand = useCallback((prompt: string, ocrText: string) => {
    const normalizedPrompt = prompt.trim();
    const normalizedText = cleanScannedText(ocrText);

    if (!normalizedText) return normalizedPrompt;

    return [
      `Use o texto extraído do OCR abaixo para preencher os campos (parênteses) do modelo selecionado: ${normalizedText}`,
      normalizedPrompt].
      filter(Boolean).join("\n\n");
  }, []);

  const getMergedFieldValues = useCallback((incoming?: Partial<ExtractedTemplateData>) => ({
    ...documentData.fields,
    ...incoming,
    ...extractedFields
  }), [documentData.fields, extractedFields]);

  const syncExtractedFields = useCallback((sourceDocuments: UploadedDoc[], prompt: string) => {
    const documentText = cleanScannedText(getDocumentText(sourceDocuments));
    const scannerPrompt = buildScannerCommand(prompt, documentText);
    const extracted = extractTemplateData({ documentText, commandText: scannerPrompt });

    setDocumentData({
      rawText: documentText,
      fields: extracted
    });

    setExtractedFields((prev) => {
      const next = { ...createEmptyExtractedTemplateData(), ...prev };
      (Object.keys(extracted) as Array<keyof ExtractedTemplateData>).forEach((key) => {
        const value = extracted[key]?.trim();
        if (value) next[key] = value;
      });
      return next;
    });

    return { documentText, extracted, scannerPrompt };
  }, [buildScannerCommand, getDocumentText]);

  const buildRestrictedLocalOutput = useCallback((templateKey: string, sourceDocuments: UploadedDoc[], prompt: string) => {
    const templateObj = library.templates.find((template) => template.name === templateKey || template.id === templateKey);
    const templateContent = templateObj?.structure?.content || templateObj?.structure?.texto || "";

    if (typeof templateContent !== "string" || !templateContent.trim()) {
      return null;
    }

    const documentText = cleanScannedText(getDocumentText(sourceDocuments));
    const extracted = extractTemplateData({ documentText, commandText: "" });

    setDocumentData({ rawText: documentText, fields: extracted });
    setExtractedFields((prev) => {
      const next = { ...createEmptyExtractedTemplateData(), ...prev };
      (Object.keys(extracted) as Array<keyof ExtractedTemplateData>).forEach((key) => {
        const value = extracted[key]?.trim();
        if (value) next[key] = value;
      });
      return next;
    });

    let processedTemplate = templateContent;
    if (prompt.trim()) {
      const removeMatch = prompt.match(/remov[aer]+\s+(?:a\s+)?(?:cl[aá]usula|se[çc][aã]o|parte|trecho)\s+(.+)/i);
      if (removeMatch) {
        const target = removeMatch[1].trim().replace(/['"]/g, "");
        const regex = new RegExp(`[\\s\\S]*?${target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s\\S]*?(?=\\n\\n|$)`, "gi");
        processedTemplate = processedTemplate.replace(regex, "").replace(/\n{3,}/g, "\n\n").trim();
      }
    }

    const mergedFields = getMergedFieldValues(extracted);

    const result = fillTemplatePlaceholders({
      template: processedTemplate,
      documentText,
      commandText: "",
      fieldValues: mergedFields
    });

    return result;
  }, [getMergedFieldValues, getDocumentText, library.templates]);

  const syncScannerDataIntoModel = useCallback((templateKey?: string | null, sourceDocuments: UploadedDoc[] = documents, prompt = commandText) => {
    const currentTemplate = templateKey || selectedTemplate;
    if (!currentTemplate) return;

    const localOutput = buildRestrictedLocalOutput(currentTemplate, sourceDocuments, prompt);
    if (!localOutput) return;

    setEditorContent(buildRestrictedResultHtml(localOutput.content));
    setMainView("editor");
  }, [buildRestrictedLocalOutput, commandText, documents, selectedTemplate]);

  const openLibraryModelsForSync = useCallback(() => {
    setLibraryInitialTab("modelos");
    setMainView("library");
  }, []);

  const handleSyncScannerData = useCallback(async () => {
    if (!selectedTemplate) {
      toast({ title: "Selecione um modelo", description: "Escolha um modelo salvo antes de sincronizar os dados." });
      openLibraryModelsForSync();
      return;
    }

    const loadedDocs = documents.filter((d) => d.status === "loaded" || d.status === "ready");
    if (!loadedDocs.length) {
      toast({ title: "Envie documentos", description: "Carregue ao menos um arquivo antes de sincronizar." });
      return;
    }

    setIsSyncingDocuments(true);
    setSyncProgress(10);

    try {
      const templateObj = library.templates.find((t) => t.name === selectedTemplate || t.id === selectedTemplate);
      let templateContent = templateObj?.structure?.content || templateObj?.structure?.texto || "";

      if (typeof templateContent !== "string" || !templateContent.trim()) {
        toast({ title: "Modelo vazio", description: "O modelo selecionado não possui conteúdo.", variant: "destructive" });
        setIsSyncingDocuments(false);
        setSyncProgress(0);
        return;
      }

      const promptInstructions = commandText.trim();
      // Skip AI template processing - use local fallback
      if (promptInstructions) {
        setSyncProgress(20);
        // Template instructions are informational only
        console.log("[SYNC] Template processing skipped: using local-only mode");
      }

      setSyncProgress(40);

      const placeholders = extractTemplatePlaceholders(templateContent);

      const documentText = cleanScannedText(
        loadedDocs
          .map((doc) => doc.textContent || "")
          .filter(Boolean)
          .join("\n\n---\n\n")
      );

      if (!placeholders.length) {
        setEditorContent(buildRestrictedResultHtml(templateContent));
        setMainView("editor");
        toast({ title: "Documento gerado", description: "Modelo sem campos para preencher." });
        return;
      }

      setSyncProgress(50);

      const safeStringValue = (val: unknown): string => {
        if (typeof val === "string") return val.trim();
        if (val && typeof val === "object") {
          return Object.entries(val as Record<string, unknown>)
            .filter(([, v]) => v !== null && v !== undefined && v !== "")
            .map(([, v]) => typeof v === "string" ? v : String(v))
            .join(", ");
        }
        return "";
      };

      // Use local text extraction only (no serverless AI functions)
      let aiExtracted: Record<string, string> = {};
      if (documentText.trim()) {
        // Simple pattern matching from document text
        for (const placeholder of placeholders) {
          const patterns = [
            new RegExp(`${placeholder}[:\\s]+([^\\n]+)`, "i"),
            new RegExp(`\\b${placeholder}\\b[:\\s]*([^\\n]+)`, "i"),
          ];

          for (const pattern of patterns) {
            const match = documentText.match(pattern);
            if (match && match[1]) {
              aiExtracted[placeholder] = match[1].trim().slice(0, 200);
              break;
            }
          }
        }
      }

      setSyncProgress(80);

      const PLACEHOLDER_REGEX = /(?:\(([^()]{2,120})\)|\[([^\[\]]{2,120})\])/g;
      const replacements: Record<string, string> = {};
      const unresolved: string[] = [];

      const content = templateContent.replace(PLACEHOLDER_REGEX, (fullMatch: string, parenLabel: string, bracketLabel: string) => {
        const label = (parenLabel || bracketLabel || "").trim();
        const aiValue = aiExtracted[label]?.trim();

        if (aiValue) {
          replacements[label] = aiValue;
          return aiValue;
        }

        unresolved.push(label);
        return fullMatch;
      });

      setSyncProgress(100);

      setDocuments((prev) => prev.map((d) =>
        d.status === "loaded" ? { ...d, status: "ready" } : d
      ));

      setEditorContent(buildRestrictedResultHtml(content));
      setMainView("editor");

      toast({ title: "Documento gerado", description: `${Object.keys(replacements).length} campos preenchidos, ${unresolved.length} pendentes.` });

      library.saveToHistory({
        template_name: selectedTemplate,
        prompt_used: promptInstructions || null,
        extension_mode: extensionMode,
        effort_level: selectedLevel,
        result_text: content,
      });
    } catch (error: any) {
      toast({
        title: "Erro na sincronização",
        description: error?.message || "Falha ao processar o documento.",
        variant: "destructive",
      });
    } finally {
      setIsSyncingDocuments(false);
      setSyncProgress(0);
    }
  }, [commandText, documents, extractedFields, library, extensionMode, selectedLevel, openLibraryModelsForSync, selectedTemplate, toast]);

  const processFiles = async (files: File[]) => {
    if (!files.length) return;

    setEditorContent("");
    setDocumentData({ rawText: "", fields: createEmptyExtractedTemplateData() });
    setExtractedFields(createEmptyExtractedTemplateData());
    setSyncProgress(0);
    setModelReady(false);
    setSelectedTemplate(null);
    setChatMessages([]);

    setIsSyncingDocuments(true);

    const totalFiles = files.length;

    for (let idx = 0; idx < totalFiles; idx++) {
      const file = files[idx];
      const docId = crypto.randomUUID();
      const doc: UploadedDoc = {
        id: docId,
        name: file.name,
        type: getDocumentTypeLabel(file),
        size: `${(file.size / 1024).toFixed(0)} KB`,
        status: "syncing",
        progress: 0
      };
      setDocuments((prev) => [...prev, doc]);
      setFileObjects((prev) => new Map(prev).set(docId, file));

      let textContent = "";
      let chunks: UploadedDoc["chunks"] = [];

      try {
        setSyncProgress(Math.round((idx + 0.3) / totalFiles * 100));
        setDocuments((prev) => prev.map((item) =>
          item.id === docId ? { ...item, progress: 30 } : item
        ));

        // Extract text from file using local processing
        const extracted = await extractStructuredTextFromFile(file);
        textContent = cleanScannedText(extracted.text);
        chunks = buildOverlappingChunks(file.name, extracted.pages.length > 0 ? extracted.pages.map(cleanScannedText) : [textContent]);

        setSyncProgress(Math.round((idx + 0.8) / totalFiles * 100));
        setDocuments((prev) => prev.map((item) =>
          item.id === docId ? { ...item, progress: 80 } : item
        ));
      } catch (err) {
        console.error("[UPLOAD] Error:", err);
        textContent = "";
      }

      if (!textContent.trim()) {
        textContent = `[Conteúdo textual não pôde ser extraído automaticamente do arquivo ${file.name}]`;
      }

      setDocuments((prev) => prev.map((item) =>
        item.id === docId ? { ...item, status: "loaded", progress: 100, textContent, chunks } : item
      ));
      setSyncProgress(Math.round((idx + 1) / totalFiles * 100));
    }

    setIsSyncingDocuments(false);
    setSyncProgress(0);

    toast({ title: "Documentos analisados", description: "Análise local concluída. Selecione um modelo na Biblioteca para continuar." });
  };

  const removeDoc = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    setFileObjects((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  };

  // === LOCAL PROCESSING — only triggered by user clicking "Executar" ===
  const handleGenerate = async (templateId?: string) => {
    const template = templateId || selectedTemplate;
    const currentPrompt = commandText.trim();

    if (aiMode === "restrito") {
      // In restricted mode, use Sincronizar flow
      if (!template) {
        toast({ title: "Selecione um modelo", description: "Escolha um modelo antes de preencher o documento." });
        return;
      }
      await handleSyncScannerData();
      return;
    }

    // Modo livre — chat flow (general knowledge assistant)
    const readyDocuments = documents.filter((doc) => doc.status === "loaded" || doc.status === "ready");
    if (!readyDocuments.length && !currentPrompt) return;

    setIsGenerating(true);
    setMainView("editor");

    const documentText = cleanScannedText(
      readyDocuments.map((doc) => doc.textContent || "").filter(Boolean).join("\n\n---\n\n")
    );

    const userMessage = currentPrompt || "Analise o documento anexado.";
    setCommandText("");
    // Auto-create thread if none active
    let activeId = chat.activeThreadId;
    if (!activeId) {
      activeId = chat.createThread("livre");
    }
    setChatMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    // Also persist to thread
    if (activeId) {
      chat.addMessage(activeId, { role: "user", content: userMessage });
    }

    try {
      // Build conversation for AI
      const systemPrompt = `Você é o Jus Amigo, um assistente virtual inteligente e versátil. Responda sobre qualquer assunto: direito, receitas, esportes, cultura, tecnologia, ciência ou qualquer outro tema. Seja útil, claro e amigável. Responda sempre em português brasileiro.${documentText ? `\n\nO usuário anexou documentos com o seguinte conteúdo:\n${documentText}` : ""}`;

      const conversationHistory = chatMessages.map((m) => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!geminiApiKey) throw new Error("VITE_GEMINI_API_KEY não configurada no .env");

      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [
              ...conversationHistory,
              { role: "user", parts: [{ text: userMessage }] }
            ],
          }),
        }
      );

      if (!geminiResponse.ok) {
        const errData = await geminiResponse.json();
        throw new Error(errData?.error?.message || "Erro na API do Gemini");
      }

      const geminiData = await geminiResponse.json();
      const assistantText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "Desculpe, não consegui processar sua mensagem.";
      setChatMessages((prev) => [...prev, { role: "assistant", content: assistantText }]);
      if (activeId) {
        chat.addMessage(activeId, { role: "assistant", content: assistantText });
      }
      setIsGenerating(false);

      library.saveToHistory({
        template_name: template || null,
        prompt_used: currentPrompt || null,
        extension_mode: extensionMode,
        effort_level: selectedLevel,
        result_text: assistantText
      });
    } catch (err: any) {
      console.error("Generation error:", err);
      const fallbackText = documentText || "Erro ao processar. Tente novamente.";
      setChatMessages((prev) => [...prev, { role: "assistant", content: fallbackText }]);
      setIsGenerating(false);
      const isQuotaError = err.message && (
        err.message.toLowerCase().includes("quota") ||
        err.message.toLowerCase().includes("cota") ||
        err.message.toLowerCase().includes("429") ||
        err.message.toLowerCase().includes("resource has been exhausted") ||
        err.message.toLowerCase().includes("rate limit")
      );
      toast({
        title: isQuotaError ? "Limite da API atingido" : "Erro no processamento",
        description: isQuotaError
          ? "O limite de requisições da chave Gemini foi atingido. Aguarde alguns minutos e tente novamente."
          : err.message || "Falha ao processar o documento.",
        variant: "destructive"
      });
    }
  };

  // Passo 2: selecionar modelo → fechar biblioteca, voltar à página com status verde
  const handleTemplateSelect = async (templateId: string) => {
    setSelectedTemplate(templateId);
    setModelReady(true);
    setMainView("editor");
  };

  const getExportableContent = () => {
    if (aiMode === "livre") {
      return [...chatMessages].reverse().find((message) => message.role === "assistant")?.content?.trim() || "";
    }

    return editorContent;
  };

  const downloadBlob = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const saveBlobLocally = async (blob: Blob, fileName: string) => {
    const localWindow = window as Window & {
      showSaveFilePicker?: (options?: {
        suggestedName?: string;
        types?: Array<{ description: string; accept: Record<string, string[]>; }>;
      }) => Promise<{
        createWritable: () => Promise<{ write: (data: Blob) => Promise<void>; close: () => Promise<void>; }>;
      }>;
    };

    const canUseNativePicker = (() => {
      try {
        return !!localWindow.showSaveFilePicker && window.self === window.top;
      } catch {
        return false;
      }
    })();

    if (canUseNativePicker) {
      try {
        const handle = await localWindow.showSaveFilePicker?.({
          suggestedName: fileName,
          types: [
            {
              description: "Documento Word",
              accept: {
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"]
              }
            }]

        });

        if (!handle) {
          downloadBlob(blob, fileName);
          return;
        }

        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        return;
      } catch (error: any) {
        if (error?.name === "AbortError") return;
        if (error?.name !== "SecurityError") throw error;
      }
    }

    downloadBlob(blob, fileName);
  };

  const getAvailableDocxTemplates = () => visualTemplates.templates.filter((template) => template.kind === "docx");

  const hasGeneratedDocument = useMemo(() => {
    if (aiMode === "livre") {
      return chatMessages.some((message) => message.role === "assistant" && message.content.trim().length > 0);
    }

    return !isRichHtmlEmpty(editorContent);
  }, [aiMode, chatMessages, editorContent]);

  const getSuggestedExportFileName = () => {
    const exportContent = getExportableContent();
    const normalized = exportContent.
      replace(/\*+/g, "").
      replace(/<[^>]+>/g, " ").
      replace(/\s+/g, " ").
      trim();

    const headingCandidate = normalized.
      split(/\n|\./).
      map((line) => line.trim()).
      find((line) => line.length >= 6 && line.length <= 120);

    const titleSource = headingCandidate || selectedTemplate || "peticao";

    const safeName = titleSource.
      normalize("NFD").
      replace(/[\u0300-\u036f]/g, "").
      toLowerCase().
      replace(/[^a-z0-9]+/g, "-").
      replace(/^-+|-+$/g, "").
      slice(0, 80);

    return `${safeName || "peticao"}.docx`;
  };

  const handleOpenExport = () => {
    if (!getExportableContent()) return;
    setShowExportMenu(true);
  };

  const handleResetWorkspace = () => {
    setDocuments([]);
    setFileObjects(new Map());
    setCommandText("");
    setEditorContent("");
    setChatMessages([]);
    setSelectedTemplate(null);
    setModelReady(false);
    setDocumentData({ rawText: "", fields: createEmptyExtractedTemplateData() });
    setExtractedFields(createEmptyExtractedTemplateData());
    setIsSyncingDocuments(false);
    setSyncProgress(0);
    setShowQuickAccess(false);
    setShowExportMenu(false);
    setMainView("editor");
    chat.setActiveThread(null);
  };

  // === EXPORT ===
  const handleExport = async (templateId: string) => {
    const exportContent = getExportableContent();

    if (!exportContent) {
      toast({ title: "Nada para exportar", description: "Gere um documento primeiro." });
      return;
    }

    try {
      const visualTemplate = getAvailableDocxTemplates().find((template) => template.id === templateId) || null;

      if (!visualTemplate) {
        toast({ title: "Template não encontrado", description: "Escolha um template .docx salvo na Biblioteca." });
        return;
      }

      if (library.history.length > 0) {
        const lastEntry = library.history[0];
        await supabase.
          from("generation_history").
          update({ status: "sent" }).
          eq("id", lastEntry.id);
      }

      setIsExporting(true);

      const { data: templateBlob, error: templateError } = await supabase.storage.
        from("document-templates").
        download(visualTemplate.image_path);

      // Validação extra do template
      if (templateError || !templateBlob) {
        toast({
          title: "Erro ao baixar modelo",
          description: templateError?.message || "Não foi possível carregar o template .docx. Verifique se o arquivo existe e está íntegro.",
          variant: "destructive"
        });
        setIsExporting(false);
        return;
      }
      if (templateBlob.size < 1000 || templateBlob.type && !templateBlob.type.includes("word")) {
        toast({
          title: "Arquivo inválido",
          description: "O arquivo baixado não parece ser um modelo Word válido (.docx).",
          variant: "destructive"
        });
        setIsExporting(false);
        return;
      }

      let blob;
      try {
        blob = await mergeContentIntoDocxTemplate({
          contentHtml: aiMode === "livre" ? markdownToRichHtml(exportContent) : exportContent,
          templateBlob
        });
      } catch (mergeErr: any) {
        // Mensagem amigável para erro de modelo
        let msg = mergeErr?.message || "Erro ao gerar documento Word.";
        if (msg.includes("estrutura Word válida")) {
          msg = "O modelo selecionado está corrompido ou não é um arquivo Word (.docx) válido.";
        }
        toast({
          title: "Erro ao gerar documento",
          description: msg,
          variant: "destructive"
        });
        setIsExporting(false);
        return;
      }

      await saveBlobLocally(blob, getSuggestedExportFileName());

      setShowExportMenu(false);
      setIsExporting(false);
    } catch (err: any) {
      console.error("Export error:", err);
      setIsExporting(false);
      toast({ title: "Erro na exportação", description: err.message, variant: "destructive" });
    }
  };

  const loadedDocs = documents.filter((d) => d.status === "loaded" || d.status === "ready").length;
  const hasDocuments = documents.length > 0;
  const allDocsLoaded = hasDocuments && loadedDocs === documents.length && !isSyncingDocuments;
  const uploadProgress = isSyncingDocuments ? syncProgress : allDocsLoaded ? 100 : 0;
  const selectedTemplateLabel = selectedTemplate ?
    library.templates.find((template) => template.id === selectedTemplate || template.name === selectedTemplate)?.name || selectedTemplate :
    null;

  const renderHighlightedContent = (text: string) => {
    const parts = text.split(/(«[^»]*»)/g);
    return parts.map((part, i) => {
      if (part.startsWith("«") && part.endsWith("»")) {
        const inner = part.slice(1, -1);
        return (
          <span key={i} className="font-bold underline decoration-primary/40 underline-offset-2 text-primary">
            {inner}
          </span>);

      }
      return part;
    });
  };

  const exportableContent = getExportableContent();
  const availableDocxTemplates = getAvailableDocxTemplates();
  const hasExtractedFieldValues = extractedFieldLabels.some(({ key }) => extractedFields[key].trim().length > 0);
  const hasDocumentData = documentData.rawText.trim().length > 0;

  return (
    <div className="h-full bg-background text-foreground flex overflow-hidden">
      {/* Histórico de conversas — sidebar esquerda */}
      {aiMode === "livre" && (
        <div
          className="relative shrink-0 flex flex-col border-r border-border/50 bg-card/30 transition-all duration-200 overflow-visible"
          style={{ width: sidebarExpanded ? 260 : 32 }}
        >
          <>
            <SidebarHistory expanded={sidebarExpanded} onToggle={() => setSidebarExpanded(v => !v)} />
            {/* Botão abrir/fechar — sempre fixo na borda direita */}
            <button
              onClick={() => setSidebarExpanded(v => !v)}
              className="absolute top-3 -right-3 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-border/60 bg-card text-muted-foreground hover:text-foreground shadow-sm transition-colors"
              title={sidebarExpanded ? "Fechar histórico" : "Abrir histórico"}
            >
              {sidebarExpanded ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </button>
          </>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">

        {/* Barra de controles compacta acima do input */}
        {(!hasGeneratedDocument || aiMode === "livre") && aiMode !== "livre" && (
          <div className="w-full flex justify-end items-center gap-2 px-6 pt-2 pb-1 z-20" style={{ position: 'relative' }}>
            <button
              onClick={handleResetWorkspace}
              className="flex items-center justify-center h-8 w-8 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
              title="Zerar"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={handleOpenExport}
              disabled={!exportableContent || isExporting}
              className="flex items-center gap-2 h-8 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors disabled:opacity-40"
              title="Exportar"
            >
              {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Exportar
            </button>
            <Dialog open={showExportMenu} onOpenChange={setShowExportMenu}>
              <DialogContent className="max-w-3xl rounded-[2rem] border-border p-0 overflow-hidden">
                <DialogHeader className="border-b border-border/60 px-6 py-5">
                  <DialogTitle>Templates disponíveis</DialogTitle>
                  <DialogDescription>Escolha um template .docx da Biblioteca para preparar o salvamento do arquivo Word final.</DialogDescription>
                </DialogHeader>

                <div className="space-y-5 px-6 py-5">
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-foreground">Templates .docx</p>

                    {visualTemplates.loading ? (
                      <div className="rounded-2xl border border-border bg-secondary/20 p-6 text-center text-sm text-muted-foreground">
                        Carregando templates...
                      </div>
                    ) : availableDocxTemplates.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-border bg-secondary/20 p-8 text-center">
                        <p className="text-sm font-medium text-foreground">Nenhum template .docx disponível</p>
                        <p className="mt-1 text-xs text-muted-foreground">Abra a Biblioteca e envie um arquivo .docx para usar na exportação.</p>
                        <Button
                          variant="outline"
                          className="mt-4 rounded-xl"
                          onClick={() => {
                            setLibraryInitialTab("templates");
                            setMainView("library");
                            setShowExportMenu(false);
                          }}>
                          Abrir Biblioteca
                        </Button>
                      </div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-3">
                        {availableDocxTemplates.map((template) => (
                          <button
                            key={template.id}
                            type="button"
                            onClick={() => handleExport(template.id)}
                            disabled={isExporting}
                            className="overflow-hidden rounded-2xl border border-border bg-background text-left transition-all hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <div className="flex aspect-[4/5] items-center justify-center bg-secondary/30 text-muted-foreground">
                              {isExporting ? <Loader2 className="h-8 w-8 animate-spin" /> : <LayoutTemplate className="h-8 w-8" />}
                            </div>
                            <div className="flex items-center justify-between gap-3 px-4 py-3">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-foreground">{template.name}</p>
                                <p className="truncate text-[11px] text-muted-foreground">{template.image_filename || "Template .docx"}</p>
                              </div>
                              <Download className="h-4 w-4 shrink-0 text-primary" />
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Hidden file inputs */}
        <input ref={fileInputRef} type="file" accept=".pdf,.docx,.doc,.txt,.md,.jpg,.jpeg,.png,.webp,.bmp,.tiff" multiple onChange={handleFileSelect} className="hidden" />
        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileSelect} className="hidden" />
        <input ref={cloudFileInputRef} type="file" accept=".pdf,.docx,.doc,.txt,.jpg,.jpeg,.png,.webp" multiple onChange={handleFileSelect} className="hidden" />
        <input ref={externalFileInputRef} type="file" accept=".pdf,.docx,.doc,.txt,.jpg,.jpeg,.png,.webp,.bmp,.tiff" multiple onChange={handleFileSelect} className="hidden" />
        <input ref={emailFileInputRef} type="file" accept=".eml,.msg,.pdf,.docx,.doc,.txt,.jpg,.jpeg,.png" multiple onChange={handleFileSelect} className="hidden" />

        <div className="flex-1 px-3 pb-0 md:px-4 md:pb-0 overflow-hidden flex flex-col">
          {mainView === "templates" ?
            <TemplateSelector templates={library.templates} onSelect={handleTemplateSelect} onBack={() => setMainView("editor")} /> :
            mainView === "library" ?
              <LibraryPanel
                initialTab={libraryInitialTab}
                templates={library.templates}
                prompts={library.prompts}
                sharedTemplates={library.sharedTemplates}
                sharedPrompts={library.sharedPrompts}
                visualTemplates={visualTemplates.templates}
                visualTemplatesLoading={visualTemplates.loading}
                visualTemplatesUploading={visualTemplates.uploading}
                orgName={library.orgInfo?.name || null}
                onBack={() => setMainView("editor")}
                onSelectTemplate={handleTemplateSelect}
                onAddTemplate={library.addTemplate}
                onDeleteTemplate={library.deleteTemplate}
                onUpdateTemplate={library.updateTemplate}
                onSavePrompt={library.savePrompt}
                onDeletePrompt={library.deletePrompt}
                onToggleFavorite={library.toggleFavorite}
                onUsePrompt={(content) => { setCommandText(content); setMainView("editor"); }}
                onUploadVisualTemplate={visualTemplates.uploadTemplate}
                onRenameVisualTemplate={visualTemplates.renameTemplate}
                onDeleteVisualTemplate={visualTemplates.deleteTemplate}
                onShareTemplate={library.shareTemplate}
                onSharePrompt={library.sharePrompt}
                onDeleteSharedTemplate={library.deleteSharedTemplate}
                onDeleteSharedPrompt={library.deleteSharedPrompt} /> :

              mainView === "history" ?
                <HistoryPanel
                  history={library.history}
                  onBack={() => setMainView("editor")}
                  onReuse={(entry) => {
                    setEditorContent(entry.result_text);
                    if (entry.prompt_used) setCommandText(entry.prompt_used);
                    if (entry.template_name) setSelectedTemplate(entry.template_name);
                    setMainView("editor");
                  }} /> :


                <div className={`flex flex-col flex-1 transition-all duration-300 ${hasGeneratedDocument ? "pb-0" : "pb-0"}`} style={{ minHeight: 0 }}>
                  {/* Content area */}
                  {aiMode === "livre" ?
                    <div className="z-10 flex-1 flex flex-col overflow-hidden">
                      {/* Coluna full-width — chat vai até a borda direita */}
                      <div className="w-full flex-1 flex flex-col overflow-hidden chat-livre-typography">
                        {/* Área de mensagens — scroll sem barra visível */}
                        <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                          {chatMessages.length === 0 ? (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.4, ease: "easeOut" }}
                              className="flex flex-col items-center justify-center gap-5 h-full min-h-[400px]"
                            >
                              <div className="flex flex-col items-center justify-center gap-5">
                                <div className="relative flex flex-col items-center justify-center gap-4">
                                  <div className="h-36 w-36 rounded-full bg-primary/10 ring-4 ring-primary/20 flex items-center justify-center overflow-hidden">
                                    <img src={jusAmigoImg} alt="Jus Amigo" className="h-32 w-32 object-cover object-top" />
                                  </div>
                                  <div className="relative max-w-sm rounded-2xl bg-secondary/70 backdrop-blur-sm border border-border/40 px-6 py-4 flex items-center justify-center">
                                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-secondary/70 border-l border-t border-border/40 rotate-45" />
                                    <p className="text-sm text-foreground text-center leading-relaxed">
                                      Olá, sou seu assistente virtual. Pergunte-me o que desejar.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ) : (
                            <div className="py-6 space-y-4">
                              {chatMessages.map((msg, i) =>
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className={`flex gap-3 items-end ${msg.role === "user" ? "justify-end pl-16" : "justify-start pr-16"}`}>
                                  {msg.role === "assistant" &&
                                    <div className="shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden ring-2 ring-primary/20">
                                      <img src={jusAmigoImg} alt="Jus Amigo" className="h-9 w-9 object-cover object-top" />
                                    </div>
                                  }
                                  <div className={`w-fit max-w-[50%] rounded-2xl px-5 py-3.5 ${msg.role === "user" ?
                                    "bg-primary text-primary-foreground rounded-br-sm" :
                                    "bg-secondary/70 backdrop-blur-sm border border-border/40 rounded-bl-sm"
                                    }`}>
                                    {msg.role === "assistant" ? (
                                      <>
                                        <p className="text-[10px] font-bold text-primary mb-1.5">Jus Amigo</p>
                                        <div className="prose prose-sm dark:prose-invert max-w-none text-foreground [&>p]:mb-4 [&>p]:leading-relaxed [&>h3]:mt-6 [&>h3]:mb-3 [&>h3]:text-sm [&>h3]:font-bold [&>ul]:my-3 [&>ol]:my-3 [&>li]:my-1 [&>hr]:my-5 [&>hr]:border-border/40 [&>strong]:text-foreground [&>p>strong]:text-foreground">
                                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                                          {isGenerating && i === chatMessages.length - 1 &&
                                            <span className="inline-block w-0.5 h-4 bg-primary animate-pulse ml-0.5 align-middle" />
                                          }
                                        </div>
                                      </>
                                    ) : (
                                      <p className="text-sm leading-relaxed">{msg.content}</p>
                                    )}
                                  </div>
                                  {msg.role === "user" &&
                                    <div className="shrink-0 h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                      <User className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                  }
                                </motion.div>
                              )}
                              <div ref={chatEndRef} />
                            </div>
                          )}
                        </div>

                        {/* Prompt inline — centralizado */}
                        <div className="pb-4 shrink-0 max-w-2xl mx-auto w-full flex flex-col gap-2">
                          {/* Quick Access — Favoritos (Modo Livre) */}
                          <AnimatePresence>
                            {showQuickAccess && library.prompts.filter((p) => p.is_favorite).length > 0 &&
                              <motion.div
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 4 }}
                                className="relative z-50">
                                <div className="rounded-2xl border border-yellow-500/40 bg-background p-2 shadow-lg">
                                  <p className="text-[9px] text-yellow-500 uppercase tracking-wider px-2 pt-1 pb-1">⭐ Favoritos</p>
                                  <div className="max-h-40 space-y-1 overflow-y-auto">
                                    {library.prompts.filter((p) => p.is_favorite).map((p) =>
                                      <button
                                        key={p.id}
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => { setCommandText(p.content); setShowQuickAccess(false); }}
                                        className="w-full text-left px-2 py-1.5 rounded-lg text-[10px] font-semibold transition-colors truncate bg-yellow-400/90 text-yellow-900 hover:bg-yellow-300 border border-yellow-500"
                                      >
                                        <Star className="h-2.5 w-2.5 inline mr-1.5 text-yellow-700 fill-yellow-600" />{p.title}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            }
                          </AnimatePresence>
                          <div className="relative rounded-[1.75rem] border border-border/60 bg-background/95 p-1.5 shadow-lg backdrop-blur-xl">
                            <div className="flex items-end gap-2">
                              <div className="flex shrink-0 flex-col gap-2 pb-1 justify-center pl-1">
                                <Button
                                  type="button"
                                  size="sm"
                                  className="min-h-[52px] h-[52px] min-w-[100px] rounded-xl bg-green-600 px-3 text-xs text-white hover:bg-green-700 border border-green-700 flex items-center justify-center"
                                  onClick={() => setAiMode("restrito")}
                                >
                                  Modo Livre
                                </Button>
                              </div>
                              <div className="min-w-0 flex-1">
                                <Textarea
                                  value={commandText}
                                  onChange={(e) => setCommandText(e.target.value)}
                                  onFocus={() => setShowQuickAccess(true)}
                                  onBlur={() => setTimeout(() => setShowQuickAccess(false), 200)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                      e.preventDefault();
                                      if (commandText.trim()) handleGenerate();
                                    }
                                  }}
                                  placeholder=""
                                  className="min-h-[52px] w-full resize-none rounded-[1.35rem] border border-draft-action/30 bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-draft-action"
                                  disabled={isGenerating}
                                />
                              </div>
                              <div className="flex shrink-0 flex-col items-end gap-1.5 pb-1 pr-1">
                                <div className="flex flex-row gap-2 items-end">
                                  <Popover open={showAttachMenu} onOpenChange={setShowAttachMenu}>
                                    <PopoverTrigger asChild>
                                      <Button type="button" size="sm" className="h-8 w-8 rounded-xl bg-secondary text-foreground hover:bg-secondary/80 border border-border/60 p-0" title="Anexar arquivo">
                                        <Plus className="h-4 w-4" />
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent side="top" align="end" className="w-56 p-1 rounded-xl">
                                      <button onClick={() => { openFilePicker(); setShowAttachMenu(false); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-foreground hover:bg-secondary transition-colors">
                                        <UploadCloud className="h-4 w-4 shrink-0" /><span className="flex-1 text-left">Enviar arquivos</span>
                                      </button>
                                      <button onClick={async () => { setShowAttachMenu(false); await openService("google-drive"); }} disabled={connectingService === "google"} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-foreground hover:bg-secondary transition-colors disabled:opacity-60">
                                        <HardDrive className="h-4 w-4 shrink-0" /><span className="flex-1 text-left">Google Drive</span>
                                        {connectingService === "google" ? <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" /> : isConnected("google") ? <span className="flex items-center gap-1 text-[9px] text-green-500 font-semibold"><span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block" />{getEmail("google") ? getEmail("google")!.split("@")[0] : "Conectado"}</span> : <span className="text-[9px] text-muted-foreground/60">Vincular</span>}
                                      </button>
                                      <button onClick={async () => { setShowAttachMenu(false); await openService("onedrive"); }} disabled={connectingService === "microsoft"} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-foreground hover:bg-secondary transition-colors disabled:opacity-60">
                                        <Cloud className="h-4 w-4 shrink-0" /><span className="flex-1 text-left">OneDrive</span>
                                        {connectingService === "microsoft" ? <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" /> : isConnected("microsoft") ? <span className="flex items-center gap-1 text-[9px] text-blue-400 font-semibold"><span className="h-1.5 w-1.5 rounded-full bg-blue-400 inline-block" />{getEmail("microsoft") ? getEmail("microsoft")!.split("@")[0] : "Conectado"}</span> : <span className="text-[9px] text-muted-foreground/60">Vincular</span>}
                                      </button>
                                      <button onClick={async () => { setShowAttachMenu(false); await openService("gmail"); }} disabled={connectingService === "google"} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-foreground hover:bg-secondary transition-colors disabled:opacity-60">
                                        <Mail className="h-4 w-4 shrink-0" /><span className="flex-1 text-left">Gmail</span>
                                        {isConnected("google") ? <span className="flex items-center gap-1 text-[9px] text-green-500 font-semibold"><span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block" />Ativo</span> : <span className="text-[9px] text-muted-foreground/60">Vincular</span>}
                                      </button>
                                      <button onClick={() => { cameraInputRef.current?.click(); setShowAttachMenu(false); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-foreground hover:bg-secondary transition-colors">
                                        <Image className="h-4 w-4 shrink-0" /><span className="flex-1 text-left">Fotos</span>
                                      </button>
                                      <button onClick={() => { toggleVoiceInput(); setShowAttachMenu(false); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-foreground hover:bg-secondary transition-colors">
                                        <FileAudio className="h-4 w-4 shrink-0" /><span className="flex-1 text-left">Áudio</span>
                                      </button>
                                    </PopoverContent>
                                  </Popover>
                                  <button
                                    onClick={toggleVoiceInput}
                                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition-all ${isListening ? "border-destructive bg-destructive/10 text-destructive animate-pulse" : "border-muted-foreground/40 text-muted-foreground hover:border-foreground hover:text-foreground"}`}
                                    aria-label="Ativar microfone">
                                    <Mic className="h-4 w-4" />
                                  </button>
                                  <Button
                                    onClick={() => handleGenerate()}
                                    disabled={isGenerating || (!commandText.trim())}
                                    className="h-8 w-8 px-0 rounded-xl bg-draft-action/70 text-draft-action-foreground hover:bg-draft-action/85 shadow-[0_0_10px_hsl(var(--draft-action)/0.2)] hover:shadow-[0_0_16px_hsl(var(--draft-action)/0.4)] transition-all duration-300 shrink-0">
                                    {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div> :
                    hasGeneratedDocument ?
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="flex min-h-0 flex-1 bg-background">

                        <div className="min-h-0 flex-1">
                          <WordStyleEditor
                            value={editorContent}
                            onChange={setEditorContent}
                            placeholder="" />

                        </div>
                      </motion.div> :

                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="flex-1 bg-background px-4 pt-6 pb-0 md:px-6 md:pt-8 md:pb-0">

                        <div className="flex h-full flex-col items-center">
                          <div className="flex w-full max-w-[54vw] min-w-0 flex-1 flex-col items-center justify-between text-center">
                            <div className="flex w-full flex-1 flex-col items-center justify-center gap-6">
                              <div className="flex w-full max-w-[54vw] flex-wrap items-center justify-center gap-3">
                                {importSources.map((source) => {
                                  const Icon = source.icon;
                                  const isConnecting = connectingSource === source.id;

                                  return (
                                    <button
                                      key={source.id}
                                      type="button"
                                      disabled={isConnecting}
                                      onClick={() => triggerImportSource(source.id)}
                                      className="flex min-w-[180px] items-center justify-center gap-2 rounded-2xl border border-border/60 bg-card/50 px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-card disabled:opacity-60">

                                      {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
                                      <span>{isConnecting ? "Conectando..." : source.label}</span>
                                    </button>);

                                })}
                              </div>

                              <div
                                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                                onDragLeave={() => setIsDragOver(false)}
                                onDrop={handleFileDrop}
                                onClick={!hasDocuments ? openFilePicker : undefined}
                                className={`flex w-full max-w-[54vw] items-center justify-center rounded-2xl border-2 border-dashed px-4 py-24 transition-all ${isSyncingDocuments || isGenerating ?
                                  "border-primary bg-primary/5" :
                                  modelReady && hasDocuments ?
                                    "border-green-500 bg-green-500/10" :
                                    isDragOver ?
                                      "border-foreground/40 bg-foreground/5" :
                                      hasDocuments ?
                                        "border-border bg-card/20" :
                                        "border-border bg-card/20 hover:border-foreground/30 cursor-pointer"}`
                                }>

                                <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-center">
                                  {isSyncingDocuments || isGenerating ?
                                    <div className="flex w-full max-w-lg flex-col items-center justify-center gap-4">
                                      <div className="w-full overflow-hidden rounded-full bg-secondary/80">
                                        <div
                                          className="h-3 rounded-full bg-primary transition-all duration-300"
                                          style={{ width: `${uploadProgress}%` }} />

                                      </div>
                                      <div className="space-y-1">
                                        <p className="text-2xl font-semibold text-primary">{uploadProgress}%</p>
                                        <p className="text-sm text-muted-foreground">{isGenerating ? "Gerando documento" : "Analisando documentos via IA..."}</p>
                                      </div>
                                    </div> :
                                    modelReady && hasDocuments ?
                                      <div className="flex w-full max-w-2xl flex-col items-center justify-center gap-5 text-center">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
                                          <FileText className="h-8 w-8 text-green-600" />
                                        </div>
                                        <div className="space-y-2">
                                          <p className="text-lg font-semibold text-green-600">Documentação e Modelo Carregados</p>
                                          <p className="text-sm text-muted-foreground">
                                            Modelo: <span className="font-semibold text-foreground">{selectedTemplateLabel}</span>
                                          </p>
                                          <p className="text-sm text-muted-foreground">
                                            {documents.length} documento{documents.length > 1 ? "s" : ""} carregado{documents.length > 1 ? "s" : ""}
                                          </p>
                                        </div>
                                        <p className="text-xs text-muted-foreground">Escreva instruções no prompt (opcional) e clique em <strong>Sincronizar</strong></p>
                                      </div> :
                                      hasDocuments ?
                                        <div className="flex w-full max-w-2xl flex-col items-center justify-center gap-5 text-center">
                                          <div className="space-y-2">
                                            <p className="text-lg font-semibold text-foreground">Documentos carregados</p>
                                            <p className="text-sm text-muted-foreground">Selecione um modelo na biblioteca para continuar.</p>
                                          </div>
                                          <div className="flex w-full flex-wrap justify-center gap-3">
                                            {documents.map((doc) =>
                                              <div key={doc.id} className="min-w-[180px] rounded-2xl border border-border/60 bg-card/40 px-4 py-3 text-left">
                                                <p className="truncate text-sm font-semibold text-foreground">{doc.name}</p>
                                                <p className="mt-1 text-xs text-muted-foreground">{doc.type} · {doc.size}</p>
                                              </div>
                                            )}
                                          </div>
                                        </div> :

                                        <>
                                          <UploadCloud className="h-10 w-10 text-muted-foreground" />
                                          <div className="space-y-1">
                                            <p className="text-lg font-semibold text-foreground">Arrastar Arquivo</p>
                                            <p className="text-sm text-muted-foreground">PDF, DOCX, TXT e imagens</p>
                                          </div>
                                        </>
                                  }
                                </div>
                              </div>
                            </div>
                            {/* ===== PROMPT INLINE — RESTRITO ===== */}
                            <div className="w-full pb-4">
                              <div className="w-full flex min-w-0 flex-col gap-3">
                                {/* Quick Access Menu */}
                                <AnimatePresence>
                                  {showQuickAccess && library.prompts.length > 0 &&
                                    <motion.div
                                      initial={{ opacity: 0, y: 4 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: 4 }}
                                      className="relative z-50">
                                      <div className="rounded-2xl border border-border bg-background p-2 shadow-lg">
                                        <div className="max-h-52 space-y-1 overflow-y-auto">
                                          {library.prompts.filter((p) => p.is_favorite).length > 0 &&
                                            <p className="text-[9px] text-muted-foreground/60 uppercase tracking-wider px-2 pt-1">⭐ Favoritos</p>
                                          }
                                          {library.prompts.filter((p) => p.is_favorite).map((p) =>
                                            <button
                                              key={p.id}
                                              onMouseDown={(e) => e.preventDefault()}
                                              onClick={() => { setCommandText(p.content); setShowQuickAccess(false); }}
                                              className="w-full text-left px-2 py-1.5 rounded-lg text-[10px] font-semibold transition-colors truncate bg-yellow-400/90 text-yellow-900 hover:bg-yellow-300 border border-yellow-500"
                                            >
                                              <Star className="h-2.5 w-2.5 inline mr-1.5 text-yellow-700 fill-yellow-600" />{p.title}
                                            </button>
                                          )}
                                          {library.prompts.filter((p) => !p.is_favorite).length > 0 &&
                                            <p className="text-[9px] text-muted-foreground/60 uppercase tracking-wider px-2 pt-1">Prompts</p>
                                          }
                                          {library.prompts.filter((p) => !p.is_favorite).map((p) =>
                                            <button key={p.id} onMouseDown={(e) => e.preventDefault()} onClick={() => { setCommandText(p.content); setShowQuickAccess(false); }}
                                              className="w-full text-left px-2 py-1.5 rounded-lg text-[10px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors truncate">
                                              {p.title}
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    </motion.div>
                                  }
                                </AnimatePresence>

                                <div className="relative rounded-[1.75rem] border border-border/60 bg-background/95 p-1.5 shadow-lg backdrop-blur-xl">
                                  <div className="flex items-end gap-2">
                                    <div className="flex shrink-0 flex-col gap-2 pb-1 justify-center pl-1">
                                      <Button
                                        type="button"
                                        size="sm"
                                        className="h-8 min-w-[132px] rounded-xl bg-blue-600 px-4 text-xs text-white hover:bg-blue-700"
                                        onClick={() => { setLibraryInitialTab("modelos"); setMainView("library"); }}
                                        title="Abrir Biblioteca de Modelos"
                                      >
                                        <Library className="h-4 w-4 mr-2" />
                                        Biblioteca
                                      </Button>
                                      <Button
                                        type="button"
                                        size="sm"
                                        className="h-8 min-w-[132px] rounded-xl bg-red-600 px-4 text-xs text-white hover:bg-red-700 border border-red-700"
                                        onClick={() => setAiMode("livre")}
                                      >
                                        Modo Restrito
                                      </Button>
                                    </div>

                                    <div className="min-w-0 flex-1">
                                      {hasExtractedFieldValues &&
                                        <div className="mb-2 flex flex-wrap items-center gap-2 px-1">
                                          {extractedFieldLabels.map(({ key, label }) => extractedFields[key] ?
                                            <span key={key} className="rounded-full bg-secondary px-3 py-1 text-[11px] font-medium text-foreground">
                                              {label}: {extractedFields[key]}
                                            </span> :
                                            null)}
                                        </div>
                                      }
                                      <Textarea
                                        value={commandText}
                                        onChange={(e) => setCommandText(e.target.value)}
                                        onFocus={() => setShowQuickAccess(true)}
                                        onBlur={() => setTimeout(() => setShowQuickAccess(false), 200)}
                                        onKeyDown={(e) => {
                                          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                                            e.preventDefault();
                                            handleGenerate();
                                            setShowQuickAccess(false);
                                          }
                                        }}
                                        placeholder="Instruções antes de sincronizar (ex: remova a cláusula X, adicione foro Y)..."
                                        className="min-h-[52px] w-full resize-none rounded-[1.35rem] border border-draft-action/30 bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-draft-action"
                                        disabled={isGenerating} />
                                    </div>

                                    <div className="flex shrink-0 flex-col items-end gap-1.5 pb-1 pr-1">
                                      {selectedTemplate &&
                                        <div className="text-right">
                                          {selectedTemplateLabel &&
                                            <p className="max-w-[180px] truncate text-[11px] font-semibold text-foreground">{selectedTemplateLabel}</p>
                                          }
                                        </div>
                                      }
                                      <div className="flex flex-row gap-2 items-end">
                                        <button
                                          onClick={toggleVoiceInput}
                                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition-all ${isListening ?
                                            "border-destructive bg-destructive/10 text-destructive animate-pulse" :
                                            "border-muted-foreground/40 text-muted-foreground hover:border-foreground hover:text-foreground"}`}
                                          aria-label="Ativar microfone">
                                          <Mic className="h-4 w-4" />
                                        </button>
                                        <Button
                                          onClick={() => handleGenerate()}
                                          disabled={isGenerating || isSyncingDocuments || (!selectedTemplate || !hasDocuments)}
                                          className="h-8 w-8 px-0 rounded-xl bg-draft-action/70 text-draft-action-foreground hover:bg-draft-action/85 shadow-[0_0_10px_hsl(var(--draft-action)/0.2)] hover:shadow-[0_0_16px_hsl(var(--draft-action)/0.4)] transition-all duration-300 shrink-0">
                                          {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                  }
                </div>
          }
        </div>

      </div>

    </div>);

}
