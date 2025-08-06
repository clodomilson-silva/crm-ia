import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { extractUserFromRequest } from '@/lib/auth'
import { hasProAccess } from '@/lib/permissions'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/auth/google/callback`

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

export async function GET(req: NextRequest) {
  try {
    // Verificar autenticação e permissões
    const user = extractUserFromRequest(req)
    if (!user || !hasProAccess(user)) {
      return NextResponse.json({
        success: false,
        error: 'Acesso não autorizado. Upgrade para PRO necessário.'
      }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const accessToken = searchParams.get('accessToken')
    const timeMin = searchParams.get('timeMin')
    const timeMax = searchParams.get('timeMax')

    if (!accessToken) {
      // Retornar eventos simulados se não há token
      const mockEvents = [
        {
          summary: 'Reunião com Cliente Demo',
          description: 'Apresentação de proposta',
          start: {
            dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            timeZone: 'America/Sao_Paulo'
          },
          end: {
            dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
            timeZone: 'America/Sao_Paulo'
          },
          attendees: [
            { email: 'cliente@exemplo.com', displayName: 'Cliente Demo' }
          ]
        }
      ]

      return NextResponse.json({
        success: true,
        events: mockEvents
      })
    }

    // Usar Google Calendar real
    const oauth2Client = getOAuth2Client()
    oauth2Client.setCredentials({ access_token: accessToken })

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin || new Date().toISOString(),
      timeMax: timeMax || undefined,
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 20
    })

    const events = response.data.items?.map((item: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
      summary: item.summary || '',
      description: item.description || '',
      start: {
        dateTime: item.start?.dateTime || item.start?.date || '',
        timeZone: item.start?.timeZone || 'America/Sao_Paulo'
      },
      end: {
        dateTime: item.end?.dateTime || item.end?.date || '',
        timeZone: item.end?.timeZone || 'America/Sao_Paulo'
      },
      attendees: item.attendees?.map((attendee: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
        email: attendee.email || '',
        displayName: attendee.displayName || ''
      })) || []
    })) || []

    console.log('📅 Eventos carregados do Google Calendar:', events.length)
    
    return NextResponse.json({
      success: true,
      events
    })

  } catch (error) {
    console.error('Erro ao listar eventos:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro ao listar eventos do Google Calendar'
    }, { status: 500 })
  }
}
