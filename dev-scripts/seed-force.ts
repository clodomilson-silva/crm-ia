import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('⚠️  FORCE SEED: Limpando e recriando dados de exemplo...')
  console.log('🗑️  ATENÇÃO: Todos os dados existentes serão APAGADOS!')

  // Limpar dados existentes (FORÇA)
  await prisma.task.deleteMany()
  await prisma.interaction.deleteMany()
  await prisma.client.deleteMany()
  await prisma.user.deleteMany()

  console.log('✅ Dados apagados. Criando usuário admin e dados de exemplo...')

  // Criar usuário admin
  const hashedPassword = await bcrypt.hash('admin123', 12)
  const adminUser = await prisma.user.create({
    data: {
      name: 'Administrador',
      email: 'admin@crm-ia.com',
      password: hashedPassword,
      role: 'admin'
    }
  })

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
        userId: adminUser.id,
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
        notes: 'Primeiro contato feito via LinkedIn. Interesse demonstrado, mas baixo engajamento.',
      },
    }),
    prisma.client.create({
      data: {
        name: 'Carlos Mendes',
        email: 'carlos@industria.com',
        phone: '(11) 96666-3333',
        clientType: 'customer',
        leadScore: 90,
        notes: 'Cliente premium. Contrato de longo prazo renovado recentemente.',
      },
    }),
  ])

  console.log(`✅ ${clients.length} clientes criados`)

  // Criar algumas interações
  const interactions = []
  for (const client of clients) {
    const interaction = await prisma.interaction.create({
      data: {
        clientId: client.id,
        type: 'email',
        content: `Primeiro contato com ${client.name} realizado por email.`,
        outcome: 'positive',
        nextAction: 'Agendar call de descoberta',
      },
    })
    interactions.push(interaction)
  }

  console.log(`✅ ${interactions.length} interações criadas`)

  // Criar algumas tarefas
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(9, 0, 0, 0)

  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)
  nextWeek.setHours(14, 0, 0, 0)

  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        clientId: clients[0].id,
        title: 'Call de apresentação',
        description: 'Apresentar nossa solução de automação de processos',
        type: 'call',
        priority: 'high',
        dueDate: tomorrow,
        estimatedDuration: '45 min',
      },
    }),
    prisma.task.create({
      data: {
        clientId: clients[1].id,
        title: 'Enviar proposta comercial',
        description: 'Proposta adaptada para startup com orçamento reduzido',
        type: 'email',
        priority: 'medium',
        dueDate: nextWeek,
        estimatedDuration: '30 min',
      },
    }),
    prisma.task.create({
      data: {
        clientId: clients[2].id,
        title: 'Reunião de check-in trimestral',
        description: 'Avaliar satisfação e identificar oportunidades de upsell',
        type: 'meeting',
        priority: 'medium',
        dueDate: nextWeek,
        estimatedDuration: '60 min',
      },
    }),
  ])

  console.log(`✅ ${tasks.length} tarefas criadas`)
  console.log('🎉 Force seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error('❌ Erro durante force seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
