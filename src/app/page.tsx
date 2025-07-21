'use client'

import { useState } from 'react'
import { Users, MessageSquare, Target, Calendar, Search } from 'lucide-react'
import Header from '@/components/Header'
import Navigation from '@/components/Navigation'
import ClientList from '@/components/ClientList'
import ClientForm from '@/components/ClientForm'
import MessageGenerator from '@/components/MessageGenerator'
import TaskList from '@/components/TaskList'
import SearchBar from '@/components/SearchBar'
import Dashboard from '@/components/Dashboard'

type ActiveTab = 'dashboard' | 'clients' | 'messages' | 'tasks' | 'search'

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard')
  const [showClientForm, setShowClientForm] = useState(false)

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Target },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'messages', label: 'Mensagens IA', icon: MessageSquare },
    { id: 'tasks', label: 'Tarefas', icon: Calendar },
    { id: 'search', label: 'Busca IA', icon: Search },
  ]

  const renderActiveContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'clients':
        return <ClientList />
      case 'messages':
        return <MessageGenerator />
      case 'tasks':
        return <TaskList />
      case 'search':
        return <SearchBar />
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
      />

      {/* Modern Navigation */}
      <Navigation 
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as ActiveTab)}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 min-h-[600px]">
          <div className="p-6">
            {renderActiveContent()}
          </div>
        </div>
      </main>

      {/* Modal for New Client */}
      {showClientForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Novo Cliente</h2>
                <button
                  onClick={() => setShowClientForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <ClientForm />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
