import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CreateInteractionData } from '@/types/crm'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const type = searchParams.get('type')

    const where: {
      clientId?: string
      type?: string
    } = {}
    
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

export async function POST(request: Request) {
  try {
    const data: CreateInteractionData = await request.json()

    if (!data.clientId || !data.type || !data.content) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: clientId, type, content' },
        { status: 400 }
      )
    }

    const interaction = await prisma.interaction.create({
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

    return NextResponse.json({ interaction })
  } catch (error) {
    console.error('Erro ao criar interação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
