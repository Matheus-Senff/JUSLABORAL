import React, { useState, useEffect } from 'react'
import { X, Trash2, Edit, Check, Clock, ChevronLeft, ChevronRight } from 'lucide-react'

// Modal pra criar/editar compromissos - eu fiz isso do zero
export interface Compromisso {
    id: string
    data: string
    horario: string
    descricao: string
    local: string
    prioridade: 'baixa' | 'media' | 'alta' | 'critica'
    status: 'pendente' | 'concluido' | 'remarcado'
}

// Cores que defini pra cada prioridade
const PRIORIDADE_CORES: Record<Compromisso['prioridade'], { bg: string; text: string; label: string }> = {
    baixa: { bg: 'bg-green-500', text: 'text-green-700', label: 'Baixa' },
    media: { bg: 'bg-yellow-500', text: 'text-yellow-700', label: 'Média' },
    alta: { bg: 'bg-orange-500', text: 'text-orange-700', label: 'Alta' },
    critica: { bg: 'bg-red-500', text: 'text-red-700', label: 'Crítica' },
}

// TODO: adicionar mais status depois (em progresso, suspenso, etc)
const STATUS_LABEL: Record<Compromisso['status'], string> = {
    pendente: 'Pendente',
    concluido: 'Concluído',
    remarcado: 'Remarcado',
}

// Props do modal que criei
interface CompromissoModalProps {
    isOpen: boolean
    compromisso?: Compromisso
    dataDefault?: string
    onClose: () => void
    onSave: (compromisso: Compromisso) => void
    onDelete?: (id: string) => void
    darkMode?: boolean
}

