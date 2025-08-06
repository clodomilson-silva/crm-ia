import { NextRequest, NextResponse } from 'next/server'
import { getTokensFromCode } from '@/lib/calendar-fixed'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      // Redirecionar com erro
      return new NextResponse(
        `<html><body><script>
          if (window.opener) {
            window.opener.postMessage({
              type: 'GOOGLE_OAUTH_ERROR',
              error: '${error}'
            }, window.location.origin);
            window.close();
          }
        </script></body></html>`,
        {
          headers: { 'Content-Type': 'text/html' },
        }
      )
    }

    if (!code) {
      return new NextResponse(
        `<html><body><script>
          if (window.opener) {
            window.opener.postMessage({
              type: 'GOOGLE_OAUTH_ERROR',
              error: 'Código de autorização não fornecido'
            }, window.location.origin);
            window.close();
          }
        </script></body></html>`,
        {
          headers: { 'Content-Type': 'text/html' },
        }
      )
    }

    const tokens = await getTokensFromCode(code)

    if (tokens) {
      // Sucesso - enviar tokens para a janela pai
      return new NextResponse(
        `<html><body><script>
          if (window.opener) {
            window.opener.postMessage({
              type: 'GOOGLE_OAUTH_SUCCESS',
              access_token: '${tokens.access_token}',
              refresh_token: '${tokens.refresh_token || ''}'
            }, window.location.origin);
            window.close();
          }
        </script></body></html>`,
        {
          headers: { 'Content-Type': 'text/html' },
        }
      )
    } else {
      return new NextResponse(
        `<html><body><script>
          if (window.opener) {
            window.opener.postMessage({
              type: 'GOOGLE_OAUTH_ERROR',
              error: 'Erro ao obter tokens de acesso'
            }, window.location.origin);
            window.close();
          }
        </script></body></html>`,
        {
          headers: { 'Content-Type': 'text/html' },
        }
      )
    }
  } catch (error) {
    console.error('Erro no callback OAuth:', error)
    return new NextResponse(
      `<html><body><script>
        if (window.opener) {
          window.opener.postMessage({
            type: 'GOOGLE_OAUTH_ERROR',
            error: 'Erro interno do servidor'
          }, window.location.origin);
          window.close();
        }
      </script></body></html>`,
      {
        headers: { 'Content-Type': 'text/html' },
      }
    )
  }
}
