import React, { createContext, useContext, useState, ReactNode } from 'react'

export interface GlobalFilters {
    // Filtros comuns entre Processos e Tarefas
    responsavel: string
    setor: string
    status: string

    // Filtros específicos de Processos
    numero: string
    parceiro: string
    cliente: string
    cpf: string
    processo: string
    cidade: string
    uf: string
    natureza: string
    nProcesso: string
    telefone: string
    email: string

    // Filtros específicos de Tarefas
    tipoAcao: string
    titulo: string

    // Filtros de data
    dataInicio: string
    dataFinal: string
    dataInicioIntervalo: string
    dataFinalIntervalo: string
    dataAlteracaoSetor: string
    dataAlteracaoResponsavel: string
    dataAlteracaoStatus: string
}

interface FiltersContextType {
    filters: GlobalFilters
    updateFilter: (key: keyof GlobalFilters, value: string) => void
    updateFilters: (newFilters: Partial<GlobalFilters>) => void
    clearFilters: () => void
    clearCommonFilters: () => void
}

const defaultFilters: GlobalFilters = {
    responsavel: '',
    setor: '',
    status: '',
    numero: '',
    parceiro: '',
    cliente: '',
    cpf: '',
    processo: '',
    cidade: '',
    uf: '',
    natureza: '',
    nProcesso: '',
    telefone: '',
    email: '',
    tipoAcao: '',
    titulo: '',
    dataInicio: '',
    dataFinal: '',
    dataInicioIntervalo: '',
    dataFinalIntervalo: '',
    dataAlteracaoSetor: '',
    dataAlteracaoResponsavel: '',
    dataAlteracaoStatus: '',
}

const FiltersContext = createContext<FiltersContextType | undefined>(undefined)

export const FiltersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [filters, setFilters] = useState<GlobalFilters>(defaultFilters)

    const updateFilter = (key: keyof GlobalFilters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }))
    }

    const updateFilters = (newFilters: Partial<GlobalFilters>) => {
        setFilters(prev => ({ ...prev, ...newFilters }))
    }

    const clearFilters = () => {
        setFilters(defaultFilters)
    }

    const clearCommonFilters = () => {
        setFilters(prev => ({
            ...prev,
            responsavel: '',
            setor: '',
            status: '',
        }))
    }

    return (
        <FiltersContext.Provider value={{ filters, updateFilter, updateFilters, clearFilters, clearCommonFilters }}>
            {children}
        </FiltersContext.Provider>
    )
}

export const useFilters = () => {
    const context = useContext(FiltersContext)
    if (context === undefined) {
        throw new Error('useFilters must be used within a FiltersProvider')
    }
    return context
}
