import express, { Request, Response } from 'express'
import http from 'node:http'
import cors from 'cors'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import pastaRoutes from './routes/pasta.js'
import calculoRoutes from './routes/calculo.js'

dotenv.config()

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/pasta', pastaRoutes)
app.use('/api/calculo', calculoRoutes)

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' })
})

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ['GET', 'POST']
  }
})

io.on('connection', (socket) => {
  socket.emit('connected', { message: 'Pasta server conectado' })

  socket.on('task:update', (task) => {
    socket.broadcast.emit('task:update', task)
  })

  socket.on('assistant:message', (message) => {
    socket.broadcast.emit('assistant:message', { answer: `Recebi a mensagem "${message.text}" e estou preparando a melhor resposta.` })
  })
})

const port = Number(process.env.PORT ?? 4000)
server.listen(port, () => {
  console.log(`Pasta backend rodando em http://localhost:${port}`)
})
