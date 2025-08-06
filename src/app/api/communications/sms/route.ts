import { NextRequest, NextResponse } from 'next/server'
import { extractUserFromRequest } from '@/lib/auth'
import { checkProFeature } from '@/lib/permissions'
import { sendSMS, smsTemplates, formatPhoneNumber } from '@/lib/messaging'

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
    const allowedTypes = ['welcome', 'taskReminder', 'leadAlert', 'verification', 'custom']

    if (!allowedTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Tipo de SMS inválido' },
        { status: 400 }
      )
    }

    // Gerar mensagem baseada no template
    switch (type) {
      case 'welcome':
        message = smsTemplates.welcome(data.name || 'Cliente')
        break

      case 'taskReminder':
        message = smsTemplates.taskReminder(
          data.taskTitle || 'Tarefa',
          data.dueDate || 'Em breve'
        )
        break

      case 'leadAlert':
        message = smsTemplates.leadAlert(
          data.clientName || 'Cliente',
          data.leadScore || 0
        )
        break

      case 'verification':
        message = smsTemplates.verification(data.code || '000000')
        break

      case 'custom':
        message = data.message || 'Mensagem personalizada do ClientPulse'
        break

      default:
        return NextResponse.json(
          { error: 'Tipo de SMS não implementado' },
          { status: 400 }
        )
    }

    // Formatar número para SMS
    const formattedTo = formatPhoneNumber(to)

    // Enviar SMS
    const success = await sendSMS({
      to: formattedTo,
      message
    })

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'SMS enviado com sucesso',
        type,
        to: formattedTo
      })
    } else {
      return NextResponse.json(
        { error: 'Falha ao enviar SMS' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Erro na API de SMS:', error)
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
      process.env.TWILIO_PHONE_NUMBER
    )

    return NextResponse.json({
      service: 'sms',
      status: 'active',
      configured: isConfigured,
      templates: ['welcome', 'taskReminder', 'leadAlert', 'verification', 'custom'],
      provider: 'Twilio',
      fromNumber: process.env.TWILIO_PHONE_NUMBER || '+1234567890'
    })

  } catch (error) {
    console.error('Erro ao verificar status do SMS:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
