import { Router } from 'express'

import { type Database, db as defaultDb } from '../db/index.js'
import { csrfMiddleware } from '../middleware/csrf.js'
import { createAuthRouter, type CreateAuthRouterOptions } from './auth.js'
import { createNotesRouter } from './notes.js'

export type CreateApiRouterOptions = CreateAuthRouterOptions

export function createApiRouter(
  database: Database = defaultDb,
  options: CreateApiRouterOptions = {},
): Router {
  const router = Router()
  router.use(csrfMiddleware)
  router.use('/auth', createAuthRouter(database, options))
  router.use('/notes', createNotesRouter(database))
  return router
}

export const apiRouter: Router = createApiRouter()
