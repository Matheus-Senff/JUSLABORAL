import React, { useState } from 'react'
import { Plus, MoreHorizontal, X, Calendar, MessageSquare, CheckSquare, Paperclip, Pencil, Bell, Palette, ArrowDownUp, BookmarkPlus } from 'lucide-react'
import { usePastaStore, applyFilters } from './pastaStore'
import { KanbanCard as KanbanCardType, KanbanColumn as KanbanColumnType, LabelColor } from './types'

const LABEL_COLORS: Record<LabelColor, { bg: string; bgLight: string; text: string }> = {
  green:  { bg: 'bg-green-500',  bgLight: 'bg-green-100', text: 'text-green-800' },
  yellow: { bg: 'bg-yellow-400', bgLight: 'bg-yellow-100', text: 'text-yellow-800' },
  orange: { bg: 'bg-orange-500', bgLight: 'bg-orange-100', text: 'text-orange-800' },
  red:    { bg: 'bg-red-500',    bgLight: 'bg-red-100',   text: 'text-red-800' },
  purple: { bg: 'bg-purple-500', bgLight: 'bg-purple-100', text: 'text-purple-800' },
  blue:   { bg: 'bg-blue-500',   bgLight: 'bg-blue-100',  text: 'text-blue-800' },
}

const COVER_COLORS: Record<string, string> = {
  green: 'bg-green-500', yellow: 'bg-yellow-400', orange: 'bg-orange-500', red: 'bg-red-500',
  purple: 'bg-purple-500', blue: 'bg-blue-500', pink: 'bg-pink-500', sky: 'bg-sky-400',
  lime: 'bg-lime-500', black: 'bg-gray-700',
}

const COL_COLOR_HEX: Record<string, string> = {
  orange: '#f97316', blue: '#3b82f6', yellow: '#facc15', green: '#22c55e',
  red: '#ef4444', purple: '#a855f7', pink: '#ec4899', sky: '#38bdf8',
}

