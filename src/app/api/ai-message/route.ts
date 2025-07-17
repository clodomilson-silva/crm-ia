import { NextResponse } from 'next/server'
import { generateMessage } from '@/lib/deepseek'

export async function POST(req: Request) {
  try {
    const { clientName, messageType, context, tone } = await req.json()

    if (!clientName || !messageType || !context) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: clientName, messageType, context' },
        { status: 400 }
      )
    }

    const message = await generateMessage(clientName, messageType, context, tone)

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Erro na API ai-message:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
