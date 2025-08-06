import sgMail from '@sendgrid/mail'

// Configurar SendGrid
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@clientpulse.com'

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY)
}

export interface EmailData {
  to: string
  subject: string
  text: string
  html?: string
  from?: string
}

export interface EmailTemplate {
  welcome: (name: string) => EmailData
  taskReminder: (name: string, taskTitle: string, dueDate: string) => EmailData
  followUp: (name: string, message: string) => EmailData
  newsletter: (name: string, content: string) => EmailData
}

// Templates de email pré-definidos
export const emailTemplates: EmailTemplate = {
  welcome: (name: string) => ({
    to: '',
    subject: '🎉 Bem-vindo ao ClientPulse!',
    text: `Olá ${name}! Bem-vindo ao ClientPulse, sua nova ferramenta de gestão de clientes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">🎉 Bem-vindo ao ClientPulse!</h2>
        <p>Olá <strong>${name}</strong>!</p>
        <p>Bem-vindo ao ClientPulse, sua nova ferramenta de gestão de clientes com IA.</p>
        <p>Agora você pode:</p>
        <ul>
          <li>✅ Gerenciar seus clientes de forma inteligente</li>
          <li>✅ Receber sugestões automáticas da IA</li>
          <li>✅ Automatizar follow-ups</li>
          <li>✅ Aumentar suas conversões</li>
        </ul>
        <a href="${process.env.NEXTAUTH_URL}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px;">
          Acessar Dashboard
        </a>
      </div>
    `
  }),

  taskReminder: (name: string, taskTitle: string, dueDate: string) => ({
    to: '',
    subject: `⏰ Lembrete: ${taskTitle}`,
    text: `Olá ${name}! Você tem uma tarefa pendente: ${taskTitle}. Vencimento: ${dueDate}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">⏰ Lembrete de Tarefa</h2>
        <p>Olá <strong>${name}</strong>!</p>
        <p>Você tem uma tarefa pendente:</p>
        <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 20px 0;">
          <h3 style="margin: 0; color: #dc2626;">${taskTitle}</h3>
          <p style="margin: 8px 0 0 0; color: #7f1d1d;">📅 Vencimento: ${dueDate}</p>
        </div>
        <a href="${process.env.NEXTAUTH_URL}" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px;">
          Ver Tarefa
        </a>
      </div>
    `
  }),

  followUp: (name: string, message: string) => ({
    to: '',
    subject: '📞 Follow-up ClientPulse',
    text: `Olá ${name}! ${message}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">📞 Follow-up</h2>
        <p>Olá <strong>${name}</strong>!</p>
        <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 16px; margin: 20px 0;">
          <p style="margin: 0;">${message}</p>
        </div>
        <p>Atenciosamente,<br>Equipe ClientPulse</p>
      </div>
    `
  }),

  newsletter: (name: string, content: string) => ({
    to: '',
    subject: '📊 Newsletter ClientPulse',
    text: `Olá ${name}! ${content}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">📊 Newsletter ClientPulse</h2>
        <p>Olá <strong>${name}</strong>!</p>
        <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          ${content}
        </div>
        <p style="font-size: 12px; color: #6b7280; margin-top: 40px;">
          Você está recebendo este email porque é cliente do ClientPulse.
        </p>
      </div>
    `
  })
}

export async function sendEmail(emailData: EmailData): Promise<boolean> {
  if (!SENDGRID_API_KEY) {
    console.warn('⚠️ SendGrid não configurado - Email simulado:', emailData.subject)
    return true // Simular sucesso em desenvolvimento
  }

  try {
    const msg = {
      to: emailData.to,
      from: emailData.from || FROM_EMAIL,
      subject: emailData.subject,
      text: emailData.text,
      html: emailData.html || emailData.text,
    }

    await sgMail.send(msg)
    console.log('✅ Email enviado:', emailData.subject, 'para', emailData.to)
    return true
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error)
    return false
  }
}

export async function sendBulkEmails(emails: EmailData[]): Promise<{ success: number; failed: number }> {
  let success = 0
  let failed = 0

  for (const email of emails) {
    const sent = await sendEmail(email)
    if (sent) {
      success++
    } else {
      failed++
    }
    
    // Delay entre emails para evitar rate limiting
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  return { success, failed }
}

// Função para validar configuração
export function isEmailConfigured(): boolean {
  return !!SENDGRID_API_KEY
}
