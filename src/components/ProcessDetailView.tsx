import React, { useState } from 'react'
import {
    ChevronLeft, FileText, Paperclip, Calendar, StickyNote,
    Plus, X, Clock, MapPin, Save, History, MessageSquare, CheckCircle2, AlertCircle, Edit2, Trash2
} from 'lucide-react'
import { Process, ProcessHistoryEntry, ProcessEvent, ProcessNote, ProcessTask } from '../types'
import { usePastaStore } from './pasta/pastaStore'
import { useTasks } from '../contexts/TasksContext'
import { useSupabaseUsuarios } from '../hooks/useSupabaseUsuarios'
import { useSupabaseParceiros } from '../hooks/useSupabaseParceiros'
import { useSupabaseSetores } from '../hooks/useSupabaseSetores'

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

const NATUREZA_OPTIONS = ['CIVIL', 'TRABALHISTA', 'PREVIDENCIÁRIA']
const TIPO_OPTIONS: Record<string, string[]> = {
    'CIVIL': ['AÇÕES CIVIS'],
    'TRABALHISTA': ['TRABALHISTA', 'ÇÃO DE SEGURO DE VIDA', 'TRABALHISTA EXECUÇÃO', 'TRABALHISTA ACIDENTE'],
    'PREVIDENCIÁRIA': ['AUXÍLIO-ACIDENTE', 'AUXÍLIO-DOEÇA', 'AUXÍLIO-REC-PROFISSIONAL', 'AUXÍLIO-TRAb-ACIDENTE', 'AVENT-RÁPIDA-FĀMLIA', 'BENEFÍCIO-ASSISTENCIAL-IDOSO', 'BENÉFİCIO-ASSISTENCIAL-PESSOA-DEFICIENTE', 'BENÉFİCIO-PRESTADOR-INFORMACAO', 'BENÉFİCIO-REQUERENTE-INFORMACAO', 'BENÉFİCIO-SOLICITACAO-COPIA-DOCUMENTO', 'BENÉFİCIO-VALIDADE-DOCUMENTO', 'BUSC-ATIVO-INFORMACAO', 'CERTIDAO-AUXILIO-ACIDENTE', 'CERTIDAO-AUXILIO-DOENCA', 'CERTIDAO-AUXILIO-REC-PROFISSIONAL']
}

const TIPO_EVENTO_OPTIONS = ['Perícia Adm.', 'Perícia Jur.', 'Audiência', 'Reunião Cliente'] as const
const TIPO_ACAO_OPTIONS = ['Pedir Documentação', 'Anotação', 'Evento', 'Reunião', 'Análise', 'Outro'] as const
const STATUS_TAREFA_OPTIONS = ['Não Ajuizado', 'Ajuizado', 'Pendência', 'Pendência Cumprida', 'Aguardando Ajuizamento', 'Arquivado'] as const
const ANDAMENTO_OPTIONS = ['Parado', 'Em Análise', 'Pendência', 'Aguardando', 'Resolvido']

const TAREFA_TIPOS_OPTIONS = ['Documento', 'Evento', 'Anotação'] as const
const TAREFA_ACOES_POR_TIPO: Record<string, string[]> = {
    'Documento': ['Retificar', 'Enviar'],
    'Evento': ['Agendar', 'Informar', 'Reagendar'],
    'Anotação': ['Adicionar', 'Corrigir'],
}
const TAREFA_DOCUMENTOS_OPTIONS = [
    'EXTRATO DE PAGAMENTO', 'LOCAL DA PERÍCIA', 'REQUERIMENTO PROCESSO ADM',
    'REQUERIMENTO INSS', 'CAT', 'PROCURAÇÃO ADM INSS', 'CARTA DE CONCESSÃO',
    'CNIS', 'EXTRATO DE INFORMAÇÃO DE BENEFÍCIOS', 'ATESTADO MÉDICO',
    'COMPROVANTE DE RESIDENCIA', 'JUSTIÇA GRATUITA', 'PROCURAÇÃO',
    'FOTO', 'DOCUMENTO PESSOA', 'CTPS',
]
const TAREFA_EQUIPES_OPTIONS = ['Equipe Jurídica', 'Equipe Administrativa', 'Equipe Previdenciária', 'Equipe Contenciosa']
const TAREFA_TIPO_RESPONSAVEL_OPTIONS = ['Setor', 'Usuário', 'Equipe'] as const

