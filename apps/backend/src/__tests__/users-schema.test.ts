import type { Client } from 'pg'
import { beforeEach, describe, expect, it } from 'vitest'

import { useTransactionalDb } from '../test/db.js'
import { applyMigrations } from '../test/migrate.js'

async function insertUser(
  client: Client,
  overrides: { email?: string; name?: string; role?: string } = {},
): Promise<string> {
  const email = overrides.email ?? `user-${Math.random().toString(36).slice(2)}@example.com`
  const name = overrides.name ?? 'Test User'
  const role = overrides.role ?? 'user'
  const result = await client.query<{ id: string }>(
    `INSERT INTO users (email, name, role) VALUES ($1, $2, $3) RETURNING id`,
    [email, name, role],
  )
  const userId = result.rows[0]?.id
  if (!userId) {
    throw new Error('Failed to insert user')
  }
  return userId
}

describe('users + notes schema', () => {
  const harness = useTransactionalDb()

  beforeEach(async () => {
    const client = harness.getClient()
    await applyMigrations(client)
  })

  it('enforces case-insensitive email uniqueness via citext', async () => {
    const client = harness.getClient()

    await client.query(`INSERT INTO users (email, name) VALUES ('alice@example.com', 'Alice')`)

    await expect(
      client.query(`INSERT INTO users (email, name) VALUES ('ALICE@example.com', 'Alice 2')`),
    ).rejects.toThrow(/duplicate key value violates unique constraint/i)
  })

  it('rejects users with an invalid role via CHECK constraint', async () => {
    const client = harness.getClient()

    await expect(
      client.query(
        `INSERT INTO users (email, name, role) VALUES ('mod@example.com', 'Mod', 'moderator')`,
      ),
    ).rejects.toThrow(/users_role_check/i)
  })

  it('rejects notes rows with an orphan user_id FK', async () => {
    const client = harness.getClient()

    await expect(
      client.query(
        `INSERT INTO notes (user_id, title, body) VALUES (gen_random_uuid(), 'Orphan', 'no owner')`,
      ),
    ).rejects.toThrow(/notes_user_id_users_id_fk/i)
  })

  it('cascade-deletes a user’s notes when the user is removed', async () => {
    const client = harness.getClient()
    const userId = await insertUser(client)

    await client.query(`INSERT INTO notes (user_id, title) VALUES ($1, 'Keep me')`, [userId])
    await client.query(`DELETE FROM users WHERE id = $1`, [userId])

    const remaining = await client.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM notes WHERE user_id = $1`,
      [userId],
    )
    expect(remaining.rows[0]?.count).toBe('0')
  })

  it('has the (user_id, created_at) index on notes', async () => {
    const client = harness.getClient()
    const result = await client.query<{ indexname: string }>(
      `SELECT indexname FROM pg_indexes
       WHERE tablename = 'notes'
         AND indexname = 'notes_user_id_created_at_idx'`,
    )
    expect(result.rows.length).toBe(1)
  })
})
