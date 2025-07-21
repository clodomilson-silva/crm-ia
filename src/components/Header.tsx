'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Plus, Bell, User, Menu, X } from 'lucide-react'

interface HeaderProps {
  onNewClient: () => void
  activeTab: string
}

export default function Header({ onNewClient, activeTab }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const getActiveTabTitle = () => {
    const titles: Record<string, string> = {
      dashboard: 'Dashboard',
      clients: 'Gestão de Clientes',
      messages: 'Gerador de Mensagens IA',
      tasks: 'Central de Tarefas',
      search: 'Busca Inteligente'
    }
    return titles[activeTab] || 'CRM com IA'
  }

  return (
    <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo e Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Image
                  src="/logo.png"
                  alt="CRM IA Logo"
                  width={48}
                  height={48}
                  className="rounded-lg shadow-md"
                />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  CRM <span className="text-blue-200">AI</span>
                </h1>
                <p className="text-blue-100 text-sm font-medium">
                  Sistema Inteligente de Gestão
                </p>
              </div>
            </div>
          </div>

          {/* Título da Seção Ativa - Desktop */}
          <div className="hidden md:block">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-white">
                {getActiveTabTitle()}
              </h2>
              <div className="flex items-center justify-center mt-1">
                <div className="w-8 h-0.5 bg-blue-300 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Actions - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="relative p-2 text-blue-100 hover:text-white hover:bg-blue-600/50 rounded-lg transition-all duration-200">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full"></span>
            </button>
            
            <button
              onClick={onNewClient}
              className="inline-flex items-center px-6 py-2.5 bg-white text-blue-700 rounded-lg hover:bg-blue-50 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Cliente
            </button>

            <button className="p-2 text-blue-100 hover:text-white hover:bg-blue-600/50 rounded-lg transition-all duration-200">
              <User className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-blue-100 hover:text-white hover:bg-blue-600/50 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-blue-500/30">
            <div className="pt-4 space-y-3">
              <div className="text-center mb-4">
                <h2 className="text-lg font-semibold text-white">
                  {getActiveTabTitle()}
                </h2>
              </div>
              
              <button
                onClick={() => {
                  onNewClient()
                  setIsMobileMenuOpen(false)
                }}
                className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-white text-blue-700 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Cliente
              </button>
              
              <div className="flex justify-center space-x-4 pt-2">
                <button className="p-2 text-blue-100 hover:text-white hover:bg-blue-600/50 rounded-lg transition-colors">
                  <Bell className="w-5 h-5" />
                </button>
                <button className="p-2 text-blue-100 hover:text-white hover:bg-blue-600/50 rounded-lg transition-colors">
                  <User className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
