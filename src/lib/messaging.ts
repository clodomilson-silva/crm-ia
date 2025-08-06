import twilio from 'twilio'

// Configurações Twilio
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886' // Sandbox

let twilioClient: twilio.Twilio | null = null

if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
}

export interface WhatsAppMessage {
  to: string // Formato: whatsapp:+5511999999999
  message: string
  mediaUrl?: string
}

export interface SMSMessage {
  to: string // Formato: +5511999999999
  message: string
}

// Templates de WhatsApp pré-definidos
export const whatsappTemplates = {
  welcome: (name: string) => `🎉 Olá ${name}! Bem-vindo ao ClientPulse!\n\nSua conta foi criada com sucesso. Agora você pode gerenciar seus clientes de forma inteligente com nossa IA.\n\n✅ Acesse: ${process.env.NEXTAUTH_URL}`,
  
  taskReminder: (name: string, taskTitle: string, dueDate: string) => `⏰ *Lembrete de Tarefa*\n\nOlá ${name}!\n\nVocê tem uma tarefa pendente:\n📋 ${taskTitle}\n📅 Vencimento: ${dueDate}\n\nNão esqueça de completá-la!`,
  
  followUp: (name: string, message: string) => `📞 *Follow-up ClientPulse*\n\nOlá ${name}!\n\n${message}\n\nQualquer dúvida, estamos aqui para ajudar! 😊`,
  
  clientUpdate: (clientName: string, update: string) => `📊 *Atualização do Cliente*\n\nCliente: ${clientName}\n\n${update}\n\nMantenha-se atualizado sobre seus leads!`,
  
  leadNotification: (clientName: string, leadScore: number) => `🔥 *Lead Quente Detectado!*\n\nCliente: ${clientName}\nPontuação: ${leadScore}/100\n\nEste lead merece atenção especial! 🎯`,
}

// Templates de SMS pré-definidos
export const smsTemplates = {
  welcome: (name: string) => `ClientPulse: Olá ${name}! Sua conta foi criada. Acesse: ${process.env.NEXTAUTH_URL}`,
  
  taskReminder: (taskTitle: string, dueDate: string) => `ClientPulse: Tarefa pendente - ${taskTitle}. Vencimento: ${dueDate}`,
  
  leadAlert: (clientName: string, leadScore: number) => `ClientPulse: Lead quente! ${clientName} (${leadScore}/100). Aja agora!`,
  
  verification: (code: string) => `ClientPulse: Seu código de verificação é: ${code}`,
}

// Função para enviar WhatsApp
export async function sendWhatsApp(data: WhatsAppMessage): Promise<boolean> {
  if (!twilioClient || !TWILIO_WHATSAPP_NUMBER) {
    console.warn('⚠️ Twilio WhatsApp não configurado - Mensagem simulada para:', data.to)
    console.log('📱 WhatsApp:', data.message)
    return true // Simular sucesso em desenvolvimento
  }

  try {
    // Garantir que o número está no formato correto
    const formattedTo = data.to.startsWith('whatsapp:') ? data.to : `whatsapp:${data.to}`
    
    const message = await twilioClient.messages.create({
      body: data.message,
      from: TWILIO_WHATSAPP_NUMBER,
      to: formattedTo,
      ...(data.mediaUrl && { mediaUrl: [data.mediaUrl] })
    })

    console.log('✅ WhatsApp enviado:', message.sid, 'para', data.to)
    return true
  } catch (error) {
    console.error('❌ Erro ao enviar WhatsApp:', error)
    return false
  }
}

// Função para enviar SMS
export async function sendSMS(data: SMSMessage): Promise<boolean> {
  if (!twilioClient || !TWILIO_PHONE_NUMBER) {
    console.warn('⚠️ Twilio SMS não configurado - Mensagem simulada para:', data.to)
    console.log('📲 SMS:', data.message)
    return true // Simular sucesso em desenvolvimento
  }

  try {
    const message = await twilioClient.messages.create({
      body: data.message,
      from: TWILIO_PHONE_NUMBER,
      to: data.to
    })

    console.log('✅ SMS enviado:', message.sid, 'para', data.to)
    return true
  } catch (error) {
    console.error('❌ Erro ao enviar SMS:', error)
    return false
  }
}

// Função para envio em lote de WhatsApp
export async function sendBulkWhatsApp(messages: WhatsAppMessage[]): Promise<{ success: number; failed: number }> {
  let success = 0
  let failed = 0

  for (const message of messages) {
    const sent = await sendWhatsApp(message)
    if (sent) {
      success++
    } else {
      failed++
    }
    
    // Delay entre mensagens para evitar rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  return { success, failed }
}

// Função para envio em lote de SMS
export async function sendBulkSMS(messages: SMSMessage[]): Promise<{ success: number; failed: number }> {
  let success = 0
  let failed = 0

  for (const message of messages) {
    const sent = await sendSMS(message)
    if (sent) {
      success++
    } else {
      failed++
    }
    
    // Delay entre mensagens para evitar rate limiting
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  return { success, failed }
}

// Funções de validação
export function isWhatsAppConfigured(): boolean {
  return !!(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_WHATSAPP_NUMBER)
}

export function isSMSConfigured(): boolean {
  return !!(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER)
}

// Função para validar número de telefone
export function formatPhoneNumber(phone: string, country: string = 'BR'): string {
  // Remove todos os caracteres não numéricos
  let cleaned = phone.replace(/\D/g, '')
  
  // Se for Brasil e não tiver código do país, adiciona
  if (country === 'BR' && !cleaned.startsWith('55')) {
    cleaned = '55' + cleaned
  }
  
  // Adiciona o + se não tiver
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned
  }
  
  return cleaned
}

// Função para validar se o número é WhatsApp
export function formatWhatsAppNumber(phone: string): string {
  const formatted = formatPhoneNumber(phone)
  return `whatsapp:${formatted}`
}
