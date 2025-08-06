'use client'

import { useState, useRef, useEffect } from 'react'
import { User, Settings, LogOut, Shield } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import ProfileModal from './ProfileModal'
import SettingsModal from './SettingsModal'

export default function UserMenu() {
  const { user, logout, isAdmin } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Fechar menu ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  if (!user) return null

  const handleLogout = () => {
    logout()
    setIsOpen(false)
  }

  // Gerar iniciais do nome
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center p-1 text-blue-100 hover:text-white hover:bg-blue-600/50 rounded-lg transition-all duration-200 group"
        aria-label="Menu do usuário"
      >
        <div className="relative">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold border-2 border-white/20 group-hover:border-white/40 transition-all">
            {getInitials(user.name)}
          </div>
          {isAdmin && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border border-white flex items-center justify-center">
              <Shield className="w-2 h-2 text-yellow-800" />
            </div>
          )}
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-lg shadow-xl border border-gray-200/50 dark:border-slate-700/50 py-2 z-dropdown transform transition-all duration-200 ease-out">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-100/50 dark:border-slate-700/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                {getInitials(user.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                </p>
                {isAdmin && (
                  <div className="flex items-center mt-1">
                    <Shield className="w-3 h-3 text-yellow-600 mr-1 flex-shrink-0" />
                    <span className="text-xs text-yellow-600 font-medium">Administrador</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={() => {
                setIsOpen(false)
                setShowProfileModal(true)
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              <User className="w-4 h-4 mr-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
              <span>Meu Perfil</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false)
                setShowSettingsModal(true)
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Settings className="w-4 h-4 mr-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
              <span>Configurações</span>
            </button>

            <div className="border-t border-gray-100 dark:border-slate-700 my-1"></div>

            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
            >
              <LogOut className="w-4 h-4 mr-3 text-red-500 group-hover:text-red-600 dark:text-red-400 flex-shrink-0" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      )}

      {/* Modais */}
      <ProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
      />
      <SettingsModal 
        isOpen={showSettingsModal} 
        onClose={() => setShowSettingsModal(false)} 
      />
    </div>
  )
}
