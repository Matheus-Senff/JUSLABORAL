import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase/client'

interface Setor {
    id: string
    org_id?: string
    nome: string
    criador?: string
    created_at?: string
}

export const useSupabaseSetores = () => {
    const [setores, setSetores] = useState<Setor[]>([])
    const [nomes, setNomes] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchSetores = async () => {
        try {
            setLoading(true)
            setError(null)

            const { data, error: supabaseError } = await supabase
                .from('setores')
                .select('*')
                .order('nome', { ascending: true })

            if (supabaseError) throw supabaseError

            setSetores(data || [])
            setNomes((data || []).map(s => s.nome))
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao buscar setores'
            setError(message)
            console.error('Erro fetching setores:', err)
            setSetores([])
            setNomes([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSetores()
    }, [])

    const addSetor = async (nome: string, criador?: string) => {
        try {
            const { data: userData, error: userError } = await supabase.auth.getUser()
            if (userError || !userData.user) throw new Error('Usuário não autenticado')

            const { data, error } = await supabase
                .from('setores')
                .insert([{ nome, org_id: userData.user.id, criador: criador || userData.user.id }])
                .select()

            if (error) throw error
            if (data) {
                setSetores(prev => [...prev, ...data])
                setNomes(prev => [...prev, ...data.map(s => s.nome)])
            }
            return data?.[0]
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao adicionar setor'
            setError(message)
            console.error('Erro adding setor:', err)
            return null
        }
    }

    const updateSetor = async (id: string, updates: Partial<Setor>) => {
        try {
            const { data, error } = await supabase
                .from('setores')
                .update(updates)
                .eq('id', id)
                .select()

            if (error) throw error
            if (data) {
                setSetores(prev => prev.map(s => s.id === id ? data[0] : s))
                setNomes(setores.map(s => s.nome))
            }
            return data?.[0]
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao atualizar setor'
            setError(message)
            console.error('Erro updating setor:', err)
            return null
        }
    }

    const deleteSetor = async (id: string) => {
        try {
            const { error } = await supabase
                .from('setores')
                .delete()
                .eq('id', id)

            if (error) throw error
            setSetores(prev => prev.filter(s => s.id !== id))
            setNomes(setores.filter(s => s.id !== id).map(s => s.nome))
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao deletar setor'
            setError(message)
            console.error('Erro deleting setor:', err)
        }
    }

    const reload = () => fetchSetores()

    return {
        setores,
        nomes,
        loading,
        error,
        addSetor,
        updateSetor,
        deleteSetor,
        reload,
    }
}
