import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function migrateToUserSystem() {
  console.log('🔄 Iniciando migração para sistema de usuários...')
  
  try {
    // 1. Criar tabela de usuários primeiro
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'user',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        
        CONSTRAINT "users_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "users_email_key" UNIQUE ("email")
      );
    `

    // 2. Criar usuário admin para dados existentes
    const adminPassword = await bcrypt.hash('admin123', 12)
    const adminId = 'admin-migration-' + Date.now()
    
    await prisma.$executeRaw`
      INSERT INTO "users" ("id", "email", "name", "password", "role", "updatedAt")
      VALUES (${adminId}, 'admin@crm-ia.com', 'Administrador', ${adminPassword}, 'admin', CURRENT_TIMESTAMP)
      ON CONFLICT ("email") DO NOTHING;
    `

    // 3. Adicionar colunas userId às tabelas existentes
    await prisma.$executeRaw`
      ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "userId" TEXT;
    `
    
    await prisma.$executeRaw`
      ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "userId" TEXT;
    `
    
    await prisma.$executeRaw`
      ALTER TABLE "interactions" ADD COLUMN IF NOT EXISTS "userId" TEXT;
    `

    // 4. Associar todos os dados existentes ao admin
    await prisma.$executeRaw`
      UPDATE "clients" SET "userId" = ${adminId} WHERE "userId" IS NULL;
    `
    
    await prisma.$executeRaw`
      UPDATE "tasks" SET "userId" = ${adminId} WHERE "userId" IS NULL;
    `
    
    await prisma.$executeRaw`
      UPDATE "interactions" SET "userId" = ${adminId} WHERE "userId" IS NULL;
    `

    // 5. Tornar as colunas userId obrigatórias
    await prisma.$executeRaw`
      ALTER TABLE "clients" ALTER COLUMN "userId" SET NOT NULL;
    `
    
    await prisma.$executeRaw`
      ALTER TABLE "tasks" ALTER COLUMN "userId" SET NOT NULL;
    `
    
    await prisma.$executeRaw`
      ALTER TABLE "interactions" ALTER COLUMN "userId" SET NOT NULL;
    `

    // 6. Adicionar foreign keys
    await prisma.$executeRaw`
      ALTER TABLE "clients" ADD CONSTRAINT "clients_userId_fkey" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `
    
    await prisma.$executeRaw`
      ALTER TABLE "tasks" ADD CONSTRAINT "tasks_userId_fkey" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `
    
    await prisma.$executeRaw`
      ALTER TABLE "interactions" ADD CONSTRAINT "interactions_userId_fkey" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `

    // 7. Remover constraint unique do email em clients (agora é unique por usuário)
    await prisma.$executeRaw`
      ALTER TABLE "clients" DROP CONSTRAINT IF EXISTS "clients_email_key";
    `
    
    await prisma.$executeRaw`
      ALTER TABLE "clients" ADD CONSTRAINT "clients_email_userId_key" UNIQUE ("email", "userId");
    `

    console.log('✅ Migração concluída com sucesso!')
    console.log('📧 Email admin: admin@crm-ia.com')
    console.log('🔑 Senha admin: admin123')
    
  } catch (error) {
    console.error('❌ Erro na migração:', error)
    throw error
  }
}

migrateToUserSystem()
  .then(() => {
    console.log('🎉 Sistema de usuários implementado!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Falha na migração:', error)
    process.exit(1)
  })
