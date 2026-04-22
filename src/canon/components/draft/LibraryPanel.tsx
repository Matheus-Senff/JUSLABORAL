import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Trash2, Star, FileText, MessageSquare,
  X, Upload, Edit3, Users, ImageIcon, UserPlus, Mail, Shield,
} from "lucide-react";
import { Button } from "@canon/components/ui/button";
import { ScrollArea } from "@canon/components/ui/scroll-area";
import type { UserTemplate, SavedPrompt, SharedTemplate, SharedPrompt, OrgMember } from "@canon/hooks/useLibrary";
import type { DocumentVisualTemplate } from "@canon/hooks/useDocumentTemplates";
import { extractTextFromFile } from "@canon/lib/document-text";
import VisualTemplatesPanel from "@canon/components/draft/VisualTemplatesPanel";

export type LibraryPanelTab = "modelos" | "templates" | "prompts" | "equipe";

interface LibraryPanelProps {
  initialTab?: LibraryPanelTab;
  templates: UserTemplate[];
  prompts: SavedPrompt[];
  sharedTemplates: SharedTemplate[];
  sharedPrompts: SharedPrompt[];
  visualTemplates: DocumentVisualTemplate[];
  visualTemplatesLoading: boolean;
  visualTemplatesUploading: boolean;
  orgName: string | null;
  onBack: () => void;
  onSelectTemplate?: (templateId: string) => void;
  onAddTemplate: (name: string, category: string, structure?: Record<string, unknown>) => void;
  onDeleteTemplate: (id: string) => void;
  onUpdateTemplate: (id: string, updates: Partial<UserTemplate>) => void;
  onSavePrompt: (title: string, content: string) => void;
  onDeletePrompt: (id: string) => void;
  onToggleFavorite: (id: string, current: boolean) => void;
  onUsePrompt: (content: string) => void;
  onUploadVisualTemplate: (name: string, file: File) => Promise<void> | void;
  onRenameVisualTemplate: (id: string, name: string) => Promise<void> | void;
  onDeleteVisualTemplate: (template: DocumentVisualTemplate) => Promise<void> | void;
  onShareTemplate?: (name: string, category: string) => void;
  onSharePrompt?: (title: string, content: string) => void;
  onDeleteSharedTemplate?: (id: string) => void;
  onDeleteSharedPrompt?: (id: string) => void;
  orgMembers: OrgMember[];
  onAddOrgMember: (member: Omit<OrgMember, "id" | "org_id" | "created_at">) => void;
  onUpdateOrgMember: (id: string, updates: Partial<OrgMember>) => void;
  onRemoveOrgMember: (id: string) => void;
}

