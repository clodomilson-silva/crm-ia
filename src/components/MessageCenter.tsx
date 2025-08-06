'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Send, Copy, Mail, MessageCircle, FileText, CheckCircle, Clock } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '@/contexts/AuthContext'

interface Client {
  id: string
  name: string
  email: string
  phone?: string
}

interface SendHistory {
  id: string
  clientName: string
  type: 'email' | 'whatsapp' | 'sms'
  message: string
  status: 'sent' | 'failed' | 'pending'
  sentAt: string
}

export default function MessageCenter() {
  const { hasProAccess } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState('')
  const [messageType, setMessageType] = useState<'email' | 'whatsapp' | 'sms'>('email')
  const [tone, setTone] = useState<'formal' | 'casual' | 'friendly'>('friendly')
  const [context, setContext] = useState('')
  const [generatedMessage, setGeneratedMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [copied, setCopied] = useState(false)
  const [sendHistory, setSendHistory] = useState<SendHistory[]>([])
  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate')

  // Campos para envio direto
  const [subject, setSubject] = useState('')
  const [directMessage, setDirectMessage] = useState('')

  useEffect(() => {
    loadClients()
    loadSendHistory()
  }, [])

  const loadClients = async () => {
    try {
      const response = await axios.get('/api/clients')
      const clientsData = response.data.clients || []
      setClients(clientsData)
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
      setClients([])
    }
  }

  const loadSendHistory = () => {
    const saved = localStorage.getItem('message_send_history')
    if (saved) {
      try {
        setSendHistory(JSON.parse(saved))
      } catch (error) {
        console.error('Erro ao carregar histórico:', error)
      }
    }
  }

  const saveSendHistory = (newEntry: SendHistory) => {
    const updated = [newEntry, ...sendHistory].slice(0, 50) // Manter últimos 50
    setSendHistory(updated)
    localStorage.setItem('message_send_history', JSON.stringify(updated))
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
        tone,
        context
      })

      if (response.data.message) {
        setGeneratedMessage(response.data.message)
        // Definir assunto automaticamente para email
        if (messageType === 'email' && response.data.subject) {
          setSubject(response.data.subject)
        }
      }
    } catch (error) {
      console.error('Erro ao gerar mensagem:', error)
      alert('Erro ao gerar mensagem. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!selectedClient || (!generatedMessage && !directMessage)) {
      alert('Selecione um cliente e escreva uma mensagem')
      return
    }

    const client = clients.find(c => c.id === selectedClient)
    if (!client) {
      alert('Cliente não encontrado')
      return
    }

    const messageToSend = generatedMessage || directMessage
    setSending(true)

    try {
      let endpoint = ''
      let payload = {}

      switch (messageType) {
        case 'email':
          if (!client.email) {
            alert('Cliente não possui email cadastrado')
            return
          }
          endpoint = '/api/communication/email'
          payload = {
            to: client.email,
            subject: subject || `Mensagem de ${client.name}`,
            html: messageToSend.replace(/\n/g, '<br>')
          }
          break

        case 'whatsapp':
          if (!client.phone) {
            alert('Cliente não possui telefone cadastrado')
            return
          }
          endpoint = '/api/communication/whatsapp'
          payload = {
            to: client.phone,
            message: messageToSend
          }
          break

        case 'sms':
          if (!client.phone) {
            alert('Cliente não possui telefone cadastrado')
            return
          }
          endpoint = '/api/communication/sms'
          payload = {
            to: client.phone,
            message: messageToSend
          }
          break
      }

      const response = await axios.post(endpoint, payload)

      if (response.data.success) {
        // Salvar no histórico
        saveSendHistory({
          id: Date.now().toString(),
          clientName: client.name,
          type: messageType,
          message: messageToSend,
          status: 'sent',
          sentAt: new Date().toISOString()
        })

        alert(`${messageType.toUpperCase()} enviado com sucesso!`)
        
        // Limpar campos
        setGeneratedMessage('')
        setDirectMessage('')
        setSubject('')
        setContext('')
      } else {
        throw new Error(response.data.error || 'Erro no envio')
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      
      // Salvar como falha no histórico
      saveSendHistory({
        id: Date.now().toString(),
        clientName: client.name,
        type: messageType,
        message: messageToSend,
        status: 'failed',
        sentAt: new Date().toISOString()
      })

      alert('Erro ao enviar mensagem. Verifique os dados e tente novamente.')
    } finally {
      setSending(false)
    }
  }

  const copyToClipboard = async () => {
    if (generatedMessage) {
      await navigator.clipboard.writeText(generatedMessage)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />
      case 'whatsapp': return <MessageCircle className="h-4 w-4" />
      case 'sms': return <MessageSquare className="h-4 w-4" />
      default: return <MessageSquare className="h-4 w-4" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed': return <FileText className="h-4 w-4 text-red-600" />
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />
      default: return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Navegação por abas */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('generate')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'generate'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Criar & Enviar
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Histórico ({sendHistory.length})
          </button>
        </nav>
      </div>

      {activeTab === 'generate' && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-3 mb-6">
            <MessageSquare className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Centro de Mensagens</h2>
          </div>

          {/* Configurações */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cliente
              </label>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione um cliente</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Mensagem
              </label>
              <select
                value={messageType}
                onChange={(e) => setMessageType(e.target.value as 'email' | 'whatsapp' | 'sms')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="email">Email</option>
                {hasProAccess && <option value="whatsapp">WhatsApp</option>}
                {hasProAccess && <option value="sms">SMS</option>}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tom da Mensagem
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as 'formal' | 'casual' | 'friendly')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="friendly">Amigável</option>
                <option value="formal">Formal</option>
                <option value="casual">Casual</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={generateMessage}
                disabled={loading || !selectedClient || !context}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Gerando...' : 'Gerar com IA'}
              </button>
            </div>
          </div>

          {/* Contexto para IA */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contexto para IA (opcional)
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: Acompanhamento de proposta, agendamento de reunião, etc."
            />
          </div>

          {/* Assunto para email */}
          {messageType === 'email' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assunto do Email
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Assunto do email"
              />
            </div>
          )}

          {/* Área de mensagem */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Mensagem
              </label>
              {generatedMessage && (
                <button
                  onClick={copyToClipboard}
                  className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
                >
                  <Copy className="h-4 w-4" />
                  <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                </button>
              )}
            </div>
            
            {generatedMessage ? (
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                <div className="text-sm text-gray-600 mb-2">Mensagem gerada pela IA:</div>
                <div className="whitespace-pre-wrap text-gray-900">{generatedMessage}</div>
              </div>
            ) : (
              <textarea
                value={directMessage}
                onChange={(e) => setDirectMessage(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Digite sua mensagem ou use a IA para gerar uma..."
              />
            )}
          </div>

          {/* Ações */}
          <div className="flex items-center justify-end space-x-3">
            {generatedMessage && (
              <button
                onClick={() => {
                  setGeneratedMessage('')
                  setDirectMessage('')
                }}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Limpar
              </button>
            )}
            
            <button
              onClick={sendMessage}
              disabled={sending || !selectedClient || (!generatedMessage && !directMessage)}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
              <span>{sending ? 'Enviando...' : `Enviar ${messageType.toUpperCase()}`}</span>
            </button>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Histórico de Envios</h3>
          
          {sendHistory.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhuma mensagem enviada ainda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sendHistory.map((entry) => (
                <div key={entry.id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-shrink-0 mt-1">
                    {getMessageIcon(entry.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900">
                        {entry.clientName}
                      </p>
                      <span className="text-xs text-gray-500 uppercase">
                        {entry.type}
                      </span>
                      {getStatusIcon(entry.status)}
                    </div>
                    <p className="text-sm text-gray-600 mt-1 truncate">
                      {entry.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(entry.sentAt).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
