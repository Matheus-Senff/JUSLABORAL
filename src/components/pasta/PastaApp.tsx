import React, { useState, useMemo } from 'react'
import { X, FileText, Calendar, Clock, AlertCircle, User, File, ChevronDown } from 'lucide-react'
import { usePastaStore } from './pastaStore'

// ============================================================
// TYPES & INTERFACES
// ============================================================

type TaskStatus = 'urgente' | 'em_andamento' | 'planejado'
type TaskPriority = 'alta' | 'média'
type TaskCategory = 'tarefas' | 'administrativo'

interface Task {
  id: string
  title: string
  category: TaskCategory
  status: TaskStatus
  priority: TaskPriority
  dueDate: string
  assignee: string
  documentCount: number
  description: string
  createdAt: string
}

// ============================================================
// MOCK DATA - 6 TAREFAS VARIADAS
// ============================================================

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Análise de Recurso de Terceirização',
    category: 'tarefas',
    status: 'urgente',
    priority: 'alta',
    dueDate: '2026-04-25',
    assignee: 'Ana Silva',
    documentCount: 5,
    description: 'Revisar documentação de recurso e preparar parecer jurídico',
    createdAt: '2026-04-22',
  },
  {
    id: '2',
    title: 'Protocolo de Petição Inicial - Acidente Ocupacional',
    category: 'tarefas',
    status: 'em_andamento',
    priority: 'alta',
    dueDate: '2026-04-27',
    assignee: 'Carlos Santos',
    documentCount: 8,
    description: 'Preparar e protocolar petição inicial no TRT',
    createdAt: '2026-04-20',
  },
  {
    id: '3',
    title: 'Atualização de Dados Cadastrais - Empresa XYZ',
    category: 'administrativo',
    status: 'planejado',
    priority: 'média',
    dueDate: '2026-05-01',
    assignee: 'Mariana Costa',
    documentCount: 3,
    description: 'Atualizar base de dados com novos endereços e contatos',
    createdAt: '2026-04-23',
  },
  {
    id: '4',
    title: 'Revisão de Acordos Trabalhistas',
    category: 'tarefas',
    status: 'em_andamento',
    priority: 'média',
    dueDate: '2026-04-30',
    assignee: 'Roberto Dias',
    documentCount: 12,
    description: 'Revisar e atualizar termos de acordos para conformidade legal',
    createdAt: '2026-04-19',
  },
  {
    id: '5',
    title: 'Organização de Arquivos - 1º Trimestre',
    category: 'administrativo',
    status: 'planejado',
    priority: 'média',
    dueDate: '2026-05-05',
    assignee: 'Fernanda Oliveira',
    documentCount: 24,
    description: 'Classificar e arquivar documentos do período',
    createdAt: '2026-04-21',
  },
  {
    id: '6',
    title: 'Parecer sobre Indenização por Danos Morais',
    category: 'tarefas',
    status: 'urgente',
    priority: 'alta',
    dueDate: '2026-04-26',
    assignee: 'Ana Silva',
    documentCount: 7,
    description: 'Elaborar parecer jurídico sobre caso de danos morais',
    createdAt: '2026-04-22',
  },
]

// ============================================================
// COLOR MAPPING
// ============================================================

