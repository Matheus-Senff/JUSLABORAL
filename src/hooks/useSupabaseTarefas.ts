import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase/client'
import { ProcessTask } from '../types'

function mapRow(row: any): ProcessTask {
  return {
    id: row.id,
    processId: row.process_id_texto || row.process_id || '',
    titulo: row.titulo,
    descricao: row.descricao,
    tipo: row.tipo,
    acao: row.acao,
    tarefa: row.tarefa,
    observacao: row.observacao || '',
    prazo: row.prazo,
    responsavel: row.responsavel || '',
    setor: row.setor || '',
    tipoResponsavel: row.tipo_responsavel,
    tipoAcao: row.tipo_acao || 'Outro',
    status: row.status || 'Aberto',
    dataCriacao: row.data_criacao ? new Date(row.data_criacao).toLocaleString('pt-BR') : '',
    dataConclusao: row.data_conclusao ? new Date(row.data_conclusao).toLocaleString('pt-BR') : undefined,
    autor: row.autor || '',
  }
}

export function useSupabaseTarefas() {
  const [tarefas, setTarefas] = useState<ProcessTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data, error } = await supabase
      .from('tarefas')
      .select('*')
      .order('data_criacao', { ascending: false })
    if (error) setError(error.message)
    else setTarefas((data || []).map(mapRow))
    setLoading(false)
  }

  async function addTarefa(t: ProcessTask) {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData.user) throw new Error('Usuário não autenticado')

    const row = {
      org_id: userData.user.id,
      process_id_texto: t.processId,
      titulo: t.titulo,
      descricao: t.descricao,
      tipo: t.tipo,
      acao: t.acao,
      tarefa: t.tarefa,
      observacao: t.observacao,
      prazo: t.prazo,
      responsavel: t.responsavel,
      setor: t.setor,
      tipo_responsavel: t.tipoResponsavel,
      tipo_acao: t.tipoAcao,
      status: t.status || 'Aberto',
      autor: t.autor,
    }
    const { data, error } = await supabase.from('tarefas').insert(row).select().single()
    if (error) throw error
    const mapped = mapRow(data)
    setTarefas(prev => [mapped, ...prev])
    return mapped
  }

  async function updateTarefa(id: string, updates: Partial<ProcessTask>) {
    const row: any = {}
    if (updates.titulo !== undefined) row.titulo = updates.titulo
    if (updates.descricao !== undefined) row.descricao = updates.descricao
    if (updates.status !== undefined) row.status = updates.status
    if (updates.responsavel !== undefined) row.responsavel = updates.responsavel
    if (updates.setor !== undefined) row.setor = updates.setor
    if (updates.observacao !== undefined) row.observacao = updates.observacao
    if (updates.dataConclusao !== undefined) row.data_conclusao = updates.dataConclusao ? new Date().toISOString() : null

    const { data, error } = await supabase.from('tarefas').update(row).eq('id', id).select().single()
    if (error) throw error
    const mapped = mapRow(data)
    setTarefas(prev => prev.map(t => t.id === id ? mapped : t))
    return mapped
  }

  async function deleteTarefa(id: string) {
    const { error } = await supabase.from('tarefas').delete().eq('id', id)
    if (error) throw error
    setTarefas(prev => prev.filter(t => t.id !== id))
  }

  async function completeTarefa(id: string) {
    const tarefa = tarefas.find(t => t.id === id)
    if (!tarefa) return
    const isPendenciaCumprida = tarefa.status === 'Pendência Cumprida'
    const row = {
      status: isPendenciaCumprida ? 'Pendência' : 'Pendência Cumprida',
      data_conclusao: isPendenciaCumprida ? null : new Date().toISOString(),
    }
    const { data, error } = await supabase.from('tarefas').update(row).eq('id', id).select().single()
    if (error) throw error
    const mapped = mapRow(data)
    setTarefas(prev => prev.map(t => t.id === id ? mapped : t))
  }

  return { tarefas, loading, error, addTarefa, updateTarefa, deleteTarefa, completeTarefa, reload: load }
}
