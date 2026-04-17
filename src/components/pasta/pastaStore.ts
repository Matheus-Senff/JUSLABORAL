import create from 'zustand'
import { mockBoard } from './data'
import {
  KanbanBoard, KanbanCard, KanbanColumn, CardComment, Checklist, ChecklistItem,
  CardAttachment, CustomField, CardTemplate, AutomationRule, BoardActivity, LabelColor
} from './types'

export interface FilterState {
  labels: LabelColor[]
  members: string[]
  dueDateFilter: 'all' | 'overdue' | 'next7days' | 'nodate' | 'hasdate'
  hasChecklist: boolean
  hasAttachment: boolean
}

const defaultFilterState: FilterState = {
  labels: [],
  members: [],
  dueDateFilter: 'all',
  hasChecklist: false,
  hasAttachment: false,
}

export function applyFilters(cards: KanbanCard[], filters: FilterState): KanbanCard[] {
  return cards.filter((card) => {
    if (filters.labels.length > 0 && !filters.labels.some((l) => card.labels.some((cl) => cl.color === l))) return false
    if (filters.members.length > 0 && !filters.members.some((m) => card.members.includes(m))) return false
    if (filters.dueDateFilter === 'overdue') {
      if (!card.dueDate || new Date(card.dueDate) >= new Date()) return false
    } else if (filters.dueDateFilter === 'next7days') {
      if (!card.dueDate) return false
      const d = new Date(card.dueDate); const now = new Date(); const week = new Date(now.getTime() + 7 * 86400000)
      if (d < now || d > week) return false
    } else if (filters.dueDateFilter === 'nodate') {
      if (card.dueDate) return false
    } else if (filters.dueDateFilter === 'hasdate') {
      if (!card.dueDate) return false
    }
    if (filters.hasChecklist && card.checklists.length === 0) return false
    if (filters.hasAttachment && card.attachments.length === 0) return false
    return true
  })
}

interface PastaState {
  board: KanbanBoard
  openCardId: string | null
  searchFilter: string
  view: 'kanban' | 'calendar'
  filterState: FilterState
  boardMenuOpen: boolean

  // Board
  setBoardTitle: (title: string) => void
  toggleStarred: () => void
  setBoardBackground: (bg: string) => void

  // Columns
  addColumn: (title: string) => void
  updateColumnTitle: (columnId: string, title: string) => void
  deleteColumn: (columnId: string) => void
  moveColumn: (fromIndex: number, toIndex: number) => void
  setColumnColor: (columnId: string, color: string) => void
  sortColumn: (columnId: string, by: 'name' | 'dueDate' | 'members') => void

  // Cards
  addCard: (columnId: string, title: string) => void
  updateCard: (cardId: string, updates: Partial<KanbanCard>) => void
  deleteCard: (cardId: string) => void
  archiveCard: (cardId: string) => void
  restoreCard: (cardId: string) => void
  moveCard: (cardId: string, fromColumnId: string, toColumnId: string, newPosition: number) => void
  copyCard: (cardId: string, toColumnId: string) => void
  toggleWatch: (cardId: string) => void
  toggleDueDateDone: (cardId: string) => void
  setStartDate: (cardId: string, date: string) => void

  // Card details
  addComment: (cardId: string, author: string, text: string) => void
  addChecklist: (cardId: string, title: string) => void
  toggleChecklistItem: (cardId: string, checklistId: string, itemId: string) => void
  addChecklistItem: (cardId: string, checklistId: string, text: string) => void
  deleteChecklistItem: (cardId: string, checklistId: string, itemId: string) => void

  // Attachments
  addAttachment: (cardId: string, attachment: Omit<CardAttachment, 'id' | 'addedAt'>) => void
  deleteAttachment: (cardId: string, attachmentId: string) => void

  // Custom Fields
  addCustomField: (field: Omit<CustomField, 'id'>) => void
  updateCustomField: (fieldId: string, updates: Partial<CustomField>) => void
  deleteCustomField: (fieldId: string) => void
  setCustomFieldValue: (cardId: string, fieldId: string, value: string) => void

