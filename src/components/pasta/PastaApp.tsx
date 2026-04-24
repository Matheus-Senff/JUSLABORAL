import React, { useState } from 'react'
import { Search, Filter, LayoutGrid, X } from 'lucide-react'
import { usePastaStore, FilterState } from './pastaStore'
import { KanbanBoard } from './KanbanBoard'
import { CardDetailModal } from './CardDetailModal'
import { LabelColor } from './types'

const LABEL_COLORS: Record<LabelColor, { bg: string; label: string }> = {
  green: { bg: 'bg-green-500', label: 'Prioridade Baixa' },
  yellow: { bg: 'bg-yellow-400', label: 'Em Análise' },
  orange: { bg: 'bg-orange-500', label: 'Atenção' },
  red: { bg: 'bg-red-500', label: 'Urgente' },
  purple: { bg: 'bg-purple-500', label: 'Revisão' },
  blue: { bg: 'bg-blue-500', label: 'Informação' },
}

const BG_CLASS_MAP: Record<string, string> = {
  default: '',
  ocean: 'bg-gradient-to-br from-blue-900 to-cyan-900',
  forest: 'bg-gradient-to-br from-green-800 to-emerald-900',
  sunset: 'bg-gradient-to-br from-orange-700 to-red-900',
  purple: 'bg-gradient-to-br from-purple-800 to-indigo-900',
  rose: 'bg-gradient-to-br from-pink-700 to-rose-900',
  light: 'bg-gradient-to-br from-blue-50 to-indigo-100',
  warm: 'bg-gradient-to-br from-amber-100 to-orange-100',
}

