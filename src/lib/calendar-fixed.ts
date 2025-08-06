import { google } from 'googleapis'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

// Detectar automaticamente a URL de redirecionamento baseada no ambiente
function getRedirectUri(): string {
  // Se especificada explicitamente, usar essa
  if (process.env.GOOGLE_REDIRECT_URI) {
    return process.env.GOOGLE_REDIRECT_URI
  }
  
  // Detectar automaticamente baseado no NEXTAUTH_URL ou NODE_ENV
  const baseUrl = process.env.NEXTAUTH_URL || 
                  (process.env.NODE_ENV === 'production' 
                    ? 'https://clientpulse-cl.vercel.app' 
                    : 'http://localhost:3001')
  
  return `${baseUrl}/api/auth/google/callback`
}

const GOOGLE_REDIRECT_URI = getRedirectUri()

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
  createEvent: (event: CalendarEvent, accessToken: string) => Promise<string | null>
  updateEvent: (eventId: string, event: Partial<CalendarEvent>, accessToken: string) => Promise<boolean>
  deleteEvent: (eventId: string, accessToken: string) => Promise<boolean>
  listEvents: (accessToken: string, timeMin?: string, timeMax?: string) => Promise<CalendarEvent[]>
}

// Configurar OAuth2 client
function getOAuth2Client() {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error('Google Calendar credentials não configuradas')
  }

  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  )
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

export const calendarService: CalendarService = {
  async createEvent(event: CalendarEvent, accessToken: string): Promise<string | null> {
    if (!isCalendarConfigured()) {
      console.warn('⚠️ Google Calendar não configurado - Evento simulado:', event.summary)
      return 'simulated-event-id'
    }

    try {
      const oauth2Client = getOAuth2Client()
      oauth2Client.setCredentials({ access_token: accessToken })

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event
      })

      console.log('✅ Evento criado no Google Calendar:', response.data.id)
      return response.data.id || null
    } catch (error) {
      console.error('❌ Erro ao criar evento no Google Calendar:', error)
      return null
    }
  },

  async updateEvent(eventId: string, event: Partial<CalendarEvent>, accessToken: string): Promise<boolean> {
    if (!isCalendarConfigured()) {
      console.warn('⚠️ Google Calendar não configurado - Atualização simulada:', eventId)
      return true
    }

    try {
      const oauth2Client = getOAuth2Client()
      oauth2Client.setCredentials({ access_token: accessToken })

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

      await calendar.events.patch({
        calendarId: 'primary',
        eventId: eventId,
        requestBody: event
      })

      console.log('✅ Evento atualizado no Google Calendar:', eventId)
      return true
    } catch (error) {
      console.error('❌ Erro ao atualizar evento no Google Calendar:', error)
      return false
    }
  },

  async deleteEvent(eventId: string, accessToken: string): Promise<boolean> {
    if (!isCalendarConfigured()) {
      console.warn('⚠️ Google Calendar não configurado - Exclusão simulada:', eventId)
      return true
    }

    try {
      const oauth2Client = getOAuth2Client()
      oauth2Client.setCredentials({ access_token: accessToken })

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

      await calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId
      })

      console.log('✅ Evento excluído do Google Calendar:', eventId)
      return true
    } catch (error) {
      console.error('❌ Erro ao excluir evento do Google Calendar:', error)
      return false
    }
  },

  async listEvents(accessToken: string, timeMin?: string, timeMax?: string): Promise<CalendarEvent[]> {
    if (!isCalendarConfigured()) {
      console.warn('⚠️ Google Calendar não configurado - Lista vazia retornada')
      return []
    }

    try {
      const oauth2Client = getOAuth2Client()
      oauth2Client.setCredentials({ access_token: accessToken })

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: timeMin || new Date().toISOString(),
        timeMax: timeMax,
        singleEvents: true,
        orderBy: 'startTime'
      })

      const events: CalendarEvent[] = []
      
      if (response.data.items) {
        for (const item of response.data.items) {
          const event: CalendarEvent = {
            summary: item.summary || '',
            start: {
              dateTime: item.start?.dateTime || item.start?.date || '',
              timeZone: item.start?.timeZone || undefined
            },
            end: {
              dateTime: item.end?.dateTime || item.end?.date || '',
              timeZone: item.end?.timeZone || undefined
            }
          }

          // Adicionar propriedades opcionais apenas se existirem
          if (item.description) {
            event.description = item.description
          }

          if (item.location) {
            event.location = item.location
          }

          if (item.attendees && item.attendees.length > 0) {
            event.attendees = []
            for (const attendee of item.attendees) {
              event.attendees.push({
                email: attendee.email || '',
                displayName: attendee.displayName || undefined
              })
            }
          }

          if (item.reminders) {
            event.reminders = {
              useDefault: item.reminders.useDefault || false
            }
            
            if (item.reminders.overrides) {
              event.reminders.overrides = []
              for (const override of item.reminders.overrides) {
                event.reminders.overrides.push({
                  method: (override.method as 'email' | 'popup') || 'email',
                  minutes: override.minutes || 10
                })
              }
            }
          }

          events.push(event)
        }
      }

      return events
    } catch (error) {
      console.error('❌ Erro ao listar eventos do Google Calendar:', error)
      return []
    }
  }
}

// Função para gerar URL de autorização OAuth
export function getAuthUrl(): string {
  if (!isCalendarConfigured()) {
    throw new Error('Google Calendar não configurado')
  }

  const oauth2Client = getOAuth2Client()
  
  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
  ]

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  })
}

// Função para trocar código por tokens
export async function getTokensFromCode(code: string): Promise<{ access_token: string; refresh_token?: string } | null> {
  if (!isCalendarConfigured()) {
    return null
  }

  try {
    const oauth2Client = getOAuth2Client()
    const { tokens } = await oauth2Client.getToken(code)
    
    return {
      access_token: tokens.access_token || '',
      refresh_token: tokens.refresh_token || undefined
    }
  } catch (error) {
    console.error('❌ Erro ao obter tokens do Google:', error)
    return null
  }
}

// Função para validar configuração
export function isCalendarConfigured(): boolean {
  return !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET)
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
  clientEmail?: string,
  accessToken?: string
): Promise<string | null> {
  if (!accessToken) {
    console.warn('⚠️ Token de acesso não fornecido para criar evento de tarefa')
    return null
  }

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

  return await calendarService.createEvent(event, accessToken)
}
