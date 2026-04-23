import React, { useState } from 'react'
import { Mail, Lock, AlertCircle, Loader } from 'lucide-react'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'

export const AuthPage: React.FC<{ darkMode?: boolean }> = ({ darkMode }) => {
    const [isSignUp, setIsSignUp] = useState(false)
    const [email, setEmail] = useState('contatomatheussenff@gmail.com')
    const [password, setPassword] = useState('LUCIANOGAY')
    const [confirmPassword, setConfirmPassword] = useState('LUCIANOGAY')
    const [submitting, setSubmitting] = useState(false)
    const { error, signUp, signIn } = useSupabaseAuth()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            if (isSignUp) {
                if (password !== confirmPassword) {
                    alert('As senhas não conferem')
                    return
                }
                await signUp(email, password)
                alert('Registrado com sucesso! Verifique seu email.')
                setEmail('')
                setPassword('')
                setConfirmPassword('')
            } else {
                await signIn(email, password)
                setEmail('')
                setPassword('')
            }
        } catch (err) {
            console.error('Erro de autenticação:', err)
        } finally {
            setSubmitting(false)
        }
    }

    const features = [
        { icon: '📋', title: 'Gestão de Processos', desc: 'Controle total de processos estaduais e federais' },
        { icon: '📅', title: 'Compromissos', desc: 'Calendário integrado com sincronização em tempo real' },
        { icon: '👥', title: 'Equipe Colaborativa', desc: 'Trabalhe em equipe com documentos compartilhados' },
        { icon: '⚡', title: 'Velocidade', desc: 'Interface otimizada para máxima produtividade' },
    ]

    return (
        <div className={`w-full min-h-screen ${darkMode ? 'bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900' : 'bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50'} flex items-center justify-center p-4 overflow-hidden`}>
            {/* Background animation */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="relative z-10 w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Left side - Features */}
                <div className="hidden lg:flex flex-col justify-center space-y-8">
                    <div className="animate-fadeInLeft">
                        <h1 className={`text-5xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            JusLaboral
                        </h1>
                        <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Plataforma de Gestão Corporativa
                        </p>
                    </div>

                    <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-700'} leading-relaxed`}>
                        Gerencie processos, documentos e equipes em um único lugar com nossa plataforma moderna e intuitiva.
                    </p>

                    <div className="space-y-4">
                        {features.map((feature, idx) => (
                            <div
                                key={idx}
                                className={`p-4 rounded-lg ${darkMode ? 'bg-dark-800/50 border border-dark-700' : 'bg-white/50 border border-gray-200'} backdrop-blur-sm hover:scale-105 transition transform`}
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl">{feature.icon}</span>
                                    <div>
                                        <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {feature.title}
                                        </h3>
                                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            {feature.desc}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right side - Login Form */}
                <div className="flex items-center justify-center">
                    <div className={`${darkMode ? 'bg-dark-800' : 'bg-white'} rounded-2xl shadow-2xl p-8 max-w-md w-full border ${darkMode ? 'border-dark-700' : 'border-gray-200'} backdrop-blur-xl animate-fadeInUp`}>
                        {/* Header */}
                        <div className="text-center mb-8">
                            <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>JusLaboral</h2>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {isSignUp ? 'Criar nova conta' : 'Entrar na plataforma'}
                            </p>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg flex items-start gap-2">
                                <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-500">{error}</p>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Email */}
                            <div>
                                <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
                                <div className="relative">
                                    <Mail size={18} className={`absolute left-3 top-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        placeholder="seu@email.com"
                                        className={`w-full pl-10 pr-3 py-2 border rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-dark-700 border-dark-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                                        disabled={submitting}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Senha</label>
                                <div className="relative">
                                    <Lock size={18} className={`absolute left-3 top-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        placeholder="Sua senha"
                                        className={`w-full pl-10 pr-3 py-2 border rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-dark-700 border-dark-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                                        disabled={submitting}
                                    />
                                </div>
                            </div>

                            {/* Confirm Password (Sign Up) */}
                            {isSignUp && (
                                <div>
                                    <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Confirmar Senha</label>
                                    <div className="relative">
                                        <Lock size={18} className={`absolute left-3 top-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            placeholder="Confirme sua senha"
                                            className={`w-full pl-10 pr-3 py-2 border rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-dark-700 border-dark-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                                            disabled={submitting}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
                            >
                                {submitting && <Loader size={18} className="animate-spin" />}
                                {isSignUp ? 'Registrar' : 'Entrar'}
                            </button>
                        </form>

                        {/* Toggle */}
                        <div className="mt-6 pt-6 border-t" style={{ borderColor: darkMode ? '#3d424a' : '#e5e7eb' }}>
                            <p className={`text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {isSignUp ? 'Já tem conta? ' : 'Não tem conta? '}
                                <button
                                    onClick={() => {
                                        setIsSignUp(!isSignUp)
                                        setEmail('')
                                        setPassword('')
                                        setConfirmPassword('')
                                    }}
                                    className="text-blue-600 hover:text-blue-700 font-semibold"
                                >
                                    {isSignUp ? 'Entrar' : 'Registrar'}
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeInLeft {
                    from {
                        opacity: 0;
                        transform: translateX(-30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fadeInLeft {
                    animation: fadeInLeft 0.8s ease-out;
                }
                .animate-fadeInUp {
                    animation: fadeInUp 0.8s ease-out;
                }
            `}</style>
        </div>
    )
}
