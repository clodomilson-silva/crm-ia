import { NextResponse } from 'next/server'
import { checkAllAPILimits } from '@/lib/deepseek'

export async function GET() {
  try {
    console.log('🔍 Verificação de limites solicitada via API...')
    await checkAllAPILimits()
    
    return NextResponse.json({ 
      message: 'Verificação de limites concluída. Verifique o terminal para detalhes.',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erro ao verificar limites:', error)
    return NextResponse.json(
      { error: 'Erro ao verificar limites das APIs' },
      { status: 500 }
    )
  }
}
