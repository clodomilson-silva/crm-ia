# 🤖 CRM com IA - Sistema Inteligente de Gestão de Clientes

Um mini CRM moderno e inteligente construído com **Next.js**, **TypeScript**, **Prisma** e **Google Generative AI**, voltado para controle de clientes, geração de leads e automação de mensagens com auxílio de IA.

## 🔥 **NOVA CONFIGURAÇÃO**: Google Generative AI Integrado!

Este CRM agora utiliza **Google Generative AI (Gemini)** como provedor único de IA:
- 🥇 **Gemini 1.5 Flash** - Rápido, confiável e poderoso
- 🔑 **API Key Simples** - Configuração direta sem OAuth2  
- 🌐 **Endpoint Direto** - `generativelanguage.googleapis.com`

➡️ **API Key configurada:** `AIzaSyBf1GJuNXCejk7iIn3GLQHscyh2vISpxRk`

## ✨ Funcionalidades

| 📋 Recurso | 📝 Descrição | 🤖 IA Envolvida? |
|-----------|-------------|------------------|
| **📇 Cadastro de Clientes** | Nome, e-mail, telefone, tipo de cliente | ❌ |
| **📊 Lead Scoring** | IA classifica o quão quente está o cliente com base em dados | ✅ |
| **🧠 Sugestão de Ação** | IA recomenda: "Envie um WhatsApp", "Ligue amanhã" | ✅ |
| **📝 Gerar mensagem personalizada** | IA cria texto de e-mail, WhatsApp ou proposta comercial | ✅ |
| **📅 Follow-up automatizado** | Agendamento de tarefas e mensagens com IA | ✅ |
| **🔍 Pesquisa inteligente** | Busca com NLP para encontrar clientes por intenção | ✅ |
| **🔄 Sistema Confiável** | Google Generative AI com alta disponibilidade | ✅ |

## 🚀 Como Executar

### 1. Clone e Instale Dependências

```bash
git clone <seu-repositorio>
cd crm-ia
npm install
```

### 2. Configure o Banco de Dados

```bash
# Gerar cliente Prisma
npm run db:generate

# Criar banco SQLite
npm run db:push

# Popular com dados de exemplo
npm run db:seed
```

### 3. Configure a API do Google

A API Key já está configurada no sistema. Para verificar o status:

```bash
# Testar configuração
curl http://localhost:3000/api/test-env
```

### 4. Execute o Projeto

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 🎯 Como Usar o Sistema

### 📊 Dashboard
- **Visão geral** dos clientes, lead scores e tarefas
- **Estatísticas** em tempo real
- **Tarefas urgentes** e clientes recentes

### 👥 Gestão de Clientes
- **Cadastrar novos clientes** com análise automática de IA
- **Visualizar lista** com filtros avançados
- **Lead scoring automático** baseado em perfil e histórico
- **Sugestões de ação** geradas por IA

### 💬 Gerador de Mensagens
- **Selecione um cliente** da base
- **Escolha o tipo**: E-mail, WhatsApp ou Proposta
- **Defina o tom**: Formal, Casual ou Amigável  
- **Descreva o contexto** e a IA gera a mensagem perfeita
- **Copia e cola** para usar onde quiser

### 📋 Gestão de Tarefas
- **Tarefas criadas automaticamente** pela IA ao cadastrar clientes
- **Filtros por status** e prioridade
- **Visualização de tarefas do dia** em destaque
- **Marcar como concluída** com um clique

### 🔍 Busca Inteligente
Use **linguagem natural** para encontrar clientes:

- *"Clientes com alta pontuação de lead"*
- *"Prospects que não foram contactados"*
- *"Clientes interessados em automação"*
- *"Leads com tarefas pendentes"*

## 🏗️ Arquitetura Técnica

### **Frontend**
- **Next.js 15** com App Router
- **TypeScript** para type safety
- **Tailwind CSS** para estilização
- **Lucide React** para ícones

