'use client'

import { LucideIcon } from 'lucide-react'

interface Tab {
  id: string
  label: string
  icon: LucideIcon
  badge?: number
}

interface NavigationProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
}

export default function Navigation({ tabs, activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Desktop Navigation */}
        <div className="hidden sm:flex space-x-4 lg:space-x-8 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex items-center space-x-2 py-4 px-2 lg:px-3 text-sm font-medium transition-all duration-200 whitespace-nowrap group ${
                  isActive
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300'
                }`}
              >
                <Icon className={`w-4 h-4 transition-colors ${
                  isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                }`} />
                <span className="hidden lg:inline">{tab.label}</span>
                <span className="lg:hidden">{tab.label.split(' ')[0]}</span>
                
                {tab.badge && tab.badge > 0 && (
                  <span className="inline-flex items-center justify-center w-4 h-4 lg:w-5 lg:h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
                
                {/* Hover effect */}
                {!isActive && (
                  <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-400 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
                )}
              </button>
            )
          })}
        </div>

        {/* Mobile Navigation */}
        <div className="sm:hidden">
          <div className="flex overflow-x-auto scrollbar-hide py-2 space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`relative flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 text-xs font-medium transition-all duration-200 rounded-lg ${
                    isActive
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="relative">
                    <Icon className={`w-5 h-5 mb-1 transition-colors ${
                      isActive ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    {tab.badge && tab.badge > 0 && (
                      <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-3 h-3 text-xs font-bold text-white bg-red-500 rounded-full">
                        {tab.badge > 9 ? '9+' : tab.badge}
                      </span>
                    )}
                  </div>
                  <span className="truncate w-full text-center leading-tight">
                    {tab.label.length > 8 ? tab.label.split(' ')[0] : tab.label}
                  </span>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
