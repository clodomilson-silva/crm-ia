import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CreateTaskData } from '@/types/crm'
import { convertToDateTime } from '@/lib/dateUtils'
import { extractUserFromRequest } from '@/lib/auth'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const user = extractUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')

    const where: {
      userId: string
      clientId?: string
      status?: string
      priority?: string
    } = {
      userId: user.userId // Filtrar apenas tarefas do usuário logado
    }
    
    if (clientId) where.clientId = clientId
    if (status) where.status = status
    if (priority) where.priority = priority

    const tasks = await prisma.task.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    })

    return NextResponse.json({ tasks })
  } catch (error) {
    console.error('Erro ao buscar tarefas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const user = extractUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const data: CreateTaskData = await request.json()

    if (!data.clientId || !data.title || !data.type) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: clientId, title, type' },
        { status: 400 }
      )
    }

    // Converter dueDate ou usar data padrão
    let dueDate: Date
    if (data.dueDate) {
      const convertedDate = convertToDateTime(data.dueDate)
      dueDate = convertedDate || new Date(Date.now() + 24 * 60 * 60 * 1000) // +1 dia se conversão falhar
    } else {
      dueDate = new Date(Date.now() + 24 * 60 * 60 * 1000) // +1 dia por padrão
    }

    const task = await prisma.task.create({
      data: {
        clientId: data.clientId,
        // @ts-expect-error userId será reconhecido após regeneração completa do Prisma
        userId: user.userId, // Associar tarefa ao usuário
        title: data.title,
        description: data.description || '',
        type: data.type,
        priority: data.priority || 'medium',
        dueDate,
        aiSuggested: data.aiSuggested || false,
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

    return NextResponse.json({ task })
  } catch (error) {
    console.error('Erro ao criar tarefa:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
