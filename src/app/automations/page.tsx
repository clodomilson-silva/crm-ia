'use client'

import { useState } from 'react'
import { Zap, Bot, MessageSquare, Calendar, Clock, Settings } from 'lucide-react'
import FeatureGuard from '@/components/FeatureGuard'

export default function AutomationPage() {
  const [selectedAutomation, setSelectedAutomation] = useState<string | null>(null)

  const automations = [
    {
      id: 'welcome',
      title: 'Mensagem de Boas-vindas',
      description: 'Envio automático de mensagem de boas-vindas para novos clientes',
      icon: MessageSquare,
      feature: 'hasAutomation' as const,
      category: 'Comunicação'
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp Automático',
      description: 'Envio de mensagens automáticas via WhatsApp Business',
      icon: MessageSquare,
      feature: 'hasWhatsApp' as const,
      category: 'Comunicação'
    },
    {
      id: 'calendar',
      title: 'Sincronização de Agenda',
      description: 'Sincronização automática com Google Calendar',
      icon: Calendar,
      feature: 'hasCalendarIntegration' as const,
      category: 'Produtividade'
    },
    {
      id: 'ai-response',
      title: 'Respostas Inteligentes',
      description: 'IA para gerar respostas automáticas personalizadas',
      icon: Bot,
      feature: 'hasAI' as const,
      category: 'Inteligência Artificial'
    },
    {
      id: 'follow-up',
      title: 'Follow-up Automático',
      description: 'Acompanhamento automático de leads e propostas',
      icon: Clock,
      feature: 'hasAutomation' as const,
      category: 'Vendas'
    }
  ]

  const categories = ['Todos', 'Comunicação', 'Produtividade', 'Inteligência Artificial', 'Vendas']
  const [selectedCategory, setSelectedCategory] = useState('Todos')

  const filteredAutomations = selectedCategory === 'Todos' 
    ? automations 
    : automations.filter(auto => auto.category === selectedCategory)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Automações</h1>
          <p className="text-gray-600">Configure automações para otimizar seu fluxo de trabalho</p>
        </div>

        {/* Filtros por categoria */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de automações */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAutomations.map((automation) => {
            const IconComponent = automation.icon
            
            return (
              <FeatureGuard key={automation.id} feature={automation.feature}>
                <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <IconComponent className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{automation.title}</h3>
                          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                            {automation.category}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedAutomation(automation.id)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4">
                      {automation.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Status: Ativo</span>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors">
                        Configurar
                      </button>
                    </div>
                  </div>
                </div>
              </FeatureGuard>
            )
          })}
        </div>

        {/* Estatísticas das automações */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Automações Ativas</h3>
                <p className="text-2xl font-bold text-green-600">12</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm">Funcionando perfeitamente</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-2">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Mensagens Enviadas</h3>
                <p className="text-2xl font-bold text-blue-600">1,247</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm">Últimos 30 dias</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="h-8 w-8 text-purple-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Tempo Economizado</h3>
                <p className="text-2xl font-bold text-purple-600">42h</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm">Este mês</p>
          </div>
        </div>

        {/* Modal de configuração (exemplo) */}
        {selectedAutomation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Configurar Automação</h2>
                  <button
                    onClick={() => setSelectedAutomation(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-gray-600 mb-6">
                  Configure os parâmetros para sua automação personalizada.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedAutomation(null)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => setSelectedAutomation(null)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
