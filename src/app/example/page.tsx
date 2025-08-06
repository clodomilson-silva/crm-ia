'use client'

import { useState } from 'react'
import { Search, Filter, Download, Plus, BarChart3, Users, TrendingUp } from 'lucide-react'
import PageTemplate, { TemplateCard, TemplateButton } from '@/components/PageTemplate'

export default function ExamplePage() {
  const [searchTerm, setSearchTerm] = useState('')

  const stats = [
    { label: 'Total de Clientes', value: '1,234', icon: Users, color: 'from-blue-500 to-blue-600' },
    { label: 'Leads Ativos', value: '456', icon: TrendingUp, color: 'from-green-500 to-green-600' },
    { label: 'Conversões', value: '78', icon: BarChart3, color: 'from-purple-500 to-purple-600' },
  ]

  const clients = [
    { id: 1, name: 'João Silva', email: 'joao@empresa.com', status: 'Ativo', score: 85 },
    { id: 2, name: 'Maria Santos', email: 'maria@startup.com', status: 'Prospect', score: 65 },
    { id: 3, name: 'Pedro Costa', email: 'pedro@loja.com', status: 'Lead', score: 92 },
    { id: 4, name: 'Ana Lima', email: 'ana@consultoria.com', status: 'Ativo', score: 78 },
  ]

  const headerContent = (
    <div className="flex items-center space-x-3">
      <TemplateButton variant="secondary" size="sm">
        <Filter className="w-4 h-4 mr-2" />
        Filtros
      </TemplateButton>
      <TemplateButton variant="secondary" size="sm">
        <Download className="w-4 h-4 mr-2" />
        Exportar
      </TemplateButton>
      <TemplateButton variant="primary" size="sm">
        <Plus className="w-4 h-4 mr-2" />
        Novo Cliente
      </TemplateButton>
    </div>
  )

  return (
    <PageTemplate 
      title="Dashboard ClientPulse" 
      subtitle="Visão geral dos seus clientes e leads"
      showLogo={true}
      headerContent={headerContent}
    >
      <div className="p-6 space-y-6">
        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <TemplateCard key={index} className="relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-800 mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r opacity-30 rounded-b-xl" style={{
                background: `linear-gradient(to right, ${stat.color.includes('blue') ? '#3B82F6' : stat.color.includes('green') ? '#10B981' : '#8B5CF6'}, transparent)`
              }}></div>
            </TemplateCard>
          ))}
        </div>

        {/* Barra de pesquisa */}
        <TemplateCard title="Pesquisar Clientes">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome, email ou empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 backdrop-blur-sm bg-white/50 border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </TemplateCard>

        {/* Tabela de clientes */}
        <TemplateCard title="Lista de Clientes" noPadding>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/40">
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">Cliente</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">Email</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">Score</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-b border-white/20 hover:bg-white/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {client.name.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-800">{client.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600">{client.email}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        client.status === 'Ativo' ? 'bg-green-100 text-green-800' :
                        client.status === 'Prospect' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
                            style={{ width: `${client.score}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-slate-700">{client.score}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        <TemplateButton variant="ghost" size="sm">
                          Editar
                        </TemplateButton>
                        <TemplateButton variant="ghost" size="sm">
                          Ver
                        </TemplateButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TemplateCard>
      </div>
    </PageTemplate>
  )
}
