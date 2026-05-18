import cors from 'cors'
import express, { type Request, type Response } from 'express'
import helmet from 'helmet'
import morgan from 'morgan'

import { config } from './config/index.js'
import { errorHandler } from './middleware/error-handler.js'
import { apiRouter } from './routes/index.js'

const app = express()

app.use(helmet())

app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
  }),
)

app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
  })
})

app.use('/api', apiRouter)

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource does not exist',
  })
})

app.use(errorHandler)

const server = app.listen(config.port, config.host, () => {
  console.log(`
🚀 Server is running!
📍 URL: http://${config.host}:${config.port}
🌍 Environment: ${config.nodeEnv}
📅 Started at: ${new Date().toISOString()}
  `)
})

const gracefulShutdown = (signal: string) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`)

  server.close(() => {
    console.log('HTTP server closed')
    process.exit(0)
  })

  setTimeout(() => {
    console.error('Forced shutdown after timeout')
    process.exit(1)
  }, 10_000)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))
