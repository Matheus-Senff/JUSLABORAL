import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase/client'

export interface Cliente {
  id: string
  org_id?: string
  numero?: number
  nome: string
  cpf_cnpj?: string
  parceiro?: string
  parceiro_id?: string
  email?: string
  telefone?: string
  uf?: string
  cidade?: string
  created_at?: string
}

export function useSupabaseClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('nome')
    if (error) setError(error.message)
    else setClientes(data || [])
    setLoading(false)
  }

  async function addCliente(c: Omit<Cliente, 'id' | 'created_at' | 'numero'>) {
    const { data, error } = await supabase.from('clientes').insert(c).select().single()
    if (error) throw error
    setClientes(prev => [...prev, data])
    return data
  }

  async function updateCliente(id: string, updates: Partial<Cliente>) {
    const { data, error } = await supabase.from('clientes').update(updates).eq('id', id).select().single()
    if (error) throw error
    setClientes(prev => prev.map(c => c.id === id ? data : c))
    return data
  }

  async function deleteCliente(id: string) {
    const { error } = await supabase.from('clientes').delete().eq('id', id)
    if (error) throw error
    setClientes(prev => prev.filter(c => c.id !== id))
  }

  return { clientes, loading, error, addCliente, updateCliente, deleteCliente, reload: load }
}
