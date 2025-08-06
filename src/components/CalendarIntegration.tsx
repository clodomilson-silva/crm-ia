'use client'

import { useState, useEffect, useCallback } from 'react'
import { Calendar, Clock, Users, Plus, ExternalLink } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { calendarService, getAuthUrl } from '@/lib/calendar-client'

interface CalendarEvent {
  id?: string
  summary: string
  description?: string
  start: {
    dateTime: string
    timeZone?: string
  }
  end: {
    dateTime: string
    timeZone?: string
  }
  attendees?: Array<{
    email: string
    displayName?: string
  }>
}

export default function CalendarIntegration() {
  const { hasProAccess } = useAuth()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  const [newEvent, setNewEvent] = useState({
    summary: '',
    description: '',
    startDate: '',
    startTime: '',
    duration: 60,
    attendeeEmail: ''
  })

  const loadEvents = useCallback(async () => {
    if (!hasProAccess) return

    setLoading(true)
    try {
      const eventList = await calendarService.listEvents()
      setEvents(eventList)
    } catch (error) {
      console.error('Erro ao carregar eventos:', error)
    } finally {
      setLoading(false)
    }
  }, [hasProAccess])

  useEffect(() => {
    // Verificar se há token salvo e carregar eventos
    const savedToken = localStorage.getItem('google_calendar_token')
    if (savedToken) {
      setAccessToken(savedToken)
    }
    // Carregar eventos mesmo sem token (modo simulado)
    loadEvents()
  }, [loadEvents])

  const handleGoogleAuth = async () => {
    try {
      const authUrl = await getAuthUrl()
      if (authUrl) {
        window.open(authUrl, '_blank', 'width=500,height=600')
      } else {
        alert('Erro ao conectar com Google Calendar')
      }
    } catch (error) {
      console.error('Erro ao gerar URL de autenticação:', error)
      alert('Erro ao conectar com Google Calendar')
    }
  }

  const createEvent = async () => {
    if (!accessToken || !newEvent.summary || !newEvent.startDate || !newEvent.startTime) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    const startDateTime = new Date(`${newEvent.startDate}T${newEvent.startTime}`)
    const endDateTime = new Date(startDateTime.getTime() + newEvent.duration * 60000)

    const event: CalendarEvent = {
      summary: newEvent.summary,
      description: newEvent.description,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'America/Sao_Paulo'
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'America/Sao_Paulo'
      }
    }

    if (newEvent.attendeeEmail) {
      event.attendees = [{ email: newEvent.attendeeEmail }]
    }

    setLoading(true)
    try {
      const eventId = await calendarService.createEvent(event)
      if (eventId) {
        alert('Evento criado com sucesso!')
        setShowCreateForm(false)
        setNewEvent({
          summary: '',
          description: '',
          startDate: '',
          startTime: '',
          duration: 60,
          attendeeEmail: ''
        })
        loadEvents()
      } else {
        alert('Erro ao criar evento')
      }
    } catch (error) {
      console.error('Erro ao criar evento:', error)
      alert('Erro ao criar evento')
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString)
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!hasProAccess) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm border">
        <div className="text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Integração com Google Calendar
          </h3>
          <p className="text-gray-600 mb-4">
            Sincronize seus compromissos e tarefas automaticamente com o Google Calendar.
          </p>
          <button
            onClick={() => {
              const event = new CustomEvent('openPlanModal')
              window.dispatchEvent(event)
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Fazer Upgrade para Pro
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Calendar className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Google Calendar</h2>
          </div>
          
          {!accessToken ? (
            <button
              onClick={handleGoogleAuth}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Conectar Google</span>
            </button>
          ) : (
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              <Plus className="h-4 w-4" />
              <span>Novo Evento</span>
            </button>
          )}
        </div>

        {!accessToken ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              Conecte sua conta do Google para sincronizar eventos e compromissos.
            </p>
            <div className="text-sm text-gray-500">
              ✓ Criação automática de eventos<br />
              ✓ Lembretes por email<br />
              ✓ Sincronização bidirecional
            </div>
          </div>
        ) : (
          <>
            {showCreateForm && (
              <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Criar Novo Evento</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Título do Evento *
                    </label>
                    <input
                      type="text"
                      value={newEvent.summary}
                      onChange={(e) => setNewEvent({ ...newEvent, summary: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: Reunião com cliente"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email do Participante
                    </label>
                    <input
                      type="email"
                      value={newEvent.attendeeEmail}
                      onChange={(e) => setNewEvent({ ...newEvent, attendeeEmail: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="cliente@email.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data *
                    </label>
                    <input
                      type="date"
                      value={newEvent.startDate}
                      onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Horário *
                    </label>
                    <input
                      type="time"
                      value={newEvent.startTime}
                      onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descrição
                    </label>
                    <textarea
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Detalhes do evento..."
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-end space-x-3 mt-4">
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={createEvent}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
                  >
                    {loading ? 'Criando...' : 'Criar Evento'}
                  </button>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Próximos Eventos</h3>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Carregando eventos...</p>
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhum evento encontrado</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {events.slice(0, 10).map((event, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-shrink-0">
                        <Clock className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {event.summary}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDateTime(event.start.dateTime)}
                        </p>
                        {event.attendees && event.attendees.length > 0 && (
                          <div className="flex items-center space-x-1 mt-1">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {event.attendees.length} participante(s)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
