import React, { useState } from 'react'
import { X, Plus, Edit, Trash2, Eye } from 'lucide-react'
import { Compromisso } from './CompromissoModal'

const PRIORIDADE_CORES: Record<Compromisso['prioridade'], string> = {
    baixa: 'bg-green-600',
    media: 'bg-yellow-600',
    alta: 'bg-orange-600',
    critica: 'bg-red-600',
}

const STATUS_COLORS: Record<Compromisso['status'], string> = {
    pendente: 'bg-blue-600',
    concluido: 'bg-green-600',
    remarcado: 'bg-yellow-600',
}

const STATUS_LABEL: Record<Compromisso['status'], string> = {
    pendente: 'Pendente',
    concluido: 'Concluído',
    remarcado: 'Remarcado',
}

interface CompromissosDiaModalProps {
    isOpen: boolean
    data: string
    compromissos: Compromisso[]
    onClose: () => void
    onSelectCompromisso: (compromisso: Compromisso) => void
    onAddCompromisso: () => void
    onDeleteCompromisso?: (id: string) => void
    darkMode?: boolean
}

export const CompromissosDiaModal: React.FC<CompromissosDiaModalProps> = ({
    isOpen,
    data,
    compromissos,
    onClose,
    onSelectCompromisso,
    onAddCompromisso,
    onDeleteCompromisso,
    darkMode,
}) => {
    const [viewingCompromisso, setViewingCompromisso] = useState<Compromisso | null>(null)

    if (!isOpen) return null

    const bgModal = darkMode ? 'bg-dark-800' : 'bg-white'
    const textColor = darkMode ? 'text-white' : 'text-gray-900'
    const borderColor = darkMode ? 'border-dark-600' : 'border-gray-200'
    const hoverBg = darkMode ? 'hover:bg-dark-700' : 'hover:bg-gray-50'

    // Sort compromissos by horário
    const sortedCompromissos = [...compromissos].sort((a, b) => a.horario.localeCompare(b.horario))

    // Format date for display
    const dateObj = new Date(data + 'T00:00:00')
    const formattedDate = dateObj.toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className={`${bgModal} rounded-lg shadow-2xl max-w-2xl w-full mx-4 border ${borderColor} max-h-[90vh] overflow-hidden flex flex-col`}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: darkMode ? '#3d424a' : '#e5e7eb' }}>
                    <div>
                        <h2 className={`text-2xl font-bold ${textColor}`}>Compromissos</h2>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} capitalize`}>{formattedDate}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-1 rounded transition ${darkMode ? 'hover:bg-dark-700' : 'hover:bg-gray-100'}`}
                    >
                        <X size={24} className={textColor} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {sortedCompromissos.length === 0 ? (
                        <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Nenhum compromisso neste dia
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {sortedCompromissos.map((comp) => (
                                <div
                                    key={comp.id}
                                    className={`p-4 rounded-lg border transition ${darkMode
                                        ? `${borderColor} border-dark-600 bg-dark-700/50`
                                        : `${borderColor} border-gray-300 bg-gray-50`
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                        {/* Left side - Time and Description */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`inline-block ${PRIORIDADE_CORES[comp.prioridade]} text-white px-3 py-1 rounded text-xs font-semibold`}>
                                                    {comp.horario}
                                                </span>
                                                <span className={`inline-block ${STATUS_COLORS[comp.status]} text-white px-2 py-1 rounded text-xs`}>
                                                    {STATUS_LABEL[comp.status]}
                                                </span>
                                            </div>
                                            <p className={`font-semibold ${textColor} line-clamp-2`}>{comp.descricao}</p>
                                            {comp.local && (
                                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1 line-clamp-1`}>
                                                    📍 {comp.local}
                                                </p>
                                            )}
                                        </div>

                                        {/* Right side - Priority badge */}
                                        <div className={`flex-shrink-0 ${PRIORIDADE_CORES[comp.prioridade]} text-white px-3 py-1 rounded text-xs font-semibold whitespace-nowrap`}>
                                            {comp.prioridade.charAt(0).toUpperCase() + comp.prioridade.slice(1)}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setViewingCompromisso(comp)}
                                            className="flex-1 flex items-center justify-center gap-2 px-2 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm font-semibold"
                                        >
                                            <Eye size={16} /> Visualizar
                                        </button>
                                        <button
                                            onClick={() => {
                                                onSelectCompromisso(comp)
                                                onClose()
                                            }}
                                            className="flex-1 flex items-center justify-center gap-2 px-2 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold"
                                        >
                                            <Edit size={16} /> Editar
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (onDeleteCompromisso && confirm('Tem certeza que deseja excluir este compromisso?')) {
                                                    onDeleteCompromisso(comp.id)
                                                    onClose()
                                                }
                                            }}
                                            className="flex-1 flex items-center justify-center gap-2 px-2 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-semibold"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className={`border-t ${borderColor} p-6 flex justify-between`}>
                    <button
                        onClick={onAddCompromisso}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        <Plus size={18} /> Adicionar
                    </button>
                    <button
                        onClick={onClose}
                        className={`px-6 py-2 rounded-lg transition ${darkMode ? 'bg-dark-700 hover:bg-dark-600' : 'bg-gray-200 hover:bg-gray-300'} ${textColor}`}
                    >
                        Fechar
                    </button>
                </div>
            </div>

            {/* View Modal */}
            {viewingCompromisso && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className={`${bgModal} rounded-lg shadow-2xl max-w-md w-full mx-4 border ${borderColor} p-6`}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className={`text-lg font-bold ${textColor}`}>Detalhes do Compromisso</h3>
                            <button
                                onClick={() => setViewingCompromisso(null)}
                                className={`p-1 rounded transition ${darkMode ? 'hover:bg-dark-700' : 'hover:bg-gray-100'}`}
                            >
                                <X size={20} className={textColor} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-gray-400 font-semibold uppercase">Horário</p>
                                <p className={`${textColor} font-semibold`}>{viewingCompromisso.horario}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-semibold uppercase">Descrição</p>
                                <p className={`${textColor}`}>{viewingCompromisso.descricao}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-semibold uppercase">Local</p>
                                <p className={`${textColor}`}>{viewingCompromisso.local || '-'}</p>
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <p className="text-xs text-gray-400 font-semibold uppercase">Prioridade</p>
                                    <p className={`${textColor} capitalize`}>{viewingCompromisso.prioridade}</p>
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-400 font-semibold uppercase">Status</p>
                                    <p className={`${textColor} capitalize`}>{viewingCompromisso.status}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-6">
                            <button
                                onClick={() => setViewingCompromisso(null)}
                                className={`flex-1 px-4 py-2 rounded-lg transition ${darkMode ? 'bg-dark-700 hover:bg-dark-600' : 'bg-gray-200 hover:bg-gray-300'} ${textColor}`}
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
