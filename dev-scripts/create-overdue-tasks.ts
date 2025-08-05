import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createOverdueTasks() {
  try {
    // Buscar alguns clientes para criar tarefas atrasadas
    const clients = await prisma.client.findMany({
      take: 3
    })

    if (clients.length === 0) {
      console.log('Nenhum cliente encontrado. Execute o seed primeiro.')
      return
    }

    const today = new Date()
    
    // Criar tarefas atrasadas para testar notificações
    const overdueTasks = [
      {
        title: 'Ligar para follow-up urgente',
        description: 'Cliente interessado em fechar negócio, aguardando retorno',
        type: 'call',
        priority: 'high',
        status: 'pending',
        dueDate: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 dias atrás
        aiSuggested: false,
        clientId: clients[0].id,
      },
      {
        title: 'Enviar proposta comercial',
        description: 'Enviar proposta detalhada conforme solicitado na reunião',
        type: 'email',
        priority: 'high',
        status: 'pending',
        dueDate: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
        aiSuggested: false,
        clientId: clients[1].id,
      },
      {
        title: 'Reagendar reunião',
        description: 'Cliente pediu para reagendar, confirmar nova data',
        type: 'meeting',
        priority: 'medium',
        status: 'pending',
        dueDate: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 dia atrás
        aiSuggested: false,
        clientId: clients[2].id,
      },
      {
        title: 'Follow-up pós-venda',
        description: 'Verificar satisfação do cliente com o produto/serviço',
        type: 'follow-up',
        priority: 'low',
        status: 'pending',
        dueDate: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 dias atrás
        aiSuggested: false,
        clientId: clients[0].id,
      }
    ]

    for (const taskData of overdueTasks) {
      await prisma.task.create({
        data: taskData
      })
      console.log(`✅ Tarefa criada: ${taskData.title} (${taskData.priority})`)
    }

    console.log(`\n🎯 ${overdueTasks.length} tarefas atrasadas criadas com sucesso!`)
    console.log('📱 Agora você pode testar o sistema de notificações.')
    
  } catch (error) {
    console.error('❌ Erro ao criar tarefas atrasadas:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createOverdueTasks()
