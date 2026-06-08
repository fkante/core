import { drizzle } from 'drizzle-orm/node-postgres'
import { describe, expect, it } from 'vitest'

import { seedBootstrapAdmin } from '../db/seed.js'
import { useTransactionalDb } from '../test/db.js'

const BOOTSTRAP_EMAIL = 'admin@example.com'

const CREATE_USERS_SQL = `
  CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text UNIQUE NOT NULL,
    name text NOT NULL,
    password_hash text NULL,
    google_sub text UNIQUE NULL,
    role text NOT NULL DEFAULT 'user'
  )
`

describe('seedBootstrapAdmin', () => {
  const harness = useTransactionalDb()

  it('inserts the bootstrap admin row on first run', async () => {
    const client = harness.getClient()
    await client.query(CREATE_USERS_SQL)
    const database = drizzle({ client })

    const result = await seedBootstrapAdmin(database, BOOTSTRAP_EMAIL)

    expect(result).toEqual({ inserted: true, email: BOOTSTRAP_EMAIL })

    const countResult = await client.query<{ count: string }>(
      'SELECT COUNT(*)::text as count FROM users WHERE email = $1',
      [BOOTSTRAP_EMAIL],
    )
    expect(countResult.rows[0]?.count).toBe('1')

    const roleResult = await client.query<{
      role: string
      password_hash: string | null
      google_sub: string | null
    }>('SELECT role, password_hash, google_sub FROM users WHERE email = $1', [BOOTSTRAP_EMAIL])
    expect(roleResult.rows[0]).toEqual({
      role: 'admin',
      password_hash: null,
      google_sub: null,
    })
  })

  it('is idempotent — running it twice leaves a single row', async () => {
    const client = harness.getClient()
    await client.query(CREATE_USERS_SQL)
    const database = drizzle({ client })

    const first = await seedBootstrapAdmin(database, BOOTSTRAP_EMAIL)
    const second = await seedBootstrapAdmin(database, BOOTSTRAP_EMAIL)

    expect(first.inserted).toBe(true)
    expect(second.inserted).toBe(false)

    const countResult = await client.query<{ count: string }>(
      'SELECT COUNT(*)::text as count FROM users WHERE email = $1',
      [BOOTSTRAP_EMAIL],
    )
    expect(countResult.rows[0]?.count).toBe('1')
  })

  it('does not overwrite an existing row that already matches the bootstrap email', async () => {
    const client = harness.getClient()
    await client.query(CREATE_USERS_SQL)
    await client.query(
      `INSERT INTO users (email, name, password_hash, google_sub, role) VALUES ($1, 'Existing User', 'preserved-hash', NULL, 'user')`,
      [BOOTSTRAP_EMAIL],
    )
    const database = drizzle({ client })

    const result = await seedBootstrapAdmin(database, BOOTSTRAP_EMAIL)

    expect(result.inserted).toBe(false)

    const rowResult = await client.query<{
      role: string
      password_hash: string | null
      name: string
    }>('SELECT role, password_hash, name FROM users WHERE email = $1', [BOOTSTRAP_EMAIL])
    expect(rowResult.rows[0]).toEqual({
      role: 'user',
      password_hash: 'preserved-hash',
      name: 'Existing User',
    })
  })
})
