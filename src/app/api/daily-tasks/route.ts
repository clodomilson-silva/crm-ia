import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { convertToDateTime } from '@/lib/dateUtils'
import { extractUserFromRequest } from '@/lib/auth'

// Configuração da API OpenRouter (DeepSeek)
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const DEEPSEEK_MODEL = 'deepseek/deepseek-chat'

// Função para verificar se a API key está configurada
function isDeepSeekConfigured(): boolean {
  return !!process.env.DEEPSEEK_API_KEY && process.env.DEEPSEEK_API_KEY !== 'YOUR_DEEPSEEK_API_KEY'
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
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'CRM com IA',
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

// Simular banco de dados de tarefas existentes para análise de histórico
const getExistingTasksForClient = async (clientId: string) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
      take: 5, // Últimas 5 tarefas para análise
    })
    return tasks.map(task => ({
      title: task.title,
      type: task.type,
      dueDate: task.dueDate,
    }))
  } catch {
    return []
  }
}

export async function POST(request: NextRequest) {
  try {
    let targetClientId = null
    
    // Tentar ler o corpo da requisição, mas tratar como opcional
    try {
      const body = await request.json()
      targetClientId = body?.clientId || null
    } catch {
      // Se não conseguir parsear o JSON, continuar sem clientId (gerar para todos)
      targetClientId = null
    }

    // Buscar clientes do banco de dados
    const clients = await prisma.client.findMany({
      where: targetClientId ? { id: targetClientId } : {},
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        clientType: true,
        leadScore: true,
        notes: true,
      },
    })

    if (clients.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Nenhum cliente encontrado para gerar tarefas',
        tasks: []
      })
    }

    const generatedTasks = []

    for (const client of clients) {
      try {
        // Analisar histórico de tarefas do cliente
        const clientTasks = await getExistingTasksForClient(client.id)
        
        // Obter data atual formatada
        const today = new Date()
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        const dayAfterTomorrow = new Date(today)
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)
        
        const formatDate = (date: Date) => date.toISOString().split('T')[0]
        
        // Prompt para a IA gerar tarefas personalizadas
        const prompt = `Como assistente de CRM inteligente, gere 2-3 tarefas diárias relevantes para o seguinte cliente:

Nome: ${client.name}
Email: ${client.email}
Telefone: ${client.phone || 'Não informado'}
Tipo de cliente: ${client.clientType}
Lead Score: ${client.leadScore}/100
Notas: ${client.notes || 'Nenhuma nota adicional'}

Histórico de tarefas recentes:
${clientTasks.map(task => `- ${task.title} (${task.type})`).join('\n') || 'Nenhuma tarefa anterior'}

IMPORTANTE: Data atual é ${formatDate(today)}. Use APENAS as seguintes datas para vencimento:
- ${formatDate(tomorrow)} (amanhã - para tarefas urgentes)
- ${formatDate(dayAfterTomorrow)} (depois de amanhã - para tarefas normais)

CRITÉRIOS DE PRIORIZAÇÃO:
- HIGH (alta): Lead Score ≥ 80, clientes "customer" com oportunidades de upsell, prospects quentes, situações urgentes
- MEDIUM (média): Lead Score 40-79, clientes "lead" ativos, follow-ups importantes, reuniões agendadas
- LOW (baixa): Lead Score < 40, clientes "prospect" iniciais, tarefas administrativas, envio de materiais

Gere tarefas que sejam:
1. Específicas e acionáveis
2. Apropriadas para o relacionamento comercial
3. Variadas (ligações, emails, reuniões, follow-ups)
4. Com prazos realistas (use APENAS as datas fornecidas acima)
5. Priorizadas de acordo com os critérios acima

Formato de resposta (JSON):
{
  "tasks": [
    {
      "title": "Título da tarefa",
      "description": "Descrição detalhada",
      "type": "call|email|meeting|follow-up",
      "priority": "high|medium|low",
      "dueDate": "${formatDate(tomorrow)}|${formatDate(dayAfterTomorrow)}",
      "estimatedDuration": "30 min"
    }
  ]
}`

        const completion = await callDeepSeekAPI([
          {
            role: "system",
            content: "Você é um assistente de CRM especializado em gerar tarefas comerciais relevantes e personalizadas."
          },
          {
            role: "user",
            content: prompt
          }
        ], 0.7)

        const aiResponse = completion
        if (aiResponse) {
          try {
            // Limpar resposta da IA
            let cleanedResponse = aiResponse.trim()
            if (cleanedResponse.includes('```json')) {
              cleanedResponse = cleanedResponse.replace(/```json\s*/, '').replace(/```\s*$/, '')
            }
            cleanedResponse = cleanedResponse.replace(/```\s*/, '').replace(/`/g, '').trim()
            
            const parsedResponse = JSON.parse(cleanedResponse)
            if (parsedResponse.tasks && Array.isArray(parsedResponse.tasks)) {
              for (const task of parsedResponse.tasks) {
                // Validar e corrigir data se necessário
                let taskDueDate = convertToDateTime(task.dueDate)
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                
                // Se a data é passada ou inválida, usar amanhã como padrão
                if (!taskDueDate || taskDueDate < today) {
                  console.log(`Data inválida ou passada detectada: ${task.dueDate}, corrigindo para amanhã`)
                  const tomorrow = new Date()
                  tomorrow.setDate(tomorrow.getDate() + 1)
                  tomorrow.setHours(9, 0, 0, 0)
                  taskDueDate = tomorrow
                }
                
                // Validar e corrigir prioridade baseada no Lead Score se necessário
                let taskPriority = task.priority
                if (!taskPriority || !['high', 'medium', 'low'].includes(taskPriority)) {
                  if (client.leadScore >= 80 || client.clientType === 'customer') {
                    taskPriority = 'high'
                  } else if (client.leadScore >= 40 || client.clientType === 'lead') {
                    taskPriority = 'medium'
                  } else {
                    taskPriority = 'low'
                  }
                  console.log(`Prioridade ajustada para ${taskPriority} baseada no Lead Score ${client.leadScore} e tipo ${client.clientType}`)
                }
                
                // Salvar a tarefa no banco de dados
                const createdTask = await prisma.task.create({
                  data: {
                    title: task.title,
                    description: task.description || '',
                    type: task.type,
                    priority: taskPriority,
                    status: 'pending',
                    dueDate: taskDueDate,
                    aiSuggested: true,
                    clientId: client.id,
                  },
                  include: {
                    client: {
                      select: {
                        id: true,
                        name: true,
                        email: true,
                      },
                    },
                  },
                })

                generatedTasks.push({
                  ...createdTask,
                  estimatedDuration: task.estimatedDuration,
                  source: 'ai-daily-suggestion'
                })
              }
            }
          } catch (parseError) {
            console.error('Erro ao parsear resposta da IA:', parseError)
            // Fallback: criar tarefas genéricas
            const fallbackTasks = await generateFallbackTasks(client)
            generatedTasks.push(...fallbackTasks)
          }
        }
      } catch (error) {
        console.error(`Erro ao gerar tarefas para ${client.name}:`, error)
        // Fallback: criar tarefas genéricas
        const fallbackTasks = await generateFallbackTasks(client)
        generatedTasks.push(...fallbackTasks)
      }
    }

    return NextResponse.json({
      success: true,
      message: `${generatedTasks.length} tarefas diárias geradas e salvas com sucesso`,
      tasks: generatedTasks,
      clientsProcessed: clients.length
    })

  } catch (error) {
    console.error('Erro ao gerar tarefas diárias:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

// Função para gerar tarefas genéricas como fallback
async function generateFallbackTasks(client: {
  id: string
  name: string
  email: string
  phone: string | null
  clientType: string
  leadScore: number
  notes: string | null
}) {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  const dayAfterTomorrow = new Date()
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)

  // Determinar prioridade baseada no Lead Score e tipo de cliente
  const getPriority = () => {
    if (client.leadScore >= 80 || client.clientType === 'customer') return 'high'
    if (client.leadScore >= 40 || client.clientType === 'lead') return 'medium'
    return 'low'
  }

  const fallbackTasks = [
    {
      title: `Follow-up com ${client.name}`,
      description: `Entrar em contato para verificar interesse em nossos serviços`,
      type: 'call',
      priority: getPriority(),
      status: 'pending',
      dueDate: tomorrow,
      aiSuggested: true,
      clientId: client.id,
    },
    {
      title: `Enviar material comercial para ${client.name}`,
      description: `Preparar e enviar material comercial personalizado baseado no perfil ${client.clientType}`,
      type: 'email',
      priority: client.clientType === 'customer' ? 'high' : 'medium',
      status: 'pending',
      dueDate: dayAfterTomorrow,
      aiSuggested: true,
      clientId: client.id,
    }
  ]

  const createdTasks = []
  for (const taskData of fallbackTasks) {
    try {
      const createdTask = await prisma.task.create({
        data: taskData,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })
      createdTasks.push({
        ...createdTask,
        estimatedDuration: '20 min',
        source: 'ai-daily-suggestion-fallback'
      })
    } catch (error) {
      console.error('Erro ao criar tarefa fallback:', error)
    }
  }

  return createdTasks
}

// Endpoint GET para verificar status ou listar últimas tarefas geradas
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const user = extractUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const clientsCount = await prisma.client.count({
      where: {
        // @ts-expect-error userId será reconhecido após regeneração completa do Prisma
        userId: user.userId
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'API de tarefas diárias ativa',
      availableClients: clientsCount,
      lastRun: new Date().toISOString(),
      features: [
        'Geração automática de tarefas por IA',
        'Personalização baseada em histórico',
        'Suporte a múltiplos tipos de tarefa',
        'Fallback para tarefas genéricas',
        'Integração com banco de dados'
      ]
    })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Erro ao verificar status' },
      { status: 500 }
    )
  }
}
