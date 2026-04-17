import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { usePastaStore } from './pastaStore'
import { CompromissoModal, Compromisso } from './CompromissoModal'
import { CompromissosDiaModal } from './CompromissosDiaModal'

const MONTH_NAMES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const PRIORIDADE_CORES: Record<Compromisso['prioridade'], string> = {
  baixa: 'bg-green-600',
  media: 'bg-yellow-600',
  alta: 'bg-orange-600',
  critica: 'bg-red-600',
}

export const CalendarView: React.FC<{
  darkMode?: boolean
  compromissos?: Compromisso[]
  onSaveCompromisso?: (compromisso: Compromisso) => Promise<void>
  onDeleteCompromisso?: (id: string) => Promise<void>
}> = ({ darkMode, compromissos: externalCompromissos, onSaveCompromisso, onDeleteCompromisso }) => {
  const [cur, setCur] = useState(new Date(2026, 3, 1)) // Abril 2026
  const [compromissos, setCompromissos] = useState<Compromisso[]>(externalCompromissos || [
    {
      id: '1',
      data: '2026-04-15',
      horario: '09:30',
      descricao: 'Reunião com cliente - Análise de processo',
      local: 'Sala 301',
      prioridade: 'alta',
      status: 'pendente',
    },
    {
      id: '2',
      data: '2026-04-15',
      horario: '14:00',
      descricao: 'Revisão de documentos',
      local: 'Escritório',
      prioridade: 'media',
      status: 'pendente',
    },
    {
      id: '3',
      data: '2026-04-20',
      horario: '10:00',
      descricao: 'Despacho com juiz',
      local: 'Fórum',
      prioridade: 'critica',
      status: 'pendente',
    },
  ])

  // Atualizar compromissos quando props externas mudam
  React.useEffect(() => {
    if (externalCompromissos) {
      setCompromissos(externalCompromissos)
    }
  }, [externalCompromissos])

  const [showModal, setShowModal] = useState(false)
  const [selectedCompromisso, setSelectedCompromisso] = useState<Compromisso | undefined>()
  const [selectedDate, setSelectedDate] = useState<string>()
  const [showDiaModal, setShowDiaModal] = useState(false)
  const [selectedDayForList, setSelectedDayForList] = useState<string>()

  const year = cur.getFullYear()
  const month = cur.getMonth()
  const today = new Date()

  const compromissosByDay: Record<string, Compromisso[]> = {}
  compromissos.forEach((c) => {
    if (!compromissosByDay[c.data]) {
      compromissosByDay[c.data] = []
    }
    compromissosByDay[c.data].push(c)
  })

  // Sort compromissos by horário
  Object.values(compromissosByDay).forEach((arr) => {
    arr.sort((a, b) => a.horario.localeCompare(b.horario))
  })

  // Build grid
  const firstDow = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const bg = darkMode ? 'bg-dark-900' : 'bg-gray-50'
  const cell = darkMode ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'
  const textColor = darkMode ? 'text-white' : 'text-gray-900'

  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    // Sempre abre a lista do dia, mesmo que vazia
    setSelectedDayForList(dateStr)
    setShowDiaModal(true)
  }



  const handleSaveCompromisso = async (compromisso: Compromisso) => {
    try {
      // Optimistic update - atualizar estado local imediatamente
      const existeNaLista = compromissos.some(c => c.id === compromisso.id)
      if (existeNaLista) {
        setCompromissos(compromissos.map(c => c.id === compromisso.id ? compromisso : c))
      } else {
        setCompromissos([...compromissos, compromisso])
      }

      // Enviar para backend
      if (onSaveCompromisso) {
        await onSaveCompromisso(compromisso)
      }
    } catch (err) {
      console.error('Erro ao salvar compromisso:', err)
      alert('Erro ao salvar compromisso')
      // Revert optimistic update se falhar
      if (onSaveCompromisso) {
        // Re-fetch data to restore previous state
      }
    }
  }

  const handleDeleteCompromisso = async (id: string) => {
    try {
      // Optimistic update - remover do estado local imediatamente
      setCompromissos(compromissos.filter(c => c.id !== id))

      // Enviar para backend
      if (onDeleteCompromisso) {
        await onDeleteCompromisso(id)
      }
    } catch (err) {
      console.error('Erro ao deletar compromisso:', err)
      alert('Erro ao deletar compromisso')
      // Revert optimistic update se falhar - dados virão do realtime
    }
  }

  return (
    <div className={`flex-1 flex flex-col overflow-auto p-4 ${bg}`}>
      {/* Month nav */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setCur(new Date(year, month - 1, 1))}
          className={`p-2 rounded-lg transition ${darkMode ? 'hover:bg-dark-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'}`}
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className={`text-2xl font-bold tracking-wide ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
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
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAY_NAMES.map((d) => (
          <div key={d} className={`text-center text-sm font-semibold py-2 rounded ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 flex-1">
        {cells.map((day, idx) => {
          const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
          const dateStr = day ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : ''
          const dayCompromissos = dateStr ? (compromissosByDay[dateStr] || []) : []

          return (
            <button
              key={idx}
              onClick={() => day && handleDayClick(day)}
              disabled={!day}
              className={`rounded-lg p-2 min-h-[120px] border transition-all cursor-pointer ${!day
                ? 'invisible'
                : isToday
                  ? (darkMode ? 'bg-blue-900/40 border-blue-600 hover:bg-blue-900/50' : 'bg-blue-100 border-blue-400 hover:bg-blue-150')
                  : (darkMode ? `${cell} hover:bg-dark-700 hover:border-dark-500` : `${cell} hover:bg-gray-100 hover:border-gray-400`)
                }`}
            >
              {day && (
                <div className="flex flex-col h-full">
                  <div className={`text-sm font-bold mb-1 ${isToday ? (darkMode ? 'text-blue-400' : 'text-blue-600') : textColor
                    }`}>{day}</div>

                  <div className="flex-1 overflow-y-auto space-y-1">
                    {dayCompromissos.slice(0, 2).map((comp) => (
                      <div
                        key={comp.id}
                        className={`w-full text-left text-xs rounded px-2 py-1 ${PRIORIDADE_CORES[comp.prioridade]} text-white line-clamp-2`}
                        title={`${comp.horario} - ${comp.descricao}`}
                      >
                        <span className="font-semibold">{comp.horario}</span>
                        <span className="block truncate">{comp.descricao}</span>
                      </div>
                    ))}
                    {dayCompromissos.length > 2 && (
                      <div className={`text-xs font-semibold px-2 py-1 rounded ${darkMode ? 'bg-dark-600 text-gray-300' : 'bg-gray-300 text-gray-700'}`}>
                        +{dayCompromissos.length - 2} mais
                      </div>
                    )}
                  </div>
                </div>
              )}
            </button>
          )
        })}
      </div>

      <CompromissoModal
        isOpen={showModal}
        compromisso={selectedCompromisso}
        dataDefault={selectedDate}
        onClose={() => {
          setShowModal(false)
          setSelectedCompromisso(undefined)
          setSelectedDate(undefined)
        }}
        onSave={handleSaveCompromisso}
        onDelete={handleDeleteCompromisso}
        darkMode={darkMode}
      />

      <CompromissosDiaModal
        isOpen={showDiaModal}
        data={selectedDayForList || ''}
        compromissos={compromissosByDay[selectedDayForList || ''] || []}
        onClose={() => {
          setShowDiaModal(false)
          setSelectedDayForList(undefined)
        }}
        onSelectCompromisso={(comp) => {
          setSelectedCompromisso(comp)
          setShowModal(true)
        }}
        onAddCompromisso={() => {
          setSelectedDate(selectedDayForList)
          setSelectedCompromisso(undefined)
          setShowModal(true)
          setShowDiaModal(false)
        }}
        onDeleteCompromisso={handleDeleteCompromisso}
        darkMode={darkMode}
      />
    </div>
  )
}
