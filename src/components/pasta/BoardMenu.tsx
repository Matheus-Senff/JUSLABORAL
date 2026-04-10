import React, { useState } from 'react'
import {
  X, Activity, Archive, Sliders, Zap, Settings, RotateCw, Trash2,
  Plus, ToggleLeft, ToggleRight, ChevronDown, Check, Palette
} from 'lucide-react'
import { usePastaStore } from './pastaStore'
import { CustomFieldType, AutomationTrigger, AutomationAction, LabelColor } from './types'

type Tab = 'atividade' | 'arquivados' | 'campos' | 'automacoes' | 'configuracoes'

const BG_OPTIONS = [
  { id: 'default',  label: 'Padrão',   cls: 'bg-gradient-to-br from-slate-700 to-gray-900' },
  { id: 'ocean',    label: 'Oceano',   cls: 'bg-gradient-to-br from-blue-900 to-cyan-900' },
  { id: 'forest',   label: 'Floresta', cls: 'bg-gradient-to-br from-green-800 to-emerald-900' },
  { id: 'sunset',   label: 'Pôr do sol', cls: 'bg-gradient-to-br from-orange-700 to-red-900' },
  { id: 'purple',   label: 'Roxo',     cls: 'bg-gradient-to-br from-purple-800 to-indigo-900' },
  { id: 'rose',     label: 'Rosa',     cls: 'bg-gradient-to-br from-pink-700 to-rose-900' },
  { id: 'light',    label: 'Claro',    cls: 'bg-gradient-to-br from-blue-50 to-indigo-100' },
  { id: 'warm',     label: 'Quente',   cls: 'bg-gradient-to-br from-amber-100 to-orange-100' },
]

const TRIGGER_LABELS: Record<string, string> = {
  card_moved_to_column: 'Cartão movido para lista',
  card_created: 'Cartão criado',
  checklist_completed: 'Checklist concluído',
  due_date_passed: 'Data de vencimento passada',
}

const ACTION_LABELS: Record<string, string> = {
  add_label: 'Adicionar etiqueta',
  set_due_date_done: 'Marcar data como concluída',
  move_to_column: 'Mover para lista',
  archive_card: 'Arquivar cartão',
}

const LABEL_COLORS_LIST: { color: LabelColor; label: string }[] = [
  { color: 'green',  label: 'Prioridade Baixa' },
  { color: 'yellow', label: 'Em Análise' },
  { color: 'orange', label: 'Atenção' },
  { color: 'red',    label: 'Urgente' },
  { color: 'purple', label: 'Revisão' },
  { color: 'blue',   label: 'Informação' },
]

const LABEL_BG: Record<LabelColor, string> = {
  green: 'bg-green-500', yellow: 'bg-yellow-400', orange: 'bg-orange-500',
  red: 'bg-red-500', purple: 'bg-purple-500', blue: 'bg-blue-500',
}

interface Props { darkMode?: boolean }

