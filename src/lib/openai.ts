import OpenAI from 'openai'
import { ClientSearchData } from '@/types/crm'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

// Função para verificar se a API key está configurada
export function isOpenAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'YOUR_OPENAI_API_KEY'
}

export interface AIAnalysis {
  leadScore: number
  nextAction: string
  actionPriority: 'low' | 'medium' | 'high'
  reasoning: string
}

export async function analyzeClient(clientData: {
  name: string
  email: string
  phone?: string
  notes?: string
  interactionHistory?: string[]
}): Promise<AIAnalysis> {
  // Verificar se a API está configurada
  if (!isOpenAIConfigured()) {
    console.warn('⚠️  API OpenAI não configurada. Configure OPENAI_API_KEY no arquivo .env.local')
    return {
      leadScore: 50,
      nextAction: 'Configurar API OpenAI para análise automática',
      actionPriority: 'medium',
      reasoning: 'API OpenAI não configurada - usando valores padrão'
    }
  }

  const prompt = `
Analise este cliente e forneça um lead score de 0-100 e sugira a próxima ação:

Cliente: ${clientData.name}
Email: ${clientData.email}
Telefone: ${clientData.phone || 'Não informado'}
Notas: ${clientData.notes || 'Nenhuma nota'}
Histórico de interações: ${clientData.interactionHistory?.join(', ') || 'Nenhuma interação'}

Por favor, responda APENAS em formato JSON válido com esta estrutura:
{
  "leadScore": número de 0-100,
  "nextAction": "descrição da ação sugerida",
  "actionPriority": "low" | "medium" | "high",
  "reasoning": "breve explicação do score e ação"
}
`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    })

    const response = completion.choices[0].message?.content
    if (!response) throw new Error('Resposta vazia da IA')

    return JSON.parse(response) as AIAnalysis
  } catch (error: unknown) {
    console.error('Erro na análise de IA:', error)
    
    // Tratamento específico para erro de API key
    if (error && typeof error === 'object' && 'code' in error && error.code === 'invalid_api_key') {
      console.error('🔑 Chave da API OpenAI inválida. Verifique sua configuração em .env.local')
    }
    
    return {
      leadScore: 50,
      nextAction: 'Fazer contato telefônico para avaliar interesse',
      actionPriority: 'medium',
      reasoning: 'Análise padrão devido a erro na IA'
    }
  }
}

export async function generateMessage(
  clientName: string,
  messageType: 'email' | 'whatsapp' | 'proposal',
  context: string,
  tone: 'formal' | 'casual' | 'friendly' = 'friendly'
): Promise<string> {
  // Verificar se a API está configurada
  if (!isOpenAIConfigured()) {
    return 'Para usar o gerador de mensagens com IA, configure sua chave da API OpenAI no arquivo .env.local'
  }

  const toneInstructions = {
    formal: 'Tom profissional e formal',
    casual: 'Tom descontraído e informal',
    friendly: 'Tom amigável e caloroso'
  }

  const typeInstructions = {
    email: 'e-mail comercial',
    whatsapp: 'mensagem de WhatsApp (máximo 200 caracteres)',
    proposal: 'proposta comercial detalhada'
  }

  const prompt = `
Crie uma ${typeInstructions[messageType]} para ${clientName} com ${toneInstructions[tone]}.

Contexto: ${context}

${messageType === 'whatsapp' ? 'Mantenha a mensagem concisa e direta.' : ''}
${messageType === 'proposal' ? 'Inclua seções de problema, solução, benefícios e próximos passos.' : ''}

Responda apenas com o texto da mensagem, sem aspas ou formatação adicional.
`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
    })

    return completion.choices[0].message?.content || 'Erro ao gerar mensagem'
  } catch (error) {
    console.error('Erro ao gerar mensagem:', error)
    if (error && typeof error === 'object' && 'code' in error && error.code === 'invalid_api_key') {
      return 'Erro: Chave da API OpenAI inválida. Verifique sua configuração.'
    }
    return 'Erro ao gerar mensagem. Verifique sua configuração da API.'
  }
}

export async function searchClients(query: string, clients: ClientSearchData[]): Promise<ClientSearchData[]> {
  if (!query || clients.length === 0) return clients

  // Verificar se a API está configurada
  if (!isOpenAIConfigured()) {
    console.warn('⚠️  API OpenAI não configurada. Usando busca simples.')
    // Fallback para busca simples
    return clients.filter(c => 
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.email.toLowerCase().includes(query.toLowerCase()) ||
      (c.notes && c.notes.toLowerCase().includes(query.toLowerCase()))
    )
  }

  const prompt = `
Você é um assistente de busca inteligente para CRM. 
Baseado na consulta "${query}", analise esta lista de clientes e retorne os IDs dos clientes mais relevantes.

Clientes disponíveis:
${clients.map(c => `ID: ${c.id}, Nome: ${c.name}, Email: ${c.email}, Tipo: ${c.clientType}, Notas: ${c.notes || 'Nenhuma'}`).join('\n')}

Responda APENAS com um array JSON de IDs dos clientes relevantes, por exemplo: ["id1", "id2", "id3"]
Se nenhum cliente for relevante, retorne: []
`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    })

    const response = completion.choices[0].message?.content
    if (!response) return clients

    const relevantIds = JSON.parse(response) as string[]
    return clients.filter(c => relevantIds.includes(c.id))
  } catch (error) {
    console.error('Erro na busca inteligente:', error)
    if (error && typeof error === 'object' && 'code' in error && error.code === 'invalid_api_key') {
      console.error('🔑 Chave da API OpenAI inválida. Verifique sua configuração em .env.local')
    }
    // Fallback para busca simples
    return clients.filter(c => 
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.email.toLowerCase().includes(query.toLowerCase()) ||
      (c.notes && c.notes.toLowerCase().includes(query.toLowerCase()))
    )
  }
}