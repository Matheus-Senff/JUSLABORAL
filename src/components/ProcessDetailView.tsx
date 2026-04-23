import React, { useState } from 'react'
import {
    ChevronLeft, FileText, Paperclip, Calendar, StickyNote,
    Plus, X, Clock, MapPin, Save, History, MessageSquare
} from 'lucide-react'
import { Process, ProcessHistoryEntry, ProcessEvent, ProcessNote } from '../types'
import { usePastaStore } from './pasta/pastaStore'

interface ProcessDetailViewProps {
    process: Process
    type: 'estadual' | 'federal'
    darkMode: boolean
    onBack: () => void
    onAddEvent?: (event: ProcessEvent) => void
}

const STATUS_OPTIONS = [
    'Não Ajuizado',
    'Ajuizado',
    'Pendência',
    'Pendência Cumprida',
    'Aguardando Ajuizamento',
    'Arquivado',
]

const TIPO_EVENTO_OPTIONS = ['Perícia Adm.', 'Perícia Jur.', 'Audiência', 'Reunião Cliente'] as const

export const ProcessDetailView: React.FC<ProcessDetailViewProps> = ({
    process, type, darkMode, onBack, onAddEvent
}) => {
    const board = usePastaStore((s) => s.board)

    const bg = darkMode ? 'bg-dark-900' : 'bg-gray-50'
    const card = darkMode ? 'bg-dark-800' : 'bg-white'
    const border = darkMode ? 'border-dark-600' : 'border-gray-200'
    const text = darkMode ? 'text-white' : 'text-gray-900'
    const muted = darkMode ? 'text-gray-400' : 'text-gray-500'
    const inputCls = `w-full px-3 py-2 border rounded-lg text-sm ${darkMode ? 'bg-dark-700 border-dark-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`
    const labelCls = `block text-xs font-semibold mb-1 uppercase tracking-wide ${darkMode ? 'text-gray-400' : 'text-gray-500'}`
    const valueCls = `px-3 py-2 rounded-lg text-sm font-medium ${darkMode ? 'bg-dark-700 text-white' : 'bg-gray-100 text-gray-900'}`

    const [activeTab, setActiveTab] = useState<'detalhes' | 'historico' | 'documentos'>('detalhes')
    const [showEventModal, setShowEventModal] = useState(false)
    const [showNoteModal, setShowNoteModal] = useState(false)
    const [showStatusDropdown, setShowStatusDropdown] = useState(false)

    // histórico local
    const [history, setHistory] = useState<ProcessHistoryEntry[]>([
        {
            id: '1',
            processId: process.id,
            tipo: 'status',
            campo: 'Status',
            valorAnterior: 'Não Ajuizado',
            valorNovo: process.status,
            autor: process.responsavel,
            data: process.ultimaAlteracao,
        },
    ])
    const [showHistoryModal, setShowHistoryModal] = useState(false)
    const [historyForm, setHistoryForm] = useState<{ tipo: 'auditoria' | 'comentario'; texto: string }>({ tipo: 'comentario', texto: '' })
    const [currentStatus, setCurrentStatus] = useState(process.status)

    // eventos locais
    const [events, setEvents] = useState<ProcessEvent[]>([])
    const [eventForm, setEventForm] = useState({
        tipoEvento: 'Audiência' as typeof TIPO_EVENTO_OPTIONS[number],
        data: '',
        hora: '',
        endereco: '',
        showTipoDropdown: false,
    })

    // anotações locais
    const [notes, setNotes] = useState<ProcessNote[]>([])
    const [noteForm, setNoteForm] = useState({
        titulo: '',
        numeroCat: '',
        senhaInss: '',
        rg: '',
        observacao: '',
    })

    const getLinkedDocuments = () =>
        board.columns
            .flatMap(col => col.cards)
            .filter(card =>
                card.linkedProcessId === process.id.toString() &&
                card.linkedProcessType === type
            )

    const handleStatusChange = (newStatus: string) => {
        const entry: ProcessHistoryEntry = {
            id: Date.now().toString(),
            processId: process.id,
            tipo: 'status',
            campo: 'Status',
            valorAnterior: currentStatus,
            valorNovo: newStatus,
            autor: process.responsavel,
            data: new Date().toLocaleString('pt-BR'),
        }
        setHistory(prev => [entry, ...prev])
        setCurrentStatus(newStatus)
        setShowStatusDropdown(false)
    }

    const handleAddHistoryEntry = () => {
        if (!historyForm.texto.trim()) return
        const entry: ProcessHistoryEntry = {
            id: Date.now().toString(),
            processId: process.id,
            tipo: historyForm.tipo,
            texto: historyForm.texto.trim(),
            autor: process.responsavel,
            data: new Date().toLocaleString('pt-BR'),
        }
        setHistory(prev => [entry, ...prev])
        setHistoryForm({ tipo: 'comentario', texto: '' })
        setShowHistoryModal(false)
    }

    const handleSaveEvent = () => {
        if (!eventForm.data || !eventForm.hora) return
        const ev: ProcessEvent = {
            id: Date.now().toString(),
            processId: process.id,
            tipoEvento: eventForm.tipoEvento,
            data: eventForm.data,
            hora: eventForm.hora,
            endereco: eventForm.endereco || undefined,
            cliente: process.cliente,
            responsavel: process.responsavel,
            parceiro: process.parceiro,
            processType: type,
        }
        setEvents(prev => [ev, ...prev])
        if (onAddEvent) onAddEvent(ev)
        const hist: ProcessHistoryEntry = {
            id: Date.now().toString() + 'h',
            processId: process.id,
            tipo: 'auditoria',
            texto: `Evento marcado: ${ev.tipoEvento} em ${ev.data} às ${ev.hora}`,
            autor: process.responsavel,
            data: new Date().toLocaleString('pt-BR'),
        }
        setHistory(prev => [hist, ...prev])
        setEventForm({ tipoEvento: 'Audiência', data: '', hora: '', endereco: '', showTipoDropdown: false })
        setShowEventModal(false)
    }

    const handleSaveNote = () => {
        const hasContent = noteForm.titulo.trim() || noteForm.numeroCat.trim() || noteForm.senhaInss.trim() || noteForm.rg.trim() || noteForm.observacao.trim()
        if (!hasContent) return
        const note: ProcessNote = {
            id: Date.now().toString(),
            processId: process.id,
            ...noteForm,
            autor: process.responsavel,
            data: new Date().toLocaleString('pt-BR'),
        }
        setNotes(prev => [note, ...prev])
        const hist: ProcessHistoryEntry = {
            id: Date.now().toString() + 'h',
            processId: process.id,
            tipo: 'auditoria',
            texto: `Anotação adicionada${note.titulo ? ': ' + note.titulo : ''}`,
            autor: process.responsavel,
            data: new Date().toLocaleString('pt-BR'),
        }
        setHistory(prev => [hist, ...prev])
        setNoteForm({ titulo: '', numeroCat: '', senhaInss: '', rg: '', observacao: '' })
        setShowNoteModal(false)
    }

    const handleDeleteNote = (id: string) => {
        setNotes(prev => prev.filter(n => n.id !== id))
    }

    const historyTypeConfig: Record<ProcessHistoryEntry['tipo'], { label: string; color: string; icon: React.ReactNode }> = {
        status: { label: 'Status', color: 'bg-blue-600', icon: <Clock size={12} /> },
        setor: { label: 'Setor', color: 'bg-purple-600', icon: <History size={12} /> },
        auditoria: { label: 'Auditoria', color: 'bg-orange-500', icon: <History size={12} /> },
        comentario: { label: 'Comentário', color: 'bg-green-600', icon: <MessageSquare size={12} /> },
    }

    const tabs = [
        { id: 'detalhes', label: 'Detalhes' },
        { id: 'historico', label: `Histórico (${history.length})` },
        { id: 'documentos', label: `Documentos (${getLinkedDocuments().length})` },
    ] as const

    return (
        <div className={`${bg} min-h-screen`}>
            {/* Header */}
            <div className={`${card} border-b ${border} px-6 py-4 flex items-center justify-between sticky top-0 z-10`}>
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition ${darkMode ? 'border-dark-600 text-gray-300 hover:bg-dark-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                    >
                        <ChevronLeft size={16} /> Voltar
                    </button>
                    <div>
                        <span className={`text-xs font-semibold uppercase ${muted}`}>{type === 'estadual' ? 'Processo Estadual' : 'Processo Federal'}</span>
                        <h1 className={`text-lg font-bold ${text}`}>#{process.numero} — {process.cliente}</h1>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowNoteModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-white text-sm font-bold transition shadow-md"
                    >
                        <StickyNote size={16} /> Anotação
                    </button>
                    <button
                        onClick={() => setShowEventModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition shadow-md"
                    >
                        <Calendar size={16} /> Eventos
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className={`${card} border-b ${border} px-6`}>
                <div className="flex gap-2 py-2">
                    {tabs.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            className={`px-5 py-2 text-sm font-semibold rounded-lg transition ${activeTab === t.id
                                    ? t.id === 'detalhes' ? 'bg-blue-600 text-white shadow'
                                        : t.id === 'historico' ? 'bg-purple-600 text-white shadow'
                                            : 'bg-green-700 text-white shadow'
                                    : darkMode ? 'bg-dark-700 text-gray-300 hover:bg-dark-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-6 max-w-6xl mx-auto space-y-6">
                {/* ===== TAB DETALHES ===== */}
                {activeTab === 'detalhes' && (
                    <>
                        {/* Identificação */}
                        <div className={`${card} rounded-xl border ${border} p-6`}>
                            <h2 className={`text-sm font-bold uppercase tracking-wider mb-4 ${muted}`}>Identificação</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div><label className={labelCls}>Nome</label><p className={valueCls}>{process.cliente}</p></div>
                                <div><label className={labelCls}>CPF</label><p className={valueCls}>{process.cpf}</p></div>
                                <div><label className={labelCls}>Telefone</label><p className={valueCls}>{process.telefone || '—'}</p></div>
                                <div><label className={labelCls}>E-mail</label><p className={valueCls}>{process.email || '—'}</p></div>
                                <div><label className={labelCls}>Cidade</label><p className={valueCls}>{process.cidade}</p></div>
                                <div><label className={labelCls}>UF</label><p className={valueCls}>{process.uf}</p></div>
                            </div>
                        </div>

                        {/* Processo */}
                        <div className={`${card} rounded-xl border ${border} p-6`}>
                            <h2 className={`text-sm font-bold uppercase tracking-wider mb-4 ${muted}`}>Dados do Processo</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div><label className={labelCls}>Parceiro</label><p className={valueCls}>{process.parceiro}</p></div>
                                <div><label className={labelCls}>Natureza</label><p className={valueCls}>{process.natureza || '—'}</p></div>
                                <div><label className={labelCls}>Tipo</label><p className={valueCls}>{process.tipo || '—'}</p></div>
                                <div><label className={labelCls}>N° Processo</label><p className={valueCls}>{process.nProcesso || process.processo}</p></div>
                                <div><label className={labelCls}>Data Início</label><p className={valueCls}>{process.dataInicio}</p></div>
                                <div><label className={labelCls}>Órgão</label><p className={valueCls}>{process.orgao || '—'}</p></div>
                                <div className="col-span-2"><label className={labelCls}>Endereço</label><p className={valueCls}>{process.endereco || '—'}</p></div>
                                <div><label className={labelCls}>Fase</label><p className={valueCls}>{process.fase || '—'}</p></div>
                            </div>
                        </div>

                        {/* Andamento */}
                        <div className={`${card} rounded-xl border ${border} p-6`}>
                            <h2 className={`text-sm font-bold uppercase tracking-wider mb-4 ${muted}`}>Andamento</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div><label className={labelCls}>Setor</label><p className={valueCls}>{process.setor || '—'}</p></div>
                                <div><label className={labelCls}>Responsável</label><p className={valueCls}>{process.responsavel}</p></div>
                                <div className="relative">
                                    <label className={labelCls}>Status</label>
                                    <button
                                        onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold border transition flex items-center justify-between ${darkMode ? 'bg-dark-700 border-dark-500 text-white hover:border-blue-500' : 'bg-blue-50 border-blue-200 text-blue-800 hover:border-blue-400'}`}
                                    >
                                        {currentStatus}
                                        <span className="text-xs opacity-60">▼</span>
                                    </button>
                                    {showStatusDropdown && (
                                        <div className={`absolute top-full left-0 mt-1 w-full rounded-lg shadow-xl z-20 border ${border} ${card} overflow-hidden`}>
                                            {STATUS_OPTIONS.map(opt => (
                                                <button
                                                    key={opt}
                                                    onClick={() => handleStatusChange(opt)}
                                                    className={`w-full text-left px-3 py-2 text-sm transition border-b ${border} ${opt === currentStatus ? (darkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-50 text-blue-700') : (darkMode ? 'hover:bg-dark-700' : 'hover:bg-gray-50')} ${text}`}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div><label className={labelCls}>Andamento</label><p className={valueCls}>{process.andamento || '—'}</p></div>
                                <div><label className={labelCls}>Última Alteração</label><p className={valueCls}>{process.ultimaAlteracao}</p></div>
                            </div>
                        </div>

                        {/* Eventos */}
                        {events.length > 0 && (
                            <div className={`${card} rounded-xl border ${border} p-6`}>
                                <h2 className={`text-sm font-bold uppercase tracking-wider mb-4 ${muted}`}>Eventos Marcados</h2>
                                <div className="space-y-2">
                                    {events.map(ev => (
                                        <div key={ev.id} className={`flex items-center gap-4 p-3 rounded-lg border ${border}`}>
                                            <span className="px-2 py-1 rounded bg-blue-600 text-white text-xs font-semibold">{ev.tipoEvento}</span>
                                            <span className={`text-sm ${text}`}>{ev.data}</span>
                                            <span className={`text-sm font-semibold ${text}`}>{ev.hora}</span>
                                            {ev.endereco && <span className={`text-xs ${muted} flex items-center gap-1`}><MapPin size={12} /> {ev.endereco}</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Anotações */}
                        {notes.length > 0 && (
                            <div className={`${card} rounded-xl border ${border} p-6`}>
                                <h2 className={`text-sm font-bold uppercase tracking-wider mb-4 ${muted}`}>Anotações</h2>
                                <div className="space-y-3">
                                    {notes.map(note => (
                                        <div key={note.id} className={`p-4 rounded-lg border ${border}`}>
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    {note.titulo && <p className={`font-semibold text-sm ${text}`}>{note.titulo}</p>}
                                                    <span className={`text-xs ${muted}`}>{note.data}</span>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteNote(note.id)}
                                                    className="p-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white transition ml-2 shrink-0"
                                                    title="Excluir anotação"
                                                >
                                                    <X size={13} />
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                {note.numeroCat && <span className={muted}>CAT: {note.numeroCat}</span>}
                                                {note.senhaInss && <span className={muted}>INSS: {note.senhaInss}</span>}
                                                {note.rg && <span className={muted}>RG: {note.rg}</span>}
                                                {note.observacao && <p className={`col-span-2 ${muted}`}>{note.observacao}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* ===== TAB HISTÓRICO ===== */}
                {activeTab === 'historico' && (
                    <div className={`${card} rounded-xl border ${border} p-6`}>
                        <h2 className={`text-sm font-bold uppercase tracking-wider mb-4 ${muted}`}>Histórico & Auditoria</h2>

                        {/* Botão Adicionar ao histórico */}
                        <div className="flex justify-end mb-6">
                            <button
                                onClick={() => setShowHistoryModal(true)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition shadow"
                            >
                                <Plus size={15} /> Adicionar
                            </button>
                        </div>

                        {/* Lista de histórico */}
                        <div className="space-y-3">
                            {history.map(entry => {
                                const cfg = historyTypeConfig[entry.tipo]
                                return (
                                    <div key={entry.id} className={`flex gap-3 p-4 rounded-lg border ${border}`}>
                                        <div className={`${cfg.color} text-white rounded-full w-7 h-7 flex items-center justify-center shrink-0 mt-0.5`}>
                                            {cfg.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${cfg.color} text-white`}>{cfg.label}</span>
                                                <span className={`text-xs ${muted}`}>{entry.autor} · {entry.data}</span>
                                            </div>
                                            {entry.tipo === 'status' || entry.tipo === 'setor' ? (
                                                <p className={`text-sm ${text}`}>
                                                    <span className="font-medium">{entry.campo}</span>: {' '}
                                                    <span className="line-through opacity-50">{entry.valorAnterior}</span>
                                                    {' → '}
                                                    <span className="font-semibold">{entry.valorNovo}</span>
                                                </p>
                                            ) : (
                                                <p className={`text-sm ${text}`}>{entry.texto}</p>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* ===== TAB DOCUMENTOS ===== */}
                {activeTab === 'documentos' && (
                    <div className={`${card} rounded-xl border ${border} p-6`}>
                        <h2 className={`text-sm font-bold uppercase tracking-wider mb-4 ${muted}`}>Documentos Vinculados</h2>
                        {getLinkedDocuments().length === 0 ? (
                            <div className={`text-center py-12 ${muted}`}>
                                <FileText size={40} className="mx-auto mb-3 opacity-30" />
                                <p className="text-sm">Nenhum documento vinculado a este processo</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {getLinkedDocuments().map(doc => (
                                    <div key={doc.id} className={`p-4 rounded-lg border ${border} flex items-start gap-3 hover:border-blue-400 transition cursor-pointer`}>
                                        <FileText size={18} className={muted} />
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-medium text-sm ${text}`}>{doc.title}</p>
                                            {doc.description && <p className={`text-xs mt-1 ${muted}`}>{doc.description}</p>}
                                            <div className="flex gap-2 mt-2">
                                                {doc.attachments.length > 0 && (
                                                    <span className={`text-xs px-2 py-0.5 rounded ${darkMode ? 'bg-dark-600' : 'bg-gray-200'} ${text}`}>
                                                        <Paperclip size={10} className="inline mr-1" />{doc.attachments.length}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ===== MODAL HISTÓRICO ===== */}
            {showHistoryModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className={`${card} rounded-xl shadow-2xl border ${border} w-full max-w-md`}>
                        <div className={`flex items-center justify-between p-5 border-b ${border}`}>
                            <h3 className={`text-base font-bold ${text}`}>Adicionar ao Histórico</h3>
                            <button onClick={() => setShowHistoryModal(false)} className={`p-1 rounded ${muted} hover:opacity-70`}><X size={20} /></button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <label className={labelCls}>Tipo de Registro</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setHistoryForm(f => ({ ...f, tipo: 'comentario' }))}
                                        className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition border-2 ${historyForm.tipo === 'comentario' ? 'bg-green-600 border-green-600 text-white' : darkMode ? 'border-dark-500 text-gray-300 hover:border-green-500' : 'border-gray-300 text-gray-600 hover:border-green-400'}`}
                                    >
                                        💬 Comentário
                                    </button>
                                    <button
                                        onClick={() => setHistoryForm(f => ({ ...f, tipo: 'auditoria' }))}
                                        className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition border-2 ${historyForm.tipo === 'auditoria' ? 'bg-orange-500 border-orange-500 text-white' : darkMode ? 'border-dark-500 text-gray-300 hover:border-orange-400' : 'border-gray-300 text-gray-600 hover:border-orange-400'}`}
                                    >
                                        📋 Auditoria
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>Descrição</label>
                                <textarea
                                    value={historyForm.texto}
                                    onChange={e => setHistoryForm(f => ({ ...f, texto: e.target.value }))}
                                    rows={4}
                                    placeholder={historyForm.tipo === 'auditoria' ? 'Descreva a auditoria realizada...' : 'Escreva seu comentário...'}
                                    className={`${inputCls} resize-none`}
                                />
                            </div>
                        </div>
                        <div className={`flex gap-2 p-5 border-t ${border}`}>
                            <button onClick={() => setShowHistoryModal(false)} className={`flex-1 px-4 py-2 rounded-lg text-sm transition ${darkMode ? 'bg-dark-700 hover:bg-dark-600' : 'bg-gray-200 hover:bg-gray-300'} ${text}`}>
                                Cancelar
                            </button>
                            <button
                                onClick={handleAddHistoryEntry}
                                disabled={!historyForm.texto.trim()}
                                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-40 flex items-center justify-center gap-1.5 ${historyForm.tipo === 'auditoria' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-600 hover:bg-green-700'} text-white`}
                            >
                                <Save size={14} /> Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== MODAL EVENTO ===== */}
            {showEventModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className={`${card} rounded-xl shadow-2xl border ${border} w-full max-w-md`}>
                        <div className={`flex items-center justify-between p-5 border-b ${border}`}>
                            <h3 className={`text-base font-bold ${text}`}>Marcar Evento</h3>
                            <button onClick={() => setShowEventModal(false)} className={`p-1 rounded hover:bg-gray-200 ${muted}`}><X size={20} /></button>
                        </div>
                        <div className="p-5 space-y-4">
                            {/* Tipo de Evento */}
                            <div>
                                <label className={labelCls}>Tipo de Evento</label>
                                <div className="relative">
                                    <button
                                        onClick={() => setEventForm(f => ({ ...f, showTipoDropdown: !f.showTipoDropdown }))}
                                        className={`w-full text-left px-3 py-2 rounded-lg border text-sm flex items-center justify-between ${darkMode ? 'bg-dark-700 border-dark-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                    >
                                        {eventForm.tipoEvento} <span className="opacity-50">▼</span>
                                    </button>
                                    {eventForm.showTipoDropdown && (
                                        <div className={`absolute top-full left-0 mt-1 w-full rounded-lg shadow-xl z-20 border ${border} ${card} overflow-hidden`}>
                                            {TIPO_EVENTO_OPTIONS.map(opt => (
                                                <button
                                                    key={opt}
                                                    onClick={() => setEventForm(f => ({ ...f, tipoEvento: opt, showTipoDropdown: false }))}
                                                    className={`w-full text-left px-3 py-2 text-sm border-b ${border} transition ${opt === eventForm.tipoEvento ? (darkMode ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-50 text-blue-700') : (darkMode ? 'hover:bg-dark-700' : 'hover:bg-gray-50')} ${text}`}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* Data e hora */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelCls}>Data</label>
                                    <input type="date" value={eventForm.data} onChange={e => setEventForm(f => ({ ...f, data: e.target.value }))} className={inputCls} />
                                </div>
                                <div>
                                    <label className={labelCls}>Horário</label>
                                    <input type="time" value={eventForm.hora} onChange={e => setEventForm(f => ({ ...f, hora: e.target.value }))} className={inputCls} />
                                </div>
                            </div>
                            {/* Endereço opcional */}
                            <div>
                                <label className={labelCls}>Endereço <span className={`normal-case font-normal ${muted}`}>(opcional)</span></label>
                                <input
                                    type="text"
                                    value={eventForm.endereco}
                                    onChange={e => setEventForm(f => ({ ...f, endereco: e.target.value }))}
                                    placeholder="Rua, número, cidade..."
                                    className={inputCls}
                                />
                            </div>
                        </div>
                        <div className={`flex gap-2 p-5 border-t ${border}`}>
                            <button onClick={() => setShowEventModal(false)} className={`flex-1 px-4 py-2 rounded-lg text-sm transition ${darkMode ? 'bg-dark-700 hover:bg-dark-600' : 'bg-gray-200 hover:bg-gray-300'} ${text}`}>
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveEvent}
                                disabled={!eventForm.data || !eventForm.hora}
                                className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition disabled:opacity-40 flex items-center justify-center gap-1.5"
                            >
                                <Save size={14} /> Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== MODAL ANOTAÇÃO ===== */}
            {showNoteModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className={`${card} rounded-xl shadow-2xl border ${border} w-full max-w-md`}>
                        <div className={`flex items-center justify-between p-5 border-b ${border}`}>
                            <h3 className={`text-base font-bold ${text}`}>Anotação</h3>
                            <button onClick={() => setShowNoteModal(false)} className={`p-1 rounded hover:bg-gray-200 ${muted}`}><X size={20} /></button>
                        </div>
                        <div className="p-5 space-y-3">
                            <div>
                                <label className={labelCls}>Título <span className="normal-case font-normal opacity-60 text-xs">(opcional)</span></label>
                                <input
                                    type="text"
                                    value={noteForm.titulo}
                                    onChange={e => setNoteForm(f => ({ ...f, titulo: e.target.value }))}
                                    placeholder="Título da anotação"
                                    className={inputCls}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelCls}>Número CAT</label>
                                    <input type="text" value={noteForm.numeroCat} onChange={e => setNoteForm(f => ({ ...f, numeroCat: e.target.value }))} placeholder="0000000000" className={inputCls} />
                                </div>
                                <div>
                                    <label className={labelCls}>Senha INSS</label>
                                    <input type="text" value={noteForm.senhaInss} onChange={e => setNoteForm(f => ({ ...f, senhaInss: e.target.value }))} placeholder="••••••••" className={inputCls} />
                                </div>
                                <div>
                                    <label className={labelCls}>RG</label>
                                    <input type="text" value={noteForm.rg} onChange={e => setNoteForm(f => ({ ...f, rg: e.target.value }))} placeholder="00.000.000-0" className={inputCls} />
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>Observação</label>
                                <textarea
                                    value={noteForm.observacao}
                                    onChange={e => setNoteForm(f => ({ ...f, observacao: e.target.value }))}
                                    rows={3}
                                    placeholder="Observações..."
                                    className={`${inputCls} resize-none`}
                                />
                            </div>
                        </div>
                        <div className={`flex gap-2 p-5 border-t ${border}`}>
                            <button onClick={() => setShowNoteModal(false)} className={`flex-1 px-4 py-2 rounded-lg text-sm transition ${darkMode ? 'bg-dark-700 hover:bg-dark-600' : 'bg-gray-200 hover:bg-gray-300'} ${text}`}>
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveNote}
                                className="flex-1 px-4 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium transition flex items-center justify-center gap-1.5"
                            >
                                <Save size={14} /> Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
