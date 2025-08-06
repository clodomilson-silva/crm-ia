'use client'

import { useState } from 'react'
import { Users, MessageSquare, Target, Calendar, Search, Activity } from 'lucide-react'
import Header from '@/components/Header'
import Navigation from '@/components/Navigation'
import ClientList from '@/components/ClientListModern'
import ClientForm from '@/components/ClientForm'
import MessageCenter from '@/components/MessageCenter'
import TaskList from '@/components/TaskList'
import SearchBar from '@/components/SearchBar'
import Dashboard from '@/components/Dashboard'
import APILimitsChecker from '@/components/APILimitsChecker'
import RealtimeNotifications from '@/components/RealtimeNotifications'
import ProtectedRoute from '@/components/ProtectedRoute'
import FeatureGuard, { UsageLimit } from '@/components/FeatureGuard'
import { usePlan } from '@/contexts/PlanContext'
import CalendarIntegration from '@/components/CalendarIntegration'
import { useAuth } from '@/contexts/AuthContext'

type ActiveTab = 'dashboard' | 'clients' | 'messages' | 'tasks' | 'calendar' | 'search' | 'limits'

export default function HomePage() {
  const { isAdmin } = useAuth()
  const { currentPlan } = usePlan()
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard')
  const [showClientForm, setShowClientForm] = useState(false)

  // Admin vê como pro, outros veem o plano real
  const displayPlan = isAdmin ? 'pro' : currentPlan

  const handleClientCreated = () => {
    setShowClientForm(false)
  }

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Target },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'messages', label: 'Mensagens', icon: MessageSquare },
    { id: 'tasks', label: 'Tarefas', icon: Activity },
    { id: 'calendar', label: 'Calendário', icon: Calendar },
    { id: 'search', label: 'Busca', icon: Search },
    // Só mostrar API test para admins
    ...(isAdmin ? [{ id: 'limits', label: 'API Test', icon: Activity }] : [])
  ]

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as ActiveTab)
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
        <RealtimeNotifications />
        <Header 
          onNewClient={() => setShowClientForm(true)}
          activeTab={activeTab}
        />
        <Navigation 
          tabs={navigationItems}
          activeTab={activeTab} 
          onTabChange={handleTabChange}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Informações do plano atual */}
          <div className="mb-6 bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Plano Atual: {displayPlan === 'free' ? 'Gratuito' : 
                               displayPlan === 'starter' ? 'Starter' : 
                               displayPlan === 'pro' ? 'Pro' : 'Enterprise'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {displayPlan === 'free' && 'Faça upgrade para acessar mais funcionalidades'}
                  {displayPlan === 'starter' && 'Acesso às funcionalidades básicas de IA'}
                  {displayPlan === 'pro' && 'Acesso completo a todas as funcionalidades'}
                  {displayPlan === 'enterprise' && 'Plano personalizado com suporte dedicado'}
                </p>
              </div>
              {!isAdmin && displayPlan === 'free' && (
                <button
                  onClick={() => {
                    const event = new CustomEvent('openPlanModal')
                    window.dispatchEvent(event)
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Fazer Upgrade
                </button>
              )}
            </div>
          </div>

          {activeTab === 'dashboard' && <Dashboard />}
          
          {activeTab === 'clients' && (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestão de Clientes</h1>
                <button
                  onClick={() => setShowClientForm(true)}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Novo Cliente
                </button>
              </div>
              <UsageLimit feature="leads" currentUsage={25}>
                <ClientList />
              </UsageLimit>
            </div>
          )}

          {activeTab === 'messages' && (
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Centro de Mensagens</h1>
              <FeatureGuard feature="hasAI">
                <MessageCenter />
              </FeatureGuard>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Gestão de Tarefas</h1>
              <TaskList />
            </div>
          )}

          {activeTab === 'calendar' && (
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Google Calendar</h1>
              <FeatureGuard feature="hasCalendarIntegration">
                <CalendarIntegration />
              </FeatureGuard>
            </div>
          )}

          {activeTab === 'search' && (
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Busca Inteligente</h1>
              <SearchBar />
            </div>
          )}

          {activeTab === 'limits' && isAdmin && (
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Monitor de API</h1>
              <APILimitsChecker />
            </div>
          )}
        </main>

        {/* Modal do formulário de cliente */}
        {showClientForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Novo Cliente</h2>
                  <button
                    onClick={() => setShowClientForm(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <ClientForm 
                  onSuccess={handleClientCreated}
                  onCancel={() => setShowClientForm(false)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
