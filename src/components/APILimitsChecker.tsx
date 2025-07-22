'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'

export default function APILimitsChecker() {
  const [isChecking, setIsChecking] = useState(false)
  const [lastCheck, setLastCheck] = useState<string | null>(null)

  const checkLimits = async () => {
    setIsChecking(true)
    try {
      const response = await fetch('/api/check-limits')
      if (response.ok) {
        setLastCheck(new Date().toLocaleString('pt-BR'))
        alert('✅ Verificação concluída! Verifique o terminal para ver os detalhes dos limites e créditos.')
      } else {
        alert('❌ Erro ao verificar limites. Tente novamente.')
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('💥 Erro de conexão ao verificar limites.')
    }
    setIsChecking(false)
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        🔍 Verificar Limites das APIs
      </h3>
      
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Verifique os créditos restantes e limites de taxa das suas APIs OpenRouter.
        </p>
        
        {lastCheck && (
          <p className="text-xs text-gray-500">
            📅 Última verificação: {lastCheck}
          </p>
        )}
        
        <button
          onClick={checkLimits}
          disabled={isChecking}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            isChecking
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600 active:transform active:scale-95'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
          {isChecking ? 'Verificando...' : 'Verificar Limites'}
        </button>
        
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          <p className="font-medium mb-1">💡 O que será verificado:</p>
          <ul className="space-y-1">
            <li>• 💰 Créditos usados vs. limite</li>
            <li>• ⚡ Limites de taxa (requests/minuto)</li>
            <li>• 🆓 Status do tier gratuito</li>
            <li>• 📈 Porcentagem de uso</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