export const ProcessDetailView: React.FC<ProcessDetailViewProps> = ({
    process, type, darkMode, onBack, onAddEvent
}) => {
    const board = usePastaStore((s) => s.board)
    const { addTask: addGlobalTask } = useTasks()
    const { nomes: RESPONSAVEIS_OPTIONS } = useSupabaseUsuarios()
    const { nomes: parceiroNomes } = useSupabaseParceiros()
    const { nomes: SETORES_OPTIONS } = useSupabaseSetores()

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
    const [showNaturezaDropdown, setShowNaturezaDropdown] = useState(false)
    const [showTipoDropdown, setShowTipoDropdown] = useState(false)

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

    // tarefas locais
    const [tasks, setTasks] = useState<ProcessTask[]>([])
    const [showTaskModal, setShowTaskModal] = useState(false)
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
    const [taskForm, setTaskForm] = useState({
        tipo: '' as 'Documento' | 'Evento' | 'Anotação' | '',
        acao: '',
        tarefa: '',
        observacao: '',
        prazo: '',
        tipoResponsavel: '' as 'Setor' | 'Usuário' | 'Equipe' | '',
        responsavel: '',
        showTipoDropdown: false,
        showAcaoDropdown: false,
        showTarefaDropdown: false,
        showTipoResponsavelDropdown: false,
        showResponsavelDropdown: false,
    })

    // edição de campos do processo
    const [editForm, setEditForm] = useState({
        telefone: process.telefone || '',
        email: process.email || '',
        parceiro: process.parceiro || '',
        natureza: process.natureza || '',
        tipo: process.tipo || '',
        nProcesso: process.nProcesso || '',
        dataInicio: process.dataInicio || '',
        orgao: process.orgao || '',
        endereco: process.endereco || '',
        setor: process.setor || '',
        responsavel: process.responsavel || '',
        andamento: process.andamento || '',
    })
    const [showSetorDropdown, setShowSetorDropdown] = useState(false)
    const [showResponsavelDropdown, setShowResponsavelDropdown] = useState(false)
    const [showParceiroDropdown, setShowParceiroDropdown] = useState(false)
    const [showAndamentoDropdown, setShowAndamentoDropdown] = useState(false)
    const [saveConfirmed, setSaveConfirmed] = useState(false)

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
            cpf: process.cpf,
            natureza: process.natureza,
            status: 'Agendado',
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
        setNoteForm({ titulo: '', numeroCat: '', senhaInss: '', rg: '', observacao: '' })
    }

    const handleDeleteNote = (id: string) => {
        setNotes(prev => prev.filter(n => n.id !== id))
    }

    const handleSaveTask = () => {
        if (!taskForm.tipo || !taskForm.acao || !taskForm.tipoResponsavel || !taskForm.responsavel) return

        const TIPO_ACAO_MAP: Record<string, typeof TIPO_ACAO_OPTIONS[number]> = {
            'Documento': 'Pedir Documentação',
            'Evento': 'Evento',
            'Anotação': 'Anotação',
        }
        const titulo = taskForm.tipo === 'Documento'
            ? `${taskForm.acao} - ${taskForm.tarefa || 'Documento'}`
            : `${taskForm.tipo} - ${taskForm.acao}`

        const newTask: ProcessTask = {
            id: Date.now().toString(),
            processId: process.id,
            titulo,
            responsavel: taskForm.responsavel,
            setor: taskForm.tipoResponsavel === 'Setor' ? taskForm.responsavel : 'Administrativo',
            observacao: taskForm.observacao,
            tipoAcao: TIPO_ACAO_MAP[taskForm.tipo] ?? 'Outro',
            tipo: taskForm.tipo as 'Documento' | 'Evento' | 'Anotação',
            acao: taskForm.acao,
            tarefa: taskForm.tarefa || undefined,
            prazo: taskForm.prazo || undefined,
            tipoResponsavel: taskForm.tipoResponsavel as 'Setor' | 'Usuário' | 'Equipe',
            status: 'Não Ajuizado',
            dataCriacao: new Date().toLocaleString('pt-BR'),
            autor: process.responsavel,
        }
        setTasks(prev => [newTask, ...prev])
        addGlobalTask(newTask)

        setTaskForm({ tipo: '', acao: '', tarefa: '', observacao: '', prazo: '', tipoResponsavel: '', responsavel: '', showTipoDropdown: false, showAcaoDropdown: false, showTarefaDropdown: false, showTipoResponsavelDropdown: false, showResponsavelDropdown: false })
        setShowTaskModal(false)
    }

    const handleDeleteTask = (id: string) => {
        setTasks(prev => prev.filter(t => t.id !== id))
    }

    const handleCompleteTask = (id: string) => {
        setTasks(prev => prev.map(t =>
            t.id === id
                ? { ...t, status: t.status === 'Pendência' ? 'Pendência Cumprida' : 'Pendência', dataConclusao: t.status === 'Pendência' ? new Date().toLocaleString('pt-BR') : undefined }
                : t
        ))
    }

    const handleSaveProcess = () => {
        const initial: Record<string, string> = {
            telefone: process.telefone || '',
            email: process.email || '',
            parceiro: process.parceiro || '',
            natureza: process.natureza || '',
            tipo: process.tipo || '',
            nProcesso: process.nProcesso || '',
            dataInicio: process.dataInicio || '',
            orgao: process.orgao || '',
            endereco: process.endereco || '',
            setor: process.setor || '',
            responsavel: process.responsavel || '',
            andamento: process.andamento || '',
        }
        const fieldLabels: Record<string, string> = {
            telefone: 'Telefone', email: 'E-mail', parceiro: 'Parceiro',
            natureza: 'Natureza', tipo: 'Tipo', nProcesso: 'N° Processo',
            dataInicio: 'Data Início', orgao: 'Órgão', endereco: 'Endereço',
            setor: 'Setor', responsavel: 'Responsável', andamento: 'Andamento',
        }
        const current = editForm as Record<string, string>
        const newEntries: ProcessHistoryEntry[] = []
        Object.keys(current).forEach(key => {
            if (current[key] !== initial[key]) {
                newEntries.push({
                    id: `${Date.now()}-${key}`,
                    processId: process.id,
                    tipo: key === 'setor' ? 'setor' : 'auditoria',
                    campo: fieldLabels[key],
                    valorAnterior: initial[key] || '—',
                    valorNovo: current[key] || '—',
                    autor: process.responsavel,
                    data: new Date().toLocaleString('pt-BR'),
                })
            }
        })
        if (newEntries.length > 0) {
            setHistory(prev => [...newEntries, ...prev])
        }
        setSaveConfirmed(true)
        setTimeout(() => setSaveConfirmed(false), 2000)
    }

    const historyTypeConfig: Record<ProcessHistoryEntry['tipo'], { label: string; color: string; icon: React.ReactNode }> = {
        status: { label: 'Status', color: 'bg-blue-600', icon: <Clock size={12} /> },
        setor: { label: 'Setor', color: 'bg-purple-600', icon: <History size={12} /> },
        auditoria: { label: 'Auditoria', color: 'bg-orange-500', icon: <History size={12} /> },
        comentario: { label: 'Comentário', color: 'bg-green-600', icon: <MessageSquare size={12} /> },
    }

    return (
        <div className={`${bg} min-h-screen`} onClick={() => { setShowStatusDropdown(false); setShowSetorDropdown(false); setShowResponsavelDropdown(false); setShowParceiroDropdown(false); setShowAndamentoDropdown(false) }}>
            {/* Header */}
            <div className={`${card} border-b ${border} px-6 py-4 flex items-center justify-between sticky top-0 z-10`} onClick={e => e.stopPropagation()}>
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
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowEventModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition shadow-md"
                    >
                        <Calendar size={16} /> Eventos
                    </button>
                </div>
            </div>

            {/* Layout 4 colunas */}
            <div className="p-4 grid grid-cols-1 xl:grid-cols-[280px_320px_1fr_300px] gap-5 items-start">

                {/* ===== ESQUERDA: HISTÓRICO ===== */}
                <div className={`${card} rounded-xl border ${border} flex flex-col sticky top-[80px] max-h-[calc(100vh-96px)]`} onClick={e => e.stopPropagation()}>
                    <div className={`flex items-center justify-between px-4 py-3 border-b ${border} shrink-0`}>
                        <h2 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${muted}`}>
                            <History size={13} /> Histórico ({history.length})
                        </h2>
                        <button
                            onClick={() => setShowHistoryModal(true)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition"
                        >
                            <Plus size={12} /> Adicionar
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
                        {history.map(entry => {
                            const cfg = historyTypeConfig[entry.tipo]
                            const showFieldChange = entry.campo !== undefined && entry.valorAnterior !== undefined
                            return (
                                <div key={entry.id} className={`p-3 rounded-lg border ${border}`}>
                                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-white text-xs font-semibold ${cfg.color} shrink-0`}>
                                            {cfg.icon} {cfg.label}
                                        </span>
                                        <span className={`text-xs ${muted}`}>{entry.data}</span>
                                    </div>
                                    {showFieldChange ? (
                                        <p className={`text-xs ${text}`}>
                                            <span className="font-medium">{entry.campo}</span>:{' '}
                                            <span className="line-through opacity-50">{entry.valorAnterior}</span>
                                            {' → '}
                                            <span className="font-semibold">{entry.valorNovo}</span>
                                        </p>
                                    ) : (
                                        <p className={`text-xs ${text}`}>{entry.texto}</p>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* ===== ESQUERDA CENTRO: TAREFAS ===== */}
                <div className={`${card} rounded-xl border ${border} flex flex-col sticky top-[80px] max-h-[calc(100vh-96px)]`} onClick={e => e.stopPropagation()}>
                    <div className={`flex items-center justify-between px-4 py-3 border-b ${border} shrink-0`}>
                        <h2 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${muted}`}>
                            <AlertCircle size={13} /> Tarefas ({tasks.length})
                        </h2>
                        <button
                            onClick={() => { setEditingTaskId(null); setTaskForm({ tipo: '', acao: '', tarefa: '', observacao: '', prazo: '', tipoResponsavel: '', responsavel: '', showTipoDropdown: false, showAcaoDropdown: false, showTarefaDropdown: false, showTipoResponsavelDropdown: false, showResponsavelDropdown: false }); setShowTaskModal(true) }}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition"
                        >
                            <Plus size={12} /> Adicionar
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
                        {tasks.length === 0 && (
                            <p className={`text-xs italic text-center py-4 ${muted}`}>Nenhuma tarefa.</p>
                        )}
                        {tasks.map(task => (
                            <div key={task.id} className={`p-3 rounded-lg border ${border} space-y-2`}>
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <h3 className={`font-semibold text-xs ${text}`}>{task.titulo}</h3>
                                        <p className={`text-xs ${muted} line-clamp-1`}>{task.descricao || '—'}</p>
                                    </div>
                                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-white text-xs font-semibold shrink-0 ${task.status === 'Ajuizado' ? 'bg-blue-600' :
                                        task.status === 'Pendência' ? 'bg-orange-500' :
                                            task.status === 'Pendência Cumprida' ? 'bg-green-600' :
                                                task.status === 'Aguardando Ajuizamento' ? 'bg-yellow-600' :
                                                    task.status === 'Arquivado' ? 'bg-gray-500' : 'bg-red-600'
                                        }`}>
                                        {task.status === 'Pendência Cumprida' && <CheckCircle2 size={11} />}
                                        {task.status.length > 12 ? task.status.substring(0, 10) + '...' : task.status}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <div className={`text-xs ${muted}`}><span className="font-semibold">Tipo:</span> {task.tipo ? `${task.tipo} / ${task.acao}` : task.tipoAcao}</div>
                                    {task.tarefa && <div className={`text-xs ${muted}`}><span className="font-semibold">Tarefa:</span> {task.tarefa}</div>}
                                    {task.prazo && <div className={`text-xs ${muted}`}><span className="font-semibold">Prazo:</span> {task.prazo}</div>}
                                    <div className={`text-xs ${muted}`}><span className="font-semibold">Responsável:</span> {task.responsavel}</div>
                                    {task.observacao && <div className={`text-xs ${muted} line-clamp-2`}><span className="font-semibold">Obs:</span> {task.observacao}</div>}
                                </div>
                                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-opacity-20">
                                    <button
                                        onClick={() => handleCompleteTask(task.id)}
                                        className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs font-bold transition ${task.status === 'Pendência Cumprida'
                                            ? 'bg-green-600 hover:bg-green-700 text-white'
                                            : 'bg-green-100 hover:bg-green-200 text-green-700'
                                            }`}
                                    >
                                        <CheckCircle2 size={12} /> Concluir
                                    </button>
                                    <button
                                        onClick={() => handleDeleteTask(task.id)}
                                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold transition"
                                    >
                                        <Trash2 size={12} /> Deletar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ===== CENTRO: CAMPOS EDITÁVEIS ===== */}
                <div className="space-y-4" onClick={e => e.stopPropagation()}>
                    {/* Identificação */}
                    <div className={`${card} rounded-xl border ${border} p-3`}>
                        <h2 className={`text-sm font-bold uppercase tracking-wider mb-3 ${muted}`}>Identificação</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <div><label className={labelCls}>Nome</label><p className={valueCls}>{process.cliente}</p></div>
                            <div><label className={labelCls}>CPF</label><p className={valueCls}>{process.cpf}</p></div>
                            <div>
                                <label className={labelCls}>Telefone</label>
                                <input type="text" value={editForm.telefone} onChange={e => setEditForm(f => ({ ...f, telefone: e.target.value }))} className={inputCls} placeholder="—" />
                            </div>
                            <div>
                                <label className={labelCls}>E-mail</label>
                                <input type="text" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} className={inputCls} placeholder="—" />
                            </div>
                            <div><label className={labelCls}>Cidade</label><p className={valueCls}>{process.cidade}</p></div>
                            <div><label className={labelCls}>UF</label><p className={valueCls}>{process.uf}</p></div>
                        </div>
                    </div>

                    {/* Dados do Processo */}
                    <div className={`${card} rounded-xl border ${border} p-3`}>
                        <h2 className={`text-sm font-bold uppercase tracking-wider mb-3 ${muted}`}>Dados do Processo</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="relative">
                                <label className={labelCls}>Parceiro</label>
                                <button
                                    onClick={() => { setShowParceiroDropdown(!showParceiroDropdown); setShowSetorDropdown(false); setShowResponsavelDropdown(false); setShowStatusDropdown(false) }}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition flex items-center justify-between ${darkMode ? 'bg-dark-700 border-dark-600 text-white hover:border-blue-500' : 'bg-white border-gray-300 text-gray-900 hover:border-blue-400'}`}
                                >
                                    <span className="truncate">{editForm.parceiro || '— Selecionar —'}</span>
                                    <span className="text-xs opacity-50 ml-2">▼</span>
                                </button>
                                {showParceiroDropdown && (
                                    <div className={`absolute top-full left-0 mt-1 w-full rounded-lg shadow-xl z-30 border ${border} ${card} overflow-hidden max-h-48 overflow-y-auto`}>
                                        {parceiroNomes.map(opt => (
                                            <button
                                                key={opt}
                                                onClick={() => { setEditForm(f => ({ ...f, parceiro: opt })); setShowParceiroDropdown(false) }}
                                                className={`w-full text-left px-3 py-2 text-sm border-b ${border} transition ${editForm.parceiro === opt ? (darkMode ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-50 text-blue-700') : (darkMode ? 'hover:bg-dark-700' : 'hover:bg-gray-50')} ${text}`}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {/* Natureza dropdown */}
                            <div className="relative">
                                <label className={labelCls}>Natureza</label>
                                <button
                                    onClick={() => { setShowNaturezaDropdown(!showNaturezaDropdown); setShowTipoDropdown(false); setShowSetorDropdown(false); setShowResponsavelDropdown(false); setShowParceiroDropdown(false); setShowStatusDropdown(false) }}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition flex items-center justify-between ${darkMode ? 'bg-dark-700 border-dark-600 text-white hover:border-blue-500' : 'bg-white border-gray-300 text-gray-900 hover:border-blue-400'}`}
                                >
                                    <span className="truncate">{editForm.natureza || '— Selecionar —'}</span>
                                    <span className="text-xs opacity-50 ml-2">▼</span>
                                </button>
                                {showNaturezaDropdown && (
                                    <div className={`absolute top-full left-0 mt-1 w-full rounded-lg shadow-xl z-30 border ${border} ${card} overflow-hidden`}>
                                        {NATUREZA_OPTIONS.map(opt => (
                                            <button
                                                key={opt}
                                                onClick={() => { setEditForm(f => ({ ...f, natureza: opt, tipo: '' })); setShowNaturezaDropdown(false); setShowTipoDropdown(false) }}
                                                className={`w-full text-left px-3 py-2 text-sm border-b ${border} transition ${editForm.natureza === opt ? (darkMode ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-50 text-blue-700') : (darkMode ? 'hover:bg-dark-700' : 'hover:bg-gray-50')} ${text}`}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {/* Tipo dropdown - só aparece quando Natureza está selecionada */}
                            {editForm.natureza && (
                                <div className="relative">
                                    <label className={labelCls}>Tipo</label>
                                    <button
                                        onClick={() => { setShowTipoDropdown(!showTipoDropdown); setShowNaturezaDropdown(false); setShowSetorDropdown(false); setShowResponsavelDropdown(false); setShowParceiroDropdown(false); setShowStatusDropdown(false) }}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition flex items-center justify-between ${darkMode ? 'bg-dark-700 border-dark-600 text-white hover:border-blue-500' : 'bg-white border-gray-300 text-gray-900 hover:border-blue-400'}`}
                                    >
                                        <span className="truncate">{editForm.tipo || '— Selecionar —'}</span>
                                        <span className="text-xs opacity-50 ml-2">▼</span>
                                    </button>
                                    {showTipoDropdown && (
                                        <div className={`absolute top-full left-0 mt-1 w-full rounded-lg shadow-xl z-30 border ${border} ${card} overflow-hidden max-h-48 overflow-y-auto`}>
                                            {TIPO_OPTIONS[editForm.natureza]?.map(opt => (
                                                <button
                                                    key={opt}
                                                    onClick={() => { setEditForm(f => ({ ...f, tipo: opt })); setShowTipoDropdown(false) }}
                                                    className={`w-full text-left px-3 py-2 text-sm border-b ${border} transition ${editForm.tipo === opt ? (darkMode ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-50 text-blue-700') : (darkMode ? 'hover:bg-dark-700' : 'hover:bg-gray-50')} ${text}`}
                                                >
                                                    {opt}
                                                </button>
                                            )) || null}
                                        </div>
                                    )}
                                </div>
                            )}
                            <div>
                                <label className={labelCls}>N° Processo</label>
                                <input type="text" value={editForm.nProcesso} onChange={e => setEditForm(f => ({ ...f, nProcesso: e.target.value }))} className={inputCls} />
                            </div>
                            <div>
                                <label className={labelCls}>Data Início</label>
                                <input type="text" value={editForm.dataInicio} onChange={e => setEditForm(f => ({ ...f, dataInicio: e.target.value }))} className={inputCls} />
                            </div>
                            <div>
                                <label className={labelCls}>Órgão</label>
                                <input type="text" value={editForm.orgao} onChange={e => setEditForm(f => ({ ...f, orgao: e.target.value }))} className={inputCls} />
                            </div>
                            <div className="col-span-2">
                                <label className={labelCls}>Endereço</label>
                                <input type="text" value={editForm.endereco} onChange={e => setEditForm(f => ({ ...f, endereco: e.target.value }))} className={inputCls} />
                            </div>
                        </div>
                    </div>

                    {/* Andamento */}
                    <div className={`${card} rounded-xl border ${border} p-3`}>
                        <h2 className={`text-sm font-bold uppercase tracking-wider mb-3 ${muted}`}>Andamento</h2>
                        <div className="grid grid-cols-2 gap-3">
                            {/* Setor dropdown */}
                            <div className="relative">
                                <label className={labelCls}>Setor</label>
                                <button
                                    onClick={() => { setShowSetorDropdown(!showSetorDropdown); setShowResponsavelDropdown(false); setShowStatusDropdown(false) }}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition flex items-center justify-between ${darkMode ? 'bg-dark-700 border-dark-600 text-white hover:border-blue-500' : 'bg-white border-gray-300 text-gray-900 hover:border-blue-400'}`}
                                >
                                    <span className="truncate">{editForm.setor || '— Selecionar —'}</span>
                                    <span className="text-xs opacity-50 ml-2">▼</span>
                                </button>
                                {showSetorDropdown && (
                                    <div className={`absolute top-full left-0 mt-1 w-full rounded-lg shadow-xl z-30 border ${border} ${card} overflow-hidden`}>
                                        {SETORES_OPTIONS.map(opt => (
                                            <button
                                                key={opt}
                                                onClick={() => { setEditForm(f => ({ ...f, setor: opt })); setShowSetorDropdown(false) }}
                                                className={`w-full text-left px-3 py-2 text-sm border-b ${border} transition ${editForm.setor === opt ? (darkMode ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-50 text-blue-700') : (darkMode ? 'hover:bg-dark-700' : 'hover:bg-gray-50')} ${text}`}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {/* Responsável dropdown */}
                            <div className="relative">
                                <label className={labelCls}>Responsável</label>
                                <button
                                    onClick={() => { setShowResponsavelDropdown(!showResponsavelDropdown); setShowSetorDropdown(false); setShowStatusDropdown(false) }}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition flex items-center justify-between ${darkMode ? 'bg-dark-700 border-dark-600 text-white hover:border-blue-500' : 'bg-white border-gray-300 text-gray-900 hover:border-blue-400'}`}
                                >
                                    <span className="truncate">{editForm.responsavel || '— Selecionar —'}</span>
                                    <span className="text-xs opacity-50 ml-2">▼</span>
                                </button>
                                {showResponsavelDropdown && (
                                    <div className={`absolute top-full left-0 mt-1 w-full rounded-lg shadow-xl z-30 border ${border} ${card} overflow-hidden`}>
                                        {RESPONSAVEIS_OPTIONS.map(opt => (
                                            <button
                                                key={opt}
                                                onClick={() => { setEditForm(f => ({ ...f, responsavel: opt })); setShowResponsavelDropdown(false) }}
                                                className={`w-full text-left px-3 py-2 text-sm border-b ${border} transition ${editForm.responsavel === opt ? (darkMode ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-50 text-blue-700') : (darkMode ? 'hover:bg-dark-700' : 'hover:bg-gray-50')} ${text}`}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {/* Status dropdown */}
                            <div className="relative">
                                <label className={labelCls}>Status</label>
                                <button
                                    onClick={() => { setShowStatusDropdown(!showStatusDropdown); setShowSetorDropdown(false); setShowResponsavelDropdown(false) }}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold border transition flex items-center justify-between ${darkMode ? 'bg-dark-700 border-dark-500 text-white hover:border-blue-500' : 'bg-blue-50 border-blue-200 text-blue-800 hover:border-blue-400'}`}
                                >
                                    {currentStatus}
                                    <span className="text-xs opacity-60">▼</span>
                                </button>
                                {showStatusDropdown && (
                                    <div className={`absolute top-full left-0 mt-1 w-full rounded-lg shadow-xl z-30 border ${border} ${card} overflow-hidden`}>
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
                            <div>
                                <label className={labelCls}>Andamento</label>
                                <div className="relative">
                                    <button
                                        onClick={() => { setShowAndamentoDropdown(!showAndamentoDropdown); setShowSetorDropdown(false); setShowResponsavelDropdown(false); setShowStatusDropdown(false) }}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition flex items-center justify-between ${darkMode ? 'bg-dark-700 border-dark-600 text-white hover:border-blue-500' : 'bg-white border-gray-300 text-gray-900 hover:border-blue-400'}`}
                                    >
                                        <span className="truncate">{editForm.andamento || '— Selecionar —'}</span>
                                        <span className="text-xs opacity-50 ml-2">▼</span>
                                    </button>
                                    {showAndamentoDropdown && (
                                        <div className={`absolute top-full left-0 mt-1 w-full rounded-lg shadow-xl z-30 border ${border} ${card} overflow-hidden`}>
                                            {ANDAMENTO_OPTIONS.map(opt => (
                                                <button
                                                    key={opt}
                                                    onClick={() => { setEditForm(f => ({ ...f, andamento: opt })); setShowAndamentoDropdown(false) }}
                                                    className={`w-full text-left px-3 py-2 text-sm border-b ${border} transition ${editForm.andamento === opt ? (darkMode ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-50 text-blue-700') : (darkMode ? 'hover:bg-dark-700' : 'hover:bg-gray-50')} ${text}`}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div><label className={labelCls}>Última Alteração</label><p className={valueCls}>{process.ultimaAlteracao}</p></div>
                        </div>
                    </div>

                    {/* Botão Salvar */}
                    <button
                        onClick={handleSaveProcess}
                        className={`w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition shadow-md ${saveConfirmed ? 'bg-green-600 hover:bg-green-500' : 'bg-blue-600 hover:bg-blue-500'} text-white`}
                    >
                        <Save size={16} /> {saveConfirmed ? '✓ Alterações Salvas!' : 'Salvar Alterações'}
                    </button>

                    {/* Eventos marcados */}
                    {events.length > 0 && (
                        <div className={`${card} rounded-xl border ${border} p-3`}>
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

                    {/* Documentos */}
                    <div className={`${card} rounded-xl border ${border} p-5`}>
                        <h2 className={`text-sm font-bold uppercase tracking-wider mb-4 ${muted}`}>
                            <FileText size={14} className="inline mr-1.5" />Documentos Vinculados
                        </h2>
                        {getLinkedDocuments().length === 0 ? (
                            <div className={`text-center py-8 ${muted}`}>
                                <FileText size={32} className="mx-auto mb-2 opacity-30" />
                                <p className="text-xs">Nenhum documento vinculado</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {getLinkedDocuments().map(doc => (
                                    <div key={doc.id} className={`p-3 rounded-lg border ${border} flex items-start gap-3 hover:border-blue-400 transition cursor-pointer`}>
                                        <FileText size={16} className={muted} />
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-medium text-sm ${text}`}>{doc.title}</p>
                                            {doc.description && <p className={`text-xs mt-1 ${muted}`}>{doc.description}</p>}
                                            {doc.attachments.length > 0 && (
                                                <span className={`mt-1 inline-flex text-xs px-2 py-0.5 rounded ${darkMode ? 'bg-dark-600' : 'bg-gray-200'} ${text}`}>
                                                    <Paperclip size={10} className="inline mr-1" />{doc.attachments.length}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ===== DIREITA: ANOTAÇÕES ===== */}
                <div className={`${card} rounded-xl border ${border} flex flex-col sticky top-[80px] max-h-[calc(100vh-96px)]`} onClick={e => e.stopPropagation()}>
                    <div className={`px-4 py-3 border-b ${border} shrink-0`}>
                        <h2 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${muted}`}>
                            <StickyNote size={13} /> Anotações ({notes.length})
                        </h2>
                    </div>
                    {/* Notas salvas */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
                        {notes.length === 0 && (
                            <p className={`text-xs italic text-center py-4 ${muted}`}>Nenhuma anotação.</p>
                        )}
                        {notes.map(note => (
                            <div key={note.id} className={`rounded-lg border ${border} p-3`}>
                                <div className="flex items-start justify-between mb-1">
                                    <div>
                                        {note.titulo && <p className={`font-semibold text-xs ${text}`}>{note.titulo}</p>}
                                        <span className={`text-xs ${muted}`}>{note.data}</span>
                                    </div>
                                    <button onClick={() => handleDeleteNote(note.id)} className="p-1 rounded bg-red-600 hover:bg-red-700 text-white shrink-0 ml-1">
                                        <X size={10} />
                                    </button>
                                </div>
                                <div className="space-y-1 text-xs">
                                    {note.numeroCat && <div className={`rounded p-1.5 ${darkMode ? 'bg-dark-700' : 'bg-gray-100'}`}><span className={`font-semibold ${muted}`}>CAT: </span><span className={text}>{note.numeroCat}</span></div>}
                                    {note.senhaInss && <div className={`rounded p-1.5 ${darkMode ? 'bg-dark-700' : 'bg-gray-100'}`}><span className={`font-semibold ${muted}`}>INSS: </span><span className={text}>{note.senhaInss}</span></div>}
                                    {note.rg && <div className={`rounded p-1.5 ${darkMode ? 'bg-dark-700' : 'bg-gray-100'}`}><span className={`font-semibold ${muted}`}>RG: </span><span className={text}>{note.rg}</span></div>}
                                    {note.observacao && <div className={`rounded p-1.5 ${darkMode ? 'bg-dark-700' : 'bg-gray-100'}`}><span className={`font-semibold ${muted}`}>Obs: </span><span className={`${text} whitespace-pre-wrap`}>{note.observacao}</span></div>}
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Form nova anotação */}
                    <div className={`p-3 border-t ${border} space-y-2 shrink-0`}>
                        <p className={`text-xs font-bold uppercase tracking-wider ${muted}`}>Nova Anotação</p>
                        <input
                            type="text"
                            placeholder="Título (opcional)"
                            value={noteForm.titulo}
                            onChange={e => setNoteForm(f => ({ ...f, titulo: e.target.value }))}
                            className={`${inputCls} text-xs py-1.5`}
                        />
                        <div className="grid grid-cols-2 gap-2">
                            <input type="text" placeholder="Nº CAT" value={noteForm.numeroCat} onChange={e => setNoteForm(f => ({ ...f, numeroCat: e.target.value }))} className={`${inputCls} text-xs py-1.5`} />
                            <input type="text" placeholder="Senha INSS" value={noteForm.senhaInss} onChange={e => setNoteForm(f => ({ ...f, senhaInss: e.target.value }))} className={`${inputCls} text-xs py-1.5`} />
                            <input type="text" placeholder="RG" value={noteForm.rg} onChange={e => setNoteForm(f => ({ ...f, rg: e.target.value }))} className={`${inputCls} text-xs py-1.5 col-span-2`} />
                        </div>
                        <textarea
                            rows={2}
                            placeholder="Observação..."
                            value={noteForm.observacao}
                            onChange={e => setNoteForm(f => ({ ...f, observacao: e.target.value }))}
                            className={`${inputCls} resize-none text-xs py-1.5`}
                        />
                        <button
                            onClick={handleSaveNote}
                            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-white text-xs font-bold transition shadow"
                        >
                            <Save size={13} /> Salvar Anotação
                        </button>
                    </div>
                </div>
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
                            <button onClick={() => setShowEventModal(false)} className={`p-1 rounded hover:opacity-70 ${muted}`}><X size={20} /></button>
                        </div>
                        <div className="p-5 space-y-4">
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

            {/* ===== MODAL TAREFA ===== */}
            {showTaskModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className={`${card} rounded-xl shadow-2xl border ${border} w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
                        <div className={`flex items-center justify-between p-5 border-b ${border} sticky top-0 ${card}`}>
                            <h3 className={`text-base font-bold ${text}`}>{editingTaskId ? 'Editar Tarefa' : 'Adicionar Tarefa'}</h3>
                            <button onClick={() => setShowTaskModal(false)} className={`p-1 rounded ${muted} hover:opacity-70`}><X size={20} /></button>
                        </div>
                        <div className="p-5 space-y-4">

                            {/* Tipo */}
                            <div className="relative">
                                <label className={labelCls}>Tipo *</label>
                                <button
                                    onClick={() => setTaskForm(f => ({ ...f, showTipoDropdown: !f.showTipoDropdown, showAcaoDropdown: false, showTarefaDropdown: false, showTipoResponsavelDropdown: false, showResponsavelDropdown: false }))}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition flex items-center justify-between ${darkMode ? 'bg-dark-700 border-dark-600 text-white hover:border-blue-500' : 'bg-white border-gray-300 text-gray-900 hover:border-blue-400'}`}
                                >
                                    <span className="truncate">{taskForm.tipo || '— Selecionar —'}</span>
                                    <span className="text-xs opacity-50 ml-2">▼</span>
                                </button>
                                {taskForm.showTipoDropdown && (
                                    <div className={`absolute top-full left-0 mt-1 w-full rounded-lg shadow-xl z-30 border ${border} ${card} overflow-hidden`}>
                                        {TAREFA_TIPOS_OPTIONS.map(opt => (
                                            <button key={opt} onClick={() => setTaskForm(f => ({ ...f, tipo: opt, acao: '', tarefa: '', showTipoDropdown: false }))}
                                                className={`w-full text-left px-3 py-2 text-sm border-b ${border} transition ${taskForm.tipo === opt ? (darkMode ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-50 text-blue-700') : (darkMode ? 'hover:bg-dark-700' : 'hover:bg-gray-50')} ${text}`}>
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Ação */}
                            {taskForm.tipo && (
                                <div className="relative">
                                    <label className={labelCls}>Ação *</label>
                                    <button
                                        onClick={() => setTaskForm(f => ({ ...f, showAcaoDropdown: !f.showAcaoDropdown, showTipoDropdown: false, showTarefaDropdown: false, showTipoResponsavelDropdown: false, showResponsavelDropdown: false }))}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition flex items-center justify-between ${darkMode ? 'bg-dark-700 border-dark-600 text-white hover:border-blue-500' : 'bg-white border-gray-300 text-gray-900 hover:border-blue-400'}`}
                                    >
                                        <span className="truncate">{taskForm.acao || '— Selecionar —'}</span>
                                        <span className="text-xs opacity-50 ml-2">▼</span>
                                    </button>
                                    {taskForm.showAcaoDropdown && (
                                        <div className={`absolute top-full left-0 mt-1 w-full rounded-lg shadow-xl z-30 border ${border} ${card} overflow-hidden`}>
                                            {(TAREFA_ACOES_POR_TIPO[taskForm.tipo] || []).map(opt => (
                                                <button key={opt} onClick={() => setTaskForm(f => ({ ...f, acao: opt, tarefa: '', showAcaoDropdown: false }))}
                                                    className={`w-full text-left px-3 py-2 text-sm border-b ${border} transition ${taskForm.acao === opt ? (darkMode ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-50 text-blue-700') : (darkMode ? 'hover:bg-dark-700' : 'hover:bg-gray-50')} ${text}`}>
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Tarefa (só para Documento) */}
                            {taskForm.tipo === 'Documento' && taskForm.acao && (
                                <div className="relative">
                                    <label className={labelCls}>Tarefa</label>
                                    <button
                                        onClick={() => setTaskForm(f => ({ ...f, showTarefaDropdown: !f.showTarefaDropdown, showTipoDropdown: false, showAcaoDropdown: false, showTipoResponsavelDropdown: false, showResponsavelDropdown: false }))}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition flex items-center justify-between ${darkMode ? 'bg-dark-700 border-dark-600 text-white hover:border-blue-500' : 'bg-white border-gray-300 text-gray-900 hover:border-blue-400'}`}
                                    >
                                        <span className="truncate">{taskForm.tarefa || '— Selecione o documento —'}</span>
                                        <span className="text-xs opacity-50 ml-2">▼</span>
                                    </button>
                                    {taskForm.showTarefaDropdown && (
                                        <div className={`absolute top-full left-0 mt-1 w-full rounded-lg shadow-xl z-30 border ${border} ${card} overflow-hidden max-h-52 overflow-y-auto`}>
                                            {TAREFA_DOCUMENTOS_OPTIONS.map(opt => (
                                                <button key={opt} onClick={() => setTaskForm(f => ({ ...f, tarefa: opt, showTarefaDropdown: false }))}
                                                    className={`w-full text-left px-3 py-2 text-sm border-b ${border} transition ${taskForm.tarefa === opt ? (darkMode ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-50 text-blue-700') : (darkMode ? 'hover:bg-dark-700' : 'hover:bg-gray-50')} ${text}`}>
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Observação */}
                            <div>
                                <label className={labelCls}>Observação</label>
                                <textarea
                                    rows={3}
                                    value={taskForm.observacao}
                                    onChange={e => setTaskForm(f => ({ ...f, observacao: e.target.value }))}
                                    placeholder="Observações sobre a tarefa..."
                                    className={`${inputCls} resize-none`}
                                />
                            </div>

                            {/* Prazo */}
                            <div>
                                <label className={labelCls}>Prazo</label>
                                <input
                                    type="date"
                                    value={taskForm.prazo}
                                    onChange={e => setTaskForm(f => ({ ...f, prazo: e.target.value }))}
                                    className={inputCls}
                                />
                            </div>

                            {/* Tipo Responsável */}
                            <div className="relative">
                                <label className={labelCls}>Tipo Responsável *</label>
                                <button
                                    onClick={() => setTaskForm(f => ({ ...f, showTipoResponsavelDropdown: !f.showTipoResponsavelDropdown, showTipoDropdown: false, showAcaoDropdown: false, showTarefaDropdown: false, showResponsavelDropdown: false }))}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition flex items-center justify-between ${darkMode ? 'bg-dark-700 border-dark-600 text-white hover:border-blue-500' : 'bg-white border-gray-300 text-gray-900 hover:border-blue-400'}`}
                                >
                                    <span className="truncate">{taskForm.tipoResponsavel || '— Selecionar —'}</span>
                                    <span className="text-xs opacity-50 ml-2">▼</span>
                                </button>
                                {taskForm.showTipoResponsavelDropdown && (
                                    <div className={`absolute top-full left-0 mt-1 w-full rounded-lg shadow-xl z-30 border ${border} ${card} overflow-hidden`}>
                                        {TAREFA_TIPO_RESPONSAVEL_OPTIONS.map(opt => (
                                            <button key={opt} onClick={() => setTaskForm(f => ({ ...f, tipoResponsavel: opt, responsavel: '', showTipoResponsavelDropdown: false }))}
                                                className={`w-full text-left px-3 py-2 text-sm border-b ${border} transition ${taskForm.tipoResponsavel === opt ? (darkMode ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-50 text-blue-700') : (darkMode ? 'hover:bg-dark-700' : 'hover:bg-gray-50')} ${text}`}>
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Responsável */}
                            {taskForm.tipoResponsavel && (
                                <div className="relative">
                                    <label className={labelCls}>Responsável *</label>
                                    <button
                                        onClick={() => setTaskForm(f => ({ ...f, showResponsavelDropdown: !f.showResponsavelDropdown, showTipoDropdown: false, showAcaoDropdown: false, showTarefaDropdown: false, showTipoResponsavelDropdown: false }))}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition flex items-center justify-between ${darkMode ? 'bg-dark-700 border-dark-600 text-white hover:border-blue-500' : 'bg-white border-gray-300 text-gray-900 hover:border-blue-400'}`}
                                    >
                                        <span className="truncate">{taskForm.responsavel || '— Selecionar —'}</span>
                                        <span className="text-xs opacity-50 ml-2">▼</span>
                                    </button>
                                    {taskForm.showResponsavelDropdown && (
                                        <div className={`absolute top-full left-0 mt-1 w-full rounded-lg shadow-xl z-30 border ${border} ${card} overflow-hidden max-h-48 overflow-y-auto`}>
                                            {(taskForm.tipoResponsavel === 'Setor' ? SETORES_OPTIONS : taskForm.tipoResponsavel === 'Usuário' ? RESPONSAVEIS_OPTIONS : TAREFA_EQUIPES_OPTIONS).map(opt => (
                                                <button key={opt} onClick={() => setTaskForm(f => ({ ...f, responsavel: opt, showResponsavelDropdown: false }))}
                                                    className={`w-full text-left px-3 py-2 text-sm border-b ${border} transition ${taskForm.responsavel === opt ? (darkMode ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-50 text-blue-700') : (darkMode ? 'hover:bg-dark-700' : 'hover:bg-gray-50')} ${text}`}>
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                        <div className={`flex gap-2 p-5 border-t ${border} sticky bottom-0 ${card}`}>
                            <button onClick={() => { setShowTaskModal(false); setTaskForm({ tipo: '', acao: '', tarefa: '', observacao: '', prazo: '', tipoResponsavel: '', responsavel: '', showTipoDropdown: false, showAcaoDropdown: false, showTarefaDropdown: false, showTipoResponsavelDropdown: false, showResponsavelDropdown: false }) }} className={`flex-1 px-4 py-2 rounded-lg text-sm transition ${darkMode ? 'bg-dark-700 hover:bg-dark-600' : 'bg-gray-200 hover:bg-gray-300'} ${text}`}>
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveTask}
                                disabled={!taskForm.tipo || !taskForm.acao || !taskForm.tipoResponsavel || !taskForm.responsavel}
                                className="flex-1 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition disabled:opacity-40 flex items-center justify-center gap-1.5"
                            >
                                <Save size={14} /> Criar Tarefa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
