import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../prisma.js'
import { mockUsers } from '../mock.js'

const router = Router()
const jwtSecret = process.env.JWT_SECRET || 'pasta-secret'

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  try {
    const user = await prisma.user.findUnique({ where: { email } })
    const account = user ?? mockUsers.find((item) => item.email === email)
    if (!account) {
      return res.status(401).json({ error: 'Credenciais inválidas' })
    }

    const validPassword = await bcrypt.compare(password, account.password)
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' })
    }

    const token = jwt.sign({ userId: account.id, role: account.role }, jwtSecret, { expiresIn: '8h' })
    res.json({ token, user: { id: account.id, name: account.name, email: account.email, role: account.role } })
  } catch (error) {
    res.status(500).json({ error: 'Erro ao autenticar' })
  }
})

export default router
