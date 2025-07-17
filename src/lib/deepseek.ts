import { ClientSearchData } from '@/types/crm'

// Configuração da API OpenRouter (DeepSeek gratuita)
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const DEEPSEEK_MODEL = 'deepseek/deepseek-chat' // Modelo gratuito no OpenRouter

export interface AIAnalysis {
  leadScore: number
  nextAction: string
  actionPriority: 'low' | 'medium' | 'high'
  reasoning: string
}

// Função para verificar se a API key está configurada
export function isDeepSeekConfigured(): boolean {
  return !!process.env.DEEPSEEK_API_KEY && process.env.DEEPSEEK_API_KEY !== 'YOUR_DEEPSEEK_API_KEY'
}

// Função para limpar resposta da IA e extrair JSON válido
function cleanAIResponse(response: string): string {
  let cleaned = response.trim()
  
  // Remover blocos de código markdown
  if (cleaned.includes('```json')) {
    cleaned = cleaned.replace(/```json\s*/, '').replace(/```\s*$/, '')
  }
  
  // Remover outras formatações markdown
  cleaned = cleaned.replace(/```\s*/, '').replace(/`/g, '')
  
  // Remover quebras de linha e espaços extras
  cleaned = cleaned.trim()
  
  // Se ainda houver problemas, tentar extrair apenas o JSON
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/) || cleaned.match(/\[[\s\S]*\]/)
  if (jsonMatch) {
    cleaned = jsonMatch[0]
  }
  
  return cleaned
}

// Função auxiliar para fazer requisições à API OpenRouter
async function callDeepSeekAPI(messages: Array<{role: string, content: string}>, temperature = 0.7): Promise<string> {
  if (!isDeepSeekConfigured()) {
    throw new Error('API DeepSeek não configurada')
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      'HTTP-Referer': 'http://localhost:3000', // OpenRouter requer um referer
      'X-Title': 'CRM com IA', // Título do app para OpenRouter
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages,
      temperature,
      max_tokens: 1000,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(`OpenRouter API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
}

export async function analyzeClient(clientData: {
  name: string
  email: string
  phone?: string
  notes?: string
  interactionHistory?: string[]
}): Promise<AIAnalysis> {
  // Verificar se a API está configurada
  if (!isDeepSeekConfigured()) {
    console.warn('⚠️  API DeepSeek (OpenRouter) não configurada. Configure DEEPSEEK_API_KEY no arquivo .env.local')
    return {
      leadScore: 50,
      nextAction: 'Configurar API DeepSeek via OpenRouter para análise automática',
      actionPriority: 'medium',
      reasoning: 'API DeepSeek não configurada - usando valores padrão'
    }
  }

  const prompt = `
Analise este cliente e forneça um lead score de 0-100 e sugira a próxima ação:

Cliente: ${clientData.name}
Email: ${clientData.email}
Telefone: ${clientData.phone || 'Não informado'}
Notas: ${clientData.notes || 'Nenhuma nota'}
Histórico de interações: ${clientData.interactionHistory?.join(', ') || 'Nenhuma interação'}

IMPORTANTE: Responda APENAS com um JSON válido, sem formatação markdown, sem \`\`\`json, apenas o objeto JSON puro:

{
  "leadScore": número de 0-100,
  "nextAction": "descrição da ação sugerida",
  "actionPriority": "low" | "medium" | "high",
  "reasoning": "breve explicação do score e ação"
}
`

  try {
    const response = await callDeepSeekAPI([
      { role: 'user', content: prompt }
    ], 0.7)

    if (!response) throw new Error('Resposta vazia da IA')

    // Limpar resposta removendo markdown e formatação extra
    const cleanResponse = cleanAIResponse(response)
    
    return JSON.parse(cleanResponse) as AIAnalysis
  } catch (error: unknown) {
    console.error('Erro na análise de IA:', error)
    
    // Tratamento específico para erro de API key
    if (error && typeof error === 'object' && 'message' in error) {
      const errorMessage = (error as Error).message
      if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
        console.error('🔑 Chave da API DeepSeek (OpenRouter) inválida. Verifique sua configuração em .env.local')
      }
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
  if (!isDeepSeekConfigured()) {
    return 'Para usar o gerador de mensagens com IA, configure sua chave da API DeepSeek (OpenRouter) no arquivo .env.local'
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
    const response = await callDeepSeekAPI([
      { role: 'user', content: prompt }
    ], 0.8)

    return response || 'Erro ao gerar mensagem'
  } catch (error) {
    console.error('Erro ao gerar mensagem:', error)
    if (error && typeof error === 'object' && 'message' in error) {
      const errorMessage = (error as Error).message
      if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
        return 'Erro: Chave da API DeepSeek (OpenRouter) inválida. Verifique sua configuração.'
      }
    }
    return 'Erro ao gerar mensagem. Verifique sua configuração da API.'
  }
}

export async function searchClients(query: string, clients: ClientSearchData[]): Promise<ClientSearchData[]> {
  if (!query || clients.length === 0) return clients

  // Verificar se a API está configurada
  if (!isDeepSeekConfigured()) {
    console.warn('⚠️  API DeepSeek (OpenRouter) não configurada. Usando busca simples.')
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

IMPORTANTE: Responda APENAS com um array JSON válido, sem formatação markdown, sem \`\`\`json, apenas o array puro:
["id1", "id2", "id3"]

Se nenhum cliente for relevante, retorne: []
`

  try {
    const response = await callDeepSeekAPI([
      { role: 'user', content: prompt }
    ], 0.3)

    if (!response) return clients

    // Limpar resposta removendo markdown e formatação extra
    const cleanResponse = cleanAIResponse(response)

    const relevantIds = JSON.parse(cleanResponse) as string[]
    return clients.filter(c => relevantIds.includes(c.id))
  } catch (error) {
    console.error('Erro na busca inteligente:', error)
    if (error && typeof error === 'object' && 'message' in error) {
      const errorMessage = (error as Error).message
      if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
        console.error('🔑 Chave da API DeepSeek (OpenRouter) inválida. Verifique sua configuração em .env.local')
      }
    }
    // Fallback para busca simples
    return clients.filter(c => 
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.email.toLowerCase().includes(query.toLowerCase()) ||
      (c.notes && c.notes.toLowerCase().includes(query.toLowerCase()))
    )
  }
}
