'use client'

import { useState } from 'react'
import { Users, MessageSquare, Target, Calendar, Search, Activity } from 'lucide-react'
import Header from '@/components/Header'
import Navigation from '@/components/Navigation'
import ClientList from '@/components/ClientList'
import ClientForm from '@/components/ClientForm'
import MessageGenerator from '@/components/MessageGenerator'
import TaskList from '@/components/TaskList'
import SearchBar from '@/components/SearchBar'
import Dashboard from '@/components/Dashboard'
import APILimitsChecker from '@/components/APILimitsChecker'

type ActiveTab = 'dashboard' | 'clients' | 'messages' | 'tasks' | 'search' | 'limits'

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard')
  const [showClientForm, setShowClientForm] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleTaskClick = (taskId: string) => {
    setActiveTab('tasks')
    // Aqui poderia adicionar lógica para focar na tarefa específica
    console.log('Clicked task:', taskId)
  }

  const handleClientCreated = () => {
    setShowClientForm(false)
    setRefreshKey(prev => prev + 1) // Força atualização do ClientList
    if (activeTab !== 'clients') {
      setActiveTab('clients') // Muda para a aba de clientes
    }
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Target },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'messages', label: 'Mensagens IA', icon: MessageSquare },
    { id: 'tasks', label: 'Tarefas', icon: Calendar },
    { id: 'search', label: 'Busca IA', icon: Search },
    { id: 'limits', label: 'API Status', icon: Activity },
  ]

  const renderActiveContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'clients':
        return <ClientList key={refreshKey} />
      case 'messages':
        return <MessageGenerator />
      case 'tasks':
        return <TaskList />
      case 'search':
        return <SearchBar />
      case 'limits':
        return <APILimitsChecker />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Modern Header */}
      <Header 
        onNewClient={() => setShowClientForm(true)}
        activeTab={activeTab}
        onTaskClick={handleTaskClick}
      />

      {/* Modern Navigation */}
      <Navigation 
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as ActiveTab)}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 min-h-[calc(100vh-200px)] sm:min-h-[600px]">
          <div className="p-3 sm:p-4 lg:p-6">
            {renderActiveContent()}
          </div>
        </div>
      </main>

      {/* Modal for New Client */}
      {showClientForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
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
  )
}
