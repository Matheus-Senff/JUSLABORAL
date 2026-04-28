import React, { useState, useMemo } from 'react'
import { X, FileText, User, ChevronDown, Filter, RotateCcw, CheckCircle2, Trash2, AlertCircle } from 'lucide-react'
import { usePastaStore } from './pastaStore'
import { useTasks } from '../../contexts/TasksContext'
import { ProcessTask } from '../../types'
import { useSupabaseUsuarios } from '../../hooks/useSupabaseUsuarios'
import { useSupabaseSetores } from '../../hooks/useSupabaseSetores'

// ============================================================
// TYPES & INTERFACES
// ============================================================

type TaskCategory = 'tarefas' | 'administrativo'

// ============================================================
// MAIN COMPONENT
// ============================================================

export const PastaApp: React.FC<{ darkMode?: boolean }> = ({ darkMode }) => {
  const filterState = usePastaStore((s) => s.filterState)
  const clearFilters = usePastaStore((s) => s.clearFilters)
  const { tasks, deleteTask, completeTask } = useTasks()

  // LOCAL STATE
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory>('tarefas')
  const [assigneeFilter, setAssigneeFilter] = useState<string>('')
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false)

  // TASK FILTERS
  const [taskFilters, setTaskFilters] = useState({
    responsavel: '',
    setor: '',
    status: '',
    tipoAcao: '',
    titulo: '',
  })
  const [showTaskFilters, setShowTaskFilters] = useState(false)
  const [showResponsavelDropdown, setShowResponsavelDropdown] = useState(false)
  const [showSetorDropdown, setShowSetorDropdown] = useState(false)
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showTipoAcaoDropdown, setShowTipoAcaoDropdown] = useState(false)

  const { nomes: usuariosNomes } = useSupabaseUsuarios()
  const { nomes: SETORES_OPTIONS } = useSupabaseSetores()

  const RESPONSAVEIS_OPTIONS = usuariosNomes
  const STATUS_OPTIONS = ['Aberto', 'Em Andamento', 'Concluído', 'Cancelado']
  const TIPO_ACAO_OPTIONS = ['Pedir Documentação', 'Anotação', 'Evento', 'Reunião', 'Análise', 'Outro']

  // CALCULATE ACTIVE FILTERS
  const activeFilterCount = filterState.labels.length +
    filterState.members.length +
    (filterState.dueDateFilter !== 'all' ? 1 : 0) +
    (filterState.hasChecklist ? 1 : 0) +
    (filterState.hasAttachment ? 1 : 0) +
    (assigneeFilter ? 1 : 0)

  // MOCK ASSIGNEES BY CATEGORY
  const assigneesByCategory: Record<TaskCategory, string[]> = {
    tarefas: ['Ana Silva', 'Carlos Santos', 'Roberto Dias'],
    administrativo: ['Mariana Costa', 'Fernanda Oliveira'],
  }

  // FILTER TASKS
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (taskFilters.responsavel && task.responsavel !== taskFilters.responsavel) return false
      if (taskFilters.setor && task.setor !== taskFilters.setor) return false
      if (taskFilters.status && task.status !== taskFilters.status) return false
      if (taskFilters.tipoAcao && task.tipoAcao !== taskFilters.tipoAcao) return false
      if (taskFilters.titulo && !task.titulo.toLowerCase().includes(taskFilters.titulo.toLowerCase())) return false
      return true
    })
  }, [tasks, taskFilters])

  const handleClearTaskFilters = () => {
    setTaskFilters({
      responsavel: '',
      setor: '',
      status: '',
      tipoAcao: '',
      titulo: '',
    })
  }

  const getTipoAcaoIcon = (tipo: ProcessTask['tipoAcao']) => {
    switch (tipo) {
      case 'Pedir Documentação':
        return '📄'
      case 'Anotação':
        return '📝'
      case 'Evento':
        return '📅'
      case 'Reunião':
        return '👥'
      case 'Análise':
        return '🔍'
      default:
        return '⚡'
    }
  }

  const getStatusColor = (status: ProcessTask['status']) => {
    switch (status) {
      case 'Concluído':
        return 'bg-green-600'
      case 'Em Andamento':
        return 'bg-blue-600'
      case 'Cancelado':
        return 'bg-gray-500'
      default:
        return 'bg-orange-500'
    }
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
      {/* CONTENT AREA - TASKS VIEW */}
      {/* ============================================================ */}
      <>
        {/* FILTER BUTTONS - TOP LEFT */}
        <div className="flex items-center gap-3 p-6 pb-0">
          <button
            onClick={() => setShowTaskFilters(!showTaskFilters)}
            className="flex items-center gap-2 px-5 py-3 rounded-lg font-bold text-sm transition shadow-md bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Filter size={18} /> Filtros
          </button>
          <button
            onClick={handleClearTaskFilters}
            className="flex items-center gap-2 px-5 py-3 rounded-lg font-bold text-sm transition shadow-md bg-yellow-300 hover:bg-yellow-400 text-gray-900"
          >
            <RotateCcw size={18} /> Limpar
          </button>
        </div>

        {/* TASK FILTERS */}
        {showTaskFilters && (
          <div className={`border-b ${darkMode ? 'border-dark-600 bg-dark-800/50' : 'border-gray-200 bg-gray-50'} p-4 space-y-3`}>
            <div className="grid grid-cols-2 gap-3">
              {/* Responsável dropdown */}
              <div className="relative">
                <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Responsável</label>
                <button
                  onClick={() => {
                    setShowResponsavelDropdown(!showResponsavelDropdown)
                    setShowSetorDropdown(false)
                    setShowStatusDropdown(false)
                    setShowTipoAcaoDropdown(false)
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg border text-sm flex items-center justify-between ${darkMode ? 'bg-dark-700 border-dark-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                >
                  <span className="truncate">{taskFilters.responsavel || '— Todos —'}</span>
                  <span className="text-xs opacity-50 ml-2">▼</span>
                </button>
                {showResponsavelDropdown && (
                  <div className={`absolute top-full left-0 mt-1 w-full rounded-lg shadow-xl z-30 border ${darkMode ? 'border-dark-600 bg-dark-700' : 'border-gray-200 bg-white'} overflow-hidden max-h-48 overflow-y-auto`}>
                    <button
                      onClick={() => {
                        setTaskFilters(f => ({ ...f, responsavel: '' }))
                        setShowResponsavelDropdown(false)
                      }}
                      className={`w-full text-left px-3 py-2 text-sm border-b ${darkMode ? 'border-dark-600 hover:bg-dark-600' : 'border-gray-200 hover:bg-gray-50'} ${!taskFilters.responsavel ? (darkMode ? 'bg-dark-600' : 'bg-gray-100') : ''}`}
                    >
                      Todos
                    </button>
                    {RESPONSAVEIS_OPTIONS.map(opt => (
                      <button
                        key={opt}
                        onClick={() => {
                          setTaskFilters(f => ({ ...f, responsavel: opt }))
                          setShowResponsavelDropdown(false)
                        }}
                        className={`w-full text-left px-3 py-2 text-sm border-b ${darkMode ? 'border-dark-600 hover:bg-dark-600' : 'border-gray-200 hover:bg-gray-50'} ${taskFilters.responsavel === opt ? (darkMode ? 'bg-dark-600' : 'bg-gray-100') : ''}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Setor dropdown */}
              <div className="relative">
                <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Setor</label>
                <button
                  onClick={() => {
                    setShowSetorDropdown(!showSetorDropdown)
                    setShowResponsavelDropdown(false)
                    setShowStatusDropdown(false)
                    setShowTipoAcaoDropdown(false)
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg border text-sm flex items-center justify-between ${darkMode ? 'bg-dark-700 border-dark-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                >
                  <span className="truncate">{taskFilters.setor || '— Todos —'}</span>
                  <span className="text-xs opacity-50 ml-2">▼</span>
                </button>
                {showSetorDropdown && (
                  <div className={`absolute top-full left-0 mt-1 w-full rounded-lg shadow-xl z-30 border ${darkMode ? 'border-dark-600 bg-dark-700' : 'border-gray-200 bg-white'} overflow-hidden`}>
                    <button
                      onClick={() => {
                        setTaskFilters(f => ({ ...f, setor: '' }))
                        setShowSetorDropdown(false)
                      }}
                      className={`w-full text-left px-3 py-2 text-sm border-b ${darkMode ? 'border-dark-600 hover:bg-dark-600' : 'border-gray-200 hover:bg-gray-50'} ${!taskFilters.setor ? (darkMode ? 'bg-dark-600' : 'bg-gray-100') : ''}`}
                    >
                      Todos
                    </button>
                    {SETORES_OPTIONS.length === 0 ? (
                      <div className={`px-3 py-2 text-xs italic ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Nenhum setor cadastrado
                      </div>
                    ) : (
                      SETORES_OPTIONS.map(opt => (
                        <button
                          key={opt}
                          onClick={() => {
                            setTaskFilters(f => ({ ...f, setor: opt }))
                            setShowSetorDropdown(false)
                          }}
                          className={`w-full text-left px-3 py-2 text-sm border-b ${darkMode ? 'border-dark-600 hover:bg-dark-600' : 'border-gray-200 hover:bg-gray-50'} ${taskFilters.setor === opt ? (darkMode ? 'bg-dark-600' : 'bg-gray-100') : ''}`}
                        >
                          {opt}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Status dropdown */}
              <div className="relative">
                <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Status</label>
                <button
                  onClick={() => {
                    setShowStatusDropdown(!showStatusDropdown)
                    setShowResponsavelDropdown(false)
                    setShowSetorDropdown(false)
                    setShowTipoAcaoDropdown(false)
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg border text-sm flex items-center justify-between ${darkMode ? 'bg-dark-700 border-dark-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                >
                  <span className="truncate">{taskFilters.status || '— Todos —'}</span>
                  <span className="text-xs opacity-50 ml-2">▼</span>
                </button>
                {showStatusDropdown && (
                  <div className={`absolute top-full left-0 mt-1 w-full rounded-lg shadow-xl z-30 border ${darkMode ? 'border-dark-600 bg-dark-700' : 'border-gray-200 bg-white'} overflow-hidden`}>
                    <button
                      onClick={() => {
                        setTaskFilters(f => ({ ...f, status: '' }))
                        setShowStatusDropdown(false)
                      }}
                      className={`w-full text-left px-3 py-2 text-sm border-b ${darkMode ? 'border-dark-600 hover:bg-dark-600' : 'border-gray-200 hover:bg-gray-50'} ${!taskFilters.status ? (darkMode ? 'bg-dark-600' : 'bg-gray-100') : ''}`}
                    >
                      Todos
                    </button>
                    {STATUS_OPTIONS.map(opt => (
                      <button
                        key={opt}
                        onClick={() => {
                          setTaskFilters(f => ({ ...f, status: opt }))
                          setShowStatusDropdown(false)
                        }}
                        className={`w-full text-left px-3 py-2 text-sm border-b ${darkMode ? 'border-dark-600 hover:bg-dark-600' : 'border-gray-200 hover:bg-gray-50'} ${taskFilters.status === opt ? (darkMode ? 'bg-dark-600' : 'bg-gray-100') : ''}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Tipo de Ação dropdown */}
              <div className="relative">
                <label className={`block text-xs font-semibold mb-1 uppercase tracking-wide ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tipo de Ação</label>
                <button
                  onClick={() => {
                    setShowTipoAcaoDropdown(!showTipoAcaoDropdown)
                    setShowResponsavelDropdown(false)
                    setShowSetorDropdown(false)
                    setShowStatusDropdown(false)
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg border text-sm flex items-center justify-between ${darkMode ? 'bg-dark-700 border-dark-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                >
                  <span className="truncate">{taskFilters.tipoAcao || '— Todos —'}</span>
                  <span className="text-xs opacity-50 ml-2">▼</span>
                </button>
                {showTipoAcaoDropdown && (
                  <div className={`absolute top-full left-0 mt-1 w-full rounded-lg shadow-xl z-30 border ${darkMode ? 'border-dark-600 bg-dark-700' : 'border-gray-200 bg-white'} overflow-hidden max-h-48 overflow-y-auto`}>
                    <button
                      onClick={() => {
                        setTaskFilters(f => ({ ...f, tipoAcao: '' }))
                        setShowTipoAcaoDropdown(false)
                      }}
                      className={`w-full text-left px-3 py-2 text-sm border-b ${darkMode ? 'border-dark-600 hover:bg-dark-600' : 'border-gray-200 hover:bg-gray-50'} ${!taskFilters.tipoAcao ? (darkMode ? 'bg-dark-600' : 'bg-gray-100') : ''}`}
                    >
                      Todos
                    </button>
                    {TIPO_ACAO_OPTIONS.map(opt => (
                      <button
                        key={opt}
                        onClick={() => {
                          setTaskFilters(f => ({ ...f, tipoAcao: opt }))
                          setShowTipoAcaoDropdown(false)
                        }}
                        className={`w-full text-left px-3 py-2 text-sm border-b ${darkMode ? 'border-dark-600 hover:bg-dark-600' : 'border-gray-200 hover:bg-gray-50'} ${taskFilters.tipoAcao === opt ? (darkMode ? 'bg-dark-600' : 'bg-gray-100') : ''}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TASKS GRID */}
        <div className="flex-1 overflow-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <p className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Mostrando <span className="font-bold">{filteredTasks.length}</span> de <span className="font-bold">{tasks.length}</span> tarefas
            </p>
          </div>

          {filteredTasks.length === 0 ? (
            <div className={`rounded-xl border ${bgColors.card} p-12 text-center`}>
              <AlertCircle size={32} className={`mx-auto mb-3 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
              <p className={`text-base font-semibold ${bgColors.text}`}>Nenhuma tarefa encontrada</p>
              <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'} mt-1`}>Tente ajustar seus filtros</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTasks.map(task => (
                <div key={task.id} className={`${bgColors.card} rounded-xl border p-4 flex flex-col`}>
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-3 pb-3 border-b border-opacity-20">
                    <div className="flex-1">
                      <h3 className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-900'} mb-1`}>{task.titulo}</h3>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} line-clamp-2`}>{task.descricao || '—'}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-white text-xs font-semibold shrink-0 ml-2 ${getStatusColor(task.status)}`}>
                      {task.status === 'Concluído' && <CheckCircle2 size={11} />}
                      {task.status}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4 text-xs">
                    <div className={`flex justify-between ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <span>Responsável:</span>
                      <span className="font-semibold">{task.responsavel}</span>
                    </div>
                    <div className={`flex justify-between ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <span>Setor:</span>
                      <span className="font-semibold">{task.setor}</span>
                    </div>
                    <div className={`flex justify-between ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <span>Tipo:</span>
                      <span className="font-semibold">
                        {task.tipo ? `${task.tipo} / ${task.acao}` : `${getTipoAcaoIcon(task.tipoAcao)} ${task.tipoAcao}`}
                      </span>
                    </div>
                    {task.tarefa && (
                      <div className={`flex justify-between ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <span>Tarefa:</span>
                        <span className="font-semibold text-right" style={{maxWidth: '60%'}}>{task.tarefa}</span>
                      </div>
                    )}
                    {task.prazo && (
                      <div className={`flex justify-between ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <span>Prazo:</span>
                        <span className="font-semibold">{task.prazo}</span>
                      </div>
                    )}
                    {task.observacao && (
                      <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-2 p-2 rounded ${darkMode ? 'bg-dark-700' : 'bg-gray-100'}`}>
                        <span className="font-semibold block mb-1">Obs:</span>
                        <span>{task.observacao}</span>
                      </div>
                    )}
                  </div>

                  {/* Date */}
                  <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} mb-3 pt-2 border-t border-opacity-20`}>
                    {task.dataCriacao}
                    {task.dataConclusao && <div>Concluída: {task.dataConclusao}</div>}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-auto pt-3 border-t border-opacity-20">
                    <button
                      onClick={() => completeTask(task.id)}
                      className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs font-bold transition ${task.status === 'Concluído'
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : darkMode
                            ? 'bg-dark-700 hover:bg-dark-600 text-gray-300'
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        }`}
                    >
                      <CheckCircle2 size={11} /> Concluir
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs font-bold transition bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Trash2 size={11} /> Deletar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    </div>
  )

}
