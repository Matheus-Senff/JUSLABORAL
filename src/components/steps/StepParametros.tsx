import React from 'react'

export const StepParametros: React.FC = () => {
  return (
    <div className="space-y-4">
      <label className="block text-sm text-gray-200">
        Inicio do período
        <input className="mt-2 w-full rounded-xl border border-gray-700 bg-dark-900 px-3 py-2 text-sm text-white" placeholder="dd/mm/aaaa" />
      </label>
      <label className="block text-sm text-gray-200">
        Taxa de reajuste
        <input className="mt-2 w-full rounded-xl border border-gray-700 bg-dark-900 px-3 py-2 text-sm text-white" placeholder="IPCA-E / SELIC" />
      </label>
    </div>
  )
}
