import React, { useState } from 'react'
import { X, FileText, User, ChevronDown } from 'lucide-react'
import { usePastaStore } from './pastaStore'

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

  // LOCAL STATE
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory>('tarefas')
  const [assigneeFilter, setAssigneeFilter] = useState<string>('')
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false)

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

  const bgColors = {
    main: darkMode ? 'bg-dark-900 text-gray-100' : 'bg-gradient-to-br from-blue-50 to-indigo-50 text-gray-900',
    header: darkMode ? 'bg-dark-800/80 border-dark-700' : 'bg-white/70 border-gray-200',
    card: darkMode ? 'bg-dark-700 border-dark-600' : 'bg-white border-gray-200',
    text: darkMode ? 'text-gray-300' : 'text-gray-600',
  }

  return (
    <div className={`flex flex-col h-full min-h-0 ${bgColors.main}`}>
      {/* ============================================================ */}
      {/* MAIN HEADER - TWO BUTTONS (TAREFAS / ADMINISTRATIVO) */}
      {/* ============================================================ */}
      <div className={`flex items-center gap-6 px-6 py-4 flex-shrink-0 border-b ${bgColors.header}`}>
        {/* LEFT SIDE: Category Buttons with Dynamic Responsável Filter */}
        <div className="flex flex-col gap-2">
          {/* Tarefas Button Row */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setCategoryFilter('tarefas')
                setAssigneeFilter('')
                setShowAssigneeDropdown(false)
              }}
              className={`px-6 py-2.5 rounded-lg font-semibold transition border text-sm ${categoryFilter === 'tarefas'
                  ? 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700'
                  : darkMode
                    ? 'bg-dark-700 text-gray-300 border-dark-600 hover:bg-dark-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
            >
              Tarefas
            </button>

            {/* Responsável Dropdown - Shows when Tarefas is active */}
            {categoryFilter === 'tarefas' && (
              <div className="relative">
                <button
                  onClick={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition border text-sm ${assigneeFilter
                      ? 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700'
                      : darkMode
                        ? 'bg-dark-700 text-gray-300 border-dark-600 hover:bg-dark-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  <User size={16} />
                  {assigneeFilter ? assigneeFilter : 'Responsável'}
                  <ChevronDown size={16} />
                </button>

                {showAssigneeDropdown && (
                  <div
                    className={`absolute top-full left-0 mt-2 w-56 rounded-lg shadow-lg z-20 border max-h-64 overflow-y-auto ${darkMode ? 'bg-dark-700 border-dark-600' : 'bg-white border-gray-200'
                      }`}
                  >
                    <button
                      onClick={() => {
                        setAssigneeFilter('')
                        setShowAssigneeDropdown(false)
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition border-b ${darkMode ? 'border-dark-600 hover:bg-dark-600' : 'border-gray-200 hover:bg-gray-50'
                        } ${!assigneeFilter ? (darkMode ? 'bg-dark-600' : 'bg-gray-100') : ''}`}
                    >
                      Todos
                    </button>
                    {assigneesByCategory['tarefas'].map((assignee) => (
                      <button
                        key={assignee}
                        onClick={() => {
                          setAssigneeFilter(assignee)
                          setShowAssigneeDropdown(false)
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition ${darkMode ? 'hover:bg-dark-600' : 'hover:bg-gray-50'
                          } ${assigneeFilter === assignee ? (darkMode ? 'bg-dark-600' : 'bg-gray-100') : ''}`}
                      >
                        {assignee}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Administrativo Button Row */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setCategoryFilter('administrativo')
                setAssigneeFilter('')
                setShowAssigneeDropdown(false)
              }}
              className={`px-6 py-2.5 rounded-lg font-semibold transition border text-sm ${categoryFilter === 'administrativo'
                  ? 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700'
                  : darkMode
                    ? 'bg-dark-700 text-gray-300 border-dark-600 hover:bg-dark-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
            >
              Administrativo
            </button>

            {/* Responsável Dropdown - Shows when Administrativo is active */}
            {categoryFilter === 'administrativo' && (
              <div className="relative">
                <button
                  onClick={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition border text-sm ${assigneeFilter
                      ? 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700'
                      : darkMode
                        ? 'bg-dark-700 text-gray-300 border-dark-600 hover:bg-dark-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  <User size={16} />
                  {assigneeFilter ? assigneeFilter : 'Responsável'}
                  <ChevronDown size={16} />
                </button>

                {showAssigneeDropdown && (
                  <div
                    className={`absolute top-full left-0 mt-2 w-56 rounded-lg shadow-lg z-20 border max-h-64 overflow-y-auto ${darkMode ? 'bg-dark-700 border-dark-600' : 'bg-white border-gray-200'
                      }`}
                  >
                    <button
                      onClick={() => {
                        setAssigneeFilter('')
                        setShowAssigneeDropdown(false)
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition border-b ${darkMode ? 'border-dark-600 hover:bg-dark-600' : 'border-gray-200 hover:bg-gray-50'
                        } ${!assigneeFilter ? (darkMode ? 'bg-dark-600' : 'bg-gray-100') : ''}`}
                    >
                      Todos
                    </button>
                    {assigneesByCategory['administrativo'].map((assignee) => (
                      <button
                        key={assignee}
                        onClick={() => {
                          setAssigneeFilter(assignee)
                          setShowAssigneeDropdown(false)
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition ${darkMode ? 'hover:bg-dark-600' : 'hover:bg-gray-50'
                          } ${assigneeFilter === assignee ? (darkMode ? 'bg-dark-600' : 'bg-gray-100') : ''}`}
                      >
                        {assignee}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* SPACER */}
        <div className="flex-1" />

        {/* RIGHT SIDE: Clear Filter Button */}
        <div className="flex items-center gap-3">
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
        </div>
      </div>

      {/* ============================================================ */}
      {/* EMPTY CONTENT AREA */}
      {/* ============================================================ */}
      <div className="flex-1 flex items-center justify-center">
        <div className={`text-center p-8 rounded-lg ${bgColors.card} border`}>
          <FileText size={40} className="mx-auto mb-3" style={{ color: darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }} />
          <p className={`text-lg font-semibold mb-1 ${bgColors.text}`}>
            {categoryFilter === 'tarefas' ? 'Tarefas' : 'Administrativo'}
          </p>
          <p className="text-sm" style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
            {assigneeFilter ? `Filtrando por: ${assigneeFilter}` : 'Selecione um responsável'}
          </p>
        </div>
      </div>
    </div>
  )
}
