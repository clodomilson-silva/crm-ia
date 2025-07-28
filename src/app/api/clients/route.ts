import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { analyzeClient } from '@/lib/vertex-ai'
import { CreateClientData } from '@/types/crm'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const type = searchParams.get('type')
    const status = searchParams.get('status')

    const where: {
      OR?: Array<{
        name?: { contains: string; mode: 'insensitive' }
        email?: { contains: string; mode: 'insensitive' }
        notes?: { contains: string; mode: 'insensitive' }
      }>
      clientType?: string
      status?: string
    } = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
      ]
    }
    
    if (type) where.clientType = type
    if (status) where.status = status

    const clients = await prisma.client.findMany({
      where,
      include: {
        interactions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        tasks: {
          where: { status: 'pending' },
          orderBy: { dueDate: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({ clients })
  } catch (error) {
    console.error('Erro ao buscar clientes:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data: CreateClientData = await request.json()

    // Validação básica
    if (!data.name || !data.email) {
      return NextResponse.json(
        { error: 'Nome e email são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se email já existe
    const existingClient = await prisma.client.findUnique({
      where: { email: data.email },
    })

    if (existingClient) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 400 }
      )
    }

    // Análise de IA para lead scoring
    const analysis = await analyzeClient({
      name: data.name,
      email: data.email,
      phone: data.phone,
      notes: data.notes,
    })

    // Criar cliente
    const client = await prisma.client.create({
      data: {
        ...data,
        leadScore: analysis.leadScore,
      },
      include: {
        interactions: true,
        tasks: true,
      },
    })

    // Criar tarefa sugerida pela IA
    if (analysis.nextAction) {
      // Definir data de vencimento baseada na prioridade
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(9, 0, 0, 0) // 9h da manhã
      
      const dayAfterTomorrow = new Date()
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)
      dayAfterTomorrow.setHours(9, 0, 0, 0) // 9h da manhã
      
      // Determinar data de vencimento baseada na prioridade
      const dueDate = analysis.actionPriority === 'high' ? tomorrow : dayAfterTomorrow
      
      await prisma.task.create({
        data: {
          clientId: client.id,
          title: analysis.nextAction,
          description: analysis.reasoning,
          type: 'follow-up',
          priority: analysis.actionPriority,
          dueDate: dueDate,
          status: 'pending',
          aiSuggested: true,
        },
      })
    }

    return NextResponse.json({ client, analysis })
  } catch (error) {
    console.error('Erro ao criar cliente:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
