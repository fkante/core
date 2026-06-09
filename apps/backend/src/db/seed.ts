import { sql } from 'drizzle-orm'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'

import { config } from '../config/index.js'
import { logger } from '../lib/logger.js'
import { db as defaultDb, pool } from './index.js'

export type SeedBootstrapAdminResult = {
  inserted: boolean
  email: string
}

export async function seedBootstrapAdmin(
  database: NodePgDatabase = defaultDb,
  email: string = config.admin.bootstrapEmail,
): Promise<SeedBootstrapAdminResult> {
  const result = await database.execute<{ id: string }>(sql`
    INSERT INTO users (email, name, password_hash, google_sub, role)
    VALUES (${email}, ${'Bootstrap Admin'}, NULL, NULL, 'admin')
    ON CONFLICT (email) DO NOTHING
    RETURNING id
  `)

  return {
    inserted: result.rowCount === 1,
    email,
  }
}

export type SeedExampleNotesResult = {
  inserted: number
}

/**
 * EXAMPLE seed — gives the bootstrap admin a couple of starter notes so the
 * `/notes` example page is non-empty on a fresh install. Idempotent: it only
 * inserts when the admin currently has no notes. Remove together with the rest
 * of the notes example.
 */
export async function seedExampleNotes(
  database: NodePgDatabase = defaultDb,
  email: string = config.admin.bootstrapEmail,
): Promise<SeedExampleNotesResult> {
  const result = await database.execute<{ id: string }>(sql`
    INSERT INTO notes (user_id, title, body)
    SELECT u.id, starter.title, starter.body
    FROM users u
    CROSS JOIN (
      VALUES
        (
          'Welcome to the boilerplate',
          'This is an example note. Delete the notes feature (schema, router, seed, routes, tests) when you start a real app.'
        ),
        (
          'How to add a feature',
          'See apps/backend/src/routes/notes.ts and STACK_BOILERPLATE.md section 5.5 for the factory + auth-gating pattern.'
        )
    ) AS starter(title, body)
    WHERE u.email = ${email}
      AND NOT EXISTS (SELECT 1 FROM notes WHERE notes.user_id = u.id)
    RETURNING id
  `)

  return { inserted: result.rowCount ?? 0 }
}

export async function seed(database: NodePgDatabase = defaultDb): Promise<void> {
  const adminResult = await seedBootstrapAdmin(database)
  if (adminResult.inserted) {
    logger.info({ email: adminResult.email }, 'Bootstrap admin user inserted')
  } else {
    logger.info({ email: adminResult.email }, 'Bootstrap admin user already exists — skipped')
  }

  const notesResult = await seedExampleNotes(database)
  logger.info(notesResult, 'Example notes seed complete')
}

const isCli = import.meta.url === `file://${process.argv[1]}`

if (isCli) {
  try {
    await seed()
    await pool.end()
    process.exit(0)
  } catch (error) {
    logger.error({ err: error }, 'Seed failed')
    await pool.end().catch(() => undefined)
    process.exit(1)
  }
}
