import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Temporarily disable strict mode to fix hydration issues
  reactStrictMode: false,
  
  // Configurações de performance
  poweredByHeader: false,
  
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
