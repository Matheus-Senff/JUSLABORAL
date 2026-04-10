import React from 'react'

interface AIAnalyzeButtonProps {
  stepName: string
}

export const AIAnalyzeButton: React.FC<AIAnalyzeButtonProps> = ({ stepName }) => {
  return (
    <button
      type="button"
      className="rounded-lg border border-blue-500 bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600 disabled:opacity-50"
      onClick={() => console.log(`Analisar IA: ${stepName}`)}
    >
      Analisar IA
    </button>
  )
}
