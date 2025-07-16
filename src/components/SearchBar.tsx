'use client'

import { useState } from 'react'
import { Search, Brain, Mail, Phone, TrendingUp } from 'lucide-react'
import axios from 'axios'

interface SearchResult {
  id: string
  name: string
  email: string
  phone?: string
  clientType: string
  leadScore: number
  notes?: string
  interactions: Array<{
    id: string
    type: string
    createdAt: string
  }>
  tasks: Array<{
    id: string
    title: string
    status: string
  }>
}

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return

    setLoading(true)
    setHasSearched(true)

    try {
      const response = await axios.get(`/api/search?q=${encodeURIComponent(query)}`)
      setResults(response.data.clients)
    } catch (error) {
      console.error('Erro na busca:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    if (score >= 40) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'customer': return 'bg-green-100 text-green-800'
      case 'lead': return 'bg-blue-100 text-blue-800'
      case 'prospect': return 'bg-gray-100 text-gray-800'
      case 'inactive': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow p-6 text-white">
        <div className="flex items-center mb-4">
          <Brain className="w-8 h-8 mr-3" />
          <div>
            <h3 className="text-xl font-semibold">Busca Inteligente com IA</h3>
            <p className="text-purple-100">
              Use linguagem natural para encontrar clientes
            </p>
          </div>
        </div>
        
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-white opacity-70" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ex: clientes interessados em produto X, prospects com alta pontuação, quem não foi contactado..."
              className="w-full pl-12 pr-4 py-3 bg-white bg-opacity-25 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-80 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 focus:bg-white focus:bg-opacity-30"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="px-6 py-3 bg-white text-purple-600 rounded-lg font-medium hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </div>

      {/* Exemplos de Busca */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          💡 Exemplos de buscas inteligentes:
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            'Clientes com alta pontuação de lead',
            'Prospects que não foram contactados',
            'Clientes interessados em automação',
            'Leads com tarefas pendentes',
            'Clientes ativos com baixo engagement',
            'Prospects quentes para follow-up'
          ].map((example, index) => (
            <button
              key={index}
              onClick={() => setQuery(example)}
              className="text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm text-gray-700"
            >
              &quot;{example}&quot;
            </button>
          ))}
        </div>
      </div>

      {/* Resultados */}
      {hasSearched && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Resultados da Busca
              {results.length > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({results.length} {results.length === 1 ? 'cliente encontrado' : 'clientes encontrados'})
                </span>
              )}
            </h3>
            {query && (
              <p className="text-sm text-gray-600 mt-1">
                Busca: &quot;{query}&quot;
              </p>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-gray-600">
                IA analisando sua consulta...
              </span>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12">
              <Search className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Nenhum cliente encontrado
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Tente reformular sua busca ou usar termos diferentes.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {results.map((client) => (
                <div key={client.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">
                          {client.name}
                        </h4>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(client.clientType)}`}>
                          {client.clientType}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getScoreColor(client.leadScore)}`}>
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {client.leadScore}%
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {client.email}
                        </div>
                        {client.phone && (
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            {client.phone}
                          </div>
                        )}
                      </div>

                      {client.notes && (
                        <p className="text-sm text-gray-600 mb-2 bg-gray-50 p-2 rounded">
                          <strong>Notas:</strong> {client.notes}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <span>
                          {client.interactions.length} interações
                        </span>
                        <span>
                          {client.tasks.filter(t => t.status === 'pending').length} tarefas pendentes
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors">
                        Ver Detalhes
                      </button>
                      <button className="px-3 py-1 text-sm text-green-600 border border-green-600 rounded hover:bg-green-50 transition-colors">
                        Gerar Mensagem
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Como Funciona */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h4 className="text-sm font-medium text-blue-900 mb-3">
          🤖 Como funciona a busca inteligente:
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
          <div>
            <h5 className="font-medium mb-2">Linguagem Natural:</h5>
            <ul className="space-y-1">
              <li>• Use frases completas e descritivas</li>
              <li>• Mencione características específicas</li>
              <li>• Combine múltiplos critérios</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium mb-2">Inteligência Artificial:</h5>
            <ul className="space-y-1">
              <li>• Entende contexto e intenção</li>
              <li>• Analisa perfis e comportamentos</li>
              <li>• Ranqueia por relevância</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
