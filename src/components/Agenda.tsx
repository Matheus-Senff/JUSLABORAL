import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { AgendaEvent } from '../types'

interface AgendaProps {
  darkMode: boolean
}

export const Agenda: React.FC<AgendaProps> = ({ darkMode }) => {
  const [currentDate, setCurrentDate] = React.useState(new Date(2026, 3, 1))

  // Mock events data
  const events: AgendaEvent[] = [
    {
      id: '1',
      tipo: 'Audiência',
      responsavel: 'João Silva',
      cliente: 'Empresa A',
      data: new Date(2026, 3, 5),
      color: 'green'
    },
    {
      id: '2',
      tipo: 'Reunião',
      responsavel: 'Maria Santos',
      cliente: 'Empresa B',
      data: new Date(2026, 3, 5),
      color: 'orange'
    },
    {
      id: '3',
      tipo: 'Pericia',
      responsavel: 'Pedro Costa',
      cliente: 'Empresa C',
      data: new Date(2026, 3, 10),
      color: 'purple'
    },
    {
      id: '4',
      tipo: 'Ajuizamento',
      responsavel: 'Ana Paula',
      cliente: 'Empresa D',
      data: new Date(2026, 3, 15),
      color: 'green'
    },
    {
      id: '5',
      tipo: 'Intimação',
      responsavel: 'Carlos Mendes',
      cliente: 'Empresa E',
      data: new Date(2026, 3, 20),
      color: 'orange'
    },
  ]

  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay()

  const days = Array(firstDayOfMonth(currentDate)).fill(null)
  for (let i = 1; i <= daysInMonth(currentDate); i++) {
    days.push(i)
  }

  const getEventsForDay = (day: number | null) => {
    if (!day) return []
    const eventDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    return events.filter(e => e.data.getDate() === day && e.data.getMonth() === currentDate.getMonth())
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
        {days.map((day, index) => (
          <div
            key={index}
            className={`min-h-32 p-2 rounded-lg border ${
              day === null
                ? darkMode ? 'bg-dark-800 border-dark-700' : 'bg-gray-100 border-gray-200'
                : darkMode ? 'bg-dark-800 border-dark-700 hover:border-dark-500' : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            {day && (
              <>
                <div className={`text-xs font-bold mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {day}
                </div>
                <div className="space-y-1">
                  {getEventsForDay(day).map((event) => (
                    <div
                      key={event.id}
                      className={`${colorMap[event.color]} text-white text-xs p-1 rounded truncate cursor-pointer hover:opacity-90`}
                      title={`${event.tipo} - ${event.responsavel} - ${event.cliente}`}
                    >
                      {event.tipo} - {event.responsavel}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
