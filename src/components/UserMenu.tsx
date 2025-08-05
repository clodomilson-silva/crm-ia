'use client'

import { useState, useRef, useEffect } from 'react'
import { User, Settings, LogOut, Shield } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function UserMenu() {
  const { user, logout, isAdmin } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
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
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 transform transition-all duration-200 ease-out">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                {getInitials(user.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.email}
                </p>
                {isAdmin && (
                  <div className="flex items-center mt-1">
                    <Shield className="w-3 h-3 text-yellow-600 mr-1" />
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
                // TODO: Implementar edição de perfil
                alert('Funcionalidade de perfil em desenvolvimento')
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <User className="w-4 h-4 mr-3 text-gray-500" />
              Meu Perfil
            </button>

            <button
              onClick={() => {
                setIsOpen(false)
                // TODO: Implementar configurações
                alert('Funcionalidade de configurações em desenvolvimento')
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Settings className="w-4 h-4 mr-3 text-gray-500" />
              Configurações
            </button>

            <div className="border-t border-gray-100 my-1"></div>

            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors group"
            >
              <LogOut className="w-4 h-4 mr-3 text-red-500 group-hover:text-red-600" />
              Sair
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
