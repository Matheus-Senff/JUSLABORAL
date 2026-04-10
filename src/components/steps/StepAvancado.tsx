import React from 'react'

export const StepAvancado: React.FC = () => {
  return (
    <div className="space-y-4">
      <label className="block text-sm text-gray-200">
        Adicional de 25%
        <select className="mt-2 w-full rounded-xl border border-gray-700 bg-dark-900 px-3 py-2 text-sm text-white">
          <option value="nao">Não</option>
          <option value="sim">Sim</option>
        </select>
      </label>
      <label className="block text-sm text-gray-200">
        Teto previdenciário
        <input className="mt-2 w-full rounded-xl border border-gray-700 bg-dark-900 px-3 py-2 text-sm text-white" placeholder="R$ 0,00" />
      </label>
    </div>
  )
}
