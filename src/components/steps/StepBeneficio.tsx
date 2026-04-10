import React from 'react'

export const StepBeneficio: React.FC = () => {
  return (
    <div className="space-y-4">
      <label className="block text-sm text-gray-200">
        Tipo de benefício
        <input className="mt-2 w-full rounded-xl border border-gray-700 bg-dark-900 px-3 py-2 text-sm text-white" placeholder="Aposentadoria" />
      </label>
      <label className="block text-sm text-gray-200">
        Valor do benefício
        <input className="mt-2 w-full rounded-xl border border-gray-700 bg-dark-900 px-3 py-2 text-sm text-white" placeholder="R$ 0,00" />
      </label>
    </div>
  )
}
