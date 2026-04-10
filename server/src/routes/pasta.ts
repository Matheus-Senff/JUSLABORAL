import { Router, Request, Response } from 'express'

const router = Router()

// ======== In-memory Kanban board (mock persistence) ========

interface KanbanLabel { id: string; text: string; color: string }
interface ChecklistItem { id: string; text: string; done: boolean }
interface Checklist { id: string; title: string; items: ChecklistItem[] }
interface CardComment { id: string; author: string; text: string; createdAt: string }
interface CardAttachment { id: string; name: string; url: string; type: string; size: string; addedBy: string; addedAt: string }
interface KanbanCard {
  id: string; title: string; description: string; labels: KanbanLabel[]
  members: string[]; dueDate: string; checklists: Checklist[]
  comments: CardComment[]; attachments: CardAttachment[]; archived: boolean; position: number
  columnId: string; createdAt: string
}
interface KanbanColumn { id: string; title: string; cards: KanbanCard[]; position: number }
interface KanbanBoard { id: string; title: string; columns: KanbanColumn[]; members: string[]; starred: boolean }

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7) }

const board: KanbanBoard = {
  id: 'board-1',
  title: 'Quadro de Documentos',
  starred: false,
  members: ['Ana Silva', 'Lucas Mendes', 'Bia Costa', 'Carlos Ramos'],
  columns: []
}

// ======== Board ========
router.get('/board', (_req: Request, res: Response) => {
  res.json(board)
})

router.patch('/board', (req: Request, res: Response) => {
  const { title, starred } = req.body
  if (title !== undefined) board.title = String(title)
  if (starred !== undefined) board.starred = Boolean(starred)
  res.json(board)
})

// ======== Columns ========
router.post('/columns', (req: Request, res: Response) => {
  const { title } = req.body
  if (!title) return res.status(400).json({ error: 'title é obrigatório' })
  const col: KanbanColumn = { id: 'col-' + uid(), title: String(title), position: board.columns.length, cards: [] }
  board.columns.push(col)
  res.status(201).json(col)
})

router.patch('/columns/:id', (req: Request, res: Response) => {
  const col = board.columns.find((c) => c.id === req.params.id)
  if (!col) return res.status(404).json({ error: 'Coluna não encontrada' })
  const { title } = req.body
  if (title !== undefined) col.title = String(title)
  res.json(col)
})