export const BoardMenu: React.FC<Props> = ({ darkMode }) => {
  const board            = usePastaStore((s) => s.board)
  const setBoardMenuOpen = usePastaStore((s) => s.setBoardMenuOpen)
  const restoreCard      = usePastaStore((s) => s.restoreCard)
  const deleteCard       = usePastaStore((s) => s.deleteCard)
  const addCustomField   = usePastaStore((s) => s.addCustomField)
  const updateCustomField = usePastaStore((s) => s.updateCustomField)
  const deleteCustomField = usePastaStore((s) => s.deleteCustomField)
  const addAutomation    = usePastaStore((s) => s.addAutomation)
  const toggleAutomation = usePastaStore((s) => s.toggleAutomation)
  const deleteAutomation = usePastaStore((s) => s.deleteAutomation)
  const setBoardBackground = usePastaStore((s) => s.setBoardBackground)

  const [tab, setTab] = useState<Tab>('atividade')
  const [showAddField, setShowAddField] = useState(false)
  const [newFieldName, setNewFieldName] = useState('')
  const [newFieldType, setNewFieldType] = useState<CustomFieldType>('text')
  const [newFieldOptions, setNewFieldOptions] = useState('')
  const [showAddAuto, setShowAddAuto] = useState(false)
  const [newAutoName, setNewAutoName] = useState('')
  const [newAutoTrigger, setNewAutoTrigger] = useState<AutomationTrigger>('card_moved_to_column')
  const [newAutoTriggerCol, setNewAutoTriggerCol] = useState('')
  const [newAutoAction, setNewAutoAction] = useState<AutomationAction>('set_due_date_done')
  const [newAutoLabelColor, setNewAutoLabelColor] = useState<LabelColor>('blue')
  const [newAutoActionCol, setNewAutoActionCol] = useState('')

  const dm = darkMode
  const panel = dm ? 'bg-dark-800 border-dark-700 text-gray-100' : 'bg-white border-gray-200 text-gray-900'
  const item  = dm ? 'bg-dark-700 border-dark-600' : 'bg-gray-50 border-gray-200'
  const btn   = dm ? 'bg-dark-600 hover:bg-dark-500 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
  const input = dm ? 'bg-dark-700 border-dark-500 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900'

  const archived = board.columns.flatMap((col) =>
    col.cards.filter((c) => c.archived).map((c) => ({ card: c, colTitle: col.title }))
  )

  const TABS: { id: Tab; icon: React.ElementType; label: string }[] = [
    { id: 'atividade',      icon: Activity,  label: 'Atividade'   },
    { id: 'arquivados',     icon: Archive,   label: 'Arquivados'  },
    { id: 'campos',         icon: Sliders,   label: 'Campos'      },
    { id: 'automacoes',     icon: Zap,       label: 'Automações'  },
    { id: 'configuracoes',  icon: Settings,  label: 'Config.'     },
  ]

  const handleAddField = () => {
    if (!newFieldName.trim()) return
    const field = newFieldType === 'dropdown'
      ? { name: newFieldName.trim(), type: newFieldType, options: newFieldOptions.split(',').map((o) => o.trim()).filter(Boolean) }
      : { name: newFieldName.trim(), type: newFieldType }
    addCustomField(field)
    setNewFieldName(''); setNewFieldType('text'); setNewFieldOptions(''); setShowAddField(false)
  }

  const handleAddAuto = () => {
    if (!newAutoName.trim()) return
    addAutomation({
      name: newAutoName.trim(),
      trigger: { type: newAutoTrigger, columnId: newAutoTriggerCol || undefined },
      action: {
        type: newAutoAction,
        labelColor: newAutoAction === 'add_label' ? newAutoLabelColor : undefined,
        columnId: newAutoAction === 'move_to_column' ? newAutoActionCol : undefined,
      },
      enabled: true,
    })
    setNewAutoName(''); setShowAddAuto(false)
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end" onClick={() => setBoardMenuOpen(false)}>
      <div
        className={`w-80 h-full border-l shadow-2xl flex flex-col ${panel}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-4 py-3 border-b ${dm ? 'border-dark-600' : 'border-gray-200'}`}>
          <h2 className="font-bold text-base">Menu do Quadro</h2>
          <button onClick={() => setBoardMenuOpen(false)} className={`p-1 rounded ${dm ? 'hover:bg-dark-600 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className={`flex border-b ${dm ? 'border-dark-600' : 'border-gray-200'}`}>
          {TABS.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition ${
                tab === id
                  ? (dm ? 'text-blue-400 border-b-2 border-blue-400' : 'text-blue-600 border-b-2 border-blue-600')
                  : (dm ? 'text-gray-500 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700')
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">

          {/* ── ATIVIDADE ── */}
          {tab === 'atividade' && (
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${dm ? 'text-gray-500' : 'text-gray-400'}`}>
                Atividade recente
              </p>
              {board.activity.length === 0 && (
                <p className={`text-sm ${dm ? 'text-gray-500' : 'text-gray-400'}`}>Nenhuma atividade ainda.</p>
              )}
              {board.activity.map((act) => (
                <div key={act.id} className={`flex gap-2 mb-2 p-2 rounded-lg border ${item}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${dm ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'}`}>
                    {act.actor.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`text-xs font-semibold ${dm ? 'text-gray-200' : 'text-gray-800'}`}>{act.actor} </span>
                    <span className={`text-xs ${dm ? 'text-gray-300' : 'text-gray-600'}`}>{act.description}</span>
                    <p className={`text-[10px] mt-0.5 ${dm ? 'text-gray-500' : 'text-gray-400'}`}>{act.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── ARQUIVADOS ── */}
          {tab === 'arquivados' && (
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${dm ? 'text-gray-500' : 'text-gray-400'}`}>
                Itens arquivados ({archived.length})
              </p>
              {archived.length === 0 && (
                <p className={`text-sm ${dm ? 'text-gray-500' : 'text-gray-400'}`}>Nenhum item arquivado.</p>
              )}
              {archived.map(({ card, colTitle }) => (
                <div key={card.id} className={`p-2 rounded-lg border mb-2 ${item}`}>
                  <p className={`text-xs font-medium truncate ${dm ? 'text-gray-200' : 'text-gray-800'}`}>{card.title}</p>
                  <p className={`text-[10px] mb-1.5 ${dm ? 'text-gray-500' : 'text-gray-400'}`}>Lista: {colTitle}</p>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => restoreCard(card.id)}
                      className={`flex-1 flex items-center justify-center gap-1 text-xs py-1 rounded font-medium ${dm ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                    >
                      <RotateCw size={10} /> Restaurar
                    </button>
                    <button
                      onClick={() => deleteCard(card.id)}
                      className="flex-1 flex items-center justify-center gap-1 text-xs py-1 rounded font-medium bg-red-500 hover:bg-red-600 text-white"
                    >
                      <Trash2 size={10} /> Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── CAMPOS PERSONALIZADOS ── */}
          {tab === 'campos' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className={`text-xs font-semibold uppercase tracking-wide ${dm ? 'text-gray-500' : 'text-gray-400'}`}>
                  Campos personalizados
                </p>
                <button
                  onClick={() => setShowAddField(!showAddField)}
                  className={`p-1 rounded text-xs ${dm ? 'hover:bg-dark-600 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                >
                  <Plus size={14} />
                </button>
              </div>

              {showAddField && (
                <div className={`p-3 rounded-lg border mb-3 space-y-2 ${item}`}>
                  <input
                    autoFocus
                    value={newFieldName}
                    onChange={(e) => setNewFieldName(e.target.value)}
                    placeholder="Nome do campo..."
                    className={`w-full text-xs rounded px-2 py-1.5 border ${input}`}
                  />
                  <select
                    value={newFieldType}
                    onChange={(e) => setNewFieldType(e.target.value as CustomFieldType)}
                    className={`w-full text-xs rounded px-2 py-1.5 border ${input}`}
                  >
                    <option value="text">Texto</option>
                    <option value="number">Número</option>
                    <option value="checkbox">Checkbox</option>
                    <option value="dropdown">Lista suspensa</option>
                    <option value="date">Data</option>
                  </select>
                  {newFieldType === 'dropdown' && (
                    <input
                      value={newFieldOptions}
                      onChange={(e) => setNewFieldOptions(e.target.value)}
                      placeholder="Opções separadas por vírgula..."
                      className={`w-full text-xs rounded px-2 py-1.5 border ${input}`}
                    />
                  )}
                  <div className="flex gap-2">
                    <button onClick={handleAddField} className="flex-1 bg-blue-600 text-white text-xs py-1.5 rounded font-medium hover:bg-blue-700">
                      Adicionar
                    </button>
                    <button onClick={() => setShowAddField(false)} className={`px-3 text-xs rounded ${btn}`}>
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {board.customFields.map((field) => (
                <div key={field.id} className={`flex items-center gap-2 p-2 rounded-lg border mb-1.5 ${item}`}>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium truncate ${dm ? 'text-gray-200' : 'text-gray-800'}`}>{field.name}</p>
                    <p className={`text-[10px] ${dm ? 'text-gray-500' : 'text-gray-400'}`}>{
                      field.type === 'text' ? 'Texto' :
                      field.type === 'number' ? 'Número' :
                      field.type === 'checkbox' ? 'Checkbox' :
                      field.type === 'dropdown' ? `Lista (${field.options?.length || 0})` : 'Data'
                    }</p>
                  </div>
                  <button
                    onClick={() => deleteCustomField(field.id)}
                    className={`p-1 rounded hover:text-red-500 ${dm ? 'text-gray-500' : 'text-gray-400'}`}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ── AUTOMAÇÕES ── */}
          {tab === 'automacoes' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className={`text-xs font-semibold uppercase tracking-wide ${dm ? 'text-gray-500' : 'text-gray-400'}`}>
                  Automações ({board.automations.filter((a) => a.enabled).length} ativas)
                </p>
                <button
                  onClick={() => setShowAddAuto(!showAddAuto)}
                  className={`p-1 rounded ${dm ? 'hover:bg-dark-600 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                >
                  <Plus size={14} />
                </button>
              </div>

              {showAddAuto && (
                <div className={`p-3 rounded-lg border mb-3 space-y-2 ${item}`}>
                  <input
                    autoFocus
                    value={newAutoName}
                    onChange={(e) => setNewAutoName(e.target.value)}
                    placeholder="Nome da automação..."
                    className={`w-full text-xs rounded px-2 py-1.5 border ${input}`}
                  />
                  <div>
                    <label className={`text-[10px] font-semibold uppercase ${dm ? 'text-gray-500' : 'text-gray-400'}`}>Gatilho</label>
                    <select
                      value={newAutoTrigger}
                      onChange={(e) => setNewAutoTrigger(e.target.value as AutomationTrigger)}
                      className={`w-full text-xs rounded px-2 py-1.5 mt-0.5 border ${input}`}
                    >
                      {Object.entries(TRIGGER_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                    {newAutoTrigger === 'card_moved_to_column' && (
                      <select
                        value={newAutoTriggerCol}
                        onChange={(e) => setNewAutoTriggerCol(e.target.value)}
                        className={`w-full text-xs rounded px-2 py-1.5 mt-1 border ${input}`}
                      >
                        <option value="">Qualquer lista</option>
                        {board.columns.map((col) => (
                          <option key={col.id} value={col.id}>{col.title}</option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div>
                    <label className={`text-[10px] font-semibold uppercase ${dm ? 'text-gray-500' : 'text-gray-400'}`}>Ação</label>
                    <select
                      value={newAutoAction}
                      onChange={(e) => setNewAutoAction(e.target.value as AutomationAction)}
                      className={`w-full text-xs rounded px-2 py-1.5 mt-0.5 border ${input}`}
                    >
                      {Object.entries(ACTION_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                    {newAutoAction === 'add_label' && (
                      <select
                        value={newAutoLabelColor}
                        onChange={(e) => setNewAutoLabelColor(e.target.value as LabelColor)}
                        className={`w-full text-xs rounded px-2 py-1.5 mt-1 border ${input}`}
                      >
                        {LABEL_COLORS_LIST.map(({ color, label }) => (
                          <option key={color} value={color}>{label}</option>
                        ))}
                      </select>
                    )}
                    {newAutoAction === 'move_to_column' && (
                      <select
                        value={newAutoActionCol}
                        onChange={(e) => setNewAutoActionCol(e.target.value)}
                        className={`w-full text-xs rounded px-2 py-1.5 mt-1 border ${input}`}
                      >
                        <option value="">Selecionar lista...</option>
                        {board.columns.map((col) => (
                          <option key={col.id} value={col.id}>{col.title}</option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleAddAuto} className="flex-1 bg-blue-600 text-white text-xs py-1.5 rounded font-medium hover:bg-blue-700">
                      Criar
                    </button>
                    <button onClick={() => setShowAddAuto(false)} className={`px-3 text-xs rounded ${btn}`}>
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {board.automations.map((auto) => (
                <div key={auto.id} className={`p-2.5 rounded-lg border mb-2 ${item}`}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className={`text-xs font-medium flex-1 ${dm ? 'text-gray-200' : 'text-gray-800'}`}>{auto.name}</p>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => toggleAutomation(auto.id)}
                        className={auto.enabled ? 'text-green-500' : (dm ? 'text-gray-600' : 'text-gray-400')}
                        title={auto.enabled ? 'Desativar' : 'Ativar'}
                      >
                        {auto.enabled ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                      </button>
                      <button onClick={() => deleteAutomation(auto.id)} className={`hover:text-red-500 ${dm ? 'text-gray-600' : 'text-gray-400'}`}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  <p className={`text-[10px] ${dm ? 'text-gray-500' : 'text-gray-400'}`}>
                    SE: {TRIGGER_LABELS[auto.trigger.type] || auto.trigger.type}
                    {auto.trigger.columnId && ` (${board.columns.find((c) => c.id === auto.trigger.columnId)?.title || '?'})`}
                  </p>
                  <p className={`text-[10px] ${dm ? 'text-gray-500' : 'text-gray-400'}`}>
                    ENTÃO: {ACTION_LABELS[auto.action.type] || auto.action.type}
                    {auto.action.labelColor && ` (${auto.action.labelColor})`}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* ── CONFIGURAÇÕES / BACKGROUND ── */}
          {tab === 'configuracoes' && (
            <div className="space-y-4">
              <div>
                <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${dm ? 'text-gray-500' : 'text-gray-400'}`}>
                  <Palette size={12} className="inline mr-1" />Fundo do quadro
                </p>
                <div className="grid grid-cols-4 gap-1.5">
                  {BG_OPTIONS.map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => setBoardBackground(bg.id)}
                      className={`h-12 rounded-lg ${bg.cls} transition hover:opacity-90 relative`}
                      title={bg.label}
                    >
                      {board.backgroundColor === bg.id && (
                        <Check size={14} className="absolute inset-0 m-auto text-white drop-shadow" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-1.5 mt-1.5">
                  {BG_OPTIONS.map((bg) => (
                    <p key={bg.id} className={`text-[9px] text-center truncate ${dm ? 'text-gray-500' : 'text-gray-400'}`}>{bg.label}</p>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
