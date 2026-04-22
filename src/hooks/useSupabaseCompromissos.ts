import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase/client'
import type { Compromisso } from '@/components/pasta/CompromissoModal'

// Hook que gerencia todos os compromissos do usuário (eu fiz esse)
export const useSupabaseCompromissos = (userId: string | undefined) => {
    const [compromissos, setCompromissos] = useState<Compromisso[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Carregar compromissos do BD e sincronizar em real-time
    useEffect(() => {
        if (!userId) {
            setCompromissos([])
            setLoading(false)
            return
        }

        const fetchCompromissos = async () => {
            try {
                setError(null)
                setLoading(true)

                // Query no Supabase
                const { data, error: fetchError } = await supabase
                    .from('compromissos')
                    .select('*')
                    .eq('user_id', userId)
                    .order('data', { ascending: true })

                if (fetchError) throw fetchError
                setCompromissos(data || [])
                console.log('compromissos carregados:', data?.length) // debug
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Erro ao carregar compromissos'
                setError(message)
                console.error('Erro ao carregar compromissos:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchCompromissos()

        // Subscribe to realtime changes - sincronização automática
        // TODO: melhorar isso depois pra não fazer tantas queries
        const channel = supabase
            .channel(`compromissos:${userId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'compromissos',
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setCompromissos((prev) => [...prev, payload.new as Compromisso])
                    } else if (payload.eventType === 'UPDATE') {
                        setCompromissos((prev) =>
                            prev.map((c) => (c.id === payload.new.id ? (payload.new as Compromisso) : c))
                        )
                    } else if (payload.eventType === 'DELETE') {
                        setCompromissos((prev) => prev.filter((c) => c.id !== payload.old.id))
                    }
                }
            )
            .subscribe()

        return () => {
            channel.unsubscribe()
        }
    }, [userId])

    const saveCompromisso = async (compromisso: Compromisso) => {
        if (!userId) throw new Error('Usuário não autenticado')

        try {
            setError(null)

            const { data, error: upsertError } = await supabase
                .from('compromissos')
                .upsert(
                    {
                        ...compromisso,
                        user_id: userId,
                    },
                    { onConflict: 'id' }
                )
                .select()

            if (upsertError) throw upsertError
            return data?.[0]
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao salvar compromisso'
            setError(message)
            throw err
        }
    }

    const deleteCompromisso = async (id: string) => {
        if (!userId) throw new Error('Usuário não autenticado')

        try {
            setError(null)

            const { error: deleteError } = await supabase
                .from('compromissos')
                .delete()
                .eq('id', id)
                .eq('user_id', userId)

            if (deleteError) throw deleteError
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao deletar compromisso'
            setError(message)
            throw err
        }
    }

    return {
        compromissos,
        loading,
        error,
        saveCompromisso,
        deleteCompromisso,
    }
}
