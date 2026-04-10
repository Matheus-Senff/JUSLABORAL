import React, { useState } from 'react'
import { Search, Filter, MoreHorizontal, LayoutGrid, CalendarDays, Menu, X } from 'lucide-react'
import { usePastaStore, FilterState } from './pastaStore'
import { KanbanBoard } from './KanbanBoard'
import { CalendarView } from './CalendarView'
import { CardDetailModal } from './CardDetailModal'
import { BoardMenu } from './BoardMenu'
import { LabelColor } from './types'

const LABEL_COLORS: Record<LabelColor, { bg: string; label: string }> = {
  green:  { bg: 'bg-green-500',  label: 'Prioridade Baixa' },
  yellow: { bg: 'bg-yellow-400', label: 'Em Análise' },
  orange: { bg: 'bg-orange-500', label: 'Atenção' },
  red:    { bg: 'bg-red-500',    label: 'Urgente' },
  purple: { bg: 'bg-purple-500', label: 'Revisão' },
  blue:   { bg: 'bg-blue-500',   label: 'Informação' },
}

const BG_CLASS_MAP: Record<string, string> = {
  default: '',
  ocean:  'bg-gradient-to-br from-blue-900 to-cyan-900',
  forest: 'bg-gradient-to-br from-green-800 to-emerald-900',
  sunset: 'bg-gradient-to-br from-orange-700 to-red-900',
  purple: 'bg-gradient-to-br from-purple-800 to-indigo-900',
  rose:   'bg-gradient-to-br from-pink-700 to-rose-900',
  light:  'bg-gradient-to-br from-blue-50 to-indigo-100',
  warm:   'bg-gradient-to-br from-amber-100 to-orange-100',
}