export const PastaApp: React.FC<{ darkMode?: boolean }> = ({ darkMode }) => {
  const board = usePastaStore((s) => s.board)
  const setSearchFilter = usePastaStore((s) => s.setSearchFilter)
  const searchFilter = usePastaStore((s) => s.searchFilter)
  const view = usePastaStore((s) => s.view)
  const setView = usePastaStore((s) => s.setView)
  const filterState = usePastaStore((s) => s.filterState)
  const setFilterState = usePastaStore((s) => s.setFilterState)
  const clearFilters = usePastaStore((s) => s.clearFilters)

  const [showSearch, setShowSearch] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<string | null>('geral')
  const [filterSection, setFilterSection] = useState<'label' | 'responsible' | 'date' | null>(null)

  // Mock users for filtering
  const mockUsers = [
    { id: 'geral', name: 'Filtro Responsável', email: 'Visualizar todos os documentos' },
    { id: '1', name: 'Ana Silva', email: 'ana.silva@juslaboral.com' },
    { id: '2', name: 'Carlos Santos', email: 'carlos.santos@juslaboral.com' },
    { id: '3', name: 'Mariana Costa', email: 'mariana.costa@juslaboral.com' },
    { id: '4', name: 'Roberto Dias', email: 'roberto.dias@juslaboral.com' },
    { id: '5', name: 'Fernanda Oliveira', email: 'fernanda.oliveira@juslaboral.com' }
  ]

  const activeFilterCount =
    filterState.labels.length +
    filterState.members.length +
    (filterState.dueDateFilter !== 'all' ? 1 : 0) +
    (filterState.hasChecklist ? 1 : 0) +
    (filterState.hasAttachment ? 1 : 0)

  const totalCards = board.columns.reduce((s, c) => s + c.cards.filter((cd) => !cd.archived).length, 0)

  const bgClass = board.backgroundColor !== 'default' ? (BG_CLASS_MAP[board.backgroundColor] || '') : ''
  const mainBg = bgClass || (darkMode ? 'bg-dark-900 text-gray-100' : 'bg-gradient-to-br from-blue-50 to-indigo-50 text-gray-900')

  return (
    <div className={`flex flex-col h-full min-h-0 ${mainBg} ${bgClass ? 'text-white' : ''
      }`}>
      {/* Board Header */}
      <div className={`flex items-center gap-4 px-6 py-4 flex-shrink-0 border-b ${darkMode ? 'bg-dark-800/80 border-dark-700' : 'bg-white/70 backdrop-blur border-gray-200'
        }`}>
        {/* Filter Button - Opens Modal */}
        <button
          onClick={() => {
            setShowFilterModal(!showFilterModal)
            setFilterSection(null)
          }}
          className={`inline-flex items-center gap-2 px-3 py-2 rounded text-sm font-semibold transition relative ${activeFilterCount > 0
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : darkMode ? 'hover:bg-dark-600 text-gray-300' : 'hover:bg-gray-200 text-gray-600'
            }`}
        >
          <Filter size={14} /> Filtro
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-white text-blue-600 text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Search */}
        <div className="relative flex items-center">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`p-2 rounded transition ${darkMode ? 'hover:bg-dark-600 text-gray-300' : 'hover:bg-gray-200 text-gray-600'}`}
          >
            <Search size={20} />
          </button>
          {showSearch && (
            <input
              autoFocus
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              onBlur={() => { if (!searchFilter) setShowSearch(false) }}
              placeholder="Buscar cartões..."
              className={`ml-2 w-64 rounded-lg px-3 py-2 text-sm shadow-lg border ${darkMode ? 'bg-dark-700 text-white border-dark-500' : 'bg-white text-gray-900 border-gray-300'
                }`}
            />
          )}
        </div>
      </div>

      {/* Filter Modal - Centered */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div
            className={`w-[40%] max-h-[80vh] flex flex-col rounded-xl shadow-2xl border p-6 ${darkMode ? 'bg-dark-700 border-dark-600' : 'bg-white border-gray-200'
              }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <p className={`text-lg font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Filtrar cartões</p>
              <button
                onClick={() => {
                  setShowFilterModal(false)
                  setFilterSection(null)
                }}
                className={`p-0.5 rounded ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Filter Sections */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {/* Responsável Section */}
              <div className="mb-4">
                <button
                  onClick={() => setFilterSection(filterSection === 'responsible' ? null : 'responsible')}
                  className={`w-full text-left px-4 py-2.5 rounded-lg font-medium transition ${filterSection === 'responsible'
                    ? 'bg-blue-600 text-white'
                    : darkMode ? 'bg-dark-600 text-gray-200 hover:bg-dark-500' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  Responsável
                </button>
                {filterSection === 'responsible' && (
                  <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: darkMode ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)' }}>
                    <div className="flex flex-wrap gap-2">
                      {mockUsers.filter(u => u.id !== 'geral').map((user) => {
                        const active = filterState.members.includes(user.name)
                        return (
                          <button
                            key={user.id}
                            onClick={() => {
                              const updated = active
                                ? filterState.members.filter((m) => m !== user.name)
                                : [...filterState.members, user.name]
                              setFilterState({ members: updated })
                            }}
                            className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${active ? 'bg-blue-600 text-white' : (darkMode ? 'bg-dark-500 text-gray-300 hover:bg-dark-400' : 'bg-gray-200 text-gray-600 hover:bg-gray-300')
                              }`}
                            title={user.email}
                          >
                            {user.name}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Etiqueta Section */}
              <div className="mb-4">
                <button
                  onClick={() => setFilterSection(filterSection === 'label' ? null : 'label')}
                  className={`w-full text-left px-4 py-2.5 rounded-lg font-medium transition ${filterSection === 'label'
                    ? 'bg-blue-600 text-white'
                    : darkMode ? 'bg-dark-600 text-gray-200 hover:bg-dark-500' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  Etiqueta
                </button>
                {filterSection === 'label' && (
                  <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: darkMode ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)' }}>
                    <div className="flex flex-wrap gap-2">
                      {(Object.keys(LABEL_COLORS) as LabelColor[]).map((color) => {
                        const active = filterState.labels.includes(color)
                        return (
                          <button
                            key={color}
                            onClick={() => {
                              const updated = active
                                ? filterState.labels.filter((l) => l !== color)
                                : [...filterState.labels, color]
                              setFilterState({ labels: updated })
                            }}
                            className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${active ? `${LABEL_COLORS[color].bg} text-white` : (darkMode ? 'bg-dark-500 text-gray-300 hover:bg-dark-400' : 'bg-gray-200 text-gray-600 hover:bg-gray-300')
                              }`}
                          >
                            {LABEL_COLORS[color].label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Data de Vencimento Section */}
              <div className="mb-4">
                <button
                  onClick={() => setFilterSection(filterSection === 'date' ? null : 'date')}
                  className={`w-full text-left px-4 py-2.5 rounded-lg font-medium transition ${filterSection === 'date'
                    ? 'bg-blue-600 text-white'
                    : darkMode ? 'bg-dark-600 text-gray-200 hover:bg-dark-500' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  Data de Vencimento
                </button>
                {filterSection === 'date' && (
                  <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: darkMode ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)' }}>
                    <div className="flex flex-wrap gap-2">
                      {([
                        { key: 'all', label: 'Todos' },
                        { key: 'overdue', label: 'Vencido' },
                        { key: 'next7days', label: 'Próximos 7 dias' },
                        { key: 'nodate', label: 'Sem data' },
                        { key: 'hasdate', label: 'Com data' },
                      ] as const).map(({ key, label }) => (
                        <button
                          key={key}
                          onClick={() => setFilterState({ dueDateFilter: key })}
                          className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${filterState.dueDateFilter === key
                            ? 'bg-blue-600 text-white'
                            : darkMode ? 'bg-dark-500 text-gray-300 hover:bg-dark-400' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Botões Footer */}
            <div className="flex items-center gap-3 justify-between mt-6 pt-4 border-t" style={{ borderColor: darkMode ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.1)' }}>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                >
                  Limpar todos os filtros
                </button>
              )}
              <button
                onClick={() => {
                  setShowFilterModal(false)
                  setFilterSection(null)
                }}
                className="ml-auto px-8 py-2.5 rounded-lg text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 transition shadow-md"
              >
                Filtrar
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-4 min-h-0">
        <KanbanBoard darkMode={darkMode} />
      </div>

      {/* Card detail modal */}
      <CardDetailModal darkMode={darkMode} />
    </div>
  )
}
