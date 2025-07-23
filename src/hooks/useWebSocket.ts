'use client'

import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useCRM } from '@/contexts/CRMContext'
import { Client, Task, Interaction } from '@/types/crm'

interface WebSocketEvents {
  'client:created': { client: Client }
  'client:updated': { id: string; client: Partial<Client> }
  'client:deleted': { id: string }
  'task:created': { task: Task }
  'task:updated': { id: string; task: Partial<Task> }
  'task:deleted': { id: string }
  'interaction:created': { interaction: Interaction }
  'notification:new': { notification: { id: string; message: string; type: string } }
}

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false)
  const [notifications, setNotifications] = useState<Array<{ id: string; message: string; type: string }>>([])
  const socketRef = useRef<Socket | null>(null)
  const { actions } = useCRM()

  useEffect(() => {
    // Initialize socket connection
    const socket = io(process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000', {
      path: '/api/socket',
      autoConnect: true,
    })

    socketRef.current = socket

    // Connection events
    socket.on('connect', () => {
      console.log('🟢 WebSocket conectado')
      setIsConnected(true)
    })

    socket.on('disconnect', () => {
      console.log('🔴 WebSocket desconectado')
      setIsConnected(false)
    })

    // Real-time client events
    socket.on('client:created', ({ client }: { client: Client }) => {
      console.log('📥 Novo cliente recebido via WebSocket:', client)
      actions.addClient(client)
      addNotification({
        id: Date.now().toString(),
        message: `Novo cliente: ${client.name}`,
        type: 'success'
      })
    })

    socket.on('client:updated', ({ id, client }: { id: string; client: Partial<Client> }) => {
      console.log('📝 Cliente atualizado via WebSocket:', id, client)
      actions.updateClient(id, client)
    })

    socket.on('client:deleted', ({ id }: { id: string }) => {
      console.log('🗑️ Cliente removido via WebSocket:', id)
      actions.removeClient(id)
      addNotification({
        id: Date.now().toString(),
        message: 'Cliente removido',
        type: 'info'
      })
    })

    // Real-time task events
    socket.on('task:created', ({ task }: { task: Task }) => {
      console.log('📋 Nova tarefa recebida via WebSocket:', task)
      actions.addTask(task)
      addNotification({
        id: Date.now().toString(),
        message: `Nova tarefa: ${task.title}`,
        type: 'info'
      })
    })

    socket.on('task:updated', ({ id, task }: { id: string; task: Partial<Task> }) => {
      console.log('✏️ Tarefa atualizada via WebSocket:', id, task)
      actions.updateTask(id, task)
    })

    socket.on('task:deleted', ({ id }: { id: string }) => {
      console.log('❌ Tarefa removida via WebSocket:', id)
      actions.removeTask(id)
    })

    // Real-time interaction events
    socket.on('interaction:created', ({ interaction }: { interaction: Interaction }) => {
      console.log('💬 Nova interação recebida via WebSocket:', interaction)
      actions.addInteraction(interaction)
    })

    // Notification events
    socket.on('notification:new', ({ notification }) => {
      console.log('🔔 Nova notificação via WebSocket:', notification)
      addNotification(notification)
    })

    // Cleanup on unmount
    return () => {
      socket.disconnect()
    }
  }, [actions])

  // Helper function to add notifications
  const addNotification = (notification: { id: string; message: string; type: string }) => {
    setNotifications(prev => [notification, ...prev.slice(0, 4)]) // Keep only last 5
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id))
    }, 5000)
  }

  // Function to emit events
  const emit = <T extends keyof WebSocketEvents>(event: T, data: WebSocketEvents[T]) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data)
    }
  }

  // Helper functions for common operations
  const notifyClientCreated = (client: Client) => {
    emit('client:created', { client })
  }

  const notifyClientUpdated = (id: string, client: Partial<Client>) => {
    emit('client:updated', { id, client })
  }

  const notifyClientDeleted = (id: string) => {
    emit('client:deleted', { id })
  }

  const notifyTaskCreated = (task: Task) => {
    emit('task:created', { task })
  }

  const notifyTaskUpdated = (id: string, task: Partial<Task>) => {
    emit('task:updated', { id, task })
  }

  const notifyTaskDeleted = (id: string) => {
    emit('task:deleted', { id })
  }

  const notifyInteractionCreated = (interaction: Interaction) => {
    emit('interaction:created', { interaction })
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return {
    isConnected,
    notifications,
    clearNotifications,
    removeNotification,
    // Emit functions
    notifyClientCreated,
    notifyClientUpdated,
    notifyClientDeleted,
    notifyTaskCreated,
    notifyTaskUpdated,
    notifyTaskDeleted,
    notifyInteractionCreated,
    // Raw emit for custom events
    emit,
  }
}
