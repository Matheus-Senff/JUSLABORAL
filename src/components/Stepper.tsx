import React from 'react'
import { useCalculo } from '../contexts/CalculoContext'

const steps = [
  'Identificação',
  'Processo',
  'Parâmetros',
  'Benefício',
  'Avançado',
  'Dependentes',
]

export const Stepper: React.FC = () => {
  const { currentStep, calculoMode } = useCalculo()

  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-6 gap-2">
        {steps.map((step, index) => {
          const active = currentStep === index
          const completed = currentStep > index
          return (
            <div
              key={step}
              className={`rounded-xl border px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.13em] ${
                active
                  ? 'bg-green-600 text-white border-green-500'
                  : completed
                  ? 'bg-dark-700 text-gray-200 border-dark-600'
                  : 'bg-dark-800 text-gray-400 border-dark-700'
              }`}
            >
              {step}
            </div>
          )
        })}
      </div>
      <p className="mt-3 text-sm text-gray-400">Modo: {calculoMode || 'Não selecionado'}</p>
    </div>
  )
}
