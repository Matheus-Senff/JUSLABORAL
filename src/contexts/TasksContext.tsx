import React, { createContext, useContext, useState, useEffect } from 'react'
import { ProcessTask } from '../types'

interface TasksContextType {
    tasks: ProcessTask[]
    addTask: (task: ProcessTask) => void
    updateTask: (taskId: string, updates: Partial<ProcessTask>) => void
    deleteTask: (taskId: string) => void
    completeTask: (taskId: string) => void
}

const TasksContext = createContext<TasksContextType | undefined>(undefined)

export const TasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [tasks, setTasks] = useState<ProcessTask[]>([])

    // Carregar tarefas do localStorage ao montar
    useEffect(() => {
        const stored = localStorage.getItem('process_tasks')
        if (stored) {
            try {
                setTasks(JSON.parse(stored))
            } catch (e) {
                console.error('Erro ao carregar tarefas:', e)
            }
        } else {
            // Demonstrativo com dados de exemplo
            const demoTasks: ProcessTask[] = [
                {
                    id: '1',
                    processId: '1001',
                    titulo: 'Revisão de documentos',
                    descricao: 'Revisar e validar documentação do processo',
                    responsavel: 'João Silva',
                    setor: 'Administrativo',
                    observacao: 'Documentos precisam ser validados em até 3 dias',
                    tipoAcao: 'Pedir Documentação',
                    status: 'Em Andamento',
                    dataCriacao: '26/04/2026 10:30',
                    autor: 'Maria Santos',
                },
                {
                    id: '2',
                    processId: '1002',
                    titulo: 'Análise jurídica preliminar',
                    descricao: 'Fazer análise inicial do processo',
                    responsavel: 'Carlos Oliveira',
                    setor: 'Financeiro',
                    observacao: 'Verificar se há pendências financeiras',
                    tipoAcao: 'Análise',
                    status: 'Aberto',
                    dataCriacao: '27/04/2026 08:15',
                    autor: 'Maria Santos',
                },
                {
                    id: '3',
                    processId: '1003',
                    titulo: 'Reunião com cliente',
                    descricao: 'Marcar e realizar reunião de alinhamento',
                    responsavel: 'Ana Costa',
                    setor: 'Administrativo',
                    observacao: 'Esclarecer pontos do contrato',
                    tipoAcao: 'Reunião',
                    status: 'Concluído',
                    dataCriacao: '25/04/2026 14:00',
                    dataConclusao: '26/04/2026 16:30',
                    autor: 'Maria Santos',
                },
                {
                    id: '4',
                    processId: '1004',
                    titulo: 'Emissão de certidão',
                    descricao: 'Solicitar e obter certidão atualizada',
                    responsavel: 'João Silva',
                    setor: 'Financeiro',
                    observacao: 'Urgente - necessário para comprovação',
                    tipoAcao: 'Pedir Documentação',
                    status: 'Aberto',
                    dataCriacao: '27/04/2026 09:00',
                    autor: 'Maria Santos',
                },
                {
                    id: '5',
                    processId: '1005',
                    titulo: 'Anotação de evento importante',
                    descricao: 'Registrar ocorrência importante',
                    responsavel: 'Carlos Oliveira',
                    setor: 'Administrativo',
                    observacao: 'Prazo para resposta: 10 dias úteis',
                    tipoAcao: 'Anotação',
                    status: 'Em Andamento',
                    dataCriacao: '27/04/2026 11:00',
                    autor: 'Maria Santos',
                },
            ]
            setTasks(demoTasks)
            localStorage.setItem('process_tasks', JSON.stringify(demoTasks))
        }
    }, [])

    // Salvar tarefas no localStorage sempre que mudarem
    useEffect(() => {
        localStorage.setItem('process_tasks', JSON.stringify(tasks))
    }, [tasks])

    const addTask = (task: ProcessTask) => {
        setTasks(prev => [task, ...prev])
    }

    const updateTask = (taskId: string, updates: Partial<ProcessTask>) => {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t))
    }

    const deleteTask = (taskId: string) => {
        setTasks(prev => prev.filter(t => t.id !== taskId))
    }

    const completeTask = (taskId: string) => {
        setTasks(prev => prev.map(t =>
            t.id === taskId
                ? {
                    ...t,
                    status: t.status === 'Concluído' ? 'Aberto' : 'Concluído',
                    dataConclusao: t.status === 'Concluído' ? undefined : new Date().toLocaleString('pt-BR'),
                }
                : t
        ))
    }

    return (
        <TasksContext.Provider value={{ tasks, addTask, updateTask, deleteTask, completeTask }}>
            {children}
        </TasksContext.Provider>
    )
}

export const useTasks = () => {
    const context = useContext(TasksContext)
    if (context === undefined) {
        throw new Error('useTasks deve ser usado dentro de TasksProvider')
    }
    return context
}
