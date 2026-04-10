import bcrypt from 'bcryptjs'
import prisma from './prisma.js'

async function seed() {
  const passwordHash = await bcrypt.hash('senha123', 10)

  const user = await prisma.user.upsert({
    where: { email: 'master@juslaboral.local' },
    update: {},
    create: {
      name: 'Master',
      email: 'master@juslaboral.local',
      password: passwordHash,
      role: 'admin'
    }
  })

  await prisma.client.upsert({
    where: { email: 'contato@uhlmannsantos.com' },
    update: {},
    create: {
      name: 'UHLMANN & SANTOS',
      company: 'UHLMANN Advocacia',
      role: 'Sócio',
      email: 'contato@uhlmannsantos.com',
      phone: '(47) 99999-0001',
      status: 'Ativo',
      stage: 'Pós-litígios',
      userId: user.id
    }
  })

  console.log('Seed finalizado.')
}

seed()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
