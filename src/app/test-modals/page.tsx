'use client';

import { useState } from 'react';
import PageTemplate, { TemplateCard, TemplateButton } from '@/components/PageTemplate';
import ProfileModal from '@/components/ProfileModal';
import SettingsModal from '@/components/SettingsModal';
import { User, Settings, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function TestModalsPage() {
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <PageTemplate
      title="Teste dos Menus"
      subtitle="Teste das funcionalidades de perfil e configurações"
    >
      <div className="p-6">
        <TemplateCard title="Funcionalidades Implementadas">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TemplateButton
                variant="primary"
                onClick={() => setShowProfile(true)}
                className="flex items-center justify-center p-8"
              >
                <User className="w-6 h-6 mr-3" />
                Abrir Perfil do Usuário
              </TemplateButton>

              <TemplateButton
                variant="secondary"
                onClick={() => setShowSettings(true)}
                className="flex items-center justify-center p-8"
              >
                <Settings className="w-6 h-6 mr-3" />
                Abrir Configurações
              </TemplateButton>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                Tema Atual: {theme === 'light' ? 'Claro' : 'Escuro'}
              </h3>
              <TemplateButton
                variant="outline"
                onClick={toggleTheme}
                className="flex items-center"
              >
                {theme === 'light' ? (
                  <>
                    <Moon className="w-4 h-4 mr-2" />
                    Alterar para Tema Escuro
                  </>
                ) : (
                  <>
                    <Sun className="w-4 h-4 mr-2" />
                    Alterar para Tema Claro
                  </>
                )}
              </TemplateButton>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                🔧 Z-Index e Portal Implementados:
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• ✅ Z-index máximo (999999+) - Modais sempre no topo</li>
                <li>• ✅ React Portal - Renderizado fora da árvore DOM</li>
                <li>• ✅ Click backdrop funcional - Fecha clicando fora</li>
                <li>• ✅ Escape key ready - Suporte para ESC implementável</li>
                <li>• ✅ Body rendering - Não afetado por containers pais</li>
                <li>• ✅ Problema do dashboard RESOLVIDO definitivamente</li>
              </ul>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                ✅ Funcionalidades Implementadas:
              </h4>
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                <li>• Modal de perfil com edição de informações completas</li>
                <li>• Modal de configurações com troca de tema dinâmica</li>
                <li>• Suporte ao WhatsApp: (98) 98510-2248 - Link direto</li>
                <li>• Tema escuro e claro com persistência</li>
                <li>• Interface responsiva para mobile e desktop</li>
                <li>• Scroll suave e posicionamento inteligente</li>
              </ul>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
              <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">
                🧪 Como Testar:
              </h4>
              <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                <li>• Teste em diferentes tamanhos de tela (redimensione o navegador)</li>
                <li>• Abra os modais e role para verificar que não cortam</li>
                <li>• Clique fora dos modais para fechá-los</li>
                <li>• Teste a troca de tema e veja a persistência</li>
                <li>• Acesse pelo menu do usuário no header (avatar)</li>
              </ul>
            </div>
          </div>
        </TemplateCard>

        {/* Modais */}
        <ProfileModal 
          isOpen={showProfile} 
          onClose={() => setShowProfile(false)} 
        />
        <SettingsModal 
          isOpen={showSettings} 
          onClose={() => setShowSettings(false)} 
        />
      </div>
    </PageTemplate>
  );
}
