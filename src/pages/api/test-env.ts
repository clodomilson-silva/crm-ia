import { NextApiRequest, NextApiResponse } from 'next'
import { checkVertexAICredentials } from '@/lib/vertex-ai'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ⚠️ ATENÇÃO: Este endpoint é só para debug - REMOVER em produção!
  
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ 
      error: 'Endpoint de debug não disponível em produção' 
    })
  }

  // Verificar status da Google AI em tempo real
  let googleAIStatus = '❌ Erro desconhecido'
  let googleAIResponseTime = 0
  
  try {
    const startTime = Date.now()
    const isWorking = await checkVertexAICredentials()
    googleAIResponseTime = Date.now() - startTime
    googleAIStatus = isWorking ? '✅ Funcionando' : '⚠️ Não respondeu corretamente'
  } catch (error) {
    googleAIStatus = `❌ Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`
  }

  const envStatus = {
    nodeEnv: process.env.NODE_ENV,
    hasGoogleAIKey: !!process.env.GOOGLE_AI_API_KEY,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    hasDirectUrl: !!process.env.DIRECT_URL,
    
    // Status em tempo real da Google AI
    googleAIStatus,
    googleAIResponseTime: `${googleAIResponseTime}ms`,
    
    // Mostrar apenas os primeiros e últimos caracteres para segurança
    googleAIKeyPreview: process.env.GOOGLE_AI_API_KEY ? 
      `${process.env.GOOGLE_AI_API_KEY.substring(0, 12)}...${process.env.GOOGLE_AI_API_KEY.slice(-8)}` : 
      'Não configurada',
      
    databaseUrlPreview: process.env.DATABASE_URL ? 
      `postgresql://postgres...${process.env.DATABASE_URL.slice(-20)}` : 
      'Não configurada',
  }

  res.status(200).json({
    message: '🔍 Status das APIs e Ambiente',
    timestamp: new Date().toISOString(),
    ...envStatus
  })
}
