import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { searchClients } from '@/lib/deepseek'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json(
        { error: 'Parâmetro de busca obrigatório' },
        { status: 400 }
      )
    }

    // Buscar todos os clientes primeiro
    const allClients = await prisma.client.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        clientType: true,
        notes: true,
      },
    })

    // Usar IA para busca semântica
    const relevantClients = await searchClients(query, allClients)

    // Buscar dados completos dos clientes relevantes
    const clients = await prisma.client.findMany({
      where: {
        id: {
          in: relevantClients.map(c => c.id),
        },
      },
      include: {
        interactions: {
          orderBy: { createdAt: 'desc' },
          take: 3,
        },
        tasks: {
          where: { status: 'pending' },
          orderBy: { dueDate: 'asc' },
          take: 3,
        },
      },
    })

    return NextResponse.json({ 
      clients,
      total: clients.length,
      query 
    })
  } catch (error) {
    console.error('Erro na busca inteligente:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
