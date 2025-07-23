import { NextResponse } from 'next/server'

// Middleware temporariamente desabilitado para debug
export function middleware() {
  // Simplesmente passar todas as requisições sem processamento
  return NextResponse.next()
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
}