const STATUS_COLORS: Record<TaskStatus, { bg: string; border: string; text: string; dot: string }> = {
  urgente: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-700 dark:text-red-400',
    dot: 'bg-red-500',
  },
  em_andamento: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800',
    text: 'text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-500',
  },
  planejado: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-700 dark:text-green-400',
    dot: 'bg-green-500',
  },
}

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  alta: 'text-red-600 dark:text-red-400 font-bold',
  média: 'text-amber-600 dark:text-amber-400',
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export const PastaApp: React.FC<{ darkMode?: boolean }> = ({ darkMode }) => {
  const filterState = usePastaStore((s) => s.filterState)
  const clearFilters = usePastaStore((s) => s.clearFilters)

  // LOCAL STATE
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | 'todos'>('todos')
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'todos'>('todos')
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null)

  // CALCULATE ACTIVE FILTERS
  const activeFilterCount = filterState.labels.length +
    filterState.members.length +
    (filterState.dueDateFilter !== 'all' ? 1 : 0) +
    (filterState.hasChecklist ? 1 : 0) +
    (filterState.hasAttachment ? 1 : 0)

  // FILTER TASKS
  const filteredTasks = useMemo(() => {
    return mockTasks.filter((task) => {
      if (categoryFilter !== 'todos' && task.category !== categoryFilter) return false
      if (statusFilter !== 'todos' && task.status !== statusFilter) return false
      return true
    })
  }, [categoryFilter, statusFilter])

  // CALCULATE STATS
  const stats = useMemo(() => {
    const total = mockTasks.length
    const urgentes = mockTasks.filter((t) => t.status === 'urgente').length
    const emAndamento = mockTasks.filter((t) => t.status === 'em_andamento').length
    return { total, urgentes, emAndamento }
  }, [])

  // HELPER FUNCTIONS
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
  }

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const bgColors = {
    main: darkMode ? 'bg-dark-900 text-gray-100' : 'bg-gradient-to-br from-blue-50 to-indigo-50 text-gray-900',
    header: darkMode ? 'bg-dark-800/80 border-dark-700' : 'bg-white/70 border-gray-200',
    card: darkMode ? 'bg-dark-700 border-dark-600' : 'bg-white border-gray-200',
    text: darkMode ? 'text-gray-300' : 'text-gray-600',
  }

  return (
    <div className={`flex flex-col h-full min-h-0 ${bgColors.main}`}>
      {/* ============================================================ */}
      {/* HEADER COM FILTROS E BOTÃO LIMPAR */}
      {/* ============================================================ */}
      <div className={`flex items-center gap-4 px-6 py-4 flex-shrink-0 border-b ${bgColors.header}`}>
        {/* Clear Filter Button */}
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-3 py-2 rounded text-sm font-semibold transition bg-yellow-400 hover:bg-yellow-500 text-gray-900 border border-yellow-600"
            title="Limpar todos os filtros"
          >
            <X size={14} />
            Limpar Filtro
          </button>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* PRIMARY FILTERS */}
        <div className="flex items-center gap-3">
          {/* Filter 1: Categoria (Tarefas / Administrativo) */}
          <div className="relative">
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition border ${categoryFilter !== 'todos'
                  ? 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700'
                  : darkMode
                    ? 'bg-dark-700 text-gray-300 border-dark-600 hover:bg-dark-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
            >
              {categoryFilter === 'todos' ? 'Categoria' : categoryFilter === 'tarefas' ? 'Tarefas' : 'Administrativo'}
              <ChevronDown size={16} />
            </button>

            {showCategoryDropdown && (
              <div className={`absolute top-full left-0 mt-2 w-48 rounded-lg shadow-lg z-20 border ${darkMode ? 'bg-dark-700 border-dark-600' : 'bg-white border-gray-200'}`}>
                <button
                  onClick={() => {
                    setCategoryFilter('todos')
                    setShowCategoryDropdown(false)
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition border-b ${darkMode ? 'border-dark-600 hover:bg-dark-600' : 'border-gray-200 hover:bg-gray-50'} ${categoryFilter === 'todos' ? (darkMode ? 'bg-dark-600' : 'bg-gray-100') : ''}`}
                >
                  Todos
                </button>
                <button
                  onClick={() => {
                    setCategoryFilter('tarefas')
                    setShowCategoryDropdown(false)
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition border-b ${darkMode ? 'border-dark-600 hover:bg-dark-600' : 'border-gray-200 hover:bg-gray-50'} ${categoryFilter === 'tarefas' ? (darkMode ? 'bg-dark-600' : 'bg-gray-100') : ''}`}
                >
                  Tarefas
                </button>
                <button
                  onClick={() => {
                    setCategoryFilter('administrativo')
                    setShowCategoryDropdown(false)
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition ${darkMode ? 'hover:bg-dark-600' : 'hover:bg-gray-50'} ${categoryFilter === 'administrativo' ? (darkMode ? 'bg-dark-600' : 'bg-gray-100') : ''}`}
                >
                  Administrativo
                </button>
              </div>
            )}
          </div>

          {/* Filter 2: Status */}
          <div className="relative">
            <button
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition border ${statusFilter !== 'todos'
                  ? 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700'
                  : darkMode
                    ? 'bg-dark-700 text-gray-300 border-dark-600 hover:bg-dark-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
            >
              {statusFilter === 'todos' ? 'Status' : statusFilter === 'urgente' ? 'Urgente' : statusFilter === 'em_andamento' ? 'Em Andamento' : 'Planejado'}
              <ChevronDown size={16} />
            </button>

            {showStatusDropdown && (
              <div className={`absolute top-full left-0 mt-2 w-48 rounded-lg shadow-lg z-20 border ${darkMode ? 'bg-dark-700 border-dark-600' : 'bg-white border-gray-200'}`}>
                <button
                  onClick={() => {
                    setStatusFilter('todos')
                    setShowStatusDropdown(false)
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition border-b ${darkMode ? 'border-dark-600 hover:bg-dark-600' : 'border-gray-200 hover:bg-gray-50'} ${statusFilter === 'todos' ? (darkMode ? 'bg-dark-600' : 'bg-gray-100') : ''}`}
                >
                  Todos
                </button>
                <button
                  onClick={() => {
                    setStatusFilter('urgente')
                    setShowStatusDropdown(false)
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition border-b ${darkMode ? 'border-dark-600 hover:bg-dark-600' : 'border-gray-200 hover:bg-gray-50'} ${statusFilter === 'urgente' ? (darkMode ? 'bg-dark-600' : 'bg-gray-100') : ''}`}
                >
                  Urgente
                </button>
                <button
                  onClick={() => {
                    setStatusFilter('em_andamento')
                    setShowStatusDropdown(false)
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition border-b ${darkMode ? 'border-dark-600 hover:bg-dark-600' : 'border-gray-200 hover:bg-gray-50'} ${statusFilter === 'em_andamento' ? (darkMode ? 'bg-dark-600' : 'bg-gray-100') : ''}`}
                >
                  Em Andamento
                </button>
                <button
                  onClick={() => {
                    setStatusFilter('planejado')
                    setShowStatusDropdown(false)
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition ${darkMode ? 'hover:bg-dark-600' : 'hover:bg-gray-50'} ${statusFilter === 'planejado' ? (darkMode ? 'bg-dark-600' : 'bg-gray-100') : ''}`}
                >
                  Planejado
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* DASHBOARD COM ESTATÍSTICAS */}
      {/* ============================================================ */}
      <div className="px-6 py-4 flex gap-4 border-b" style={{ borderColor: darkMode ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.1)' }}>
        {/* Total de Tarefas */}
        <div className={`px-4 py-2 rounded-lg flex items-center gap-3 ${bgColors.card} border`}>
          <FileText size={20} className="text-blue-600 dark:text-blue-400" />
          <div>
            <p className="text-xs font-medium" style={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>Total de Tarefas</p>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</p>
          </div>
        </div>

        {/* Tarefas Urgentes */}
        <div className={`px-4 py-2 rounded-lg flex items-center gap-3 ${bgColors.card} border`}>
          <AlertCircle size={20} className="text-red-600 dark:text-red-400" />
          <div>
            <p className="text-xs font-medium" style={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>Urgentes</p>
            <p className="text-xl font-bold text-red-600 dark:text-red-400">{stats.urgentes}</p>
          </div>
        </div>

        {/* Em Andamento */}
        <div className={`px-4 py-2 rounded-lg flex items-center gap-3 ${bgColors.card} border`}>
          <Clock size={20} className="text-amber-600 dark:text-amber-400" />
          <div>
            <p className="text-xs font-medium" style={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>Em Andamento</p>
            <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{stats.emAndamento}</p>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* LISTA DE TAREFAS (GRID DE CARDS) */}
      {/* ============================================================ */}
      <div className="flex-1 overflow-auto p-6">
        {filteredTasks.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className={`text-center p-8 rounded-lg ${bgColors.card} border`}>
              <FileText size={40} className="mx-auto mb-3" style={{ color: darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }} />
              <p className={`text-lg font-semibold mb-1 ${bgColors.text}`}>Nenhuma tarefa encontrada</p>
              <p className="text-sm" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>Tente ajustar seus filtros</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-max">
            {filteredTasks.map((task) => {
              const isExpanded = expandedTaskId === task.id
              const statusColor = STATUS_COLORS[task.status]
              const daysLeft = getDaysUntilDue(task.dueDate)

              return (
                <div
                  key={task.id}
                  className={`rounded-xl overflow-hidden transition-all duration-300 ${statusColor.bg} border-2 ${statusColor.border} cursor-pointer hover:shadow-lg ${isExpanded ? 'lg:col-span-2' : ''}`}
                >
                  {/* CARD HEADER */}
                  <div
                    onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                    className={`p-4 ${darkMode ? 'bg-dark-700/50' : 'bg-white/50'} transition-colors hover:${darkMode ? 'bg-dark-700' : 'bg-white'}`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className={`p-2 rounded-lg flex-shrink-0 ${darkMode ? 'bg-dark-600' : 'bg-gray-100'}`}>
                        <FileText size={18} className={statusColor.text} />
                      </div>

                      {/* Title & Basic Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm line-clamp-2 mb-1" style={{ color: darkMode ? 'rgb(229, 231, 235)' : 'rgb(31, 41, 55)' }}>
                          {task.title}
                        </h3>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-2 h-2 rounded-full ${statusColor.dot}`} />
                          <span className={`text-xs font-medium ${statusColor.text}`}>
                            {task.status === 'urgente' ? 'Urgente' : task.status === 'em_andamento' ? 'Em Andamento' : 'Planejado'}
                          </span>
                        </div>

                        {/* Quick Info Row */}
                        <div className="flex items-center gap-3 text-xs" style={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
                          <div className="flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDate(task.dueDate)}
                          </div>
                          <div className="flex items-center gap-1">
                            <AlertCircle size={12} />
                            {task.priority === 'alta' ? 'Alta' : 'Média'}
                          </div>
                          <div className="flex items-center gap-1">
                            <File size={12} />
                            {task.documentCount}
                          </div>
                        </div>
                      </div>

                      {/* Days Left Badge */}
                      {daysLeft <= 3 && (
                        <div className="px-2 py-1 rounded-lg bg-red-100 dark:bg-red-900/30 flex-shrink-0">
                          <span className="text-xs font-bold text-red-700 dark:text-red-400">{daysLeft}d</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* EXPANDED CONTENT */}
                  {isExpanded && (
                    <div className={`px-4 pb-4 pt-3 border-t-2 ${statusColor.border} space-y-3`}>
                      {/* Description */}
                      <div>
                        <p className="text-xs font-semibold mb-1" style={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
                          Descrição
                        </p>
                        <p className="text-sm" style={{ color: darkMode ? 'rgb(209, 213, 219)' : 'rgb(75, 85, 99)' }}>
                          {task.description}
                        </p>
                      </div>

                      {/* Responsável & Documentos */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs font-semibold mb-1 flex items-center gap-1" style={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
                            <User size={12} /> Responsável
                          </p>
                          <p className="text-sm font-medium">{task.assignee}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold mb-1 flex items-center gap-1" style={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
                            <File size={12} /> Documentos
                          </p>
                          <p className="text-sm font-medium">{task.documentCount} arquivos</p>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button className="w-full mt-3 px-4 py-2 rounded-lg font-medium text-sm transition bg-blue-600 text-white hover:bg-blue-700">
                        Ver Detalhes Completos
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
