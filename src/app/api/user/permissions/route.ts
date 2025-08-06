import { NextRequest, NextResponse } from 'next/server'
import { extractUserFromRequest } from '@/lib/auth'
import { getFeatureAccess } from '@/lib/permissions'

export async function GET(request: NextRequest) {
  try {
    const user = extractUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const featureAccess = getFeatureAccess(user)

    return NextResponse.json({
      success: true,
      user: {
        id: user.userId,
        role: user.role,
        plan: user.plan || 'FREE',
        email: user.email,
        name: user.name
      },
      features: featureAccess,
      billing: {
        canUpgrade: user.role !== 'admin',
        currentPlan: user.plan || 'FREE',
        availablePlans: user.role === 'admin' ? [] : ['PRO', 'PREMIUM']
      }
    })

  } catch (error) {
    console.error('Erro ao verificar permissões:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
