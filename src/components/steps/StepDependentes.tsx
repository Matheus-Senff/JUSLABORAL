import React from 'react'

export const StepDependentes: React.FC = () => {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-300">Adicione dependentes habilitados ao benefício.</p>
      <label className="block text-sm text-gray-200">
        Nome do dependente
        <input className="mt-2 w-full rounded-xl border border-gray-700 bg-dark-900 px-3 py-2 text-sm text-white" placeholder="Nome completo" />
      </label>
      <label className="block text-sm text-gray-200">
        Grau de parentesco
        <input className="mt-2 w-full rounded-xl border border-gray-700 bg-dark-900 px-3 py-2 text-sm text-white" placeholder="Filho, cônjuge, etc." />
      </label>
    </div>
  )
}
