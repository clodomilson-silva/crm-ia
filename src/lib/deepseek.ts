import { ClientSearchData } from '@/types/crm'

// Configurações das APIs com fallback
const API_CONFIGS = {
  kimi: {
    name: 'DeepSeek R1 (OpenRouter)',
    url: 'https://openrouter.ai/api/v1/chat/completions',
    model: 'deepseek/deepseek-r1',
    apiKey: process.env.KIMI_API_KEY,
    headers: {
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'CRM com IA'
    }
  },
  tng: {
    name: 'DeepSeek Chat (OpenRouter)',
    url: 'https://openrouter.ai/api/v1/chat/completions',
    model: 'deepseek/deepseek-chat',
    apiKey: process.env.OPENROUTER_TNG_API_KEY,
    headers: {
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'CRM com IA'
    }
  }
}

// Função para verificar limites e créditos de uma API key da OpenRouter
async function checkOpenRouterLimits(apiKey: string, apiName: string): Promise<void> {
  if (!apiKey || apiKey.length === 0) {
    console.log(`⏭️  ${apiName}: API key não configurada`)
    return
  }

  try {
    console.log(`🔍 Verificando limites para ${apiName}...`)
    
    const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      console.log(`❌ ${apiName}: Erro ${response.status} ao verificar limites`)
      return
    }

    const data = await response.json()
    
    // Exibir informações da chave
    console.log(`\n📊 === ${apiName} === `)
    console.log(`🔑 Chave: ${apiKey.substring(0, 12)}...`)
    
    if (data.data) {
      const keyInfo = data.data
      console.log(`💰 Créditos: $${keyInfo.usage || 0} usado de $${keyInfo.limit || 'ilimitado'}`)
      console.log(`🆓 Tier gratuito: ${keyInfo.is_free_tier ? 'Sim' : 'Não'}`)
      
      if (keyInfo.rate_limit) {
        console.log(`⚡ Rate limit: ${keyInfo.rate_limit.requests} req/${keyInfo.rate_limit.interval}`)
      }
      
      // Calcular porcentagem de uso
      if (keyInfo.limit && keyInfo.usage) {
        const usage = Number(keyInfo.usage)
        const limit = Number(keyInfo.limit)
        const percentage = ((usage / limit) * 100).toFixed(1)
        const percentageNum = Number(percentage)
        const status = percentageNum > 90 ? '🔴' : percentageNum > 70 ? '🟡' : '🟢'
        console.log(`📈 Uso: ${percentage}% ${status}`)
      }
    }
    
    console.log(`✅ ${apiName}: Verificação concluída\n`)
    
  } catch (error) {
    console.log(`💥 ${apiName}: Erro ao verificar limites - ${error}`)
  }
}

// Função para verificar limites de todas as APIs configuradas
export async function checkAllAPILimits(): Promise<void> {
  console.log('\n🚀 === VERIFICAÇÃO DE LIMITES DAS APIs ===')
  console.log('📅 Data:', new Date().toLocaleString('pt-BR'))
  console.log('=' .repeat(50))
  
  const apis = [
    { key: process.env.KIMI_API_KEY, name: 'API Principal (DeepSeek R1)' },
    { key: process.env.OPENROUTER_TNG_API_KEY, name: 'API Secundária (DeepSeek Chat)' }
  ]
  
  for (const api of apis) {
    if (api.key) {
      await checkOpenRouterLimits(api.key, api.name)
    } else {
      console.log(`⏭️  ${api.name}: Não configurada`)
    }
  }
  
  console.log('=' .repeat(50))
  console.log('🎯 Verificação completa! Sistema pronto para uso.\n')
}

export interface AIAnalysis {
  leadScore: number
  nextAction: string
  actionPriority: 'low' | 'medium' | 'high'
  reasoning: string
}

