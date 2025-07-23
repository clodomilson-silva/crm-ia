'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, User, CheckCircle, AlertCircle, X, Brain } from 'lucide-react'
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
  const [generatingTasks, setGeneratingTasks] = useState(false)

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

  const removeCompletedTasks = async () => {
    const completedAndCancelledTasks = tasks.filter(t => t.status === 'completed' || t.status === 'cancelled')
    
    if (completedAndCancelledTasks.length === 0) {
      alert('Não há tarefas concluídas ou canceladas para remover.')
      return
    }

    const completedCount = tasks.filter(t => t.status === 'completed').length
    const cancelledCount = tasks.filter(t => t.status === 'cancelled').length
    
    let message = `Remover ${completedAndCancelledTasks.length} tarefa(s)?`
    if (completedCount > 0 && cancelledCount > 0) {
      message = `Remover ${completedCount} concluída(s) e ${cancelledCount} cancelada(s)?`
    } else if (completedCount > 0) {
      message = `Remover ${completedCount} tarefa(s) concluída(s)?`
    } else {
      message = `Remover ${cancelledCount} tarefa(s) cancelada(s)?`
    }
    message += ' Esta ação não pode ser desfeita.'

    if (!confirm(message)) {
      return
    }

    try {
      for (const task of completedAndCancelledTasks) {
        await axios.delete(`/api/tasks/${task.id}`)
      }
      
      // Recarregar as tarefas
      setTasks(tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled'))
      alert('Tarefas removidas com sucesso!')
    } catch (error) {
      console.error('Erro ao remover tarefas:', error)
      alert('Erro ao remover tarefas. Tente novamente.')
    }
  }

  const generateDailyTasks = async () => {
    setGeneratingTasks(true)
    try {
      const response = await axios.post('/api/daily-tasks', {}, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.data.success) {
        alert(`${response.data.tasks.length} tarefas diárias geradas com sucesso pela IA!`)
        // Recarregar as tarefas
        window.location.reload()
      } else {
        alert('Erro ao gerar tarefas diárias. Tente novamente.')
      }
    } catch (error) {
      console.error('Erro ao gerar tarefas diárias:', error)
      alert('Erro ao gerar tarefas diárias. Verifique se a API está configurada.')
    } finally {
      setGeneratingTasks(false)
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
  const cancelledTasks = tasks.filter(t => t.status === 'cancelled')
  const completedAndCancelledTasks = tasks.filter(t => t.status === 'completed' || t.status === 'cancelled')
  const overdueTasks = pendingTasks.filter(t => isOverdue(t.dueDate))
  const todayTasks = pendingTasks.filter(t => isToday(t.dueDate))

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg shadow p-3 sm:p-4">
          <div className="flex items-center">
            <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
            <div className="ml-2 sm:ml-3 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-500">Total</p>
              <p className="text-lg sm:text-2xl font-semibold text-gray-900">{tasks.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-3 sm:p-4">
          <div className="flex items-center">
            <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 flex-shrink-0" />
            <div className="ml-2 sm:ml-3 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-500">Pendentes</p>
              <p className="text-lg sm:text-2xl font-semibold text-gray-900">{pendingTasks.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-3 sm:p-4">
          <div className="flex items-center">
            <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 flex-shrink-0" />
            <div className="ml-2 sm:ml-3 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-500">Atrasadas</p>
              <p className="text-lg sm:text-2xl font-semibold text-gray-900">{overdueTasks.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-3 sm:p-4">
          <div className="flex items-center">
            <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
            <div className="ml-2 sm:ml-3 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-500">Concluídas</p>
              <p className="text-lg sm:text-2xl font-semibold text-gray-900">{completedTasks.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-3 sm:p-4 col-span-2 sm:col-span-1">
          <div className="flex items-center">
            <X className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600 flex-shrink-0" />
            <div className="ml-2 sm:ml-3 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-500">Canceladas</p>
              <p className="text-lg sm:text-2xl font-semibold text-gray-900">{cancelledTasks.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-3 sm:p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-3 sm:py-2 text-base text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos os status</option>
              <option value="pending">Pendentes</option>
              <option value="completed">Concluídas</option>
              <option value="cancelled">Canceladas</option>
            </select>
            
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-3 sm:py-2 text-base text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas as prioridades</option>
              <option value="high">Alta</option>
              <option value="medium">Média</option>
              <option value="low">Baixa</option>
            </select>
          </div>

          {/* Botões de ação */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {/* Botão para remover tarefas concluídas */}
            {completedAndCancelledTasks.length > 0 && (
              <button
                onClick={removeCompletedTasks}
                className="flex items-center justify-center px-3 sm:px-4 py-3 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium min-h-[44px]"
              >
                <CheckCircle className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Remover {completedAndCancelledTasks.length} Finalizada(s)</span>
                <span className="sm:hidden">Remover ({completedAndCancelledTasks.length})</span>
              </button>
            )}
            
            {/* Botão para gerar tarefas diárias com IA */}
            <button
              onClick={generateDailyTasks}
              disabled={generatingTasks}
              className="flex items-center justify-center px-3 sm:px-4 py-3 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium min-h-[44px]"
            >
              <Brain className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">{generatingTasks ? 'Gerando...' : 'Gerar Tarefas IA'}</span>
              <span className="sm:hidden">{generatingTasks ? 'Gerando...' : 'IA'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tarefas de Hoje */}
      {todayTasks.length > 0 && (
        <div className="bg-blue-50 rounded-lg shadow p-3 sm:p-4 lg:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-3 sm:mb-4 flex items-center">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Tarefas para Hoje ({todayTasks.length})
          </h3>
          <div className="space-y-2 sm:space-y-3">
            {todayTasks.map((task) => (
              <div key={task.id} className="bg-white rounded-lg p-3 sm:p-4 border-l-4 border-blue-500">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-base sm:text-lg">{getTypeIcon(task.type)}</span>
                      <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">{task.title}</h4>
                      {task.aiSuggested && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                          ✨ IA
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 flex items-center">
                      <User className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                      {task.client.name}
                    </p>
                  </div>
                  <button
                    onClick={() => updateTaskStatus(task.id, 'completed')}
                    className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium min-h-[44px] flex items-center justify-center"
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
        <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
            Todas as Tarefas ({tasks.length})
          </h3>
        </div>
        
        {tasks.length === 0 ? (
          <div className="text-center py-8 sm:py-12 px-4">
            <Calendar className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Nenhuma tarefa encontrada
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-gray-500">
              As tarefas são criadas automaticamente pela IA ao cadastrar clientes.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {tasks.map((task) => (
              <div key={task.id} className="p-3 sm:p-4 lg:p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                      <span className="text-base sm:text-lg">{getTypeIcon(task.type)}</span>
                      <h4 className="text-base sm:text-lg font-medium text-gray-900 truncate">
                        {task.title}
                      </h4>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                      </span>
                      {task.aiSuggested && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                          ✨ IA
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
                      <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">{task.description}</p>
                    )}
                    
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-gray-500">
                      <div className="flex items-center min-w-0">
                        <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                        <span className="truncate">{task.client.name}</span>
                        <span className="hidden sm:inline text-gray-400 ml-1">({task.client.email})</span>
                      </div>
                      {task.dueDate && (
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          <span>{new Date(task.dueDate).toLocaleDateString('pt-BR')}</span>
                        </div>
                      )}
                      <span className="hidden sm:inline">
                        Criada em {new Date(task.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  
                  {task.status === 'pending' && (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 pt-2 lg:pt-0">
                      <button
                        onClick={() => updateTaskStatus(task.id, 'completed')}
                        className="px-3 py-2 text-sm text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium min-h-[44px] flex items-center justify-center"
                      >
                        Concluir
                      </button>
                      <button
                        onClick={() => updateTaskStatus(task.id, 'cancelled')}
                        className="px-3 py-2 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium min-h-[44px] flex items-center justify-center"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
