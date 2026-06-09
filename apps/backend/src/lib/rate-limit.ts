import { and, eq, sql } from 'drizzle-orm'

import { type Database } from '../db/index.js'
import { notes } from '../db/schema/notes.js'

export const NOTE_RATE_LIMIT = 20
export const NOTE_RATE_WINDOW_HOURS = 24

export interface RateLimitResult {
  allowed: boolean
  retryAfterSeconds: number
}

/**
 * EXAMPLE rolling-window rate limiter (wired into `POST /api/notes`). Counts the
 * user's notes created inside the trailing window; when the count has reached
 * NOTE_RATE_LIMIT, `allowed` is false and `retryAfterSeconds` is the time until
 * the oldest counted row ages out of the window. The count and the retry-after
 * are derived in a single query so they reflect the same snapshot. Re-point the
 * table/column for a real feature, or delete it with the notes example.
 */
export async function checkNoteRateLimit(
  database: Database,
  userId: string,
): Promise<RateLimitResult> {
  const rows = await database
    .select({
      count: sql<number>`count(*)::int`,
      retryAfterSeconds: sql<
        number | null
      >`ceil(extract(epoch from (min(${notes.createdAt}) + interval '${sql.raw(String(NOTE_RATE_WINDOW_HOURS))} hours' - now())))::int`,
    })
    .from(notes)
    .where(
      and(
        eq(notes.userId, userId),
        sql`${notes.createdAt} > now() - interval '${sql.raw(String(NOTE_RATE_WINDOW_HOURS))} hours'`,
      ),
    )

  const summary = rows[0]
  const count = summary?.count ?? 0
  const allowed = count < NOTE_RATE_LIMIT
  const retryAfterSeconds = Math.max(0, summary?.retryAfterSeconds ?? 0)

  return { allowed, retryAfterSeconds }
}
