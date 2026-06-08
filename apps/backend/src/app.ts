import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { type Express, type Request, type Response } from 'express'
import helmet from 'helmet'

import { config } from './config/index.js'
import { type Database, db as defaultDb } from './db/index.js'
import { httpLogger } from './lib/http-logger.js'
import { sessionSecret } from './lib/session.js'
import { errorHandler } from './middleware/error-handler.js'
import { createSessionMiddleware } from './middleware/session.js'
import { createApiRouter, type CreateApiRouterOptions } from './routes/index.js'

export interface CreateAppOptions extends CreateApiRouterOptions {
  db?: Database
}

export function createApp(options: CreateAppOptions = {}): Express {
  const { db, ...routerOptions } = options
  const database = db ?? defaultDb
  const app = express()

  app.use(helmet())

  app.use(
    cors({
      origin: config.cors.origin,
      credentials: true,
    }),
  )

  app.use(cookieParser(sessionSecret))
  app.use(httpLogger)

  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  app.use(createSessionMiddleware(database))

  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.nodeEnv,
    })
  })

  app.use('/api', createApiRouter(database, routerOptions))

  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      error: 'Not Found',
      message: 'The requested resource does not exist',
    })
  })

  app.use(errorHandler)

  return app
}
