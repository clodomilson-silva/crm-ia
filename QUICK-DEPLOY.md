# 🚀 Deploy Rápido via Vercel

## Método 1: Deploy via GitHub (Recomendado)

1. **Acesse** [vercel.com](https://vercel.com)
2. **Conecte** sua conta GitHub
3. **Importe** este repositório: `clodomilson-silva/crm-ia`
4. **Configure** as variáveis de ambiente:
   - `DATABASE_URL`: Connection string do PostgreSQL
   - `DEEPSEEK_API_KEY`: Sua chave da API DeepSeek

## Método 2: Deploy via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy direto
vercel

# Seguir prompts:
# - Link to existing project? N
# - Project name: crm-ia
# - Directory: ./
# - Override settings? N
```

## ⚡ Quick Start

**1. Database:** [Supabase](https://supabase.com) → Novo projeto → Copie connection string

**2. API Key:** [DeepSeek](https://platform.deepseek.com/api_keys) → Criar nova chave

**3. Deploy:** GitHub + Vercel = Automático! 

## 🔧 Variáveis Necessárias

```env
DATABASE_URL=postgresql://postgres:password@host:5432/database
DEEPSEEK_API_KEY=sk-deepseek-your-key
```

**✅ Tudo pronto para produção!**
