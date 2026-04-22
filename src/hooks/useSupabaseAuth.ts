import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase/client'
import type { User, Session } from '@supabase/supabase-js'

// Hook que eu criei pra gerenciar autenticação com Supabase
export const useSupabaseAuth = () => {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // TODO: refatorar isso pra usar context no lugar de props
    useEffect(() => {
        let isMounted = true

        const getSession = async () => {
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession()
                if (sessionError) throw sessionError

                if (isMounted) {
                    setSession(session)
                    setUser(session?.user ?? null)
                    // console.log('sessão carregada:', session?.user?.email) // TODO: remover depois
                }
            } catch (err) {
                if (isMounted) {
                    setError(err instanceof Error ? err.message : 'Erro ao carregar sessão')
                    console.error('erro na sessão:', err) // FIXME: lembrar de remover log
                }
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        getSession()

        // Subscribe pra mudanças de autenticação
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (isMounted) {
                setSession(session)
                setUser(session?.user ?? null)
            }
        })

        return () => {
            isMounted = false
            subscription?.unsubscribe()
        }
    }, [])

    const signUp = async (email: string, password: string) => {
        try {
            setError(null)
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
            })
            if (signUpError) throw signUpError
            return data
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao registrar'
            setError(message)
            throw err
        }
    }

    const signIn = async (email: string, password: string) => {
        try {
            setError(null)
            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            })
            if (signInError) throw signInError
            return data
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao fazer login'
            setError(message)
            throw err
        }
    }

    const signOut = async () => {
        try {
            setError(null)
            const { error: signOutError } = await supabase.auth.signOut()
            if (signOutError) throw signOutError
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao fazer logout'
            setError(message)
            throw err
        }
    }

    return {
        user,
        session,
        loading,
        error,
        signUp,
        signIn,
        signOut,
        isAuthenticated: !!session,
    }
}
