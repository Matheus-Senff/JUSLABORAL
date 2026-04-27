import React, { useState, useMemo } from 'react'
import { X, Plus, Edit2, Trash2, CheckCircle2, Filter, RotateCcw, AlertCircle } from 'lucide-react'
import { ProcessTask } from '../types'
import { useTasks } from '../contexts/TasksContext'
import { useSupabaseUsuarios } from '../hooks/useSupabaseUsuarios'

interface TasksIndexProps {
  darkMode: boolean
}

const SETORES_OPTIONS = ['Administrativo', 'Jurídico', 'Previdenciário', 'Contencioso', 'Financeiro']
const STATUS_OPTIONS = ['Aberto', 'Em Andamento', 'Concluído', 'Cancelado']
const TIPO_ACAO_OPTIONS = ['Pedir Documentação', 'Anotação', 'Evento', 'Reunião', 'Análise', 'Outro']

export const TasksIndex: React.FC<TasksIndexProps> = ({ darkMode }) => {
  const { tasks, deleteTask, completeTask } = useTasks()
  const { nomes: RESPONSAVEIS_OPTIONS } = useSupabaseUsuarios()

  const [filters, setFilters] = useState({
    responsavel: '',
    setor: 'Administrativo', // Padrão: Administrativo
    status: '',
    tipoAcao: '',
    titulo: '',
  })

  const [showFilters, setShowFilters] = useState(false)
  const [showResponsavelDropdown, setShowResponsavelDropdown] = useState(false)
  const [showSetorDropdown, setShowSetorDropdown] = useState(false)
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showTipoAcaoDropdown, setShowTipoAcaoDropdown] = useState(false)

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (filters.responsavel && task.responsavel !== filters.responsavel) return false
      if (filters.setor && task.setor !== filters.setor) return false
      if (filters.status && task.status !== filters.status) return false
      if (filters.tipoAcao && task.tipoAcao !== filters.tipoAcao) return false
      if (filters.titulo && !task.titulo.toLowerCase().includes(filters.titulo.toLowerCase())) return false
      return true
    })
  }, [tasks, filters])

  const handleClearFilters = () => {
    setFilters({
      responsavel: '',
      setor: 'Administrativo',
      status: '',
      tipoAcao: '',
      titulo: '',
    })
  }

  const bg = darkMode ? 'bg-dark-900' : 'bg-gray-50'
  const card = darkMode ? 'bg-dark-800' : 'bg-white'
  const border = darkMode ? 'border-dark-600' : 'border-gray-200'
  const text = darkMode ? 'text-white' : 'text-gray-900'
  const muted = darkMode ? 'text-gray-400' : 'text-gray-500'
  const inputCls = `w-full px-3 py-2 border rounded-lg text-sm ${darkMode ? 'bg-dark-700 border-dark-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`
  const labelCls = `block text-xs font-semibold mb-1 uppercase tracking-wide ${darkMode ? 'text-gray-400' : 'text-gray-500'}`

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

  return (
    <div className={`${bg} min-h-screen`}>
      {/* Header */}
      <div className={`${card} border-b ${border} px-6 py-4 sticky top-0 z-20`}>
        <div className="flex items-center justify-between mb-4">
          <h1 className={`text-2xl font-bold ${text}`}>Tarefas</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${showFilters ? 'bg-blue-600 text-white' : darkMode ? 'bg-dark-700 text-gray-300 hover:bg-dark-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              <Filter size={16} /> Filtros
            </button>
            <button
              onClick={handleClearFilters}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${darkMode ? 'bg-dark-700 text-gray-300 hover:bg-dark-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              <RotateCcw size={16} /> Limpar
            </button>
          </div>
        </div>

        {/* Filtros */}
        {showFilters && (
          <div className={`p-4 rounded-lg border ${border} space-y-3 mb-4`}>
            <div>
              <label className={labelCls}>Título</label>
              <input
                type="text"
                value={filters.titulo}
                onChange={e => setFilters(f => ({ ...f, titulo: e.target.value }))}
                placeholder="Buscar por título..."
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Responsável dropdown */}
              <div className="relative">
                <label className={labelCls}>Responsável</label>
                <button
                  onClick={() => {
                    setShowResponsavelDropdown(!showResponsavelDropdown)
                    setShowSetorDropdown(false)
                    setShowStatusDropdown(false)
                    setShowTipoAcaoDropdown(false)
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg border text-sm flex items-center justify-between ${darkMode ? 'bg-dark-700 border-dark-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                >
                  <span className="truncate">{filters.responsavel || '— Todos —'}</span>
                  <span className="text-xs opacity-50 ml-2">▼</span>
                </button>
                {showResponsavelDropdown && (
                  <div className={`absolute top-full left-0 mt-1 w-full rounded-lg shadow-xl z-30 border ${border} ${card} overflow-hidden max-h-48 overflow-y-auto`}>
                    <button
                      onClick={() => {
                        setFilters(f => ({ ...f, responsavel: '' }))
                        setShowResponsavelDropdown(false)
                      }}
                      className={`w-full text-left px-3 py-2 text-sm border-b ${border} transition ${!filters.responsavel ? (darkMode ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-50 text-blue-700') : (darkMode ? 'hover:bg-dark-700' : 'hover:bg-gray-50')} ${text}`}
                    >
                      Todos
                    </button>
                    {RESPONSAVEIS_OPTIONS.map(opt => (
                      <button
                        key={opt}
                        onClick={() => {
                          setFilters(f => ({ ...f, responsavel: opt }))
                          setShowResponsavelDropdown(false)
                        }}
                        className={`w-full text-left px-3 py-2 text-sm border-b ${border} transition ${filters.responsavel === opt ? (darkMode ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-50 text-blue-700') : (darkMode ? 'hover:bg-dark-700' : 'hover:bg-gray-50')} ${text}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Setor dropdown */}
              <div className="relative">
                <label className={labelCls}>Setor</label>
                <button
                  onClick={() => {
                    setShowSetorDropdown(!showSetorDropdown)
                    setShowResponsavelDropdown(false)
                    setShowStatusDropdown(false)
                    setShowTipoAcaoDropdown(false)
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg border text-sm flex items-center justify-between ${darkMode ? 'bg-dark-700 border-dark-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                >
                  <span className="truncate">{filters.setor || '— Todos —'}</span>
                  <span className="text-xs opacity-50 ml-2">▼</span>
                </button>
                {showSetorDropdown && (
                  <div className={`absolute top-full left-0 mt-1 w-full rounded-lg shadow-xl z-30 border ${border} ${card} overflow-hidden`}>
                    {SETORES_OPTIONS.map(opt => (
                      <button
                        key={opt}
                        onClick={() => {
                          setFilters(f => ({ ...f, setor: opt }))
                          setShowSetorDropdown(false)
                        }}
                        className={`w-full text-left px-3 py-2 text-sm border-b ${border} transition ${filters.setor === opt ? (darkMode ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-50 text-blue-700') : (darkMode ? 'hover:bg-dark-700' : 'hover:bg-gray-50')} ${text}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Status dropdown */}
              <div className="relative">
                <label className={labelCls}>Status</label>
                <button
                  onClick={() => {
                    setShowStatusDropdown(!showStatusDropdown)
                    setShowResponsavelDropdown(false)
                    setShowSetorDropdown(false)
                    setShowTipoAcaoDropdown(false)
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg border text-sm flex items-center justify-between ${darkMode ? 'bg-dark-700 border-dark-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                >
                  <span className="truncate">{filters.status || '— Todos —'}</span>
                  <span className="text-xs opacity-50 ml-2">▼</span>
                </button>
                {showStatusDropdown && (
                  <div className={`absolute top-full left-0 mt-1 w-full rounded-lg shadow-xl z-30 border ${border} ${card} overflow-hidden`}>
                    <button
                      onClick={() => {
                        setFilters(f => ({ ...f, status: '' }))
                        setShowStatusDropdown(false)
                      }}
                      className={`w-full text-left px-3 py-2 text-sm border-b ${border} transition ${!filters.status ? (darkMode ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-50 text-blue-700') : (darkMode ? 'hover:bg-dark-700' : 'hover:bg-gray-50')} ${text}`}
                    >
                      Todos
                    </button>
                    {STATUS_OPTIONS.map(opt => (
                      <button
                        key={opt}
                        onClick={() => {
                          setFilters(f => ({ ...f, status: opt }))
                          setShowStatusDropdown(false)
                        }}
                        className={`w-full text-left px-3 py-2 text-sm border-b ${border} transition ${filters.status === opt ? (darkMode ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-50 text-blue-700') : (darkMode ? 'hover:bg-dark-700' : 'hover:bg-gray-50')} ${text}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Tipo de Ação dropdown */}
              <div className="relative">
                <label className={labelCls}>Tipo de Ação</label>
                <button
                  onClick={() => {
                    setShowTipoAcaoDropdown(!showTipoAcaoDropdown)
                    setShowResponsavelDropdown(false)
                    setShowSetorDropdown(false)
                    setShowStatusDropdown(false)
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg border text-sm flex items-center justify-between ${darkMode ? 'bg-dark-700 border-dark-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                >
                  <span className="truncate">{filters.tipoAcao || '— Todos —'}</span>
                  <span className="text-xs opacity-50 ml-2">▼</span>
                </button>
                {showTipoAcaoDropdown && (
                  <div className={`absolute top-full left-0 mt-1 w-full rounded-lg shadow-xl z-30 border ${border} ${card} overflow-hidden max-h-48 overflow-y-auto`}>
                    <button
                      onClick={() => {
                        setFilters(f => ({ ...f, tipoAcao: '' }))
                        setShowTipoAcaoDropdown(false)
                      }}
                      className={`w-full text-left px-3 py-2 text-sm border-b ${border} transition ${!filters.tipoAcao ? (darkMode ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-50 text-blue-700') : (darkMode ? 'hover:bg-dark-700' : 'hover:bg-gray-50')} ${text}`}
                    >
                      Todos
                    </button>
                    {TIPO_ACAO_OPTIONS.map(opt => (
                      <button
                        key={opt}
                        onClick={() => {
                          setFilters(f => ({ ...f, tipoAcao: opt }))
                          setShowTipoAcaoDropdown(false)
                        }}
                        className={`w-full text-left px-3 py-2 text-sm border-b ${border} transition ${filters.tipoAcao === opt ? (darkMode ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-50 text-blue-700') : (darkMode ? 'hover:bg-dark-700' : 'hover:bg-gray-50')} ${text}`}
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

        {/* Resultado da filtragem */}
        <div className={`text-sm ${muted}`}>
          Mostrando <span className="font-semibold">{filteredTasks.length}</span> de <span className="font-semibold">{tasks.length}</span> tarefas
        </div>
      </div>

      {/* Lista de Tarefas */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.length === 0 ? (
          <div className={`col-span-full ${card} rounded-xl border ${border} p-12 text-center`}>
            <AlertCircle size={32} className={`mx-auto mb-3 ${muted}`} />
            <p className={`text-base font-semibold ${text}`}>Nenhuma tarefa encontrada</p>
            <p className={`text-sm ${muted} mt-1`}>Tente ajustar seus filtros</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div key={task.id} className={`${card} rounded-xl border ${border} p-5 flex flex-col`}>
              {/* Cabeçalho do Card */}
              <div className="flex items-start justify-between mb-3 pb-3 border-b border-opacity-20">
                <div className="flex-1">
                  <h3 className={`font-bold text-base ${text} mb-1`}>{task.titulo}</h3>
                  <p className={`text-xs ${muted} line-clamp-2`}>{task.descricao || '—'}</p>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-white text-xs font-semibold shrink-0 ml-2 ${getStatusColor(task.status)}`}>
                  {task.status === 'Concluído' && <CheckCircle2 size={12} />}
                  {task.status.length > 12 ? task.status.substring(0, 10) + '...' : task.status}
                </span>
              </div>

              {/* Detalhes */}
              <div className="space-y-2 mb-4">
                <div className={`flex items-center justify-between text-xs`}>
                  <span className={muted}>Responsável:</span>
                  <span className={`font-semibold ${text}`}>{task.responsavel}</span>
                </div>
                <div className={`flex items-center justify-between text-xs`}>
                  <span className={muted}>Setor:</span>
                  <span className={`font-semibold ${text}`}>{task.setor}</span>
                </div>
                <div className={`flex items-center justify-between text-xs`}>
                  <span className={muted}>Tipo:</span>
                  <span className={`font-semibold ${text}`}>{getTipoAcaoIcon(task.tipoAcao)} {task.tipoAcao}</span>
                </div>
                {task.observacao && (
                  <div className={`text-xs ${muted} mt-2 p-2 rounded ${darkMode ? 'bg-dark-700' : 'bg-gray-100'}`}>
                    <span className="font-semibold block mb-1">Observação:</span>
                    <span className={text}>{task.observacao}</span>
                  </div>
                )}
              </div>

              {/* Data */}
              <div className={`text-xs ${muted} mb-3 pt-2 border-t border-opacity-20`}>
                Criada em: {task.dataCriacao}
                {task.dataConclusao && <div>Concluída em: {task.dataConclusao}</div>}
              </div>

              {/* Botões */}
              <div className="flex items-center gap-2 mt-auto pt-3 border-t border-opacity-20">
                <button
                  onClick={() => completeTask(task.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded text-xs font-bold transition ${
                    task.status === 'Concluído'
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : darkMode
                      ? 'bg-dark-700 hover:bg-dark-600 text-gray-300'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  <CheckCircle2 size={12} /> Concluir
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded text-xs font-bold transition bg-red-600 hover:bg-red-700 text-white`}
                >
                  <Trash2 size={12} /> Deletar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
