import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configurações para melhor desenvolvimento
  reactStrictMode: true,
  
  // Configurações de performance
  poweredByHeader: false,
  
  // Configurações de desenvolvimento
  ...(process.env.NODE_ENV === 'development' && {
    // Adiciona configurações específicas de desenvolvimento se necessário
  }),
};

export default nextConfig;