  // Templates
  saveCardAsTemplate: (cardId: string, name: string) => void
  createCardFromTemplate: (columnId: string, templateId: string) => void
  deleteTemplate: (templateId: string) => void

  // Automations
  addAutomation: (rule: Omit<AutomationRule, 'id'>) => void
  toggleAutomation: (ruleId: string) => void
  deleteAutomation: (ruleId: string) => void

  // Process Link
  linkCardToProcess: (cardId: string, processId: string, processType: 'federal' | 'estadual') => void

  // Activity
  addBoardActivity: (description: string, actor: string) => void

  // UI
  setOpenCard: (cardId: string | null) => void
  setSearchFilter: (filter: string) => void
  setView: (view: 'kanban' | 'calendar') => void
  setBoardMenuOpen: (open: boolean) => void
  setFilterState: (updates: Partial<FilterState>) => void
  clearFilters: () => void

  // Data sync
  setBoard: (board: KanbanBoard) => void
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

function mapColumns(columns: KanbanColumn[], fn: (col: KanbanColumn) => KanbanColumn): KanbanColumn[] {
  return columns.map(fn)
}

function mapCards(columns: KanbanColumn[], cardId: string, fn: (card: KanbanCard) => KanbanCard): KanbanColumn[] {
  return mapColumns(columns, (col) => ({
    ...col,
    cards: col.cards.map((c) => (c.id === cardId ? fn(c) : c))
  }))
}

export const usePastaStore = create<PastaState>((set) => ({
  board: mockBoard,
  openCardId: null,
  searchFilter: '',
  view: 'kanban',
  filterState: defaultFilterState,
  boardMenuOpen: false,

  setBoardTitle: (title) =>
    set((s) => ({ board: { ...s.board, title } })),

  toggleStarred: () =>
    set((s) => ({ board: { ...s.board, starred: !s.board.starred } })),

  setBoardBackground: (backgroundColor) =>
    set((s) => ({ board: { ...s.board, backgroundColor } })),

  addColumn: (title) =>
    set((s) => {
      const newCol: KanbanColumn = {
        id: 'col-' + uid(),
        title,
        position: s.board.columns.length,
        color: '',
        cards: []
      }
      return { board: { ...s.board, columns: [...s.board.columns, newCol] } }
    }),

  updateColumnTitle: (columnId, title) =>
    set((s) => ({
      board: {
        ...s.board,
        columns: mapColumns(s.board.columns, (col) =>
          col.id === columnId ? { ...col, title } : col
        )
      }
    })),

  deleteColumn: (columnId) =>
    set((s) => ({
      board: {
        ...s.board,
        columns: s.board.columns.filter((col) => col.id !== columnId)
      }
    })),

  moveColumn: (fromIndex, toIndex) =>
    set((s) => {
      const cols = [...s.board.columns]
      const [moved] = cols.splice(fromIndex, 1)
      cols.splice(toIndex, 0, moved)
      return { board: { ...s.board, columns: cols.map((c, i) => ({ ...c, position: i })) } }
    }),

  setColumnColor: (columnId, color) =>
    set((s) => ({
      board: {
        ...s.board,
        columns: mapColumns(s.board.columns, (col) => col.id === columnId ? { ...col, color } : col)
      }
    })),

  sortColumn: (columnId, by) =>
    set((s) => ({
      board: {
        ...s.board,
        columns: mapColumns(s.board.columns, (col) => {
          if (col.id !== columnId) return col
          const sorted = [...col.cards].sort((a, b) => {
            if (by === 'name') return a.title.localeCompare(b.title)
            if (by === 'dueDate') {
              if (!a.dueDate && !b.dueDate) return 0
              if (!a.dueDate) return 1
              if (!b.dueDate) return -1
              return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
            }
            if (by === 'members') return b.members.length - a.members.length
            return 0
          }).map((c, i) => ({ ...c, position: i }))
          return { ...col, cards: sorted }
        })
      }
    })),

  addCard: (columnId, title) =>
    set((s) => {
      const newCard: KanbanCard = {
        id: 'card-' + uid(),
        title,
        description: '',
        labels: [],
        members: [],
        startDate: '',
        dueDate: '',
        dueDateDone: false,
        checklists: [],
        comments: [],
        attachments: [],
        cover: '',
        watched: false,
        customFieldValues: [],
        archived: false,
        position: 0,
        columnId,
        createdAt: new Date().toLocaleDateString('pt-BR')
      }
      return {
        board: {
          ...s.board,
          columns: mapColumns(s.board.columns, (col) => {
            if (col.id !== columnId) return col
            const cards = [newCard, ...col.cards].map((c, i) => ({ ...c, position: i }))
            return { ...col, cards }
          })
        }
      }
    }),

  updateCard: (cardId, updates) =>
    set((s) => ({
      board: { ...s.board, columns: mapCards(s.board.columns, cardId, (c) => ({ ...c, ...updates })) }
    })),

  deleteCard: (cardId) =>
    set((s) => ({
      board: {
        ...s.board,
        columns: mapColumns(s.board.columns, (col) => ({
          ...col,
          cards: col.cards.filter((c) => c.id !== cardId)
        }))
      }
    })),

  archiveCard: (cardId) =>
    set((s) => ({
      board: { ...s.board, columns: mapCards(s.board.columns, cardId, (c) => ({ ...c, archived: true })) }
    })),

  restoreCard: (cardId) =>
    set((s) => ({
      board: { ...s.board, columns: mapCards(s.board.columns, cardId, (c) => ({ ...c, archived: false })) }
    })),

  moveCard: (cardId, fromColumnId, toColumnId, newPosition) =>
    set((s) => {
      let card: KanbanCard | undefined
      const withoutCard = mapColumns(s.board.columns, (col) => {
        if (col.id !== fromColumnId) return col
        const found = col.cards.find((c) => c.id === cardId)
        if (found) card = { ...found, columnId: toColumnId }
        return { ...col, cards: col.cards.filter((c) => c.id !== cardId) }
      })
      if (!card) return {}
      let withCard = mapColumns(withoutCard, (col) => {
        if (col.id !== toColumnId) return col
        const cards = [...col.cards]
        cards.splice(newPosition, 0, card!)
        return { ...col, cards: cards.map((c, i) => ({ ...c, position: i })) }
      })
      // Run automations for card_moved_to_column
      const autos = s.board.automations.filter(
        (a) => a.enabled && a.trigger.type === 'card_moved_to_column' && a.trigger.columnId === toColumnId
      )
      if (autos.length > 0 && card) {
        const LABELS: Record<string, string> = { green: 'Prioridade Baixa', yellow: 'Em Análise', orange: 'Atenção', red: 'Urgente', purple: 'Revisão', blue: 'Informação' }
        withCard = mapCards(withCard, card.id, (c) => {
          let u = { ...c }
          for (const a of autos) {
            if (a.action.type === 'set_due_date_done') u = { ...u, dueDateDone: true }
            else if (a.action.type === 'add_label' && a.action.labelColor) {
              if (!u.labels.some((l) => l.color === a.action.labelColor))
                u = { ...u, labels: [...u.labels, { id: 'al-' + uid(), text: LABELS[a.action.labelColor!] || '', color: a.action.labelColor! }] }
            } else if (a.action.type === 'archive_card') u = { ...u, archived: true }
          }
          return u
        })
      }
      const act: BoardActivity = { id: 'act-' + uid(), description: `moveu "${card.title}"`, actor: 'Master', timestamp: new Date().toLocaleString('pt-BR') }
      return { board: { ...s.board, columns: withCard, activity: [act, ...s.board.activity].slice(0, 100) } }
    }),

  copyCard: (cardId, toColumnId) =>
    set((s) => {
      let original: KanbanCard | undefined
      for (const col of s.board.columns) {
        const found = col.cards.find((c) => c.id === cardId)
        if (found) { original = found; break }
      }
      if (!original) return {}
      const copy: KanbanCard = {
        ...original,
        id: 'card-' + uid(),
        title: original.title + ' (cópia)',
        columnId: toColumnId,
        position: 0,
        comments: [],
        watched: false,
        createdAt: new Date().toLocaleDateString('pt-BR'),
      }
      return {
        board: {
          ...s.board,
          columns: mapColumns(s.board.columns, (col) => {
            if (col.id !== toColumnId) return col
            const cards = [copy, ...col.cards].map((c, i) => ({ ...c, position: i }))
            return { ...col, cards }
          })
        }
      }
    }),

  toggleWatch: (cardId) =>
    set((s) => ({
      board: { ...s.board, columns: mapCards(s.board.columns, cardId, (c) => ({ ...c, watched: !c.watched })) }
    })),

  toggleDueDateDone: (cardId) =>
    set((s) => ({
      board: { ...s.board, columns: mapCards(s.board.columns, cardId, (c) => ({ ...c, dueDateDone: !c.dueDateDone })) }
    })),

  setStartDate: (cardId, date) =>
    set((s) => ({
      board: { ...s.board, columns: mapCards(s.board.columns, cardId, (c) => ({ ...c, startDate: date })) }
    })),

  addComment: (cardId, author, text) =>
    set((s) => {
      const comment: CardComment = {
        id: 'cmt-' + uid(),
        author,
        text,
        createdAt: new Date().toLocaleString('pt-BR')
      }
      return {
        board: {
          ...s.board,
          columns: mapCards(s.board.columns, cardId, (c) => ({
            ...c,
            comments: [...c.comments, comment]
          }))
        }
      }
    }),

  addChecklist: (cardId, title) =>
    set((s) => {
      const checklist: Checklist = { id: 'cl-' + uid(), title, items: [] }
      return {
        board: {
          ...s.board,
          columns: mapCards(s.board.columns, cardId, (c) => ({
            ...c,
            checklists: [...c.checklists, checklist]
          }))
        }
      }
    }),

  toggleChecklistItem: (cardId, checklistId, itemId) =>
    set((s) => ({
      board: {
        ...s.board,
        columns: mapCards(s.board.columns, cardId, (c) => ({
          ...c,
          checklists: c.checklists.map((cl) =>
            cl.id !== checklistId
              ? cl
              : { ...cl, items: cl.items.map((it) => (it.id !== itemId ? it : { ...it, done: !it.done })) }
          )
        }))
      }
    })),

  addChecklistItem: (cardId, checklistId, text) =>
    set((s) => {
      const item: ChecklistItem = { id: 'cli-' + uid(), text, done: false }
      return {
        board: {
          ...s.board,
          columns: mapCards(s.board.columns, cardId, (c) => ({
            ...c,
            checklists: c.checklists.map((cl) =>
              cl.id !== checklistId ? cl : { ...cl, items: [...cl.items, item] }
            )
          }))
        }
      }
    }),

  deleteChecklistItem: (cardId, checklistId, itemId) =>
    set((s) => ({
      board: {
        ...s.board,
        columns: mapCards(s.board.columns, cardId, (c) => ({
          ...c,
          checklists: c.checklists.map((cl) =>
            cl.id !== checklistId ? cl : { ...cl, items: cl.items.filter((it) => it.id !== itemId) }
          )
        }))
      }
    })),

  addAttachment: (cardId, attachment) =>
    set((s) => {
      const att: CardAttachment = { ...attachment, id: 'att-' + uid(), addedAt: new Date().toLocaleString('pt-BR') }
      return {
        board: {
          ...s.board,
          columns: mapCards(s.board.columns, cardId, (c) => ({
            ...c,
            attachments: [...c.attachments, att]
          }))
        }
      }
    }),

  deleteAttachment: (cardId, attachmentId) =>
    set((s) => ({
      board: {
        ...s.board,
        columns: mapCards(s.board.columns, cardId, (c) => ({
          ...c,
          attachments: c.attachments.filter((a) => a.id !== attachmentId)
        }))
      }
    })),

  // ───── Custom Fields ─────
  addCustomField: (field) =>
    set((s) => ({ board: { ...s.board, customFields: [...s.board.customFields, { ...field, id: 'cf-' + uid() }] } })),

  updateCustomField: (fieldId, updates) =>
    set((s) => ({
      board: { ...s.board, customFields: s.board.customFields.map((f) => f.id === fieldId ? { ...f, ...updates } : f) }
    })),

  deleteCustomField: (fieldId) =>
    set((s) => ({ board: { ...s.board, customFields: s.board.customFields.filter((f) => f.id !== fieldId) } })),

  setCustomFieldValue: (cardId, fieldId, value) =>
    set((s) => ({
      board: {
        ...s.board,
        columns: mapCards(s.board.columns, cardId, (c) => {
          const existing = c.customFieldValues.find((v) => v.fieldId === fieldId)
          const updated = existing
            ? c.customFieldValues.map((v) => v.fieldId === fieldId ? { ...v, value } : v)
            : [...c.customFieldValues, { fieldId, value }]
          return { ...c, customFieldValues: updated }
        })
      }
    })),

  // ───── Templates ─────
  saveCardAsTemplate: (cardId, name) =>
    set((s) => {
      let card: KanbanCard | undefined
      for (const col of s.board.columns) { const f = col.cards.find((c) => c.id === cardId); if (f) { card = f; break } }
      if (!card) return {}
      const tpl: CardTemplate = { id: 'tpl-' + uid(), name, description: card.description, labels: card.labels, checklists: card.checklists, cover: card.cover }
      return { board: { ...s.board, templates: [...s.board.templates, tpl] } }
    }),

  createCardFromTemplate: (columnId, templateId) =>
    set((s) => {
      const tpl = s.board.templates.find((t) => t.id === templateId)
      if (!tpl) return {}
      const newCard: KanbanCard = {
        id: 'card-' + uid(), title: tpl.name, description: tpl.description,
        labels: tpl.labels.map((l) => ({ ...l, id: 'lbl-' + uid() })),
        members: [], startDate: '', dueDate: '', dueDateDone: false,
        checklists: tpl.checklists.map((cl) => ({ ...cl, id: 'cl-' + uid(), items: cl.items.map((i) => ({ ...i, id: 'cli-' + uid() })) })),
        comments: [], attachments: [], cover: tpl.cover, watched: false,
        customFieldValues: [], archived: false, position: 0, columnId,
        createdAt: new Date().toLocaleDateString('pt-BR')
      }
      return {
        board: {
          ...s.board,
          columns: mapColumns(s.board.columns, (col) => {
            if (col.id !== columnId) return col
            return { ...col, cards: [newCard, ...col.cards].map((c, i) => ({ ...c, position: i })) }
          })
        }
      }
    }),

  deleteTemplate: (templateId) =>
    set((s) => ({ board: { ...s.board, templates: s.board.templates.filter((t) => t.id !== templateId) } })),

  // ───── Automations ─────
  addAutomation: (rule) =>
    set((s) => ({ board: { ...s.board, automations: [...s.board.automations, { ...rule, id: 'auto-' + uid() }] } })),

  toggleAutomation: (ruleId) =>
    set((s) => ({
      board: { ...s.board, automations: s.board.automations.map((a) => a.id === ruleId ? { ...a, enabled: !a.enabled } : a) }
    })),

  deleteAutomation: (ruleId) =>
    set((s) => ({ board: { ...s.board, automations: s.board.automations.filter((a) => a.id !== ruleId) } })),

  // ───── Process Link ─────
  linkCardToProcess: (cardId, processId, processType) =>
    set((s) => ({
      board: {
        ...s.board,
        columns: mapCards(s.board.columns, cardId, (card) => ({
          ...card,
          linkedProcessId: processId,
          linkedProcessType: processType
        }))
      }
    })),

  // ───── Activity ─────
  addBoardActivity: (description, actor) =>
    set((s) => {
      const act: BoardActivity = { id: 'act-' + uid(), description, actor, timestamp: new Date().toLocaleString('pt-BR') }
      return { board: { ...s.board, activity: [act, ...s.board.activity].slice(0, 100) } }
    }),

  setOpenCard: (cardId) => set({ openCardId: cardId }),
  setSearchFilter: (filter) => set({ searchFilter: filter }),
  setView: (view) => set({ view }),
  setBoardMenuOpen: (open) => set({ boardMenuOpen: open }),
  setFilterState: (updates) => set((s) => ({ filterState: { ...s.filterState, ...updates } })),
  clearFilters: () => set({ filterState: defaultFilterState }),
  setBoard: (board) => set({ board })
}))
