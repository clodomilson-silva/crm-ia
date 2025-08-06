import { NextRequest, NextResponse } from 'next/server'
import { extractUserFromRequest } from '@/lib/auth'
import { checkProFeature } from '@/lib/permissions'
import { sendEmail, emailTemplates } from '@/lib/email'
import { sendWhatsApp, whatsappTemplates, formatWhatsAppNumber } from '@/lib/messaging'
import { sendSMS, smsTemplates, formatPhoneNumber } from '@/lib/messaging'

export interface AutomationRule {
  id: string
  name: string
  description: string
  trigger: {
    type: 'client_created' | 'task_due' | 'lead_score_high' | 'task_overdue' | 'client_inactive'
    conditions?: Record<string, string | number | boolean>
  }
  actions: Array<{
    type: 'send_email' | 'send_whatsapp' | 'send_sms' | 'create_task' | 'update_client'
    template?: string
    data?: Record<string, string | number | boolean>
    delay?: number // em minutos
  }>
  isActive: boolean
  userId: string
}

interface TriggerData {
  test?: boolean
  clientId?: string
  clientName?: string
  clientEmail?: string
  clientPhone?: string
  taskTitle?: string
  dueDate?: string
  leadScore?: number
  message?: string
}

interface ActionResult {
  success: boolean
  type: string
  error: string | null
}

interface TemplateData {
  name?: string
  taskTitle?: string
  dueDate?: string
  message?: string
  clientName?: string
  leadScore?: number
}

// Automações pré-definidas
const defaultAutomations: Omit<AutomationRule, 'id' | 'userId'>[] = [
  {
    name: 'Boas-vindas novo cliente',
    description: 'Envia email e WhatsApp de boas-vindas quando um novo cliente é cadastrado',
    trigger: {
      type: 'client_created'
    },
    actions: [
      {
        type: 'send_email',
        template: 'welcome',
        delay: 5 // 5 minutos após cadastro
      },
      {
        type: 'send_whatsapp',
        template: 'welcome',
        delay: 10 // 10 minutos após cadastro
      }
    ],
    isActive: true
  },
  {
    name: 'Lembrete de tarefa',
    description: 'Envia lembrete 1 hora antes do vencimento da tarefa',
    trigger: {
      type: 'task_due',
      conditions: { hours_before: 1 }
    },
    actions: [
      {
        type: 'send_email',
        template: 'taskReminder'
      },
      {
        type: 'send_whatsapp',
        template: 'taskReminder'
      }
    ],
    isActive: true
  },
  {
    name: 'Lead quente detectado',
    description: 'Notifica quando um lead atinge pontuação alta (80+)',
    trigger: {
      type: 'lead_score_high',
      conditions: { min_score: 80 }
    },
    actions: [
      {
        type: 'send_whatsapp',
        template: 'leadNotification'
      }
    ],
    isActive: true
  }
]

