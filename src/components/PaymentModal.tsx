'use client'

import { useState } from 'react'
import { X, CreditCard, Smartphone, Check, Loader } from 'lucide-react'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  selectedPlan: {
    id: string
    name: string
    price: string
  } | null
  onPaymentSuccess: () => void
}

export default function PaymentModal({ isOpen, onClose, selectedPlan, onPaymentSuccess }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix'>('card')
  const [loading, setLoading] = useState(false)
  const [pixGenerated, setPixGenerated] = useState(false)
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  })

  if (!isOpen || !selectedPlan) return null

  const handleCardDataChange = (field: string, value: string) => {
    setCardData(prev => ({ ...prev, [field]: value }))
  }

  const handlePixPayment = async () => {
    setLoading(true)
    // Simular geração do PIX
    setTimeout(() => {
      setPixGenerated(true)
      setLoading(false)
    }, 2000)
  }

  const handleCardPayment = async () => {
    setLoading(true)
    // Simular processamento do cartão
    setTimeout(() => {
      setLoading(false)
      onPaymentSuccess()
      onClose()
    }, 3000)
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Finalizar Pagamento</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Resumo do plano */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900">Plano {selectedPlan.name}</h3>
            <p className="text-2xl font-bold text-blue-600">{selectedPlan.price}/mês</p>
            <p className="text-sm text-gray-600 mt-1">Cobrança recorrente mensal</p>
          </div>

          {/* Métodos de pagamento */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Método de Pagamento</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMethod('card')}
                className={`p-4 border-2 rounded-lg flex items-center justify-center space-x-2 transition-colors ${
                  paymentMethod === 'card'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <CreditCard className="h-5 w-5" />
                <span>Cartão</span>
              </button>
              <button
                onClick={() => setPaymentMethod('pix')}
                className={`p-4 border-2 rounded-lg flex items-center justify-center space-x-2 transition-colors ${
                  paymentMethod === 'pix'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Smartphone className="h-5 w-5" />
                <span>PIX</span>
              </button>
            </div>
          </div>

          {/* Formulário de cartão */}
          {paymentMethod === 'card' && (
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número do Cartão
                </label>
                <input
                  type="text"
                  value={cardData.number}
                  onChange={(e) => handleCardDataChange('number', formatCardNumber(e.target.value))}
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={19}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Validade
                  </label>
                  <input
                    type="text"
                    value={cardData.expiry}
                    onChange={(e) => handleCardDataChange('expiry', formatExpiry(e.target.value))}
                    placeholder="MM/AA"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={5}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cardData.cvv}
                    onChange={(e) => handleCardDataChange('cvv', e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="123"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={4}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome no Cartão
                </label>
                <input
                  type="text"
                  value={cardData.name}
                  onChange={(e) => handleCardDataChange('name', e.target.value.toUpperCase())}
                  placeholder="NOME COMO ESTÁ NO CARTÃO"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* PIX */}
          {paymentMethod === 'pix' && !pixGenerated && (
            <div className="text-center mb-6">
              <p className="text-gray-600 mb-4">
                Clique no botão abaixo para gerar o código PIX
              </p>
            </div>
          )}

          {paymentMethod === 'pix' && pixGenerated && (
            <div className="text-center mb-6">
              <div className="bg-gray-100 p-6 rounded-lg mb-4">
                <div className="w-32 h-32 bg-gray-300 mx-auto mb-4 rounded-lg flex items-center justify-center">
                  <span className="text-gray-600">QR Code PIX</span>
                </div>
                <p className="font-mono text-sm bg-white p-2 rounded border">
                  00020126330014BR.GOV.BCB.PIX2511contato@clientpulse.com52040000530398654{selectedPlan.price.replace('R$ ', '').replace(',', '.')}5802BR5913CLIENTPULSE6009SAO PAULO
                </p>
              </div>
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <Check className="h-5 w-5" />
                <span>PIX gerado com sucesso!</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Após o pagamento, suas funcionalidades serão liberadas automaticamente
              </p>
            </div>
          )}

          {/* Botão de ação */}
          <button
            onClick={paymentMethod === 'card' ? handleCardPayment : handlePixPayment}
            disabled={loading || (paymentMethod === 'pix' && pixGenerated)}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            {loading && <Loader className="h-5 w-5 animate-spin" />}
            {paymentMethod === 'card' && !loading && <span>Pagar {selectedPlan.price}</span>}
            {paymentMethod === 'card' && loading && <span>Processando...</span>}
            {paymentMethod === 'pix' && !pixGenerated && !loading && <span>Gerar PIX</span>}
            {paymentMethod === 'pix' && !pixGenerated && loading && <span>Gerando PIX...</span>}
            {paymentMethod === 'pix' && pixGenerated && <span>Aguardando Pagamento</span>}
          </button>

          <div className="mt-4 text-xs text-gray-500 text-center">
            🔒 Pagamento seguro via Stripe • Cancele a qualquer momento
          </div>
        </div>
      </div>
    </div>
  )
}
