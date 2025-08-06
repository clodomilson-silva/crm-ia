'use client'

import { ReactNode } from 'react'
import { usePlan } from '@/contexts/PlanContext'
import { Lock, Crown, Zap } from 'lucide-react'

interface FeatureGuardProps {
  feature: 'hasAI' | 'hasAutomation' | 'hasWhatsApp' | 'hasSMS' | 'hasCalendarIntegration' | 'hasAdvancedReports' | 'hasPrioritySupport' | 'hasCustomIntegrations'
  children: ReactNode
  fallback?: ReactNode
  showUpgradePrompt?: boolean
}

export default function FeatureGuard({ 
  feature, 
  children, 
  fallback, 
  showUpgradePrompt = true 
}: FeatureGuardProps) {
  const { canUseFeature, currentPlan } = usePlan()

  if (canUseFeature(feature)) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  if (!showUpgradePrompt) {
    return null
  }

  const getFeatureName = (feature: string) => {
    const featureNames = {
      hasAI: 'IA Avançada',
      hasAutomation: 'Automações',
      hasWhatsApp: 'WhatsApp',
      hasSMS: 'SMS',
      hasCalendarIntegration: 'Integração com Google Calendar',
      hasAdvancedReports: 'Relatórios Avançados',
      hasPrioritySupport: 'Suporte Prioritário',
      hasCustomIntegrations: 'Integrações Personalizadas'
    }
    return featureNames[feature as keyof typeof featureNames] || 'Funcionalidade Premium'
  }

  const getUpgradeMessage = () => {
    if (currentPlan === 'free') {
      return 'Atualize para o Plano Starter ou Pro'
    }
    if (currentPlan === 'starter') {
      return 'Atualize para o Plano Pro'
    }
    return 'Funcionalidade não disponível'
  }

  const getIcon = () => {
    if (feature === 'hasAI') return <Crown className="h-8 w-8 text-purple-500" />
    if (feature === 'hasAutomation') return <Zap className="h-8 w-8 text-blue-500" />
    return <Lock className="h-8 w-8 text-gray-500" />
  }

  return (
    <div className="relative">
      {/* Conteúdo com overlay blur */}
      <div className="filter blur-sm pointer-events-none opacity-40">
        {children}
      </div>
      
      {/* Overlay de upgrade */}
      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-lg">
        <div className="text-center p-6">
          {getIcon()}
          <h3 className="text-lg font-semibold text-gray-900 mt-2">
            {getFeatureName(feature)}
          </h3>
          <p className="text-gray-600 mt-1 text-sm">
            {getUpgradeMessage()}
          </p>
          <button
            onClick={() => {
              // Aqui você pode abrir o modal de planos
              const event = new CustomEvent('openPlanModal')
              window.dispatchEvent(event)
            }}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Fazer Upgrade
          </button>
        </div>
      </div>
    </div>
  )
}

// Componente para mostrar limites de uso
interface UsageLimitProps {
  feature: 'leads' | 'messages'
  currentUsage: number
  children?: ReactNode
}

export function UsageLimit({ feature, currentUsage, children }: UsageLimitProps) {
  const { getFeatureLimit } = usePlan()
  
  const limit = getFeatureLimit(feature)
  const isUnlimited = limit === -1
  const isNearLimit = !isUnlimited && currentUsage >= limit * 0.8
  const isOverLimit = !isUnlimited && currentUsage >= limit

  if (isUnlimited) {
    return <>{children}</>
  }

  const featureName = feature === 'leads' ? 'leads' : 'mensagens'

  return (
    <div className="space-y-2">
      {children}
      
      <div className={`text-xs p-2 rounded ${
        isOverLimit 
          ? 'bg-red-50 text-red-700 border border-red-200'
          : isNearLimit 
          ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
          : 'bg-gray-50 text-gray-600'
      }`}>
        <div className="flex justify-between items-center">
          <span>
            {currentUsage} / {limit} {featureName} utilizados
          </span>
          {(isNearLimit || isOverLimit) && (
            <button
              onClick={() => {
                const event = new CustomEvent('openPlanModal')
                window.dispatchEvent(event)
              }}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Upgrade
            </button>
          )}
        </div>
        
        {/* Barra de progresso */}
        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
          <div 
            className={`h-1.5 rounded-full ${
              isOverLimit ? 'bg-red-500' : isNearLimit ? 'bg-yellow-500' : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min((currentUsage / limit) * 100, 100)}%` }}
          />
        </div>
        
        {isOverLimit && (
          <p className="mt-1 text-xs">
            Limite excedido! Atualize seu plano para continuar usando.
          </p>
        )}
      </div>
    </div>
  )
}
