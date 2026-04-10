// ======== TIPOS KANBAN (TRELLO-LIKE) ========

export type LabelColor = 'green' | 'yellow' | 'orange' | 'red' | 'purple' | 'blue'
export type CoverColor = 'green' | 'yellow' | 'orange' | 'red' | 'purple' | 'blue' | 'pink' | 'sky' | 'lime' | 'black'
export type CustomFieldType = 'text' | 'number' | 'checkbox' | 'dropdown' | 'date'
export type AutomationTrigger = 'card_moved_to_column' | 'card_created' | 'checklist_completed' | 'due_date_passed'
export type AutomationAction = 'add_label' | 'set_due_date_done' | 'move_to_column' | 'archive_card'

export interface KanbanLabel {
  id: string
  text: string
  color: LabelColor
}

export interface ChecklistItem {
  id: string
  text: string
  done: boolean
}

export interface Checklist {
  id: string
  title: string
  items: ChecklistItem[]
}

export interface CardComment {
  id: string
  author: string
  text: string
  createdAt: string
}

export interface CardAttachment {
  id: string
  name: string
  url: string
  type: string       // 'pdf' | 'image' | 'doc' | 'xls' | 'other'
  size: string       // ex: '2.4 MB'
  addedBy: string
  addedAt: string
}

export interface CustomField {
  id: string
  name: string
  type: CustomFieldType
  options?: string[]  // para dropdown
}

export interface CustomFieldValue {
  fieldId: string
  value: string  // checkbox: 'true'/'false'
}

export interface CardTemplate {
  id: string
  name: string
  description: string
  labels: KanbanLabel[]
  checklists: Checklist[]
  cover: string
}

export interface AutomationRule {
  id: string
  name: string
  trigger: { type: AutomationTrigger; columnId?: string }
  action: { type: AutomationAction; labelColor?: LabelColor; columnId?: string }
  enabled: boolean
}

export interface BoardActivity {
  id: string
  description: string
  actor: string
  timestamp: string
}

export interface KanbanCard {
  id: string
  title: string
  description: string
  labels: KanbanLabel[]
  members: string[]
  startDate: string
  dueDate: string
  dueDateDone: boolean
  checklists: Checklist[]
  comments: CardComment[]
  attachments: CardAttachment[]
  cover: string
  watched: boolean
  customFieldValues: CustomFieldValue[]
  archived: boolean
  position: number
  columnId: string
  createdAt: string
}

export interface KanbanColumn {
  id: string
  title: string
  cards: KanbanCard[]
  position: number
  color: string   // cor de destaque do cabeçalho
}

export interface KanbanBoard {
  id: string
  title: string
  columns: KanbanColumn[]
  members: string[]
  starred: boolean
  backgroundColor: string
  customFields: CustomField[]
  templates: CardTemplate[]
  automations: AutomationRule[]
  activity: BoardActivity[]
}