export async function POST(request: NextRequest) {
  try {
    const user = extractUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar acesso PRO para automações
    const proAccess = checkProFeature(user)
    if (!proAccess.hasAccess) {
      return NextResponse.json({ 
        error: 'Funcionalidade PRO',
        message: proAccess.message,
        upgrade: user.role !== 'admin'
      }, { status: 403 })
    }

    const { action, data } = await request.json()

    switch (action) {
      case 'get_available':
        // Retornar automações disponíveis
        return NextResponse.json({
          success: true,
          message: 'Automações disponíveis',
          automations: defaultAutomations.map((automation, index) => ({
            ...automation,
            id: `default-${index}`,
            userId: user.userId
          }))
        })

      case 'trigger_automation':
        const { triggerType, triggerData } = data
        
        // Buscar automações ativas para este trigger
        const activeAutomations = defaultAutomations
          .map((automation, index) => ({ ...automation, id: `default-${index}`, userId: user.userId }))
          .filter(automation => 
            automation.isActive && 
            automation.trigger.type === triggerType
          )

        const results = []
        for (const automation of activeAutomations) {
          const result = await executeAutomation(automation, triggerData)
          results.push({
            automationId: automation.id,
            automationName: automation.name,
            success: result.success,
            actions: result.actions
          })
        }

        return NextResponse.json({
          success: true,
          message: `${results.length} automações executadas`,
          results
        })

      case 'test_automation':
        const { automationIndex } = data
        
        if (automationIndex >= defaultAutomations.length) {
          return NextResponse.json(
            { error: 'Automação não encontrada' },
            { status: 404 }
          )
        }

        const automation = {
          ...defaultAutomations[automationIndex],
          id: `default-${automationIndex}`,
          userId: user.userId
        }

        const testResult = await executeAutomation(automation, {
          test: true,
          clientName: 'Cliente Teste',
          clientEmail: 'teste@exemplo.com',
          clientPhone: '+5511999999999'
        })

        return NextResponse.json({
          success: true,
          message: 'Teste de automação executado',
          result: testResult
        })

      default:
        return NextResponse.json(
          { error: 'Ação não reconhecida' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Erro na API de automações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET para listar automações
export async function GET(request: NextRequest) {
  try {
    const user = extractUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar acesso PRO para automações
    const proAccess = checkProFeature(user)
    if (!proAccess.hasAccess) {
      return NextResponse.json({ 
        error: 'Funcionalidade PRO',
        message: proAccess.message,
        upgrade: user.role !== 'admin'
      }, { status: 403 })
    }

    const automations = defaultAutomations.map((automation, index) => ({
      ...automation,
      id: `default-${index}`,
      userId: user.userId
    }))

    return NextResponse.json({
      success: true,
      automations,
      total: automations.length,
      active: automations.filter(a => a.isActive).length,
      features: [
        'Boas-vindas automáticas',
        'Lembretes de tarefas',
        'Notificação de leads quentes',
        'Comunicação multi-canal',
        'Templates personalizados'
      ]
    })

  } catch (error) {
    console.error('Erro ao buscar automações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Função para executar uma automação
async function executeAutomation(automation: AutomationRule, triggerData: TriggerData) {
  const results = { success: true, actions: [] as ActionResult[] }

  for (const action of automation.actions) {
    try {
      // Aguardar delay se especificado
      if (action.delay && action.delay > 0) {
        console.log(`⏰ Aguardando ${action.delay} minutos antes da próxima ação...`)
        // Em produção, isso seria feito com um job queue
      }

      let actionResult: ActionResult = { success: false, type: action.type, error: null }

      switch (action.type) {
        case 'send_email':
          if (triggerData.clientEmail) {
            const emailData = getEmailFromTemplate(action.template!, {
              name: triggerData.clientName || 'Cliente',
              taskTitle: triggerData.taskTitle,
              dueDate: triggerData.dueDate,
              message: action.data?.message as string
            })
            emailData.to = triggerData.clientEmail
            
            const emailSent = await sendEmail(emailData)
            actionResult = { 
              success: emailSent, 
              type: action.type, 
              error: emailSent ? null : 'Falha no envio' 
            }
          }
          break

        case 'send_whatsapp':
          if (triggerData.clientPhone) {
            const message = getWhatsAppFromTemplate(action.template!, {
              name: triggerData.clientName || 'Cliente',
              taskTitle: triggerData.taskTitle,
              dueDate: triggerData.dueDate,
              clientName: triggerData.clientName,
              leadScore: triggerData.leadScore
            })
            
            const whatsappSent = await sendWhatsApp({
              to: formatWhatsAppNumber(triggerData.clientPhone),
              message
            })
            actionResult = { 
              success: whatsappSent, 
              type: action.type, 
              error: whatsappSent ? null : 'Falha no envio' 
            }
          }
          break

        case 'send_sms':
          if (triggerData.clientPhone) {
            const message = getSMSFromTemplate(action.template!, {
              name: triggerData.clientName || 'Cliente',
              taskTitle: triggerData.taskTitle,
              dueDate: triggerData.dueDate,
              clientName: triggerData.clientName,
              leadScore: triggerData.leadScore
            })
            
            const smsSent = await sendSMS({
              to: formatPhoneNumber(triggerData.clientPhone),
              message
            })
            actionResult = { 
              success: smsSent, 
              type: action.type, 
              error: smsSent ? null : 'Falha no envio' 
            }
          }
          break

        default:
          actionResult = { 
            success: false, 
            type: action.type, 
            error: 'Tipo de ação não implementado' 
          }
      }

      results.actions.push(actionResult)
      
      if (!actionResult.success) {
        console.warn(`⚠️ Ação ${action.type} falhou na automação ${automation.name}`)
      }

    } catch (error) {
      console.error(`❌ Erro na ação ${action.type}:`, error)
      results.actions.push({ 
        success: false, 
        type: action.type, 
        error: String(error) 
      })
    }
  }

  return results
}

// Funções auxiliares para templates
function getEmailFromTemplate(template: string, data: TemplateData) {
  switch (template) {
    case 'welcome':
      return emailTemplates.welcome(data.name || 'Cliente')
    case 'taskReminder':
      return emailTemplates.taskReminder(data.name || 'Cliente', data.taskTitle || 'Tarefa', data.dueDate || 'Em breve')
    case 'followUp':
      return emailTemplates.followUp(data.name || 'Cliente', data.message || 'Mensagem de follow-up')
    default:
      return emailTemplates.followUp(data.name || 'Cliente', 'Mensagem automática do sistema')
  }
}

function getWhatsAppFromTemplate(template: string, data: TemplateData): string {
  switch (template) {
    case 'welcome':
      return whatsappTemplates.welcome(data.name || 'Cliente')
    case 'taskReminder':
      return whatsappTemplates.taskReminder(data.name || 'Cliente', data.taskTitle || 'Tarefa', data.dueDate || 'Em breve')
    case 'followUp':
      return whatsappTemplates.followUp(data.name || 'Cliente', data.message || 'Mensagem de follow-up')
    case 'leadNotification':
      return whatsappTemplates.leadNotification(data.clientName || 'Cliente', data.leadScore || 0)
    default:
      return whatsappTemplates.followUp(data.name || 'Cliente', 'Mensagem automática do sistema')
  }
}

function getSMSFromTemplate(template: string, data: TemplateData): string {
  switch (template) {
    case 'welcome':
      return smsTemplates.welcome(data.name || 'Cliente')
    case 'taskReminder':
      return smsTemplates.taskReminder(data.taskTitle || 'Tarefa', data.dueDate || 'Em breve')
    case 'leadAlert':
      return smsTemplates.leadAlert(data.clientName || 'Cliente', data.leadScore || 0)
    default:
      return `ClientPulse: ${data.message || 'Mensagem automática'}`
  }
}
