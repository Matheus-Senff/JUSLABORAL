import React from 'react'
import { X } from 'lucide-react'
import { usePastaStore } from './pastaStore'

export const PastaApp: React.FC<{ darkMode?: boolean }> = ({ darkMode }) => {
  const filterState = usePastaStore((s) => s.filterState)
  const clearFilters = usePastaStore((s) => s.clearFilters)

  const activeFilterCount =
    filterState.labels.length +
    filterState.members.length +
    (filterState.dueDateFilter !== 'all' ? 1 : 0) +
    (filterState.hasChecklist ? 1 : 0) +
    (filterState.hasAttachment ? 1 : 0)

  const mainBg = darkMode ? 'bg-dark-900 text-gray-100' : 'bg-gradient-to-br from-blue-50 to-indigo-50 text-gray-900'

  return (
    <div className={`flex flex-col h-full min-h-0 ${mainBg}`}>
      {/* Board Header */}
      <div className={`flex items-center gap-4 px-6 py-4 flex-shrink-0 border-b ${darkMode ? 'bg-dark-800/80 border-dark-700' : 'bg-white/70 backdrop-blur border-gray-200'}`}>
        {/* Clear Filter Button - Yellow */}
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-3 py-2 rounded text-sm font-semibold transition bg-yellow-400 hover:bg-yellow-500 text-gray-900 border border-yellow-600"
            title="Limpar todos os filtros"
          >
            <X size={14} />
            Limpar Filtro
          </button>
        )}
      </div>

      {/* Empty Placeholder - Ready for new layout */}
      <div className="flex-1 flex items-center justify-center">
        <div className={`text-center p-8 rounded-lg ${darkMode ? 'bg-dark-700' : 'bg-gray-100'}`}>
          <p className={`text-lg font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Tarefas</p>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Layout pronto para receber novo conteúdo</p>
        </div>
      </div>
    </div>
  )
}
