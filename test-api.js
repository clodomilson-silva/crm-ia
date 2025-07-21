const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const API_KEY = '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'

async function testAPI() {
  try {
    console.log('Testando API OpenRouter...')
    console.log('API Key:', API_KEY.substring(0, 20) + '...')
    
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'CRM com IA',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        messages: [{ role: 'user', content: 'Diga apenas: API funcionando!' }],
        max_tokens: 50,
      }),
    })

    console.log('Status:', response.status)
    console.log('Status Text:', response.statusText)
    
    if (response.ok) {
      const data = await response.json()
      console.log('Sucesso:', data.choices?.[0]?.message?.content)
    } else {
      const errorData = await response.json().catch(() => ({}))
      console.log('Erro:', errorData)
    }
  } catch (error) {
    console.error('Erro de rede:', error)
  }
}

testAPI()
