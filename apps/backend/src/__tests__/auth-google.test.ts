import type { Server } from 'node:http'
import type { AddressInfo } from 'node:net'

import { drizzle } from 'drizzle-orm/node-postgres'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createApp } from '../app.js'
import type { GoogleTokenPayload, VerifyGoogleIdToken } from '../lib/google-verify.js'
import { SESSION_COOKIE_NAME } from '../lib/session.js'
import { useTransactionalDb } from '../test/db.js'
import { applyMigrations } from '../test/migrate.js'

const CSRF_HEADERS = {
  'content-type': 'application/json',
  'x-app-csrf': '1',
}

type GoogleSuccess = { user: { id: string; name: string; email: string; role: 'user' | 'admin' } }
type GoogleError = { error: string }

describe('POST /api/auth/google', () => {
  const harness = useTransactionalDb()

  let server: Server
  let baseUrl: string
  let verifyIdToken: VerifyGoogleIdToken

  beforeEach(async () => {
    const client = harness.getClient()
    await applyMigrations(client)

    verifyIdToken = vi.fn<VerifyGoogleIdToken>()

    const database = drizzle({ client })
    const app = createApp({ db: database, verifyIdToken })
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

  function postGoogle(body: { idToken: string }): Promise<Response> {
    return fetch(`${baseUrl}/api/auth/google`, {
      method: 'POST',
      headers: CSRF_HEADERS,
      body: JSON.stringify(body),
    })
  }

  function mockVerifier(payload: GoogleTokenPayload): void {
    vi.mocked(verifyIdToken).mockResolvedValue(payload)
  }

  function rejectVerifier(error: Error): void {
    vi.mocked(verifyIdToken).mockRejectedValue(error)
  }

  it('creates a new user when the email is unknown and sets the session cookie', async () => {
    mockVerifier({ sub: 'google-sub-new', email: 'newgoogle@example.com', name: 'New Google User' })

    const response = await postGoogle({ idToken: 'fake-token' })
    expect(response.status).toBe(200)
    const body = (await response.json()) as GoogleSuccess
    expect(body.user.email).toBe('newgoogle@example.com')
    expect(body.user.name).toBe('New Google User')
    expect(body.user.role).toBe('user')

    const cookieHeader = response.headers.get('set-cookie') ?? ''
    expect(cookieHeader).toContain(`${SESSION_COOKIE_NAME}=`)
    expect(cookieHeader).toContain('HttpOnly')

    const client = harness.getClient()
    const inserted = await client.query<{
      id: string
      role: string
      google_sub: string | null
      password_hash: string | null
    }>('SELECT id, role, google_sub, password_hash FROM users WHERE email = $1', [
      'newgoogle@example.com',
    ])
    const row = inserted.rows[0]
    expect(row).toBeDefined()
    expect(row?.role).toBe('user')
    expect(row?.google_sub).toBe('google-sub-new')
    expect(row?.password_hash).toBeNull()
    expect(body.user.id).toBe(row?.id)
  })

  it('links to an existing email-only account by attaching google_sub without creating a duplicate', async () => {
    const client = harness.getClient()
    const seeded = await client.query<{ id: string }>(
      `INSERT INTO users (email, name, password_hash, google_sub, role)
       VALUES ($1, 'Existing Member', 'fake-hash', NULL, 'user')
       RETURNING id`,
      ['link@example.com'],
    )
    const seededId = seeded.rows[0]?.id
    expect(seededId).toBeDefined()

    mockVerifier({ sub: 'google-sub-link', email: 'link@example.com', name: 'Google Display' })

    const response = await postGoogle({ idToken: 'fake-token' })
    expect(response.status).toBe(200)
    const body = (await response.json()) as GoogleSuccess
    expect(body.user.id).toBe(seededId)
    expect(body.user.email).toBe('link@example.com')
    expect(body.user.role).toBe('user')

    const linked = await client.query<{ google_sub: string | null; password_hash: string | null }>(
      'SELECT google_sub, password_hash FROM users WHERE id = $1',
      [seededId],
    )
    expect(linked.rows[0]?.google_sub).toBe('google-sub-link')
    expect(linked.rows[0]?.password_hash).toBe('fake-hash')

    const count = await client.query<{ count: string }>(
      'SELECT COUNT(*)::text AS count FROM users WHERE email = $1',
      ['link@example.com'],
    )
    expect(count.rows[0]?.count).toBe('1')
  })

  it('preserves role=admin when linking to the bootstrap-admin stub via Google', async () => {
    const client = harness.getClient()
    const seeded = await client.query<{ id: string }>(
      `INSERT INTO users (email, name, password_hash, google_sub, role)
       VALUES ($1, 'Bootstrap Admin', NULL, NULL, 'admin')
       RETURNING id`,
      ['admin@example.com'],
    )
    const stubId = seeded.rows[0]?.id

    mockVerifier({ sub: 'google-sub-admin', email: 'admin@example.com', name: 'Real Admin' })

    const response = await postGoogle({ idToken: 'fake-token' })
    expect(response.status).toBe(200)
    const body = (await response.json()) as GoogleSuccess
    expect(body.user.id).toBe(stubId)
    expect(body.user.role).toBe('admin')

    const linked = await client.query<{ google_sub: string | null; role: string }>(
      'SELECT google_sub, role FROM users WHERE id = $1',
      [stubId],
    )
    expect(linked.rows[0]?.google_sub).toBe('google-sub-admin')
    expect(linked.rows[0]?.role).toBe('admin')
  })

  it('returns 401 invalid_google_token when verification fails', async () => {
    rejectVerifier(new Error('bad token'))

    const response = await postGoogle({ idToken: 'bad' })
    expect(response.status).toBe(401)
    const body = (await response.json()) as GoogleError
    expect(body).toEqual({ error: 'invalid_google_token' })

    const cookieHeader = response.headers.get('set-cookie')
    expect(cookieHeader).toBeNull()
  })

  it('rejects a request missing the idToken field with 400 invalid_input', async () => {
    const response = await postGoogle({} as { idToken: string })
    expect(response.status).toBe(400)
    const body = (await response.json()) as GoogleError
    expect(body.error).toBe('invalid_input')
  })

  it('rejects a POST without the CSRF header with 403', async () => {
    const response = await fetch(`${baseUrl}/api/auth/google`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ idToken: 'fake-token' }),
    })
    expect(response.status).toBe(403)
    const body = (await response.json()) as GoogleError
    expect(body).toEqual({ error: 'csrf_missing' })
  })
})
