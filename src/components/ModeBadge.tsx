import React from 'react'
import { useCalculo } from '../contexts/CalculoContext'

export const ModeBadge: React.FC = () => {
  const { calculoMode } = useCalculo()
  const label = calculoMode === 'inicial' ? 'Cálculo Inicial' : calculoMode === 'execucao' ? 'Cálculo de Execução' : 'Modo não selecionado'

  return (
    <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
      {label}
    </span>
  )
}
