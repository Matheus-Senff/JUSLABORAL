import React from 'react'

export const StepProcesso: React.FC = () => {
  return (
    <div className="space-y-4">
      <label className="block text-sm text-gray-200">
        Número do processo
        <input className="mt-2 w-full rounded-xl border border-gray-700 bg-dark-900 px-3 py-2 text-sm text-white" placeholder="0000000-00.0000.0.00.0000" />
      </label>
      <label className="block text-sm text-gray-200">
        Comarca
        <input className="mt-2 w-full rounded-xl border border-gray-700 bg-dark-900 px-3 py-2 text-sm text-white" placeholder="São Paulo" />
      </label>
    </div>
  )
}
