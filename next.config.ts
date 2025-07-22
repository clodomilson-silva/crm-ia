import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configurações para melhor desenvolvimento
  reactStrictMode: true,
  
  // Configurações de performance
  poweredByHeader: false,
  
  // Configurações para produção na Vercel
  output: 'standalone',
  
  // Otimizações para build
  experimental: {
    optimizePackageImports: ['lucide-react', 'axios'],
  },
  
  // Configurações de desenvolvimento - permite acesso externo
  ...(process.env.NODE_ENV === 'development' && {
    assetPrefix: '',
  }),
};

export default nextConfig;
