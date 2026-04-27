import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase/client'

export interface Parceiro {
  id: string
  org_id?: string
  nome: string
  cnpj?: string
  email?: string
  telefone?: string
  qtd_processos?: number
  created_at?: string
}

export function useSupabaseParceiros() {
  const [parceiros, setParceiros] = useState<Parceiro[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data, error } = await supabase
      .from('parceiros')
      .select('*')
      .order('nome')
    if (error) setError(error.message)
    else setParceiros(data || [])
    setLoading(false)
  }

  async function addParceiro(p: Omit<Parceiro, 'id' | 'created_at'>) {
    const { data, error } = await supabase.from('parceiros').insert(p).select().single()
    if (error) throw error
    setParceiros(prev => [...prev, data])
    return data
  }

  async function updateParceiro(id: string, updates: Partial<Parceiro>) {
    const { data, error } = await supabase.from('parceiros').update(updates).eq('id', id).select().single()
    if (error) throw error
    setParceiros(prev => prev.map(p => p.id === id ? data : p))
    return data
  }

  async function deleteParceiro(id: string) {
    const { error } = await supabase.from('parceiros').delete().eq('id', id)
    if (error) throw error
    setParceiros(prev => prev.filter(p => p.id !== id))
  }

  // Helper: lista de nomes para dropdowns
  const nomes = parceiros.map(p => p.nome)

  return { parceiros, nomes, loading, error, addParceiro, updateParceiro, deleteParceiro, reload: load }
}
