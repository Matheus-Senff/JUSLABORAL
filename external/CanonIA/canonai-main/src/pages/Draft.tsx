import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useCredits } from "@/hooks/useCredits";
import { usePromptQuota } from "@/hooks/usePromptQuota";
import UpgradeModal from "@/components/UpgradeModal";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import jusAmigoImg from "@/assets/jus-amigo.png";
import {
  FileText, Sparkles,
  Download, Loader2,
  FolderOpen, Cloud, UploadCloud, Mail,
  LayoutTemplate, Library, History, Mic, Star, RotateCcw, LayoutDashboard, Send, User, ScanSearch } from
"lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLibrary } from "@/hooks/useLibrary";
import { useDocumentTemplates } from "@/hooks/useDocumentTemplates";
import { supabase } from "@/integrations/supabase/client";
import { extractStructuredTextFromFile } from "@/lib/document-text";
import { buildOverlappingChunks, isImageFile } from "@/lib/document-preprocessing";
import { mergeContentIntoDocxTemplate } from "@/lib/docx-template-merge";
import { supabase as sbClient } from "@/integrations/supabase/client";
import { isRichHtmlEmpty, markdownToRichHtml } from "@/lib/rich-text";
import { cleanScannedText, createEmptyExtractedTemplateData, extractTemplateData, extractTemplatePlaceholders, type ExtractedTemplateData, fillTemplatePlaceholders } from "@/lib/template-placeholder-fill";
import TemplateSelector from "@/components/draft/TemplateSelector";
import LibraryPanel, { type LibraryPanelTab } from "@/components/draft/LibraryPanel";
import HistoryPanel from "@/components/draft/HistoryPanel";
import WordStyleEditor from "@/components/draft/WordStyleEditor";
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
  chunks?: Array<{id: string;label: string;content: string;}>;
}

interface DocumentDataState {
  rawText: string;
  fields: ExtractedTemplateData;
}

const extractedFieldLabels: Array<{key: keyof ExtractedTemplateData;label: string;placeholder: string;}> = [
{ key: "nome", label: "Nome", placeholder: "Nome da parte" },
{ key: "cpf", label: "CPF", placeholder: "000.000.000-00" },
{ key: "rg", label: "RG", placeholder: "Documento de identidade" },
{ key: "endereco", label: "Endereço", placeholder: "Rua, número, bairro" }];


