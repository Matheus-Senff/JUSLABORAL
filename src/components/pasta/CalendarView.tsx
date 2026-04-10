import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import { usePastaStore } from './pastaStore'
import { KanbanCard } from './types'

const MONTH_NAMES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const DAY_NAMES   = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

export const CalendarView: React.FC<{ darkMode?: boolean }> = ({ darkMode }) => {
  const board      = usePastaStore((s) => s.board)
  const setOpenCard = usePastaStore((s) => s.setOpenCard)
  const [cur, setCur] = useState(new Date(2026, 3, 1)) // Abril 2026

  const year  = cur.getFullYear()
  const month = cur.getMonth()
  const today = new Date()

  // All non-archived cards with due dates in this month
  const allCards: KanbanCard[] = board.columns.flatMap((col) =>
    col.cards.filter((c) => !c.archived)
  )

  const cardsByDay: Record<number, KanbanCard[]> = {}
  allCards.forEach((card) => {
    if (!card.dueDate) return
    const d = new Date(card.dueDate)
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate()
      cardsByDay[day] = cardsByDay[day] ? [...cardsByDay[day], card] : [card]
    }
  })

  // Build grid
  const firstDow   = new Date(year, month, 1).getDay()   // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const totalCards = Object.values(cardsByDay).reduce((s, arr) => s + arr.length, 0)
  const overdueCards = allCards.filter((c) => c.dueDate && !c.dueDateDone && new Date(c.dueDate) < today).length

  const bg   = darkMode ? 'bg-dark-900'  : 'bg-gray-50'
  const cell = darkMode ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'

  return (
    <div className={`flex-1 flex flex-col overflow-auto p-4 ${bg}`}>
      {/* Stats */}
      <div className="flex gap-3 mb-4">
        {[
          { label: 'No mês', value: totalCards, color: 'text-blue-400' },
          { label: 'Vencidos', value: overdueCards, color: 'text-red-400' },
          { label: 'Concluídos', value: allCards.filter((c) => c.dueDateDone).length, color: 'text-green-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`rounded-lg px-4 py-2 text-sm flex items-center gap-2 border ${cell}`}>
            <span className={`text-xl font-bold ${color}`}>{value}</span>
            <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>{label}</span>
          </div>
        ))}
      </div>

      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setCur(new Date(year, month - 1, 1))}
          className={`p-2 rounded-lg transition ${darkMode ? 'hover:bg-dark-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'}`}
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className={`text-lg font-bold tracking-wide ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
          {MONTH_NAMES[month]} {year}
        </h2>
        <button
          onClick={() => setCur(new Date(year, month + 1, 1))}
          className={`p-2 rounded-lg transition ${darkMode ? 'hover:bg-dark-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'}`}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_NAMES.map((d) => (
          <div key={d} className={`text-center text-xs font-semibold py-1.5 rounded ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 flex-1">
        {cells.map((day, idx) => {
          const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
          const dayCards = day ? (cardsByDay[day] || []) : []

          return (
            <div
              key={idx}
              className={`rounded-lg p-1.5 min-h-[90px] border transition-all ${
                !day
                  ? 'invisible'
                  : isToday
                    ? (darkMode ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-300')
                    : (darkMode ? `${cell} hover:border-dark-500` : `${cell} hover:border-gray-300`)
              }`}
            >
              {day && (
                <>
                  <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold mb-1 ${
                    isToday ? 'bg-blue-600 text-white' : darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>{day}</div>

                  {dayCards.slice(0, 3).map((card) => {
                    const overdue = !card.dueDateDone && new Date(card.dueDate) < today
                    return (
                      <button
                        key={card.id}
                        onClick={() => setOpenCard(card.id)}
                        className={`w-full text-left rounded px-1.5 py-[3px] mb-0.5 text-[10px] font-medium truncate transition hover:opacity-80 ${
                          card.dueDateDone
                            ? 'bg-green-500/80 text-white'
                            : overdue
                              ? 'bg-red-500/80 text-white'
                              : darkMode ? 'bg-blue-600/80 text-white' : 'bg-blue-100 text-blue-800'
                        }`}
                        title={card.title}
                      >
                        {card.title}
                      </button>
                    )
                  })}

                  {dayCards.length > 3 && (
                    <button
                      onClick={() => setOpenCard(dayCards[3].id)}
                      className={`text-[10px] w-full text-left flex items-center gap-0.5 ${darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      <Eye size={10} /> +{dayCards.length - 3} mais
                    </button>
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-3 text-[11px]">
        {[
          { bg: 'bg-green-500', label: 'Concluído' },
          { bg: 'bg-red-500',   label: 'Vencido' },
          { bg: 'bg-blue-500',  label: 'Pendente' },
        ].map(({ bg: c, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded ${c}`} />
            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
