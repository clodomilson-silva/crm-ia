import { NextResponse } from 'next/server'
import { checkVertexAICredentials } from '@/lib/vertex-ai'

export async function GET() {
  try {
    console.log('🔍 Verificação de credenciais Google Cloud solicitada via API...')
    const isValid = await checkVertexAICredentials()
    
    return NextResponse.json({ 
      message: isValid ? 'Credenciais Google Cloud válidas' : 'Problema com credenciais Google Cloud',
      isValid,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erro ao verificar credenciais:', error)
    return NextResponse.json(
      { error: 'Erro ao verificar credenciais Google Cloud' },
      { status: 500 }
    )
  }
}
