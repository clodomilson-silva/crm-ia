import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CreateTaskData } from '@/types/crm'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')

    const where: {
      clientId?: string
      status?: string
      priority?: string
    } = {}
    
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

export async function POST(request: Request) {
  try {
    const data: CreateTaskData = await request.json()

    if (!data.clientId || !data.title || !data.type) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: clientId, title, type' },
        { status: 400 }
      )
    }

    const task = await prisma.task.create({
      data,
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
