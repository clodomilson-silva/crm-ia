'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, User, CheckCircle, AlertCircle } from 'lucide-react'
import axios from 'axios'

interface Task {
  id: string
  title: string
  description?: string
  type: string
  priority: string
  status: string
  dueDate?: string
  aiSuggested: boolean
  createdAt: string
  client: {
    id: string
    name: string
    email: string
  }
}

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPriority, setFilterPriority] = useState('')

  useEffect(() => {
    const loadTasksWithParams = async () => {
      try {
        const params = new URLSearchParams()
        if (filterStatus) params.append('status', filterStatus)
        if (filterPriority) params.append('priority', filterPriority)

        const response = await axios.get(`/api/tasks?${params.toString()}`)
        setTasks(response.data.tasks)
      } catch (error) {
        console.error('Erro ao carregar tarefas:', error)
      } finally {
        setLoading(false)
      }
    }

    loadTasksWithParams()
  }, [filterStatus, filterPriority])

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      await axios.put(`/api/tasks/${taskId}`, { status: newStatus })
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ))
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'call': return '📞'
      case 'email': return '📧'
      case 'whatsapp': return '💬'
      case 'meeting': return '👥'
      case 'follow-up': return '🔄'
      default: return '📋'
    }
  }

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
  }

  const isToday = (dueDate?: string) => {
    if (!dueDate) return false
    const today = new Date()
    const due = new Date(dueDate)
    return today.toDateString() === due.toDateString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const pendingTasks = tasks.filter(t => t.status === 'pending')
  const completedTasks = tasks.filter(t => t.status === 'completed')
  const overdueTasks = pendingTasks.filter(t => isOverdue(t.dueDate))
  const todayTasks = pendingTasks.filter(t => isToday(t.dueDate))

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-2xl font-semibold text-gray-900">{tasks.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Pendentes</p>
              <p className="text-2xl font-semibold text-gray-900">{pendingTasks.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Atrasadas</p>
              <p className="text-2xl font-semibold text-gray-900">{overdueTasks.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Concluídas</p>
              <p className="text-2xl font-semibold text-gray-900">{completedTasks.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos os status</option>
            <option value="pending">Pendentes</option>
            <option value="completed">Concluídas</option>
            <option value="cancelled">Canceladas</option>
          </select>
          
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todas as prioridades</option>
            <option value="high">Alta</option>
            <option value="medium">Média</option>
            <option value="low">Baixa</option>
          </select>
          
          <button
            onClick={() => {
              setFilterStatus('')
              setFilterPriority('')
            }}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Limpar Filtros
          </button>
        </div>
      </div>

      {/* Tarefas de Hoje */}
      {todayTasks.length > 0 && (
        <div className="bg-blue-50 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Tarefas para Hoje ({todayTasks.length})
          </h3>
          <div className="space-y-3">
            {todayTasks.map((task) => (
              <div key={task.id} className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getTypeIcon(task.type)}</span>
                      <h4 className="font-medium text-gray-900">{task.title}</h4>
                      {task.aiSuggested && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                          ✨ IA
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      <User className="w-4 h-4 inline mr-1" />
                      {task.client.name}
                    </p>
                  </div>
                  <button
                    onClick={() => updateTaskStatus(task.id, 'completed')}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    Concluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de Tarefas */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Todas as Tarefas ({tasks.length})
          </h3>
        </div>
        
        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Nenhuma tarefa encontrada
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              As tarefas são criadas automaticamente pela IA ao cadastrar clientes.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {tasks.map((task) => (
              <div key={task.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{getTypeIcon(task.type)}</span>
                      <h4 className="text-lg font-medium text-gray-900">
                        {task.title}
                      </h4>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                      </span>
                      {task.aiSuggested && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                          ✨ Sugerida por IA
                        </span>
                      )}
                      {task.status === 'completed' && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          ✅ Concluída
                        </span>
                      )}
                      {isOverdue(task.dueDate) && task.status === 'pending' && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          ⚠️ Atrasada
                        </span>
                      )}
                    </div>
                    
                    {task.description && (
                      <p className="mt-2 text-sm text-gray-600">{task.description}</p>
                    )}
                    
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {task.client.name} ({task.client.email})
                      </div>
                      {task.dueDate && (
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                      <span>
                        Criada em {new Date(task.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {task.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateTaskStatus(task.id, 'completed')}
                          className="px-3 py-1 text-sm text-green-600 border border-green-600 rounded hover:bg-green-50 transition-colors"
                        >
                          Concluir
                        </button>
                        <button
                          onClick={() => updateTaskStatus(task.id, 'cancelled')}
                          className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50 transition-colors"
                        >
                          Cancelar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
