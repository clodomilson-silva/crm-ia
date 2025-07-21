# 🚀 Deploy do CRM-IA na Vercel

## Pré-requisitos

1. **Conta na Vercel**: [vercel.com](https://vercel.com)
2. **Banco PostgreSQL**: Recomendado usar [Supabase](https://supabase.com) ou [Neon](https://neon.tech)
3. **API Key DeepSeek**: [platform.deepseek.com](https://platform.deepseek.com)

## Passos para Deploy

### 1. Preparar o Banco de Dados

**Opção A: Supabase (Recomendado)**
1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Vá em Settings > Database
4. Copie a "Connection String" (formato: `postgresql://...`)

**Opção B: Neon**
1. Acesse [neon.tech](https://neon.tech)
2. Crie um novo projeto
3. Copie a connection string

### 2. Fazer Deploy na Vercel

**Via GitHub (Recomendado):**
1. Faça push do código para GitHub
2. Acesse [vercel.com](https://vercel.com)
3. Clique em "Add New Project"
4. Selecione seu repositório
5. Configure as variáveis de ambiente

**Via CLI:**
```bash
npm i -g vercel
vercel --prod
```

### 3. Configurar Variáveis de Ambiente

No painel da Vercel, adicione:

```
DATABASE_URL=postgresql://user:pass@host:port/db?sslmode=require
DEEPSEEK_API_KEY=sua-chave-aqui
NEXTAUTH_URL=https://seu-app.vercel.app
NEXTAUTH_SECRET=um-secret-aleatorio
```

### 4. Executar Migrações

Após o deploy, execute no terminal da Vercel ou localmente:

```bash
npx prisma db push
npx prisma db seed
```

## Scripts Disponíveis

- `npm run build` - Build para produção
- `npm run vercel-build` - Build com setup do banco
- `npm run db:push` - Aplicar schema no banco
- `npm run db:seed` - Popular banco com dados de exemplo

## Troubleshooting

### Erro: "PrismaClientInitializationError"
- Verifique se DATABASE_URL está correto
- Certifique-se que o banco está acessível

### Erro: "DeepSeek API not configured"
- Verifique se DEEPSEEK_API_KEY está definido
- Confirme se a chave está válida

### Build failing
- Execute `npm run build` localmente primeiro
- Verifique se todas as dependências estão no package.json

## URLs Importantes

- **Produção**: https://seu-app.vercel.app
- **Banco Supabase**: https://app.supabase.com
- **Painel Vercel**: https://vercel.com/dashboard
- **DeepSeek API**: https://platform.deepseek.com

## Suporte

Se encontrar problemas, verifique:
1. Logs no painel da Vercel
2. Configuração das variáveis de ambiente
3. Status da conexão com o banco
