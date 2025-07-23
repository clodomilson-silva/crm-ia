'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Mail, Phone, User, TrendingUp } from 'lucide-react'
import axios from 'axios'
import ClientDetailModal from './ClientDetailModal'
import TaskForm from './TaskForm'
import { ClientWithRelations } from '@/types/crm'

interface Client {
  id: string
  name: string
  email: string
  phone?: string
  clientType: string
  leadScore: number
  status: string
  createdAt: string
  interactions: Array<{
    id: string
    type: string
    createdAt: string
  }>
  tasks: Array<{
    id: string
    title: string
    status: string
  }>
}

export default function ClientList() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClient, setSelectedClient] = useState<ClientWithRelations | null>(null)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [taskClientId, setTaskClientId] = useState<string>('')
  const [taskClientName, setTaskClientName] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const handleViewDetails = async (clientId: string) => {
    try {
      const response = await axios.get(`/api/clients/${clientId}`)
      setSelectedClient(response.data.client)
    } catch (error) {
      console.error('Erro ao carregar detalhes do cliente:', error)
    }
  }

  const handleCreateTask = (clientId: string, clientName: string) => {
    setTaskClientId(clientId)
    setTaskClientName(clientName)
    setShowTaskForm(true)
  }

  const handleTaskCreated = () => {
    // Recarregar a lista de clientes para atualizar as tarefas
    window.location.reload()
  }

  useEffect(() => {
    const loadClientsWithParams = async () => {
      try {
        const params = new URLSearchParams()
        if (searchTerm) params.append('search', searchTerm)
        if (filterType) params.append('type', filterType)
        if (filterStatus) params.append('status', filterStatus)

        const response = await axios.get(`/api/clients?${params.toString()}`)
        setClients(response.data.clients)
      } catch (error) {
        console.error('Erro ao carregar clientes:', error)
      } finally {
        setLoading(false)
      }
    }

    loadClientsWithParams()
  }, [searchTerm, filterType, filterStatus])

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    if (score >= 40) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'customer': return 'bg-green-100 text-green-800'
      case 'lead': return 'bg-blue-100 text-blue-800'
      case 'prospect': return 'bg-gray-100 text-gray-800'
      case 'inactive': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-3 sm:p-4 lg:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-3 sm:py-2 text-base text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-3 sm:py-2 text-base text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos os tipos</option>
            <option value="prospect">Prospects</option>
            <option value="lead">Leads</option>
            <option value="customer">Clientes</option>
            <option value="inactive">Inativos</option>
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-3 sm:py-2 text-base text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos os status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
          
          <button
            onClick={() => {
              setSearchTerm('')
              setFilterType('')
              setFilterStatus('')
            }}
            className="flex items-center justify-center px-3 sm:px-4 py-3 sm:py-2 text-sm sm:text-base text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium min-h-[44px]"
          >
            <Filter className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Limpar Filtros</span>
            <span className="sm:hidden">Limpar</span>
          </button>
        </div>
      </div>

      {/* Lista de Clientes */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
            Clientes ({clients.length})
          </h3>
        </div>
        
        {clients.length === 0 ? (
          <div className="text-center py-8 sm:py-12 px-4">
            <User className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Nenhum cliente encontrado
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-gray-500">
              {searchTerm || filterType || filterStatus
                ? 'Tente ajustar os filtros de busca.'
                : 'Comece adicionando um novo cliente.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {clients.map((client) => (
              <div key={client.id} className="p-3 sm:p-4 lg:p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                      <h4 className="text-base sm:text-lg font-medium text-gray-900 truncate">
                        {client.name}
                      </h4>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(client.clientType)}`}>
                        {client.clientType}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getScoreColor(client.leadScore)}`}>
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {client.leadScore}%
                      </span>
                    </div>
                    
                    <div className="space-y-1 sm:space-y-0 sm:flex sm:items-center sm:space-x-4 text-xs sm:text-sm text-gray-500">
                      <div className="flex items-center min-w-0">
                        <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                        <span className="truncate">{client.email}</span>
                      </div>
                      {client.phone && (
                        <div className="flex items-center">
                          <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                      <span>
                        {new Date(client.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                      <span>
                        {client.interactions.length} interações
                      </span>
                      <span>
                        {client.tasks.filter(t => t.status === 'pending').length} pendentes
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 pt-2 lg:pt-0">
                    <button 
                      onClick={() => handleViewDetails(client.id)}
                      className="px-3 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium min-h-[44px] flex items-center justify-center"
                    >
                      <span className="sm:hidden">Detalhes</span>
                      <span className="hidden sm:inline">Ver Detalhes</span>
                    </button>
                    <button 
                      onClick={() => handleCreateTask(client.id, client.name)}
                      className="px-3 py-2 text-sm text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium min-h-[44px] flex items-center justify-center"
                    >
                      <span className="sm:hidden">+ Tarefa</span>
                      <span className="hidden sm:inline">Criar Tarefa</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Modal de Detalhes do Cliente */}
      {selectedClient && (
        <ClientDetailModal 
          client={selectedClient} 
          isOpen={!!selectedClient}
          onClose={() => setSelectedClient(null)} 
        />
      )}

      {/* Modal de Criar Tarefa */}
      {showTaskForm && (
        <TaskForm
          clientId={taskClientId}
          clientName={taskClientName}
          onClose={() => setShowTaskForm(false)}
          onTaskCreated={handleTaskCreated}
        />
      )}
    </div>
  )
}
