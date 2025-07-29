import { ClientSearchData } from '@/types/crm'

// Configuração do Google Generative AI (aceita API Key direta)
const API_KEY = process.env.GOOGLE_AI_API_KEY
const MODEL = 'gemini-1.5-flash'

if (!API_KEY) {
  throw new Error('GOOGLE_AI_API_KEY não configurada nas variáveis de ambiente')
}

console.log('🔧 Google Generative AI configurado:', {
  hasApiKey: !!API_KEY,
  model: MODEL
})

// Função principal para chamar Google Generative AI (exportada)
export async function callGoogleAI(prompt: string): Promise<string> {
  try {
    console.log('🤖 Chamando Google Generative AI...')
    
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`
    
    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1024
      }
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erro HTTP Google AI:', response.status, response.statusText)
      console.error('❌ Detalhes:', errorText)
      throw new Error(`Google AI error: ${response.status} - ${response.statusText}`)
    }

    const data = await response.json()
    console.log('📥 Resposta Google AI recebida')

    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
      const content = data.candidates[0].content.parts[0].text
      console.log('✅ Conteúdo extraído com sucesso')
      return content
    } else {
      console.error('❌ Formato inesperado na resposta:', data)
      throw new Error('Formato de resposta inesperado do Google AI')
    }
  } catch (error) {
    console.error('❌ Erro ao chamar Google AI:', error)
    throw error
  }
}

// Função para verificar se as credenciais estão funcionando
export async function checkVertexAICredentials(): Promise<boolean> {
  try {
    console.log('🔍 Testando conexão com Google AI...')
    
    const testPrompt = "Responda apenas 'OK' se você está funcionando."
    const response = await callGoogleAI(testPrompt)
    
    if (response && response.toLowerCase().includes('ok')) {
      console.log('✅ Google AI funcionando corretamente')
      return true
    } else {
      console.log('⚠️ Resposta inesperada:', response)
      return false
    }
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error)
    return false
  }
}

// Função para gerar mensagens de IA
export async function generateAIMessage(
  clientName: string,
  messageType: 'email' | 'whatsapp' | 'proposal',
  context: string,
  tone: 'formal' | 'casual' | 'friendly' = 'friendly'
): Promise<string> {
  
  const prompts = {
    email: `Crie um email ${tone} para o cliente ${clientName}. Contexto: ${context}. 
    
    Instruções:
    - Use assunto atrativo
    - Seja profissional mas ${tone}
    - Inclua chamada para ação
    - Formate como email completo`,
    
    whatsapp: `Crie uma mensagem de WhatsApp ${tone} para ${clientName}. Contexto: ${context}. 
    
    Instruções:
    - Seja direto e objetivo
    - Use linguagem ${tone}
    - Máximo 3 parágrafos
    - Inclua emojis apropriados se o tom for casual ou friendly`,
    
    proposal: `Crie uma proposta comercial ${tone} para ${clientName}. Contexto: ${context}. 
    
    Instruções:
    - Estruture como proposta profissional
    - Identifique problemas e soluções
    - Inclua benefícios claros
    - Termine com próximos passos`
  }

  if (!prompts[messageType]) {
    throw new Error(`Tipo de mensagem inválido: ${messageType}`)
  }

  try {
    const prompt = prompts[messageType]
    const response = await callGoogleAI(prompt)
    
    return response
    
  } catch (error) {
    console.error('❌ Erro ao gerar mensagem:', error)
    throw new Error('Falha ao gerar mensagem com IA')
  }
}

// Função para buscar clientes similares
export async function searchSimilarClients(searchTerm: string, clients: ClientSearchData[]): Promise<ClientSearchData[]> {
  if (!searchTerm.trim() || clients.length === 0) {
    return []
  }

  const clientsInfo = clients.map(client => 
    `ID: ${client.id}, Nome: ${client.name}, Email: ${client.email}, Tipo: ${client.clientType}`
  ).join('\n')

  const prompt = `Analise esta lista de clientes e encontre os mais relevantes para a busca "${searchTerm}":

${clientsInfo}

Retorne apenas os IDs dos clientes mais relevantes, separados por vírgula.
Considere similaridade de nomes, contexto de negócio, e tipo de cliente.
Se não encontrar relevância, retorne "NENHUM".`

    const response = await callGoogleAI(prompt)
    
    // Processar resposta da IA
    if (response.toUpperCase().includes('NENHUM')) {
      return []
    }
    
    const relevantIds = response
      .split(',')
      .map(id => id.trim())
      .filter(id => id)

    return clients.filter(client => relevantIds.includes(client.id))
  
}

// Função para análise de sentimento
export async function analyzeSentiment(message: string): Promise<{
  sentiment: 'positive' | 'negative' | 'neutral'
  confidence: number
  keywords: string[]
}> {
  const prompt = `Analise o sentimento desta mensagem: "${message}"

Retorne um JSON com:
{
  "sentiment": "positive/negative/neutral",
  "confidence": 0.0-1.0,
  "keywords": ["palavra1", "palavra2"]
}

Foque em:
- Tom emocional
- Satisfação aparente
- Intenção de compra
- Preocupações ou objeções`

    const response = await callGoogleAI(prompt)
    
    try {
      const analysis = JSON.parse(response)
      return analysis
    } catch {
      // Fallback se não conseguir parsear JSON
      return {
        sentiment: 'neutral',
        confidence: 0.5,
        keywords: []
      }
    }
}

// Função para busca de clientes com IA (alias para compatibilidade)
export async function searchClientsWithAI(searchTerm: string, clients: ClientSearchData[]): Promise<ClientSearchData[]> {
  return searchSimilarClients(searchTerm, clients)
}

// Função para análise de clientes (alias para compatibilidade)
export async function analyzeClient(clientData: {
  name: string
  email?: string
  phone?: string
  notes?: string
  company?: string
  segment?: string
  lastInteraction?: string
  messageHistory?: string[]
  interactionHistory?: string[]
}) {
  // Converter para o formato esperado pela função analyzeLeadPotential
  const leadData = {
    name: clientData.name,
    company: clientData.company || 'Não informado',
    segment: clientData.segment || 'Não informado',
    lastInteraction: clientData.lastInteraction || 'Não informado',
    messageHistory: clientData.messageHistory || clientData.interactionHistory || []
  }
  
  const analysis = await analyzeLeadPotential(leadData)
  
  // Retornar no formato esperado pelo sistema
  return {
    leadScore: analysis.score,
    nextAction: analysis.recommendedAction,
    actionPriority: analysis.priority,
    reasoning: analysis.reasoning
  }
}

// Função de análise avançada de leads
export async function analyzeLeadPotential(
  clientData: {
    name: string
    company: string
    segment: string
    lastInteraction: string
    messageHistory: string[]
  }
): Promise<{
  score: number
  priority: 'high' | 'medium' | 'low'
  recommendedAction: string
  reasoning: string
}> {
  
  const prompt = `Analise este lead e determine seu potencial:

Cliente: ${clientData.name}
Empresa: ${clientData.company}
Segmento: ${clientData.segment}
Última Interação: ${clientData.lastInteraction}
Histórico de Mensagens: ${clientData.messageHistory.join('; ')}

Retorne um JSON exato neste formato:
{
  "score": 0-100,
  "priority": "high/medium/low",
  "recommendedAction": "ação específica recomendada",
  "reasoning": "breve explicação do score e ação"
}
`

    const response = await callGoogleAI(prompt)

    if (!response) {
      throw new Error('Resposta vazia da API Google AI')
    }

    console.log('🤖 Análise gerada por: Google AI')
    console.log('📝 Resposta bruta:', response)

    try {
      // Tentar extrair JSON da resposta
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0])
        
        // Validar e normalizar os dados
        return {
          score: Math.min(Math.max(Number(analysis.score) || 50, 0), 100),
          priority: (['high', 'medium', 'low'].includes(analysis.priority)) ? analysis.priority : 'medium',
          recommendedAction: analysis.recommendedAction || 'Continuar acompanhamento',
          reasoning: analysis.reasoning || 'Análise baseada nos dados fornecidos'
        }
      } else {
        throw new Error('JSON não encontrado na resposta')
      }
    } catch (parseError) {
      console.error('❌ Erro ao processar resposta da IA:', parseError)
      console.error('📝 Resposta original:', response)
      
      // Fallback com análise básica
      return {
        score: 50,
        priority: 'medium',
        recommendedAction: 'Revisar dados do cliente e fazer follow-up',
        reasoning: 'Análise automática devido a erro no processamento da resposta da IA'
      }
    }
}
