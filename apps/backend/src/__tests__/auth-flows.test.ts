import type { Server } from 'node:http'
import type { AddressInfo } from 'node:net'

import argon2 from 'argon2'
import { drizzle } from 'drizzle-orm/node-postgres'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { createApp } from '../app.js'
import { SESSION_COOKIE_NAME } from '../lib/session.js'
import { useTransactionalDb } from '../test/db.js'
import { applyMigrations } from '../test/migrate.js'

const CSRF_HEADERS = {
  'content-type': 'application/json',
  'x-app-csrf': '1',
}

type SignupBody = { email: string; password: string; name: string }
type SigninBody = { email: string; password: string }
type AuthSuccess = { user: { id: string; name: string; email: string; role: 'user' | 'admin' } }
type AuthError = { error: string; issues?: Array<{ message: string }> }

describe('Auth flows', () => {
  const harness = useTransactionalDb()

  let server: Server
  let baseUrl: string

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

  function postJson(
    path: string,
    body: SignupBody | SigninBody | object,
    init: RequestInit = {},
  ): Promise<Response> {
    return fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: { ...CSRF_HEADERS, ...(init.headers ?? {}) },
      body: JSON.stringify(body),
      ...init,
    })
  }

  describe('CSRF guard', () => {
    it('rejects POST /api/auth/signup without the CSRF header with 403', async () => {
      const response = await fetch(`${baseUrl}/api/auth/signup`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: 'no-csrf@example.com',
          password: 'Abcdef1!',
          name: 'No CSRF',
        }),
      })
      expect(response.status).toBe(403)
      const body = (await response.json()) as AuthError
      expect(body).toEqual({ error: 'csrf_missing' })
    })

    it('allows GET /api/auth/session without the CSRF header', async () => {
      const response = await fetch(`${baseUrl}/api/auth/session`)
      expect(response.status).toBe(200)
    })
  })

  describe('POST /api/auth/signup', () => {
    it('creates a new user with role=user, hashes the password, and sets the session cookie', async () => {
      const response = await postJson('/api/auth/signup', {
        email: 'new@example.com',
        password: 'Abcdef1!',
        name: 'New User',
      })
      expect(response.status).toBe(201)
      const body = (await response.json()) as AuthSuccess
      expect(body.user.email).toBe('new@example.com')
      expect(body.user.name).toBe('New User')
      expect(body.user.role).toBe('user')

      const cookieHeader = response.headers.get('set-cookie') ?? ''
      expect(cookieHeader).toContain(`${SESSION_COOKIE_NAME}=`)
      expect(cookieHeader).toContain('HttpOnly')

      const client = harness.getClient()
      const inserted = await client.query<{ password_hash: string; role: string; name: string }>(
        'SELECT password_hash, role, name FROM users WHERE email = $1',
        ['new@example.com'],
      )
      const row = inserted.rows[0]
      expect(row).toBeDefined()
      expect(row?.role).toBe('user')
      expect(row?.password_hash).toBeTruthy()
      expect(row?.password_hash).not.toBe('Abcdef1!')
      expect(JSON.stringify(body)).not.toContain('password_hash')
      expect(JSON.stringify(body)).not.toContain(row?.password_hash ?? 'unreachable-placeholder')
    })

    it('rejects a password that is too short', async () => {
      const response = await postJson('/api/auth/signup', {
        email: 'short@example.com',
        password: 'Ab1!',
        name: 'Short',
      })
      expect(response.status).toBe(400)
      const body = (await response.json()) as AuthError
      expect(body.error).toBe('invalid_input')
      const messages = body.issues?.map((issue) => issue.message) ?? []
      expect(messages).toContain('password_too_short')
    })

    it('rejects a password missing an uppercase character', async () => {
      const response = await postJson('/api/auth/signup', {
        email: 'noupper@example.com',
        password: 'abcdef1!',
        name: 'No Upper',
      })
      expect(response.status).toBe(400)
      const body = (await response.json()) as AuthError
      const messages = body.issues?.map((issue) => issue.message) ?? []
      expect(messages).toContain('password_missing_uppercase')
    })

    it('rejects a password missing a digit', async () => {
      const response = await postJson('/api/auth/signup', {
        email: 'nodigit@example.com',
        password: 'Abcdefg!',
        name: 'No Digit',
      })
      expect(response.status).toBe(400)
      const body = (await response.json()) as AuthError
      const messages = body.issues?.map((issue) => issue.message) ?? []
      expect(messages).toContain('password_missing_digit')
    })

    it('rejects a password missing a symbol', async () => {
      const response = await postJson('/api/auth/signup', {
        email: 'nosym@example.com',
        password: 'Abcdef12',
        name: 'No Symbol',
      })
      expect(response.status).toBe(400)
      const body = (await response.json()) as AuthError
      const messages = body.issues?.map((issue) => issue.message) ?? []
      expect(messages).toContain('password_missing_symbol')
    })

    it('returns 409 email_taken when an account with that email already exists', async () => {
      const client = harness.getClient()
      const existingHash = await argon2.hash('Existing1!', { type: argon2.argon2id })
      await client.query(
        'INSERT INTO users (email, name, password_hash, role) VALUES ($1, $2, $3, $4)',
        ['taken@example.com', 'Existing', existingHash, 'user'],
      )

      const response = await postJson('/api/auth/signup', {
        email: 'taken@example.com',
        password: 'Different1!',
        name: 'Other',
      })
      expect(response.status).toBe(409)
      const body = (await response.json()) as AuthError
      expect(body).toEqual({ error: 'email_taken' })
    })

    it('hydrates the bootstrap-admin stub row, preserving role=admin', async () => {
      const client = harness.getClient()
      const seeded = await client.query<{ id: string }>(
        `INSERT INTO users (email, name, password_hash, google_sub, role)
         VALUES ($1, 'Bootstrap Admin', NULL, NULL, 'admin')
         RETURNING id`,
        ['admin@example.com'],
      )
      const stubId = seeded.rows[0]?.id
      expect(stubId).toBeDefined()

      const response = await postJson('/api/auth/signup', {
        email: 'admin@example.com',
        password: 'Adm1nPass!',
        name: 'Real Admin',
      })
      expect(response.status).toBe(201)
      const body = (await response.json()) as AuthSuccess
      expect(body.user.role).toBe('admin')
      expect(body.user.id).toBe(stubId)
      expect(body.user.name).toBe('Real Admin')

      const updated = await client.query<{ password_hash: string; role: string; name: string }>(
        'SELECT password_hash, role, name FROM users WHERE id = $1',
        [stubId],
      )
      expect(updated.rows[0]?.role).toBe('admin')
      expect(updated.rows[0]?.password_hash).toBeTruthy()
      expect(updated.rows[0]?.name).toBe('Real Admin')
    })

    it('does not let signup take over a Google-only account', async () => {
      const client = harness.getClient()
      const seeded = await client.query<{ id: string }>(
        `INSERT INTO users (email, name, password_hash, google_sub, role)
         VALUES ($1, 'Google User', NULL, 'google-sub-xyz', 'user')
         RETURNING id`,
        ['googleonly@example.com'],
      )
      const googleUserId = seeded.rows[0]?.id

      const response = await postJson('/api/auth/signup', {
        email: 'googleonly@example.com',
        password: 'Attacker1!',
        name: 'Attacker',
      })
      expect(response.status).toBe(409)
      expect((await response.json()) as AuthError).toEqual({ error: 'email_taken' })

      const after = await client.query<{ password_hash: string | null; google_sub: string | null }>(
        'SELECT password_hash, google_sub FROM users WHERE id = $1',
        [googleUserId],
      )
      expect(after.rows[0]?.password_hash).toBeNull()
      expect(after.rows[0]?.google_sub).toBe('google-sub-xyz')
    })
  })

  describe('POST /api/auth/signin', () => {
    async function seedMember(email: string, password: string, name = 'Member'): Promise<void> {
      const client = harness.getClient()
      const passwordHash = await argon2.hash(password, { type: argon2.argon2id })
      await client.query(
        'INSERT INTO users (email, name, password_hash, role) VALUES ($1, $2, $3, $4)',
        [email, name, passwordHash, 'user'],
      )
    }

    it('signs in with the correct password and sets the session cookie', async () => {
      await seedMember('signin@example.com', 'GoodPass1!')

      const response = await postJson('/api/auth/signin', {
        email: 'signin@example.com',
        password: 'GoodPass1!',
      })
      expect(response.status).toBe(200)
      const body = (await response.json()) as AuthSuccess
      expect(body.user.email).toBe('signin@example.com')
      expect(JSON.stringify(body)).not.toContain('password_hash')
      const cookieHeader = response.headers.get('set-cookie') ?? ''
      expect(cookieHeader).toContain(`${SESSION_COOKIE_NAME}=`)
    })

    it('returns 401 invalid_credentials on the wrong password', async () => {
      await seedMember('wrong@example.com', 'GoodPass1!')

      const response = await postJson('/api/auth/signin', {
        email: 'wrong@example.com',
        password: 'WrongPass1!',
      })
      expect(response.status).toBe(401)
      const body = (await response.json()) as AuthError
      expect(body).toEqual({ error: 'invalid_credentials' })
    })

    it('returns 401 invalid_credentials when the email is unknown', async () => {
      const response = await postJson('/api/auth/signin', {
        email: 'nobody@example.com',
        password: 'AnyPass1!',
      })
      expect(response.status).toBe(401)
      const body = (await response.json()) as AuthError
      expect(body).toEqual({ error: 'invalid_credentials' })
    })

    it('returns 401 google_only_account when the user has no password hash', async () => {
      const client = harness.getClient()
      await client.query(
        'INSERT INTO users (email, name, password_hash, google_sub, role) VALUES ($1, $2, NULL, $3, $4)',
        ['google@example.com', 'Google User', 'google-sub-123', 'user'],
      )

      const response = await postJson('/api/auth/signin', {
        email: 'google@example.com',
        password: 'AnyPass1!',
      })
      expect(response.status).toBe(401)
      const body = (await response.json()) as AuthError
      expect(body).toEqual({ error: 'google_only_account' })
    })
  })

  describe('POST /api/auth/signout', () => {
    it('returns 204 and emits a Set-Cookie that clears the session', async () => {
      const response = await postJson('/api/auth/signout', {})
      expect(response.status).toBe(204)

      const cookieHeader = response.headers.get('set-cookie') ?? ''
      expect(cookieHeader).toContain(`${SESSION_COOKIE_NAME}=`)
      expect(cookieHeader.toLowerCase()).toMatch(/expires=|max-age=0/)
    })
  })
})
