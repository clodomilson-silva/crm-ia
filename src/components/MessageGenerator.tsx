'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Send, Copy, User } from 'lucide-react'
import axios from 'axios'

interface Client {
  id: string
  name: string
  email: string
}

export default function MessageGenerator() {
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState('')
  const [messageType, setMessageType] = useState<'email' | 'whatsapp' | 'proposal'>('email')
  const [tone, setTone] = useState<'formal' | 'casual' | 'friendly'>('friendly')
  const [context, setContext] = useState('')
  const [generatedMessage, setGeneratedMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    try {
      const response = await axios.get('/api/clients')
      setClients(response.data.clients)
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
    }
  }

  const generateMessage = async () => {
    if (!selectedClient || !context) {
      return
    }

    setLoading(true)
    setGeneratedMessage('')

    try {
      const client = clients.find(c => c.id === selectedClient)
      const response = await axios.post('/api/ai-message', {
        clientName: client?.name,
        messageType,
        context,
        tone,
      })

      setGeneratedMessage(response.data.message)
      
      // Salvar interação no histórico
      if (client) {
        await axios.post('/api/interactions', {
          clientId: client.id,
          type: messageType,
          content: response.data.message,
        })
      }
    } catch (error) {
      console.error('Erro ao gerar mensagem:', error)
      setGeneratedMessage('Erro ao gerar mensagem. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedMessage)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Erro ao copiar:', error)
    }
  }

  const selectedClientData = clients.find(c => c.id === selectedClient)

  return (
    <div className="max-w-4xl space-y-6">
      {/* Formulário de Geração */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-6">
          <MessageSquare className="w-6 h-6 text-blue-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">
            Gerador de Mensagens com IA
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Seleção de Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cliente
            </label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecione um cliente</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} ({client.email})
                </option>
              ))}
            </select>
            
            {selectedClientData && (
              <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center text-sm text-blue-700">
                  <User className="w-4 h-4 mr-2" />
                  {selectedClientData.name} - {selectedClientData.email}
                </div>
              </div>
            )}
          </div>

          {/* Tipo de Mensagem */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Mensagem
            </label>
            <select
              value={messageType}
              onChange={(e) => setMessageType(e.target.value as 'email' | 'whatsapp' | 'proposal')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="email">E-mail</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="proposal">Proposta Comercial</option>
            </select>
          </div>

          {/* Tom da Mensagem */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tom da Mensagem
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as 'formal' | 'casual' | 'friendly')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="friendly">Amigável</option>
              <option value="formal">Formal</option>
              <option value="casual">Casual</option>
            </select>
          </div>

          {/* Contexto */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contexto da Mensagem
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
              placeholder="Descreva o motivo da mensagem, o que você quer comunicar, ofertas especiais, follow-up, etc..."
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={generateMessage}
            disabled={loading || !selectedClient || !context}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4 mr-2" />
            {loading ? 'Gerando...' : 'Gerar Mensagem'}
          </button>
        </div>
      </div>

      {/* Mensagem Gerada */}
      {generatedMessage && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Mensagem Gerada
            </h3>
            <button
              onClick={copyToClipboard}
              className="flex items-center px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Copy className="w-4 h-4 mr-2" />
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
            <div className="text-sm text-gray-600 mb-2">
              <strong>Para:</strong> {selectedClientData?.name} ({selectedClientData?.email})
            </div>
            <div className="text-sm text-gray-600 mb-2">
              <strong>Tipo:</strong> {messageType} | <strong>Tom:</strong> {tone}
            </div>
            <div className="mt-4 whitespace-pre-line text-gray-800">
              {generatedMessage}
            </div>
          </div>
          
          <div className="mt-4 text-xs text-gray-500">
            ✨ Mensagem gerada por IA • Revise antes de enviar
          </div>
        </div>
      )}

      {/* Dicas */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          💡 Dicas para melhores resultados:
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Seja específico no contexto (ex: &quot;Cliente interessado em produto X, orçamento Y&quot;)</li>
          <li>• Para WhatsApp, mensagens curtas funcionam melhor</li>
          <li>• Para propostas, inclua detalhes sobre problemas e soluções</li>
          <li>• Sempre revise a mensagem antes de enviar</li>
        </ul>
      </div>
    </div>
  )
}
