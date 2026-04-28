import React, { useState, useMemo } from 'react'
import { Users, Users2, Building2, Briefcase, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X, Plus } from 'lucide-react'
import { autocompleteSearch, fuzzySearch } from '../utils/fuzzySearch'
import { useSupabaseUsuarios } from '../hooks/useSupabaseUsuarios'
import { useSupabaseParceiros } from '../hooks/useSupabaseParceiros'

interface SettingsProps {
    darkMode: boolean
}

type SubTab = 'usuarios' | 'equipes' | 'setores' | 'parceiros'

interface Usuario {
    id: string
    numero: number
    nome: string
    email: string
    nivel: string
    equipe: string
    setor: string
    parceiro: string
    qtdProcessos: number
}

interface Equipe {
    id: string
    numero: number
    nome: string
    setor: string
}

interface Setor {
    id: string
    numero: number
    nome: string
    gestores: string
    parceiro: string
    qtdProcessos: number
}

interface Parceiro {
    id: string
    numero: number
    nome: string
    cnpj: string
    qtdProcessos: number
}

export const Settings: React.FC<SettingsProps> = ({ darkMode }) => {
    const { usuarios, addUsuario, updateUsuario, deleteUsuario } = useSupabaseUsuarios()
    const { parceiros, addParceiro, updateParceiro, deleteParceiro } = useSupabaseParceiros()
    const [equipes, setEquipes] = useState<Equipe[]>([])
    const [setores, setSetores] = useState<Setor[]>([])

    const [activeSubTab, setActiveSubTab] = useState<SubTab>('usuarios')
    const [currentPage, setCurrentPage] = useState(1)

    const itemsPerPage = 15

    // Filtros
    const [usuariosFilters, setUsuariosFilters] = useState({ numero: '', nome: '', email: '', nivel: '', equipe: '', setor: '', parceiro: '' })
    const [equipesFilters, setEquipesFilters] = useState({ nome: '', setor: '' })
    const [setoresFilters, setSetoresFilters] = useState({ numero: '', nome: '', gestores: '', parceiro: '' })
    const [parceirosFilters, setParceirosFilters] = useState({ numero: '', nome: '', cnpj: '' })

    // Suggestions
    const [usuariosSuggestions, setUsuariosSuggestions] = useState<Record<string, string[]>>({})
    const [equipeSuggestions, setEquipeSuggestions] = useState<Record<string, string[]>>({})
    const [setoresSuggestions, setSetoresSuggestions] = useState<Record<string, string[]>>({})
    const [parceirosSuggestions, setParceirosSuggestions] = useState<Record<string, string[]>>({})
    const [activeSuggestionField, setActiveSuggestionField] = useState<string | null>(null)

    // Modal de edição
    const [editingItem, setEditingItem] = useState<any>(null)
    const [editFormData, setEditFormData] = useState<any>(null)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showAddModal, setShowAddModal] = useState(false)
    const [addFormData, setAddFormData] = useState<any>(null)
    const [modalError, setModalError] = useState<string>('')

    const textColor = darkMode ? 'text-white' : 'text-gray-900'
    const borderColor = darkMode ? 'border-dark-600' : 'border-gray-200'
    const headerBg = darkMode ? 'bg-dark-600' : 'bg-gray-50'
    const inputBg = darkMode ? 'bg-dark-600' : 'bg-gray-100'
    const inputBorder = darkMode ? 'border-dark-500' : 'border-gray-300'
    const modalBg = darkMode ? 'bg-dark-700' : 'bg-white'

    // Filtro de usuários
    const filteredUsuarios = useMemo(() => {
        return usuarios.filter(u => {
            return (
                (usuariosFilters.numero ? (u as any).numero?.toString().includes(usuariosFilters.numero) : true) &&
                (usuariosFilters.nome ? u.nome.toLowerCase().includes(usuariosFilters.nome.toLowerCase()) : true) &&
                (usuariosFilters.email ? (u.email || '').toLowerCase().includes(usuariosFilters.email.toLowerCase()) : true) &&
                (usuariosFilters.nivel ? (u.nivel || '').toLowerCase().includes(usuariosFilters.nivel.toLowerCase()) : true) &&
                (usuariosFilters.equipe ? (u.equipe || '').toLowerCase().includes(usuariosFilters.equipe.toLowerCase()) : true) &&
                (usuariosFilters.setor ? (u.setor || '').toLowerCase().includes(usuariosFilters.setor.toLowerCase()) : true) &&
                (usuariosFilters.parceiro ? ((u as any).parceiro || '').toLowerCase().includes(usuariosFilters.parceiro.toLowerCase()) : true)
            )
        })
    }, [usuarios, usuariosFilters])

    // Filtro de equipes
    const filteredEquipes = useMemo(() => {
        return equipes.filter(e => {
            return (
                (equipesFilters.nome ? e.nome.toLowerCase().includes(equipesFilters.nome.toLowerCase()) : true) &&
                (equipesFilters.setor ? e.setor.toLowerCase().includes(equipesFilters.setor.toLowerCase()) : true)
            )
        })
    }, [equipes, equipesFilters])

    // Filtro de setores
    const filteredSetores = useMemo(() => {
        return setores.filter(s => {
            return (
                (setoresFilters.numero ? s.numero.toString().includes(setoresFilters.numero) : true) &&
                (setoresFilters.nome ? s.nome.toLowerCase().includes(setoresFilters.nome.toLowerCase()) : true) &&
                (setoresFilters.gestores ? s.gestores.toLowerCase().includes(setoresFilters.gestores.toLowerCase()) : true) &&
                (setoresFilters.parceiro ? s.parceiro.toLowerCase().includes(setoresFilters.parceiro.toLowerCase()) : true)
            )
        })
    }, [setores, setoresFilters])

    // Filtro de parceiros
    const filteredParceiros = useMemo(() => {
        return parceiros.filter(p => {
            return (
                (parceirosFilters.numero ? (p as any).numero?.toString().includes(parceirosFilters.numero) : true) &&
                (parceirosFilters.nome ? p.nome.toLowerCase().includes(parceirosFilters.nome.toLowerCase()) : true) &&
                (parceirosFilters.cnpj ? (p.cnpj || '').includes(parceirosFilters.cnpj) : true)
            )
        })
    }, [parceiros, parceirosFilters])

    const handleFilterChange = (filterType: string, key: string, value: string) => {
        if (filterType === 'usuarios') {
            setUsuariosFilters({ ...usuariosFilters, [key]: value })
            setCurrentPage(1)
            if (value.trim()) {
                let suggestions: string[] = []
                if (key === 'numero') {
                    suggestions = autocompleteSearch(value, usuarios.map(u => (u as any).numero?.toString() || ''), x => x, 5)
                } else if (key === 'nome') {
                    suggestions = autocompleteSearch(value, usuarios.map(u => u.nome), x => x, 5)
                } else if (key === 'email') {
                    suggestions = autocompleteSearch(value, usuarios.map(u => u.email || ''), x => x, 5)
                } else if (key === 'nivel') {
                    suggestions = autocompleteSearch(value, [...new Set(usuarios.map(u => u.nivel || ''))], x => x, 5)
                } else if (key === 'equipe') {
                    suggestions = autocompleteSearch(value, [...new Set(usuarios.map(u => u.equipe || ''))], x => x, 5)
                } else if (key === 'setor') {
                    suggestions = autocompleteSearch(value, [...new Set(usuarios.map(u => u.setor || ''))], x => x, 5)
                } else if (key === 'parceiro') {
                    suggestions = autocompleteSearch(value, [...new Set(usuarios.map(u => (u as any).parceiro || ''))], x => x, 5)
                }
                setUsuariosSuggestions({ ...usuariosSuggestions, [key]: suggestions })
            }
        } else if (filterType === 'equipes') {
            setEquipesFilters({ ...equipesFilters, [key]: value })
            setCurrentPage(1)
            if (value.trim()) {
                let suggestions: string[] = []
                if (key === 'nome') {
                    suggestions = autocompleteSearch(value, equipes.map(e => e.nome), x => x, 5)
                } else if (key === 'setor') {
                    suggestions = autocompleteSearch(value, [...new Set(equipes.map(e => e.setor))], x => x, 5)
                }
                setEquipeSuggestions({ ...equipeSuggestions, [key]: suggestions })
            }
        } else if (filterType === 'setores') {
            setSetoresFilters({ ...setoresFilters, [key]: value })
            setCurrentPage(1)
            if (value.trim()) {
                let suggestions: string[] = []
                if (key === 'numero') {
                    suggestions = autocompleteSearch(value, setores.map(s => s.numero.toString()), x => x, 5)
                } else if (key === 'nome') {
                    suggestions = autocompleteSearch(value, setores.map(s => s.nome), x => x, 5)
                } else if (key === 'gestores') {
                    suggestions = autocompleteSearch(value, [...new Set(setores.map(s => s.gestores))], x => x, 5)
                } else if (key === 'parceiro') {
                    suggestions = autocompleteSearch(value, [...new Set(setores.map(s => s.parceiro))], x => x, 5)
                }
                setSetoresSuggestions({ ...setoresSuggestions, [key]: suggestions })
            }
        } else if (filterType === 'parceiros') {
            setParceirosFilters({ ...parceirosFilters, [key]: value })
            setCurrentPage(1)
            if (value.trim()) {
                let suggestions: string[] = []
                if (key === 'numero') {
                    suggestions = autocompleteSearch(value, parceiros.map(p => (p as any).numero?.toString() || ''), x => x, 5)
                } else if (key === 'nome') {
                    suggestions = autocompleteSearch(value, parceiros.map(p => p.nome), x => x, 5)
                } else if (key === 'cnpj') {
                    suggestions = autocompleteSearch(value, parceiros.map(p => p.cnpj || ''), x => x, 5)
                }
                setParceirosSuggestions({ ...parceirosSuggestions, [key]: suggestions })
            }
        }
    }

    const handleEditClick = (item: any, type: SubTab) => {
        setEditingItem(item)
        setEditFormData({ ...item })
        setShowEditModal(true)
    }

    const handleSaveEdit = async () => {
        if (!editingItem || !editFormData) return

        if (activeSubTab === 'usuarios') {
            await updateUsuario(editingItem.id, editFormData)
        } else if (activeSubTab === 'equipes') {
            setEquipes(equipes.map(e => e.id === editingItem.id ? editFormData : e))
        } else if (activeSubTab === 'setores') {
            setSetores(setores.map(s => s.id === editingItem.id ? editFormData : s))
        } else if (activeSubTab === 'parceiros') {
            await updateParceiro(editingItem.id, editFormData)
        }

        setShowEditModal(false)
        setEditingItem(null)
        setEditFormData(null)
    }

    const handleDeleteClick = async (id: string) => {
        if (activeSubTab === 'usuarios') {
            await deleteUsuario(id)
        } else if (activeSubTab === 'equipes') {
            setEquipes(equipes.filter(e => e.id !== id))
        } else if (activeSubTab === 'setores') {
            setSetores(setores.filter(s => s.id !== id))
        } else if (activeSubTab === 'parceiros') {
            await deleteParceiro(id)
        }
    }

    const handleAddClick = () => {
        if (activeSubTab === 'usuarios') {
            setAddFormData({ nome: '', email: '', nivel: '', equipe: '', setor: '', parceiro: '', qtdProcessos: 0 })
        } else if (activeSubTab === 'equipes') {
            setAddFormData({ nome: '', setor: '' })
        } else if (activeSubTab === 'setores') {
            setAddFormData({ nome: '', gestores: '', parceiro: '', qtdProcessos: 0 })
        } else if (activeSubTab === 'parceiros') {
            setAddFormData({ nome: '', cnpj: '', qtdProcessos: 0 })
        }
        setShowAddModal(true)
    }

    const handleSaveAdd = async () => {
        if (!addFormData) return

        try {
            setModalError('')

            if (activeSubTab === 'usuarios') {
                // Validar campos obrigatórios
                if (!addFormData.nome?.trim()) {
                    setModalError('Nome é obrigatório')
                    return
                }
                if (!addFormData.email?.trim()) {
                    setModalError('Email é obrigatório')
                    return
                }

                await addUsuario({
                    nome: addFormData.nome.trim(),
                    email: addFormData.email.trim(),
                    nivel: addFormData.nivel || 'Visualizador',
                    equipe: addFormData.equipe || '',
                    setor: addFormData.setor || ''
                })
            } else if (activeSubTab === 'equipes') {
                if (!addFormData.nome?.trim()) {
                    setModalError('Nome é obrigatório')
                    return
                }
                setEquipes([...equipes, { ...addFormData, id: `eq-${Date.now()}`, numero: equipes.length + 1 }])
            } else if (activeSubTab === 'setores') {
                if (!addFormData.nome?.trim()) {
                    setModalError('Nome é obrigatório')
                    return
                }
                setSetores([...setores, { ...addFormData, id: `set-${Date.now()}`, numero: setores.length + 1 }])
            } else if (activeSubTab === 'parceiros') {
                if (!addFormData.nome?.trim()) {
                    setModalError('Nome é obrigatório')
                    return
                }
                await addParceiro({
                    nome: addFormData.nome.trim(),
                    cnpj: addFormData.cnpj || '',
                    email: addFormData.email || '',
                    telefone: addFormData.telefone || ''
                })
            }

            setShowAddModal(false)
            setAddFormData(null)
            setModalError('')
        } catch (err) {
            const errMsg = err instanceof Error ? err.message : 'Erro ao adicionar'
            setModalError(errMsg)
            console.error('Erro em handleSaveAdd:', err)
        }
    }

    const getPaginatedData = <T,>(data: T[]) => {
        const start = (currentPage - 1) * itemsPerPage
        const end = start + itemsPerPage
        return data.slice(start, end)
    }

    const getTotalPages = (data: any[]) => Math.ceil(data.length / itemsPerPage)

    const renderPaginationControls = (data: any[]) => {
        const totalPages = getTotalPages(data)
        return (
            <div className="flex items-center justify-between">
                <div className={`text-xs ${textColor}`}>
                    {`${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, data.length)} de ${data.length}`}
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className={`p-1 rounded transition ${darkMode ? 'bg-dark-600 hover:bg-dark-500' : 'bg-gray-200 hover:bg-gray-300'} disabled:opacity-50`}>
                        <ChevronsLeft size={16} />
                    </button>
                    <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className={`p-1 rounded transition ${darkMode ? 'bg-dark-600 hover:bg-dark-500' : 'bg-gray-200 hover:bg-gray-300'} disabled:opacity-50`}>
                        <ChevronLeft size={16} />
                    </button>
                    <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className={`p-1 rounded transition ${darkMode ? 'bg-dark-600 hover:bg-dark-500' : 'bg-gray-200 hover:bg-gray-300'} disabled:opacity-50`}>
                        <ChevronRight size={16} />
                    </button>
                    <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className={`p-1 rounded transition ${darkMode ? 'bg-dark-600 hover:bg-dark-500' : 'bg-gray-200 hover:bg-gray-300'} disabled:opacity-50`}>
                        <ChevronsRight size={16} />
                    </button>
                </div>
            </div>
        )
    }

    // Modal de edição
    const renderEditModal = () => {
        if (!showEditModal || !editFormData) return null

        const modalTitle = activeSubTab === 'usuarios' ? 'Usuário' : activeSubTab === 'equipes' ? 'Equipe' : activeSubTab === 'setores' ? 'Setor' : 'Parceiro'

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className={`${modalBg} rounded-lg p-6 max-w-md w-full space-y-4`}>
                    <div className="flex items-center justify-between">
                        <h3 className={`text-lg font-bold ${textColor}`}>Editar {modalTitle}</h3>
                        <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-3">
                        {activeSubTab === 'usuarios' && (
                            <>
                                <input type="text" placeholder="Nome" value={(editFormData as any).nome} onChange={(e) => setEditFormData({ ...editFormData, nome: e.target.value } as any)} className={`w-full px-3 py-2 text-sm rounded border ${inputBg} ${inputBorder}`} />
                                <input type="email" placeholder="Email" value={(editFormData as any).email} onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value } as any)} className={`w-full px-3 py-2 text-sm rounded border ${inputBg} ${inputBorder}`} />
                                <input type="text" placeholder="Nível" value={(editFormData as any).nivel} onChange={(e) => setEditFormData({ ...editFormData, nivel: e.target.value } as any)} className={`w-full px-3 py-2 text-sm rounded border ${inputBg} ${inputBorder}`} />
                                <input type="text" placeholder="Equipe" value={(editFormData as any).equipe} onChange={(e) => setEditFormData({ ...editFormData, equipe: e.target.value } as any)} className={`w-full px-3 py-2 text-sm rounded border ${inputBg} ${inputBorder}`} />
                                <input type="text" placeholder="Setor" value={(editFormData as any).setor} onChange={(e) => setEditFormData({ ...editFormData, setor: e.target.value } as any)} className={`w-full px-3 py-2 text-sm rounded border ${inputBg} ${inputBorder}`} />
                                <input type="text" placeholder="Parceiro" value={(editFormData as any).parceiro} onChange={(e) => setEditFormData({ ...editFormData, parceiro: e.target.value } as any)} className={`w-full px-3 py-2 text-sm rounded border ${inputBg} ${inputBorder}`} />
                            </>
                        )}
                        {activeSubTab === 'equipes' && (
                            <>
                                <input type="text" placeholder="Nome" value={(editFormData as any).nome} onChange={(e) => setEditFormData({ ...editFormData, nome: e.target.value } as any)} className={`w-full px-3 py-2 text-sm rounded border ${inputBg} ${inputBorder}`} />
                                <input type="text" placeholder="Setor" value={(editFormData as any).setor} onChange={(e) => setEditFormData({ ...editFormData, setor: e.target.value } as any)} className={`w-full px-3 py-2 text-sm rounded border ${inputBg} ${inputBorder}`} />
                            </>
                        )}
                        {activeSubTab === 'setores' && (
                            <>
                                <input type="text" placeholder="Nome" value={(editFormData as any).nome} onChange={(e) => setEditFormData({ ...editFormData, nome: e.target.value } as any)} className={`w-full px-3 py-2 text-sm rounded border ${inputBg} ${inputBorder}`} />
                                <input type="text" placeholder="Gestores" value={(editFormData as any).gestores} onChange={(e) => setEditFormData({ ...editFormData, gestores: e.target.value } as any)} className={`w-full px-3 py-2 text-sm rounded border ${inputBg} ${inputBorder}`} />
                                <input type="text" placeholder="Parceiro" value={(editFormData as any).parceiro} onChange={(e) => setEditFormData({ ...editFormData, parceiro: e.target.value } as any)} className={`w-full px-3 py-2 text-sm rounded border ${inputBg} ${inputBorder}`} />
                            </>
                        )}
                        {activeSubTab === 'parceiros' && (
                            <>
                                <input type="text" placeholder="Nome" value={(editFormData as any).nome} onChange={(e) => setEditFormData({ ...editFormData, nome: e.target.value } as any)} className={`w-full px-3 py-2 text-sm rounded border ${inputBg} ${inputBorder}`} />
                                <input type="text" placeholder="CNPJ" value={(editFormData as any).cnpj} onChange={(e) => setEditFormData({ ...editFormData, cnpj: e.target.value } as any)} className={`w-full px-3 py-2 text-sm rounded border ${inputBg} ${inputBorder}`} />
                            </>
                        )}
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
        )
    }

    // Modal de adição
    const renderAddModal = () => {
        if (!showAddModal || !addFormData) return null

        const modalTitle = activeSubTab === 'usuarios' ? 'Usuário' : activeSubTab === 'equipes' ? 'Equipe' : activeSubTab === 'setores' ? 'Setor' : 'Parceiro'

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className={`${modalBg} rounded-lg p-6 max-w-md w-full space-y-4`}>
                    <div className="flex items-center justify-between">
                        <h3 className={`text-lg font-bold ${textColor}`}>Adicionar {modalTitle}</h3>
                        <button onClick={() => { setShowAddModal(false); setModalError('') }} className="text-gray-400 hover:text-gray-600">
                            <X size={20} />
                        </button>
                    </div>

                    {modalError && (
                        <div className="p-3 bg-red-500/20 border border-red-500 rounded-lg">
                            <p className="text-red-500 text-sm font-medium">{modalError}</p>
                        </div>
                    )}

                    <div className="space-y-3">
                        {activeSubTab === 'usuarios' && (
                            <>
                                <input type="text" placeholder="Nome" value={(addFormData as any).nome} onChange={(e) => setAddFormData({ ...addFormData, nome: e.target.value } as any)} className={`w-full px-3 py-2 text-sm rounded border ${inputBg} ${inputBorder}`} />
                                <input type="email" placeholder="Email" value={(addFormData as any).email} onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value } as any)} className={`w-full px-3 py-2 text-sm rounded border ${inputBg} ${inputBorder}`} />
                                <input type="text" placeholder="Nível" value={(addFormData as any).nivel} onChange={(e) => setAddFormData({ ...addFormData, nivel: e.target.value } as any)} className={`w-full px-3 py-2 text-sm rounded border ${inputBg} ${inputBorder}`} />
                                <input type="text" placeholder="Equipe" value={(addFormData as any).equipe} onChange={(e) => setAddFormData({ ...addFormData, equipe: e.target.value } as any)} className={`w-full px-3 py-2 text-sm rounded border ${inputBg} ${inputBorder}`} />
                                <input type="text" placeholder="Setor" value={(addFormData as any).setor} onChange={(e) => setAddFormData({ ...addFormData, setor: e.target.value } as any)} className={`w-full px-3 py-2 text-sm rounded border ${inputBg} ${inputBorder}`} />
                                <input type="text" placeholder="Parceiro" value={(addFormData as any).parceiro} onChange={(e) => setAddFormData({ ...addFormData, parceiro: e.target.value } as any)} className={`w-full px-3 py-2 text-sm rounded border ${inputBg} ${inputBorder}`} />
                            </>
                        )}
                        {activeSubTab === 'equipes' && (
                            <>
                                <input type="text" placeholder="Nome" value={(addFormData as any).nome} onChange={(e) => setAddFormData({ ...addFormData, nome: e.target.value } as any)} className={`w-full px-3 py-2 text-sm rounded border ${inputBg} ${inputBorder}`} />
                                <input type="text" placeholder="Setor" value={(addFormData as any).setor} onChange={(e) => setAddFormData({ ...addFormData, setor: e.target.value } as any)} className={`w-full px-3 py-2 text-sm rounded border ${inputBg} ${inputBorder}`} />
                            </>
                        )}
                        {activeSubTab === 'setores' && (
                            <>
                                <input type="text" placeholder="Nome" value={(addFormData as any).nome} onChange={(e) => setAddFormData({ ...addFormData, nome: e.target.value } as any)} className={`w-full px-3 py-2 text-sm rounded border ${inputBg} ${inputBorder}`} />
                                <input type="text" placeholder="Gestores" value={(addFormData as any).gestores} onChange={(e) => setAddFormData({ ...addFormData, gestores: e.target.value } as any)} className={`w-full px-3 py-2 text-sm rounded border ${inputBg} ${inputBorder}`} />
                                <input type="text" placeholder="Parceiro" value={(addFormData as any).parceiro} onChange={(e) => setAddFormData({ ...addFormData, parceiro: e.target.value } as any)} className={`w-full px-3 py-2 text-sm rounded border ${inputBg} ${inputBorder}`} />
                            </>
                        )}
                        {activeSubTab === 'parceiros' && (
                            <>
                                <input type="text" placeholder="Nome" value={(addFormData as any).nome} onChange={(e) => setAddFormData({ ...addFormData, nome: e.target.value } as any)} className={`w-full px-3 py-2 text-sm rounded border ${inputBg} ${inputBorder}`} />
                                <input type="text" placeholder="CNPJ" value={(addFormData as any).cnpj} onChange={(e) => setAddFormData({ ...addFormData, cnpj: e.target.value } as any)} className={`w-full px-3 py-2 text-sm rounded border ${inputBg} ${inputBorder}`} />
                            </>
                        )}
                    </div>

                    <div className="flex gap-2 pt-4">
                        <button onClick={handleSaveAdd} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded font-semibold transition">
                            Adicionar
                        </button>
                        <button onClick={() => { setShowAddModal(false); setModalError('') }} className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded font-semibold transition">
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // Renderizar abas
    if (activeSubTab === 'usuarios') {
        const paginatedData = getPaginatedData(filteredUsuarios)
        return (
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between gap-2 border-b border-dark-600 mb-6 pb-4">
                    <div className="flex gap-2">
                        {['usuarios', 'equipes', 'setores', 'parceiros'].map(tab => (
                            <button key={tab} onClick={() => { setActiveSubTab(tab as SubTab); setCurrentPage(1) }} className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm border-b-2 transition ${activeSubTab === tab ? `border-blue-600 ${darkMode ? 'text-blue-400' : 'text-blue-600'}` : `border-transparent ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}`}>
                                {tab === 'usuarios' && <Users size={18} />}
                                {tab === 'equipes' && <Users2 size={18} />}
                                {tab === 'setores' && <Building2 size={18} />}
                                {tab === 'parceiros' && <Briefcase size={18} />}
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                    <button onClick={handleAddClick} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded font-semibold transition">
                        <Plus size={16} /> Adicionar
                    </button>
                </div>
                <div className={`rounded-lg border ${borderColor} overflow-hidden`}>
                    <table className="w-full">
                        <thead>
                            <tr className={`border-b ${borderColor} ${headerBg}`}>
                                <th className="px-2 py-2 text-left font-semibold text-xs">ID</th>
                                <th className="px-2 py-2 text-left font-semibold text-xs">Nome</th>
                                <th className="px-2 py-2 text-left font-semibold text-xs">Email</th>
                                <th className="px-2 py-2 text-left font-semibold text-xs">Nível</th>
                                <th className="px-2 py-2 text-left font-semibold text-xs">Equipe</th>
                                <th className="px-2 py-2 text-left font-semibold text-xs">Setor</th>
                                <th className="px-2 py-2 text-left font-semibold text-xs">Parceiro</th>
                                <th className="px-2 py-2 text-left font-semibold text-xs">Qtd. Processos</th>
                                <th className="px-2 py-2 text-right font-semibold text-xs">Ações</th>
                            </tr>
                            <tr className={`border-b ${borderColor} ${darkMode ? 'bg-dark-700' : 'bg-gray-50'}`}>
                                <td className="px-2 py-1"><input type="text" placeholder="Filtro" value={usuariosFilters.numero} onChange={(e) => handleFilterChange('usuarios', 'numero', e.target.value)} className={`w-full px-1 py-0.5 text-xs border rounded ${inputBg} ${inputBorder}`} /></td>
                                <td className="px-2 py-1"><input type="text" placeholder="Filtro" value={usuariosFilters.nome} onChange={(e) => handleFilterChange('usuarios', 'nome', e.target.value)} className={`w-full px-1 py-0.5 text-xs border rounded ${inputBg} ${inputBorder}`} /></td>
                                <td className="px-2 py-1"><input type="text" placeholder="Filtro" value={usuariosFilters.email} onChange={(e) => handleFilterChange('usuarios', 'email', e.target.value)} className={`w-full px-1 py-0.5 text-xs border rounded ${inputBg} ${inputBorder}`} /></td>
                                <td className="px-2 py-1"><input type="text" placeholder="Filtro" value={usuariosFilters.nivel} onChange={(e) => handleFilterChange('usuarios', 'nivel', e.target.value)} className={`w-full px-1 py-0.5 text-xs border rounded ${inputBg} ${inputBorder}`} /></td>
                                <td className="px-2 py-1"><input type="text" placeholder="Filtro" value={usuariosFilters.equipe} onChange={(e) => handleFilterChange('usuarios', 'equipe', e.target.value)} className={`w-full px-1 py-0.5 text-xs border rounded ${inputBg} ${inputBorder}`} /></td>
                                <td className="px-2 py-1"><input type="text" placeholder="Filtro" value={usuariosFilters.setor} onChange={(e) => handleFilterChange('usuarios', 'setor', e.target.value)} className={`w-full px-1 py-0.5 text-xs border rounded ${inputBg} ${inputBorder}`} /></td>
                                <td className="px-2 py-1"><input type="text" placeholder="Filtro" value={usuariosFilters.parceiro} onChange={(e) => handleFilterChange('usuarios', 'parceiro', e.target.value)} className={`w-full px-1 py-0.5 text-xs border rounded ${inputBg} ${inputBorder}`} /></td>
                                <td colSpan={2}></td>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.map((usuario) => (
                                <tr key={usuario.id} className={`border-b ${borderColor} hover:${darkMode ? 'bg-dark-600' : 'bg-gray-50'} transition`}>
                                    <td className={`px-2 py-1 text-xs ${textColor}`}>{(usuario as any).numero}</td>
                                    <td className={`px-2 py-1 text-xs ${textColor}`}>{usuario.nome}</td>
                                    <td className={`px-2 py-1 text-xs ${textColor}`}>{usuario.email}</td>
                                    <td className={`px-2 py-1 text-xs ${textColor}`}>{usuario.nivel}</td>
                                    <td className={`px-2 py-1 text-xs ${textColor}`}>{usuario.equipe}</td>
                                    <td className={`px-2 py-1 text-xs ${textColor}`}>{usuario.setor}</td>
                                    <td className={`px-2 py-1 text-xs ${textColor}`}>{(usuario as any).parceiro}</td>
                                    <td className={`px-2 py-1 text-xs ${textColor}`}>{(usuario as any).qtdProcessos}</td>
                                    <td className="px-2 py-1 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleEditClick(usuario, 'usuarios')} className="px-3 py-1 text-xs rounded transition text-white bg-blue-600 hover:bg-blue-700">Editar</button>
                                            <button onClick={() => handleDeleteClick(usuario.id)} className="px-3 py-1 text-xs rounded transition text-white bg-red-600 hover:bg-red-700">Excluir</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {renderPaginationControls(filteredUsuarios)}
                {renderEditModal()}
                {renderAddModal()}
            </div>
        )
    }

    // Similar para outras abas...
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between gap-2 border-b border-dark-600 pb-4">
                <div className="flex gap-2">
                    {['usuarios', 'equipes', 'setores', 'parceiros'].map(tab => (
                        <button key={tab} onClick={() => { setActiveSubTab(tab as SubTab); setCurrentPage(1) }} className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm border-b-2 transition ${activeSubTab === tab ? `border-blue-600 ${darkMode ? 'text-blue-400' : 'text-blue-600'}` : `border-transparent ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}`}>
                            {tab === 'usuarios' && <Users size={18} />}
                            {tab === 'equipes' && <Users2 size={18} />}
                            {tab === 'setores' && <Building2 size={18} />}
                            {tab === 'parceiros' && <Briefcase size={18} />}
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
                <button onClick={handleAddClick} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded font-semibold transition">
                    <Plus size={16} /> Adicionar
                </button>
            </div>
            {activeSubTab === 'equipes' && (
                <>
                    <div className={`rounded-lg border ${borderColor} overflow-hidden`}>
                        <table className="w-full">
                            <thead>
                                <tr className={`border-b ${borderColor} ${headerBg}`}>
                                    <th className="px-2 py-2 text-left font-semibold text-xs">Nome</th>
                                    <th className="px-2 py-2 text-left font-semibold text-xs">Setor</th>
                                    <th className="px-2 py-2 text-right font-semibold text-xs">Ações</th>
                                </tr>
                                <tr className={`border-b ${borderColor} ${darkMode ? 'bg-dark-700' : 'bg-gray-50'}`}>
                                    <td className="px-2 py-1"><input type="text" placeholder="Filtro" value={equipesFilters.nome} onChange={(e) => handleFilterChange('equipes', 'nome', e.target.value)} className={`w-full px-1 py-0.5 text-xs border rounded ${inputBg} ${inputBorder}`} /></td>
                                    <td className="px-2 py-1"><input type="text" placeholder="Filtro" value={equipesFilters.setor} onChange={(e) => handleFilterChange('equipes', 'setor', e.target.value)} className={`w-full px-1 py-0.5 text-xs border rounded ${inputBg} ${inputBorder}`} /></td>
                                    <td></td>
                                </tr>
                            </thead>
                            <tbody>
                                {getPaginatedData(filteredEquipes).map((equipe) => (
                                    <tr key={equipe.id} className={`border-b ${borderColor} hover:${darkMode ? 'bg-dark-600' : 'bg-gray-50'} transition`}>
                                        <td className={`px-2 py-1 text-xs ${textColor}`}>{equipe.nome}</td>
                                        <td className={`px-2 py-1 text-xs ${textColor}`}>{equipe.setor}</td>
                                        <td className="px-2 py-1 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleEditClick(equipe, 'equipes')} className="px-3 py-1 text-xs rounded transition text-white bg-blue-600 hover:bg-blue-700">Editar</button>
                                                <button onClick={() => handleDeleteClick(equipe.id)} className="px-3 py-1 text-xs rounded transition text-white bg-red-600 hover:bg-red-700">Excluir</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {renderPaginationControls(filteredEquipes)}
                </>
            )}
            {activeSubTab === 'setores' && (
                <>
                    <div className={`rounded-lg border ${borderColor} overflow-hidden`}>
                        <table className="w-full">
                            <thead>
                                <tr className={`border-b ${borderColor} ${headerBg}`}>
                                    <th className="px-2 py-2 text-left font-semibold text-xs">ID</th>
                                    <th className="px-2 py-2 text-left font-semibold text-xs">Nome</th>
                                    <th className="px-2 py-2 text-left font-semibold text-xs">Gestores</th>
                                    <th className="px-2 py-2 text-left font-semibold text-xs">Parceiro</th>
                                    <th className="px-2 py-2 text-left font-semibold text-xs">Qtd. Processos</th>
                                    <th className="px-2 py-2 text-right font-semibold text-xs">Ações</th>
                                </tr>
                                <tr className={`border-b ${borderColor} ${darkMode ? 'bg-dark-700' : 'bg-gray-50'}`}>
                                    <td className="px-2 py-1"><input type="text" placeholder="Filtro" value={setoresFilters.numero} onChange={(e) => handleFilterChange('setores', 'numero', e.target.value)} className={`w-full px-1 py-0.5 text-xs border rounded ${inputBg} ${inputBorder}`} /></td>
                                    <td className="px-2 py-1"><input type="text" placeholder="Filtro" value={setoresFilters.nome} onChange={(e) => handleFilterChange('setores', 'nome', e.target.value)} className={`w-full px-1 py-0.5 text-xs border rounded ${inputBg} ${inputBorder}`} /></td>
                                    <td className="px-2 py-1"><input type="text" placeholder="Filtro" value={setoresFilters.gestores} onChange={(e) => handleFilterChange('setores', 'gestores', e.target.value)} className={`w-full px-1 py-0.5 text-xs border rounded ${inputBg} ${inputBorder}`} /></td>
                                    <td className="px-2 py-1"><input type="text" placeholder="Filtro" value={setoresFilters.parceiro} onChange={(e) => handleFilterChange('setores', 'parceiro', e.target.value)} className={`w-full px-1 py-0.5 text-xs border rounded ${inputBg} ${inputBorder}`} /></td>
                                    <td colSpan={2}></td>
                                </tr>
                            </thead>
                            <tbody>
                                {getPaginatedData(filteredSetores).map((setor) => (
                                    <tr key={setor.id} className={`border-b ${borderColor} hover:${darkMode ? 'bg-dark-600' : 'bg-gray-50'} transition`}>
                                        <td className={`px-2 py-1 text-xs ${textColor}`}>{setor.numero}</td>
                                        <td className={`px-2 py-1 text-xs ${textColor}`}>{setor.nome}</td>
                                        <td className={`px-2 py-1 text-xs ${textColor}`}>{setor.gestores}</td>
                                        <td className={`px-2 py-1 text-xs ${textColor}`}>{setor.parceiro}</td>
                                        <td className={`px-2 py-1 text-xs ${textColor}`}>{setor.qtdProcessos}</td>
                                        <td className="px-2 py-1 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleEditClick(setor, 'setores')} className="px-3 py-1 text-xs rounded transition text-white bg-blue-600 hover:bg-blue-700">Editar</button>
                                                <button onClick={() => handleDeleteClick(setor.id)} className="px-3 py-1 text-xs rounded transition text-white bg-red-600 hover:bg-red-700">Excluir</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {renderPaginationControls(filteredSetores)}
                </>
            )}
            {activeSubTab === 'parceiros' && (
                <>
                    <div className={`rounded-lg border ${borderColor} overflow-hidden`}>
                        <table className="w-full">
                            <thead>
                                <tr className={`border-b ${borderColor} ${headerBg}`}>
                                    <th className="px-2 py-2 text-left font-semibold text-xs">ID</th>
                                    <th className="px-2 py-2 text-left font-semibold text-xs">Nome</th>
                                    <th className="px-2 py-2 text-left font-semibold text-xs">CNPJ</th>
                                    <th className="px-2 py-2 text-left font-semibold text-xs">Qtd. Processos</th>
                                    <th className="px-2 py-2 text-right font-semibold text-xs">Ações</th>
                                </tr>
                                <tr className={`border-b ${borderColor} ${darkMode ? 'bg-dark-700' : 'bg-gray-50'}`}>
                                    <td className="px-2 py-1"><input type="text" placeholder="Filtro" value={parceirosFilters.numero} onChange={(e) => handleFilterChange('parceiros', 'numero', e.target.value)} className={`w-full px-1 py-0.5 text-xs border rounded ${inputBg} ${inputBorder}`} /></td>
                                    <td className="px-2 py-1"><input type="text" placeholder="Filtro" value={parceirosFilters.nome} onChange={(e) => handleFilterChange('parceiros', 'nome', e.target.value)} className={`w-full px-1 py-0.5 text-xs border rounded ${inputBg} ${inputBorder}`} /></td>
                                    <td className="px-2 py-1"><input type="text" placeholder="Filtro" value={parceirosFilters.cnpj} onChange={(e) => handleFilterChange('parceiros', 'cnpj', e.target.value)} className={`w-full px-1 py-0.5 text-xs border rounded ${inputBg} ${inputBorder}`} /></td>
                                    <td colSpan={2}></td>
                                </tr>
                            </thead>
                            <tbody>
                                {getPaginatedData(filteredParceiros).map((parceiro) => (
                                    <tr key={parceiro.id} className={`border-b ${borderColor} hover:${darkMode ? 'bg-dark-600' : 'bg-gray-50'} transition`}>
                                        <td className={`px-2 py-1 text-xs ${textColor}`}>{(parceiro as any).numero}</td>
                                        <td className={`px-2 py-1 text-xs ${textColor}`}>{parceiro.nome}</td>
                                        <td className={`px-2 py-1 text-xs ${textColor}`}>{parceiro.cnpj}</td>
                                        <td className={`px-2 py-1 text-xs ${textColor}`}>{parceiro.qtd_processos}</td>
                                        <td className="px-2 py-1 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleEditClick(parceiro, 'parceiros')} className="px-3 py-1 text-xs rounded transition text-white bg-blue-600 hover:bg-blue-700">Editar</button>
                                                <button onClick={() => handleDeleteClick(parceiro.id)} className="px-3 py-1 text-xs rounded transition text-white bg-red-600 hover:bg-red-700">Excluir</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {renderPaginationControls(filteredParceiros)}
                </>
            )}
            {renderEditModal()}
            {renderAddModal()}
        </div>
    )
}