// ======== KANBAN CARD ========
const KanbanCardComponent: React.FC<{ card: KanbanCardType; darkMode?: boolean }> = ({ card, darkMode }) => {
  const setOpenCard = usePastaStore((s) => s.setOpenCard)
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [quickEdit, setQuickEdit] = useState(false)
  const [quickTitle, setQuickTitle] = useState(card.title)
  const updateCard = usePastaStore((s) => s.updateCard)

  const totalChecks = card.checklists.reduce((s, cl) => s + cl.items.length, 0)
  const doneChecks = card.checklists.reduce((s, cl) => s + cl.items.filter((i) => i.done).length, 0)
  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date()

  const handleQuickSave = () => {
    setQuickEdit(false)
    if (quickTitle.trim() && quickTitle !== card.title) {
      updateCard(card.id, { title: quickTitle.trim() })
    }
  }

  if (quickEdit) {
    return (
      <div className={`rounded-lg mb-2 shadow-sm border ${
        darkMode ? 'bg-dark-700 border-blue-500' : 'bg-white border-blue-500'
      }`}>
        <textarea
          autoFocus
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          onBlur={handleQuickSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleQuickSave() }
            if (e.key === 'Escape') { setQuickEdit(false); setQuickTitle(card.title) }
          }}
          rows={2}
          className={`w-full rounded-lg p-2.5 text-sm resize-none border-0 outline-none ${
            darkMode ? 'bg-dark-700 text-white' : 'bg-white text-gray-900'
          }`}
        />
        <div className="px-2 pb-2">
          <button onClick={handleQuickSave} className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-blue-700">
            Salvar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setOpenCard(card.id)}
      className={`group rounded-lg mb-2 cursor-grab active:cursor-grabbing border transition-all duration-150 ${
        darkMode
          ? 'bg-dark-700 border-dark-600 hover:border-dark-400 shadow-sm hover:shadow-md'
          : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md'
      } ${isDragging ? (darkMode ? 'opacity-50 border-blue-500 shadow-lg' : 'opacity-50 border-blue-500 shadow-lg') : ''}`}
      style={{ position: 'relative' }}
    >
      {/* Cover color strip */}
      {card.cover && COVER_COLORS[card.cover] && (
        <div className={`${COVER_COLORS[card.cover]} h-8 rounded-t-lg`} />
      )}

      {/* Drag handle indicator */}
      {isHovered && (
        <div className={`absolute left-1 top-${card.cover ? '10' : '2'} z-10 flex flex-col gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity`}>
          <div className={`w-0.5 h-0.5 rounded-full ${darkMode ? 'bg-gray-400' : 'bg-gray-500'}`} />
          <div className={`w-0.5 h-0.5 rounded-full ${darkMode ? 'bg-gray-400' : 'bg-gray-500'}`} />
          <div className={`w-0.5 h-0.5 rounded-full ${darkMode ? 'bg-gray-400' : 'bg-gray-500'}`} />
        </div>
      )}

      {/* Pencil quick-edit button */}
      {isHovered && (
        <button
          onClick={(e) => { e.stopPropagation(); setQuickEdit(true); setQuickTitle(card.title) }}
          className={`absolute top-${card.cover ? '10' : '1'} right-1 z-10 p-1 rounded-full transition-opacity ${
            darkMode
              ? 'bg-dark-600 hover:bg-dark-500 text-gray-300'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-500'
          }`}
          title="Edição rápida"
        >
          <Pencil size={14} />
        </button>
      )}

      <div className="p-2.5">
        {/* Labels */}
        {card.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1.5">
            {card.labels.map((label) => (
              <span
                key={label.id}
                className={`${LABEL_COLORS[label.color].bg} text-white text-[10px] font-semibold rounded-sm px-2 py-[1px] min-w-[36px] text-center leading-4`}
                title={label.text}
              >
                {label.text}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <p className={`text-[13px] leading-5 ${darkMode ? 'text-gray-100' : 'text-gray-800'} pr-5`}>
          {card.title}
        </p>

        {/* Badges row */}
        {(card.dueDate || card.description || card.comments.length > 0 || totalChecks > 0 || card.attachments.length > 0 || card.members.length > 0) && (
          <div className="flex items-center gap-2.5 mt-2 flex-wrap">
            {card.dueDate && (
              <span className={`inline-flex items-center gap-1 text-[11px] rounded-sm px-1.5 py-0.5 font-medium ${
                card.dueDateDone
                  ? 'bg-green-500/90 text-white'
                  : isOverdue
                    ? 'bg-red-500/90 text-white'
                    : darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <Calendar size={12} />
                {new Date(card.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
              </span>
            )}

            {card.watched && (
              <span className={`inline-flex items-center ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} title="Acompanhando">
                <Bell size={11} />
              </span>
            )}

            {card.description && (
              <span className={`text-[13px] leading-none ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} title="Tem descrição">
                ≡
              </span>
            )}

            {card.comments.length > 0 && (
              <span className={`inline-flex items-center gap-0.5 text-[11px] ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <MessageSquare size={12} /> {card.comments.length}
              </span>
            )}

            {totalChecks > 0 && (
              <span className={`inline-flex items-center gap-0.5 text-[11px] rounded-sm px-1 py-0.5 font-medium ${
                doneChecks === totalChecks
                  ? 'bg-green-500/90 text-white'
                  : darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <CheckSquare size={12} /> {doneChecks}/{totalChecks}
              </span>
            )}

            {card.attachments.length > 0 && (
              <span className={`inline-flex items-center gap-0.5 text-[11px] ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <Paperclip size={12} /> {card.attachments.length}
              </span>
            )}

            {/* Members avatars - pushed right */}
            {card.members.length > 0 && (
              <div className="flex -space-x-1.5 ml-auto">
                {card.members.slice(0, 3).map((m) => (
                  <div
                    key={m}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ring-2 ${
                      darkMode ? 'bg-blue-600 text-white ring-dark-700' : 'bg-blue-500 text-white ring-white'
                    }`}
                    title={m}
                  >
                    {m.charAt(0).toUpperCase()}
                  </div>
                ))}
                {card.members.length > 3 && (
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ring-2 ${
                    darkMode ? 'bg-dark-500 text-gray-300 ring-dark-700' : 'bg-gray-200 text-gray-600 ring-white'
                  }`}>
                    +{card.members.length - 3}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ======== KANBAN COLUMN ========
const KanbanColumnComponent: React.FC<{
  column: KanbanColumnType
  darkMode?: boolean
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, columnId: string) => void
}> = ({ column, darkMode, onDragOver, onDrop }) => {
  const [addingCard, setAddingCard] = useState(false)
  const [newCardTitle, setNewCardTitle] = useState('')
  const [editingTitle, setEditingTitle] = useState(false)
  const [colTitle, setColTitle] = useState(column.title)
  const [showMenu, setShowMenu] = useState(false)
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [isDragOverColumn, setIsDragOverColumn] = useState(false)

  const addCard = usePastaStore((s) => s.addCard)
  const updateColumnTitle = usePastaStore((s) => s.updateColumnTitle)
  const deleteColumn = usePastaStore((s) => s.deleteColumn)
  const sortColumn = usePastaStore((s) => s.sortColumn)
  const setColumnColor = usePastaStore((s) => s.setColumnColor)
  const createCardFromTemplate = usePastaStore((s) => s.createCardFromTemplate)
  const board = usePastaStore((s) => s.board)

  const handleAddCard = () => {
    if (newCardTitle.trim()) {
      addCard(column.id, newCardTitle.trim())
      setNewCardTitle('')
      setAddingCard(false)
    }
  }

  const handleTitleBlur = () => {
    setEditingTitle(false)
    if (colTitle.trim() && colTitle !== column.title) {
      updateColumnTitle(column.id, colTitle.trim())
    }
  }

  const visibleCards = column.cards.filter((c) => !c.archived)

  return (
    <div
      className={`flex-shrink-0 w-72 rounded-xl flex flex-col max-h-full transition-all ${
        darkMode ? 'bg-dark-800' : 'bg-gray-100'
      } ${isDragOverColumn ? (darkMode ? 'ring-2 ring-green-500 bg-dark-700' : 'ring-2 ring-green-500 bg-green-50') : ''}`}
      style={{ borderTop: column.color ? `4px solid ${COL_COLOR_HEX[column.color] || '#888'}` : undefined }}
      onDragOver={(e) => {
        onDragOver(e)
        setIsDragOverColumn(true)
      }}
      onDragLeave={() => setIsDragOverColumn(false)}
      onDrop={(e) => {
        onDrop(e, column.id)
        setIsDragOverColumn(false)
      }}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-3 pt-3 pb-1">
        {editingTitle ? (
          <input
            autoFocus
            value={colTitle}
            onChange={(e) => setColTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={(e) => e.key === 'Enter' && handleTitleBlur()}
            className={`text-sm font-bold w-full rounded px-1 py-0.5 ${
              darkMode ? 'bg-dark-600 text-white' : 'bg-white text-gray-900 border border-blue-500'
            }`}
          />
        ) : (
          <h3
            onClick={() => setEditingTitle(true)}
            className={`text-sm font-bold cursor-pointer ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}
          >
            {column.title}
            <span className={`ml-2 text-xs font-normal ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {visibleCards.length}
            </span>
          </h3>
        )}

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className={`p-1 rounded hover:bg-opacity-20 ${darkMode ? 'hover:bg-white text-gray-400' : 'hover:bg-gray-300 text-gray-500'}`}
          >
            <MoreHorizontal size={16} />
          </button>
          {showMenu && (
            <div className={`absolute right-0 top-8 z-30 w-52 rounded-lg shadow-lg border py-1 ${
              darkMode ? 'bg-dark-700 border-dark-600' : 'bg-white border-gray-200'
            }`}>
              <button
                onClick={() => { setAddingCard(true); setShowMenu(false) }}
                className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${darkMode ? 'text-gray-200 hover:bg-dark-600' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <Plus size={13} /> Adicionar cartão
              </button>
              {board.templates.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => { setShowTemplates(!showTemplates); setShowSortMenu(false); setShowColorPicker(false) }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 justify-between ${
                      darkMode ? 'text-gray-200 hover:bg-dark-600' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="flex items-center gap-2"><BookmarkPlus size={13} /> Criar de modelo</span>
                    <span className="text-xs">›</span>
                  </button>
                  {showTemplates && (
                    <div className={`absolute left-full top-0 ml-1 w-52 rounded-lg shadow-lg border py-1 ${
                      darkMode ? 'bg-dark-700 border-dark-600' : 'bg-white border-gray-200'
                    }`}>
                      {board.templates.map((tpl) => (
                        <button
                          key={tpl.id}
                          onClick={() => { createCardFromTemplate(column.id, tpl.id); setShowMenu(false); setShowTemplates(false) }}
                          className={`w-full text-left px-4 py-2 text-sm ${darkMode ? 'text-gray-200 hover:bg-dark-600' : 'text-gray-700 hover:bg-gray-100'}`}
                        >
                          {tpl.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div className={`border-t my-1 ${darkMode ? 'border-dark-600' : 'border-gray-100'}`} />
              {/* Sort */}
              <div className="relative">
                <button
                  onClick={() => { setShowSortMenu(!showSortMenu); setShowColorPicker(false); setShowTemplates(false) }}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 justify-between ${
                    darkMode ? 'text-gray-200 hover:bg-dark-600' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="flex items-center gap-2"><ArrowDownUp size={13} /> Ordenar por</span>
                  <span className="text-xs">›</span>
                </button>
                {showSortMenu && (
                  <div className={`absolute left-full top-0 ml-1 w-44 rounded-lg shadow-lg border py-1 ${
                    darkMode ? 'bg-dark-700 border-dark-600' : 'bg-white border-gray-200'
                  }`}>
                    {(['name', 'dueDate', 'members'] as const).map((k) => (
                      <button
                        key={k}
                        onClick={() => { sortColumn(column.id, k); setShowSortMenu(false); setShowMenu(false) }}
                        className={`w-full text-left px-4 py-2 text-sm ${darkMode ? 'text-gray-200 hover:bg-dark-600' : 'text-gray-700 hover:bg-gray-100'}`}
                      >
                        {k === 'name' ? 'Nome (A-Z)' : k === 'dueDate' ? 'Data de vencimento' : 'Número de membros'}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Column color */}
              <div className="relative">
                <button
                  onClick={() => { setShowColorPicker(!showColorPicker); setShowSortMenu(false); setShowTemplates(false) }}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 justify-between ${
                    darkMode ? 'text-gray-200 hover:bg-dark-600' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="flex items-center gap-2"><Palette size={13} /> Cor da lista</span>
                  <span className="text-xs">›</span>
                </button>
                {showColorPicker && (
                  <div className={`absolute left-full top-0 ml-1 w-44 rounded-lg shadow-lg border p-2 ${
                    darkMode ? 'bg-dark-700 border-dark-600' : 'bg-white border-gray-200'
                  }`}>
                    <div className="grid grid-cols-4 gap-1.5 mb-1.5">
                      {Object.entries(COL_COLOR_HEX).map(([name, hex]) => (
                        <button
                          key={name}
                          onClick={() => { setColumnColor(column.id, name); setShowColorPicker(false); setShowMenu(false) }}
                          className="w-8 h-8 rounded-full transition hover:scale-110"
                          style={{ backgroundColor: hex, outline: column.color === name ? '2px solid white' : 'none', outlineOffset: '2px' }}
                          title={name}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => { setColumnColor(column.id, ''); setShowColorPicker(false); setShowMenu(false) }}
                      className={`w-full text-xs py-1 rounded ${darkMode ? 'bg-dark-600 text-gray-300 hover:bg-dark-500' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      Remover cor
                    </button>
                  </div>
                )}
              </div>
              <div className={`border-t my-1 ${darkMode ? 'border-dark-600' : 'border-gray-100'}`} />
              <button
                onClick={() => { deleteColumn(column.id); setShowMenu(false) }}
                className={`w-full text-left px-4 py-2 text-sm text-red-500 ${
                  darkMode ? 'hover:bg-red-900/20' : 'hover:bg-red-50'
                }`}
              >
                Excluir lista
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-0 relative kanban-cards-scroll max-h-[calc(100vh-300px)]">
        {visibleCards.length === 0 && (
          <div className={`absolute inset-0 flex items-center justify-center text-center pointer-events-none ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            <p className="text-xs">Arraste cards aqui</p>
          </div>
        )}
        {visibleCards.map((card) => (
          <div
            key={card.id}
            draggable
            onDragStart={(e) => {
              e.stopPropagation()
              e.dataTransfer.setData('dragType', 'card')
              e.dataTransfer.setData('cardId', card.id)
              e.dataTransfer.setData('fromColumnId', column.id)
              e.dataTransfer.effectAllowed = 'move'
            }}
            onDragEnd={(e) => {
              e.stopPropagation()
              e.preventDefault()
            }}
          >
            <KanbanCardComponent card={card} darkMode={darkMode} />
          </div>
        ))}
      </div>

      {/* Add card */}
      {addingCard ? (
        <div className="px-2 pb-2">
          <textarea
            autoFocus
            rows={2}
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddCard() }
              if (e.key === 'Escape') setAddingCard(false)
            }}
            placeholder="Insira um título para este cartão..."
            className={`w-full rounded-lg p-2 text-sm resize-none ${
              darkMode ? 'bg-dark-700 text-white border border-dark-500' : 'bg-white text-gray-900 border border-gray-300'
            }`}
          />
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={handleAddCard}
              className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-700"
            >
              Adicionar cartão
            </button>
            <button onClick={() => setAddingCard(false)} className={`p-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <X size={20} />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAddingCard(true)}
          className={`flex items-center gap-2 w-full px-3 py-2 text-sm rounded-b-xl transition ${
            darkMode ? 'text-gray-300 hover:bg-dark-700' : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Plus size={16} /> Adicionar um cartão
        </button>
      )}
    </div>
  )
}

// ======== KANBAN BOARD ========
export const KanbanBoard: React.FC<{ darkMode?: boolean }> = ({ darkMode }) => {
  const board = usePastaStore((s) => s.board)
  const addColumn = usePastaStore((s) => s.addColumn)
  const moveCard = usePastaStore((s) => s.moveCard)
  const moveColumn = usePastaStore((s) => s.moveColumn)
  const searchFilter = usePastaStore((s) => s.searchFilter)
  const filterState = usePastaStore((s) => s.filterState)

  const [addingColumn, setAddingColumn] = useState(false)
  const [newColumnTitle, setNewColumnTitle] = useState('')
  const [draggingColId, setDraggingColId] = useState<string | null>(null)
  const [dragOverColId, setDragOverColId] = useState<string | null>(null)

  const handleAddColumn = () => {
    if (newColumnTitle.trim()) {
      addColumn(newColumnTitle.trim())
      setNewColumnTitle('')
      setAddingColumn(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, toColumnId: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    const dragType = e.dataTransfer.getData('dragType')
    
    if (dragType === 'column') {
      const draggedColId = e.dataTransfer.getData('columnId')
      if (draggedColId && draggedColId !== toColumnId) {
        const fromIdx = board.columns.findIndex((c) => c.id === draggedColId)
        const toIdx = board.columns.findIndex((c) => c.id === toColumnId)
        if (fromIdx !== -1 && toIdx !== -1) moveColumn(fromIdx, toIdx)
        setDraggingColId(null)
        setDragOverColId(null)
      }
    } else if (dragType === 'card') {
      const cardId = e.dataTransfer.getData('cardId')
      const fromColumnId = e.dataTransfer.getData('fromColumnId')
      if (cardId && fromColumnId) {
        moveCard(cardId, fromColumnId, toColumnId, 0)
      }
    }
  }

  const hasActiveFilters = filterState.labels.length > 0 || filterState.members.length > 0 ||
    filterState.dueDateFilter !== 'all' || filterState.hasChecklist || filterState.hasAttachment

  const filteredColumns = board.columns.map((col) => {
    let cards = col.cards
    if (searchFilter) {
      cards = cards.filter((c) =>
        c.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
        c.labels.some((l) => l.text.toLowerCase().includes(searchFilter.toLowerCase())) ||
        c.members.some((m) => m.toLowerCase().includes(searchFilter.toLowerCase()))
      )
    }
    if (hasActiveFilters) cards = applyFilters(cards, filterState)
    return { ...col, cards }
  })



  return (
    <div className="flex gap-3 overflow-x-auto pb-4 items-start flex-1 min-h-0">
      {filteredColumns.map((column, idx) => (
        <div
          key={column.id}
          draggable
          onDragStart={(e) => {
            if ((e.target as HTMLElement).closest('[draggable]') === e.currentTarget) {
              e.dataTransfer.setData('dragType', 'column')
              e.dataTransfer.setData('columnId', column.id)
              e.dataTransfer.effectAllowed = 'move'
              setDraggingColId(column.id)
            }
          }}
          onDragEnd={() => { setDraggingColId(null); setDragOverColId(null) }}
          onDragEnter={() => setDragOverColId(column.id)}
          onDragLeave={() => setDragOverColId(null)}
          className={`transition-opacity ${
            draggingColId === column.id ? 'opacity-40' : 'opacity-100'
          } ${
            dragOverColId === column.id && draggingColId !== column.id
              ? (darkMode ? 'ring-2 ring-blue-400 rounded-xl' : 'ring-2 ring-blue-500 rounded-xl')
              : ''
          }`}
        >
          <KanbanColumnComponent
            column={column}
            darkMode={darkMode}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />
        </div>
      ))}

      {/* Add column button */}
      {addingColumn ? (
        <div className={`flex-shrink-0 w-72 rounded-xl p-2 ${darkMode ? 'bg-dark-800' : 'bg-gray-100'}`}>
          <input
            autoFocus
            value={newColumnTitle}
            onChange={(e) => setNewColumnTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddColumn()
              if (e.key === 'Escape') setAddingColumn(false)
            }}
            placeholder="Insira o título da lista..."
            className={`w-full rounded px-3 py-2 text-sm ${
              darkMode ? 'bg-dark-700 text-white border border-dark-500' : 'bg-white text-gray-900 border border-gray-300'
            }`}
          />
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={handleAddColumn}
              className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-700"
            >
              Adicionar lista
            </button>
            <button onClick={() => setAddingColumn(false)} className={`p-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <X size={20} />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAddingColumn(true)}
          className={`flex-shrink-0 w-72 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition ${
            darkMode
              ? 'bg-white/10 text-white hover:bg-white/20'
              : 'bg-gray-200/70 text-gray-700 hover:bg-gray-300/70'
          }`}
        >
          <Plus size={16} /> Adicionar outra lista
        </button>
      )}
    </div>
  )
}
