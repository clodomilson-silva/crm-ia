import { NextRequest, NextResponse } from 'next/server'
import { extractUserFromRequest } from '@/lib/auth'
import { hasProAccess } from '@/lib/permissions'

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

    // Simular lista de eventos
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
      },
      {
        summary: 'Follow-up: João Silva',
        description: 'Acompanhamento de proposta',
        start: {
          dateTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
          timeZone: 'America/Sao_Paulo'
        },
        end: {
          dateTime: new Date(Date.now() + 48 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
          timeZone: 'America/Sao_Paulo'
        }
      }
    ]

    console.log('📅 Listando eventos simulados')
    
    return NextResponse.json({
      success: true,
      events: mockEvents
    })

  } catch (error) {
    console.error('Erro ao listar eventos:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}
