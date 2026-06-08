import { createHmac } from 'node:crypto'
import type { Server } from 'node:http'
import type { AddressInfo } from 'node:net'

import { drizzle } from 'drizzle-orm/node-postgres'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { createApp } from '../app.js'
import { SESSION_COOKIE_NAME, sessionSecret } from '../lib/session.js'
import { useTransactionalDb } from '../test/db.js'
import { applyMigrations } from '../test/migrate.js'

function signCookieValue(value: string, secret: string): string {
  const signature = createHmac('sha256', secret).update(value).digest('base64').replace(/=+$/, '')
  return `s:${value}.${signature}`
}

function cookieHeader(value: string): string {
  return `${SESSION_COOKIE_NAME}=${encodeURIComponent(value)}`
}

type SessionResponse = {
  user: { id: string; name: string; email: string; role: 'user' | 'admin' } | null
}

describe('GET /api/auth/session', () => {
  const harness = useTransactionalDb()

  let server: Server
  let baseUrl: string

  beforeAll(async () => {
    // Defer creating the app until each test boots its own listener so we can pass the test-scoped db.
  })

  afterAll(async () => {
    // No-op: per-test listener is torn down in afterEach.
  })

  beforeEach(async () => {
    const client = harness.getClient()
    await applyMigrations(client)

    const database = drizzle({ client })
    const app = createApp({ db: database })
    await new Promise<void>((resolveListening) => {
      server = app.listen(0, '127.0.0.1', () => resolveListening())
    })
    const address = server.address() as AddressInfo
    baseUrl = `http://127.0.0.1:${address.port}`
  })

  afterEach(async () => {
    await new Promise<void>((resolveClose, rejectClose) => {
      server.close((closeError) => (closeError ? rejectClose(closeError) : resolveClose()))
    })
  })

  it('returns { user: null } when no session cookie is present', async () => {
    const response = await fetch(`${baseUrl}/api/auth/session`)
    expect(response.status).toBe(200)
    const body = (await response.json()) as SessionResponse
    expect(body).toEqual({ user: null })
  })

  it('returns the authenticated user when a signed cookie is presented', async () => {
    const client = harness.getClient()
    const inserted = await client.query<{ id: string; name: string; email: string; role: string }>(
      `INSERT INTO users (email, name, role) VALUES ('member@example.com', 'Member', 'user')
       RETURNING id, name, email, role`,
    )
    const seeded = inserted.rows[0]
    if (!seeded) throw new Error('Failed to seed test user')

    const signed = signCookieValue(seeded.id, sessionSecret)
    const response = await fetch(`${baseUrl}/api/auth/session`, {
      headers: { cookie: cookieHeader(signed) },
    })

    expect(response.status).toBe(200)
    const body = (await response.json()) as SessionResponse
    expect(body).toEqual({
      user: {
        id: seeded.id,
        name: 'Member',
        email: 'member@example.com',
        role: 'user',
      },
    })
  })

  it('returns { user: null } when the cookie signature is tampered', async () => {
    const client = harness.getClient()
    const inserted = await client.query<{ id: string }>(
      `INSERT INTO users (email, name, role) VALUES ('tamper@example.com', 'Tamper', 'user')
       RETURNING id`,
    )
    const seeded = inserted.rows[0]
    if (!seeded) throw new Error('Failed to seed test user')

    const signed = signCookieValue(seeded.id, `${sessionSecret}-wrong`)
    const response = await fetch(`${baseUrl}/api/auth/session`, {
      headers: { cookie: cookieHeader(signed) },
    })

    expect(response.status).toBe(200)
    const body = (await response.json()) as SessionResponse
    expect(body).toEqual({ user: null })
  })
})
