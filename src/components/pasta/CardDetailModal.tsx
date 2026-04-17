import React, { useState, useEffect, useRef } from 'react'
import {
  X, CreditCard, AlignLeft, Tag, Users, Calendar, CheckSquare,
  MessageSquare, Archive, Trash2, Plus, MoreHorizontal, Paperclip,
  FileText, Image, FileSpreadsheet, File, Copy, ArrowRight, MonitorUp,
  Bell, BellOff, BookmarkPlus, Sliders
} from 'lucide-react'
import { usePastaStore } from './pastaStore'
import { KanbanCard, LabelColor, KanbanLabel, CardAttachment, CoverColor } from './types'

const FILE_ICONS: Record<string, React.ElementType> = {
  pdf: FileText,
  doc: FileText,
  image: Image,
  xls: FileSpreadsheet,
  other: File,
}

const FILE_COLORS: Record<string, string> = {
  pdf: 'text-red-500',
  doc: 'text-blue-500',
  image: 'text-green-500',
  xls: 'text-emerald-600',
  other: 'text-gray-400',
}

const LABEL_COLORS: Record<LabelColor, { bg: string; bgLight: string; text: string; border: string }> = {
  green:  { bg: 'bg-green-500',  bgLight: 'bg-green-100',  text: 'text-green-800', border: 'border-green-600' },
  yellow: { bg: 'bg-yellow-400', bgLight: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-500' },
  orange: { bg: 'bg-orange-500', bgLight: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-600' },
  red:    { bg: 'bg-red-500',    bgLight: 'bg-red-100',    text: 'text-red-800', border: 'border-red-600' },
  purple: { bg: 'bg-purple-500', bgLight: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-600' },
  blue:   { bg: 'bg-blue-500',   bgLight: 'bg-blue-100',   text: 'text-blue-800', border: 'border-blue-600' },
}

const COVER_OPTIONS: { color: CoverColor; bg: string }[] = [
  { color: 'green', bg: 'bg-green-500' },
  { color: 'yellow', bg: 'bg-yellow-400' },
  { color: 'orange', bg: 'bg-orange-500' },
  { color: 'red', bg: 'bg-red-500' },
  { color: 'purple', bg: 'bg-purple-500' },
  { color: 'blue', bg: 'bg-blue-500' },
  { color: 'pink', bg: 'bg-pink-500' },
  { color: 'sky', bg: 'bg-sky-400' },
  { color: 'lime', bg: 'bg-lime-500' },
  { color: 'black', bg: 'bg-gray-700' },
]

const ALL_LABEL_OPTIONS: { color: LabelColor; text: string }[] = [
  { color: 'green', text: 'Prioridade Baixa' },
  { color: 'yellow', text: 'Em Análise' },
  { color: 'orange', text: 'Atenção' },
  { color: 'red', text: 'Urgente' },
  { color: 'purple', text: 'Revisão' },
  { color: 'blue', text: 'Informação' },
]

export const CardDetailModal: React.FC<{ darkMode?: boolean }> = ({ darkMode }) => {
  const openCardId = usePastaStore((s) => s.openCardId)
  const setOpenCard = usePastaStore((s) => s.setOpenCard)
  const board = usePastaStore((s) => s.board)
  const updateCard = usePastaStore((s) => s.updateCard)
  const deleteCard = usePastaStore((s) => s.deleteCard)
  const archiveCard = usePastaStore((s) => s.archiveCard)
  const addComment = usePastaStore((s) => s.addComment)
  const addChecklist = usePastaStore((s) => s.addChecklist)
  const toggleChecklistItem = usePastaStore((s) => s.toggleChecklistItem)
  const addChecklistItem = usePastaStore((s) => s.addChecklistItem)
  const deleteChecklistItem = usePastaStore((s) => s.deleteChecklistItem)
  const addAttachment = usePastaStore((s) => s.addAttachment)
  const deleteAttachment = usePastaStore((s) => s.deleteAttachment)
  const copyCard = usePastaStore((s) => s.copyCard)
  const moveCard = usePastaStore((s) => s.moveCard)
  const toggleWatch = usePastaStore((s) => s.toggleWatch)
  const toggleDueDateDone = usePastaStore((s) => s.toggleDueDateDone)
  const setStartDateAction = usePastaStore((s) => s.setStartDate)
  const saveCardAsTemplate = usePastaStore((s) => s.saveCardAsTemplate)
  const setCustomFieldValue = usePastaStore((s) => s.setCustomFieldValue)
  const linkCardToProcess = usePastaStore((s) => s.linkCardToProcess)

  const [editingTitle, setEditingTitle] = useState(false)
  const [editingDesc, setEditingDesc] = useState(false)
  const [titleValue, setTitleValue] = useState('')
  const [descValue, setDescValue] = useState('')
  const [commentText, setCommentText] = useState('')
  const [showLabels, setShowLabels] = useState(false)
  const [showMembers, setShowMembers] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [dateValue, setDateValue] = useState('')
  const [showAddChecklist, setShowAddChecklist] = useState(false)
  const [newChecklistTitle, setNewChecklistTitle] = useState('Checklist')
  const [newItemTexts, setNewItemTexts] = useState<Record<string, string>>({})
  const [showCover, setShowCover] = useState(false)
  const [showMove, setShowMove] = useState(false)
  const [showCopy, setShowCopy] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showStartDate, setShowStartDate] = useState(false)
  const [startDateValue, setStartDateValue] = useState('')
  const [showSaveTemplate, setShowSaveTemplate] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [showLinkProcess, setShowLinkProcess] = useState(false)
  const [linkProcessType, setLinkProcessType] = useState<'federal' | 'estadual'>('federal')
  const [linkProcessSearch, setLinkProcessSearch] = useState('')
  const [linkProcessNumber, setLinkProcessNumber] = useState('')

  // Find card from board
  let card: KanbanCard | undefined
  let columnTitle = ''
  for (const col of board.columns) {
    const found = col.cards.find((c) => c.id === openCardId)
    if (found) { card = found; columnTitle = col.title; break }
  }

  useEffect(() => {
    if (card) {
      setTitleValue(card.title)
      setDescValue(card.description)
      setDateValue(card.dueDate)
      setStartDateValue(card.startDate || '')
    }
  }, [card?.id])

  if (!openCardId || !card) return null

  const cls = {
    overlay: 'fixed inset-0 z-50 flex items-start justify-center pt-12 pb-12 overflow-y-auto',
    bg: 'fixed inset-0 bg-black/60',
    modal: `relative w-full max-w-3xl rounded-xl shadow-2xl mx-4 ${darkMode ? 'bg-dark-800 text-gray-100' : 'bg-white text-gray-900'}`,
    section: 'mb-6',
    sectionTitle: `flex items-center gap-2 text-base font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`,
    sideBtn: `w-full text-left px-3 py-2 rounded text-sm flex items-center gap-2 transition ${
      darkMode ? 'bg-dark-600 hover:bg-dark-500 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
    }`,
  }

  const handleSaveTitle = () => {
    setEditingTitle(false)
    if (titleValue.trim() && titleValue !== card!.title) {
      updateCard(card!.id, { title: titleValue.trim() })
    }
  }

  const handleSaveDesc = () => {
    setEditingDesc(false)
    updateCard(card!.id, { description: descValue })
  }

  const handleToggleLabel = (lbl: { color: LabelColor; text: string }) => {
    const exists = card!.labels.find((l) => l.color === lbl.color)
    if (exists) {
      updateCard(card!.id, { labels: card!.labels.filter((l) => l.color !== lbl.color) })
    } else {
      const newLabel: KanbanLabel = { id: 'lbl-' + Date.now(), text: lbl.text, color: lbl.color }
      updateCard(card!.id, { labels: [...card!.labels, newLabel] })
    }
  }

  const handleToggleMember = (member: string) => {
    const exists = card!.members.includes(member)
    if (exists) {
      updateCard(card!.id, { members: card!.members.filter((m) => m !== member) })
    } else {
      updateCard(card!.id, { members: [...card!.members, member] })
    }
  }

  const handleSetDate = () => {
    updateCard(card!.id, { dueDate: dateValue })
    setShowDatePicker(false)
  }

  const handleAddComment = () => {
    if (commentText.trim()) {
      addComment(card!.id, 'Master', commentText.trim())
      setCommentText('')
    }
  }

  const handleAddChecklist = () => {
    if (newChecklistTitle.trim()) {
      addChecklist(card!.id, newChecklistTitle.trim())
      setNewChecklistTitle('Checklist')
      setShowAddChecklist(false)
    }
  }

  const handleDelete = () => {
    deleteCard(card!.id)
    setOpenCard(null)
  }

  const handleArchive = () => {
    archiveCard(card!.id)
    setOpenCard(null)
  }

  const handleSetCover = (color: string) => {
    updateCard(card!.id, { cover: color })
    setShowCover(false)
  }

  const handleRemoveCover = () => {
    updateCard(card!.id, { cover: '' })
    setShowCover(false)
  }

  const handleMoveCard = (toColumnId: string) => {
    const fromColumn = board.columns.find((col) => col.cards.some((c) => c.id === card!.id))
    if (fromColumn && fromColumn.id !== toColumnId) {
      moveCard(card!.id, fromColumn.id, toColumnId, 0)
    }
    setShowMove(false)
  }

  const handleCopyCard = (toColumnId: string) => {
    copyCard(card!.id, toColumnId)
    setShowCopy(false)
  }

  const closeAllPopups = () => {
    setShowLabels(false)
    setShowMembers(false)
    setShowDatePicker(false)
    setShowAddChecklist(false)
    setShowCover(false)
    setShowMove(false)
    setShowCopy(false)
    setShowStartDate(false)
    setShowSaveTemplate(false)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || !card) return
    Array.from(files).forEach((file) => {
      const ext = file.name.split('.').pop()?.toLowerCase() || ''
      let type = 'other'
      if (ext === 'pdf') type = 'pdf'
      else if (['doc', 'docx'].includes(ext)) type = 'doc'
      else if (['xls', 'xlsx', 'csv'].includes(ext)) type = 'xls'
      else if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext)) type = 'image'

      const sizeKB = file.size / 1024
      const size = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${Math.round(sizeKB)} KB`

      addAttachment(card!.id, {
        name: file.name,
        url: URL.createObjectURL(file),
        type,
        size,
        addedBy: 'Master',
      })
    })
    e.target.value = ''
  }

  return (
    <div className={cls.overlay}>
      <div className={cls.bg} onClick={() => setOpenCard(null)} />
      <div className={cls.modal}>
        {/* Watch */}
        <button
          onClick={() => toggleWatch(card.id)}
          title={card.watched ? 'Parar de acompanhar' : 'Acompanhar cartão'}
          className={`absolute top-3 right-10 p-1 rounded-full z-10 transition ${
            card.watched
              ? (darkMode ? 'text-blue-400 hover:bg-dark-600' : 'text-blue-600 hover:bg-gray-200')
              : (darkMode ? 'hover:bg-dark-600 text-gray-400' : 'hover:bg-gray-200 text-gray-500')
          }`}
        >
          {card.watched ? <Bell size={16} /> : <BellOff size={16} />}
        </button>
        {/* Close */}
        <button
          onClick={() => setOpenCard(null)}
          className={`absolute top-3 right-3 p-1 rounded-full z-10 ${darkMode ? 'hover:bg-dark-600 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}
        >
          <X size={20} />
        </button>

        {/* Cover bar */}
        {card.cover && (
          <div
            className={`h-20 rounded-t-xl cursor-pointer transition hover:opacity-90 ${
              COVER_OPTIONS.find((c) => c.color === card.cover)?.bg || 'bg-blue-500'
            }`}
            onClick={() => setShowCover(true)}
          />
        )}

        {/* Header / Labels cover */}
        {card.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 px-6 pt-4 pb-1">
            {card.labels.map((l) => (
              <span key={l.id} className={`${LABEL_COLORS[l.color].bg} text-white text-xs font-bold rounded px-3 py-1`}>
                {l.text}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 p-6">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <div className="flex items-start gap-2 mb-1">
              <CreditCard size={20} className={`mt-1 flex-shrink-0 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              {editingTitle ? (
                <input
                  autoFocus
                  value={titleValue}
                  onChange={(e) => setTitleValue(e.target.value)}
                  onBlur={handleSaveTitle}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                  className={`text-xl font-bold w-full rounded px-2 py-1 ${
                    darkMode ? 'bg-dark-600 text-white' : 'bg-gray-100 text-gray-900 border border-blue-500'
                  }`}
                />
              ) : (
                <h2
                  onClick={() => setEditingTitle(true)}
                  className="text-xl font-bold cursor-pointer hover:underline"
                >
                  {card.title}
                </h2>
              )}
            </div>
            <p className={`text-xs ml-7 mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              na lista <span className="underline">{columnTitle}</span>
            </p>

            {/* Members */}
            {card.members.length > 0 && (
              <div className="mb-4 ml-7">
                <span className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Membros</span>
                <div className="flex gap-1 mt-1">
                  {card.members.map((m) => (
                    <div
                      key={m}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                      }`}
                      title={m}
                    >
                      {m.charAt(0).toUpperCase()}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dates – start + due */}
            {(card.dueDate || card.startDate) && (
              <div className="mb-4 ml-7 flex flex-wrap gap-4">
                {card.startDate && (
                  <div>
                    <span className={`text-xs font-semibold uppercase tracking-wider block ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Data de início</span>
                    <p className={`text-sm mt-0.5 inline-flex items-center gap-1 rounded px-2 py-0.5 ${darkMode ? 'bg-dark-600 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
                      <Calendar size={14} />
                      {new Date(card.startDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}
                {card.dueDate && (
                  <div>
                    <span className={`text-xs font-semibold uppercase tracking-wider block ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Data de vencimento</span>
                    <button
                      onClick={() => toggleDueDateDone(card!.id)}
                      className={`text-sm mt-0.5 inline-flex items-center gap-1.5 rounded px-2 py-0.5 transition ${
                        card.dueDateDone
                          ? 'bg-green-500 text-white'
                          : new Date(card.dueDate) < new Date()
                            ? 'bg-red-500 text-white'
                            : darkMode ? 'bg-dark-600 text-gray-200' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={card.dueDateDone}
                        onChange={() => toggleDueDateDone(card!.id)}
                        className="w-3 h-3 rounded"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Calendar size={14} />
                      {new Date(card.dueDate).toLocaleDateString('pt-BR')}
                      {card.dueDateDone && <span className="text-xs font-bold ml-0.5">✓</span>}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Custom Fields */}
            {board.customFields.length > 0 && (
              <div className="mb-4 ml-7">
                <span className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1 mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Sliders size={12} /> Campos personalizados
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {board.customFields.map((field) => {
                    const val = card!.customFieldValues.find((v) => v.fieldId === field.id)?.value || ''
                    return (
                      <div key={field.id} className={`rounded-lg p-2 ${darkMode ? 'bg-dark-600' : 'bg-gray-50'}`}>
                        <label className={`text-[10px] font-semibold uppercase tracking-wide block mb-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          {field.name}
                        </label>
                        {field.type === 'checkbox' ? (
                          <input
                            type="checkbox"
                            checked={val === 'true'}
                            onChange={(e) => setCustomFieldValue(card!.id, field.id, e.target.checked ? 'true' : 'false')}
                            className="w-4 h-4 rounded cursor-pointer"
                          />
                        ) : field.type === 'dropdown' ? (
                          <select
                            value={val}
                            onChange={(e) => setCustomFieldValue(card!.id, field.id, e.target.value)}
                            className={`w-full text-xs rounded px-1.5 py-1 border ${darkMode ? 'bg-dark-700 text-white border-dark-500' : 'bg-white text-gray-900 border-gray-200'}`}
                          >
                            <option value="">—</option>
                            {field.options?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        ) : (
                          <input
                            type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
                            value={val}
                            onChange={(e) => setCustomFieldValue(card!.id, field.id, e.target.value)}
                            className={`w-full text-xs rounded px-1.5 py-1 border ${darkMode ? 'bg-dark-700 text-white border-dark-500 placeholder-gray-600' : 'bg-white text-gray-900 border-gray-200'}`}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Description */}
            <div className={cls.section}>
              <div className={cls.sectionTitle}>
                <AlignLeft size={18} /> Descrição
              </div>
              {editingDesc ? (
                <div className="ml-7">
                  <textarea
                    autoFocus
                    rows={4}
                    value={descValue}
                    onChange={(e) => setDescValue(e.target.value)}
                    className={`w-full rounded-lg p-3 text-sm resize-none ${
                      darkMode ? 'bg-dark-600 text-white border border-dark-400' : 'bg-gray-100 text-gray-900 border border-gray-300'
                    }`}
                  />
                  <div className="flex gap-2 mt-1">
                    <button onClick={handleSaveDesc} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">Salvar</button>
                    <button onClick={() => { setEditingDesc(false); setDescValue(card!.description) }} className={`px-3 py-1 rounded text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Cancelar</button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setEditingDesc(true)}
                  className={`ml-7 text-sm rounded-lg p-3 cursor-pointer min-h-[60px] ${
                    card.description
                      ? (darkMode ? 'text-gray-200' : 'text-gray-700')
                      : (darkMode ? 'bg-dark-600 text-gray-400' : 'bg-gray-100 text-gray-400')
                  }`}
                >
                  {card.description || 'Adicionar uma descrição mais detalhada...'}
                </div>
              )}
            </div>

            {/* Checklists */}
            {card.checklists.map((cl) => {
              const done = cl.items.filter((i) => i.done).length
              const total = cl.items.length
              const pct = total > 0 ? Math.round((done / total) * 100) : 0

              return (
                <div key={cl.id} className={cls.section}>
                  <div className={cls.sectionTitle}>
                    <CheckSquare size={18} /> {cl.title}
                  </div>
                  <div className="ml-7">
                    {/* Progress bar */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs w-8 text-right ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{pct}%</span>
                      <div className={`flex-1 h-2 rounded-full overflow-hidden ${darkMode ? 'bg-dark-600' : 'bg-gray-200'}`}>
                        <div
                          className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Items */}
                    {cl.items.map((item) => (
                      <div key={item.id} className={`flex items-center gap-2 py-1 group ${item.done ? 'opacity-60' : ''}`}>
                        <input
                          type="checkbox"
                          checked={item.done}
                          onChange={() => toggleChecklistItem(card!.id, cl.id, item.id)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                        />
                        <span className={`flex-1 text-sm ${item.done ? 'line-through' : ''} ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          {item.text}
                        </span>
                        <button
                          onClick={() => deleteChecklistItem(card!.id, cl.id, item.id)}
                          className={`opacity-0 group-hover:opacity-100 transition p-0.5 rounded ${darkMode ? 'hover:bg-dark-500 text-gray-400' : 'hover:bg-gray-200 text-gray-400'}`}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}

                    {/* Add item */}
                    <div className="mt-2">
                      <input
                        value={newItemTexts[cl.id] || ''}
                        onChange={(e) => setNewItemTexts({ ...newItemTexts, [cl.id]: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && (newItemTexts[cl.id] || '').trim()) {
                            addChecklistItem(card!.id, cl.id, newItemTexts[cl.id].trim())
                            setNewItemTexts({ ...newItemTexts, [cl.id]: '' })
                          }
                        }}
                        placeholder="Adicionar um item..."
                        className={`w-full text-sm rounded px-2 py-1.5 ${
                          darkMode ? 'bg-dark-600 text-white border border-dark-500 placeholder-gray-500' : 'bg-gray-50 text-gray-900 border border-gray-200 placeholder-gray-400'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Attachments */}
            {card.attachments.length > 0 && (
              <div className={cls.section}>
                <div className={cls.sectionTitle}>
                  <Paperclip size={18} /> Anexos
                </div>
                <div className="ml-7 space-y-2">
                  {card.attachments.map((att) => {
                    const IconComp = FILE_ICONS[att.type] || FILE_ICONS.other
                    const iconColor = FILE_COLORS[att.type] || FILE_COLORS.other
                    return (
                      <div
                        key={att.id}
                        className={`flex items-center gap-3 rounded-lg p-2.5 group ${
                          darkMode ? 'bg-dark-600 hover:bg-dark-500' : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          darkMode ? 'bg-dark-700' : 'bg-gray-200'
                        }`}>
                          <IconComp size={20} className={iconColor} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <a
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-sm font-medium truncate block hover:underline ${
                              darkMode ? 'text-blue-400' : 'text-blue-600'
                            }`}
                          >
                            {att.name}
                          </a>
                          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            {att.size} • Adicionado por {att.addedBy} em {att.addedAt}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteAttachment(card!.id, att.id)}
                          className={`opacity-0 group-hover:opacity-100 transition p-1 rounded ${
                            darkMode ? 'hover:bg-dark-400 text-gray-400' : 'hover:bg-gray-200 text-gray-400'
                          }`}
                          title="Remover anexo"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.jpg,.jpeg,.png,.gif,.webp,.bmp,.txt,.rtf"
            />

            {/* Comments / Activity */}
            <div className={cls.section}>
              <div className={cls.sectionTitle}>
                <MessageSquare size={18} /> Atividade
              </div>
              <div className="ml-7">
                {/* Add comment */}
                <div className="flex gap-2 mb-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                  }`}>M</div>
                  <div className="flex-1">
                    <textarea
                      rows={2}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment() }
                      }}
                      placeholder="Escreva um comentário..."
                      className={`w-full text-sm rounded-lg p-2 resize-none ${
                        darkMode ? 'bg-dark-600 text-white border border-dark-500' : 'bg-gray-50 text-gray-900 border border-gray-200'
                      }`}
                    />
                    {commentText.trim() && (
                      <button onClick={handleAddComment} className="bg-blue-600 text-white px-3 py-1 rounded text-sm mt-1 hover:bg-blue-700">
                        Salvar
                      </button>
                    )}
                  </div>
                </div>

                {/* Existing comments */}
                {card.comments.map((cmt) => (
                  <div key={cmt.id} className="flex gap-2 mb-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      darkMode ? 'bg-purple-600 text-white' : 'bg-purple-500 text-white'
                    }`}>{cmt.author.charAt(0).toUpperCase()}</div>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className={`text-sm font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{cmt.author}</span>
                        <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{cmt.createdAt}</span>
                      </div>
                      <p className={`text-sm mt-0.5 rounded-lg p-2 ${
                        darkMode ? 'bg-dark-600 text-gray-200' : 'bg-gray-100 text-gray-700'
                      }`}>{cmt.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar actions */}
          <div className="w-full md:w-44 flex-shrink-0 space-y-2">
            <span className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Adicionar ao cartão
            </span>

            {/* Labels */}
            <div className="relative">
              <button onClick={() => { closeAllPopups(); setShowLabels(!showLabels) }} className={cls.sideBtn}>
                <Tag size={14} /> Etiquetas
              </button>
              {showLabels && (
                <div className={`absolute left-0 top-full mt-1 z-30 w-64 rounded-lg shadow-lg border p-3 ${
                  darkMode ? 'bg-dark-700 border-dark-600' : 'bg-white border-gray-200'
                }`}>
                  <p className={`text-xs font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Etiquetas</p>
                  {ALL_LABEL_OPTIONS.map((opt) => {
                    const active = card!.labels.some((l) => l.color === opt.color)
                    return (
                      <button
                        key={opt.color}
                        onClick={() => handleToggleLabel(opt)}
                        className={`w-full flex items-center gap-2 mb-1 rounded px-2 py-1.5 text-sm text-left ${
                          active
                            ? `${LABEL_COLORS[opt.color].bg} text-white font-bold`
                            : `${LABEL_COLORS[opt.color].bgLight} ${LABEL_COLORS[opt.color].text}`
                        }`}
                      >
                        {opt.text}
                        {active && <span className="ml-auto">✓</span>}
                      </button>
                    )
                  })}
                  <button onClick={() => setShowLabels(false)} className={`mt-2 w-full text-center text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Fechar</button>
                </div>
              )}
            </div>

            {/* Members */}
            <div className="relative">
              <button onClick={() => { closeAllPopups(); setShowMembers(!showMembers) }} className={cls.sideBtn}>
                <Users size={14} /> Membros
              </button>
              {showMembers && (
                <div className={`absolute left-0 top-full mt-1 z-30 w-56 rounded-lg shadow-lg border p-3 ${
                  darkMode ? 'bg-dark-700 border-dark-600' : 'bg-white border-gray-200'
                }`}>
                  <p className={`text-xs font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Membros do quadro</p>
                  {board.members.map((m) => {
                    const active = card!.members.includes(m)
                    return (
                      <button
                        key={m}
                        onClick={() => handleToggleMember(m)}
                        className={`w-full flex items-center gap-2 mb-1 rounded px-2 py-1.5 text-sm text-left ${
                          darkMode ? 'hover:bg-dark-600 text-gray-200' : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                        }`}>{m.charAt(0).toUpperCase()}</div>
                        {m}
                        {active && <span className="ml-auto text-blue-500">✓</span>}
                      </button>
                    )
                  })}
                  <button onClick={() => setShowMembers(false)} className={`mt-2 w-full text-center text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Fechar</button>
                </div>
              )}
            </div>

            {/* Checklist */}
            <div className="relative">
              <button onClick={() => { closeAllPopups(); setShowAddChecklist(!showAddChecklist) }} className={cls.sideBtn}>
                <CheckSquare size={14} /> Checklist
              </button>
              {showAddChecklist && (
                <div className={`absolute left-0 top-full mt-1 z-30 w-56 rounded-lg shadow-lg border p-3 ${
                  darkMode ? 'bg-dark-700 border-dark-600' : 'bg-white border-gray-200'
                }`}>
                  <p className={`text-xs font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Adicionar checklist</p>
                  <input
                    autoFocus
                    value={newChecklistTitle}
                    onChange={(e) => setNewChecklistTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddChecklist()}
                    className={`w-full text-sm rounded px-2 py-1.5 mb-2 ${
                      darkMode ? 'bg-dark-600 text-white border border-dark-500' : 'bg-white text-gray-900 border border-gray-300'
                    }`}
                  />
                  <button onClick={handleAddChecklist} className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm w-full hover:bg-blue-700">
                    Adicionar
                  </button>
                </div>
              )}
            </div>

            {/* Due Date */}
            <div className="relative">
              <button onClick={() => { closeAllPopups(); setShowDatePicker(!showDatePicker) }} className={cls.sideBtn}>
                <Calendar size={14} /> Data
              </button>
              {showDatePicker && (
                <div className={`absolute left-0 top-full mt-1 z-30 w-56 rounded-lg shadow-lg border p-3 ${
                  darkMode ? 'bg-dark-700 border-dark-600' : 'bg-white border-gray-200'
                }`}>
                  <p className={`text-xs font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Data de vencimento</p>
                  <input
                    type="date"
                    value={dateValue}
                    onChange={(e) => setDateValue(e.target.value)}
                    className={`w-full text-sm rounded px-2 py-1.5 mb-2 ${
                      darkMode ? 'bg-dark-600 text-white border border-dark-500' : 'bg-white text-gray-900 border border-gray-300'
                    }`}
                  />
                  <div className="flex gap-2">
                    <button onClick={handleSetDate} className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm flex-1 hover:bg-blue-700">Salvar</button>
                    <button
                      onClick={() => { updateCard(card!.id, { dueDate: '' }); setDateValue(''); setShowDatePicker(false) }}
                      className={`px-3 py-1.5 rounded text-sm ${darkMode ? 'bg-dark-600 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
                    >Remover</button>
                  </div>
                </div>
              )}
            </div>

            {/* Start Date */}
            <div className="relative">
              <button onClick={() => { closeAllPopups(); setShowStartDate(!showStartDate) }} className={cls.sideBtn}>
                <Calendar size={14} /> Data início
              </button>
              {showStartDate && (
                <div className={`absolute left-0 top-full mt-1 z-30 w-56 rounded-lg shadow-lg border p-3 ${
                  darkMode ? 'bg-dark-700 border-dark-600' : 'bg-white border-gray-200'
                }`}>
                  <p className={`text-xs font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Data de início</p>
                  <input
                    type="date"
                    value={startDateValue}
                    onChange={(e) => setStartDateValue(e.target.value)}
                    className={`w-full text-sm rounded px-2 py-1.5 mb-2 ${
                      darkMode ? 'bg-dark-600 text-white border border-dark-500' : 'bg-white text-gray-900 border border-gray-300'
                    }`}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setStartDateAction(card!.id, startDateValue); setShowStartDate(false) }}
                      className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm flex-1 hover:bg-blue-700"
                    >Salvar</button>
                    <button
                      onClick={() => { setStartDateAction(card!.id, ''); setStartDateValue(''); setShowStartDate(false) }}
                      className={`px-3 py-1.5 rounded text-sm ${darkMode ? 'bg-dark-600 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
                    >Remover</button>
                  </div>
                </div>
              )}
            </div>

            {/* Attachment button */}
            <button onClick={() => fileInputRef.current?.click()} className={cls.sideBtn}>
              <Paperclip size={14} /> Anexo
            </button>

            {/* Watch */}
            <button
              onClick={() => toggleWatch(card!.id)}
              className={`${cls.sideBtn} ${card.watched ? (darkMode ? '!text-blue-400' : '!text-blue-600') : ''}`}
            >
              {card.watched ? <Bell size={14} /> : <BellOff size={14} />}
              {card.watched ? 'Acompanhando' : 'Acompanhar'}
            </button>

            {/* Cover */}
            <div className="relative">
              <button onClick={() => { closeAllPopups(); setShowCover(true) }} className={cls.sideBtn}>
                <MonitorUp size={14} /> Capa
              </button>
              {showCover && (
                <div className={`absolute left-0 top-full mt-1 z-30 w-64 rounded-lg shadow-lg border p-3 ${
                  darkMode ? 'bg-dark-700 border-dark-600' : 'bg-white border-gray-200'
                }`}>
                  <p className={`text-xs font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Cor da capa</p>
                  <div className="grid grid-cols-5 gap-1.5">
                    {COVER_OPTIONS.map((opt) => (
                      <button
                        key={opt.color}
                        onClick={() => handleSetCover(opt.color)}
                        className={`h-8 rounded ${opt.bg} transition hover:opacity-80 ${
                          card!.cover === opt.color ? 'ring-2 ring-white ring-offset-1' : ''
                        }`}
                      />
                    ))}
                  </div>
                  {card!.cover && (
                    <button
                      onClick={handleRemoveCover}
                      className={`mt-2 w-full text-center text-xs py-1 rounded ${
                        darkMode ? 'bg-dark-600 text-gray-300 hover:bg-dark-500' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Remover capa
                    </button>
                  )}
                  <button onClick={() => setShowCover(false)} className={`mt-1 w-full text-center text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Fechar</button>
                </div>
              )}
            </div>

            <div className="border-t my-3 border-opacity-20" style={{ borderColor: darkMode ? '#555' : '#ddd' }} />

            <span className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Ações
            </span>

            {/* Move */}
            <div className="relative">
              <button onClick={() => { closeAllPopups(); setShowMove(true) }} className={cls.sideBtn}>
                <ArrowRight size={14} /> Mover
              </button>
              {showMove && (
                <div className={`absolute left-0 top-full mt-1 z-30 w-56 rounded-lg shadow-lg border p-3 ${
                  darkMode ? 'bg-dark-700 border-dark-600' : 'bg-white border-gray-200'
                }`}>
                  <p className={`text-xs font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Mover para lista</p>
                  {board.columns.map((col) => {
                    const isCurrent = col.cards.some((c) => c.id === card!.id)
                    return (
                      <button
                        key={col.id}
                        onClick={() => handleMoveCard(col.id)}
                        disabled={isCurrent}
                        className={`w-full text-left px-3 py-1.5 rounded text-sm mb-0.5 ${
                          isCurrent
                            ? (darkMode ? 'bg-dark-500 text-gray-400 cursor-default' : 'bg-gray-200 text-gray-400 cursor-default')
                            : (darkMode ? 'hover:bg-dark-600 text-gray-200' : 'hover:bg-gray-100 text-gray-700')
                        }`}
                      >
                        {col.title} {isCurrent && '(atual)'}
                      </button>
                    )
                  })}
                  <button onClick={() => setShowMove(false)} className={`mt-2 w-full text-center text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Fechar</button>
                </div>
              )}
            </div>

            {/* Copy */}
            <div className="relative">
              <button onClick={() => { closeAllPopups(); setShowCopy(true) }} className={cls.sideBtn}>
                <Copy size={14} /> Copiar
              </button>
              {showCopy && (
                <div className={`absolute left-0 top-full mt-1 z-30 w-56 rounded-lg shadow-lg border p-3 ${
                  darkMode ? 'bg-dark-700 border-dark-600' : 'bg-white border-gray-200'
                }`}>
                  <p className={`text-xs font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Copiar para lista</p>
                  {board.columns.map((col) => (
                    <button
                      key={col.id}
                      onClick={() => handleCopyCard(col.id)}
                      className={`w-full text-left px-3 py-1.5 rounded text-sm mb-0.5 ${
                        darkMode ? 'hover:bg-dark-600 text-gray-200' : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {col.title}
                    </button>
                  ))}
                  <button onClick={() => setShowCopy(false)} className={`mt-2 w-full text-center text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Fechar</button>
                </div>
              )}
            </div>

            {/* Save as template */}
            <div className="relative">
              <button onClick={() => { closeAllPopups(); setShowSaveTemplate(!showSaveTemplate) }} className={cls.sideBtn}>
                <BookmarkPlus size={14} /> Salvar como modelo
              </button>
              {showSaveTemplate && (
                <div className={`absolute left-0 top-full mt-1 z-30 w-56 rounded-lg shadow-lg border p-3 ${
                  darkMode ? 'bg-dark-700 border-dark-600' : 'bg-white border-gray-200'
                }`}>
                  <p className={`text-xs font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Nome do modelo</p>
                  <input
                    autoFocus
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder={card!.title}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const nm = templateName.trim() || card!.title
                        saveCardAsTemplate(card!.id, nm)
                        setTemplateName(''); setShowSaveTemplate(false)
                      }
                    }}
                    className={`w-full text-sm rounded px-2 py-1.5 mb-2 ${
                      darkMode ? 'bg-dark-600 text-white border border-dark-500' : 'bg-white text-gray-900 border border-gray-300'
                    }`}
                  />
                  <button
                    onClick={() => {
                      const nm = templateName.trim() || card!.title
                      saveCardAsTemplate(card!.id, nm)
                      setTemplateName(''); setShowSaveTemplate(false)
                    }}
                    className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm w-full hover:bg-blue-700"
                  >
                    Salvar modelo
                  </button>
                </div>
              )}
            </div>

            {/* Link to Process */}
            <div className="relative">
              <button onClick={() => { closeAllPopups(); setShowLinkProcess(!showLinkProcess) }} className={cls.sideBtn}>
                <Sliders size={14} /> Vincular a Processo
              </button>
              {showLinkProcess && (
                <div className={`absolute left-0 top-full mt-1 z-30 w-72 rounded-lg shadow-lg border p-3 ${
                  darkMode ? 'bg-dark-700 border-dark-600' : 'bg-white border-gray-200'
                }`}>
                  <p className={`text-xs font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Vincular a Processo</p>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setLinkProcessType('federal')}
                        className={`flex-1 px-2 py-1 rounded text-xs font-medium transition ${
                          linkProcessType === 'federal'
                            ? 'bg-blue-600 text-white'
                            : darkMode ? 'bg-dark-600 text-gray-300 hover:bg-dark-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Federal
                      </button>
                      <button
                        onClick={() => setLinkProcessType('estadual')}
                        className={`flex-1 px-2 py-1 rounded text-xs font-medium transition ${
                          linkProcessType === 'estadual'
                            ? 'bg-blue-600 text-white'
                            : darkMode ? 'bg-dark-600 text-gray-300 hover:bg-dark-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Estadual
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Nº do processo ou cliente"
                      value={linkProcessNumber}
                      onChange={(e) => setLinkProcessNumber(e.target.value)}
                      className={`w-full text-xs rounded px-2 py-1.5 ${
                        darkMode ? 'bg-dark-600 text-white border border-dark-500' : 'bg-white text-gray-900 border border-gray-300'
                      }`}
                    />
                    <button
                      onClick={() => {
                        if (linkProcessNumber.trim()) {
                          linkCardToProcess(card!.id, linkProcessNumber, linkProcessType)
                          setShowLinkProcess(false)
                          setLinkProcessNumber('')
                        }
                      }}
                      className="bg-green-600 text-white px-3 py-1.5 rounded text-xs w-full hover:bg-green-700 font-medium"
                    >
                      Vincular
                    </button>
                  </div>

                  {card!.linkedProcessId && (
                    <div className={`p-2 rounded text-xs ${darkMode ? 'bg-dark-600' : 'bg-blue-50'}`}>
                      <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                        <strong>Vinculado:</strong> Processo {card!.linkedProcessType?.toUpperCase()} #{card!.linkedProcessId}
                      </p>
                      <button
                        onClick={() => {
                          linkCardToProcess(card!.id, '', 'federal')
                          setShowLinkProcess(false)
                        }}
                        className={`text-xs mt-1 text-red-500 hover:text-red-600 font-medium`}
                      >
                        Desvincular
                      </button>
                    </div>
                  )}

                  <button onClick={() => setShowLinkProcess(false)} className={`mt-2 w-full text-center text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Fechar</button>
                </div>
              )}
            </div>

            <button onClick={handleArchive} className={cls.sideBtn}>
              <Archive size={14} /> Arquivar
            </button>

            <button
              onClick={handleDelete}
              className={`w-full text-left px-3 py-2 rounded text-sm flex items-center gap-2 transition text-red-500 ${
                darkMode ? 'bg-dark-600 hover:bg-red-900/30' : 'bg-gray-100 hover:bg-red-50'
              }`}
            >
              <Trash2 size={14} /> Excluir
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