### **Backend** 
- **API Routes** do Next.js
- **Prisma ORM** para banco de dados
- **SQLite** para simplicidade (facilmente mudável)

### **Inteligência Artificial**
- **DeepSeek Chat** para análise e geração de conteúdo
- **Análise semântica** para busca inteligente
- **Lead scoring** baseado em padrões
- **50-70% mais econômico** que soluções concorrentes

### **Banco de Dados**
```sql
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│   Client    │────│ Interaction  │    │    Task     │
├─────────────┤    ├──────────────┤    ├─────────────┤
│ id          │    │ id           │    │ id          │
│ name        │    │ clientId     │    │ clientId    │
│ email       │    │ type         │    │ title       │
│ phone       │    │ content      │    │ description │
│ clientType  │    │ aiGenerated  │    │ type        │
│ leadScore   │    │ createdAt    │    │ priority    │
│ notes       │    └──────────────┘    │ status      │
│ createdAt   │                        │ dueDate     │
│ updatedAt   │                        │ aiSuggested │
└─────────────┘                        └─────────────┘
```

## 📱 Exemplos de Uso da IA

### 🎯 Lead Scoring
Quando você cadastra um cliente, a IA analisa:
- **Nome e email** (empresa, domínio)
- **Tipo de cliente** selecionado
- **Notas e contexto** fornecidos
- **Padrões históricos** (se houver)

**Resultado**: Score de 0-100% e sugestão de próxima ação.

### ✍️ Geração de Mensagens

**Exemplo de entrada:**
- Cliente: João Silva (joao@empresa.com)
- Tipo: WhatsApp
- Tom: Amigável
- Contexto: "Cliente interessado em automação, orçamento até R$ 50k"

**Saída do Google Generative AI:**
```
Oi João! 😊

Espero que esteja bem! Pensando na nossa conversa sobre automação, preparei algumas opções que se encaixam perfeitamente no seu orçamento de até R$ 50k.

Que tal agendarmos 15min para eu te mostrar como podemos otimizar os processos da sua empresa?

Quando seria melhor para você esta semana?

Abraços!
```

### 🔍 Busca Semântica

**Consulta**: *"Clientes interessados em produto X com orçamento alto"*

A IA analisa:
- **Notas dos clientes** mencionando "produto X"
- **Lead score alto** (indica orçamento)
- **Histórico de interações** relevantes
- **Tipo de cliente** (customers > leads > prospects)

**Resultado**: Lista ranqueada por relevância.

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Inicia servidor de produção

# Banco de Dados
npm run db:generate  # Gera cliente Prisma
npm run db:push      # Sincroniza schema com DB
npm run db:seed      # Popula com dados de exemplo
npm run db:studio    # Abre Prisma Studio
npm run db:reset     # Reseta DB e popula novamente

# Qualidade
npm run lint         # Executa ESLint
```

## 🔧 Configuração da IA

### API Status e Monitoramento
Para verificar o status da Google AI:

```bash
# Via navegador
http://localhost:3000/api/test-env

# Via curl
curl http://localhost:3000/api/test-env
```

### Personalizando Prompts
Edite `src/lib/vertex-ai.ts` para:
- Ajustar prompts de mensagens
- Mudar temperatura para respostas mais criativas ou precisas
- Configurar parâmetros do modelo
- Adicionar novas funções de IA

### Configuração do Banco de Dados
Para usar PostgreSQL ao invés de SQLite:

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

```env
# .env.local
DATABASE_URL="postgresql://user:password@localhost:5432/crm_ia"
GOOGLE_AI_API_KEY="sua-api-key-aqui"
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch: `git checkout -b nova-funcionalidade`
3. Commit: `git commit -m 'Adiciona nova funcionalidade'`
4. Push: `git push origin nova-funcionalidade`
5. Abra um Pull Request

## 📞 Suporte

- **Documentação**: Este README
- **Issues**: issue no GitHub
- **Discord**: dev_clodomilson

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

**🚀 Desenvolvido com ❤️ e Google AI para revolucionar a gestão de clientes!**
