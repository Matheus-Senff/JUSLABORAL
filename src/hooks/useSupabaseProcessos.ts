import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase/client'
import { Process } from '../types'

function mapRow(row: any): Process {
  return {
    id: row.id,
    numero: row.numero,
    parceiro: row.parceiro || '',
    cliente: row.cliente,
    cpf: row.cpf || '',
    processo: row.processo || '',
    cidade: row.cidade || '',
    uf: row.uf || '',
    responsavel: row.responsavel || '',
    dataInicio: row.data_inicio || '',
    status: row.status || '',
    ultimaAlteracao: row.ultima_alteracao ? new Date(row.ultima_alteracao).toLocaleString('pt-BR') : '',
    telefone: row.telefone,
    email: row.email,
    natureza: row.natureza,
    tipo: row.tipo_processo,
    orgao: row.orgao,
    endereco: row.endereco,
    nProcesso: row.n_processo,
    setor: row.setor,
    fase: row.fase,
    andamento: row.andamento,
  }
}

export function useSupabaseProcessos(tipo: 'estadual' | 'federal') {
  const [processos, setProcessos] = useState<Process[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { load() }, [tipo])

  async function load() {
    setLoading(true)
    const { data, error } = await supabase
      .from('processos')
      .select('*')
      .eq('tipo', tipo)
      .order('numero', { ascending: false })
    if (error) setError(error.message)
    else setProcessos((data || []).map(mapRow))
    setLoading(false)
  }

  async function addProcesso(p: Omit<Process, 'id' | 'numero' | 'ultimaAlteracao'> & { tipo?: string }) {
    const row = {
      tipo: p.tipo || tipo,
      parceiro: p.parceiro,
      cliente: p.cliente,
      cpf: p.cpf,
      processo: p.processo,
      cidade: p.cidade,
      uf: p.uf,
      responsavel: p.responsavel,
      data_inicio: p.dataInicio,
      status: p.status,
      telefone: p.telefone,
      email: p.email,
      natureza: p.natureza,
      tipo_processo: (p as any).tipo_processo || p.tipo,
      orgao: p.orgao,
      endereco: p.endereco,
      n_processo: p.nProcesso,
      setor: p.setor,
      fase: p.fase,
      andamento: p.andamento,
    }
    const { data, error } = await supabase.from('processos').insert(row).select().single()
    if (error) throw error
    const mapped = mapRow(data)
    setProcessos(prev => [mapped, ...prev])
    return mapped
  }

  async function updateProcesso(id: string, updates: Partial<Process>) {
    const row: any = {}
    if (updates.parceiro !== undefined) row.parceiro = updates.parceiro
    if (updates.cliente !== undefined) row.cliente = updates.cliente
    if (updates.cpf !== undefined) row.cpf = updates.cpf
    if (updates.processo !== undefined) row.processo = updates.processo
    if (updates.cidade !== undefined) row.cidade = updates.cidade
    if (updates.uf !== undefined) row.uf = updates.uf
    if (updates.responsavel !== undefined) row.responsavel = updates.responsavel
    if (updates.dataInicio !== undefined) row.data_inicio = updates.dataInicio
    if (updates.status !== undefined) row.status = updates.status
    if (updates.telefone !== undefined) row.telefone = updates.telefone
    if (updates.email !== undefined) row.email = updates.email
    if (updates.natureza !== undefined) row.natureza = updates.natureza
    if (updates.tipo !== undefined) row.tipo_processo = updates.tipo
    if (updates.orgao !== undefined) row.orgao = updates.orgao
    if (updates.endereco !== undefined) row.endereco = updates.endereco
    if (updates.nProcesso !== undefined) row.n_processo = updates.nProcesso
    if (updates.setor !== undefined) row.setor = updates.setor
    if (updates.fase !== undefined) row.fase = updates.fase
    if (updates.andamento !== undefined) row.andamento = updates.andamento
    row.ultima_alteracao = new Date().toISOString()

    const { data, error } = await supabase.from('processos').update(row).eq('id', id).select().single()
    if (error) throw error
    const mapped = mapRow(data)
    setProcessos(prev => prev.map(p => p.id === id ? mapped : p))
    return mapped
  }

  async function deleteProcesso(id: string) {
    const { error } = await supabase.from('processos').delete().eq('id', id)
    if (error) throw error
    setProcessos(prev => prev.filter(p => p.id !== id))
  }

  return { processos, loading, error, addProcesso, updateProcesso, deleteProcesso, reload: load }
}
