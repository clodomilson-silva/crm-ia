'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { usePlan } from '@/contexts/PlanContext'
import PlanModal from './PlanModal'
import PaymentModal from './PaymentModal'

export default function PlanModals() {
  const { user } = useAuth()
  const { currentPlan } = usePlan()
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'pro' | 'enterprise'>('starter')

  // Mostrar modal de planos após o login (apenas para usuários gratuitos)
  useEffect(() => {
    if (user && currentPlan === 'free') {
      // Delay para dar tempo da tela carregar
      const timer = setTimeout(() => {
        setShowPlanModal(true)
      }, 2000) // 2 segundos após o login

      return () => clearTimeout(timer)
    }
  }, [user, currentPlan])

  // Escutar evento global para abrir modal de planos
  useEffect(() => {
    const handleOpenPlanModal = () => {
      setShowPlanModal(true)
    }

    window.addEventListener('openPlanModal', handleOpenPlanModal)
    return () => window.removeEventListener('openPlanModal', handleOpenPlanModal)
  }, [])

  const handleSelectPlan = (planId: string) => {
    const plan = planId as 'starter' | 'pro' | 'enterprise'
    setSelectedPlan(plan)
    setShowPlanModal(false)
    
    if (plan !== 'enterprise') {
      setShowPaymentModal(true)
    }
  }

  const handlePaymentComplete = () => {
    setShowPaymentModal(false)
    // Aqui você pode adicionar lógica adicional após o pagamento
  }

  // Criar objeto do plano selecionado para o PaymentModal
  const getSelectedPlanObject = () => {
    const plans = {
      starter: { id: 'starter', name: 'Starter', price: 'R$ 49,90' },
      pro: { id: 'pro', name: 'Pro', price: 'R$ 149,90' },
      enterprise: { id: 'enterprise', name: 'Enterprise', price: 'Sob consulta' }
    }
    return plans[selectedPlan] || null
  }

  if (!user) {
    return null
  }

  return (
    <>
      {showPlanModal && (
        <PlanModal
          isOpen={showPlanModal}
          onClose={() => setShowPlanModal(false)}
          onSelectPlan={handleSelectPlan}
        />
      )}

      {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          selectedPlan={getSelectedPlanObject()}
          onClose={() => setShowPaymentModal(false)}
          onPaymentSuccess={handlePaymentComplete}
        />
      )}
    </>
  )
}
