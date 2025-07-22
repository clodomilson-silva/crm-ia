# 🤖 Configuração de APIs de IA - Sistema Multi-Fallback

Este sistema suporta **múltiplas APIs de IA** com fallback automático para garantir alta disponibilidade. Configure pelo menos uma das opções abaixo.

## 🎯 APIs Configuradas (em ordem de prioridade)

### 1. 🥇 **DeepSeek R1 via OpenRouter** (Gratuita)
- **Modelo**: `deepseek/deepseek-r1`
- **Status**: ✅ Configurada e pronta para uso
- **Configuração**: 
  ```bash
  KIMI_API_KEY=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
  ```
- **Vantagens**: Modelo mais recente DeepSeek R1, gratuito, alta qualidade

### 2. 🥈 **DeepSeek Chat (OpenRouter)** (Gratuita)
- **Modelo**: `deepseek/deepseek-chat`
- **Status**: ✅ Configurada e pronta para uso
- **Configuração**:
  ```bash
  OPENROUTER_TNG_API_KEY=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
  ```
- **Vantagens**: Modelo estável e confiável, gratuito, mesmo provedor (OpenRouter)

## 🔄 Como Funciona o Sistema de Fallback

1. **Tentativa 1**: DeepSeek R1 (OpenRouter)
   - Se configurada e funcionando ✅
   - **Status Atual**: ✅ Modelo válido configurado

2. **Tentativa 2**: DeepSeek Chat (OpenRouter)
   - Se configurada e funcionando ✅
   - **Status Atual**: ✅ Pronta para uso
   - Se falhar ➡️ Fallback local

3. **Fallback Final**: Templates Inteligentes
   - Mensagens de alta qualidade
   - Funcionamento garantido offline

## 📋 Configuração Atual (.env.local)

```bash
# APIs de IA (Sistema de Fallback)
# API Principal - DeepSeek R1 via OpenRouter (Funcionando)
KIMI_API_KEY=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

# API Secundária - DeepSeek Chat (OpenRouter - Funcionando)  
OPENROUTER_TNG_API_KEY=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

# Database
DATABASE_URL="file:./dev.db"
```

## 🚀 Recomendações

### Para Desenvolvimento:
- Configure **DeepSeek** (gratuita) para testes básicos
- Configure **Groq** (gratuita) como backup principal

### Para Produção:
- Configure **todas as três APIs** para máxima confiabilidade
- Monitore logs para identificar qual API está sendo mais usada

## 📊 Monitoramento

O sistema exibe logs detalhados no console:

```
🔍 Verificando APIs disponíveis:
  DeepSeek (OpenRouter): ✅ Configurada
  Groq (Llama 3.1): ✅ Configurada  
  OpenAI (GPT-3.5): ❌ Não configurada

✅ 2 API(s) disponível(is) para uso

🔄 Tentando DeepSeek (OpenRouter)...
📡 DeepSeek (OpenRouter) - Status: 200
✅ DeepSeek (OpenRouter) - Sucesso!
🤖 Mensagem gerada por: DeepSeek (OpenRouter)
```

## 🛠️ Troubleshooting

### Erro 401 - Unauthorized
- Verifique se a chave está correta
- Confirme se não expirou
- Teste em https://console.groq.com/ ou https://openrouter.ai/

### Todas as APIs falharam
- O sistema automaticamente usa templates de fallback
- Funcionalidade completa mesmo offline
- Configure pelo menos uma API para melhor experiência

### Performance
- **Groq**: Mais rápida (~200ms)
- **DeepSeek**: Boa velocidade (~500ms)  
- **OpenAI**: Moderada (~1000ms)