export default function LibraryPanel({
  initialTab = "modelos",
  templates, prompts, sharedTemplates, sharedPrompts, orgName,
  visualTemplates, visualTemplatesLoading, visualTemplatesUploading,
  onBack, onSelectTemplate, onAddTemplate, onDeleteTemplate, onUpdateTemplate,
  onSavePrompt, onDeletePrompt, onToggleFavorite, onUsePrompt,
  onUploadVisualTemplate, onRenameVisualTemplate, onDeleteVisualTemplate,
  onShareTemplate, onSharePrompt, onDeleteSharedTemplate, onDeleteSharedPrompt,
  orgMembers, onAddOrgMember, onUpdateOrgMember, onRemoveOrgMember,
}: LibraryPanelProps) {
  const [tab, setTab] = useState<LibraryPanelTab>(initialTab);
  const [newPromptTitle, setNewPromptTitle] = useState("");
  const [newPromptContent, setNewPromptContent] = useState("");
  const [showNewPrompt, setShowNewPrompt] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<SavedPrompt | null>(null);
  const [editPromptTitle, setEditPromptTitle] = useState("");
  const [editPromptContent, setEditPromptContent] = useState("");
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [memberForm, setMemberForm] = useState({ nome: "", email: "", nivel: "Visualizador", equipe: "", setor: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const inputCls = "w-full h-8 px-3 rounded-md bg-secondary border border-border text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground";
  const textareaCls = "w-full px-3 py-2 rounded-md bg-secondary border border-border text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground resize-none";

  const handleSaveMember = useCallback(() => {
    if (!memberForm.nome.trim() || !memberForm.email.trim()) return;
    if (editingMemberId) {
      onUpdateOrgMember(editingMemberId, memberForm);
      setEditingMemberId(null);
    } else {
      onAddOrgMember(memberForm);
    }
    setShowMemberForm(false);
    setMemberForm({ nome: "", email: "", nivel: "Visualizador", equipe: "", setor: "" });
  }, [memberForm, editingMemberId, onAddOrgMember, onUpdateOrgMember]);

  const openEditMember = useCallback((m: OrgMember) => {
    setEditingMemberId(m.id);
    setMemberForm({ nome: m.nome, email: m.email, nivel: m.nivel, equipe: m.equipe, setor: m.setor });
    setShowMemberForm(true);
  }, []);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const tabs: { id: LibraryPanelTab; label: string; icon: typeof FileText }[] = [
    { id: "modelos", label: "Modelos", icon: FileText },
    { id: "templates", label: "Templates", icon: ImageIcon },
    { id: "prompts", label: "Prompts", icon: MessageSquare },
    { id: "equipe", label: "Equipe", icon: Users },
  ];

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const name = file.name.replace(/\.(docx|dotx|pdf|txt|doc)$/i, "");
    let category = "geral";
    const lower = name.toLowerCase();
    if (lower.includes("petic") || lower.includes("petição")) category = "peticao";
    else if (lower.includes("contrat")) category = "contrato";
    else if (lower.includes("parecer")) category = "parecer";
    else if (lower.includes("recurs")) category = "recurso";

    let content = "";
    try {
      content = await extractTextFromFile(file);
    } catch {
      content = "";
    }

    onAddTemplate(name, category, {
      content,
      original_file_name: file.name,
      imported_at: new Date().toISOString(),
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const startEditPrompt = (p: SavedPrompt) => {
    setEditingPrompt(p);
    setEditPromptTitle(p.title);
    setEditPromptContent(p.content);
  };

  return (
    <div className="h-full flex flex-col">
      <input ref={fileInputRef} type="file" accept=".docx,.dotx,.pdf,.txt,.doc" onChange={handleFileImport} className="hidden" />

      {/* Header */}
      <div className="px-6 pt-4 pb-3 shrink-0 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border text-[11px] hover:border-foreground transition-all text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3 w-3" /> Voltar
          </button>
          <h2 className="text-base font-semibold text-foreground">Biblioteca</h2>
          <div className="w-16" />
        </div>
        <div className="flex gap-1">
          {tabs.map((t) => {
            const Icon = t.icon;
            const activeColors: Record<LibraryPanelTab, string> = {
              modelos: "bg-blue-600 text-white shadow-sm",
              templates: "bg-violet-600 text-white shadow-sm",
              prompts: "bg-amber-500 text-white shadow-sm",
              equipe: "bg-emerald-600 text-white shadow-sm",
            };
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${tab === t.id
                  ? activeColors[t.id]
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-transparent hover:border-border/40"
                  }`}>
                <Icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* ===== MODELOS TAB — view/import/delete only, no "+Novo" ===== */}
            {tab === "modelos" && (
              <motion.div key="modelos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Seus modelos de documento</p>
                  <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-3 w-3" /> Importar
                  </Button>
                </div>

                <div className="rounded-lg border border-dashed border-border/60 p-3 text-center">
                  <Upload className="h-5 w-5 mx-auto mb-1.5 text-muted-foreground/30" />
                  <p className="text-[10px] text-muted-foreground/50">
                    Importe .docx, .dotx, .pdf ou .txt — a IA seguirá a estrutura e formatação do modelo.
                  </p>
                </div>

                {templates.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground/50">
                    <FileText className="h-8 w-8 mx-auto mb-3 opacity-30" />
                    <p className="text-xs">Nenhum modelo disponível</p>
                  </div>
                )}

                {templates.map((t) => (
                  <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-foreground/30 transition-all group">
                    <div className="h-9 w-9 rounded-md border border-border flex items-center justify-center shrink-0">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{t.name}</p>
                      <p className="text-[10px] text-muted-foreground">{t.category} · {t.font_family} {t.font_size}pt</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {onSelectTemplate && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 rounded-lg text-[10px]"
                          onClick={() => onSelectTemplate(t.id)}
                        >
                          Usar modelo
                        </Button>
                      )}
                      <button onClick={() => onDeleteTemplate(t.id)} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* ===== PROMPTS TAB ===== */}
            {tab === "prompts" && (
              <motion.div key="prompts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Seus comandos salvos</p>
                  <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1" onClick={() => setShowNewPrompt(true)}>
                    <MessageSquare className="h-3 w-3" /> Novo Prompt
                  </Button>
                </div>

                {showNewPrompt && (
                  <div className="border border-border rounded-lg p-3 space-y-2">
                    <input value={newPromptTitle} onChange={(e) => setNewPromptTitle(e.target.value)} placeholder="Título do prompt" className="w-full h-8 px-3 rounded-md bg-secondary border border-border text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground" />
                    <textarea value={newPromptContent} onChange={(e) => setNewPromptContent(e.target.value)} placeholder="Conteúdo do comando..." rows={3} className="w-full px-3 py-2 rounded-md bg-secondary border border-border text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground resize-none" />
                    <div className="flex gap-2">
                      <Button size="sm" className="h-7 text-[10px] flex-1" onClick={() => {
                        if (newPromptTitle.trim() && newPromptContent.trim()) {
                          onSavePrompt(newPromptTitle, newPromptContent);
                          setNewPromptTitle(""); setNewPromptContent(""); setShowNewPrompt(false);
                        }
                      }}>Salvar</Button>
                      <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => setShowNewPrompt(false)}><X className="h-3 w-3" /></Button>
                    </div>
                  </div>
                )}

                {editingPrompt && (
                  <div className="border-2 border-primary/30 rounded-lg p-3 space-y-2">
                    <p className="text-[10px] text-muted-foreground font-medium">Editando prompt</p>
                    <input value={editPromptTitle} onChange={(e) => setEditPromptTitle(e.target.value)} className="w-full h-8 px-3 rounded-md bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-foreground" />
                    <textarea value={editPromptContent} onChange={(e) => setEditPromptContent(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-md bg-secondary border border-border text-xs text-foreground focus:outline-none focus:border-foreground resize-none" />
                    <div className="flex gap-2">
                      <Button size="sm" className="h-7 text-[10px] flex-1" onClick={() => {
                        onDeletePrompt(editingPrompt.id);
                        onSavePrompt(editPromptTitle, editPromptContent);
                        setEditingPrompt(null);
                      }}>Atualizar</Button>
                      <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => setEditingPrompt(null)}><X className="h-3 w-3" /></Button>
                    </div>
                  </div>
                )}

                {prompts.length === 0 && !showNewPrompt && (
                  <div className="text-center py-12 text-muted-foreground/50">
                    <MessageSquare className="h-8 w-8 mx-auto mb-3 opacity-30" />
                    <p className="text-xs">Nenhum prompt salvo ainda</p>
                  </div>
                )}

                {prompts.map((p) => (
                  <div key={p.id} className="p-3 rounded-lg border border-border hover:border-foreground/30 transition-all group">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-sm font-medium">{p.title}</p>
                      <div className="flex gap-1">
                        <button onClick={() => onToggleFavorite(p.id, p.is_favorite)} className={`p-1.5 rounded transition-colors ${p.is_favorite ? "text-yellow-500" : "text-muted-foreground/40 hover:text-yellow-500"}`}>
                          <Star className={`h-3.5 w-3.5 ${p.is_favorite ? "fill-current" : ""}`} />
                        </button>
                        <button onClick={() => startEditPrompt(p)} className="p-1.5 rounded text-muted-foreground/40 hover:text-foreground opacity-0 group-hover:opacity-100 transition-all">
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => onDeletePrompt(p.id)} className="p-1.5 rounded text-muted-foreground/40 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 mb-2">{p.content}</p>
                    <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => onUsePrompt(p.content)}>Usar este prompt</Button>
                  </div>
                ))}
              </motion.div>
            )}

            {tab === "templates" && (
              <motion.div key="templates" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <VisualTemplatesPanel
                  templates={visualTemplates}
                  loading={visualTemplatesLoading}
                  uploading={visualTemplatesUploading}
                  onUpload={onUploadVisualTemplate}
                  onRename={onRenameVisualTemplate}
                  onDelete={onDeleteVisualTemplate}
                />
              </motion.div>
            )}

            {/* ===== EQUIPE TAB ===== */}
            {tab === "equipe" && (
              <motion.div key="equipe" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-emerald-500" />
                    <p className="text-xs text-muted-foreground">
                      Equipe: <span className="text-foreground font-medium">{orgName || "Organização"}</span>
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-[10px] gap-1 border-emerald-500/50 text-emerald-600 hover:bg-emerald-500/10"
                    onClick={() => { setShowMemberForm(true); setEditingMemberId(null); setMemberForm({ nome: "", email: "", nivel: "Visualizador", equipe: "", setor: "" }); }}>
                    <UserPlus className="h-3 w-3" /> Criar
                  </Button>
                </div>

                {/* Member Form */}
                <AnimatePresence>
                  {showMemberForm && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="border border-emerald-500/40 bg-emerald-500/5 rounded-xl p-4 space-y-3">
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                        {editingMemberId ? "Editar Membro" : "Novo Membro"}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          value={memberForm.nome}
                          onChange={(e) => setMemberForm((p) => ({ ...p, nome: e.target.value }))}
                          placeholder="Nome completo"
                          className={inputCls} />
                        <input
                          value={memberForm.email}
                          type="email"
                          onChange={(e) => setMemberForm((p) => ({ ...p, email: e.target.value }))}
                          placeholder="E-mail"
                          className={inputCls} />
                        <select
                          value={memberForm.nivel}
                          onChange={(e) => setMemberForm((p) => ({ ...p, nivel: e.target.value }))}
                          className={inputCls}>
                          <option value="Admin">Admin</option>
                          <option value="Editor">Editor</option>
                          <option value="Visualizador">Visualizador</option>
                        </select>
                        <input
                          value={memberForm.equipe}
                          onChange={(e) => setMemberForm((p) => ({ ...p, equipe: e.target.value }))}
                          placeholder="Equipe"
                          className={inputCls} />
                        <input
                          value={memberForm.setor}
                          onChange={(e) => setMemberForm((p) => ({ ...p, setor: e.target.value }))}
                          placeholder="Setor"
                          className={`${inputCls} col-span-2`} />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="h-7 text-[10px] flex-1 bg-emerald-600 hover:bg-emerald-700"
                          disabled={!memberForm.nome.trim() || !memberForm.email.trim()}
                          onClick={handleSaveMember}>
                          {editingMemberId ? "Atualizar" : "Salvar"}
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => setShowMemberForm(false)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Members List */}
                {orgMembers.length > 0 && (
                  <div>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-2">Membros</p>
                    <div className="space-y-2">
                      {orgMembers.map((member) => (
                        <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-emerald-500/40 transition-all group">
                          <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-emerald-600">{member.nome.charAt(0).toUpperCase()}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{member.nome}</p>
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1 truncate">
                              <Mail className="h-2.5 w-2.5 shrink-0" />{member.email}
                            </p>
                            {(member.equipe || member.setor) && (
                              <p className="text-[10px] text-muted-foreground/70 truncate mt-0.5">{[member.equipe, member.setor].filter(Boolean).join(" · ")}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${member.nivel === "Admin" ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
                                member.nivel === "Editor" ? "bg-violet-500/10 text-violet-600 border-violet-500/20" :
                                  "bg-muted text-muted-foreground border-border"
                              }`}>
                              <Shield className="h-2 w-2 inline mr-0.5" />{member.nivel}
                            </span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => openEditMember(member)} className="p-1.5 rounded text-muted-foreground/40 hover:text-foreground">
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={() => onRemoveOrgMember(member.id)} className="p-1.5 rounded text-muted-foreground/40 hover:text-destructive">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {orgMembers.length === 0 && !showMemberForm && (
                  <div className="text-center py-6 text-muted-foreground/50">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-xs">Nenhum membro cadastrado</p>
                    <p className="text-[10px] mt-1">Clique em <strong>Criar</strong> para adicionar</p>
                  </div>
                )}

                {/* Shared Templates */}
                {sharedTemplates.length > 0 && (
                  <div>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-2">Modelos Compartilhados</p>
                    {sharedTemplates.map((t) => (
                      <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-foreground/30 transition-all group mb-2">
                        <div className="h-9 w-9 rounded-md border border-border flex items-center justify-center shrink-0 relative">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-primary flex items-center justify-center">
                            <Users className="h-2 w-2 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{t.name}</p>
                          <p className="text-[10px] text-muted-foreground">{t.category} · Equipe</p>
                        </div>
                        {onDeleteSharedTemplate && (
                          <button onClick={() => onDeleteSharedTemplate(t.id)} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Shared Prompts */}
                {sharedPrompts.length > 0 && (
                  <div>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-2">Prompts Compartilhados</p>
                    {sharedPrompts.map((p) => (
                      <div key={p.id} className="p-3 rounded-lg border border-border hover:border-foreground/30 transition-all group mb-2">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium">{p.title}</p>
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-primary/10 text-primary border border-primary/20">EQUIPE</span>
                          </div>
                          {onDeleteSharedPrompt && (
                            <button onClick={() => onDeleteSharedPrompt(p.id)} className="p-1.5 rounded text-muted-foreground/40 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-2 mb-2">{p.content}</p>
                        <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => onUsePrompt(p.content)}>Usar este prompt</Button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  );
}
