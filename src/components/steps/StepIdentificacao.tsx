import React from 'react'

export const StepIdentificacao: React.FC = () => {
  return (
    <div className="space-y-4">
      <label className="block text-sm text-gray-200">
        Nome do autor
        <input className="mt-2 w-full rounded-xl border border-gray-700 bg-dark-900 px-3 py-2 text-sm text-white" placeholder="Nome completo" />
      </label>
      <label className="block text-sm text-gray-200">
        CPF
        <input className="mt-2 w-full rounded-xl border border-gray-700 bg-dark-900 px-3 py-2 text-sm text-white" placeholder="000.000.000-00" />
      </label>
    </div>
  )
}
