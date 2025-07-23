'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Mail, Phone, User, TrendingUp } from 'lucide-react'
import ClientDetailModal from './ClientDetailModal'
import TaskForm from './TaskForm'
import ClientOnly from './ClientOnly'
import { ClientWithRelations } from '@/types/crm'
import { useClients, useClient } from '@/hooks/useCRMData'
import { useFilters } from '@/contexts/CRMContext'
import { useWebSocket } from '@/hooks/useWebSocket'

function ClientListContent() {
  const [selectedClient, setSelectedClient] = useState<ClientWithRelations | null>(null)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [taskClientId, setTaskClientId] = useState<string>('')
  const [taskClientName, setTaskClientName] = useState<string>('')
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  
  // Use context filters
  const { filters, setFilter } = useFilters()
  
  // Use custom hooks for data fetching
  const { 
    data: clients = [], 
    isLoading: loadingClients, 
    mutate: refreshClients 
  } = useClients()

  // Ensure clients is always an array
  const safeClients = Array.isArray(clients) ? clients : []

  // Use hook for individual client details
  const { 
    data: clientDetails, 
    isLoading: loadingDetails 
  } = useClient(selectedClientId || undefined)

  // WebSocket for real-time updates
  const { notifyTaskCreated } = useWebSocket()

  const handleViewDetails = (clientId: string) => {
    setSelectedClientId(clientId)
    setSelectedClient(null) // Reset while loading
  }

  // Update selectedClient when clientDetails loads
  useEffect(() => {
    if (clientDetails && !loadingDetails) {
      console.log('📋 Dados do cliente carregados na lista:', clientDetails)
      setSelectedClient(clientDetails as ClientWithRelations)
    }
  }, [clientDetails, loadingDetails])

  const handleCreateTask = (clientId: string, clientName: string) => {
    setTaskClientId(clientId)
    setTaskClientName(clientName)
    setShowTaskForm(true)
  }

  const handleTaskCreated = () => {
    // Refresh clients to update task counts
    refreshClients()
    // Notify other users via WebSocket
    notifyTaskCreated({
      id: 'temp',
      title: 'Nova tarefa criada',
      clientId: taskClientId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
  }

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

  if (loadingClients) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar clientes..."
              value={filters.clientSearch}
              onChange={(e) => setFilter('clientSearch', e.target.value)}
              className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
            />
          </div>
        </div>
        
        <select
          value={filters.clientType}
          onChange={(e) => setFilter('clientType', e.target.value)}
          className="px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white min-w-[120px]"
        >
          <option value="">Todos os tipos</option>
          <option value="prospect">Prospect</option>
          <option value="lead">Lead</option>
          <option value="customer">Cliente</option>
          <option value="inactive">Inativo</option>
        </select>

        <select
          value={filters.clientStatus}
          onChange={(e) => setFilter('clientStatus', e.target.value)}
          className="px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white min-w-[120px]"
        >
          <option value="">Todos os status</option>
          <option value="active">Ativo</option>
          <option value="inactive">Inativo</option>
        </select>

        {(filters.clientSearch || filters.clientType || filters.clientStatus) && (
          <button
            onClick={() => {
              setFilter('clientSearch', '')
              setFilter('clientType', '')
              setFilter('clientStatus', '')
            }}
            className="px-4 py-2 sm:py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
          >
            Limpar
          </button>
        )}
      </div>

      {/* Lista de Clientes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {safeClients.length === 0 ? (
          <div className="text-center py-12">
            <Filter className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {filters.clientSearch || filters.clientType || filters.clientStatus
                ? 'Nenhum cliente encontrado com os filtros aplicados'
                : 'Nenhum cliente cadastrado'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {safeClients.map((client: any) => (
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
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="truncate">{client.email}</span>
                      </div>
                      {client.phone && (
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        {client.interactions.length} interações
                      </span>
                      <span className="flex items-center">
                        📋
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {client.tasks.filter((t: any) => t.status === 'pending').length} pendentes
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
          onClose={() => {
            setSelectedClient(null)
            setSelectedClientId(null)
          }}
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

export default function ClientList() {
  return (
    <ClientOnly fallback={
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <ClientListContent />
    </ClientOnly>
  )
}
