import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase/client'

export interface Equipe {
    id: string
    org_id?: string
    nome: string
    setor?: string
    created_at?: string
}

export function useSupabaseEquipes() {
    const [equipes, setEquipes] = useState<Equipe[]>([])
    const [nomes, setNomes] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => { load() }, [])

    async function load() {
        setLoading(true)
        const { data, error } = await supabase
            .from('equipes')
            .select('*')
            .order('nome')
        if (error) setError(error.message)
        else {
            setEquipes(data || [])
            setNomes((data || []).map(e => e.nome))
        }
        setLoading(false)
    }

    async function addEquipe(nome: string, setor?: string) {
        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userError || !userData.user) throw new Error('Usuário não autenticado')

        const { data, error } = await supabase
            .from('equipes')
            .insert([{ nome, setor, org_id: userData.user.id }])
            .select()

        if (error) throw error
        if (data) {
            setEquipes(prev => [...prev, ...data])
            setNomes(prev => [...prev, ...data.map(e => e.nome)])
        }
        return data?.[0]
    }

    async function updateEquipe(id: string, updates: Partial<Equipe>) {
        const { data, error } = await supabase
            .from('equipes')
            .update(updates)
            .eq('id', id)
            .select()

        if (error) throw error
        if (data) {
            setEquipes(prev => prev.map(e => e.id === id ? data[0] : e))
            setNomes(equipes.map(e => e.nome))
        }
        return data?.[0]
    }

    async function deleteEquipe(id: string) {
        const { error } = await supabase
            .from('equipes')
            .delete()
            .eq('id', id)

        if (error) throw error
        setEquipes(prev => prev.filter(e => e.id !== id))
        setNomes(equipes.filter(e => e.id !== id).map(e => e.nome))
    }

    const reload = () => load()

    return {
        equipes,
        nomes,
        loading,
        error,
        addEquipe,
        updateEquipe,
        deleteEquipe,
        reload,
    }
}
