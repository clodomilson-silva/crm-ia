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

    // Buscar dados atualizados do usuário
    // @ts-expect-error - Prisma client types may be out of sync
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
      user: userData
    })

  } catch (error) {
    console.error('Erro ao verificar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
