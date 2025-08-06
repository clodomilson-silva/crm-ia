'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Plus, Menu, X } from 'lucide-react'
import NotificationDropdown from './NotificationDropdown'
import UserMenu from './UserMenu'

interface HeaderProps {
  onNewClient: () => void
  activeTab: string
  onTaskClick?: (taskId: string) => void
}

export default function Header({ onNewClient, activeTab, onTaskClick }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const getActiveTabTitle = () => {
    const titles: Record<string, string> = {
      dashboard: 'Dashboard',
      clients: 'Gestão de Clientes',
      messages: 'Gerador de Mensagens IA',
      tasks: 'Central de Tarefas',
      search: 'Busca Inteligente'
    }
    return titles[activeTab] || 'ClientPulse'
  }

  return (
    <header className="backdrop-blur-xl bg-gradient-to-r from-slate-900/95 via-blue-900/95 to-purple-900/95 border-b border-white/10 shadow-2xl z-header relative">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center py-3 sm:py-4">
          {/* Logo e Brand */}
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="relative flex-shrink-0">
                {/* Container da logo com efeito glass */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/30 to-purple-600/30 rounded-xl blur-sm"></div>
                  <div className="relative backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl p-2 shadow-xl">
                    <Image
                      src="/logo.png"
                      alt="ClientPulse Logo"
                      width={32}
                      height={32}
                      className="sm:w-8 sm:h-8 drop-shadow-lg"
                    />
                  </div>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent truncate">
                  Client<span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">Pulse</span>
                </h1>
                <p className="text-blue-200/80 text-xs sm:text-sm font-medium hidden sm:block">
                  Sistema Inteligente de Gestão de Clientes
                </p>
              </div>
            </div>
          </div>

          {/* Título da Seção Ativa - Desktop */}
          <div className="hidden lg:block flex-1 px-4">
            <div className="text-center">
              <h2 className="text-xl font-semibold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                {getActiveTabTitle()}
              </h2>
              <div className="flex items-center justify-center mt-2">
                <div className="w-12 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full shadow-lg"></div>
              </div>
            </div>
          </div>

          {/* Actions - Desktop */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4 flex-shrink-0">
            <NotificationDropdown onTaskClick={onTaskClick} />
            
            <button
              onClick={onNewClient}
              className="inline-flex items-center px-3 lg:px-6 py-2.5 backdrop-blur-sm bg-white/20 hover:bg-white/30 border border-white/30 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 hover:scale-105"
            >
              <Plus className="w-4 h-4 mr-1 lg:mr-2" />
              <span className="hidden lg:inline">Novo Cliente</span>
              <span className="lg:hidden">Novo</span>
            </button>

            <UserMenu />
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center space-x-2 flex-shrink-0">
            <NotificationDropdown onTaskClick={onTaskClick} />
            
            <button
              onClick={onNewClient}
              className="inline-flex items-center p-2 backdrop-blur-sm bg-white/20 hover:bg-white/30 border border-white/30 text-white rounded-xl transition-colors shadow-lg"
            >
              <Plus className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-blue-200 hover:text-white hover:bg-white/20 rounded-xl transition-colors backdrop-blur-sm"
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
                <NotificationDropdown onTaskClick={onTaskClick} />
                <UserMenu />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
