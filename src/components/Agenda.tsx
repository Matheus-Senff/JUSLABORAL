import React from 'react'
import { ChevronLeft, ChevronRight, X, Plus, Clock, MapPin, FileText, History, MessageSquare, ExternalLink } from 'lucide-react'
import { AgendaEvent, ProcessEvent, EventHistoryEntry } from '../types'

interface AgendaProps {
  darkMode: boolean
  processEvents?: ProcessEvent[]
  onOpenProcess?: (processId: string, type: 'estadual' | 'federal') => void
}

const TITULO_OPTIONS: Array<EventHistoryEntry['titulo']> = ['Status do Evento', 'Auditoria', 'Comentário']

const EVENTO_COLORS: Record<string, string> = {
  'Perícia Adm.': 'bg-blue-600',
  'Perícia Jur.': 'bg-purple-600',
  'Audiência': 'bg-orange-500',
  'Reunião Cliente': 'bg-green-600',
}

export const Agenda: React.FC<AgendaProps> = ({ darkMode, processEvents = [], onOpenProcess }) => {
  const [currentDate, setCurrentDate] = React.useState(new Date(2026, 3, 1))

  // Evento selecionado para popup
  const [selectedEvent, setSelectedEvent] = React.useState<ProcessEvent | null>(null)
  // Histórico por evento { [eventId]: entries[] }
  const [eventHistories, setEventHistories] = React.useState<Record<string, EventHistoryEntry[]>>({})
  // Modal de novo histórico
  const [showNewHistoryModal, setShowNewHistoryModal] = React.useState(false)
  const [historyForm, setHistoryForm] = React.useState<{ titulo: EventHistoryEntry['titulo']; descricao: string }>({
    titulo: 'Comentário',
    descricao: '',
  })

  // Events will be loaded from database in future
  const events: AgendaEvent[] = []

  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay()

  const days = Array(firstDayOfMonth(currentDate)).fill(null)
  for (let i = 1; i <= daysInMonth(currentDate); i++) {
    days.push(i)
  }

  const getEventsForDay = (day: number | null) => {
    if (!day) return []
    return events.filter(e => e.data.getDate() === day && e.data.getMonth() === currentDate.getMonth())
  }

  const getProcessEventsForDay = (day: number | null): ProcessEvent[] => {
    if (!day) return []
    const target = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return processEvents.filter(ev => ev.data === target)
  }

  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

  const colorMap = {
    green: 'bg-green-600',
    orange: 'bg-orange-500',
    purple: 'bg-purple-600'
  }

  const card = darkMode ? 'bg-dark-800' : 'bg-white'
  const border = darkMode ? 'border-dark-600' : 'border-gray-200'
  const text = darkMode ? 'text-white' : 'text-gray-900'
  const muted = darkMode ? 'text-gray-400' : 'text-gray-500'
  const inputCls = `w-full px-3 py-2 border rounded-lg text-sm ${darkMode ? 'bg-dark-700 border-dark-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900'}`
  const labelCls = `block text-xs font-semibold mb-1 uppercase tracking-wide ${darkMode ? 'text-gray-400' : 'text-gray-500'}`
  const valueCls = `px-3 py-2 rounded-lg text-sm ${darkMode ? 'bg-dark-700 text-white' : 'bg-gray-100 text-gray-900'}`

  const tituloConfig: Record<EventHistoryEntry['titulo'], { color: string; icon: React.ReactNode }> = {
    'Status do Evento': { color: 'bg-blue-600', icon: <Clock size={11} /> },
    'Auditoria': { color: 'bg-orange-500', icon: <History size={11} /> },
    'Comentário': { color: 'bg-green-600', icon: <MessageSquare size={11} /> },
  }

  const handleAddHistory = () => {
    if (!selectedEvent || !historyForm.descricao.trim()) return
    const entry: EventHistoryEntry = {
      id: Date.now().toString(),
      eventId: selectedEvent.id,
      titulo: historyForm.titulo,
      descricao: historyForm.descricao.trim(),
      autor: selectedEvent.responsavel,
      data: new Date().toLocaleString('pt-BR'),
    }
    setEventHistories(prev => ({
      ...prev,
      [selectedEvent.id]: [entry, ...(prev[selectedEvent.id] || [])],
    }))
    setHistoryForm({ titulo: 'Comentário', descricao: '' })
    setShowNewHistoryModal(false)
  }

  return (
    <div className={`p-6 ${darkMode ? 'bg-dark-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
            className={`p-2 rounded-lg ${darkMode ? 'bg-dark-700 hover:bg-dark-600' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            <ChevronLeft size={20} className={darkMode ? 'text-white' : 'text-gray-900'} />
          </button>
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
            className={`p-2 rounded-lg ${darkMode ? 'bg-dark-700 hover:bg-dark-600' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            <ChevronRight size={20} className={darkMode ? 'text-white' : 'text-gray-900'} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map(day => (
          <div key={day} className={`text-center text-xs font-bold p-2 rounded ${darkMode ? 'bg-dark-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          const dayProcessEvents = getProcessEventsForDay(day)
          const dayAgendaEvents = getEventsForDay(day)
          const allEvents = [
            ...dayAgendaEvents.map(e => ({
              key: e.id,
              color: colorMap[e.color],
              label: `${e.tipo} - ${e.responsavel}`,
              title: `${e.tipo} - ${e.responsavel} - ${e.cliente}`,
              processEvent: null as ProcessEvent | null,
            })),
            ...dayProcessEvents.map(e => ({
              key: e.id,
              color: EVENTO_COLORS[e.tipoEvento] || 'bg-blue-600',
              label: `${e.hora} - ${e.cliente}`,
              title: `${e.tipoEvento} | ${e.hora} | ${e.cliente}`,
              processEvent: e,
            })),
          ]
          return (
            <div
              key={index}
              className={`min-h-32 p-2 rounded-lg border ${day === null
                ? darkMode ? 'bg-dark-800 border-dark-700' : 'bg-gray-100 border-gray-200'
                : darkMode ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'
                }`}
            >
              {day && (
                <>
                  <div className={`text-xs font-bold mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {day}
                  </div>
                  <div className="space-y-1 overflow-hidden">
                    {allEvents.slice(0, 3).map(ev => (
                      <div
                        key={ev.key}
                        onClick={() => ev.processEvent && setSelectedEvent(ev.processEvent)}
                        className={`${ev.color} text-white text-xs px-1.5 py-0.5 rounded truncate leading-tight ${ev.processEvent ? 'cursor-pointer hover:opacity-80 hover:ring-1 hover:ring-white/40' : 'cursor-default hover:opacity-90'}`}
                        title={ev.title}
                      >
                        {ev.label}
                      </div>
                    ))}
                    {allEvents.length > 3 && (
                      <div className={`text-xs px-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        +{allEvents.length - 3} mais
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* ===== POPUP INFORMAÇÕES DO EVENTO ===== */}
      {selectedEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) { setSelectedEvent(null); setShowNewHistoryModal(false) } }}
        >
          <div className={`${card} rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border ${border}`}>
            {/* Header do modal */}
            <div className={`flex items-center justify-between px-5 py-4 border-b ${border} sticky top-0 ${card} rounded-t-2xl`}>
              <h2 className={`text-base font-bold ${text}`}>Informações</h2>
              <button
                onClick={() => { setSelectedEvent(null); setShowNewHistoryModal(false) }}
                className={`p-1.5 rounded-lg transition ${darkMode ? 'hover:bg-dark-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Informações do Evento */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-white ${EVENTO_COLORS[selectedEvent.tipoEvento] || 'bg-blue-600'}`}>
                    <Clock size={11} /> {selectedEvent.tipoEvento}
                  </span>
                  {selectedEvent.status && (
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${darkMode ? 'bg-dark-600 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                      {selectedEvent.status}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Data</label>
                    <p className={valueCls}>{selectedEvent.data}</p>
                  </div>
                  <div>
                    <label className={labelCls}>Horário</label>
                    <p className={valueCls}>{selectedEvent.hora}</p>
                  </div>
                  <div className="col-span-2">
                    <label className={labelCls}><MapPin size={11} className="inline mr-1" />Endereço</label>
                    <p className={valueCls}>{selectedEvent.endereco || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className={`border-t ${border}`} />

              {/* Informações do Processo */}
              <div>
                <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${muted}`}>
                  <FileText size={12} className="inline mr-1.5" />Informações do Processo
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Cliente</label>
                    <p className={valueCls}>{selectedEvent.cliente}</p>
                  </div>
                  <div>
                    <label className={labelCls}>CPF</label>
                    <p className={valueCls}>{selectedEvent.cpf || '—'}</p>
                  </div>
                  <div>
                    <label className={labelCls}>Natureza</label>
                    <p className={valueCls}>{selectedEvent.natureza || '—'}</p>
                  </div>
                  <div>
                    <label className={labelCls}>Parceiro</label>
                    <p className={valueCls}>{selectedEvent.parceiro}</p>
                  </div>
                </div>

                {/* Botão Abrir Processo */}
                <button
                  onClick={() => {
                    if (onOpenProcess && selectedEvent.processType) {
                      onOpenProcess(selectedEvent.processId, selectedEvent.processType)
                      setSelectedEvent(null)
                    }
                  }}
                  disabled={!onOpenProcess || !selectedEvent.processType}
                  className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold transition shadow"
                >
                  <ExternalLink size={15} /> Abrir Processo
                </button>
              </div>

              {/* Divider */}
              <div className={`border-t ${border}`} />

              {/* Histórico */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`text-xs font-bold uppercase tracking-wider ${muted}`}>
                    <History size={12} className="inline mr-1.5" />Histórico
                  </h3>
                  <button
                    onClick={() => setShowNewHistoryModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition"
                  >
                    <Plus size={13} /> Novo Histórico
                  </button>
                </div>

                {/* Entrada automática do evento */}
                <div className={`rounded-lg border ${border} p-3 mb-2`}>
                  <div className="flex items-start gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-white text-xs font-semibold bg-blue-600 shrink-0`}>
                      <Clock size={10} /> Evento
                    </span>
                    <p className={`text-xs ${text}`}>
                      {selectedEvent.tipoEvento} agendado para {selectedEvent.data} às {selectedEvent.hora}
                      {selectedEvent.endereco ? ` — ${selectedEvent.endereco}` : ''}
                    </p>
                  </div>
                </div>

                {/* Entradas do usuário */}
                {(eventHistories[selectedEvent.id] || []).length === 0 ? (
                  <p className={`text-xs italic ${muted} text-center py-2`}>Nenhum registro adicionado.</p>
                ) : (
                  <div className="space-y-2">
                    {(eventHistories[selectedEvent.id] || []).map(entry => {
                      const cfg = tituloConfig[entry.titulo]
                      return (
                        <div key={entry.id} className={`rounded-lg border ${border} p-3`}>
                          <div className="flex items-start gap-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-white text-xs font-semibold ${cfg.color} shrink-0`}>
                              {cfg.icon} {entry.titulo}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs ${text} whitespace-pre-wrap`}>{entry.descricao}</p>
                              <p className={`text-xs mt-1 ${muted}`}>{entry.autor} · {entry.data}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL NOVO HISTÓRICO ===== */}
      {showNewHistoryModal && selectedEvent && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowNewHistoryModal(false) }}
        >
          <div className={`${card} rounded-2xl shadow-2xl w-full max-w-md border ${border}`}>
            <div className={`flex items-center justify-between px-5 py-4 border-b ${border}`}>
              <h3 className={`text-base font-bold ${text}`}>Novo Histórico</h3>
              <button
                onClick={() => setShowNewHistoryModal(false)}
                className={`p-1.5 rounded-lg transition ${darkMode ? 'hover:bg-dark-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Título */}
              <div>
                <label className={labelCls}>Título</label>
                <div className="flex gap-2 flex-wrap">
                  {TITULO_OPTIONS.map(opt => {
                    const cfg = tituloConfig[opt]
                    const active = historyForm.titulo === opt
                    return (
                      <button
                        key={opt}
                        onClick={() => setHistoryForm(f => ({ ...f, titulo: opt }))}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border-2 transition ${active
                            ? `${cfg.color} text-white border-transparent shadow`
                            : darkMode
                              ? 'bg-dark-700 text-gray-300 border-dark-600 hover:border-gray-500'
                              : 'bg-gray-100 text-gray-700 border-gray-200 hover:border-gray-400'
                          }`}
                      >
                        {cfg.icon} {opt}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label className={labelCls}>Descrição</label>
                <textarea
                  rows={4}
                  placeholder="Descreva o registro..."
                  className={`${inputCls} resize-none`}
                  value={historyForm.descricao}
                  onChange={e => setHistoryForm(f => ({ ...f, descricao: e.target.value }))}
                />
              </div>

              {/* Botões */}
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowNewHistoryModal(false)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border ${darkMode ? 'border-dark-600 text-gray-300 hover:bg-dark-700' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddHistory}
                  disabled={!historyForm.descricao.trim()}
                  className="px-4 py-2 rounded-lg text-sm font-bold bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white transition"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