router.delete('/columns/:id', (req: Request, res: Response) => {
  const idx = board.columns.findIndex((c) => c.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Coluna não encontrada' })
  board.columns.splice(idx, 1)
  board.columns.forEach((c, i) => { c.position = i })
  res.status(204).send()
})

// ======== Cards ========
router.post('/columns/:colId/cards', (req: Request, res: Response) => {
  const col = board.columns.find((c) => c.id === req.params.colId)
  if (!col) return res.status(404).json({ error: 'Coluna não encontrada' })
  const { title } = req.body
  if (!title) return res.status(400).json({ error: 'title é obrigatório' })
  const card: KanbanCard = {
    id: 'card-' + uid(), title: String(title), description: '', labels: [],
    members: [], dueDate: '', checklists: [], comments: [], attachments: [],
    archived: false, position: col.cards.length,
    columnId: col.id, createdAt: new Date().toLocaleDateString('pt-BR')
  }
  col.cards.push(card)
  res.status(201).json(card)
})

router.patch('/cards/:id', (req: Request, res: Response) => {
  for (const col of board.columns) {
    const card = col.cards.find((c) => c.id === req.params.id)
    if (card) {
      const { title, description, labels, members, dueDate, archived } = req.body
      if (title !== undefined) card.title = String(title)
      if (description !== undefined) card.description = String(description)
      if (labels !== undefined) card.labels = labels
      if (members !== undefined) card.members = members
      if (dueDate !== undefined) card.dueDate = String(dueDate)
      if (archived !== undefined) card.archived = Boolean(archived)
      return res.json(card)
    }
  }
  res.status(404).json({ error: 'Cartão não encontrado' })
})

router.delete('/cards/:id', (req: Request, res: Response) => {
  for (const col of board.columns) {
    const idx = col.cards.findIndex((c) => c.id === req.params.id)
    if (idx !== -1) {
      col.cards.splice(idx, 1)
      col.cards.forEach((c, i) => { c.position = i })
      return res.status(204).send()
    }
  }
  res.status(404).json({ error: 'Cartão não encontrado' })
})

// Move card between columns
router.post('/cards/:id/move', (req: Request, res: Response) => {
  const { toColumnId, position } = req.body
  const toCol = board.columns.find((c) => c.id === toColumnId)
  if (!toCol) return res.status(404).json({ error: 'Coluna destino não encontrada' })

  let card: KanbanCard | undefined
  for (const col of board.columns) {
    const idx = col.cards.findIndex((c) => c.id === req.params.id)
    if (idx !== -1) {
      card = col.cards.splice(idx, 1)[0]
      break
    }
  }
  if (!card) return res.status(404).json({ error: 'Cartão não encontrado' })

  card.columnId = toColumnId
  const pos = Math.min(Math.max(0, position ?? toCol.cards.length), toCol.cards.length)
  toCol.cards.splice(pos, 0, card)
  toCol.cards.forEach((c, i) => { c.position = i })
  res.json(card)
})

// ======== Comments ========
router.post('/cards/:id/comments', (req: Request, res: Response) => {
  const { author, text } = req.body
  if (!text) return res.status(400).json({ error: 'text é obrigatório' })
  for (const col of board.columns) {
    const card = col.cards.find((c) => c.id === req.params.id)
    if (card) {
      const comment: CardComment = { id: 'cmt-' + uid(), author: String(author || 'Anônimo'), text: String(text), createdAt: new Date().toLocaleString('pt-BR') }
      card.comments.push(comment)
      return res.status(201).json(comment)
    }
  }
  res.status(404).json({ error: 'Cartão não encontrado' })
})

// ======== Checklists ========
router.post('/cards/:id/checklists', (req: Request, res: Response) => {
  const { title } = req.body
  if (!title) return res.status(400).json({ error: 'title é obrigatório' })
  for (const col of board.columns) {
    const card = col.cards.find((c) => c.id === req.params.id)
    if (card) {
      const checklist: Checklist = { id: 'cl-' + uid(), title: String(title), items: [] }
      card.checklists.push(checklist)
      return res.status(201).json(checklist)
    }
  }
  res.status(404).json({ error: 'Cartão não encontrado' })
})

router.post('/cards/:cardId/checklists/:clId/items', (req: Request, res: Response) => {
  const { text } = req.body
  if (!text) return res.status(400).json({ error: 'text é obrigatório' })
  for (const col of board.columns) {
    const card = col.cards.find((c) => c.id === req.params.cardId)
    if (card) {
      const cl = card.checklists.find((c) => c.id === req.params.clId)
      if (!cl) return res.status(404).json({ error: 'Checklist não encontrada' })
      const item: ChecklistItem = { id: 'cli-' + uid(), text: String(text), done: false }
      cl.items.push(item)
      return res.status(201).json(item)
    }
  }
  res.status(404).json({ error: 'Cartão não encontrado' })
})

router.patch('/cards/:cardId/checklists/:clId/items/:itemId', (req: Request, res: Response) => {
  for (const col of board.columns) {
    const card = col.cards.find((c) => c.id === req.params.cardId)
    if (card) {
      const cl = card.checklists.find((c) => c.id === req.params.clId)
      if (!cl) return res.status(404).json({ error: 'Checklist não encontrada' })
      const item = cl.items.find((i) => i.id === req.params.itemId)
      if (!item) return res.status(404).json({ error: 'Item não encontrado' })
      if (req.body.done !== undefined) item.done = Boolean(req.body.done)
      if (req.body.text !== undefined) item.text = String(req.body.text)
      return res.json(item)
    }
  }
  res.status(404).json({ error: 'Cartão não encontrado' })
})

// ======== Attachments ========
router.post('/cards/:id/attachments', (req: Request, res: Response) => {
  const { name, url, type, size, addedBy } = req.body
  if (!name) return res.status(400).json({ error: 'name é obrigatório' })
  for (const col of board.columns) {
    const card = col.cards.find((c) => c.id === req.params.id)
    if (card) {
      const att: CardAttachment = {
        id: 'att-' + uid(),
        name: String(name),
        url: String(url || '#'),
        type: String(type || 'other'),
        size: String(size || '0 KB'),
        addedBy: String(addedBy || 'Anônimo'),
        addedAt: new Date().toLocaleString('pt-BR')
      }
      card.attachments.push(att)
      return res.status(201).json(att)
    }
  }
  res.status(404).json({ error: 'Cartão não encontrado' })
})

router.delete('/cards/:cardId/attachments/:attId', (req: Request, res: Response) => {
  for (const col of board.columns) {
    const card = col.cards.find((c) => c.id === req.params.cardId)
    if (card) {
      const idx = card.attachments.findIndex((a) => a.id === req.params.attId)
      if (idx === -1) return res.status(404).json({ error: 'Anexo não encontrado' })
      card.attachments.splice(idx, 1)
      return res.status(204).send()
    }
  }
  res.status(404).json({ error: 'Cartão não encontrado' })
})

export default router
