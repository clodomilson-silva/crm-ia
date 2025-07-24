import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // ⚠️ ATENÇÃO: Este endpoint é só para debug - REMOVER em produção!
  
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ 
      error: 'Endpoint de debug não disponível em produção' 
    })
  }

  const envStatus = {
    nodeEnv: process.env.NODE_ENV,
    hasKimiKey: !!process.env.KIMI_API_KEY,
    hasOpenRouterKey: !!process.env.OPENROUTER_TNG_API_KEY,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    hasDirectUrl: !!process.env.DIRECT_URL,
    
    // Mostrar apenas os primeiros e últimos caracteres para segurança
    kimiKeyPreview: process.env.KIMI_API_KEY ? 
      `${process.env.KIMI_API_KEY.substring(0, 8)}...${process.env.KIMI_API_KEY.slice(-8)}` : 
      'Não configurada',
    
    openRouterKeyPreview: process.env.OPENROUTER_TNG_API_KEY ? 
      `${process.env.OPENROUTER_TNG_API_KEY.substring(0, 8)}...${process.env.OPENROUTER_TNG_API_KEY.slice(-8)}` : 
      'Não configurada',
      
    databaseUrlPreview: process.env.DATABASE_URL ? 
      `postgresql://postgres...${process.env.DATABASE_URL.slice(-20)}` : 
      'Não configurada',
  }

  res.status(200).json({
    message: '🔍 Status das Variáveis de Ambiente',
    timestamp: new Date().toISOString(),
    ...envStatus
  })
}
