import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta-aqui'

export interface AuthRequest extends NextRequest {
  userId?: string
  userRole?: string
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; role: string }
  } catch {
    return null
  }
}

export function extractUserFromRequest(req: NextRequest): { userId: string; role: string } | null {
  const authHeader = req.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  return verifyToken(token)
}

export function requireAuth(handler: (req: NextRequest & { userId: string; userRole: string }) => Promise<Response>) {
  return async (req: NextRequest) => {
    const user = extractUserFromRequest(req)
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Token inválido ou ausente' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const authenticatedReq = req as NextRequest & { userId: string; userRole: string }
    authenticatedReq.userId = user.userId
    authenticatedReq.userRole = user.role

    return handler(authenticatedReq)
  }
}

export function requireAdmin(handler: (req: NextRequest & { userId: string; userRole: string }) => Promise<Response>) {
  return async (req: NextRequest) => {
    const user = extractUserFromRequest(req)
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Token inválido ou ausente' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Acesso negado. Apenas administradores.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const authenticatedReq = req as NextRequest & { userId: string; userRole: string }
    authenticatedReq.userId = user.userId
    authenticatedReq.userRole = user.role

    return handler(authenticatedReq)
  }
}
