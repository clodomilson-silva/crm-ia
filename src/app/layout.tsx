import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@/lib/suppressWarnings";
import { CRMProvider } from "@/contexts/CRMContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
  fallback: ['system-ui', 'arial'],
});

export const metadata: Metadata = {
  title: "CRM AI - Sistema Inteligente de Gestão de Clientes",
  description: "Sistema CRM com inteligência artificial para controle de clientes, geração de leads e automação de mensagens com DeepSeek",
  keywords: "CRM, IA, Inteligência Artificial, Gestão de Clientes, DeepSeek, Automação",
  authors: [{ name: "CRM AI Team" }],
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
        <CRMProvider>
          {children}
        </CRMProvider>
      </body>
    </html>
  );
}