// Component principal - FIXME: tá um pouco grande, devia quebrar em componentes menores
export const CompromissoModal: React.FC<CompromissoModalProps> = ({
    isOpen,
    compromisso,
    dataDefault,
    onClose,
    onSave,
    onDelete,
    darkMode,
}) => {
    const [formData, setFormData] = useState<Compromisso>(
        compromisso || {
            id: Date.now().toString(),
            data: dataDefault || new Date().toISOString().split('T')[0],
            horario: '09:00',
            descricao: '',
            local: '',
            prioridade: 'media',
            status: 'pendente',
        }
    )

    const [isEditing, setIsEditing] = useState(!compromisso)
    const [showRemarqueCalendar, setShowRemarqueCalendar] = useState(false)
    const [remarqueMonth, setRemarqueMonth] = useState(new Date())

    // Update formData when modal opens with new data
    useEffect(() => {
        if (compromisso) {
            setFormData(compromisso)
            setIsEditing(true)
        } else {
            setFormData({
                id: Date.now().toString(),
                data: dataDefault || new Date().toISOString().split('T')[0],
                horario: '09:00',
                descricao: '',
                local: '',
                prioridade: 'media',
                status: 'pendente',
            })
            setIsEditing(true)
        }
    }, [compromisso, dataDefault, isOpen])

    const handleChange = (field: keyof Compromisso, value: string) => {
        setFormData({ ...formData, [field]: value })
    }

    const handleSave = () => {
        if (!formData.descricao.trim() || !formData.horario) {
            alert('Por favor, preencha Horário e Descrição')
            return
        }
        onSave({ ...formData, id: formData.id || Date.now().toString() })
        onClose()
    }

    const handleDelete = () => {
        if (onDelete && compromisso) {
            if (confirm('Tem certeza que deseja excluir este compromisso?')) {
                onDelete(compromisso.id)
                onClose()
            }
        }
    }

    const handleRemarque = async (newDate: string) => {
        if (compromisso) {
            try {
                // Update old compromisso to "remarcado" status - usar dados originais do compromisso
                const oldCompromissoUpdated: Compromisso = {
                    ...compromisso,
                    status: 'remarcado'
                }
                await onSave(oldCompromissoUpdated)

                // Create new compromisso for the new date - clonar o original com nova data
                const newCompromisso: Compromisso = {
                    ...compromisso,
                    id: Date.now().toString(),
                    data: newDate,
                    status: 'pendente'
                }
                await onSave(newCompromisso)

                setShowRemarqueCalendar(false)
                onClose()
            } catch (err) {
                console.error('Erro ao remarcar compromisso:', err)
                alert('Erro ao remarcar compromisso')
            }
        }
    }

    if (!isOpen) return null

    const bgModal = darkMode ? 'bg-dark-800' : 'bg-white'
    const textColor = darkMode ? 'text-white' : 'text-gray-900'
    const inputBg = darkMode ? 'bg-dark-700 border-dark-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
    const borderColor = darkMode ? 'border-dark-600' : 'border-gray-200'
    const selectBg = darkMode ? 'bg-dark-700 text-white border-dark-600' : 'bg-gray-50 text-gray-900 border-gray-300'

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                <div className={`${bgModal} rounded-lg shadow-2xl max-w-md w-full mx-4 border ${borderColor}`}>
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: darkMode ? '#3d424a' : '#e5e7eb' }}>
                        <h2 className={`text-xl font-bold ${textColor}`}>
                            {compromisso ? 'Editar Compromisso' : 'Novo Compromisso'}
                        </h2>
                        <button
                            onClick={onClose}
                            className={`p-1 rounded transition ${darkMode ? 'hover:bg-dark-700' : 'hover:bg-gray-100'}`}
                        >
                            <X size={20} className={textColor} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                        {/* Data */}
                        <div>
                            <label className={`block text-sm font-semibold mb-2 ${textColor}`}>Data</label>
                            <input
                                type="date"
                                value={formData.data}
                                onChange={(e) => handleChange('data', e.target.value)}
                                disabled={!isEditing && !!compromisso}
                                className={`w-full px-3 py-2 border rounded-lg transition ${inputBg} disabled:opacity-50`}
                            />
                        </div>

                        {/* Horário */}
                        <div>
                            <label className={`block text-sm font-semibold mb-2 ${textColor}`}>Horário</label>
                            <input
                                type="time"
                                value={formData.horario}
                                onChange={(e) => handleChange('horario', e.target.value)}
                                disabled={!isEditing && !!compromisso}
                                className={`w-full px-3 py-2 border rounded-lg transition ${inputBg} disabled:opacity-50`}
                            />
                        </div>

                        {/* Descrição */}
                        <div>
                            <label className={`block text-sm font-semibold mb-2 ${textColor}`}>Descrição</label>
                            <input
                                type="text"
                                value={formData.descricao}
                                onChange={(e) => handleChange('descricao', e.target.value)}
                                disabled={!isEditing && !!compromisso}
                                placeholder="O que será o compromisso"
                                className={`w-full px-3 py-2 border rounded-lg transition ${inputBg} disabled:opacity-50`}
                            />
                        </div>

                        {/* Local */}
                        <div>
                            <label className={`block text-sm font-semibold mb-2 ${textColor}`}>Local</label>
                            <input
                                type="text"
                                value={formData.local}
                                onChange={(e) => handleChange('local', e.target.value)}
                                disabled={!isEditing && !!compromisso}
                                placeholder="Endereço ou local da reunião"
                                className={`w-full px-3 py-2 border rounded-lg transition ${inputBg} disabled:opacity-50`}
                            />
                        </div>

                        {/* Prioridade */}
                        <div>
                            <label className={`block text-sm font-semibold mb-2 ${textColor}`}>Prioridade</label>
                            <select
                                value={formData.prioridade}
                                onChange={(e) => handleChange('prioridade', e.target.value as Compromisso['prioridade'])}
                                disabled={!isEditing && !!compromisso}
                                className={`w-full px-3 py-2 border rounded-lg transition ${selectBg} disabled:opacity-50`}
                            >
                                <option value="baixa">Baixa</option>
                                <option value="media">Média</option>
                                <option value="alta">Alta</option>
                                <option value="critica">Crítica</option>
                            </select>
                        </div>

                        {/* Status */}
                        <div>
                            <label className={`block text-sm font-semibold mb-2 ${textColor}`}>Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => handleChange('status', e.target.value as Compromisso['status'])}
                                disabled={!isEditing && !!compromisso}
                                className={`w-full px-3 py-2 border rounded-lg transition ${selectBg} disabled:opacity-50`}
                            >
                                <option value="pendente">Pendente</option>
                                <option value="concluido">Concluído</option>
                                <option value="remarcado">Remarcado</option>
                            </select>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className={`flex gap-2 p-6 border-t ${borderColor} flex-wrap`}>
                        <div className="flex gap-2 flex-wrap w-full">
                            {formData.status !== 'concluido' && (
                                <button
                                    onClick={() => {
                                        setFormData({ ...formData, status: 'concluido' })
                                        onSave({ ...formData, status: 'concluido' })
                                        onClose()
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                                >
                                    <Check size={16} /> Concluir
                                </button>
                            )}
                            {formData.status !== 'remarcado' && (
                                <button
                                    onClick={() => setShowRemarqueCalendar(true)}
                                    className="flex items-center gap-2 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition text-sm"
                                >
                                    <Clock size={16} /> Remarcar
                                </button>
                            )}
                            {compromisso && (
                                <button
                                    onClick={handleDelete}
                                    className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                                >
                                    <Trash2 size={16} /> Excluir
                                </button>
                            )}
                        </div>
                        <div className="flex gap-2 w-full">
                            <button
                                onClick={onClose}
                                className={`flex-1 px-4 py-2 rounded-lg transition ${darkMode ? 'bg-dark-700 hover:bg-dark-600' : 'bg-gray-200 hover:bg-gray-300'} ${textColor}`}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                Salvar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Remarque Calendar Modal */}
            {showRemarqueCalendar && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className={`${bgModal} rounded-lg shadow-2xl p-6 border ${borderColor}`}>
                        <h3 className={`text-lg font-bold mb-4 ${textColor}`}>Escolha uma nova data para remarcar</h3>

                        <div className="flex items-center justify-between mb-4">
                            <button
                                onClick={() => setRemarqueMonth(new Date(remarqueMonth.getFullYear(), remarqueMonth.getMonth() - 1))}
                                className={`p-2 rounded ${darkMode ? 'hover:bg-dark-600' : 'hover:bg-gray-200'}`}
                            >
                                <ChevronLeft size={20} className={textColor} />
                            </button>
                            <span className={`text-lg font-semibold ${textColor}`}>
                                {remarqueMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                            </span>
                            <button
                                onClick={() => setRemarqueMonth(new Date(remarqueMonth.getFullYear(), remarqueMonth.getMonth() + 1))}
                                className={`p-2 rounded ${darkMode ? 'hover:bg-dark-600' : 'hover:bg-gray-200'}`}
                            >
                                <ChevronRight size={20} className={textColor} />
                            </button>
                        </div>

                        <div className="grid grid-cols-7 gap-2 mb-4">
                            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                                <div key={day} className={`text-center text-xs font-bold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {day}
                                </div>
                            ))}
                            {Array.from({ length: new Date(remarqueMonth.getFullYear(), remarqueMonth.getMonth(), 1).getDay() }).map((_, i) => (
                                <div key={`empty-${i}`} />
                            ))}
                            {Array.from({ length: new Date(remarqueMonth.getFullYear(), remarqueMonth.getMonth() + 1, 0).getDate() }).map((_, i) => {
                                const day = i + 1
                                const dateStr = `${remarqueMonth.getFullYear()}-${String(remarqueMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                                return (
                                    <button
                                        key={day}
                                        onClick={() => handleRemarque(dateStr)}
                                        className={`p-2 rounded text-sm font-semibold transition ${darkMode
                                            ? 'bg-dark-600 hover:bg-blue-600 text-gray-300'
                                            : 'bg-gray-200 hover:bg-blue-500 text-gray-700'
                                            }`}
                                    >
                                        {day}
                                    </button>
                                )
                            })}
                        </div>

                        <button
                            onClick={() => setShowRemarqueCalendar(false)}
                            className={`w-full px-4 py-2 rounded-lg transition ${darkMode ? 'bg-dark-600 hover:bg-dark-500' : 'bg-gray-200 hover:bg-gray-300'} ${textColor}`}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}