import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CreateInteractionData } from '@/types/crm'
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
    const type = searchParams.get('type')

    const where: {
      userId: string
      clientId?: string
      type?: string
    } = {
      userId: user.userId // Filtrar apenas interações do usuário logado
    }
    
    if (clientId) where.clientId = clientId
    if (type) where.type = type

    const interactions = await prisma.interaction.findMany({
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
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ interactions })
  } catch (error) {
    console.error('Erro ao buscar interações:', error)
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

    const data: CreateInteractionData = await request.json()

    if (!data.clientId || !data.type || !data.content) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: clientId, type, content' },
        { status: 400 }
      )
    }

    // Filtrar campos que existem no modelo Prisma
    const prismaData = {
      clientId: data.clientId,
      userId: user.userId, // Associar interação ao usuário
      type: data.type,
      content: data.content,
      outcome: data.outcome,
      nextAction: data.nextAction
    }

    const interaction = await prisma.interaction.create({
      data: {
        clientId: prismaData.clientId,
        // @ts-expect-error userId será reconhecido após regeneração completa do Prisma
        userId: prismaData.userId,
        type: prismaData.type,
        content: prismaData.content,
        outcome: prismaData.outcome,
        nextAction: prismaData.nextAction
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

    return NextResponse.json({ interaction })
  } catch (error) {
    console.error('Erro ao criar interação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
