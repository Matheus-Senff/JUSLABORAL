import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient
try {
  prisma = new PrismaClient()
} catch {
  // Permite iniciar o servidor sem Prisma (ex: sem DB configurado)
  prisma = {} as PrismaClient
  console.warn('[WARN] Prisma não inicializado — rotas que dependem de DB usarão mock data')
}
export default prisma
