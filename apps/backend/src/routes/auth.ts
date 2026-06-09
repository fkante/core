import argon2 from 'argon2'
import type { AuthUser } from 'core'
import { eq, sql } from 'drizzle-orm'
import { type Request, type Response, Router } from 'express'
import { z } from 'zod'

import { type Database, db as defaultDb } from '../db/index.js'
import { users } from '../db/schema/users.js'
import {
  type VerifyGoogleIdToken,
  verifyGoogleIdToken as defaultVerifyGoogleIdToken,
} from '../lib/google-verify.js'
import { clearSessionCookie, setSessionCookie } from '../lib/session.js'

const passwordSchema = z
  .string()
  .refine((value) => value.length >= 8, { message: 'password_too_short' })
  .refine((value) => /[A-Z]/.test(value), { message: 'password_missing_uppercase' })
  .refine((value) => /\d/.test(value), { message: 'password_missing_digit' })
  .refine((value) => /[^A-Za-z0-9]/.test(value), { message: 'password_missing_symbol' })

const signupSchema = z.object({
  email: z.email(),
  password: passwordSchema,
  name: z.string().min(1).max(120),
})

const signinSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
})

const googleSchema = z.object({
  idToken: z.string().min(1),
})

type Role = 'user' | 'admin'

function toRole(value: string): Role {
  return value === 'admin' ? 'admin' : 'user'
}

function toAuthUser(row: { id: string; name: string; email: string; role: string }): AuthUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: toRole(row.role),
  }
}

export interface CreateAuthRouterOptions {
  verifyIdToken?: VerifyGoogleIdToken
}

export function createAuthRouter(
  database: Database = defaultDb,
  options: CreateAuthRouterOptions = {},
): Router {
  const router = Router()
  const verifyIdToken = options.verifyIdToken ?? defaultVerifyGoogleIdToken

  router.get('/session', (req: Request, res: Response) => {
    res.json({ user: req.user ?? null })
  })

  router.post('/signup', async (req: Request, res: Response) => {
    const parsed = signupSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'invalid_input', issues: parsed.error.issues })
      return
    }

    const { email, password, name } = parsed.data
    const passwordHash = await argon2.hash(password, { type: argon2.argon2id })

    const existingRows = await database
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        passwordHash: users.passwordHash,
        googleSub: users.googleSub,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    const existing = existingRows[0]

    if (existing && existing.passwordHash !== null) {
      res.status(409).json({ error: 'email_taken' })
      return
    }

    if (existing && existing.googleSub !== null) {
      res.status(409).json({ error: 'email_taken' })
      return
    }

    let user: AuthUser
    if (existing) {
      const updatedRows = await database
        .update(users)
        .set({ passwordHash, name })
        .where(eq(users.id, existing.id))
        .returning({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
        })
      const updated = updatedRows[0]
      if (!updated) {
        req.log.error({ userId: existing.id }, 'Failed to hydrate stub user during signup')
        res.status(500).json({ error: 'signup_failed' })
        return
      }
      user = toAuthUser(updated)
    } else {
      try {
        const insertedRows = await database
          .insert(users)
          .values({ email, name, passwordHash, role: 'user' })
          .returning({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
          })
        const inserted = insertedRows[0]
        if (!inserted) {
          res.status(500).json({ error: 'signup_failed' })
          return
        }
        user = toAuthUser(inserted)
      } catch (err) {
        if (err instanceof Error && /duplicate key|unique constraint/i.test(err.message)) {
          res.status(409).json({ error: 'email_taken' })
          return
        }
        throw err
      }
    }

    setSessionCookie(res, user)
    res.status(201).json({ user })
  })

  router.post('/signin', async (req: Request, res: Response) => {
    const parsed = signinSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'invalid_input', issues: parsed.error.issues })
      return
    }

    const { email, password } = parsed.data

    const rows = await database
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        passwordHash: users.passwordHash,
      })
      .from(users)
      .where(eq(sql`${users.email}`, email))
      .limit(1)

    const row = rows[0]
    if (!row) {
      res.status(401).json({ error: 'invalid_credentials' })
      return
    }

    if (row.passwordHash === null) {
      res.status(401).json({ error: 'google_only_account' })
      return
    }

    const valid = await argon2.verify(row.passwordHash, password)
    if (!valid) {
      res.status(401).json({ error: 'invalid_credentials' })
      return
    }

    const user = toAuthUser(row)
    setSessionCookie(res, user)
    res.status(200).json({ user })
  })

  router.post('/google', async (req: Request, res: Response) => {
    const parsed = googleSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'invalid_input', issues: parsed.error.issues })
      return
    }

    let payload
    try {
      payload = await verifyIdToken(parsed.data.idToken)
    } catch (err) {
      req.log.warn({ err }, 'Google ID token verification failed')
      res.status(401).json({ error: 'invalid_google_token' })
      return
    }

    const { sub, email, name } = payload

    const existingRows = await database
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        googleSub: users.googleSub,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    const existing = existingRows[0]

    let user: AuthUser
    if (existing) {
      if (existing.googleSub !== sub) {
        const updatedRows = await database
          .update(users)
          .set({ googleSub: sub })
          .where(eq(users.id, existing.id))
          .returning({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
          })
        const updated = updatedRows[0]
        if (!updated) {
          req.log.error({ userId: existing.id }, 'Failed to attach google_sub to existing user')
          res.status(500).json({ error: 'google_link_failed' })
          return
        }
        user = toAuthUser(updated)
      } else {
        user = toAuthUser(existing)
      }
    } else {
      try {
        const insertedRows = await database
          .insert(users)
          .values({ email, name, googleSub: sub, role: 'user' })
          .returning({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
          })
        const inserted = insertedRows[0]
        if (!inserted) {
          res.status(500).json({ error: 'google_signup_failed' })
          return
        }
        user = toAuthUser(inserted)
      } catch (err) {
        if (err instanceof Error && /duplicate key|unique constraint/i.test(err.message)) {
          const raceRows = await database
            .select({
              id: users.id,
              name: users.name,
              email: users.email,
              role: users.role,
            })
            .from(users)
            .where(eq(users.email, email))
            .limit(1)
          const raceRow = raceRows[0]
          if (!raceRow) {
            throw err
          }
          user = toAuthUser(raceRow)
        } else {
          throw err
        }
      }
    }

    setSessionCookie(res, user)
    res.status(200).json({ user })
  })

  router.post('/signout', (_req: Request, res: Response) => {
    clearSessionCookie(res)
    res.status(204).end()
  })

  return router
}

export const authRouter: Router = createAuthRouter()
