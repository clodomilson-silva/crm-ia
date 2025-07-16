'use client'

import { useState } from 'react'
import { Users, MessageSquare, Target, Calendar, Search, Plus } from 'lucide-react'
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
    { id: 'messages', label: 'Mensagens', icon: MessageSquare },
    { id: 'tasks', label: 'Tarefas', icon: Calendar },
    { id: 'search', label: 'Busca IA', icon: Search },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">CRM com IA</h1>
              <p className="text-sm text-gray-600">
                Sistema inteligente de gestão de clientes
              </p>
            </div>
            <button
              onClick={() => setShowClientForm(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Cliente
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ActiveTab)}
                  className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'clients' && <ClientList />}
        {activeTab === 'messages' && <MessageGenerator />}
        {activeTab === 'tasks' && <TaskList />}
        {activeTab === 'search' && <SearchBar />}
      </main>

      {/* Modal for Client Form */}
      {showClientForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Novo Cliente</h2>
              <button
                onClick={() => setShowClientForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <ClientForm
              onSuccess={() => {
                setShowClientForm(false)
                // Refresh the current view if needed
              }}
              onCancel={() => setShowClientForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
