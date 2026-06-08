import { eq } from 'drizzle-orm'
import type { NextFunction, Request, RequestHandler, Response } from 'express'

import { type Database, db as defaultDb } from '../db/index.js'
import { users } from '../db/schema/users.js'
import { SESSION_COOKIE_NAME } from '../lib/session.js'

type Role = 'user' | 'admin'

function toRole(value: string): Role {
  return value === 'admin' ? 'admin' : 'user'
}

export function createSessionMiddleware(database: Database = defaultDb): RequestHandler {
  return async function sessionMiddleware(
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> {
    req.user = null

    const signed = req.signedCookies?.[SESSION_COOKIE_NAME]
    if (typeof signed !== 'string' || signed.length === 0) {
      next()
      return
    }

    try {
      const rows = await database
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
        })
        .from(users)
        .where(eq(users.id, signed))
        .limit(1)

      const row = rows[0]
      if (row) {
        req.user = {
          id: row.id,
          name: row.name,
          email: row.email,
          role: toRole(row.role),
        }
      }
    } catch (err) {
      req.log.error({ err }, 'Failed to look up session user')
    }

    next()
  }
}
