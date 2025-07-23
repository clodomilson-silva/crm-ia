'use client'

import useSWR, { mutate } from 'swr'
import axios from 'axios'
import { Client, Task, Interaction, ClientWithRelations } from '@/types/crm'
import { useCRM } from '@/contexts/CRMContext'
import { useCallback } from 'react'

// Fetcher function para SWR
const fetcher = (url: string) => axios.get(url).then(res => res.data)

// Hook para clients com SWR
export function useClients(filters?: {
  search?: string
  type?: string
  status?: string
}) {
  const { actions } = useCRM()
  
  // Construir query params
  const params = new URLSearchParams()
  if (filters?.search) params.append('search', filters.search)
  if (filters?.type) params.append('type', filters.type)
  if (filters?.status) params.append('status', filters.status)
  
  const queryString = params.toString()
  const key = `/api/clients${queryString ? `?${queryString}` : ''}`
  
  const { data, error, isLoading, mutate: mutateClients } = useSWR(key, fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    refreshInterval: 30000, // Refresh a cada 30 segundos
    onSuccess: (data) => {
      if (data.clients) {
        actions.setClients(data.clients)
      }
    }
  })

  // Optimistic updates
  const addClientOptimistic = useCallback(async (newClient: Omit<Client, 'id'>) => {
    const tempId = 'temp-' + Date.now()
    const optimisticClient = { ...newClient, id: tempId } as Client
    
    // Update UI immediately
    actions.addClient(optimisticClient)
    
    try {
      // Make actual API call
      const response = await axios.post('/api/clients', newClient)
      const realClient = response.data.client
      
      // Replace optimistic client with real one
      actions.updateClient(tempId, realClient)
      
      // Revalidate SWR cache
      await mutateClients()
      
      return realClient
    } catch (error) {
      // Rollback optimistic update
      actions.removeClient(tempId)
      throw error
    }
  }, [actions, mutateClients])

  const updateClientOptimistic = useCallback(async (id: string, updates: Partial<Client>) => {
    // Update UI immediately
    actions.updateClient(id, updates)
    
    try {
      // Make actual API call
      await axios.put(`/api/clients/${id}`, updates)
      
      // Revalidate SWR cache
      await mutateClients()
    } catch (error) {
      // Revalidate to get fresh data (rollback)
      await mutateClients()
      throw error
    }
  }, [actions, mutateClients])

  const deleteClientOptimistic = useCallback(async (id: string) => {
    // Store original data for rollback
    const originalClients = data?.clients || []
    
    // Update UI immediately
    actions.removeClient(id)
    
    try {
      // Make actual API call
      await axios.delete(`/api/clients/${id}`)
      
      // Revalidate SWR cache
      await mutateClients()
    } catch (error) {
      // Rollback: restore original data
      actions.setClients(originalClients)
      throw error
    }
  }, [actions, data?.clients, mutateClients])

  return {
    clients: data?.clients || [],
    isLoading,
    error,
    refresh: mutateClients,
    addClient: addClientOptimistic,
    updateClient: updateClientOptimistic,
    deleteClient: deleteClientOptimistic,
  }
}

// Hook para tasks com SWR
export function useTasks(filters?: {
  status?: string
  priority?: string
  clientId?: string
}) {
  const { actions } = useCRM()
  
  // Construir query params
  const params = new URLSearchParams()
  if (filters?.status) params.append('status', filters.status)
  if (filters?.priority) params.append('priority', filters.priority)
  if (filters?.clientId) params.append('clientId', filters.clientId)
  
  const queryString = params.toString()
  const key = `/api/tasks${queryString ? `?${queryString}` : ''}`
  
  const { data, error, isLoading, mutate: mutateTasks } = useSWR(key, fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    refreshInterval: 15000, // Tasks são mais dinâmicas
    onSuccess: (data) => {
      if (data.tasks) {
        actions.setTasks(data.tasks)
      }
    }
  })

  // Optimistic updates
  const addTaskOptimistic = useCallback(async (newTask: Omit<Task, 'id'>) => {
    const tempId = 'temp-' + Date.now()
    const optimisticTask = { ...newTask, id: tempId } as Task
    
    actions.addTask(optimisticTask)
    
    try {
      const response = await axios.post('/api/tasks', newTask)
      const realTask = response.data.task
      
      actions.updateTask(tempId, realTask)
      await mutateTasks()
      
      return realTask
    } catch (error) {
      actions.removeTask(tempId)
      throw error
    }
  }, [actions, mutateTasks])

  const updateTaskOptimistic = useCallback(async (id: string, updates: Partial<Task>) => {
    actions.updateTask(id, updates)
    
    try {
      await axios.put(`/api/tasks/${id}`, updates)
      await mutateTasks()
    } catch (error) {
      await mutateTasks() // Rollback
      throw error
    }
  }, [actions, mutateTasks])

  const deleteTaskOptimistic = useCallback(async (id: string) => {
    const originalTasks = data?.tasks || []
    
    actions.removeTask(id)
    
    try {
      await axios.delete(`/api/tasks/${id}`)
      await mutateTasks()
    } catch (error) {
      actions.setTasks(originalTasks)
      throw error
    }
  }, [actions, data?.tasks, mutateTasks])

  return {
    tasks: data?.tasks || [],
    isLoading,
    error,
    refresh: mutateTasks,
    addTask: addTaskOptimistic,
    updateTask: updateTaskOptimistic,
    deleteTask: deleteTaskOptimistic,
  }
}

// Hook para um cliente específico com SWR
export function useClient(clientId: string | null) {
  const key = clientId ? `/api/clients/${clientId}` : null
  
  const { data, error, isLoading, mutate: mutateClient } = useSWR(key, fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  })

  return {
    client: data?.client as ClientWithRelations | null,
    isLoading,
    error,
    refresh: mutateClient,
  }
}

// Hook para interactions
export function useInteractions(clientId?: string) {
  const { actions } = useCRM()
  
  const params = new URLSearchParams()
  if (clientId) params.append('clientId', clientId)
  
  const queryString = params.toString()
  const key = `/api/interactions${queryString ? `?${queryString}` : ''}`
  
  const { data, error, isLoading, mutate: mutateInteractions } = useSWR(key, fetcher, {
    revalidateOnFocus: true,
    onSuccess: (data) => {
      if (data.interactions) {
        actions.setInteractions(data.interactions)
      }
    }
  })

  const addInteractionOptimistic = useCallback(async (newInteraction: Omit<Interaction, 'id'>) => {
    const tempId = 'temp-' + Date.now()
    const optimisticInteraction = { ...newInteraction, id: tempId } as Interaction
    
    actions.addInteraction(optimisticInteraction)
    
    try {
      const response = await axios.post('/api/interactions', newInteraction)
      await mutateInteractions()
      
      return response.data.interaction
    } catch (error) {
      await mutateInteractions() // Rollback
      throw error
    }
  }, [actions, mutateInteractions])

  return {
    interactions: data?.interactions || [],
    isLoading,
    error,
    refresh: mutateInteractions,
    addInteraction: addInteractionOptimistic,
  }
}

// Hook para invalidar cache relacionado
export function useInvalidateCache() {
  return {
    invalidateClients: () => mutate('/api/clients'),
    invalidateTasks: () => mutate('/api/tasks'),
    invalidateInteractions: () => mutate('/api/interactions'),
    invalidateAll: () => {
      mutate('/api/clients')
      mutate('/api/tasks')
      mutate('/api/interactions')
    },
  }
}
