'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './AuthContext'

export type PlanType = 'free' | 'starter' | 'pro' | 'enterprise'

interface PlanFeatures {
  maxLeads: number
  maxMessages: number
  hasAI: boolean
  hasAutomation: boolean
  hasWhatsApp: boolean
  hasEmail: boolean
  hasSMS: boolean
  hasCalendarIntegration: boolean
  hasAdvancedReports: boolean
  hasPrioritySupport: boolean
  hasCustomIntegrations: boolean
}

interface PlanContextType {
  currentPlan: PlanType
  features: PlanFeatures
  upgradeToStarter: () => Promise<boolean>
  upgradeToPro: () => Promise<boolean>
  canUseFeature: (feature: keyof PlanFeatures) => boolean
  getFeatureLimit: (feature: 'leads' | 'messages') => number
  isFeatureBlocked: (feature: keyof PlanFeatures) => boolean
}

const PlanContext = createContext<PlanContextType | undefined>(undefined)

const PLAN_FEATURES: Record<PlanType, PlanFeatures> = {
  free: {
    maxLeads: 50,
    maxMessages: 20,
    hasAI: false,
    hasAutomation: false,
    hasWhatsApp: false,
    hasEmail: true,
    hasSMS: false,
    hasCalendarIntegration: false,
    hasAdvancedReports: false,
    hasPrioritySupport: false,
    hasCustomIntegrations: false
  },
  starter: {
    maxLeads: 500,
    maxMessages: 100,
    hasAI: false,
    hasAutomation: false,
    hasWhatsApp: false,
    hasEmail: true,
    hasSMS: false,
    hasCalendarIntegration: false,
    hasAdvancedReports: false,
    hasPrioritySupport: false,
    hasCustomIntegrations: false
  },
  pro: {
    maxLeads: -1, // ilimitado
    maxMessages: -1, // ilimitado
    hasAI: true,
    hasAutomation: true,
    hasWhatsApp: true,
    hasEmail: true,
    hasSMS: true,
    hasCalendarIntegration: true,
    hasAdvancedReports: true,
    hasPrioritySupport: true,
    hasCustomIntegrations: false
  },
  enterprise: {
    maxLeads: -1, // ilimitado
    maxMessages: -1, // ilimitado
    hasAI: true,
    hasAutomation: true,
    hasWhatsApp: true,
    hasEmail: true,
    hasSMS: true,
    hasCalendarIntegration: true,
    hasAdvancedReports: true,
    hasPrioritySupport: true,
    hasCustomIntegrations: true
  }
}

export function PlanProvider({ children }: { children: ReactNode }) {
  const { isAdmin } = useAuth()
  const [currentPlan, setCurrentPlan] = useState<PlanType>('free')

  useEffect(() => {
    // Admin sempre tem plano pro, outros carregam do localStorage
    if (isAdmin) {
      setCurrentPlan('pro')
      return
    }
    
    // Carregar plano do usuário do localStorage ou API
    const savedPlan = localStorage.getItem('userPlan') as PlanType
    if (savedPlan && PLAN_FEATURES[savedPlan]) {
      setCurrentPlan(savedPlan)
    }
  }, [isAdmin])

  // Admin sempre usa features do plano pro
  const effectivePlan = isAdmin ? 'pro' : currentPlan
  const features = PLAN_FEATURES[effectivePlan]

  const upgradeToStarter = async (): Promise<boolean> => {
    try {
      // Aqui seria a integração com Stripe/API de pagamento
      console.log('Upgrade para Starter')
      setCurrentPlan('starter')
      localStorage.setItem('userPlan', 'starter')
      return true
    } catch (error) {
      console.error('Erro no upgrade:', error)
      return false
    }
  }

  const upgradeToPro = async (): Promise<boolean> => {
    try {
      // Aqui seria a integração com Stripe/API de pagamento
      console.log('Upgrade para Pro')
      setCurrentPlan('pro')
      localStorage.setItem('userPlan', 'pro')
      return true
    } catch (error) {
      console.error('Erro no upgrade:', error)
      return false
    }
  }

  const canUseFeature = (feature: keyof PlanFeatures): boolean => {
    // Admin sempre pode usar qualquer feature
    if (isAdmin) return true
    
    if (feature === 'maxLeads' || feature === 'maxMessages') {
      return true // Estes são limites, não bloqueios
    }
    return features[feature] as boolean
  }

  const getFeatureLimit = (feature: 'leads' | 'messages'): number => {
    // Admin tem limites ilimitados
    if (isAdmin) return -1
    
    if (feature === 'leads') return features.maxLeads
    if (feature === 'messages') return features.maxMessages
    return 0
  }

  const isFeatureBlocked = (feature: keyof PlanFeatures): boolean => {
    // Admin nunca tem features bloqueadas
    if (isAdmin) return false
    
    return !canUseFeature(feature)
  }

  const value: PlanContextType = {
    currentPlan: effectivePlan,
    features,
    upgradeToStarter,
    upgradeToPro,
    canUseFeature,
    getFeatureLimit,
    isFeatureBlocked
  }

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>
}

export function usePlan() {
  const context = useContext(PlanContext)
  if (context === undefined) {
    throw new Error('usePlan must be used within a PlanProvider')
  }
  return context
}
