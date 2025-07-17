import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { status, priority, dueDate } = await request.json()
    const { id } = await params

    const updateData: {
      status?: string
      priority?: string
      dueDate?: Date
    } = {}

    if (status) updateData.status = status
    if (priority) updateData.priority = priority
    if (dueDate) updateData.dueDate = new Date(dueDate)

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({ task })
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error)
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
    
    await prisma.task.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Tarefa removida com sucesso' })
  } catch (error) {
    console.error('Erro ao remover tarefa:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
