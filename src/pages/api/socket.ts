import { NextApiRequest, NextApiResponse } from 'next'
import { Server as ServerIO } from 'socket.io'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default function SocketHandler(req: NextApiRequest, res: NextApiResponse) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const serverWithIO = (res.socket as any)
  
  if (serverWithIO.server.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const httpServer = (res.socket as any).server
    const io = new ServerIO(httpServer, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? ['https://your-domain.vercel.app'] 
          : ['http://localhost:3000'],
        methods: ['GET', 'POST'],
      },
    })
    serverWithIO.server.io = io

    // Connection handler
    io.on('connection', (socket) => {
      console.log('Cliente conectado:', socket.id)

      // Join room for user-specific notifications
      socket.on('join-user-room', (userId: string) => {
        socket.join(`user:${userId}`)
        console.log(`Usuario ${userId} entrou na sala`)
      })

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log('Cliente desconectado:', socket.id)
      })

      // Broadcast events
      socket.on('client:created', (data) => {
        socket.broadcast.emit('client:created', data)
      })

      socket.on('client:updated', (data) => {
        socket.broadcast.emit('client:updated', data)
      })

      socket.on('client:deleted', (data) => {
        socket.broadcast.emit('client:deleted', data)
      })

      socket.on('task:created', (data) => {
        socket.broadcast.emit('task:created', data)
      })

      socket.on('task:updated', (data) => {
        socket.broadcast.emit('task:updated', data)
      })

      socket.on('task:deleted', (data) => {
        socket.broadcast.emit('task:deleted', data)
      })

      socket.on('interaction:created', (data) => {
        socket.broadcast.emit('interaction:created', data)
      })
    })
  }
  res.end()
}
