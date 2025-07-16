import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Populando banco de dados com dados de exemplo...')

  // Limpar dados existentes
  await prisma.task.deleteMany()
  await prisma.interaction.deleteMany()
  await prisma.client.deleteMany()

  // Clientes de exemplo
  const clients = await Promise.all([
    prisma.client.create({
      data: {
        name: 'João Silva',
        email: 'joao.silva@empresa.com',
        phone: '(11) 99999-1234',
        clientType: 'lead',
        leadScore: 85,
        notes: 'Interessado em automação de processos. Empresa de médio porte no setor financeiro.',
      },
    }),
    prisma.client.create({
      data: {
        name: 'Maria Santos',
        email: 'maria.santos@startup.com',
        phone: '(11) 98888-5678',
        clientType: 'prospect',
        leadScore: 65,
        notes: 'Startup em crescimento, procura soluções de CRM. Orçamento limitado mas potencial de expansão.',
      },
    }),
    prisma.client.create({
      data: {
        name: 'Pedro Oliveira',
        email: 'pedro@consultoria.com',
        clientType: 'customer',
        leadScore: 95,
        notes: 'Cliente ativo há 2 anos. Muito satisfeito com os serviços. Potencial para upsell.',
      },
    }),
    prisma.client.create({
      data: {
        name: 'Ana Costa',
        email: 'ana.costa@loja.com',
        phone: '(11) 97777-9999',
        clientType: 'prospect',
        leadScore: 45,
        notes: 'E-commerce de roupas. Primeira interação, demonstrou interesse moderado.',
      },
    }),
    prisma.client.create({
      data: {
        name: 'Carlos Ferreira',
        email: 'carlos@industria.com',
        phone: '(11) 96666-1111',
        clientType: 'lead',
        leadScore: 75,
        notes: 'Indústria automotiva. Procura integração com sistemas ERP existentes.',
      },
    }),
  ])

  console.log(`✅ Criados ${clients.length} clientes`)

  // Interações de exemplo
  const interactions = []
  for (const client of clients) {
    const clientInteractions = await Promise.all([
      prisma.interaction.create({
        data: {
          clientId: client.id,
          type: 'email',
          content: `Primeiro contato com ${client.name}. Apresentação da empresa e serviços.`,
          aiGenerated: false,
        },
      }),
      prisma.interaction.create({
        data: {
          clientId: client.id,
          type: 'call',
          content: `Ligação de follow-up com ${client.name}. Discussão sobre necessidades específicas.`,
          aiGenerated: false,
        },
      }),
    ])
    interactions.push(...clientInteractions)
  }

  console.log(`✅ Criadas ${interactions.length} interações`)

  // Tarefas de exemplo
  const tasks = []
  for (const client of clients) {
    const clientTasks = await Promise.all([
      prisma.task.create({
        data: {
          clientId: client.id,
          title: `Follow-up com ${client.name}`,
          description: 'Agendar reunião para apresentar proposta personalizada',
          type: 'call',
          priority: client.leadScore > 80 ? 'high' : client.leadScore > 60 ? 'medium' : 'low',
          dueDate: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000), // Próximos 7 dias
          aiSuggested: true,
        },
      }),
      prisma.task.create({
        data: {
          clientId: client.id,
          title: `Enviar proposta para ${client.name}`,
          description: 'Elaborar e enviar proposta comercial baseada nas necessidades identificadas',
          type: 'email',
          priority: 'medium',
          dueDate: new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000), // Próximas 2 semanas
          aiSuggested: false,
        },
      }),
    ])
    tasks.push(...clientTasks)
  }

  console.log(`✅ Criadas ${tasks.length} tarefas`)

  // Marcar algumas tarefas como concluídas
  const tasksToComplete = tasks.slice(0, Math.floor(tasks.length * 0.3))
  for (const task of tasksToComplete) {
    await prisma.task.update({
      where: { id: task.id },
      data: { status: 'completed' },
    })
  }

  console.log(`✅ Marcadas ${tasksToComplete.length} tarefas como concluídas`)

  console.log('🎉 Seed concluído com sucesso!')
  console.log('')
  console.log('📊 Resumo:')
  console.log(`   • ${clients.length} clientes`)
  console.log(`   • ${interactions.length} interações`)
  console.log(`   • ${tasks.length} tarefas`)
  console.log(`   • ${tasksToComplete.length} tarefas concluídas`)
  console.log('')
  console.log('🚀 Execute: npm run dev')
  console.log('🔑 Configure sua OPENAI_API_KEY no arquivo .env')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
