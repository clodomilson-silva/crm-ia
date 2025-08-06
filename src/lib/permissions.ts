import { UserAuth } from './auth'

// Funções para controle de acesso a recursos PRO
export function hasProAccess(user: UserAuth): boolean {
  // Administradores sempre têm acesso PRO
  if (user.role === 'admin') {
    return true
  }
  
  // Usuários precisam ter plano PRO ou PREMIUM
  return user.plan === 'PRO' || user.plan === 'PREMIUM'
}

export function hasPremiumAccess(user: UserAuth): boolean {
  // Administradores sempre têm acesso PREMIUM
  if (user.role === 'admin') {
    return true
  }
  
  // Usuários precisam ter plano PREMIUM
  return user.plan === 'PREMIUM'
}

export function requireProAccess(user: UserAuth): void {
  if (!hasProAccess(user)) {
    throw new Error('Acesso negado: Funcionalidade requer plano PRO ou superior')
  }
}

export function requirePremiumAccess(user: UserAuth): void {
  if (!hasPremiumAccess(user)) {
    throw new Error('Acesso negado: Funcionalidade requer plano PREMIUM')
  }
}

// Middleware para verificar acesso PRO em APIs
export function checkProFeature(user: UserAuth): { hasAccess: boolean; message?: string } {
  if (hasProAccess(user)) {
    return { hasAccess: true }
  }
  
  return {
    hasAccess: false,
    message: user.role === 'admin' 
      ? 'Erro interno: Admin deveria ter acesso total'
      : 'Upgrade para PRO necessário para usar esta funcionalidade'
  }
}

// Verificar se recursos específicos estão disponíveis
export function getFeatureAccess(user: UserAuth) {
  const isAdmin = user.role === 'admin'
  const hasPro = hasProAccess(user)
  const hasPremium = hasPremiumAccess(user)
  
  return {
    // Recursos básicos (sempre disponíveis)
    basicCRM: true,
    clientManagement: true,
    taskManagement: true,
    
    // Recursos PRO (admin sempre tem, usuários precisam de plano PRO+)
    emailAutomation: isAdmin || hasPro,
    whatsappIntegration: isAdmin || hasPro,
    smsNotifications: isAdmin || hasPro,
    googleCalendar: isAdmin || hasPro,
    automationRules: isAdmin || hasPro,
    
    // Recursos PREMIUM (admin sempre tem, usuários precisam de plano PREMIUM)
    advancedAnalytics: isAdmin || hasPremium,
    customIntegrations: isAdmin || hasPremium,
    aiInsights: isAdmin || hasPremium,
    unlimitedContacts: isAdmin || hasPremium,
    
    // Informações do usuário
    userRole: user.role,
    userPlan: user.plan || 'FREE',
    isAdmin
  }
}