// Função para verificar se pelo menos uma API está configurada
export function isAnyAIConfigured(): boolean {
  const configs = Object.values(API_CONFIGS)
  const availableAPIs = configs.filter(config => config.apiKey && config.apiKey.length > 0)
  
  console.log('🔍 Verificando APIs disponíveis:')
  configs.forEach(config => {
    const status = config.apiKey ? '✅ Configurada' : '❌ Não configurada'
    console.log(`  ${config.name}: ${status}`)
  })
  
  if (availableAPIs.length === 0) {
    console.log('⚠️  Nenhuma API configurada. Usando fallback.')
    return false
  }
  
  console.log(`✅ ${availableAPIs.length} API(s) disponível(is) para uso`)
  return true
}

// Função para verificar se a API key está configurada e funcionando
export function isAIConfigured(): boolean {
  return isAnyAIConfigured()
}

// Função para verificar se pelo menos uma API está configurada (mantendo compatibilidade)
export function isDeepSeekConfigured(): boolean {
  return isAnyAIConfigured()
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

// Função auxiliar para fazer requisições com fallback múltiplo
async function callAIWithFallback(messages: Array<{role: string, content: string}>, temperature = 0.7): Promise<{response: string, provider: string}> {
  const apiOrder = ['kimi', 'tng'] as const
  
  for (const apiName of apiOrder) {
    const config = API_CONFIGS[apiName]
    
    if (!config.apiKey || config.apiKey.length === 0) {
      console.log(`⏭️  Pulando ${config.name} - API key não configurada`)
      continue
    }
    
    try {
      console.log(`🔄 Tentando ${config.name}...`)
      
      const response = await fetch(config.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
          ...config.headers
        },
        body: JSON.stringify({
          model: config.model,
          messages,
          temperature,
          max_tokens: 1000,
        }),
      })

      console.log(`📡 ${config.name} - Status: ${response.status}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error(`❌ ${config.name} falhou:`, errorData)
        continue // Tenta próxima API
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content || ''
      
      if (content) {
        console.log(`✅ ${config.name} - Sucesso!`)
        return { response: content, provider: config.name }
      }
      
      console.log(`⚠️  ${config.name} - Resposta vazia`)
      continue
      
    } catch (error) {
      console.error(`💥 ${config.name} - Erro de conexão:`, error)
      continue // Tenta próxima API
    }
  }
  
  throw new Error('Todas as APIs falharam')
}

export async function analyzeClient(clientData: {
  name: string
  email: string
  phone?: string
  notes?: string
  interactionHistory?: string[]
}): Promise<AIAnalysis> {
  // Verificar se a API está configurada
  if (!isAnyAIConfigured()) {
    console.warn('⚠️  Nenhuma API de IA configurada. Configure pelo menos uma chave no arquivo .env.local')
    return {
      leadScore: 50,
      nextAction: 'Configurar API de IA (DeepSeek, Groq ou OpenAI) para análise automática',
      actionPriority: 'medium',
      reasoning: 'Nenhuma API de IA configurada - usando valores padrão'
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
    const result = await callAIWithFallback([
      { role: 'user', content: prompt }
    ], 0.7)

    if (!result.response) throw new Error('Resposta vazia da IA')

    console.log(`🤖 Análise gerada por: ${result.provider}`)
    // Limpar resposta removendo markdown e formatação extra
    const cleanResponse = cleanAIResponse(result.response)
    
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
  if (!isAnyAIConfigured()) {
    return '🤖 **Sistema de Fallback Ativo**\n\n' + getFallbackMessage(messageType, clientName)
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
    const result = await callAIWithFallback([
      { role: 'user', content: prompt }
    ], 0.8)

    console.log(`🤖 Mensagem gerada por: ${result.provider}`)
    return result.response || getFallbackMessage(messageType, clientName)
  } catch (error) {
    console.error('Erro ao gerar mensagem:', error)
    return getFallbackMessage(messageType, clientName)
  }
}

// Função para gerar mensagens de fallback quando a API falha
function getFallbackMessage(messageType: string, clientName: string): string {
  const fallbackMessages = {
    'email': `Olá ${clientName},

Espero que esteja tudo bem! Estou entrando em contato para apresentar nossas soluções que podem beneficiar sua empresa.

Nossa empresa oferece soluções personalizadas de CRM e automação que podem:
• Aumentar a produtividade da sua equipe
• Melhorar o relacionamento com clientes
• Automatizar processos repetitivos
• Gerar relatórios detalhados

Gostaria de agendar uma conversa para entender melhor suas necessidades e apresentar como podemos ajudar?

Fico à disposição para qualquer esclarecimento.

Atenciosamente,
Equipe de Vendas`,

    'whatsapp': `Olá ${clientName}! 👋

Tudo bem? Sou da equipe de vendas e gostaria de apresentar nossas soluções de CRM.

Podemos ajudar sua empresa a:
✅ Organizar melhor os clientes
✅ Automatizar tarefas
✅ Aumentar vendas

Tem 15 minutos para uma conversa? 😊`,

    'proposal': `PROPOSTA COMERCIAL

Cliente: ${clientName}
Data: ${new Date().toLocaleDateString('pt-BR')}

SITUAÇÃO ATUAL
Identificamos que sua empresa pode se beneficiar de uma solução mais eficiente de gestão de relacionamento com clientes.

NOSSA SOLUÇÃO
Sistema CRM completo com:
• Gestão de contatos e leads
• Automação de tarefas
• Relatórios e analytics
• Integração com ferramentas existentes

BENEFÍCIOS
✓ Aumento de 30% na produtividade
✓ Melhoria na organização de dados
✓ Automatização de processos manuais
✓ Visão 360° dos clientes

INVESTIMENTO
Planos flexíveis a partir de R$ 299/mês
ROI médio de 300% em 6 meses

PRÓXIMOS PASSOS
1. Apresentação personalizada
2. Período de teste gratuito
3. Implementação gradual
4. Treinamento da equipe

Entre em contato para agendar uma demonstração!`,

    'call': `Roteiro para ligação - ${clientName}

1. ABERTURA
"Olá ${clientName}, aqui é [seu nome] da [empresa]. Como está? Tenho alguns minutos para conversar?"

2. APRESENTAÇÃO
"Estou entrando em contato porque nossa empresa ajuda empresas como a sua a otimizar o relacionamento com clientes."

3. DESCOBERTA
"Vocês atualmente usam algum sistema para gerenciar contatos e vendas?"
"Quais são os principais desafios na gestão de clientes?"

4. APRESENTAÇÃO DA SOLUÇÃO
"Com base no que você me contou, nosso CRM pode ajudar especificamente com..."

5. PRÓXIMOS PASSOS
"Gostaria de agendar uma demonstração de 30 minutos? Quando seria melhor para você?"

6. FECHAMENTO
"Ótimo! Vou enviar um calendário por email. Tem mais alguma dúvida?"

OBSERVAÇÕES:
- Manter tom amigável e profissional
- Ouvir mais do que falar
- Fazer perguntas abertas
- Confirmar próximos passos`
  }

  return fallbackMessages[messageType as keyof typeof fallbackMessages] || 
         `Mensagem personalizada para ${clientName} sobre nossos serviços.`
}

export async function searchClients(query: string, clients: ClientSearchData[]): Promise<ClientSearchData[]> {
  if (!query || clients.length === 0) return clients

  // Verificar se a API está configurada
  if (!isAnyAIConfigured()) {
    console.warn('⚠️  Nenhuma API de IA configurada. Usando busca simples.')
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
    const result = await callAIWithFallback([
      { role: 'user', content: prompt }
    ], 0.3)

    if (!result.response) return clients

    console.log(`🤖 Busca inteligente por: ${result.provider}`)
    // Limpar resposta removendo markdown e formatação extra
    const cleanResponse = cleanAIResponse(result.response)

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
