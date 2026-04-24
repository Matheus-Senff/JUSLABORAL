import React, { useState, useMemo, useEffect } from 'react'
import { Download, FileText, PencilIcon, Paperclip, ExternalLink, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Sliders, X } from 'lucide-react'
import { ProcessDetailView } from './ProcessDetailView'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { Process, ProcessEvent } from '../types'
import { usePastaStore } from './pasta/pastaStore'
import { autocompleteSearch, fuzzySearch } from '../utils/fuzzySearch'
// Dados mockados - eu consolidei isso tudo aqui pra não repetir código
import { mockUsers, mockUFs, mockCidades, generateMockProcess } from '../data/mockData'

// Tabela de processos que eu construí desde o início
interface ProcessTableProps {
  darkMode: boolean
  type: 'estadual' | 'federal'
  statusFilter?: string
  onAddEvent?: (event: ProcessEvent) => void
  initialProcessId?: string
}

// TODO: fazer virtualization pra melhorar performance com muitos registros
export const ProcessTable: React.FC<ProcessTableProps> = ({ darkMode, type, statusFilter, onAddEvent, initialProcessId }) => {
  const board = usePastaStore((s) => s.board)

  const [filters, setFilters] = useState<Record<string, string>>({
    dataInicio: '',
    dataFinal: '',
    numero: '',
    parceiro: '',
    cliente: '',
    cpf: '',
    processo: '',
    cidade: '',
    uf: '',
    responsavel: '',
    status: statusFilter || '',
    setor: '',
    nProcesso: '',
    dataAlteracaoSetor: '',
    dataAlteracaoResponsavel: '',
    dataAlteracaoStatus: '',
  })

  // paginação - FIXME: colocar isso em um component separado depois
  const [currentPage, setCurrentPage] = useState(1)
  const [showDetailedFilter, setShowDetailedFilter] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null)
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [selectedUser, setSelectedUser] = useState<string | null>('geral')
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null)
  const [showProcessDetailModal, setShowProcessDetailModal] = useState(false)
  const [showSchedulingModal, setShowSchedulingModal] = useState(false)
  const [activeSuggestionField, setActiveSuggestionField] = useState<string | null>(null)
  const [editingProcess, setEditingProcess] = useState<Process | null>(null)
  const [editFormData, setEditFormData] = useState<Process | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailView, setShowDetailView] = useState(false)
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showSetorFilterDropdown, setShowSetorFilterDropdown] = useState(false)
  const [suggestions, setSuggestions] = useState<Record<string, string[]>>({
    numero: [],
    parceiro: [],
    cliente: [],
    cpf: [],
    processo: [],
    cidade: [],
    uf: [],
    responsavel: [],
    status: [],
    setor: [],
    nProcesso: [],
  })
  const [formData, setFormData] = useState({
    atividade: '',
    hora: '',
    local: '',
    solicitante: '',
    parceiro: '',
    cliente: '',
    observacao: '',
    responsavel: '',
    status: 'pendente'
  })
  const itemsPerPage = 10

  // Mock data - 26,103 processes
  const _telefones = ['(47) 9 9801-0012', '(47) 9 8823-0043', '(11) 9 7734-0003', '(41) 9 6645-0004', '(51) 9 5556-0075', '(21) 9 4467-0086']
  const _naturezas = ['Acidente de Trabalho', 'Doença Ocupacional', 'Invalidez Permanente', 'Auxílio-Doença', 'Aposentadoria por Invalidez']
  const _tipos = ['CAT', 'Benefício Previdenciário', 'Indenizatório', 'Revisional', 'Recursal']
  const _orgaos = ['INSS', 'TRT 12ª Região', 'SEJU', 'MTE', 'TRT 4ª Região', 'TRT 9ª Região']
  const _fases = ['Administrativo', 'Judicial 1ª Instância', 'Judicial 2ª Instância', 'Recursal', 'Execução']
  const _setores = ['Administrativo', 'Jurídico', 'Previdenciário', 'Contencioso']
  const _andamentos = ['Em análise', 'Aguardando documentação', 'Em julgamento', 'Recurso pendente', 'Aguardando perícia']
  const _emails = ['cliente@email.com', 'contato@provedor.com.br', 'pessoal@gmail.com', 'trabalho@outlook.com']
  const mockProcesses: Process[] = Array.from({ length: 26103 }, (_, i) => {
    const process = generateMockProcess(i + 1, type)
    return {
      id: process.id,
      numero: i + 1,
      parceiro: process.parceiro,
      cliente: process.cliente,
      cpf: process.cpf,
      processo: `CAT ${String(i + 1).padStart(8, '0')}`,
      cidade: process.comarca,
      uf: process.uf,
      responsavel: mockUsers[i % (mockUsers.length - 1) + 1]?.name || 'Não atribuído',
      dataInicio: process.dataInicio,
      status: process.status,
      ultimaAlteracao: new Date(2026, 3, Math.floor(Math.random() * 15) + 1, Math.floor(Math.random() * 24), Math.floor(Math.random() * 60)).toLocaleString('pt-BR'),
      telefone: _telefones[i % _telefones.length],
      email: _emails[i % _emails.length],
      natureza: _naturezas[i % _naturezas.length],
      tipo: _tipos[i % _tipos.length],
      orgao: _orgaos[i % _orgaos.length],
      endereco: `Rua ${['das Flores', 'Brasil', 'XV de Novembro', 'Independência'][i % 4]}, ${(i % 999) + 1} - ${process.comarca}`,
      nProcesso: `${String(i + 1).padStart(7, '0')}-${(i % 99) + 1}.${2020 + (i % 6)}.5.12.${(i % 9999).toString().padStart(4, '0')}`,
      fase: _fases[i % _fases.length],
      setor: _setores[i % _setores.length],
      andamento: _andamentos[i % _andamentos.length],
    }
  })

  // Update filter when selectedUser changes
  useEffect(() => {
    if (selectedUser === 'geral') {
      handleFilterChange('responsavel', '')
    } else {
      const selectedUserName = mockUsers.find(u => u.id === selectedUser)?.name || ''
      handleFilterChange('responsavel', selectedUserName)
    }
  }, [selectedUser])

  // Initialize status filter from prop
  useEffect(() => {
    if (statusFilter && filters.status !== statusFilter) {
      setFilters(prev => ({ ...prev, status: statusFilter }))
    }
  }, [statusFilter])

  // Function to clear all filters
  const handleClearFilters = () => {
    setFilters({
      dataInicio: '',
      dataFinal: '',
      numero: '',
      parceiro: '',
      cliente: '',
      cpf: '',
      processo: '',
      cidade: '',
      uf: '',
      responsavel: '',
      status: '',
      setor: '',
      nProcesso: '',
      dataAlteracaoSetor: '',
      dataAlteracaoResponsavel: '',
      dataAlteracaoStatus: '',
    })
    setSelectedUser('geral')
    setCurrentPage(1)
    setShowDetailedFilter(false)
  }

  // Auto-abrir processo quando initialProcessId é fornecido (ex: vindo da Agenda)
  useEffect(() => {
    if (!initialProcessId) return
    const found = mockProcesses.find(p => p.id === initialProcessId)
    if (found) {
      setSelectedProcess(found)
      setShowDetailView(true)
    }
  }, [initialProcessId])

  // Filter data
  const filteredProcesses = useMemo(() => {
    let filtered = mockProcesses.filter(process => {
      let matches = true

      // Numero
      if (filters.numero) {
        const fuzzyMatches = fuzzySearch(
          filters.numero,
          [process.numero.toString()],
          (x) => x,
          1,
          2
        )
        matches = matches && (fuzzyMatches.length > 0 || process.numero.toString().includes(filters.numero))
      }

      // Parceiro
      if (filters.parceiro && matches) {
        const fuzzyMatches = fuzzySearch(
          filters.parceiro,
          [process.parceiro],
          (x) => x,
          1,
          2
        )
        matches = matches && (fuzzyMatches.length > 0 || process.parceiro.toLowerCase().includes(filters.parceiro.toLowerCase()))
      }

      // Cliente
      if (filters.cliente && matches) {
        const fuzzyMatches = fuzzySearch(
          filters.cliente,
          [process.cliente],
          (x) => x,
          1,
          3
        )
        matches = matches && (fuzzyMatches.length > 0 || process.cliente.toLowerCase().includes(filters.cliente.toLowerCase()))
      }

      // CPF
      if (filters.cpf && matches) {
        matches = matches && process.cpf.includes(filters.cpf)
      }

      // Processo
      if (filters.processo && matches) {
        matches = matches && process.processo.includes(filters.processo)
      }

      // Cidade
      if (filters.cidade && matches) {
        matches = matches && process.cidade.toLowerCase().includes(filters.cidade.toLowerCase())
      }

      // UF
      if (filters.uf && matches) {
        matches = matches && process.uf.includes(filters.uf.toUpperCase())
      }

      // Responsavel
      if (filters.responsavel && matches) {
        matches = matches && process.responsavel.toLowerCase().includes(filters.responsavel.toLowerCase())
      }

      // Status - correspondência exata para evitar falsos positivos
      if (filters.status && matches) {
        matches = matches && process.status.toLowerCase() === filters.status.toLowerCase()
      }

      // Setor
      if (filters.setor && matches) {
        matches = matches && (process.setor || '').toLowerCase().includes(filters.setor.toLowerCase())
      }

      // N Processo
      if (filters.nProcesso && matches) {
        matches = matches && (process.nProcesso || '').toLowerCase().includes(filters.nProcesso.toLowerCase())
      }

      return matches
    })

    // Apply sorting by ultimaAlteracao if sortOrder is set
    if (sortOrder) {
      filtered = filtered.sort((a, b) => {
        const dateA = new Date(a.ultimaAlteracao).getTime()
        const dateB = new Date(b.ultimaAlteracao).getTime()
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
      })
    }

    return filtered
  }, [filters, sortOrder])

  const totalPages = Math.ceil(filteredProcesses.length / itemsPerPage)
  const paginatedData = filteredProcesses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value })
    setCurrentPage(1)

    // Generate autocomplete suggestions
    if (value.trim()) {
      let generatedSuggestions: string[] = []

      if (key === 'numero') {
        generatedSuggestions = autocompleteSearch(
          value,
          mockProcesses.map((p) => p.numero.toString()),
          (x) => x,
          5
        )
      } else if (key === 'parceiro') {
        generatedSuggestions = autocompleteSearch(
          value,
          ['UHLMANN & SANTOS', 'SILVA ADVOCACIA', 'COSTA & CIA', 'MARTINS LEGAL'],
          (x) => x,
          5
        )
      } else if (key === 'cliente') {
        generatedSuggestions = autocompleteSearch(
          value,
          mockProcesses.map((p) => p.cliente),
          (x) => x,
          5
        )
      } else if (key === 'cpf') {
        generatedSuggestions = autocompleteSearch(
          value,
          mockProcesses.map((p) => p.cpf),
          (x) => x,
          5
        )
      } else if (key === 'processo') {
        generatedSuggestions = autocompleteSearch(
          value,
          mockProcesses.map((p) => p.processo),
          (x) => x,
          5
        )
      } else if (key === 'cidade') {
        generatedSuggestions = autocompleteSearch(
          value,
          ['PAPANDUVA', 'CANOINHAS', 'PORTO ALEGRE', 'CURITIBA', 'SÃO PAULO'],
          (x) => x,
          5
        )
      } else if (key === 'uf') {
        generatedSuggestions = autocompleteSearch(
          value,
          ['SC', 'RS', 'PR', 'SP', 'RJ'],
          (x) => x,
          5
        )
      }

      setSuggestions({ ...suggestions, [key]: generatedSuggestions })
    } else {
      setSuggestions({
        numero: [],
        parceiro: [],
        cliente: [],
        cpf: [],
        processo: [],
        cidade: [],
        uf: [],
        responsavel: [],
        status: [],
        setor: [],
        nProcesso: [],
      })
    }
  }

  const handleSuggestionClick = (key: string, value: string) => {
    handleFilterChange(key, value)
    setActiveSuggestionField(null)
  }

  const handleExport = async () => {
    try {
      const table = document.querySelector('table')
      if (!table) {
        alert('Tabela não encontrada')
        return
      }

      const canvas = await html2canvas(table, { scale: 2 })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('l', 'mm', 'a4')
      const imgWidth = 297
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      pdf.addImage(imgData, 'PNG', 5, 5, imgWidth - 10, imgHeight)
      pdf.save(`processo-${type}.pdf`)
    } catch (error) {
      console.error('Erro ao exportar PDF:', error)
      alert('Erro ao exportar tabela para PDF')
    }
  }

  const handleProcessClick = (process: Process) => {
    setSelectedProcess(process)
    setShowDetailView(true)
  }

  const handleEditClick = (process: Process) => {
    setEditingProcess(process)
    setEditFormData({ ...process })
    setShowEditModal(true)
  }

  const handleSaveEdit = () => {
    if (!editFormData) return
    const index = mockProcesses.findIndex(p => p.id === editingProcess?.id)
    if (index !== -1) {
      mockProcesses[index] = editFormData
    }
    setShowEditModal(false)
    setEditingProcess(null)
    setEditFormData(null)
  }

  const handleDeleteClick = (processId: string) => {
    if (!confirm('Deseja excluir este processo?')) return
    const index = mockProcesses.findIndex(p => p.id === processId)
    if (index !== -1) {
      mockProcesses.splice(index, 1)
    }
  }

  const handleSchedulingClick = () => {
    setShowSchedulingModal(true)
    setFormData({
      atividade: '',
      hora: '',
      local: '',
      solicitante: '',
      parceiro: selectedProcess?.parceiro || '',
      cliente: selectedProcess?.cliente || '',
      observacao: '',
      responsavel: selectedProcess?.responsavel || '',
      status: 'pendente'
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSaveScheduling = () => {
    if (formData.atividade && formData.hora) {
      console.log('Agendamento criado:', formData)
      setShowSchedulingModal(false)
      setShowProcessDetailModal(false)
      setSelectedProcess(null)
      setFormData({
        atividade: '',
        hora: '',
        local: '',
        solicitante: '',
        parceiro: '',
        cliente: '',
        observacao: '',
        responsavel: '',
        status: 'pendente'
      })
    }
  }

  const getLinkedDocuments = () => {
    if (!selectedProcess) return []
    return board.columns
      .flatMap(col => col.cards)
      .filter(card =>
        card.linkedProcessId &&
        card.linkedProcessId === selectedProcess.id.toString() &&
        card.linkedProcessType === type
      )
  }

  if (showDetailView && selectedProcess) {
    return (
      <ProcessDetailView
        process={selectedProcess}
        type={type}
        darkMode={darkMode}
        onBack={() => setShowDetailView(false)}
        onAddEvent={onAddEvent}
      />
    )
  }

  const bgColor = darkMode ? 'bg-dark-900' : 'bg-gray-50'
  const tableBg = darkMode ? 'bg-dark-500' : 'bg-white'
  const headerBg = darkMode ? 'bg-dark-600' : 'bg-gray-100'
  const borderColor = darkMode ? 'border-dark-600' : 'border-gray-200'
  const textColor = darkMode ? 'text-white' : 'text-gray-900'
  const inputBg = darkMode ? 'bg-dark-700 text-white' : 'bg-white text-gray-900'
  const inputBorder = darkMode ? 'border-dark-600' : 'border-gray-300'
  const modalBg = darkMode ? 'bg-dark-800' : 'bg-white'

  return (
    <div className={`p-6 ${bgColor} min-h-screen`}>
      {/* Filter Header */}
      <div className={`${tableBg} rounded-t-lg p-4 border ${borderColor}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${textColor}`}>
            Filtros
          </h3>
          <button
            onClick={handleExport}
            className={`flex items-center gap-2 px-3 py-1 rounded transition ${darkMode ? 'bg-dark-700 hover:bg-dark-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
          >
            <Download size={18} />
          </button>
        </div>

        <div className="mb-4 flex gap-3">
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className={`flex items-center gap-2 px-3 py-2 text-sm border rounded transition ${inputBg} ${inputBorder}`}
            >
              👤 {selectedUser ? mockUsers.find(u => u.id === selectedUser)?.name || 'Usuário Responsável' : 'Usuário Responsável'}
            </button>
            {showUserDropdown && (
              <div className={`absolute top-full left-0 mt-2 w-56 rounded-lg shadow-lg z-10 border ${borderColor} ${tableBg}`}>
                {mockUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      setSelectedUser(user.id)
                      setShowUserDropdown(false)
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition border-b ${borderColor} ${selectedUser === user.id ? (darkMode ? 'bg-dark-600' : 'bg-gray-100') : (darkMode ? 'hover:bg-dark-600' : 'hover:bg-gray-50')} ${textColor}`}
                  >
                    <div className="font-medium">{user.name}</div>
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setShowDetailedFilter(!showDetailedFilter)}
            className={`flex items-center gap-2 px-3 py-2 text-sm border rounded transition ${inputBg} ${inputBorder}`}
          >
            <Sliders size={16} />
            Filtro Detalhado
          </button>

          <button
            onClick={handleClearFilters}
            className="flex items-center gap-2 px-3 py-2 text-sm font-semibold border rounded transition bg-yellow-400 hover:bg-yellow-500 text-gray-900 border-yellow-600"
            title="Limpar todos os filtros"
          >
            <X size={16} />
            Limpar Filtro
          </button>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className={`block text-xs font-medium mb-1 ${textColor}`}>Data Inicial</label>
            <div className="relative">
              <input
                type="text"
                placeholder="dd/mm/aaaa"
                className={`w-full px-3 py-2 text-sm border rounded ${inputBg} ${inputBorder}`}
                value={filters.dataInicio}
                onChange={(e) => handleFilterChange('dataInicio', e.target.value)}
              />
              <CalendarIcon className="absolute right-3 top-2.5" size={16} />
            </div>
          </div>

          <div className="flex-1">
            <label className={`block text-xs font-medium mb-1 ${textColor}`}>Data Final</label>
            <div className="relative">
              <input
                type="text"
                placeholder="dd/mm/aaaa"
                className={`w-full px-3 py-2 text-sm border rounded ${inputBg} ${inputBorder}`}
                value={filters.dataFinal}
                onChange={(e) => handleFilterChange('dataFinal', e.target.value)}
              />
              <CalendarIcon className="absolute right-3 top-2.5" size={16} />
            </div>
          </div>
        </div>

        {/* Filtro Detalhado expandido */}
        {showDetailedFilter && (
          <div className={`mt-4 pt-4 border-t ${borderColor}`}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className={`block text-xs font-medium mb-1 ${textColor}`}>Setor</label>
                <div className="relative">
                  <button
                    onClick={() => setShowSetorFilterDropdown(!showSetorFilterDropdown)}
                    className={`w-full px-3 py-2 text-sm border rounded text-left flex items-center justify-between ${inputBg} ${inputBorder}`}
                  >
                    <span>{filters.setor || 'Todos'}</span>
                    <span className="opacity-50 text-xs">&#9660;</span>
                  </button>
                  {showSetorFilterDropdown && (
                    <div className={`absolute top-full left-0 mt-1 w-full rounded-lg shadow-xl z-30 border ${borderColor} ${tableBg} overflow-hidden`}>
                      <button
                        onClick={() => { handleFilterChange('setor', ''); setShowSetorFilterDropdown(false) }}
                        className={`w-full text-left px-3 py-2 text-sm border-b ${borderColor} transition ${!filters.setor ? (darkMode ? 'bg-dark-600' : 'bg-gray-100') : (darkMode ? 'hover:bg-dark-600' : 'hover:bg-gray-50')} ${textColor}`}
                      >Todos</button>
                      {['Administrativo', 'Jurídico', 'Previdenciário', 'Contencioso'].map(s => (
                        <button
                          key={s}
                          onClick={() => { handleFilterChange('setor', s); setShowSetorFilterDropdown(false) }}
                          className={`w-full text-left px-3 py-2 text-sm border-b ${borderColor} transition ${filters.setor === s ? (darkMode ? 'bg-dark-600 text-blue-400' : 'bg-blue-50 text-blue-700') : (darkMode ? 'hover:bg-dark-600' : 'hover:bg-gray-50')} ${textColor}`}
                        >{s}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1 ${textColor}`}>N° Processo</label>
                <input
                  type="text"
                  placeholder="Ex: 0000001-01.2024..."
                  className={`w-full px-3 py-2 text-sm border rounded ${inputBg} ${inputBorder}`}
                  value={filters.nProcesso}
                  onChange={(e) => handleFilterChange('nProcesso', e.target.value)}
                />
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1 ${textColor}`}>Status</label>
                <select
                  className={`w-full px-3 py-2 text-sm border rounded ${inputBg} ${inputBorder}`}
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="">Todos</option>
                  {['Não Ajuizado', 'Ajuizado', 'Pendência', 'Pendência Cumprida', 'Aguardando Ajuizamento', 'Arquivado'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1 ${textColor}`}>Data Alteração Setor</label>
                <input
                  type="date"
                  className={`w-full px-3 py-2 text-sm border rounded ${inputBg} ${inputBorder}`}
                  value={filters.dataAlteracaoSetor}
                  onChange={(e) => handleFilterChange('dataAlteracaoSetor', e.target.value)}
                />
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1 ${textColor}`}>Data Alteração Responsável</label>
                <input
                  type="date"
                  className={`w-full px-3 py-2 text-sm border rounded ${inputBg} ${inputBorder}`}
                  value={filters.dataAlteracaoResponsavel}
                  onChange={(e) => handleFilterChange('dataAlteracaoResponsavel', e.target.value)}
                />
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1 ${textColor}`}>Data Alteração Status</label>
                <input
                  type="date"
                  className={`w-full px-3 py-2 text-sm border rounded ${inputBg} ${inputBorder}`}
                  value={filters.dataAlteracaoStatus}
                  onChange={(e) => handleFilterChange('dataAlteracaoStatus', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className={`${tableBg} border-x ${borderColor}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            {/* Header with filters */}
            <thead>
              <tr className={`border-b ${borderColor} ${headerBg}`}>
                <th className="px-2 py-2 text-left font-semibold text-xs"><div>N°</div></th>
                <th className="px-2 py-2 text-left font-semibold text-xs"><div>Parceiro</div></th>
                <th className="px-2 py-2 text-left font-semibold text-xs"><div>Cliente</div></th>
                <th className="px-2 py-2 text-left font-semibold text-xs"><div>CPF</div></th>
                <th className="px-2 py-2 text-left font-semibold text-xs"><div>CAT/Nº Processo</div></th>
                <th className="px-2 py-2 text-left font-semibold text-xs"><div>Cidade/Comarca</div></th>
                <th className="px-2 py-2 text-left font-semibold text-xs"><div>UF</div></th>
                <th className="px-2 py-2 text-left font-semibold text-xs"><div>Responsável</div></th>
                <th className="px-2 py-2 text-left font-semibold text-xs"><div>Data Início</div></th>
                <th className="px-2 py-2 text-left font-semibold text-xs"><div>Status</div></th>
                <th className="px-2 py-2 text-left font-semibold text-xs"><div>Última Alteração</div></th>
              </tr>

              {/* Filter Row */}
              <tr className={`border-b ${borderColor} ${darkMode ? 'bg-dark-600' : 'bg-gray-50'}`}>
                <td className="px-2 py-1 relative">
                  <div>
                    <input type="text" placeholder="Filtro" value={filters.numero} onFocus={() => setActiveSuggestionField('numero')} onChange={(e) => handleFilterChange('numero', e.target.value)} className={`w-full px-1 py-0.5 text-xs border rounded ${inputBg} ${inputBorder}`} />
                    {activeSuggestionField === 'numero' && suggestions.numero && suggestions.numero.length > 0 && (
                      <div className={`absolute top-full left-0 mt-1 w-full rounded-lg shadow-lg z-20 border ${borderColor} ${tableBg} max-h-32 overflow-y-auto`}>
                        {suggestions.numero.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSuggestionClick('numero', suggestion)}
                            className={`w-full text-left px-3 py-2 text-xs border-b ${borderColor} transition ${darkMode ? 'hover:bg-dark-600' : 'hover:bg-gray-100'} ${textColor}`}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-2 py-1 relative">
                  <div>
                    <input type="text" placeholder="Filtro" value={filters.parceiro} onFocus={() => setActiveSuggestionField('parceiro')} onChange={(e) => handleFilterChange('parceiro', e.target.value)} className={`w-full px-1 py-0.5 text-xs border rounded ${inputBg} ${inputBorder}`} />
                    {activeSuggestionField === 'parceiro' && suggestions.parceiro && suggestions.parceiro.length > 0 && (
                      <div className={`absolute top-full left-0 mt-1 w-full rounded-lg shadow-lg z-20 border ${borderColor} ${tableBg} max-h-32 overflow-y-auto`}>
                        {suggestions.parceiro.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSuggestionClick('parceiro', suggestion)}
                            className={`w-full text-left px-3 py-2 text-xs border-b ${borderColor} transition ${darkMode ? 'hover:bg-dark-600' : 'hover:bg-gray-100'} ${textColor}`}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-2 py-1 relative">
                  <div>
                    <input type="text" placeholder="Filtro" value={filters.cliente} onFocus={() => setActiveSuggestionField('cliente')} onChange={(e) => handleFilterChange('cliente', e.target.value)} className={`w-full px-1 py-0.5 text-xs border rounded ${inputBg} ${inputBorder}`} />
                    {activeSuggestionField === 'cliente' && suggestions.cliente && suggestions.cliente.length > 0 && (
                      <div className={`absolute top-full left-0 mt-1 w-full rounded-lg shadow-lg z-20 border ${borderColor} ${tableBg} max-h-32 overflow-y-auto`}>
                        {suggestions.cliente.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSuggestionClick('cliente', suggestion)}
                            className={`w-full text-left px-3 py-2 text-xs border-b ${borderColor} transition ${darkMode ? 'hover:bg-dark-600' : 'hover:bg-gray-100'} ${textColor}`}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-2 py-1 relative">
                  <div>
                    <input type="text" placeholder="Filtro" value={filters.cpf} onFocus={() => setActiveSuggestionField('cpf')} onChange={(e) => handleFilterChange('cpf', e.target.value)} className={`w-full px-1 py-0.5 text-xs border rounded ${inputBg} ${inputBorder}`} />
                    {activeSuggestionField === 'cpf' && suggestions.cpf && suggestions.cpf.length > 0 && (
                      <div className={`absolute top-full left-0 mt-1 w-full rounded-lg shadow-lg z-20 border ${borderColor} ${tableBg} max-h-32 overflow-y-auto`}>
                        {suggestions.cpf.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSuggestionClick('cpf', suggestion)}
                            className={`w-full text-left px-3 py-2 text-xs border-b ${borderColor} transition ${darkMode ? 'hover:bg-dark-600' : 'hover:bg-gray-100'} ${textColor}`}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-2 py-1 relative">
                  <div>
                    <input type="text" placeholder="Filtro" value={filters.processo} onFocus={() => setActiveSuggestionField('processo')} onChange={(e) => handleFilterChange('processo', e.target.value)} className={`w-full px-1 py-0.5 text-xs border rounded ${inputBg} ${inputBorder}`} />
                    {activeSuggestionField === 'processo' && suggestions.processo && suggestions.processo.length > 0 && (
                      <div className={`absolute top-full left-0 mt-1 w-full rounded-lg shadow-lg z-20 border ${borderColor} ${tableBg} max-h-32 overflow-y-auto`}>
                        {suggestions.processo.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSuggestionClick('processo', suggestion)}
                            className={`w-full text-left px-3 py-2 text-xs border-b ${borderColor} transition ${darkMode ? 'hover:bg-dark-600' : 'hover:bg-gray-100'} ${textColor}`}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-2 py-1 relative">
                  <div>
                    <input type="text" placeholder="Filtro" value={filters.cidade} onFocus={() => setActiveSuggestionField('cidade')} onChange={(e) => handleFilterChange('cidade', e.target.value)} className={`w-full px-1 py-0.5 text-xs border rounded ${inputBg} ${inputBorder}`} />
                    {activeSuggestionField === 'cidade' && suggestions.cidade && suggestions.cidade.length > 0 && (
                      <div className={`absolute top-full left-0 mt-1 w-full rounded-lg shadow-lg z-20 border ${borderColor} ${tableBg} max-h-32 overflow-y-auto`}>
                        {suggestions.cidade.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSuggestionClick('cidade', suggestion)}
                            className={`w-full text-left px-3 py-2 text-xs border-b ${borderColor} transition ${darkMode ? 'hover:bg-dark-600' : 'hover:bg-gray-100'} ${textColor}`}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-2 py-1 relative">
                  <div>
                    <input type="text" placeholder="Filtro" value={filters.uf} onFocus={() => setActiveSuggestionField('uf')} onChange={(e) => handleFilterChange('uf', e.target.value)} className={`w-full px-1 py-0.5 text-xs border rounded ${inputBg} ${inputBorder}`} />
                    {activeSuggestionField === 'uf' && suggestions.uf && suggestions.uf.length > 0 && (
                      <div className={`absolute top-full left-0 mt-1 w-full rounded-lg shadow-lg z-20 border ${borderColor} ${tableBg} max-h-32 overflow-y-auto`}>
                        {suggestions.uf.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSuggestionClick('uf', suggestion)}
                            className={`w-full text-left px-3 py-2 text-xs border-b ${borderColor} transition ${darkMode ? 'hover:bg-dark-600' : 'hover:bg-gray-100'} ${textColor}`}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-2 py-1"><input type="text" placeholder="Filtro" value={filters.responsavel} onChange={(e) => handleFilterChange('responsavel', e.target.value)} className={`w-full px-1 py-0.5 text-xs border rounded ${inputBg} ${inputBorder}`} /></td>
                <td className="px-2 py-1"><input type="text" placeholder="Filtro" value={filters.dataInicio} onChange={(e) => handleFilterChange('dataInicio', e.target.value)} className={`w-full px-1 py-0.5 text-xs border rounded ${inputBg} ${inputBorder}`} /></td>
                <td className="px-2 py-1 relative">
                  <button
                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                    className={`w-full px-1 py-0.5 text-xs border rounded text-left flex items-center justify-between ${inputBg} ${inputBorder}`}
                  >
                    <span className="truncate">{filters.status || 'Filtro'}</span>
                    <span className="opacity-50 ml-1">▼</span>
                  </button>
                  {showStatusDropdown && (
                    <div className={`absolute top-full left-0 mt-1 w-52 rounded-lg shadow-xl z-30 border ${borderColor} ${tableBg} overflow-hidden`}>
                      <button
                        onClick={() => { handleFilterChange('status', ''); setShowStatusDropdown(false) }}
                        className={`w-full text-left px-3 py-2 text-xs border-b ${borderColor} transition ${!filters.status ? (darkMode ? 'bg-dark-600' : 'bg-gray-100') : (darkMode ? 'hover:bg-dark-600' : 'hover:bg-gray-50')} ${textColor}`}
                      >
                        Todos
                      </button>
                      {['Não Ajuizado', 'Ajuizado', 'Pendência', 'Pendência Cumprida', 'Aguardando Ajuizamento', 'Arquivado'].map(opt => (
                        <button
                          key={opt}
                          onClick={() => { handleFilterChange('status', opt); setShowStatusDropdown(false) }}
                          className={`w-full text-left px-3 py-2 text-xs border-b ${borderColor} transition ${filters.status === opt ? (darkMode ? 'bg-dark-600 text-blue-400' : 'bg-blue-50 text-blue-700') : (darkMode ? 'hover:bg-dark-600' : 'hover:bg-gray-50')} ${textColor}`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </td>
                <td className="px-2 py-1 relative">
                  <button
                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                    className={`w-full px-2 py-1 text-xs border rounded text-left ${inputBg} ${inputBorder}`}
                  >
                    {sortOrder === 'asc' ? '↑ Mais Antigo' : sortOrder === 'desc' ? '↓ Mais Novo' : 'Ordenar'}
                  </button>
                  {showSortDropdown && (
                    <div className={`absolute top-full left-0 mt-1 w-40 rounded-lg shadow-lg z-20 border ${borderColor} ${tableBg}`}>
                      <button
                        onClick={() => {
                          setSortOrder('asc')
                          setShowSortDropdown(false)
                        }}
                        className={`w-full text-left px-3 py-2 text-xs border-b ${borderColor} transition ${sortOrder === 'asc' ? (darkMode ? 'bg-dark-600' : 'bg-gray-100') : (darkMode ? 'hover:bg-dark-600' : 'hover:bg-gray-50')} ${textColor}`}
                      >
                        ↑ Mais Antigo
                      </button>
                      <button
                        onClick={() => {
                          setSortOrder('desc')
                          setShowSortDropdown(false)
                        }}
                        className={`w-full text-left px-3 py-2 text-xs transition ${sortOrder === 'desc' ? (darkMode ? 'bg-dark-600' : 'bg-gray-100') : (darkMode ? 'hover:bg-dark-600' : 'hover:bg-gray-50')} ${textColor}`}
                      >
                        ↓ Mais Novo
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {paginatedData.map((process, index) => (
                <tr
                  key={process.id}
                  onClick={() => handleProcessClick(process)}
                  className={`border-b ${borderColor} hover:${darkMode ? 'bg-dark-600' : 'bg-gray-50'} transition cursor-pointer`}
                >
                  <td className={`px-3 py-2 text-sm ${textColor}`}>{process.numero}</td>
                  <td className={`px-3 py-2 text-sm ${textColor}`}>{process.parceiro}</td>
                  <td className={`px-3 py-2 text-sm ${textColor}`}>{process.cliente}</td>
                  <td className={`px-3 py-2 text-sm ${textColor}`}>{process.cpf}</td>
                  <td className={`px-3 py-2 text-sm ${textColor}`}>{process.processo}</td>
                  <td className={`px-3 py-2 text-sm ${textColor}`}>{process.cidade}</td>
                  <td className={`px-3 py-2 text-sm ${textColor}`}>{process.uf}</td>
                  <td className={`px-3 py-2 text-sm ${textColor}`}>{process.responsavel}</td>
                  <td className={`px-3 py-2 text-sm ${textColor}`}>{process.dataInicio}</td>
                  <td className={`px-3 py-2 text-sm ${textColor}`}>{process.status}</td>
                  <td className={`px-3 py-2 text-sm ${textColor}`}>{process.ultimaAlteracao}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className={`${tableBg} rounded-b-lg border-x border-b ${borderColor} px-4 py-3 flex items-center justify-between`}>
        <div className={`text-xs ${textColor}`}>
          {paginatedData.length > 0 ? `${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, filteredProcesses.length)} de ${filteredProcesses.length}` : 'Nenhum resultado'}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className={`p-1 rounded transition disabled:opacity-50 ${darkMode ? 'hover:bg-dark-600' : 'hover:bg-gray-200'}`}
          >
            <ChevronsLeft size={16} className={textColor} />
          </button>
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`p-1 rounded transition disabled:opacity-50 ${darkMode ? 'hover:bg-dark-600' : 'hover:bg-gray-200'}`}
          >
            <ChevronLeft size={16} className={textColor} />
          </button>
          <span className={`text-xs px-2 ${textColor}`}>{currentPage} / {totalPages || 1}</span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={`p-1 rounded transition disabled:opacity-50 ${darkMode ? 'hover:bg-dark-600' : 'hover:bg-gray-200'}`}
          >
            <ChevronRight size={16} className={textColor} />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className={`p-1 rounded transition disabled:opacity-50 ${darkMode ? 'hover:bg-dark-600' : 'hover:bg-gray-200'}`}
          >
            <ChevronsRight size={16} className={textColor} />
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && editFormData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${darkMode ? 'bg-dark-800' : 'bg-white'} rounded-lg shadow-2xl max-w-md w-full space-y-4 p-6`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-bold ${textColor}`}>Editar Processo</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${textColor}`}>Parceiro</label>
                <input
                  type="text"
                  value={editFormData.parceiro}
                  onChange={(e) => setEditFormData({ ...editFormData, parceiro: e.target.value })}
                  className={`w-full px-3 py-2 text-sm rounded border ${inputBg} ${inputBorder}`}
                />
              </div>
              <div>
                <label className={`block text-xs font-semibold mb-1 ${textColor}`}>Cliente</label>
                <input
                  type="text"
                  value={editFormData.cliente}
                  onChange={(e) => setEditFormData({ ...editFormData, cliente: e.target.value })}
                  className={`w-full px-3 py-2 text-sm rounded border ${inputBg} ${inputBorder}`}
                />
              </div>
              <div>
                <label className={`block text-xs font-semibold mb-1 ${textColor}`}>CPF</label>
                <input
                  type="text"
                  value={editFormData.cpf}
                  onChange={(e) => setEditFormData({ ...editFormData, cpf: e.target.value })}
                  className={`w-full px-3 py-2 text-sm rounded border ${inputBg} ${inputBorder}`}
                />
              </div>
              <div>
                <label className={`block text-xs font-semibold mb-1 ${textColor}`}>Processo</label>
                <input
                  type="text"
                  value={editFormData.processo}
                  onChange={(e) => setEditFormData({ ...editFormData, processo: e.target.value })}
                  className={`w-full px-3 py-2 text-sm rounded border ${inputBg} ${inputBorder}`}
                />
              </div>
              <div>
                <label className={`block text-xs font-semibold mb-1 ${textColor}`}>Responsável</label>
                <input
                  type="text"
                  value={editFormData.responsavel}
                  onChange={(e) => setEditFormData({ ...editFormData, responsavel: e.target.value })}
                  className={`w-full px-3 py-2 text-sm rounded border ${inputBg} ${inputBorder}`}
                />
              </div>
              <div>
                <label className={`block text-xs font-semibold mb-1 ${textColor}`}>Status</label>
                <input
                  type="text"
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  className={`w-full px-3 py-2 text-sm rounded border ${inputBg} ${inputBorder}`}
                />
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <button onClick={handleSaveEdit} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded font-semibold transition">
                Salvar
              </button>
              <button onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded font-semibold transition">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Process Detail Modal - replaced by full-page ProcessDetailView above */}
      {false && selectedProcess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${darkMode ? 'bg-dark-800' : 'bg-white'} rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            {/* Modal Header */}
            <div className={`flex items-center justify-between p-6 border-b ${darkMode ? 'border-dark-700' : 'border-gray-200'}`}>
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Detalhes do Processo #{selectedProcess.numero}
              </h2>
              <button
                onClick={() => setShowProcessDetailModal(false)}
                className={`p-1 rounded hover:bg-gray-200 ${darkMode ? 'text-gray-300 hover:bg-dark-700' : ''}`}
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Número</label>
                  <p className={`px-3 py-2 rounded ${darkMode ? 'bg-dark-700 text-white' : 'bg-gray-100 text-gray-900'}`}>{selectedProcess.numero}</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Parceiro</label>
                  <p className={`px-3 py-2 rounded ${darkMode ? 'bg-dark-700 text-white' : 'bg-gray-100 text-gray-900'}`}>{selectedProcess.parceiro}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Cliente</label>
                  <p className={`px-3 py-2 rounded ${darkMode ? 'bg-dark-700 text-white' : 'bg-gray-100 text-gray-900'}`}>{selectedProcess.cliente}</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>CPF</label>
                  <p className={`px-3 py-2 rounded ${darkMode ? 'bg-dark-700 text-white' : 'bg-gray-100 text-gray-900'}`}>{selectedProcess.cpf}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Processo/CAT</label>
                  <p className={`px-3 py-2 rounded ${darkMode ? 'bg-dark-700 text-white' : 'bg-gray-100 text-gray-900'}`}>{selectedProcess.processo}</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Responsável</label>
                  <p className={`px-3 py-2 rounded ${darkMode ? 'bg-dark-700 text-white' : 'bg-gray-100 text-gray-900'}`}>{selectedProcess.responsavel}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Cidade/Comarca</label>
                  <p className={`px-3 py-2 rounded ${darkMode ? 'bg-dark-700 text-white' : 'bg-gray-100 text-gray-900'}`}>{selectedProcess.cidade}</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>UF</label>
                  <p className={`px-3 py-2 rounded ${darkMode ? 'bg-dark-700 text-white' : 'bg-gray-100 text-gray-900'}`}>{selectedProcess.uf}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Data Início</label>
                  <p className={`px-3 py-2 rounded ${darkMode ? 'bg-dark-700 text-white' : 'bg-gray-100 text-gray-900'}`}>{selectedProcess.dataInicio}</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Status</label>
                  <p className={`px-3 py-2 rounded ${darkMode ? 'bg-dark-700 text-white' : 'bg-gray-100 text-gray-900'}`}>{selectedProcess.status}</p>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Última Alteração</label>
                <p className={`px-3 py-2 rounded ${darkMode ? 'bg-dark-700 text-white' : 'bg-gray-100 text-gray-900'}`}>{selectedProcess.ultimaAlteracao}</p>
              </div>

              {/* Linked Documents Section */}
              <div className="mt-6 pt-6 border-t border-gray-300">
                <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>📄 Documentos Vinculados</label>
                {getLinkedDocuments().length > 0 ? (
                  <div className="space-y-2">
                    {getLinkedDocuments().map((doc) => (
                      <div
                        key={doc.id}
                        className={`p-3 rounded-lg border cursor-pointer transition hover:shadow-md ${darkMode
                          ? 'bg-dark-700 border-dark-600 hover:border-blue-500'
                          : 'bg-gray-50 border-gray-300 hover:border-blue-500'
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          <FileText size={18} className={darkMode ? 'text-gray-400 mt-0.5' : 'text-gray-500 mt-0.5'} />
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-medium text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {doc.title}
                            </h4>
                            {doc.description && (
                              <p className={`text-xs mt-1 line-clamp-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {doc.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              {doc.attachments.length > 0 && (
                                <span className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-dark-600' : 'bg-gray-200'}`}>
                                  <Paperclip size={12} className="inline mr-1" /> {doc.attachments.length}
                                </span>
                              )}
                              {doc.checklists.length > 0 && (
                                <span className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-dark-600' : 'bg-gray-200'}`}>
                                  ✓ {doc.checklists.length} checklist
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-sm px-3 py-2 rounded text-center ${darkMode ? 'bg-dark-700 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                    Nenhum documento vinculado a este processo
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`flex justify-end gap-3 p-6 border-t ${darkMode ? 'border-dark-700' : 'border-gray-200'}`}>
              <button
                onClick={() => setShowProcessDetailModal(false)}
                className={`px-4 py-2 rounded-lg transition ${darkMode ? 'bg-dark-700 hover:bg-dark-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
              >
                Fechar
              </button>
              <button
                onClick={handleSchedulingClick}
                className={`px-4 py-2 rounded-lg transition font-medium ${darkMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
              >
                Agendar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scheduling Modal */}
      {showSchedulingModal && showProcessDetailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${darkMode ? 'bg-dark-800' : 'bg-white'} rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            {/* Modal Header */}
            <div className={`flex items-center justify-between p-6 border-b ${darkMode ? 'border-dark-700' : 'border-gray-200'}`}>
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Novo Agendamento
              </h2>
              <button
                onClick={() => setShowSchedulingModal(false)}
                className={`p-1 rounded hover:bg-gray-200 ${darkMode ? 'text-gray-300 hover:bg-dark-700' : ''}`}
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>O que será feito?</label>
                  <input
                    type="text"
                    value={formData.atividade}
                    onChange={(e) => handleInputChange('atividade', e.target.value)}
                    placeholder="Ex: Audiência, Reunião, Pericia"
                    className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-dark-700 border-dark-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Hora</label>
                  <input
                    type="time"
                    value={formData.hora}
                    onChange={(e) => handleInputChange('hora', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-dark-700 border-dark-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Local</label>
                  <input
                    type="text"
                    value={formData.local}
                    onChange={(e) => handleInputChange('local', e.target.value)}
                    placeholder="Local onde o cliente deverá ir"
                    className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-dark-700 border-dark-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Solicitante</label>
                  <input
                    type="text"
                    value={formData.solicitante}
                    onChange={(e) => handleInputChange('solicitante', e.target.value)}
                    placeholder="Quem solicitou"
                    className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-dark-700 border-dark-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Parceiro</label>
                  <input
                    type="text"
                    value={formData.parceiro}
                    readOnly
                    className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-dark-700 border-dark-600 text-white opacity-60' : 'bg-gray-100 border-gray-300 text-gray-900 opacity-60'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Nome do Cliente</label>
                  <input
                    type="text"
                    value={formData.cliente}
                    readOnly
                    className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-dark-700 border-dark-600 text-white opacity-60' : 'bg-gray-100 border-gray-300 text-gray-900 opacity-60'}`}
                  />
                </div>
              </div>

              {/* Row 4 */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Observação</label>
                <textarea
                  value={formData.observacao}
                  onChange={(e) => handleInputChange('observacao', e.target.value)}
                  placeholder="Observações adicionais"
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-dark-700 border-dark-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>

              {/* Row 5 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Responsável</label>
                  <input
                    type="text"
                    value={formData.responsavel}
                    readOnly
                    className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-dark-700 border-dark-600 text-white opacity-60' : 'bg-gray-100 border-gray-300 text-gray-900 opacity-60'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-dark-700 border-dark-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  >
                    <option value="pendente">Pendente</option>
                    <option value="confirmado">Confirmado</option>
                    <option value="cancelado">Cancelado</option>
                    <option value="realizado">Realizado</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`flex justify-end gap-3 p-6 border-t ${darkMode ? 'border-dark-700' : 'border-gray-200'}`}>
              <button
                onClick={() => setShowSchedulingModal(false)}
                className={`px-4 py-2 rounded-lg transition ${darkMode ? 'bg-dark-700 hover:bg-dark-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveScheduling}
                disabled={!formData.atividade || !formData.hora}
                className={`px-4 py-2 rounded-lg transition font-medium ${!formData.atividade || !formData.hora
                  ? darkMode ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
              >
                Salvar Agendamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const CalendarIcon = ({ size = 20, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
)
