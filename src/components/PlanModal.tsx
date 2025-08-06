'use client'

import { useState } from 'react'
import { X, Check, Crown, Zap, Building2, CreditCard, Smartphone } from 'lucide-react'

interface PlanModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectPlan: (planId: string) => void
}

export default function PlanModal({ isOpen, onClose, onSelectPlan }: PlanModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>('')

  if (!isOpen) return null

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 'R$ 49,90',
      period: '/mês',
      icon: <Zap className="h-8 w-8 text-blue-600" />,
      description: 'Ideal para pequenos negócios',
      features: [
        'Até 500 leads',
        'Até 100 mensagens/mês',
        'Dashboard básico',
        'Suporte por email',
        'Relatórios básicos'
      ],
      limitations: [
        'IA limitada',
        'Sem automações',
        'Sem integrações'
      ],
      popular: false,
      color: 'blue'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 'R$ 149,90',
      period: '/mês',
      icon: <Crown className="h-8 w-8 text-purple-600" />,
      description: 'Para empresas em crescimento',
      features: [
        'Leads ilimitados',
        'IA completa liberada',
        'Automações avançadas',
        'WhatsApp + SMS + Email',
        'Agenda e lembretes',
        'Relatórios completos',
        'Integração Google Calendar',
        'Modelos de IA prontos',
        'Suporte prioritário'
      ],
      limitations: [],
      popular: true,
      color: 'purple'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Sob consulta',
      period: '',
      icon: <Building2 className="h-8 w-8 text-gray-600" />,
      description: 'Soluções personalizadas',
      features: [
        'Tudo do Pro +',
        'Integrações customizadas',
        'Suporte 24/7',
        'Treinamento da equipe',
        'API personalizada',
        'Backup dedicado',
        'Gerente de conta',
        'SLA garantido'
      ],
      limitations: [],
      popular: false,
      color: 'gray'
    }
  ]

  const handleSelectPlan = (planId: string) => {
    if (planId === 'enterprise') {
      // Para Enterprise, redirecionar para contato
      window.open('mailto:contato@clientpulse.com?subject=Interesse no Plano Enterprise', '_blank')
      return
    }
    setSelectedPlan(planId)
    onSelectPlan(planId)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Escolha seu plano</h2>
              <p className="text-gray-600 mt-2">Desbloqueie todo o potencial do ClientPulse</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative border-2 rounded-xl p-6 ${
                  plan.popular
                    ? 'border-purple-500 shadow-lg scale-105'
                    : 'border-gray-200 hover:border-gray-300'
                } transition-all duration-200`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Mais Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className="flex justify-center mb-4">
                    {plan.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-gray-600 text-sm mt-1">{plan.description}</p>
                  <div className="mt-4">
                    <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}
                  {plan.limitations.map((limitation, index) => (
                    <div key={index} className="flex items-center opacity-60">
                      <X className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-500 text-sm line-through">{limitation}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    plan.popular
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : plan.id === 'enterprise'
                      ? 'bg-gray-600 hover:bg-gray-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {plan.id === 'enterprise' ? 'Entrar em contato' : 'Escolher plano'}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🚀 Funcionalidades Premium Incluídas:
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">📱 Comunicação Automática</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• WhatsApp, Email & SMS</li>
                  <li>• Modelos gerados por IA</li>
                  <li>• Disparos automáticos</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">📅 Agenda & Tarefas</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Lembretes automáticos</li>
                  <li>• Notificações follow-up</li>
                  <li>• Integração Google Calendar</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">📊 Relatórios & Análises</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Taxa de conversão</li>
                  <li>• Previsão de vendas</li>
                  <li>• Leads promissores</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              💳 Aceitamos cartão, PIX e pagamentos recorrentes via Stripe
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
