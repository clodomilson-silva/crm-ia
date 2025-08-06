'use client'

import { ReactNode, ButtonHTMLAttributes } from 'react'
import Image from 'next/image'

interface PageTemplateProps {
  children: ReactNode
  title?: string
  subtitle?: string
  showLogo?: boolean
  headerContent?: ReactNode
  footerContent?: ReactNode
  action?: ReactNode
}

export default function PageTemplate({ 
  children, 
  title, 
  subtitle, 
  showLogo = false,
  headerContent,
  footerContent,
  action
}: PageTemplateProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-900 dark:via-slate-800/30 dark:to-purple-900/20 relative overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 dark:from-blue-500/20 dark:to-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/10 to-blue-400/10 dark:from-purple-500/20 dark:to-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-400/5 to-purple-400/5 dark:from-blue-500/10 dark:to-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Grid pattern sutil */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.1) 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}></div>
      </div>

      <div className="relative min-h-screen flex flex-col" style={{ zIndex: 1 }}>
        {/* Header da página */}
        {(title || subtitle || showLogo || headerContent) && (
          <header className="px-6 py-8">
            <div className="max-w-7xl mx-auto">
              <div className="backdrop-blur-sm bg-white/40 dark:bg-slate-800/40 border border-white/50 dark:border-slate-600/50 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    {showLogo && (
                      <div className="relative">
                        <div className="relative bg-gradient-to-tr from-blue-500/20 to-purple-600/20 dark:from-blue-400/30 dark:to-purple-500/30 backdrop-blur-sm border border-white/30 dark:border-slate-500/30 rounded-xl p-3 shadow-lg">
                          <Image 
                            src="/logo.png" 
                            alt="ClientPulse" 
                            width={40}
                            height={40}
                            className="drop-shadow-md"
                          />
                        </div>
                        <div className="absolute -inset-1 border border-blue-400/30 rounded-xl animate-pulse"></div>
                      </div>
                    )}
                    
                    {(title || subtitle) && (
                      <div>
                        {title && (
                          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 dark:from-slate-100 dark:to-blue-400 bg-clip-text text-transparent">
                            {title}
                          </h1>
                        )}
                        {subtitle && (
                          <p className="text-slate-600 dark:text-slate-300 mt-1 font-medium">
                            {subtitle}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {(headerContent || action) && (
                    <div className="flex-shrink-0 flex items-center space-x-4">
                      {action}
                      {headerContent}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Conteúdo principal */}
        <main className="flex-1 px-6 pb-8">
          <div className="max-w-7xl mx-auto">
            <div className="backdrop-blur-sm bg-white/30 dark:bg-slate-800/30 border border-white/50 dark:border-slate-600/50 rounded-2xl shadow-xl overflow-hidden">
              {children}
            </div>
          </div>
        </main>

        {/* Footer opcional */}
        {footerContent && (
          <footer className="px-6 pb-8">
            <div className="max-w-7xl mx-auto">
              <div className="backdrop-blur-sm bg-white/20 border border-white/30 rounded-2xl p-4 shadow-lg">
                {footerContent}
              </div>
            </div>
          </footer>
        )}
      </div>
    </div>
  )
}

// Componente para cards internos
export function TemplateCard({ 
  children, 
  title, 
  className = "",
  noPadding = false 
}: { 
  children: ReactNode
  title?: string
  className?: string
  noPadding?: boolean
}) {
  return (
    <div className={`backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-600/60 rounded-xl shadow-lg ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-white/40 dark:border-slate-600/40">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
        </div>
      )}
      <div className={noPadding ? "" : "p-6"}>
        {children}
      </div>
    </div>
  )
}

// Componente para botões no novo estilo
export function TemplateButton({ 
  children, 
  variant = "primary",
  size = "md",
  className = "",
  ...props 
}: { 
  children: ReactNode
  variant?: "primary" | "secondary" | "ghost" | "outline"
  size?: "sm" | "md" | "lg"
  className?: string
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const baseClasses = "relative font-medium rounded-xl transition-all transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2"
  
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl focus:ring-blue-500",
    secondary: "backdrop-blur-sm bg-white/60 hover:bg-white/80 border border-white/60 text-slate-700 shadow-md hover:shadow-lg focus:ring-blue-500",
    ghost: "text-slate-600 hover:text-slate-800 hover:bg-white/30",
    outline: "border-2 border-slate-300 hover:border-blue-500 text-slate-700 hover:text-blue-600 bg-white/50 hover:bg-white/70 shadow-sm hover:shadow-md focus:ring-blue-500"
  }
  
  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base"
  }

  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
