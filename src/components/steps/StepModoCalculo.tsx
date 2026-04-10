import React from 'react'
import { useCalculo } from '../../contexts/CalculoContext'

export const StepModoCalculo: React.FC = () => {
  const { calculoMode, setCalculoMode } = useCalculo()

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-300">Escolha a modalidade de cálculo que deseja realizar.</p>
      <div className="grid gap-4 md:grid-cols-2">
        {['inicial', 'execucao'].map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setCalculoMode(mode as 'inicial' | 'execucao')}
            className={`rounded-2xl border p-5 text-left transition ${
              calculoMode === mode
                ? 'border-blue-500 bg-blue-600 text-white'
                : 'border-gray-700 bg-dark-900 text-gray-200 hover:border-blue-500'
            }`}
          >
            <h3 className="text-lg font-semibold capitalize">Cálculo {mode === 'inicial' ? 'Inicial' : 'de Execução'}</h3>
            <p className="text-sm text-gray-400 mt-2">{mode === 'inicial' ? 'Use esta opção para calcular a base inicial.' : 'Use esta opção para cálculos de execução judicial.'}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
