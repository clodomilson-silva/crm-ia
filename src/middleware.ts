import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Middleware temporariamente desabilitado para debug
export function middleware(_request: NextRequest) {
  // Simplesmente passar todas as requisições sem processamento
  return NextResponse.next()
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
}
