# Variáveis de Ambiente - ClientPulse CRM

Este arquivo lista todas as variáveis de ambiente necessárias para executar o ClientPulse CRM com todas as funcionalidades habilitadas.

## 🔐 Autenticação e Segurança

```bash
JWT_SECRET=sua-chave-jwt-super-secreta-aqui
NEXTAUTH_SECRET=sua-chave-nextauth-aqui
NEXTAUTH_URL=http://localhost:3000
```

## 📊 Banco de Dados

```bash
# PostgreSQL (recomendado para produção)
DATABASE_URL="postgresql://username:password@localhost:5432/clientpulse"

# Ou SQLite (desenvolvimento)
DATABASE_URL="file:./dev.db"
```

## 📧 Email (SendGrid)

```bash
SENDGRID_API_KEY=SG.seu-api-key-do-sendgrid-aqui
SENDGRID_FROM_EMAIL=noreply@seudominio.com
SENDGRID_FROM_NAME="ClientPulse CRM"
```

## 📱 WhatsApp e SMS (Twilio)

```bash
TWILIO_ACCOUNT_SID=seu-account-sid-do-twilio
TWILIO_AUTH_TOKEN=seu-auth-token-do-twilio
TWILIO_PHONE_NUMBER=+551199999999
TWILIO_WHATSAPP_NUMBER=whatsapp:+551199999999
```

## 📅 Google Calendar

```bash
GOOGLE_CLIENT_ID=seu-google-client-id
GOOGLE_CLIENT_SECRET=seu-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

## 🤖 OpenAI (opcional - para IA)

```bash
OPENAI_API_KEY=sk-sua-chave-openai-aqui
```

## ⚙️ Configurações do Sistema

```bash
NODE_ENV=development
PORT=3000
```

---

## 📋 Como Configurar

### 1. SendGrid (Email)
1. Acesse [SendGrid](https://sendgrid.com)
2. Crie uma conta gratuita (100 emails/dia)
3. Gere uma API key em Settings > API Keys
4. Configure o email remetente verificado

### 2. Twilio (WhatsApp/SMS)
1. Acesse [Twilio](https://twilio.com)
2. Crie uma conta gratuita ($15 de crédito)
3. Obtenha Account SID e Auth Token do dashboard
4. Para WhatsApp: Configure o sandbox no console

### 3. Google Calendar
1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um projeto ou use existente
3. Habilite a Calendar API
4. Crie credenciais OAuth 2.0
5. Configure as URLs de redirect

### 4. Banco de Dados
```bash
# Instalar PostgreSQL localmente ou usar Docker
docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres

# Executar migrações do Prisma
npx prisma migrate dev
npx prisma generate
```

## 🚀 Exemplo de .env.local

```bash
# Copie este conteúdo para .env.local
DATABASE_URL="postgresql://postgres:password@localhost:5432/clientpulse"
JWT_SECRET="minha-chave-super-secreta-123"
NEXTAUTH_SECRET="outra-chave-secreta-456"
NEXTAUTH_URL="http://localhost:3000"

# SendGrid
SENDGRID_API_KEY="SG.exemplo-key-aqui"
SENDGRID_FROM_EMAIL="noreply@clientpulse.com"
SENDGRID_FROM_NAME="ClientPulse CRM"

# Twilio
TWILIO_ACCOUNT_SID="AC1234567890abcdef"
TWILIO_AUTH_TOKEN="seu-auth-token"
TWILIO_PHONE_NUMBER="+5511999999999"
TWILIO_WHATSAPP_NUMBER="whatsapp:+5511999999999"

# Google
GOOGLE_CLIENT_ID="seu-client-id.googleusercontent.com"
GOOGLE_CLIENT_SECRET="seu-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"

# OpenAI (opcional)
OPENAI_API_KEY="sk-exemplo-key"
```

## ⚠️ Importante

- **NUNCA** commite o arquivo `.env.local` no Git
- Use valores diferentes para desenvolvimento e produção
- Mantenha as chaves seguras e rotacione periodicamente
- Para produção, use serviços de gerenciamento de secrets (AWS Secrets Manager, etc.)

## 🎯 Funcionalidades por Serviço

### SendGrid habilitado:
- ✅ Emails de boas-vindas
- ✅ Lembretes de tarefas
- ✅ Newsletters
- ✅ Follow-ups automáticos

### Twilio habilitado:
- ✅ WhatsApp automático
- ✅ SMS de notificação
- ✅ Alertas de leads quentes
- ✅ Lembretes urgentes

### Google Calendar habilitado:
- ✅ Sincronização de reuniões
- ✅ Criação automática de eventos
- ✅ Notificações de agenda
- ✅ Integração com CRM

### Todas configuradas:
- 🚀 Sistema de automação completo
- 🎯 Marketing multicanal
- 📊 Relatórios avançados
- ⚡ Workflows inteligentes
