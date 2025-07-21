import React from 'react'
import { X, Mail, Phone, Calendar, Star, AlertCircle, CheckCircle } from 'lucide-react'
import { ClientWithRelations } from '@/types/crm'

interface ClientDetailModalProps {
  client: ClientWithRelations | null
  isOpen: boolean
  onClose: () => void
}

export default function ClientDetailModal({ client, isOpen, onClose }: ClientDetailModalProps) {
  if (!isOpen || !client) return null

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getLeadScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getClientTypeColor = (type: string) => {
    switch (type) {
      case 'customer': return 'bg-blue-100 text-blue-800'
      case 'lead': return 'bg-green-100 text-green-800'
      case 'prospect': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getClientTypeLabel = (type: string) => {
    switch (type) {
      case 'customer': return 'Cliente'
      case 'lead': return 'Lead'
      case 'prospect': return 'Prospect'
      default: return type
    }
  }

  const getTaskPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'pending': return <AlertCircle className="w-4 h-4 text-yellow-600" />
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {client.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{client.name}</h2>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-1 text-xs rounded-full ${getClientTypeColor(client.clientType)}`}>
                  {getClientTypeLabel(client.clientType)}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full font-semibold ${getLeadScoreColor(client.leadScore)}`}>
                  <Star className="w-3 h-3 inline mr-1" />
                  {client.leadScore}% Lead Score
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informações de Contato */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Informações de Contato
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{client.email}</p>
                  </div>
                </div>

                {client.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Telefone</p>
                      <p className="font-medium">{client.phone}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Cadastrado em</p>
                    <p className="font-medium">{formatDate(client.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Notas */}
              {client.notes && (
                <div className="mt-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-2">Notas</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">{client.notes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Tarefas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Tarefas ({client.tasks?.length || 0})
              </h3>

              {client.tasks && client.tasks.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {client.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="border rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          {getTaskStatusIcon(task.status)}
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{task.title}</p>
                            {task.description && (
                              <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                            )}
                            <div className="flex items-center space-x-2 mt-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${getTaskPriorityColor(task.priority)}`}>
                                {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                              </span>
                              {task.dueDate && (
                                <span className="text-xs text-gray-500">
                                  Prazo: {formatDate(task.dueDate)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhuma tarefa encontrada</p>
                </div>
              )}
            </div>
          </div>

          {/* Interações */}
          {client.interactions && client.interactions.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">
                Histórico de Interações ({client.interactions.length})
              </h3>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {client.interactions.map((interaction) => (
                  <div
                    key={interaction.id}
                    className="border rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            {interaction.type}
                          </span>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">{interaction.content}</p>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                        {formatDate(interaction.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
