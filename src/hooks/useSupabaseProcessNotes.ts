import { useState } from 'react'
import { supabase } from '../utils/supabase/client'
import { ProcessNote } from '../types'

export function useSupabaseProcessNotes() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function addNote(note: ProcessNote, processIdTexto: string) {
        setLoading(true)
        setError(null)
        try {
            const { data: userData, error: userError } = await supabase.auth.getUser()
            if (userError || !userData.user) throw new Error('Usuário não autenticado')

            const row = {
                org_id: userData.user.id,
                process_id_texto: processIdTexto,
                titulo: note.titulo || null,
                numero_cat: note.numeroCat || null,
                senha_inss: note.senhaInss || null,
                rg: note.rg || null,
                observacao: note.observacao || null,
                autor: note.autor,
                data: note.data,
            }

            const { data, error: insertError } = await supabase
                .from('process_notes')
                .insert(row)
                .select()
                .single()

            if (insertError) throw insertError
            return data
        } catch (err: any) {
            const msg = err.message || 'Erro ao salvar anotação'
            setError(msg)
            console.error('Erro ao salvar anotação:', err)
            throw err
        } finally {
            setLoading(false)
        }
    }

    async function deleteNote(id: string) {
        setLoading(true)
        setError(null)
        try {
            const { error: deleteError } = await supabase
                .from('process_notes')
                .delete()
                .eq('id', id)

            if (deleteError) throw deleteError
        } catch (err: any) {
            const msg = err.message || 'Erro ao deletar anotação'
            setError(msg)
            console.error('Erro ao deletar anotação:', err)
            throw err
        } finally {
            setLoading(false)
        }
    }

    return { addNote, deleteNote, loading, error }
}
