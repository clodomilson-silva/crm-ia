import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@/styles/clientpulse.css";
import "@/lib/suppressWarnings";
import { CRMProvider } from "@/contexts/CRMContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { PlanProvider } from "@/contexts/PlanContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import PlanModals from "@/components/PlanModals";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
  fallback: ['system-ui', 'arial'],
});

export const metadata: Metadata = {
  title: "ClientPulse - Sistema Inteligente de Gestão de Clientes",
  description: "ClientPulse: Sistema CRM com inteligência artificial para controle de clientes, geração de leads e automação de mensagens",
  keywords: "ClientPulse, CRM, IA, Inteligência Artificial, Gestão de Clientes, Automação, Sistema de Vendas",
  authors: [{ name: "ClientPulse Team" }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased bg-gradient-to-br from-gray-50 to-blue-50/30 min-h-screen`}
        suppressHydrationWarning={true}
      >
        <ThemeProvider>
          <AuthProvider>
            <PlanProvider>
              <CRMProvider>
                {children}
                <PlanModals />
              </CRMProvider>
            </PlanProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
