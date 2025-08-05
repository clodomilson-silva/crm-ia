import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Criando usuário admin para produção...')

  // Verificar se já existe um usuário admin
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'admin' }
  })

  if (existingAdmin) {
    console.log('✅ Usuário admin já existe, skip seed.')
    return
  }

  // Criar usuário admin apenas se não existir
  const hashedPassword = await bcrypt.hash('admin123', 12)
  const adminUser = await prisma.user.create({
    data: {
      name: 'Administrador',
      email: 'admin@crm-ia.com',
      password: hashedPassword,
      role: 'admin'
    }
  })

  console.log('✅ Usuário admin criado:', adminUser.email)
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
