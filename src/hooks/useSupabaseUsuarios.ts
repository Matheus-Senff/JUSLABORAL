import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase/client'

export interface UsuarioSistema {
  id: string
  org_id?: string
  nome: string
  email?: string
  nivel?: string
  equipe?: string
  setor?: string
  created_at?: string
}

export function useSupabaseUsuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioSistema[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data, error } = await supabase
      .from('usuarios_sistema')
      .select('*')
      .order('nome')
    if (error) setError(error.message)
    else setUsuarios(data || [])
    setLoading(false)
  }

  async function addUsuario(u: Omit<UsuarioSistema, 'id' | 'created_at'>) {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData.user) throw new Error('Usuário não autenticado')

    const { data, error } = await supabase.from('usuarios_sistema').insert({ ...u, org_id: userData.user.id }).select().single()
    if (error) throw error
    setUsuarios(prev => [...prev, data])
    return data
  }

  async function updateUsuario(id: string, updates: Partial<UsuarioSistema>) {
    const { data, error } = await supabase.from('usuarios_sistema').update(updates).eq('id', id).select().single()
    if (error) throw error
    setUsuarios(prev => prev.map(u => u.id === id ? data : u))
    return data
  }

  async function deleteUsuario(id: string) {
    const { error } = await supabase.from('usuarios_sistema').delete().eq('id', id)
    if (error) throw error
    setUsuarios(prev => prev.filter(u => u.id !== id))
  }

  // Helper: lista de nomes para dropdowns
  const nomes = usuarios.map(u => u.nome)

  return { usuarios, nomes, loading, error, addUsuario, updateUsuario, deleteUsuario, reload: load }
}
