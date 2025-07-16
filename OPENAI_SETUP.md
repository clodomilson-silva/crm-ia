# 🔑 Configuração da API OpenAI

## 1. Obter Chave da API

1. Acesse [https://platform.openai.com/](https://platform.openai.com/)
2. Faça login ou crie uma conta
3. Vá em **API Keys** no menu lateral
4. Clique em **Create new secret key**
5. Copie a chave (começa com `sk-proj-...`)

## 2. Configurar no Projeto

Edite o arquivo `.env` na raiz do projeto:

```env
# OpenAI API Key
OPENAI_API_KEY=sk-proj-sua-chave-aqui

# Outras configurações
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
```

## 3. Custos da API

### Modelos Utilizados
- **GPT-4o-mini**: ~$0.15/1M tokens de entrada, ~$0.60/1M tokens de saída
- **Uso típico**: 2-5 centavos por análise/geração

### Estimativa de Custos
- **Análise de cliente**: ~500 tokens = $0.001
- **Geração de mensagem**: ~300 tokens = $0.0005  
- **Busca semântica**: ~200 tokens = $0.0003

**Total mensal estimado** (100 clientes ativos): **$2-5 USD**

## 4. Testando a Configuração

1. Reinicie o servidor: `npm run dev`
2. Tente cadastrar um novo cliente
3. Verifique se o lead score é calculado automaticamente
4. Teste o gerador de mensagens

## 5. Modelos Alternativos

### Para Reduzir Custos
```typescript
// src/lib/openai.ts
model: 'gpt-3.5-turbo' // Mais barato
```

### Para Melhor Qualidade
```typescript
// src/lib/openai.ts
model: 'gpt-4' // Mais preciso, mais caro
```

## 6. Monitoramento de Uso

- **Dashboard OpenAI**: [https://platform.openai.com/usage](https://platform.openai.com/usage)
- **Limits**: Configure limites mensais para evitar surpresas
- **Logs**: Monitore via console do navegador (F12)

## 7. Solução de Problemas

### Erro: "API key not found"
- Verifique se a chave está no arquivo `.env`
- Reinicie o servidor após editar `.env`
- Certifique-se que não há espaços extras

### Erro: "Insufficient quota"
- Adicione créditos na conta OpenAI
- Ou use modelo mais barato

### Erro: "Rate limit exceeded"
- Aguarde alguns minutos
- Configure rate limiting no código se necessário

## 8. Funcionalidades sem API

Se não quiser usar a API da OpenAI imediatamente, o sistema ainda funciona:

- ✅ Cadastro e gestão de clientes
- ✅ Tarefas manuais
- ✅ Histórico de interações
- ❌ Lead scoring automático
- ❌ Geração de mensagens
- ❌ Busca semântica

O lead score padrão será 50% e as funcionalidades de IA mostrarão mensagens de erro amigáveis.
