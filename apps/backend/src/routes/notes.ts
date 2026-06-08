import { desc, eq } from 'drizzle-orm'
import { type Request, type Response, Router } from 'express'
import { z } from 'zod'

import { type Database, db as defaultDb } from '../db/index.js'
import { notes } from '../db/schema/notes.js'
import { checkNoteRateLimit } from '../lib/rate-limit.js'

const createNoteSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().max(10_000).default(''),
})

/**
 * EXAMPLE feature router — a per-user notes slice that demonstrates the standard
 * `createXRouter(db)` factory: session-gated handlers (`req.user`), Zod
 * `safeParse` validation, the rolling-window rate-limit + 429/Retry-After
 * convention, and stable error codes. CSRF and session middleware are applied
 * upstream in `createApiRouter`. Copy this for real features, or delete the whole
 * notes example for a clean start.
 */
export function createNotesRouter(database: Database = defaultDb): Router {
  const router = Router()

  router.get('/', async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: 'unauthenticated' })
      return
    }

    const rows = await database
      .select()
      .from(notes)
      .where(eq(notes.userId, req.user.id))
      .orderBy(desc(notes.createdAt))

    res.json({ notes: rows })
  })

  router.post('/', async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: 'unauthenticated' })
      return
    }

    const parsed = createNoteSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'invalid_input', issues: parsed.error.issues })
      return
    }

    const rateLimit = await checkNoteRateLimit(database, req.user.id)
    if (!rateLimit.allowed) {
      res.setHeader('Retry-After', String(rateLimit.retryAfterSeconds))
      res.status(429).json({ error: 'rate_limited' })
      return
    }

    const insertedRows = await database
      .insert(notes)
      .values({ userId: req.user.id, title: parsed.data.title, body: parsed.data.body })
      .returning()

    const inserted = insertedRows[0]
    if (!inserted) {
      res.status(500).json({ error: 'note_create_failed' })
      return
    }

    res.status(201).json({ note: inserted })
  })

  return router
}

export const notesRouter: Router = createNotesRouter()
