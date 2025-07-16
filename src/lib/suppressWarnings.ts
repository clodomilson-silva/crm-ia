// Suprimir warnings específicos de hidratação durante desenvolvimento
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Interceptar console.warn para filtrar warnings específicos de hidratação
  const originalWarn = console.warn
  
  console.warn = (...args) => {
    const message = args.join(' ')
    
    // Filtrar warnings específicos de hidratação relacionados a extensões
    const shouldSuppressWarning = [
      'A tree hydrated but some attributes of the server rendered HTML didn\'t match the client properties',
      'inmaintabuse',
      'data-rm-theme',
      'data-new-gr-c-s-check-loaded',
      'data-gr-ext-installed',
      'cz-shortcut-listen',
      'data-darkreader'
    ].some(warning => message.includes(warning))
    
    if (!shouldSuppressWarning) {
      originalWarn.apply(console, args)
    }
  }
}

export {}
