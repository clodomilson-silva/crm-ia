import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { analyzeClient } from '@/lib/vertex-ai'
import { UpdateClientData } from '@/types/crm'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        interactions: {
          orderBy: { createdAt: 'desc' },
        },
        tasks: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ client })
  } catch (error) {
    console.error('Erro ao buscar cliente:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const data: UpdateClientData = await request.json()
    const { id } = await params

    const existingClient = await prisma.client.findUnique({
      where: { id },
      include: { interactions: true },
    })

    if (!existingClient) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }

    // Se dados importantes mudaram, re-analisar com IA
    let newLeadScore = existingClient.leadScore
    if (data.notes || data.clientType) {
      const analysis = await analyzeClient({
        name: data.name || existingClient.name,
        email: data.email || existingClient.email,
        phone: data.phone || existingClient.phone || undefined,
        notes: data.notes || existingClient.notes || undefined,
        interactionHistory: existingClient.interactions.map(i => i.content),
      })
      newLeadScore = analysis.leadScore
    }

    const client = await prisma.client.update({
      where: { id },
      data: {
        ...data,
        leadScore: newLeadScore,
      },
      include: {
        interactions: true,
        tasks: true,
      },
    })

    return NextResponse.json({ client })
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    await prisma.client.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Cliente removido com sucesso' })
  } catch (error) {
    console.error('Erro ao remover cliente:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
