import React, { useState, useMemo } from 'react'
import { Download, FileText, PencilIcon, Paperclip, ExternalLink, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { Process } from '../types'

interface ProcessTableProps {
  darkMode: boolean
  type: 'estadual' | 'federal'
}

export const ProcessTable: React.FC<ProcessTableProps> = ({ darkMode, type }) => {
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
    status: ''
  })

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Mock data - 100+ processes
  const mockProcesses: Process[] = Array.from({ length: 26103 }, (_, i) => ({
    id: `proc-${i + 1}`,
    numero: i + 1,
    parceiro: ['UHLMANN & SANTOS', 'SILVA ADVOCACIA', 'COSTA & CIA', 'MARTINS LEGAL'][i % 4],
    cliente: `Cliente ${String(i + 1).padStart(5, '0')}`,
    cpf: `${Math.floor(Math.random() * 99999999999).toString().padStart(11, '0')}`,
    processo: `CAT ${String(i + 1).padStart(8, '0')}`,
    cidade: ['PAPANDUVA', 'CANOINHAS', 'PORTO ALEGRE', 'CURITIBA', 'SÃO PAULO'][i % 5],
    uf: ['SC', 'RS', 'PR', 'SP', 'RJ'][i % 5],
    dataInicio: new Date(2020 + Math.floor(i / 5000), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toLocaleDateString('pt-BR'),
    status: ['AG AJUIZAR 8', 'ARQUIVADO', 'PRECATÓRIO', 'EM ANDAMENTO', 'SENTENCIADO'][i % 5]
  }))

  // Filter data
  const filteredProcesses = useMemo(() => {
    return mockProcesses.filter(process => {
      const matchNumero = process.numero.toString().includes(filters.numero)
      const matchParceiro = process.parceiro.toLowerCase().includes(filters.parceiro.toLowerCase())
      const matchCliente = process.cliente.toLowerCase().includes(filters.cliente.toLowerCase())
      const matchCPF = process.cpf.includes(filters.cpf)
      const matchProcesso = process.processo.includes(filters.processo)
      const matchCidade = process.cidade.toLowerCase().includes(filters.cidade.toLowerCase())
      const matchUF = process.uf.includes(filters.uf.toUpperCase())
      const matchStatus = process.status.toLowerCase().includes(filters.status.toLowerCase())

      return matchNumero && matchParceiro && matchCliente && matchCPF && matchProcesso && matchCidade && matchUF && matchStatus
    })
  }, [filters])

  const totalPages = Math.ceil(filteredProcesses.length / itemsPerPage)
  const paginatedData = filteredProcesses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value })
    setCurrentPage(1)
  }

  const handleExport = () => {
    console.log('Exportando dados...')
    // Implementation for export functionality
  }

  const bgColor = darkMode ? 'bg-dark-900' : 'bg-gray-50'
  const tableBg = darkMode ? 'bg-dark-500' : 'bg-white'
  const headerBg = darkMode ? 'bg-dark-600' : 'bg-gray-100'
  const borderColor = darkMode ? 'border-dark-600' : 'border-gray-200'
  const textColor = darkMode ? 'text-white' : 'text-gray-900'
  const inputBg = darkMode ? 'bg-dark-700 text-white' : 'bg-white text-gray-900'
  const inputBorder = darkMode ? 'border-dark-600' : 'border-gray-300'

  return (
    <div className={`p-6 ${bgColor} min-h-screen`}>
      {/* Filter Header */}
      <div className={`${tableBg} rounded-t-lg p-4 border ${borderColor}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${textColor}`}>
            Filtro por Período
          </h3>
          <button
            onClick={handleExport}
            className={`flex items-center gap-2 px-3 py-1 rounded transition ${darkMode ? 'bg-dark-700 hover:bg-dark-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
          >
            <Download size={18} />
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
      </div>

      {/* Table */}
      <div className={`${tableBg} border-x ${borderColor}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            {/* Header with filters */}
            <thead>
              <tr className={`border-b ${borderColor} ${headerBg}`}>
                <th className="px-3 py-3 text-left font-semibold text-xs"><div>#</div></th>
                <th className="px-3 py-3 text-left font-semibold text-xs"><div>Parceiro</div></th>
                <th className="px-3 py-3 text-left font-semibold text-xs"><div>Cliente</div></th>
                <th className="px-3 py-3 text-left font-semibold text-xs"><div>CPF</div></th>
                <th className="px-3 py-3 text-left font-semibold text-xs"><div>CAT/Nº Processo</div></th>
                <th className="px-3 py-3 text-left font-semibold text-xs"><div>Cidade/Comarca</div></th>
                <th className="px-3 py-3 text-left font-semibold text-xs"><div>UF</div></th>
                <th className="px-3 py-3 text-left font-semibold text-xs"><div>Data Início</div></th>
                <th className="px-3 py-3 text-left font-semibold text-xs"><div>Status</div></th>
                <th className="px-3 py-3 text-right font-semibold text-xs"><div>Ações</div></th>
              </tr>

              {/* Filter Row */}
              <tr className={`border-b ${borderColor} ${darkMode ? 'bg-dark-600' : 'bg-gray-50'}`}>
                <td className="px-3 py-2"><input type="text" placeholder="Nº" value={filters.numero} onChange={(e) => handleFilterChange('numero', e.target.value)} className={`w-full px-2 py-1 text-xs border rounded ${inputBg} ${inputBorder}`} /></td>
                <td className="px-3 py-2"><input type="text" placeholder="Filtro" value={filters.parceiro} onChange={(e) => handleFilterChange('parceiro', e.target.value)} className={`w-full px-2 py-1 text-xs border rounded ${inputBg} ${inputBorder}`} /></td>
                <td className="px-3 py-2"><input type="text" placeholder="Filtro" value={filters.cliente} onChange={(e) => handleFilterChange('cliente', e.target.value)} className={`w-full px-2 py-1 text-xs border rounded ${inputBg} ${inputBorder}`} /></td>
                <td className="px-3 py-2"><input type="text" placeholder="Filtro" value={filters.cpf} onChange={(e) => handleFilterChange('cpf', e.target.value)} className={`w-full px-2 py-1 text-xs border rounded ${inputBg} ${inputBorder}`} /></td>
                <td className="px-3 py-2"><input type="text" placeholder="Filtro" value={filters.processo} onChange={(e) => handleFilterChange('processo', e.target.value)} className={`w-full px-2 py-1 text-xs border rounded ${inputBg} ${inputBorder}`} /></td>
                <td className="px-3 py-2"><input type="text" placeholder="Filtro" value={filters.cidade} onChange={(e) => handleFilterChange('cidade', e.target.value)} className={`w-full px-2 py-1 text-xs border rounded ${inputBg} ${inputBorder}`} /></td>
                <td className="px-3 py-2"><input type="text" placeholder="Filtro" value={filters.uf} onChange={(e) => handleFilterChange('uf', e.target.value)} className={`w-full px-2 py-1 text-xs border rounded ${inputBg} ${inputBorder}`} /></td>
                <td className="px-3 py-2"><input type="text" placeholder="Filtro" value={filters.dataInicio} onChange={(e) => handleFilterChange('dataInicio', e.target.value)} className={`w-full px-2 py-1 text-xs border rounded ${inputBg} ${inputBorder}`} /></td>
                <td className="px-3 py-2"><input type="text" placeholder="Filtro" value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} className={`w-full px-2 py-1 text-xs border rounded ${inputBg} ${inputBorder}`} /></td>
                <td className="px-3 py-2"></td>
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {paginatedData.map((process, index) => (
                <tr key={process.id} className={`border-b ${borderColor} hover:${darkMode ? 'bg-dark-600' : 'bg-gray-50'} transition`}>
                  <td className={`px-3 py-2 text-xs ${textColor}`}>{process.numero}</td>
                  <td className={`px-3 py-2 text-xs ${textColor}`}>{process.parceiro}</td>
                  <td className={`px-3 py-2 text-xs ${textColor}`}>{process.cliente}</td>
                  <td className={`px-3 py-2 text-xs ${textColor}`}>{process.cpf}</td>
                  <td className={`px-3 py-2 text-xs ${textColor}`}>{process.processo}</td>
                  <td className={`px-3 py-2 text-xs ${textColor}`}>{process.cidade}</td>
                  <td className={`px-3 py-2 text-xs ${textColor}`}>{process.uf}</td>
                  <td className={`px-3 py-2 text-xs ${textColor}`}>{process.dataInicio}</td>
                  <td className={`px-3 py-2 text-xs ${textColor}`}>{process.status}</td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex justify-end gap-1">
                      <button className={`p-1 rounded transition ${darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
                        <FileText size={14} />
                      </button>
                      <button className={`p-1 rounded transition ${darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
                        <PencilIcon size={14} />
                      </button>
                      <button className={`p-1 rounded transition ${darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
                        <Paperclip size={14} />
                      </button>
                      <button className={`p-1 rounded transition ${darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
                        <ExternalLink size={14} />
                      </button>
                    </div>
                  </td>
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
