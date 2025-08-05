import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractUserFromRequest } from '@/lib/auth'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const user = extractUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const today = new Date()
    today.setHours(23, 59, 59, 999) // Final do dia atual

    // Buscar tarefas atrasadas (vencimento anterior ao dia atual e status pending)
    const overdueTasks = await prisma.task.findMany({
      where: {
        // @ts-expect-error - userId filter may not be recognized yet
        userId: user.userId,
        dueDate: {
          lt: today
        },
        status: 'pending'
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            leadScore: true,
            clientType: true
          }
        }
      },
      orderBy: [
        { dueDate: 'asc' }, // Mais antigas primeiro
        { priority: 'desc' } // Alta prioridade primeiro
      ]
    })

    // Buscar tarefas do dia atual que ainda estão pendentes
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const todayPendingTasks = await prisma.task.findMany({
      where: {
        // @ts-expect-error userId será reconhecido após regeneração completa do Prisma
        userId: user.userId,
        dueDate: {
          gte: todayStart,
          lte: todayEnd
        },
        status: 'pending'
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            leadScore: true,
            clientType: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' }
      ]
    })

    // Calcular estatísticas
    const totalOverdue = overdueTasks.length
    const highPriorityOverdue = overdueTasks.filter(task => task.priority === 'high').length
    const todayPending = todayPendingTasks.length

    // Preparar notificações formatadas
    const notifications = overdueTasks.map(task => {
      const taskDueDate = task.dueDate ? new Date(task.dueDate) : new Date()
      const daysOverdue = Math.floor((today.getTime() - taskDueDate.getTime()) / (1000 * 60 * 60 * 24))
      
      return {
        id: task.id,
        type: 'overdue',
        title: `Tarefa atrasada: ${task.title}`,
        // @ts-expect-error - Client relation may not be recognized after Prisma regeneration
        message: `${task.client.name} - ${daysOverdue} dia(s) atrasada`,
        daysOverdue,
        priority: task.priority,
        // @ts-expect-error - Client relation may not be recognized after Prisma regeneration
        clientName: task.client.name,
        // @ts-expect-error - Client relation may not be recognized after Prisma regeneration
        clientId: task.client.id,
        taskId: task.id,
        dueDate: task.dueDate,
        createdAt: new Date().toISOString()
      }
    })

    // Adicionar notificações do dia se houver muitas
    if (todayPendingTasks.length > 5) {
      notifications.push({
        id: 'today-pending',
        type: 'today-pending',
        title: `${todayPendingTasks.length} tarefas pendentes hoje`,
        message: `Você tem muitas tarefas para hoje. Priorize as mais importantes!`,
        daysOverdue: 0,
        priority: 'medium',
        clientName: '',
        clientId: '',
        taskId: '',
        dueDate: new Date(),
        createdAt: new Date().toISOString()
      })
    }

    return NextResponse.json({
      success: true,
      notifications,
      stats: {
        totalOverdue,
        highPriorityOverdue,
        todayPending,
        totalNotifications: notifications.length
      },
      overdueTasks: overdueTasks.map(task => ({
        id: task.id,
        title: task.title,
        // @ts-expect-error - Client relation may not be recognized after Prisma regeneration
        clientName: task.client.name,
        dueDate: task.dueDate,
        priority: task.priority,
        daysOverdue: Math.floor((today.getTime() - (task.dueDate ? new Date(task.dueDate).getTime() : today.getTime())) / (1000 * 60 * 60 * 24))
      })),
      todayTasks: todayPendingTasks.map(task => ({
        id: task.id,
        title: task.title,
        // @ts-expect-error - Client relation may not be recognized after Prisma regeneration
        clientName: task.client.name,
        dueDate: task.dueDate,
        priority: task.priority
      }))
    })

  } catch (error) {
    console.error('Erro ao buscar notificações:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
