// Interface apenas para o frontend - sem imports do Google APIs
export interface CalendarEvent {
  summary: string
  description?: string
  start: {
    dateTime: string // ISO 8601 format
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
  location?: string
  reminders?: {
    useDefault: boolean
    overrides?: Array<{
      method: 'email' | 'popup'
      minutes: number
    }>
  }
}

export interface CalendarService {
  createEvent: (event: CalendarEvent) => Promise<string | null>
  updateEvent: (eventId: string, event: Partial<CalendarEvent>) => Promise<boolean>
  deleteEvent: (eventId: string) => Promise<boolean>
  listEvents: (timeMin?: string, timeMax?: string) => Promise<CalendarEvent[]>
}

// Templates de eventos pré-definidos
export const eventTemplates = {
  followUpCall: (clientName: string, clientEmail: string, startTime: Date, duration: number = 30) => ({
    summary: `Follow-up: ${clientName}`,
    description: `Ligação de follow-up com ${clientName}\n\nGerado automaticamente pelo ClientPulse CRM.\n\nObjetivos:\n- Verificar interesse\n- Apresentar proposta\n- Agendar próximos passos`,
    start: {
      dateTime: startTime.toISOString(),
      timeZone: 'America/Sao_Paulo'
    },
    end: {
      dateTime: new Date(startTime.getTime() + duration * 60000).toISOString(),
      timeZone: 'America/Sao_Paulo'
    },
    attendees: [
      { email: clientEmail, displayName: clientName }
    ],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email' as const, minutes: 60 },
        { method: 'popup' as const, minutes: 15 }
      ]
    }
  }),

  clientMeeting: (clientName: string, clientEmail: string, meetingType: string, startTime: Date, duration: number = 60) => ({
    summary: `Reunião: ${clientName} - ${meetingType}`,
    description: `Reunião com ${clientName}\nTipo: ${meetingType}\n\nGerado pelo ClientPulse CRM.`,
    start: {
      dateTime: startTime.toISOString(),
      timeZone: 'America/Sao_Paulo'
    },
    end: {
      dateTime: new Date(startTime.getTime() + duration * 60000).toISOString(),
      timeZone: 'America/Sao_Paulo'
    },
    attendees: [
      { email: clientEmail, displayName: clientName }
    ],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email' as const, minutes: 1440 }, // 24h antes
        { method: 'popup' as const, minutes: 30 }
      ]
    }
  }),

  taskDeadline: (taskTitle: string, deadline: Date) => ({
    summary: `⏰ Prazo: ${taskTitle}`,
    description: `Prazo para completar a tarefa: ${taskTitle}\n\nDefinido no ClientPulse CRM.`,
    start: {
      dateTime: deadline.toISOString(),
      timeZone: 'America/Sao_Paulo'
    },
    end: {
      dateTime: new Date(deadline.getTime() + 30 * 60000).toISOString(), // 30 min
      timeZone: 'America/Sao_Paulo'
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email' as const, minutes: 60 },
        { method: 'popup' as const, minutes: 15 }
      ]
    }
  })
}

// Serviço que faz chamadas para as APIs do backend
export const calendarService: CalendarService = {
  async createEvent(event: CalendarEvent): Promise<string | null> {
    try {
      const accessToken = localStorage.getItem('google_calendar_token')
      
      const response = await fetch('/api/calendar/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...event, accessToken })
      })

      const data = await response.json()
      
      if (data.success) {
        console.log('✅ Evento criado:', data.eventId)
        return data.eventId
      } else {
        console.error('❌ Erro ao criar evento:', data.error)
        return null
      }
    } catch (error) {
      console.error('❌ Erro na requisição:', error)
      return null
    }
  },

  async updateEvent(eventId: string, event: Partial<CalendarEvent>): Promise<boolean> {
    try {
      const accessToken = localStorage.getItem('google_calendar_token')
      
      const response = await fetch('/api/calendar/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventId, event, accessToken })
      })

      const data = await response.json()
      return data.success || false
    } catch (error) {
      console.error('❌ Erro ao atualizar evento:', error)
      return false
    }
  },

  async deleteEvent(eventId: string): Promise<boolean> {
    try {
      const accessToken = localStorage.getItem('google_calendar_token')
      
      const response = await fetch('/api/calendar/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventId, accessToken })
      })

      const data = await response.json()
      return data.success || false
    } catch (error) {
      console.error('❌ Erro ao excluir evento:', error)
      return false
    }
  },

  async listEvents(timeMin?: string, timeMax?: string): Promise<CalendarEvent[]> {
    try {
      const accessToken = localStorage.getItem('google_calendar_token')
      const params = new URLSearchParams()
      
      if (accessToken) params.append('accessToken', accessToken)
      if (timeMin) params.append('timeMin', timeMin)
      if (timeMax) params.append('timeMax', timeMax)

      const response = await fetch(`/api/calendar/list?${params}`)
      const data = await response.json()

      if (data.success) {
        return data.events || []
      } else {
        console.error('❌ Erro ao listar eventos:', data.error)
        return []
      }
    } catch (error) {
      console.error('❌ Erro na requisição:', error)
      return []
    }
  }
}

// Função para gerar URL de autorização OAuth
export async function getAuthUrl(): Promise<string | null> {
  try {
    const response = await fetch('/api/calendar/auth-url')
    const data = await response.json()
    
    if (data.success) {
      return data.authUrl
    } else {
      throw new Error(data.error || 'Erro ao gerar URL de autorização')
    }
  } catch (error) {
    console.error('❌ Erro ao obter URL de autorização:', error)
    return null
  }
}

// Função para trocar código por tokens
export async function getTokensFromCode(code: string): Promise<{ access_token: string; refresh_token?: string } | null> {
  try {
    const response = await fetch('/api/calendar/callback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code })
    })

    const data = await response.json()
    
    if (data.success) {
      return {
        access_token: data.access_token,
        refresh_token: data.refresh_token
      }
    } else {
      throw new Error(data.error || 'Erro ao obter tokens')
    }
  } catch (error) {
    console.error('❌ Erro ao obter tokens:', error)
    return null
  }
}

// Funções utilitárias
export function formatDateTime(date: Date): string {
  return date.toISOString()
}

export function parseDateTime(dateTimeString: string): Date {
  return new Date(dateTimeString)
}

// Função para criar evento de tarefa automaticamente
export async function createTaskEvent(
  taskTitle: string,
  taskDescription: string,
  dueDate: Date,
  clientEmail?: string
): Promise<string | null> {
  const event: CalendarEvent = {
    summary: `📋 ${taskTitle}`,
    description: `Tarefa do ClientPulse CRM:\n\n${taskDescription}`,
    start: {
      dateTime: dueDate.toISOString(),
      timeZone: 'America/Sao_Paulo'
    },
    end: {
      dateTime: new Date(dueDate.getTime() + 30 * 60000).toISOString(),
      timeZone: 'America/Sao_Paulo'
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 60 },
        { method: 'popup', minutes: 15 }
      ]
    }
  }

  if (clientEmail) {
    event.attendees = [{ email: clientEmail }]
  }

  return await calendarService.createEvent(event)
}
