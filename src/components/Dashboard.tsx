'use client'

import { useState, useEffect } from 'react'
import { Users, Target, MessageSquare, Calendar } from 'lucide-react'
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
      color: 'blue',
    },
    {
      title: 'Lead Score Médio',
      value: `${stats.avgLeadScore}%`,
      icon: Target,
      color: 'green',
    },
    {
      title: 'Tarefas Pendentes',
      value: stats.pendingTasks,
      icon: Calendar,
      color: 'orange',
    },
    {
      title: 'Prospects Ativos',
      value: stats.prospects,
      icon: MessageSquare,
      color: 'purple',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-lg bg-${card.color}-100`}>
                  <Icon className={`w-6 h-6 text-${card.color}-600`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{card.title}</p>
                  <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Distribuição de Clientes */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Distribuição por Tipo de Cliente
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.prospects}</div>
            <div className="text-sm text-gray-600">Prospects</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.leads}</div>
            <div className="text-sm text-gray-600">Leads</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.customers}</div>
            <div className="text-sm text-gray-600">Clientes</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Clientes Recentes */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Clientes Recentes
          </h3>
          <div className="space-y-3">
            {recentClients.length > 0 ? (
              recentClients.map((client) => (
                <div key={client.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{client.name}</p>
                    <p className="text-sm text-gray-500">{client.email}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      client.clientType === 'customer' ? 'bg-green-100 text-green-800' :
                      client.clientType === 'lead' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {client.clientType}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">
                      Score: {client.leadScore}%
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                Nenhum cliente cadastrado
              </p>
            )}
          </div>
        </div>

        {/* Tarefas Urgentes */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Tarefas Urgentes
          </h3>
          <div className="space-y-3">
            {urgentTasks.length > 0 ? (
              urgentTasks.map((task) => (
                <div key={task.id} className="border-l-4 border-orange-400 pl-4">
                  <p className="font-medium text-gray-900">{task.title}</p>
                  <p className="text-sm text-gray-600">{task.client.name}</p>
                  <p className="text-xs text-gray-500">
                    Vencimento: {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                Nenhuma tarefa urgente
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