export const PastaApp: React.FC<{ darkMode?: boolean }> = ({ darkMode }) => {
  const board = usePastaStore((s) => s.board)
  const setSearchFilter = usePastaStore((s) => s.setSearchFilter)
  const searchFilter = usePastaStore((s) => s.searchFilter)
  const view = usePastaStore((s) => s.view)
  const setView = usePastaStore((s) => s.setView)
  const boardMenuOpen = usePastaStore((s) => s.boardMenuOpen)
  const setBoardMenuOpen = usePastaStore((s) => s.setBoardMenuOpen)
  const filterState = usePastaStore((s) => s.filterState)
  const setFilterState = usePastaStore((s) => s.setFilterState)
  const clearFilters = usePastaStore((s) => s.clearFilters)

  const [showSearch, setShowSearch] = useState(false)
  const [showMembers, setShowMembers] = useState(false)
  const [showFilterPanel, setShowFilterPanel] = useState(false)

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
    <div className={`flex flex-col h-full min-h-0 ${mainBg} ${
      bgClass ? 'text-white' : ''
    }`}>
      {/* Board Header */}
      <div className={`flex items-center gap-3 px-4 py-3 flex-shrink-0 border-b ${
        darkMode ? 'bg-dark-800/80 border-dark-700' : 'bg-white/70 backdrop-blur border-gray-200'
      }`}>
        {/* Members — leftmost */}
        <div className="relative">
          <button
            onClick={() => setShowMembers(!showMembers)}
            className="flex items-center -space-x-1"
          >
            {board.members.slice(0, 4).map((m) => (
              <div
                key={m}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                  darkMode ? 'bg-blue-600 text-white border-dark-800' : 'bg-blue-500 text-white border-white'
                }`}
                title={m}
              >
                {m.charAt(0).toUpperCase()}
              </div>
            ))}
            {board.members.length > 4 && (
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                darkMode ? 'bg-dark-600 text-gray-300 border-dark-800' : 'bg-gray-200 text-gray-600 border-white'
              }`}>+{board.members.length - 4}</div>
            )}
          </button>
          {showMembers && (
            <div className={`absolute left-0 top-10 z-30 w-56 rounded-lg shadow-lg border p-3 ${
              darkMode ? 'bg-dark-700 border-dark-600' : 'bg-white border-gray-200'
            }`}>
              <p className={`text-xs font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Membros do quadro</p>
              {board.members.map((m) => (
                <div key={m} className={`flex items-center gap-2 py-1.5 text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                  }`}>{m.charAt(0).toUpperCase()}</div>
                  {m}
                </div>
              ))}
              <button onClick={() => setShowMembers(false)} className={`mt-2 w-full text-center text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Fechar</button>
            </div>
          )}
        </div>

        <div className="flex-1" />

        {/* View toggle */}
        <div className={`flex rounded-lg p-0.5 ${darkMode ? 'bg-dark-700' : 'bg-gray-200'}`}>
          <button
            onClick={() => setView('kanban')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition ${
              view === 'kanban'
                ? (darkMode ? 'bg-dark-500 text-white shadow' : 'bg-white text-gray-800 shadow')
                : (darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700')
            }`}
          >
            <LayoutGrid size={13} /> Documentos
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition ${
              view === 'calendar'
                ? (darkMode ? 'bg-dark-500 text-white shadow' : 'bg-white text-gray-800 shadow')
                : (darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700')
            }`}
          >
            <CalendarDays size={13} /> Calendário
          </button>
        </div>

        {/* Card count */}
        <span className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-dark-600 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
          {totalCards} cartões
        </span>

        {/* Filter */}
        <div className="relative">
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-sm transition relative ${
              activeFilterCount > 0
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

          {showFilterPanel && (
            <div
              className={`absolute right-0 top-10 z-40 w-80 rounded-xl shadow-2xl border p-4 ${
                darkMode ? 'bg-dark-700 border-dark-600' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <p className={`text-sm font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Filtrar cartões</p>
                <div className="flex gap-2">
                  {activeFilterCount > 0 && (
                    <button onClick={clearFilters} className="text-xs text-red-500 hover:underline">Limpar tudo</button>
                  )}
                  <button onClick={() => setShowFilterPanel(false)} className={`p-0.5 rounded ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}>
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Labels */}
              <p className={`text-[10px] font-semibold uppercase tracking-wide mb-1.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Etiquetas</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
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
                      className={`text-xs px-2 py-1 rounded-full font-medium transition ${
                        active ? `${LABEL_COLORS[color].bg} text-white` : (darkMode ? 'bg-dark-600 text-gray-300' : 'bg-gray-100 text-gray-600')
                      }`}
                    >
                      {LABEL_COLORS[color].label}
                    </button>
                  )
                })}
              </div>

              {/* Members */}
              <p className={`text-[10px] font-semibold uppercase tracking-wide mb-1.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Membros</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {board.members.map((m) => {
                  const active = filterState.members.includes(m)
                  return (
                    <button
                      key={m}
                      onClick={() => {
                        const updated = active
                          ? filterState.members.filter((mb) => mb !== m)
                          : [...filterState.members, m]
                        setFilterState({ members: updated })
                      }}
                      className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full font-medium transition ${
                        active ? 'bg-blue-600 text-white' : (darkMode ? 'bg-dark-600 text-gray-300' : 'bg-gray-100 text-gray-600')
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                        active ? 'bg-blue-400 text-white' : (darkMode ? 'bg-dark-500 text-gray-300' : 'bg-gray-300 text-gray-600')
                      }`}>{m.charAt(0)}</span>
                      {m.split(' ')[0]}
                    </button>
                  )
                })}
              </div>

              {/* Due date */}
              <p className={`text-[10px] font-semibold uppercase tracking-wide mb-1.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Data de vencimento</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {([
                  { key: 'all',        label: 'Todos' },
                  { key: 'overdue',    label: 'Vencido' },
                  { key: 'next7days',  label: 'Próximos 7 dias' },
                  { key: 'nodate',     label: 'Sem data' },
                  { key: 'hasdate',    label: 'Com data' },
                ] as const).map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setFilterState({ dueDateFilter: key })}
                    className={`text-xs px-2 py-1 rounded-full font-medium transition ${
                      filterState.dueDateFilter === key
                        ? 'bg-blue-600 text-white'
                        : darkMode ? 'bg-dark-600 text-gray-300' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Checklist / Attachment toggles */}
              <div className="flex gap-3">
                <label className={`flex items-center gap-2 text-xs cursor-pointer ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  <input
                    type="checkbox"
                    checked={filterState.hasChecklist}
                    onChange={(e) => setFilterState({ hasChecklist: e.target.checked })}
                    className="w-3.5 h-3.5 rounded"
                  />
                  Tem checklist
                </label>
                <label className={`flex items-center gap-2 text-xs cursor-pointer ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  <input
                    type="checkbox"
                    checked={filterState.hasAttachment}
                    onChange={(e) => setFilterState({ hasAttachment: e.target.checked })}
                    className="w-3.5 h-3.5 rounded"
                  />
                  Tem anexo
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`p-1.5 rounded transition ${darkMode ? 'hover:bg-dark-600 text-gray-300' : 'hover:bg-gray-200 text-gray-600'}`}
          >
            <Search size={16} />
          </button>
          {showSearch && (
            <input
              autoFocus
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              onBlur={() => { if (!searchFilter) setShowSearch(false) }}
              placeholder="Buscar cartões..."
              className={`absolute right-0 top-10 w-64 rounded-lg px-3 py-2 text-sm shadow-lg border ${
                darkMode ? 'bg-dark-700 text-white border-dark-500' : 'bg-white text-gray-900 border-gray-300'
              }`}
            />
          )}
        </div>

        <button className={`p-1.5 rounded transition ${darkMode ? 'hover:bg-dark-600 text-gray-300' : 'hover:bg-gray-200 text-gray-600'}`}>
          <MoreHorizontal size={16} />
        </button>

        {/* Board Menu */}
        <button
          onClick={() => setBoardMenuOpen(true)}
          title="Menu do quadro"
          className={`p-1.5 rounded transition ${darkMode ? 'hover:bg-dark-600 text-gray-300' : 'hover:bg-gray-200 text-gray-600'}`}
        >
          <Menu size={16} />
        </button>
      </div>

      {/* Board content */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-4 min-h-0">
        {view === 'kanban' ? (
          <KanbanBoard darkMode={darkMode} />
        ) : (
          <CalendarView darkMode={darkMode} />
        )}
      </div>

      {/* Card detail modal */}
      <CardDetailModal darkMode={darkMode} />

      {/* Board menu */}
      {boardMenuOpen && <BoardMenu darkMode={darkMode} />}
    </div>
  )
}
