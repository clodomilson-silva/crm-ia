'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Settings, Sun, Moon, Monitor, MessageCircle, Bell, Shield, Database, Palette } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { TemplateButton } from './PageTemplate';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [soundNotifications, setSoundNotifications] = useState(true);

  const themeOptions = [
    { value: 'light', label: 'Claro', icon: Sun, description: 'Tema claro para uso diurno' },
    { value: 'dark', label: 'Escuro', icon: Moon, description: 'Tema escuro para reduzir fadiga visual' },
    { value: 'system', label: 'Sistema', icon: Monitor, description: 'Segue a preferência do sistema' }
  ];

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent(
      'Olá! Preciso de suporte técnico no ClientPulse. Poderia me ajudar?'
    );
    const whatsappUrl = `https://wa.me/5598985102248?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0" 
      style={{ zIndex: 999999 }}
    >
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
        style={{ zIndex: 999999 }}
      />
      <div 
        className="relative h-full overflow-y-auto"
        style={{ zIndex: 1000000 }}
      >
        <div className="min-h-full flex items-start sm:items-center justify-center p-4 sm:p-6">
          <div 
            className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-2xl my-8"
            onClick={(e) => e.stopPropagation()}
            style={{ zIndex: 1000001 }}
          >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Configurações</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
          {/* Aparência */}
          <section>
            <div className="flex items-center space-x-2 sm:space-x-3 mb-4">
              <Palette className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Aparência</h3>
            </div>
            <div className="space-y-3">
              {themeOptions.map((option) => {
                const IconComponent = option.icon;
                const isActive = theme === option.value;
                
                return (
                  <button
                    key={option.value}
                    onClick={() => setTheme(option.value as 'light' | 'dark')}
                    className={`w-full flex items-center p-3 sm:p-4 rounded-xl border-2 transition-all ${
                      isActive 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 mr-3 sm:mr-4 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-500 dark:text-gray-400'}`} />
                    <div className="text-left flex-1 min-w-0">
                      <div className="font-medium text-sm sm:text-base">{option.label}</div>
                      <div className={`text-xs sm:text-sm ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`}>
                        {option.description}
                      </div>
                    </div>
                    {isActive && (
                      <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Notificações */}
          <section>
            <div className="flex items-center space-x-2 sm:space-x-3 mb-4">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Notificações</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
                <div className="flex-1 min-w-0 mr-3">
                  <div className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Notificações Push</div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Receber notificações no navegador</div>
                </div>
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors flex-shrink-0 ${
                    notifications ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                      notifications ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
                <div className="flex-1 min-w-0 mr-3">
                  <div className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Notificações por Email</div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Receber resumos e alertas por email</div>
                </div>
                <button
                  onClick={() => setEmailNotifications(!emailNotifications)}
                  className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors flex-shrink-0 ${
                    emailNotifications ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                      emailNotifications ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
                <div className="flex-1 min-w-0 mr-3">
                  <div className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Sons de Notificação</div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Reproduzir sons para notificações</div>
                </div>
                <button
                  onClick={() => setSoundNotifications(!soundNotifications)}
                  className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors flex-shrink-0 ${
                    soundNotifications ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                      soundNotifications ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Suporte */}
          <section>
            <div className="flex items-center space-x-2 sm:space-x-3 mb-4">
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Suporte</h3>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-xl p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="bg-green-100 dark:bg-green-800 p-2 sm:p-3 rounded-full flex-shrink-0">
                  <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">
                    Precisa de ajuda?
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                    Nossa equipe de suporte está pronta para ajudar você a aproveitar ao máximo o ClientPulse.
                  </p>
                  <TemplateButton
                    variant="primary"
                    onClick={handleWhatsAppContact}
                    className="w-full sm:w-auto bg-green-600 hover:bg-green-700 focus:ring-green-500 text-sm"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Entrar em Contato
                  </TemplateButton>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">
                    WhatsApp: (98) 98510-2248
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Segurança */}
          <section>
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Segurança e Privacidade</h3>
            </div>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-gray-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Alterar Senha</div>
                    <div className="text-sm text-gray-500">Manter sua conta segura</div>
                  </div>
                </div>
                <div className="text-gray-400">→</div>
              </button>

              <button className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                <div className="flex items-center space-x-3">
                  <Database className="w-5 h-5 text-gray-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Privacidade dos Dados</div>
                    <div className="text-sm text-gray-500">Gerenciar suas informações</div>
                  </div>
                </div>
                <div className="text-gray-400">→</div>
              </button>
            </div>
          </section>

          {/* Sobre */}
          <section>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-2">ClientPulse</h4>
              <p className="text-sm text-gray-600 mb-2">
                Versão 2.0.0 • Sistema inteligente de gestão de clientes
              </p>
              <p className="text-xs text-gray-500">
                © 2025 ClientPulse. Todos os direitos reservados.
              </p>
            </div>
          </section>
        </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
