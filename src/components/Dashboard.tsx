'use client'

import { useState, useEffect } from 'react'
import { Users, TrendingUp, Clock, Star, BarChart3 } from 'lucide-react'
import axios from 'axios'

interface DashboardStats {
  totalClients: number
  prospects: number
  leads: number
  customers: number
  pendingTasks: number
  avgLeadScore: number
}

interface ClientData {
  id: string
  name: string
  email: string
  clientType: string
  leadScore: number
}

interface TaskData {
  id: string
  title: string
  dueDate: string
  client: {
    name: string
  }
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    prospects: 0,
    leads: 0,
    customers: 0,
    pendingTasks: 0,
    avgLeadScore: 0,
  })
  const [loading, setLoading] = useState(true)
  const [recentClients, setRecentClients] = useState<ClientData[]>([])
  const [urgentTasks, setUrgentTasks] = useState<TaskData[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [clientsRes, tasksRes] = await Promise.all([
        axios.get('/api/clients'),
        axios.get('/api/tasks?status=pending'),
      ])

      const clients: ClientData[] = clientsRes.data.clients
      const tasks: TaskData[] = tasksRes.data.tasks

      // Calcular estatísticas
      const totalClients = clients.length
      const prospects = clients.filter((c) => c.clientType === 'prospect').length
      const leads = clients.filter((c) => c.clientType === 'lead').length
      const customers = clients.filter((c) => c.clientType === 'customer').length
      const avgLeadScore = clients.length > 0 
        ? Math.round(clients.reduce((sum, c) => sum + c.leadScore, 0) / clients.length)
        : 0

      setStats({
        totalClients,
        prospects,
        leads,
        customers,
        pendingTasks: tasks.length,
        avgLeadScore,
      })

      // Clientes recentes (últimos 5)
      setRecentClients(clients.slice(0, 5))
      
      // Tarefas urgentes (próximas 3)
      const sortedTasks = tasks
        .filter((t) => t.dueDate)
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 3)
      setUrgentTasks(sortedTasks)

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total de Clientes',
      value: stats.totalClients,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Lead Score Médio',
      value: `${stats.avgLeadScore}%`,
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      change: '+8%',
      trend: 'up'
    },
    {
      title: 'Tarefas Pendentes',
      value: stats.pendingTasks,
      icon: Clock,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      change: '-5%',
      trend: 'down'
    },
    {
      title: 'Prospects Ativos',
      value: stats.prospects,
      icon: Star,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      change: '+23%',
      trend: 'up'
    },
  ]

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600">Visão geral do seu CRM com IA</p>
        </div>
        <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
          <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>Atualizado agora</span>
        </div>
      </div>

      {/* Cards de Estatísticas Modernos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-all duration-200 group">
              <div className="flex items-center justify-between">
                <div className={`flex-shrink-0 p-2 sm:p-3 rounded-xl ${card.bgColor} group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${card.iconColor}`} />
                </div>
                <div className={`text-xs px-2 py-1 rounded-full ${
                  card.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {card.change}
                </div>
              </div>
              <div className="mt-3 sm:mt-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500">{card.title}</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className={`mt-3 sm:mt-4 h-1 bg-gradient-to-r ${card.color} rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-200`}></div>
            </div>
          )
        })}
      </div>

      {/* Distribuição de Clientes e Seções Modernas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
        {/* Distribuição por Tipo de Cliente */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
            Distribuição de Clientes
          </h3>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between p-2 sm:p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-blue-500 rounded-full mr-2 sm:mr-3"></div>
                <span className="text-xs sm:text-sm font-medium text-gray-700">Prospects</span>
              </div>
              <span className="text-base sm:text-lg font-bold text-blue-600">{stats.prospects}</span>
            </div>
            <div className="flex items-center justify-between p-2 sm:p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full mr-2 sm:mr-3"></div>
                <span className="text-xs sm:text-sm font-medium text-gray-700">Leads</span>
              </div>
              <span className="text-base sm:text-lg font-bold text-green-600">{stats.leads}</span>
            </div>
            <div className="flex items-center justify-between p-2 sm:p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-purple-500 rounded-full mr-2 sm:mr-3"></div>
                <span className="text-xs sm:text-sm font-medium text-gray-700">Clientes</span>
              </div>
              <span className="text-base sm:text-lg font-bold text-purple-600">{stats.customers}</span>
            </div>
          </div>
        </div>

        {/* Clientes Recentes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600" />
            Clientes Recentes
          </h3>
          <div className="space-y-3 sm:space-y-4">
            {recentClients.length > 0 ? (
              recentClients.map((client) => (
                <div key={client.id} className="flex items-center justify-between p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm flex-shrink-0">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">{client.name}</p>
                      <p className="text-sm text-gray-500">{client.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      client.clientType === 'customer' ? 'bg-green-100 text-green-800' :
                      client.clientType === 'lead' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {client.clientType}
                    </span>
                    <div className="flex items-center mt-1">
                      <div className="w-12 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full" 
                          style={{ width: `${client.leadScore}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">{client.leadScore}%</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">
                Nenhum cliente cadastrado ainda
              </p>
            )}
          </div>
        </div>

        {/* Tarefas Urgentes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-orange-600" />
            Tarefas Urgentes
          </h3>
          <div className="space-y-4">
            {urgentTasks.length > 0 ? (
              urgentTasks.map((task) => (
                <div key={task.id} className="relative pl-6 pb-4 border-l-2 border-orange-200 last:border-l-0">
                  <div className="absolute w-3 h-3 bg-orange-500 rounded-full -left-1.5 top-2"></div>
                  <div className="bg-orange-50 rounded-lg p-3">
                    <p className="font-medium text-gray-900">{task.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{task.client.name}</p>
                    <div className="flex items-center mt-2 text-xs text-orange-600">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">
                Nenhuma tarefa urgente
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
