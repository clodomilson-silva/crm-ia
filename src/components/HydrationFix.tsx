'use client'

import { useEffect } from 'react'

export default function HydrationFix() {
  useEffect(() => {
    // Limpar atributos adicionados por extensões do navegador que causam hydration mismatch
    const cleanupBrowserExtensionAttributes = () => {
      if (typeof window !== 'undefined') {
        const body = document.body
        
        // Lista de atributos comuns adicionados por extensões
        const extensionAttributes = [
          'inmaintabuse',
          'data-rm-theme',
          'data-new-gr-c-s-check-loaded',
          'data-gr-ext-installed',
          'cz-shortcut-listen',
          'data-darkreader-mode',
          'data-darkreader-scheme'
        ]
        
        // Remove atributos problemáticos
        extensionAttributes.forEach(attr => {
          if (body.hasAttribute(attr)) {
            body.removeAttribute(attr)
          }
        })
      }
    }

    // Executa a limpeza após a hidratação
    cleanupBrowserExtensionAttributes()
    
    // Monitora mudanças e limpa novamente se necessário
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.target === document.body) {
          cleanupBrowserExtensionAttributes()
        }
      })
    })

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: [
        'inmaintabuse',
        'data-rm-theme',
        'data-new-gr-c-s-check-loaded',
        'data-gr-ext-installed',
        'cz-shortcut-listen',
        'data-darkreader-mode',
        'data-darkreader-scheme'
      ]
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  return null
}
