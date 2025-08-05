import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { searchClientsWithAI } from '@/lib/vertex-ai'
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
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json(
        { error: 'Parâmetro de busca obrigatório' },
        { status: 400 }
      )
    }

    // Buscar todos os clientes do usuário primeiro
    const allClients = await prisma.client.findMany({
      where: {
        // @ts-expect-error userId será reconhecido após regeneração completa do Prisma
        userId: user.userId
      },
      select: {
        id: true,
        name: true,
        email: true,
        clientType: true,
        notes: true,
      },
    })

    // Usar IA para busca semântica
    const relevantClients = await searchClientsWithAI(query, allClients)

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
