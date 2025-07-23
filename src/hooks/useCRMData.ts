import { useState, useEffect, useCallback } from 'react'
import { useCRM } from '@/contexts/CRMContext'
import axios from 'axios'

// Tipos básicos
interface Client {
  id: string
  name: string
  email: string
  phone: string
  company?: string
  createdAt: Date
  updatedAt: Date
}

interface Task {
  id: string
  title: string
  description?: string
  status: 'pendente' | 'em_progresso' | 'concluida'
  priority: 'baixa' | 'media' | 'alta'
  clientId?: string
  dueDate?: Date
  createdAt: Date
  updatedAt: Date
}

// Hook simplificado sem SWR para resolver problema de build
export function useClients() {
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { dispatch } = useCRM()

  const fetchClients = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await axios.get('/api/clients')
      // A API retorna { clients: [...] }, então extraímos o array
      const clientsData = response.data.clients || []
      setClients(clientsData)
      dispatch({ type: 'SET_CLIENTS', payload: clientsData })
      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [dispatch])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  const mutate = fetchClients

  return {
    data: clients,
    error,
    isLoading,
    mutate
  }
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { dispatch } = useCRM()

  const fetchTasks = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await axios.get('/api/tasks')
      // A API pode retornar { tasks: [...] } ou diretamente o array
      const tasksData = response.data.tasks || response.data || []
      setTasks(tasksData)
      dispatch({ type: 'SET_TASKS', payload: tasksData })
      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [dispatch])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const mutate = fetchTasks

  return {
    data: tasks,
    error,
    isLoading,
    mutate
  }
}

export function useClient(id?: string) {
  const [client, setClient] = useState<Client | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchClient = useCallback(async () => {
    if (!id) return
    
    setIsLoading(true)
    try {
      const response = await axios.get(`/api/clients/${id}`)
      // A API retorna { client: {...} }, então extraímos o objeto client
      const clientData = response.data.client || response.data
      
      // Usa nullish coalescing (??) para preservar valores 0, '', false válidos
      const safeClient = {
        ...clientData,
        name: clientData.name ?? 'Nome não disponível',
        email: clientData.email ?? 'Email não disponível',
        clientType: clientData.clientType ?? 'prospect',
        leadScore: clientData.leadScore ?? 0,
        tasks: clientData.tasks ?? [],
        interactions: clientData.interactions ?? [],
      }
      
      setClient(safeClient)
      setError(null)
      console.log('🔍 Dados brutos da API:', response.data)
      console.log('✅ Cliente processado no hook:', safeClient)
    } catch (err) {
      console.error('Erro ao carregar cliente:', err)
      setError(err as Error)
      setClient(null)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchClient()
  }, [fetchClient])

  const mutate = fetchClient

  return {
    data: client,
    error,
    isLoading,
    mutate
  }
}
