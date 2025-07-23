'use client'

import { useState, useEffect } from 'react'
import { Bell, X, Clock, AlertTriangle, Calendar, ChevronRight } from 'lucide-react'
import axios from 'axios'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  daysOverdue: number
  priority: string
  clientName: string
  clientId: string
  taskId: string
  dueDate: Date
  createdAt: string
}

interface NotificationStats {
  totalOverdue: number
  highPriorityOverdue: number
  todayPending: number
  totalNotifications: number
}

interface NotificationDropdownProps {
  onTaskClick?: (taskId: string) => void
}

export default function NotificationDropdown({ onTaskClick }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [stats, setStats] = useState<NotificationStats>({
    totalOverdue: 0,
    highPriorityOverdue: 0,
    todayPending: 0,
    totalNotifications: 0
  })
  const [loading, setLoading] = useState(false)

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/notifications')
      
      // Garantir que sempre temos uma estrutura válida
      const data = response.data || {}
      const notifications = data.notifications || []
      const stats = data.stats || {
        totalOverdue: 0,
        highPriorityOverdue: 0,
        todayPending: 0,
        totalNotifications: 0
      }
      
      setNotifications(notifications)
      setStats(stats)
      
    } catch (error) {
      console.error('Erro ao carregar notificações:', error)
      // Em caso de erro, definir valores padrão
      setNotifications([])
      setStats({
        totalOverdue: 0,
        highPriorityOverdue: 0,
        todayPending: 0,
        totalNotifications: 0
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
    
    // Atualizar notificações a cada 5 minutos
    const interval = setInterval(loadNotifications, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  const handleNotificationClick = (notification: Notification) => {
    if (notification.taskId && onTaskClick) {
      onTaskClick(notification.taskId)
      setIsOpen(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-4 h-4" />
      case 'medium': return <Clock className="w-4 h-4" />
      default: return <Calendar className="w-4 h-4" />
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <div className="relative">
      {/* Bell Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-blue-100 hover:text-white hover:bg-blue-600/50 rounded-lg transition-all duration-200"
      >
        <Bell className="w-5 h-5" />
        {stats.totalNotifications > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold animate-pulse">
            {stats.totalNotifications > 99 ? '99+' : stats.totalNotifications}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[500px] overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Notificações</h3>
                <p className="text-sm text-gray-600">
                  {stats.totalNotifications} nova(s) notificação(ões)
                </p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Stats Summary */}
            {stats.totalOverdue > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="bg-red-100 text-red-700 px-2 py-1 rounded-lg text-center">
                  <div className="font-semibold">{stats.totalOverdue}</div>
                  <div>Atrasadas</div>
                </div>
                <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-center">
                  <div className="font-semibold">{stats.todayPending}</div>
                  <div>Hoje</div>
                </div>
              </div>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Nenhuma notificação</p>
                <p className="text-gray-400 text-sm">Todas as tarefas estão em dia!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start space-x-3">
                      {/* Priority Icon */}
                      <div className={`p-2 rounded-lg ${getPriorityColor(notification.priority)}`}>
                        {getPriorityIcon(notification.priority)}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">
                            {notification.title}
                          </h4>
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        
                        {notification.type === 'overdue' && notification.daysOverdue > 0 && (
                          <div className="flex items-center mt-2 text-xs">
                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full">
                              {notification.daysOverdue} dia(s) atrasada
                            </span>
                            {notification.dueDate && (
                              <span className="text-gray-500 ml-2">
                                Venceu em {formatDate(notification.dueDate)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-100 bg-gray-50">
              <button 
                onClick={() => {
                  setIsOpen(false)
                  // Aqui poderia navegar para a página de tarefas
                }}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Ver todas as tarefas
              </button>
            </div>
          )}
        </div>
      )}

      {/* Overlay para fechar o dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
