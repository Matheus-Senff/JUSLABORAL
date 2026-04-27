import React, { useState, useMemo } from 'react'
import { useSupabaseClientes } from '../hooks/useSupabaseClientes'
import { useSupabaseParceiros } from '../hooks/useSupabaseParceiros'
import {
    Download,
    PencilIcon,
    Paperclip,
    ExternalLink,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    X,
    Plus
} from 'lucide-react'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { autocompleteSearch, fuzzySearch } from '../utils/fuzzySearch'

interface Client {
    id: string
    numero?: number
    nome: string
    cpf_cnpj?: string
    cpfCnpj?: string
    parceiro?: string
    email?: string
    telefone?: string
    uf?: string
}

interface ClientsTableProps {
    darkMode: boolean
}

const CalendarIcon = (props: any) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
)

export const ClientsTable: React.FC<ClientsTableProps> = ({ darkMode }) => {
    const { clientes: mockClients, loading: loadingClientes, addCliente, updateCliente, deleteCliente } = useSupabaseClientes()
    const { nomes: mockParceiros } = useSupabaseParceiros()

    const mockUFs = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO']

    const [filters, setFilters] = useState<Record<string, string>>({
        numero: '',
        nome: '',
        cpfCnpj: '',
        parceiro: '',
        email: '',
        telefone: '',
        uf: ''
    })

    const [currentPage, setCurrentPage] = useState(1)
    const [showDetailedFilter, setShowDetailedFilter] = useState(false)
    const [selectedClient, setSelectedClient] = useState<Client | null>(null)
    const [showClientDetailModal, setShowClientDetailModal] = useState(false)
    const [editingClient, setEditingClient] = useState<Client | null>(null)
    const [editFormData, setEditFormData] = useState<Client | null>(null)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showAddModal, setShowAddModal] = useState(false)
    const [addFormData, setAddFormData] = useState<Partial<Client> | null>(null)

    // Autocomplete suggestions
    const [suggestions, setSuggestions] = useState<Record<string, string[]>>({
        numero: [],
        nome: [],
        cpfCnpj: [],
        parceiro: [],
        email: [],
        telefone: [],
        uf: []
    })
    const [activeSuggestionField, setActiveSuggestionField] = useState<string | null>(null)

    const itemsPerPage = 20

    const bgColor = darkMode ? 'bg-dark-900' : 'bg-gray-50'
    const tableBg = darkMode ? 'bg-dark-500' : 'bg-white'
    const headerBg = darkMode ? 'bg-dark-600' : 'bg-gray-100'
    const borderColor = darkMode ? 'border-dark-600' : 'border-gray-200'
    const textColor = darkMode ? 'text-white' : 'text-gray-900'
    const inputBg = darkMode ? 'bg-dark-700 text-white' : 'bg-white text-gray-900'
    const inputBorder = darkMode ? 'border-dark-600' : 'border-gray-300'
    const modalBg = darkMode ? 'bg-dark-800' : 'bg-white'

    // Filter data with fuzzy search
    const filteredClients = useMemo(() => {
        let filtered = mockClients.filter((client) => {
            let matches = true

            if (filters.numero) {
                const fuzzyMatches = fuzzySearch(
                    filters.numero,
                    [client.numero.toString()],
                    (x) => x,
                    1,
                    2
                )
                matches = matches && (fuzzyMatches.length > 0 || client.numero.toString().includes(filters.numero))
            }

            if (filters.nome && matches) {
                const fuzzyMatches = fuzzySearch(
                    filters.nome,
                    [client.nome],
                    (x) => x,
                    1,
                    3
                )
                matches =
                    matches &&
                    (fuzzyMatches.length > 0 || client.nome.toLowerCase().includes(filters.nome.toLowerCase()))
            }

            if (filters.cpfCnpj && matches) {
                matches = matches && (client.cpf_cnpj || '').includes(filters.cpfCnpj)
            }

            if (filters.parceiro && matches) {
                matches = matches && (client.parceiro || '').toLowerCase().includes(filters.parceiro.toLowerCase())
            }

            if (filters.email && matches) {
                matches = matches && (client.email || '').toLowerCase().includes(filters.email.toLowerCase())
            }

            if (filters.telefone && matches) {
                matches = matches && client.telefone.includes(filters.telefone)
            }

            if (filters.uf && matches) {
                matches = matches && client.uf.toUpperCase().includes(filters.uf.toUpperCase())
            }

            return matches
        })

        return filtered
    }, [filters])

    const totalPages = Math.ceil(filteredClients.length / itemsPerPage)
    const paginatedData = filteredClients.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    const handleFilterChange = (key: string, value: string) => {
        setFilters({ ...filters, [key]: value })
        setCurrentPage(1)

        // Generate autocomplete suggestions
        if (value.trim()) {
            let suggestions: string[] = []

            if (key === 'numero') {
                suggestions = autocompleteSearch(
                    value,
                    mockClients.map((c) => c.numero.toString()),
                    (x) => x,
                    5
                )
            } else if (key === 'nome') {
                suggestions = autocompleteSearch(
                    value,
                    mockClients.map((c) => c.nome),
                    (x) => x,
                    5
                )
            } else if (key === 'cpfCnpj') {
                suggestions = autocompleteSearch(
                    value,
                    mockClients.map((c) => c.cpf_cnpj || ''),
                    (x) => x,
                    5
                )
            } else if (key === 'parceiro') {
                suggestions = autocompleteSearch(
                    value,
                    mockParceiros,
                    (x) => x,
                    5
                )
            } else if (key === 'email') {
                suggestions = autocompleteSearch(
                    value,
                    mockClients.map((c) => c.email),
                    (x) => x,
                    5
                )
            } else if (key === 'telefone') {
                suggestions = autocompleteSearch(
                    value,
                    mockClients.map((c) => c.telefone),
                    (x) => x,
                    5
                )
            } else if (key === 'uf') {
                suggestions = autocompleteSearch(
                    value,
                    mockUFs,
                    (x) => x,
                    5
                )
            }

            setSuggestions(prev => ({ ...prev, [key]: suggestions }))
        } else {
            setSuggestions({
                numero: [],
                nome: [],
                cpfCnpj: [],
                parceiro: [],
                email: [],
                telefone: [],
                uf: []
            })
        }
    }

    const handleSuggestionClick = (key: string, value: string) => {
        handleFilterChange(key, value)
        setActiveSuggestionField(null)
    }

    const handleClientClick = (client: Client) => {
        setSelectedClient(client)
        setShowClientDetailModal(true)
    }

    const handleEditClick = (client: Client) => {
        setEditingClient(client)
        setEditFormData({ ...client })
        setShowEditModal(true)
    }

    const handleSaveEdit = async () => {
        if (!editFormData || !editingClient) return
        await updateCliente(editingClient.id, editFormData)
        setShowEditModal(false)
        setEditingClient(null)
        setEditFormData(null)
    }

    const handleDeleteClick = async (clientId: string) => {
        if (!confirm('Deseja excluir este cliente?')) return
        await deleteCliente(clientId)
    }

    const handleAddClick = () => {
        setAddFormData({
            nome: '',
            cpfCnpj: '',
            parceiro: '',
            email: '',
            telefone: '',
            uf: ''
        })
        setShowAddModal(true)
    }

    const handleSaveAdd = async () => {
        if (!addFormData || !addFormData.nome) return
        await addCliente({
            nome: addFormData.nome || '',
            cpf_cnpj: addFormData.cpf_cnpj || '',
            parceiro: addFormData.parceiro || '',
            email: addFormData.email || '',
            telefone: addFormData.telefone || '',
            uf: addFormData.uf || ''
        })
        setShowAddModal(false)
        setAddFormData(null)
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
            pdf.save('clientes.pdf')
        } catch (error) {
            console.error('Erro ao exportar PDF:', error)
            alert('Erro ao exportar tabela para PDF')
        }
    }

    return (
        <div className={`p-6 ${bgColor} min-h-screen`}>
            {/* Button Header */}
            <div className="flex items-center justify-between mb-2">
                <button
                    onClick={handleAddClick}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition"
                >
                    <Plus size={18} /> Adicionar
                </button>
                <button
                    onClick={handleExport}
                    className={`flex items-center gap-2 px-3 py-1 rounded transition ${darkMode ? 'bg-dark-700 hover:bg-dark-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        }`}
                    title="Baixar tabela em PDF"
                >
                    <Download size={18} />
                </button>
            </div>

            {/* Table */}
            <div className={`${tableBg} rounded-lg border ${borderColor}`}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        {/* Header with filters */}
                        <thead>
                            <tr className={`border-b ${borderColor} ${headerBg}`}>
                                <th className="px-2 py-2 text-left font-semibold text-xs">
                                    <div>ID</div>
                                </th>
                                <th className="px-2 py-2 text-left font-semibold text-xs">
                                    <div>Nome</div>
                                </th>
                                <th className="px-2 py-2 text-left font-semibold text-xs">
                                    <div>CPF/CNPJ</div>
                                </th>
                                <th className="px-2 py-2 text-left font-semibold text-xs">
                                    <div>Parceiro</div>
                                </th>
                                <th className="px-2 py-2 text-left font-semibold text-xs">
                                    <div>Email</div>
                                </th>
                                <th className="px-2 py-2 text-left font-semibold text-xs">
                                    <div>Telefone</div>
                                </th>
                                <th className="px-2 py-2 text-left font-semibold text-xs">
                                    <div>UF</div>
                                </th>
                                <th className="px-2 py-2 text-right font-semibold text-xs">
                                    <div>Ações</div>
                                </th>
                            </tr>

                            {/* Filter Row */}
                            <tr className={`border-b ${borderColor} ${darkMode ? 'bg-dark-700' : 'bg-gray-50'}`}>
                                <td className="px-2 py-1 relative">
                                    <div>
                                        <input
                                            type="text"
                                            placeholder="Filtro"
                                            value={filters.numero}
                                            onChange={(e) => handleFilterChange('numero', e.target.value)}
                                            onFocus={() => setActiveSuggestionField('numero')}
                                            className={`w-full px-1 py-0.5 text-xs border rounded ${inputBg} ${inputBorder}`}
                                        />
                                        {activeSuggestionField === 'numero' && suggestions.numero && suggestions.numero.length > 0 && (
                                            <div
                                                className={`absolute top-full left-0 mt-1 w-full rounded-lg shadow-lg z-20 border ${borderColor} ${tableBg} max-h-32 overflow-y-auto`}
                                            >
                                                {suggestions.numero.map((suggestion, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => handleSuggestionClick('numero', suggestion)}
                                                        className={`w-full text-left px-3 py-2 text-xs border-b ${borderColor} transition ${darkMode ? 'hover:bg-dark-600' : 'hover:bg-gray-100'
                                                            } ${textColor}`}
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
                                        <input
                                            type="text"
                                            placeholder="Filtro"
                                            value={filters.nome}
                                            onChange={(e) => handleFilterChange('nome', e.target.value)}
                                            onFocus={() => setActiveSuggestionField('nome')}
                                            className={`w-full px-1 py-0.5 text-xs border rounded ${inputBg} ${inputBorder}`}
                                        />
                                        {activeSuggestionField === 'nome' && suggestions.nome && suggestions.nome.length > 0 && (
                                            <div
                                                className={`absolute top-full left-0 mt-1 w-full rounded-lg shadow-lg z-20 border ${borderColor} ${tableBg} max-h-32 overflow-y-auto`}
                                            >
                                                {suggestions.nome.map((suggestion, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => handleSuggestionClick('nome', suggestion)}
                                                        className={`w-full text-left px-3 py-2 text-xs border-b ${borderColor} transition ${darkMode ? 'hover:bg-dark-600' : 'hover:bg-gray-100'
                                                            } ${textColor}`}
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
                                        <input
                                            type="text"
                                            placeholder="Filtro"
                                            value={filters.cpfCnpj}
                                            onChange={(e) => handleFilterChange('cpfCnpj', e.target.value)}
                                            onFocus={() => setActiveSuggestionField('cpfCnpj')}
                                            className={`w-full px-1 py-0.5 text-xs border rounded ${inputBg} ${inputBorder}`}
                                        />
                                        {activeSuggestionField === 'cpfCnpj' && suggestions.cpfCnpj && suggestions.cpfCnpj.length > 0 && (
                                            <div
                                                className={`absolute top-full left-0 mt-1 w-full rounded-lg shadow-lg z-20 border ${borderColor} ${tableBg} max-h-32 overflow-y-auto`}
                                            >
                                                {suggestions.cpfCnpj.map((suggestion, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => handleSuggestionClick('cpfCnpj', suggestion)}
                                                        className={`w-full text-left px-3 py-2 text-xs border-b ${borderColor} transition ${darkMode ? 'hover:bg-dark-600' : 'hover:bg-gray-100'
                                                            } ${textColor}`}
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
                                        <input
                                            type="text"
                                            placeholder="Filtro"
                                            value={filters.parceiro}
                                            onChange={(e) => handleFilterChange('parceiro', e.target.value)}
                                            onFocus={() => setActiveSuggestionField('parceiro')}
                                            className={`w-full px-1 py-0.5 text-xs border rounded ${inputBg} ${inputBorder}`}
                                        />
                                        {activeSuggestionField === 'parceiro' && suggestions.parceiro && suggestions.parceiro.length > 0 && (
                                            <div
                                                className={`absolute top-full left-0 mt-1 w-full rounded-lg shadow-lg z-20 border ${borderColor} ${tableBg} max-h-32 overflow-y-auto`}
                                            >
                                                {suggestions.parceiro.map((suggestion, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => handleSuggestionClick('parceiro', suggestion)}
                                                        className={`w-full text-left px-3 py-2 text-xs border-b ${borderColor} transition ${darkMode ? 'hover:bg-dark-600' : 'hover:bg-gray-100'
                                                            } ${textColor}`}
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
                                        <input
                                            type="text"
                                            placeholder="Filtro"
                                            value={filters.email}
                                            onChange={(e) => handleFilterChange('email', e.target.value)}
                                            onFocus={() => setActiveSuggestionField('email')}
                                            className={`w-full px-1 py-0.5 text-xs border rounded ${inputBg} ${inputBorder}`}
                                        />
                                        {activeSuggestionField === 'email' && suggestions.email && suggestions.email.length > 0 && (
                                            <div
                                                className={`absolute top-full left-0 mt-1 w-full rounded-lg shadow-lg z-20 border ${borderColor} ${tableBg} max-h-32 overflow-y-auto`}
                                            >
                                                {suggestions.email.map((suggestion, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => handleSuggestionClick('email', suggestion)}
                                                        className={`w-full text-left px-3 py-2 text-xs border-b ${borderColor} transition ${darkMode ? 'hover:bg-dark-600' : 'hover:bg-gray-100'
                                                            } ${textColor}`}
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
                                        <input
                                            type="text"
                                            placeholder="Filtro"
                                            value={filters.telefone}
                                            onChange={(e) => handleFilterChange('telefone', e.target.value)}
                                            onFocus={() => setActiveSuggestionField('telefone')}
                                            className={`w-full px-1 py-0.5 text-xs border rounded ${inputBg} ${inputBorder}`}
                                        />
                                        {activeSuggestionField === 'telefone' && suggestions.telefone && suggestions.telefone.length > 0 && (
                                            <div
                                                className={`absolute top-full left-0 mt-1 w-full rounded-lg shadow-lg z-20 border ${borderColor} ${tableBg} max-h-32 overflow-y-auto`}
                                            >
                                                {suggestions.telefone.map((suggestion, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => handleSuggestionClick('telefone', suggestion)}
                                                        className={`w-full text-left px-3 py-2 text-xs border-b ${borderColor} transition ${darkMode ? 'hover:bg-dark-600' : 'hover:bg-gray-100'
                                                            } ${textColor}`}
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
                                        <input
                                            type="text"
                                            placeholder="Filtro"
                                            value={filters.uf}
                                            onChange={(e) => handleFilterChange('uf', e.target.value)}
                                            onFocus={() => setActiveSuggestionField('uf')}
                                            className={`w-full px-1 py-0.5 text-xs border rounded ${inputBg} ${inputBorder}`}
                                        />
                                        {activeSuggestionField === 'uf' && suggestions.uf && suggestions.uf.length > 0 && (
                                            <div
                                                className={`absolute top-full left-0 mt-1 w-full rounded-lg shadow-lg z-20 border ${borderColor} ${tableBg} max-h-32 overflow-y-auto`}
                                            >
                                                {suggestions.uf.map((suggestion, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => handleSuggestionClick('uf', suggestion)}
                                                        className={`w-full text-left px-3 py-2 text-xs border-b ${borderColor} transition ${darkMode ? 'hover:bg-dark-600' : 'hover:bg-gray-100'
                                                            } ${textColor}`}
                                                    >
                                                        {suggestion}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-2 py-1"></td>
                            </tr>
                        </thead>

                        {/* Body */}
                        <tbody>
                            {paginatedData.map((client) => (
                                <tr
                                    key={client.id}
                                    onClick={() => handleClientClick(client)}
                                    className={`border-b ${borderColor} hover:${darkMode ? 'bg-dark-600' : 'bg-gray-50'
                                        } transition cursor-pointer`}
                                >
                                    <td className={`px-2 py-1 text-xs ${textColor}`}>{client.numero}</td>
                                    <td className={`px-2 py-1 text-xs ${textColor}`}>{client.nome}</td>
                                    <td className={`px-2 py-1 text-xs ${textColor}`}>{client.cpf_cnpj}</td>
                                    <td className={`px-2 py-1 text-xs ${textColor}`}>{client.parceiro}</td>
                                    <td className={`px-2 py-1 text-xs ${textColor}`}>{client.email}</td>
                                    <td className={`px-2 py-1 text-xs ${textColor}`}>{client.telefone}</td>
                                    <td className={`px-2 py-1 text-xs ${textColor}`}>{client.uf}</td>
                                    <td className="px-2 py-1 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleEditClick(client) }}
                                                className="px-3 py-1 text-xs rounded transition text-white bg-blue-600 hover:bg-blue-700"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteClick(client.id) }}
                                                className="px-3 py-1 text-xs rounded transition text-white bg-red-600 hover:bg-red-700"
                                            >
                                                Excluir
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
            <div
                className={`${tableBg} rounded-b-lg border ${borderColor} px-3 py-2 flex items-center justify-between`}
            >
                <div className={`text-xs ${textColor}`}>
                    {paginatedData.length > 0
                        ? `${(currentPage - 1) * itemsPerPage + 1}-${Math.min(
                            currentPage * itemsPerPage,
                            filteredClients.length
                        )} de ${filteredClients.length}`
                        : 'Nenhum resultado'}
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className={`p-1 rounded transition disabled:opacity-50 ${darkMode ? 'hover:bg-dark-600' : 'hover:bg-gray-200'
                            }`}
                    >
                        <ChevronsLeft size={16} className={textColor} />
                    </button>
                    <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={`p-1 rounded transition disabled:opacity-50 ${darkMode ? 'hover:bg-dark-600' : 'hover:bg-gray-200'
                            }`}
                    >
                        <ChevronLeft size={16} className={textColor} />
                    </button>
                    <span className={`text-xs px-2 ${textColor}`}>
                        {currentPage} / {totalPages || 1}
                    </span>
                    <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className={`p-1 rounded transition disabled:opacity-50 ${darkMode ? 'hover:bg-dark-600' : 'hover:bg-gray-200'
                            }`}
                    >
                        <ChevronRight size={16} className={textColor} />
                    </button>
                    <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className={`p-1 rounded transition disabled:opacity-50 ${darkMode ? 'hover:bg-dark-600' : 'hover:bg-gray-200'
                            }`}
                    >
                        <ChevronsRight size={16} className={textColor} />
                    </button>
                </div>
            </div>

            {/* Edit Modal */}
            {showEditModal && editFormData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className={`${modalBg} rounded-lg shadow-2xl max-w-md w-full space-y-4 p-6`}>
                        <div className="flex items-center justify-between">
                            <h3 className={`text-lg font-bold ${textColor}`}>Editar Cliente</h3>
                            <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className={`block text-xs font-semibold mb-1 ${textColor}`}>Nome</label>
                                <input
                                    type="text"
                                    value={editFormData.nome}
                                    onChange={(e) => setEditFormData({ ...editFormData, nome: e.target.value })}
                                    className={`w-full px-3 py-2 text-sm rounded border ${inputBg} ${inputBorder}`}
                                />
                            </div>
                            <div>
                                <label className={`block text-xs font-semibold mb-1 ${textColor}`}>CPF/CNPJ</label>
                                <input
                                    type="text"
                                    value={editFormData.cpf_cnpj || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, cpf_cnpj: e.target.value })}
                                    className={`w-full px-3 py-2 text-sm rounded border ${inputBg} ${inputBorder}`}
                                />
                            </div>
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
                                <label className={`block text-xs font-semibold mb-1 ${textColor}`}>Email</label>
                                <input
                                    type="text"
                                    value={editFormData.email}
                                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                    className={`w-full px-3 py-2 text-sm rounded border ${inputBg} ${inputBorder}`}
                                />
                            </div>
                            <div>
                                <label className={`block text-xs font-semibold mb-1 ${textColor}`}>Telefone</label>
                                <input
                                    type="text"
                                    value={editFormData.telefone}
                                    onChange={(e) => setEditFormData({ ...editFormData, telefone: e.target.value })}
                                    className={`w-full px-3 py-2 text-sm rounded border ${inputBg} ${inputBorder}`}
                                />
                            </div>
                            <div>
                                <label className={`block text-xs font-semibold mb-1 ${textColor}`}>UF</label>
                                <input
                                    type="text"
                                    value={editFormData.uf}
                                    onChange={(e) => setEditFormData({ ...editFormData, uf: e.target.value })}
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

            {/* Add Modal */}
            {showAddModal && addFormData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className={`${modalBg} rounded-lg shadow-2xl max-w-md w-full space-y-4 p-6`}>
                        <div className="flex items-center justify-between">
                            <h3 className={`text-lg font-bold ${textColor}`}>Adicionar Cliente</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className={`block text-xs font-semibold mb-1 ${textColor}`}>Nome</label>
                                <input
                                    type="text"
                                    value={addFormData.nome || ''}
                                    onChange={(e) => setAddFormData({ ...addFormData, nome: e.target.value })}
                                    className={`w-full px-3 py-2 text-sm rounded border ${inputBg} ${inputBorder}`}
                                />
                            </div>
                            <div>
                                <label className={`block text-xs font-semibold mb-1 ${textColor}`}>CPF/CNPJ</label>
                                <input
                                    type="text"
                                    value={addFormData.cpf_cnpj || ''}
                                    onChange={(e) => setAddFormData({ ...addFormData, cpf_cnpj: e.target.value })}
                                    className={`w-full px-3 py-2 text-sm rounded border ${inputBg} ${inputBorder}`}
                                />
                            </div>
                            <div>
                                <label className={`block text-xs font-semibold mb-1 ${textColor}`}>Parceiro</label>
                                <input
                                    type="text"
                                    value={addFormData.parceiro || ''}
                                    onChange={(e) => setAddFormData({ ...addFormData, parceiro: e.target.value })}
                                    className={`w-full px-3 py-2 text-sm rounded border ${inputBg} ${inputBorder}`}
                                />
                            </div>
                            <div>
                                <label className={`block text-xs font-semibold mb-1 ${textColor}`}>Email</label>
                                <input
                                    type="text"
                                    value={addFormData.email || ''}
                                    onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
                                    className={`w-full px-3 py-2 text-sm rounded border ${inputBg} ${inputBorder}`}
                                />
                            </div>
                            <div>
                                <label className={`block text-xs font-semibold mb-1 ${textColor}`}>Telefone</label>
                                <input
                                    type="text"
                                    value={addFormData.telefone || ''}
                                    onChange={(e) => setAddFormData({ ...addFormData, telefone: e.target.value })}
                                    className={`w-full px-3 py-2 text-sm rounded border ${inputBg} ${inputBorder}`}
                                />
                            </div>
                            <div>
                                <label className={`block text-xs font-semibold mb-1 ${textColor}`}>UF</label>
                                <input
                                    type="text"
                                    value={addFormData.uf || ''}
                                    onChange={(e) => setAddFormData({ ...addFormData, uf: e.target.value })}
                                    className={`w-full px-3 py-2 text-sm rounded border ${inputBg} ${inputBorder}`}
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 pt-4">
                            <button onClick={handleSaveAdd} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded font-semibold transition">
                                Adicionar
                            </button>
                            <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded font-semibold transition">
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Client Detail Modal */}
            {showClientDetailModal && selectedClient && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div
                        className={`${modalBg} rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto`}
                    >
                        {/* Modal Header */}
                        <div
                            className={`flex items-center justify-between p-6 border-b ${darkMode ? 'border-dark-700' : 'border-gray-200'
                                }`}
                        >
                            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                Detalhes do Cliente
                            </h2>
                            <button
                                onClick={() => setShowClientDetailModal(false)}
                                className={`p-1 rounded hover:bg-gray-200 ${darkMode ? 'text-gray-300 hover:bg-dark-700' : ''
                                    }`}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label
                                        className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                                            }`}
                                    >
                                        ID
                                    </label>
                                    <p
                                        className={`px-3 py-2 rounded ${darkMode ? 'bg-dark-700 text-white' : 'bg-gray-100 text-gray-900'
                                            }`}
                                    >
                                        {selectedClient.numero}
                                    </p>
                                </div>
                                <div>
                                    <label
                                        className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                                            }`}
                                    >
                                        Nome
                                    </label>
                                    <p
                                        className={`px-3 py-2 rounded ${darkMode ? 'bg-dark-700 text-white' : 'bg-gray-100 text-gray-900'
                                            }`}
                                    >
                                        {selectedClient.nome}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label
                                        className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                                            }`}
                                    >
                                        CPF/CNPJ
                                    </label>
                                    <p
                                        className={`px-3 py-2 rounded ${darkMode ? 'bg-dark-700 text-white' : 'bg-gray-100 text-gray-900'
                                            }`}
                                    >
                                        {selectedClient.cpf_cnpj}
                                    </p>
                                </div>
                                <div>
                                    <label
                                        className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                                            }`}
                                    >
                                        Parceiro
                                    </label>
                                    <p
                                        className={`px-3 py-2 rounded ${darkMode ? 'bg-dark-700 text-white' : 'bg-gray-100 text-gray-900'
                                            }`}
                                    >
                                        {selectedClient.parceiro}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label
                                        className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                                            }`}
                                    >
                                        Email
                                    </label>
                                    <p
                                        className={`px-3 py-2 rounded ${darkMode ? 'bg-dark-700 text-white' : 'bg-gray-100 text-gray-900'
                                            }`}
                                    >
                                        {selectedClient.email}
                                    </p>
                                </div>
                                <div>
                                    <label
                                        className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                                            }`}
                                    >
                                        Telefone
                                    </label>
                                    <p
                                        className={`px-3 py-2 rounded ${darkMode ? 'bg-dark-700 text-white' : 'bg-gray-100 text-gray-900'
                                            }`}
                                    >
                                        {selectedClient.telefone}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div
                            className={`flex items-center justify-end gap-2 p-6 border-t ${darkMode ? 'border-dark-700' : 'border-gray-200'
                                }`}
                        >
                            <button
                                onClick={() => setShowClientDetailModal(false)}
                                className={`px-4 py-2 rounded font-medium transition ${darkMode
                                    ? 'bg-dark-700 hover:bg-dark-600 text-white'
                                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                                    }`}
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