const effortLevels = [
{ level: 1, desc: "E-mails e avisos simples" },
{ level: 2, desc: "Notificações extrajudiciais" },
{ level: 3, desc: "Petições intermediárias" },
{ level: 4, desc: "Petições complexas" },
{ level: 5, desc: "Pareceres com jurisprudência" }];


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
  const { credits, hasCredits, deductCredit } = useCredits();
  const { consumePrompt } = usePromptQuota();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
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

  // No warmup needed - using Gemini Vision API instead of local OCR

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

    console.log("[SYNC] Template encontrado:", templateObj?.name, "| Conteúdo length:", typeof templateContent === "string" ? templateContent.length : 0);

    if (typeof templateContent !== "string" || !templateContent.trim()) {
      console.warn("[SYNC] Template vazio ou não encontrado para key:", templateKey);
      console.log("[SYNC] Templates disponíveis:", library.templates.map((t) => ({ id: t.id, name: t.name, hasContent: !!(t.structure?.content || t.structure?.texto) })));
      return null;
    }

    // Extract data only from documents, NOT from the prompt (prompt is for instructions only)
    const documentText = cleanScannedText(getDocumentText(sourceDocuments));
    const extracted = extractTemplateData({ documentText, commandText: "" });

    console.log("[SYNC] Texto extraído dos documentos:", documentText.slice(0, 200));
    console.log("[SYNC] Dados extraídos:", JSON.stringify(extracted, null, 2));

    setDocumentData({ rawText: documentText, fields: extracted });
    setExtractedFields((prev) => {
      const next = { ...createEmptyExtractedTemplateData(), ...prev };
      (Object.keys(extracted) as Array<keyof ExtractedTemplateData>).forEach((key) => {
        const value = extracted[key]?.trim();
        if (value) next[key] = value;
      });
      return next;
    });

    // Apply prompt instructions to the template (e.g., "remova a cláusula X")
    let processedTemplate = templateContent;
    if (prompt.trim()) {
      // Simple instruction processing: remove sections mentioned in prompt
      const removeMatch = prompt.match(/remov[aer]+\s+(?:a\s+)?(?:cl[aá]usula|se[çc][aã]o|parte|trecho)\s+(.+)/i);
      if (removeMatch) {
        const target = removeMatch[1].trim().replace(/['"]/g, "");
        const regex = new RegExp(`[\\s\\S]*?${target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s\\S]*?(?=\\n\\n|$)`, "gi");
        processedTemplate = processedTemplate.replace(regex, "").replace(/\n{3,}/g, "\n\n").trim();
      }
    }

    const mergedFields = getMergedFieldValues(extracted);
    console.log("[SYNC] Campos para preenchimento:", JSON.stringify(mergedFields, null, 2));

    const result = fillTemplatePlaceholders({
      template: processedTemplate,
      documentText,
      commandText: "",
      fieldValues: mergedFields
    });

    console.log("[SYNC] Placeholders preenchidos:", Object.keys(result.replacements).length, "| Não resolvidos:", result.unresolved.length);
    console.log("[SYNC] Substituições:", JSON.stringify(result.replacements, null, 2));

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
      // Passo 3: Get template content
      const templateObj = library.templates.find((t) => t.name === selectedTemplate || t.id === selectedTemplate);
      let templateContent = templateObj?.structure?.content || templateObj?.structure?.texto || "";

      if (typeof templateContent !== "string" || !templateContent.trim()) {
        toast({ title: "Modelo vazio", description: "O modelo selecionado não possui conteúdo.", variant: "destructive" });
        setIsSyncingDocuments(false);
        setSyncProgress(0);
        return;
      }

      console.log("[SYNC] Template:", templateObj?.name, "| Conteúdo length:", templateContent.length);

      // Passo 3: Apply prompt instructions via AI FIRST (priority 100%)
      const promptInstructions = commandText.trim();
      if (promptInstructions) {
        setSyncProgress(20);
        try {
          const response = await supabase.functions.invoke("process-template", {
            body: { templateContent, promptInstructions },
          });

          if (response.error) {
            console.error("[SYNC] AI processing error:", response.error);
            toast({ title: "Aviso", description: "Não foi possível processar as instruções via IA. Usando modelo original.", variant: "destructive" });
          } else if (response.data?.processedTemplate) {
            templateContent = response.data.processedTemplate;
            console.log("[SYNC] Template processado pela IA. Novo length:", templateContent.length);
          }
        } catch (aiError) {
          console.error("[SYNC] AI call failed:", aiError);
        }
      }

      setSyncProgress(40);

      // Passo 4: Extract placeholders from the processed template
      const placeholders = extractTemplatePlaceholders(templateContent);
      console.log("[SYNC] Placeholders encontrados no modelo:", placeholders);

      // Get document text
      const documentText = cleanScannedText(
        loadedDocs
          .map((doc) => doc.textContent || "")
          .filter(Boolean)
          .join("\n\n---\n\n")
      );

      console.log("[SYNC] Texto extraído dos documentos:", documentText.slice(0, 300));

      if (!placeholders.length) {
        // No placeholders — just show the template as-is
        setEditorContent(buildRestrictedResultHtml(templateContent));
        setMainView("editor");
        toast({ title: "Documento gerado", description: "Modelo sem campos para preencher." });
        return;
      }

      setSyncProgress(50);

      // Use BOTH Vision AI and Text AI to extract values, then merge
      let aiExtracted: Record<string, string> = {};

      // Helper: safely extract string value from potentially nested AI response
      const safeStringValue = (val: unknown): string => {
        if (typeof val === "string") return val.trim();
        if (val && typeof val === "object") {
          // Flatten nested objects into readable string
          return Object.entries(val as Record<string, unknown>)
            .filter(([, v]) => v !== null && v !== undefined && v !== "")
            .map(([, v]) => typeof v === "string" ? v : String(v))
            .join(", ");
        }
        return "";
      };

      try {
        // Text-based extraction is PRIMARY (already has clean data from step 1)
        // Vision is SECONDARY (re-sends file, can be inconsistent)
        const textPromise = (async () => {
          if (!documentText.trim()) return {};
          const resp = await supabase.functions.invoke("extract-document-data", {
            body: { documentText, placeholders },
          });
          return resp.data?.extractedFields || {};
        })();

        const visionPromise = (async () => {
          const loadedFileEntries = loadedDocs
            .map((doc) => fileObjects.get(doc.id))
            .filter(Boolean) as File[];
          if (loadedFileEntries.length === 0) return {};
          const file = loadedFileEntries[0];
          const arrayBuffer = await file.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          let binary = "";
          for (let i = 0; i < uint8Array.length; i++) {
            binary += String.fromCharCode(uint8Array[i]);
          }
          const base64 = btoa(binary);

          const resp = await supabase.functions.invoke("extract-document-vision", {
            body: { imageBase64: base64, mimeType: file.type || "image/jpeg", placeholders },
          });
          return resp.data?.extractedFields || {};
        })();

        const [textFields, visionFields] = await Promise.all([
          textPromise.catch(() => ({})),
          visionPromise.catch(() => ({})),
        ]);

        console.log("[SYNC] Text IA extraiu:", JSON.stringify(textFields, null, 2));
        console.log("[SYNC] Vision IA extraiu:", JSON.stringify(visionFields, null, 2));

        // Merge: use text value first (more reliable with pre-extracted data), vision as supplement
        for (const key of placeholders) {
          const textVal = safeStringValue((textFields as Record<string, unknown>)[key]);
          const visionVal = safeStringValue((visionFields as Record<string, unknown>)[key]);
          aiExtracted[key] = textVal || visionVal;
        }

        console.log("[SYNC] Merged extraction:", JSON.stringify(aiExtracted, null, 2));
      } catch (aiError) {
        console.error("[SYNC] AI extraction call failed:", aiError);
      }

      setSyncProgress(80);

      // Build the final document by replacing placeholders with AI-extracted values
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
        // Keep original placeholder text so user knows what to fill
        return fullMatch;
      });

      console.log("[SYNC] Placeholders preenchidos:", Object.keys(replacements).length, "| Não resolvidos:", unresolved.length);
      console.log("[SYNC] Substituições:", JSON.stringify(replacements, null, 2));

      setSyncProgress(100);

      // Mark docs as ready
      setDocuments((prev) => prev.map((d) =>
        d.status === "loaded" ? { ...d, status: "ready" } : d
      ));

      setEditorContent(buildRestrictedResultHtml(content));
      setMainView("editor");

      toast({ title: "Documento gerado", description: `${Object.keys(replacements).length} campos preenchidos, ${unresolved.length} pendentes.` });

      // Save to history
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

  // Passo 1: Upload + OCR imediato — status "loaded" só após OCR completo
  const processFiles = async (files: File[]) => {
    if (!files.length) return;

    // Passo 5: Limpeza completa ao iniciar novo processo
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

      // Run OCR/extraction immediately
      let textContent = "";
      let chunks: UploadedDoc["chunks"] = [];

      try {
        // Convert file to base64 for Gemini Vision API
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        let binary = "";
        for (let i = 0; i < uint8Array.length; i++) {
          binary += String.fromCharCode(uint8Array[i]);
        }
        const base64 = btoa(binary);

        setSyncProgress(Math.round((idx + 0.3) / totalFiles * 100));
        setDocuments((prev) => prev.map((item) =>
          item.id === docId ? { ...item, progress: 30 } : item
        ));

        // Send image to Gemini Vision edge function for extraction
        const visionResponse = await supabase.functions.invoke("extract-document-vision", {
          body: { imageBase64: base64, mimeType: file.type || "image/jpeg" },
        });

        setSyncProgress(Math.round((idx + 0.8) / totalFiles * 100));
        setDocuments((prev) => prev.map((item) =>
          item.id === docId ? { ...item, progress: 80 } : item
        ));

        if (visionResponse.data?.extractedFields) {
          const fields = visionResponse.data.extractedFields;
          // Build readable text from extracted fields for downstream use
          textContent = Object.entries(fields)
            .filter(([, v]) => v !== null && v !== "")
            .map(([k, v]) => `${k}: ${v}`)
            .join("\n");
          console.log("[VISION] Campos extraídos:", JSON.stringify(fields, null, 2));
        }

        if (!textContent.trim()) {
          // Fallback: try structured text extraction
          const extracted = await extractStructuredTextFromFile(file);
          textContent = cleanScannedText(extracted.text);
          chunks = buildOverlappingChunks(file.name, extracted.pages.length > 0 ? extracted.pages.map(cleanScannedText) : [textContent]);
        }
      } catch (err) {
        console.error("[VISION] Error:", err);
        textContent = "";
      }

      if (!textContent.trim()) {
        textContent = `[Conteúdo textual não pôde ser extraído automaticamente do arquivo ${file.name}]`;
      }

      // Mark as loaded only after extraction completes
      setDocuments((prev) => prev.map((item) =>
        item.id === docId ? { ...item, status: "loaded", progress: 100, textContent, chunks } : item
      ));
      setSyncProgress(Math.round((idx + 1) / totalFiles * 100));
    }

    setIsSyncingDocuments(false);
    setSyncProgress(0);

    toast({ title: "Documentos analisados", description: "Análise via Gemini concluída. Selecione um modelo na Biblioteca para continuar." });
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
    if (!hasCredits) {setShowUpgradeModal(true);return;}
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

    // Modo livre — chat flow
    const readyDocuments = documents.filter((doc) => doc.status === "loaded" || doc.status === "ready");
    if (!readyDocuments.length && !currentPrompt) return;

    const allowed = await consumePrompt();
    if (!allowed) {
      setShowUpgradeModal(true);
      return;
    }

    setIsGenerating(true);
    setMainView("editor");

    const documentText = cleanScannedText(
      readyDocuments.map((doc) => doc.textContent || "").filter(Boolean).join("\n\n---\n\n")
    );

    setChatMessages((prev) => [...prev, { role: "user", content: currentPrompt || "Extrair texto" }]);

    try {
      const fullText = documentText || "Nenhum texto foi encontrado nos arquivos enviados.";
      setChatMessages((prev) => [...prev, { role: "assistant", content: fullText }]);
      setCommandText("");
      setIsGenerating(false);

      library.saveToHistory({
        template_name: template || null,
        prompt_used: currentPrompt || null,
        extension_mode: extensionMode,
        effort_level: selectedLevel,
        result_text: fullText
      });
    } catch (err: any) {
      console.error("Generation error:", err);
      setIsGenerating(false);
      toast({
        title: "Erro no processamento",
        description: err.message || "Falha ao processar o documento.",
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
        types?: Array<{description: string;accept: Record<string, string[]>;}>;
      }) => Promise<{
        createWritable: () => Promise<{write: (data: Blob) => Promise<void>;close: () => Promise<void>;}>;
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
  };

  // === EXPORT ===
  const handleExport = async (templateId: string) => {
    if (!hasCredits) {setShowUpgradeModal(true);return;}
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

      const success = await deductCredit();
      if (!success) {setShowUpgradeModal(true);return;}

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

      if (templateError || !templateBlob) {
        throw new Error(templateError?.message || "Não foi possível carregar o template .docx.");
      }

      const blob = await mergeContentIntoDocxTemplate({
        contentHtml: aiMode === "livre" ? markdownToRichHtml(exportContent) : exportContent,
        templateBlob
      });

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
    <div className="h-screen bg-background text-foreground flex">
      {/* Vertical Navigation Sidebar */}
      <aside className="flex w-16 shrink-0 flex-col items-center gap-2 border-r border-border/50 bg-card/30 py-4">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex h-12 w-12 flex-col items-center justify-center gap-1 rounded-xl bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
          title="Painel">
          
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-[9px] font-semibold leading-none">Painel</span>
        </button>
        <button
          onClick={() => setMainView("history")}
          className={`flex h-12 w-12 flex-col items-center justify-center gap-1 rounded-xl transition-colors ${mainView === "history" ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"}`}
          title="Histórico">
          
          <History className="h-5 w-5" />
          <span className="text-[9px] font-medium leading-none">Histórico</span>
        </button>
        <button
          onClick={() => {
            setLibraryInitialTab("modelos");
            setMainView("library");
          }}
          className={`flex h-12 w-12 flex-col items-center justify-center gap-1 rounded-xl transition-colors ${mainView === "library" ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"}`}
          title="Biblioteca">
          
          <Library className="h-5 w-5" />
          <span className="text-[9px] font-medium leading-none">Biblioteca</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
      {/* Top Bar */}
      <header className="h-14 border-b border-border/50 flex items-center justify-end px-5 shrink-0 bg-background">
        <div className="relative flex items-center gap-2">
          <button
              onClick={handleResetWorkspace}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-xl bg-secondary text-foreground hover:bg-secondary/80 transition-colors">
              
            <RotateCcw className="h-3.5 w-3.5" />
            Zerar
          </button>
          <button
              onClick={handleOpenExport}
              disabled={!exportableContent || isExporting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-xl bg-primary/15 text-primary hover:bg-primary/20 transition-colors disabled:opacity-40">
              
            {isExporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
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

                  {visualTemplates.loading ?
                    <div className="rounded-2xl border border-border bg-secondary/20 p-6 text-center text-sm text-muted-foreground">
                      Carregando templates...
                    </div> :
                    availableDocxTemplates.length === 0 ?
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
                    </div> :

                    <div className="grid gap-4 md:grid-cols-3">
                      {availableDocxTemplates.map((template) => {
                        return (
                          <button
                            key={template.id}
                            type="button"
                            onClick={() => handleExport(template.id)}
                            disabled={isExporting}
                            className="overflow-hidden rounded-2xl border border-border bg-background text-left transition-all hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-60">
                            
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
                          </button>);

                      })}
                    </div>
                    }
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" accept=".pdf,.docx,.doc,.txt,.md,.jpg,.jpeg,.png,.webp,.bmp,.tiff" multiple onChange={handleFileSelect} className="hidden" />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileSelect} className="hidden" />
      <input ref={cloudFileInputRef} type="file" accept=".pdf,.docx,.doc,.txt,.jpg,.jpeg,.png,.webp" multiple onChange={handleFileSelect} className="hidden" />
      <input ref={externalFileInputRef} type="file" accept=".pdf,.docx,.doc,.txt,.jpg,.jpeg,.png,.webp,.bmp,.tiff" multiple onChange={handleFileSelect} className="hidden" />
      <input ref={emailFileInputRef} type="file" accept=".eml,.msg,.pdf,.docx,.doc,.txt,.jpg,.jpeg,.png" multiple onChange={handleFileSelect} className="hidden" />

      <div className="flex-1 min-h-0 px-3 pb-3 md:px-4 md:pb-4">
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
            isBusinessPlan={library.isBusinessPlan}
            orgName={library.orgInfo?.name || null}
            onBack={() => setMainView("editor")}
            onSelectTemplate={handleTemplateSelect}
            onAddTemplate={library.addTemplate}
            onDeleteTemplate={library.deleteTemplate}
            onUpdateTemplate={library.updateTemplate}
            onSavePrompt={library.savePrompt}
            onDeletePrompt={library.deletePrompt}
            onToggleFavorite={library.toggleFavorite}
            onUsePrompt={(content) => {setCommandText(content);setMainView("editor");}}
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


          <div className={`flex h-full flex-col transition-all duration-300 ${hasGeneratedDocument ? "pb-0" : "pb-40 md:pb-44"}`}>
              {/* Content area */}
              {aiMode === "livre" ?
            <ScrollArea className="flex-1 z-10">
                  <div className="max-w-2xl mx-auto w-full px-6 md:px-10 py-8 space-y-6 min-h-full flex flex-col justify-center">
                    {chatMessages.length > 0 &&
                chatMessages.map((msg, i) =>
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                          {msg.role === "assistant" &&
                  <div className="shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mt-1 overflow-hidden ring-2 ring-primary/20">
                              <img src={jusAmigoImg} alt="Jus Amigo" className="h-7 w-7 object-cover object-top" />
                            </div>
                  }
                          <div className={`max-w-[75%] rounded-2xl px-5 py-3.5 ${
                  msg.role === "user" ?
                  "bg-primary text-primary-foreground rounded-br-sm" :
                  "bg-secondary/70 backdrop-blur-sm border border-border/40 rounded-bl-sm"}`
                  }>
                            {msg.role === "assistant" ?
                    <>
                                <p className="text-[10px] font-bold text-primary mb-1.5">Jus Amigo</p>
                                <div className="prose prose-sm dark:prose-invert max-w-none text-foreground [&>p]:mb-4 [&>p]:leading-relaxed [&>h3]:mt-6 [&>h3]:mb-3 [&>h3]:text-sm [&>h3]:font-bold [&>ul]:my-3 [&>ol]:my-3 [&>li]:my-1 [&>hr]:my-5 [&>hr]:border-border/40 [&>strong]:text-foreground [&>p>strong]:text-foreground">
                                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                                  {isGenerating && i === chatMessages.length - 1 &&
                        <span className="inline-block w-0.5 h-4 bg-primary animate-pulse ml-0.5 align-middle" />
                        }
                                </div>
                              </> :

                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    }
                          </div>
                          {msg.role === "user" &&
                  <div className="shrink-0 h-7 w-7 rounded-full bg-muted flex items-center justify-center mt-1">
                              <User className="h-4 w-4 text-muted-foreground" />
                            </div>
                  }
                        </motion.div>
                )
                }
                    <div ref={chatEndRef} />
                  </div>
                </ScrollArea> :
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
              className="flex-1 bg-background px-4 py-6 md:px-6 md:py-8">
              
                    <div className="flex h-full flex-col items-center justify-center">
                        <div className="flex w-full max-w-[90vw] min-w-0 flex-col items-center justify-center gap-6 text-center mt-[35px]">
                        <div className="flex w-full max-w-[90vw] flex-wrap items-center justify-center gap-3">
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
                    onDragOver={(e) => {e.preventDefault();setIsDragOver(true);}}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleFileDrop}
                    onClick={!hasDocuments ? openFilePicker : undefined}
                    className={`flex w-full max-w-[90vw] items-center justify-center rounded-[2rem] border-2 border-dashed px-8 py-16 transition-all md:min-h-[calc(100vh-24rem)] mb-[8.5rem] ${
                    isSyncingDocuments || isGenerating ?
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
                    </div>
                  </motion.div>
            }

              {/* ===== PROMPT INPUT BAR — BOTTOM ===== */}
              <AnimatePresence>
                {(!hasGeneratedDocument || aiMode === "livre") &&
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 24 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-4">
                
                    <div className="flex w-[70vw] min-w-0 max-w-[70rem] flex-col gap-3">
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
                          <button key={p.id} onMouseDown={(e) => e.preventDefault()} onClick={() => {setCommandText(p.content);setShowQuickAccess(false);}}
                          className="w-full text-left px-2 py-1.5 rounded-lg text-[10px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors truncate">
                              <Star className="h-2.5 w-2.5 inline mr-1.5 text-draft-action fill-draft-action" />{p.title}
                            </button>
                          )}
                          {library.prompts.filter((p) => !p.is_favorite).length > 0 &&
                          <p className="text-[9px] text-muted-foreground/60 uppercase tracking-wider px-2 pt-1">Prompts</p>
                          }
                          {library.prompts.filter((p) => !p.is_favorite).map((p) =>
                          <button key={p.id} onMouseDown={(e) => e.preventDefault()} onClick={() => {setCommandText(p.content);setShowQuickAccess(false);}}
                          className="w-full text-left px-2 py-1.5 rounded-lg text-[10px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors truncate">
                              {p.title}
                            </button>
                          )}
                          </div>
                        </div>
                      </motion.div>
                    }
                  </AnimatePresence>

                  <div className="relative rounded-[1.75rem] border border-border/60 bg-background/95 p-3 shadow-lg backdrop-blur-xl">
                    <div className="flex items-end gap-3">
                      <div className="flex shrink-0 flex-col gap-2 pb-1">
                        <Popover open={levelMenuOpen} onOpenChange={setLevelMenuOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              size="sm"
                              className="h-10 min-w-[132px] rounded-xl bg-primary px-4 text-xs text-primary-foreground hover:bg-primary/90">
                              
                              Nível {selectedLevel}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent side="top" className="w-56 rounded-2xl border-border/60 bg-card/80 p-2 backdrop-blur-xl">
                            <div className="grid grid-cols-5 gap-1">
                              {effortLevels.map(({ level }) =>
                              <button
                                key={level}
                                type="button"
                                onClick={() => {
                                  setSelectedLevel(level);
                                  setExtensionMode(level >= 4 ? "longo" : "curto");
                                  setLevelMenuOpen(false);
                                }}
                                className={`h-9 rounded-xl text-xs font-semibold transition-colors ${selectedLevel === level ? "bg-primary text-primary-foreground" : "bg-secondary/80 text-foreground hover:bg-secondary"}`}>
                                
                                  {level}
                                </button>
                              )}
                            </div>
                          </PopoverContent>
                        </Popover>

                        <Popover open={modeMenuOpen} onOpenChange={setModeMenuOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              size="sm"
                              className={`h-10 min-w-[132px] rounded-xl px-4 text-xs ${aiMode === "livre" ? "bg-success text-success-foreground hover:bg-success/90" : "bg-secondary text-foreground hover:bg-secondary/80"}`}>
                              
                              {aiMode === "restrito" ? "Restrito" : "Livre"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent side="top" className="w-56 rounded-2xl border-border/60 bg-card/80 p-2 backdrop-blur-xl">
                            <div className="grid grid-cols-2 gap-2">
                              {(["restrito", "livre"] as const).map((mode) =>
                              <button
                                key={mode}
                                type="button"
                                onClick={() => {
                                  setAiMode(mode);
                                  setModeMenuOpen(false);
                                }}
                                className={`h-9 rounded-xl text-xs font-semibold capitalize transition-colors ${aiMode === mode ? mode === "livre" ? "bg-success text-success-foreground" : "bg-primary text-primary-foreground" : "bg-secondary/80 text-foreground hover:bg-secondary"}`}>
                                
                                  {mode}
                                </button>
                              )}
                            </div>
                          </PopoverContent>
                        </Popover>
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
                          className="min-h-[68px] w-full resize-none rounded-[1.35rem] border border-draft-action/30 bg-secondary px-5 py-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-draft-action"
                          disabled={isGenerating} />
                        
                      </div>

                      <div className="flex shrink-0 flex-col items-end gap-2 pb-1">
                        {selectedTemplate &&
                        <>
                            <div className="text-right">
                              {selectedTemplateLabel &&
                            <p className="max-w-[180px] truncate text-[11px] font-semibold text-foreground">{selectedTemplateLabel}</p>
                            }
                            </div>
                          </>
                        }
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleGenerate()}
                            disabled={isGenerating || isSyncingDocuments || (aiMode === "restrito" ? (!selectedTemplate || !hasDocuments) : (!commandText.trim() && !selectedTemplate))}
                            className="h-10 min-w-[56px] px-4 rounded-xl bg-draft-action/70 text-draft-action-foreground hover:bg-draft-action/85 shadow-[0_0_10px_hsl(var(--draft-action)/0.2)] hover:shadow-[0_0_16px_hsl(var(--draft-action)/0.4)] transition-all duration-300 shrink-0">
                            
                            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : aiMode === "livre" ? <Send className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                          </Button>
                          <button
                            onClick={toggleVoiceInput}
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all ${
                            isListening ?
                            "border-destructive bg-destructive/10 text-destructive animate-pulse" :
                            "border-muted-foreground/40 text-muted-foreground hover:border-foreground hover:text-foreground"}`
                            }
                            aria-label="Ativar microfone">
                            
                            <Mic className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                  </motion.div>
              }
              </AnimatePresence>
            </div>
          }
      </div>
      <UpgradeModal open={showUpgradeModal} onOpenChange={setShowUpgradeModal} />
      </div>
    </div>);

}