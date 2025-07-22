import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

let limitsChecked = false

export function middleware(request: NextRequest) {
  // Verificar limites apenas uma vez quando a aplicação carrega
  if (!limitsChecked && request.nextUrl.pathname === '/') {
    limitsChecked = true
    
    // Fazer verificação assíncrona sem bloquear a resposta
    fetch(`${request.nextUrl.origin}/api/check-limits`)
      .then(() => console.log('✅ Verificação automática de limites concluída'))
      .catch((error) => console.error('❌ Erro na verificação automática:', error))
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
}
