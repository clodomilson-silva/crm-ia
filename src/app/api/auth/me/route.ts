import { NextResponse } from 'next/server'
import { extractUserFromRequest } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { NextRequest } from 'next/server'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    const user = extractUserFromRequest(req)

    if (!user) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    // Se for usuário demo admin, retornar diretamente
    if (user.userId === 'demo-admin-123') {
      return NextResponse.json({
        user: {
          id: user.userId,
          name: user.name || 'Admin Demo',
          email: user.email || 'admin@clientpulse.com',
          role: user.role,
          plan: user.plan || 'PREMIUM'
        }
      })
    }

    // Buscar dados atualizados do usuário no banco
    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })

    if (!userData) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      user: {
        ...userData,
        plan: user.role === 'admin' ? 'PREMIUM' : 'FREE'
      }
    })

  } catch (error) {
    console.error('Erro ao verificar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
