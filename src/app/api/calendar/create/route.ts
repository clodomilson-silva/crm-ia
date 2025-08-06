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
    const { summary, start, end } = body

    if (!summary || !start || !end) {
      return NextResponse.json({
        success: false,
        error: 'Dados obrigatórios não fornecidos'
      }, { status: 400 })
    }

    // Simular criação de evento (por enquanto, sem token real)
    console.log('✅ Evento simulado criado:', summary)
    
    // TODO: Implementar lógica real quando tokens estiverem disponíveis
    const simulatedEventId = `simulated-${Date.now()}`
    
    return NextResponse.json({
      success: true,
      eventId: simulatedEventId
    })

  } catch (error) {
    console.error('Erro ao criar evento:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}
