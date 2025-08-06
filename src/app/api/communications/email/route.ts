import { NextRequest, NextResponse } from 'next/server'
import { extractUserFromRequest } from '@/lib/auth'
import { checkProFeature } from '@/lib/permissions'
import { sendEmail, emailTemplates } from '@/lib/email'

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
        upgrade: user.role !== 'admin' // Só mostra upgrade se não for admin
      }, { status: 403 })
    }

    const { type, to, data } = await request.json()

    if (!type || !to) {
      return NextResponse.json(
        { error: 'Tipo e destinatário são obrigatórios' },
        { status: 400 }
      )
    }

    let emailData
    const allowedTypes = ['welcome', 'taskReminder', 'followUp', 'newsletter', 'custom']

    if (!allowedTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Tipo de email inválido' },
        { status: 400 }
      )
    }

    // Gerar email baseado no template ou customizado
    switch (type) {
      case 'welcome':
        emailData = emailTemplates.welcome(data.name || 'Cliente')
        emailData.to = to
        break

      case 'taskReminder':
        emailData = emailTemplates.taskReminder(
          data.name || 'Cliente',
          data.taskTitle || 'Tarefa',
          data.dueDate || 'Em breve'
        )
        emailData.to = to
        break

      case 'followUp':
        emailData = emailTemplates.followUp(
          data.name || 'Cliente',
          data.message || 'Mensagem de follow-up'
        )
        emailData.to = to
        break

      case 'newsletter':
        emailData = emailTemplates.newsletter(
          data.name || 'Cliente',
          data.content || 'Conteúdo da newsletter'
        )
        emailData.to = to
        break

      case 'custom':
        emailData = {
          to,
          subject: data.subject || 'Mensagem do ClientPulse',
          text: data.text || '',
          html: data.html || data.text || ''
        }
        break

      default:
        return NextResponse.json(
          { error: 'Tipo de email não implementado' },
          { status: 400 }
        )
    }

    // Enviar email
    const success = await sendEmail(emailData)

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Email enviado com sucesso',
        type,
        to
      })
    } else {
      return NextResponse.json(
        { error: 'Falha ao enviar email' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Erro na API de email:', error)
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
      service: 'email',
      status: 'active',
      configured: !!process.env.SENDGRID_API_KEY,
      templates: ['welcome', 'taskReminder', 'followUp', 'newsletter', 'custom'],
      provider: 'SendGrid'
    })

  } catch (error) {
    console.error('Erro ao verificar status do email:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
