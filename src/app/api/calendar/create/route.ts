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

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticação e permissões
    const user = extractUserFromRequest(req)
    if (!user || !hasProAccess(user)) {
      return NextResponse.json({
        success: false,
        error: 'Acesso não autorizado. Upgrade para PRO necessário.'
      }, { status: 403 })
    }

    const body = await req.json()
    const { summary, start, end, accessToken } = body

    if (!summary || !start || !end) {
      return NextResponse.json({
        success: false,
        error: 'Dados obrigatórios não fornecidos'
      }, { status: 400 })
    }

    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: 'Token de acesso necessário'
      }, { status: 400 })
    }

    // Usar credenciais reais do Google
    const oauth2Client = getOAuth2Client()
    oauth2Client.setCredentials({ access_token: accessToken })

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: body
    })

    console.log('✅ Evento criado no Google Calendar:', response.data.id)
    
    return NextResponse.json({
      success: true,
      eventId: response.data.id
    })

  } catch (error) {
    console.error('Erro ao criar evento:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro ao criar evento no Google Calendar'
    }, { status: 500 })
  }
}
