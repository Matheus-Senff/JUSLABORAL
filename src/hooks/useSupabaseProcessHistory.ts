import { useState } from 'react'
import { supabase } from '../utils/supabase/client'
import { ProcessHistoryEntry } from '../types'

export function useSupabaseProcessHistory() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function addHistoryEntry(entry: ProcessHistoryEntry, processIdTexto: string) {
        setLoading(true)
        setError(null)
        try {
            const { data: userData, error: userError } = await supabase.auth.getUser()
            if (userError || !userData.user) throw new Error('Usuário não autenticado')

            const row = {
                org_id: userData.user.id,
                process_id_texto: processIdTexto,
                tipo: entry.tipo,
                campo: entry.campo || null,
                valor_anterior: entry.valorAnterior || null,
                valor_novo: entry.valorNovo || null,
                texto: entry.texto || null,
                autor: entry.autor,
                data: entry.data,
            }

            const { data, error: insertError } = await supabase
                .from('process_history')
                .insert(row)
                .select()
                .single()

            if (insertError) throw insertError
            return data
        } catch (err: any) {
            const msg = err.message || 'Erro ao salvar histórico'
            setError(msg)
            console.error('Erro ao salvar histórico:', err)
            throw err
        } finally {
            setLoading(false)
        }
    }

    async function deleteHistoryEntry(id: string) {
        setLoading(true)
        setError(null)
        try {
            const { error: deleteError } = await supabase
                .from('process_history')
                .delete()
                .eq('id', id)

            if (deleteError) throw deleteError
        } catch (err: any) {
            const msg = err.message || 'Erro ao deletar histórico'
            setError(msg)
            console.error('Erro ao deletar histórico:', err)
            throw err
        } finally {
            setLoading(false)
        }
    }

    return { addHistoryEntry, deleteHistoryEntry, loading, error }
}
