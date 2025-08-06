import { NextRequest, NextResponse } from 'next/server'
import { extractUserFromRequest } from '@/lib/auth'
import { checkProFeature } from '@/lib/permissions'
import { sendWhatsApp, whatsappTemplates, formatWhatsAppNumber } from '@/lib/messaging'

export async function POST(request: NextRequest) {
  try {
    const user = extractUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar acesso PRO
    const proAccess = checkProFeature(user)
    if (!proAccess.hasAccess) {
      return NextResponse.json({ 
        error: 'Funcionalidade PRO',
        message: proAccess.message,
        upgrade: user.role !== 'admin'
      }, { status: 403 })
    }

    const { type, to, data } = await request.json()

    if (!type || !to) {
      return NextResponse.json(
        { error: 'Tipo e destinatário são obrigatórios' },
        { status: 400 }
      )
    }

    let message: string
    const allowedTypes = ['welcome', 'taskReminder', 'followUp', 'clientUpdate', 'leadNotification', 'custom']

    if (!allowedTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Tipo de WhatsApp inválido' },
        { status: 400 }
      )
    }

    // Gerar mensagem baseada no template
    switch (type) {
      case 'welcome':
        message = whatsappTemplates.welcome(data.name || 'Cliente')
        break

      case 'taskReminder':
        message = whatsappTemplates.taskReminder(
          data.name || 'Cliente',
          data.taskTitle || 'Tarefa',
          data.dueDate || 'Em breve'
        )
        break

      case 'followUp':
        message = whatsappTemplates.followUp(
          data.name || 'Cliente',
          data.message || 'Mensagem de follow-up'
        )
        break

      case 'clientUpdate':
        message = whatsappTemplates.clientUpdate(
          data.clientName || 'Cliente',
          data.update || 'Atualização disponível'
        )
        break

      case 'leadNotification':
        message = whatsappTemplates.leadNotification(
          data.clientName || 'Cliente',
          data.leadScore || 0
        )
        break

      case 'custom':
        message = data.message || 'Mensagem personalizada do ClientPulse'
        break

      default:
        return NextResponse.json(
          { error: 'Tipo de WhatsApp não implementado' },
          { status: 400 }
        )
    }

    // Formatar número para WhatsApp
    const formattedTo = formatWhatsAppNumber(to)

    // Enviar WhatsApp
    const success = await sendWhatsApp({
      to: formattedTo,
      message,
      mediaUrl: data.mediaUrl
    })

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'WhatsApp enviado com sucesso',
        type,
        to: formattedTo
      })
    } else {
      return NextResponse.json(
        { error: 'Falha ao enviar WhatsApp' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Erro na API de WhatsApp:', error)
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

    const isConfigured = !!(
      process.env.TWILIO_ACCOUNT_SID && 
      process.env.TWILIO_AUTH_TOKEN && 
      process.env.TWILIO_WHATSAPP_NUMBER
    )

    return NextResponse.json({
      service: 'whatsapp',
      status: 'active',
      configured: isConfigured,
      templates: ['welcome', 'taskReminder', 'followUp', 'clientUpdate', 'leadNotification', 'custom'],
      provider: 'Twilio',
      sandboxNumber: process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'
    })

  } catch (error) {
    console.error('Erro ao verificar status do WhatsApp:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
