'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react'
import Image from 'next/image'

export default function LoginForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { login, register } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let success = false

      if (isLogin) {
        success = await login(formData.email, formData.password)
      } else {
        if (!formData.name) {
          setError('Nome é obrigatório')
          setLoading(false)
          return
        }
        success = await register(formData.name, formData.email, formData.password)
      }

      if (!success) {
        setError(isLogin ? 'Email ou senha incorretos' : 'Erro ao criar conta')
      }
    } catch (err) {
      setError('Erro interno do servidor')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background com gradiente dinâmico */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 via-transparent to-purple-600/20"></div>
      
      {/* Elementos decorativos animados */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}></div>
      </div>

      <div className="relative z-10 max-w-md w-full mx-4">
        {/* Card principal com glass effect */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 space-y-8">
          <div className="text-center">
            {/* Container da logo com efeito sofisticado */}
            <div className="relative mx-auto mb-8 w-24 h-24">
              {/* Círculo de fundo com gradiente */}
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-2xl blur-lg opacity-40 animate-pulse"></div>
              <div className="relative bg-gradient-to-tr from-blue-500/20 to-purple-600/20 backdrop-blur-sm border border-white/30 rounded-2xl p-4 shadow-xl">
                <Image 
                  src="/logo.png" 
                  alt="ClientPulse" 
                  width={56}
                  height={56}
                  className="mx-auto drop-shadow-lg"
                />
              </div>
              {/* Anel animado ao redor da logo */}
              <div className="absolute -inset-2 border-2 border-blue-400/50 rounded-3xl animate-spin" style={{animationDuration: '8s'}}></div>
            </div>
            
            <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-2">
              {isLogin ? 'ClientPulse' : 'Criar conta'}
            </h2>
            <p className="text-blue-100/80 text-sm font-medium">
              {isLogin ? 'Acesse sua conta para gerenciar clientes' : 'Crie sua conta e comece a usar o ClientPulse'}
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              {!isLogin && (
                <div className="group">
                  <label htmlFor="name" className="block text-sm font-medium text-blue-100 mb-2">
                    Nome completo
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-blue-300 group-hover:text-blue-200 transition-colors" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required={!isLogin}
                      value={formData.name}
                      onChange={handleInputChange}
                      className="appearance-none relative block w-full px-4 py-3 pl-12 backdrop-blur-sm bg-white/10 border border-white/20 placeholder-blue-200 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                      placeholder="Seu nome completo"
                    />
                  </div>
                </div>
              )}

              <div className="group">
                <label htmlFor="email" className="block text-sm font-medium text-blue-100 mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-blue-300 group-hover:text-blue-200 transition-colors" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="appearance-none relative block w-full px-4 py-3 pl-12 backdrop-blur-sm bg-white/10 border border-white/20 placeholder-blue-200 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div className="group">
                <label htmlFor="password" className="block text-sm font-medium text-blue-100 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-blue-300 group-hover:text-blue-200 transition-colors" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="appearance-none relative block w-full px-4 py-3 pl-12 pr-12 backdrop-blur-sm bg-white/10 border border-white/20 placeholder-blue-200 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                    placeholder="Sua senha"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-blue-300 hover:text-white transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="backdrop-blur-sm bg-red-500/20 border border-red-400/30 text-red-100 text-sm text-center p-4 rounded-xl">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <span>{isLogin ? 'Entrar' : 'Criar conta'}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 rounded-xl transition-opacity"></div>
                  </>
                )}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin)
                  setError('')
                  setFormData({ name: '', email: '', password: '' })
                }}
                className="text-blue-200 hover:text-white text-sm font-medium transition-colors relative group"
              >
                <span className="relative z-10">
                  {isLogin ? 'Não tem conta? Criar uma agora' : 'Já tem conta? Fazer login'}
                </span>
                <div className="absolute inset-0 bg-white/10 scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-lg -z-0"></div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
