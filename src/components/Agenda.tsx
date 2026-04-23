import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { AgendaEvent, ProcessEvent } from '../types'

interface AgendaProps {
  darkMode: boolean
  processEvents?: ProcessEvent[]
}

const EVENTO_COLORS: Record<string, string> = {
  'Perícia Adm.': 'bg-blue-600',
  'Perícia Jur.': 'bg-purple-600',
  'Audiência': 'bg-orange-500',
  'Reunião Cliente': 'bg-green-600',
}

export const Agenda: React.FC<AgendaProps> = ({ darkMode, processEvents = [] }) => {
  const [currentDate, setCurrentDate] = React.useState(new Date(2026, 3, 1))

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
          const allEvents = [...dayAgendaEvents.map(e => ({ key: e.id, color: colorMap[e.color], label: `${e.tipo} - ${e.responsavel}`, title: `${e.tipo} - ${e.responsavel} - ${e.cliente}` })), ...dayProcessEvents.map(e => ({ key: e.id, color: EVENTO_COLORS[e.tipoEvento] || 'bg-blue-600', label: `${e.hora} - ${e.cliente}`, title: `${e.tipoEvento} | ${e.hora} | ${e.cliente}` }))]
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
                        className={`${ev.color} text-white text-xs px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-90 leading-tight`}
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
      {/* Modal */}
    </div>
  )
}
