import { NextRequest, NextResponse } from 'next/server'
import { extractUserFromRequest } from '@/lib/auth'
import { checkProFeature } from '@/lib/permissions'
import { 
  calendarService, 
  eventTemplates, 
  getAuthUrl, 
  getTokensFromCode,
  isCalendarConfigured 
} from '@/lib/calendar'

export async function POST(request: NextRequest) {
  try {
    const user = extractUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar acesso PRO para Google Calendar
    const proAccess = checkProFeature(user)
    if (!proAccess.hasAccess) {
      return NextResponse.json({ 
        error: 'Funcionalidade PRO',
        message: proAccess.message,
        upgrade: user.role !== 'admin'
      }, { status: 403 })
    }

    const { action, data } = await request.json()

    if (!action) {
      return NextResponse.json(
        { error: 'Ação é obrigatória' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'getAuthUrl':
        try {
          const authUrl = getAuthUrl()
          return NextResponse.json({
            success: true,
            authUrl,
            message: 'URL de autorização gerada'
          })
        } catch {
          return NextResponse.json(
            { error: 'Erro ao gerar URL de autorização' },
            { status: 500 }
          )
        }

      case 'exchangeCode':
        const { code } = data
        if (!code) {
          return NextResponse.json(
            { error: 'Código de autorização é obrigatório' },
            { status: 400 }
          )
        }

        const tokens = await getTokensFromCode(code)
        if (tokens) {
          // Aqui você salvaria os tokens no banco de dados associados ao usuário
          return NextResponse.json({
            success: true,
            message: 'Autorização concedida com sucesso',
            hasRefreshToken: !!tokens.refresh_token
          })
        } else {
          return NextResponse.json(
            { error: 'Falha ao obter tokens' },
            { status: 500 }
          )
        }

      case 'createEvent':
        const { event, accessToken } = data
        if (!event || !accessToken) {
          return NextResponse.json(
            { error: 'Evento e token de acesso são obrigatórios' },
            { status: 400 }
          )
        }

        const eventId = await calendarService.createEvent(event, accessToken)
        if (eventId) {
          return NextResponse.json({
            success: true,
            eventId,
            message: 'Evento criado com sucesso'
          })
        } else {
          return NextResponse.json(
            { error: 'Falha ao criar evento' },
            { status: 500 }
          )
        }

      case 'createTaskEvent':
        const { taskTitle, dueDate, userAccessToken } = data
        if (!taskTitle || !dueDate || !userAccessToken) {
          return NextResponse.json(
            { error: 'Título da tarefa, data de vencimento e token são obrigatórios' },
            { status: 400 }
          )
        }

        const taskEventId = await calendarService.createEvent(
          eventTemplates.taskDeadline(taskTitle, new Date(dueDate)),
          userAccessToken
        )

        if (taskEventId) {
          return NextResponse.json({
            success: true,
            eventId: taskEventId,
            message: 'Evento de tarefa criado com sucesso'
          })
        } else {
          return NextResponse.json(
            { error: 'Falha ao criar evento de tarefa' },
            { status: 500 }
          )
        }

      case 'scheduleFollowUp':
        const { clientName, clientEmail: followUpEmail, startTime, duration, userToken } = data
        if (!clientName || !followUpEmail || !startTime || !userToken) {
          return NextResponse.json(
            { error: 'Nome do cliente, email, horário e token são obrigatórios' },
            { status: 400 }
          )
        }

        const followUpEvent = eventTemplates.followUpCall(
          clientName, 
          followUpEmail, 
          new Date(startTime), 
          duration || 30
        )

        const followUpEventId = await calendarService.createEvent(followUpEvent, userToken)

        if (followUpEventId) {
          return NextResponse.json({
            success: true,
            eventId: followUpEventId,
            message: 'Follow-up agendado com sucesso'
          })
        } else {
          return NextResponse.json(
            { error: 'Falha ao agendar follow-up' },
            { status: 500 }
          )
        }

      default:
        return NextResponse.json(
          { error: 'Ação não reconhecida' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Erro na API do Google Calendar:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET para verificar status do serviço
export async function GET(request: NextRequest) {
  try {
    const user = extractUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    return NextResponse.json({
      service: 'calendar',
      status: 'active',
      configured: isCalendarConfigured(),
      provider: 'Google Calendar',
      features: [
        'Criação de eventos',
        'Agendamento de follow-ups',
        'Lembretes de tarefas',
        'Reuniões com clientes'
      ],
      actions: [
        'getAuthUrl',
        'exchangeCode', 
        'createEvent',
        'createTaskEvent',
        'scheduleFollowUp'
      ]
    })

  } catch (error) {
    console.error('Erro ao verificar status do Google Calendar:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
