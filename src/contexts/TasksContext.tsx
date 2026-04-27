import React, { createContext, useContext } from 'react'
import { ProcessTask } from '../types'
import { useSupabaseTarefas } from '../hooks/useSupabaseTarefas'

interface TasksContextType {
    tasks: ProcessTask[]
    loading: boolean
    addTask: (task: ProcessTask) => void
    updateTask: (taskId: string, updates: Partial<ProcessTask>) => void
    deleteTask: (taskId: string) => void
    completeTask: (taskId: string) => void
}

const TasksContext = createContext<TasksContextType | undefined>(undefined)

export const TasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { tarefas, loading, addTarefa, updateTarefa, deleteTarefa, completeTarefa } = useSupabaseTarefas()

    const addTask = async (task: ProcessTask) => {
        try { await addTarefa(task) } catch (e) { console.error('Erro ao adicionar tarefa:', e) }
    }

    const updateTask = async (taskId: string, updates: Partial<ProcessTask>) => {
        try { await updateTarefa(taskId, updates) } catch (e) { console.error('Erro ao atualizar tarefa:', e) }
    }

    const deleteTask = async (taskId: string) => {
        try { await deleteTarefa(taskId) } catch (e) { console.error('Erro ao deletar tarefa:', e) }
    }

    const completeTask = async (taskId: string) => {
        try { await completeTarefa(taskId) } catch (e) { console.error('Erro ao concluir tarefa:', e) }
    }

    return (
        <TasksContext.Provider value={{ tasks: tarefas, loading, addTask, updateTask, deleteTask, completeTask }}>
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

