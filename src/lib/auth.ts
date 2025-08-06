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

export interface UserAuth {
  userId: string
  role: 'admin' | 'user'
  plan?: 'FREE' | 'PRO' | 'PREMIUM'
  email?: string
  name?: string
}

export function extractUserFromRequest(req: NextRequest): UserAuth | null {
  const authHeader = req.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null // Não retornar usuário se não houver token válido
  }

  const token = authHeader.substring(7)
  const decoded = verifyToken(token)
  
  if (!decoded) return null
  
  // Verificar se é o token especial do admin
  if (decoded.userId === 'demo-admin-123') {
    return {
      userId: 'demo-admin-123',
      role: 'admin',
      plan: 'PREMIUM',
      email: 'admin@clientpulse.com',
      name: 'Admin Demo'
    }
  }
  
  return {
    userId: decoded.userId,
    role: decoded.role as 'admin' | 'user',
    plan: 'FREE' // Por padrão, usuários regulares começam no plano FREE
  }
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
