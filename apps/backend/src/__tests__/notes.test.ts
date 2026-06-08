import { createHmac } from 'node:crypto'
import type { Server } from 'node:http'
import type { AddressInfo } from 'node:net'

import { drizzle } from 'drizzle-orm/node-postgres'
import type { Client } from 'pg'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { createApp } from '../app.js'
import { NOTE_RATE_LIMIT } from '../lib/rate-limit.js'
import { SESSION_COOKIE_NAME, sessionSecret } from '../lib/session.js'
import { useTransactionalDb } from '../test/db.js'
import { applyMigrations } from '../test/migrate.js'

function signCookieValue(value: string): string {
  const signature = createHmac('sha256', sessionSecret)
    .update(value)
    .digest('base64')
    .replace(/=+$/, '')
  return `${SESSION_COOKIE_NAME}=${encodeURIComponent(`s:${value}.${signature}`)}`
}

async function insertUser(client: Client, email: string): Promise<string> {
  const result = await client.query<{ id: string }>(
    `INSERT INTO users (email, name, role) VALUES ($1, $2, 'user') RETURNING id`,
    [email, 'Member'],
  )
  const id = result.rows[0]?.id
  if (!id) throw new Error('Failed to seed test user')
  return id
}

type NoteBody = { id: string; userId: string; title: string; body: string }
type ListResponse = { notes: NoteBody[] }
type CreateResponse = { note: NoteBody }
type ErrorResponse = { error: string }

describe('Notes example feature (/api/notes)', () => {
  const harness = useTransactionalDb()

  let server: Server
  let baseUrl: string
  let userId: string
  let cookie: string

  beforeEach(async () => {
    const client = harness.getClient()
    await applyMigrations(client)
    userId = await insertUser(client, 'owner@example.com')
    cookie = signCookieValue(userId)

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

  function postNote(body: object, init: RequestInit = {}): Promise<Response> {
    return fetch(`${baseUrl}/api/notes`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-app-csrf': '1',
        cookie,
        ...(init.headers ?? {}),
      },
      body: JSON.stringify(body),
    })
  }

  it('returns 401 unauthenticated for GET without a session', async () => {
    const response = await fetch(`${baseUrl}/api/notes`)
    expect(response.status).toBe(401)
    expect((await response.json()) as ErrorResponse).toEqual({ error: 'unauthenticated' })
  })

  it('returns 403 csrf_missing for POST without the CSRF header', async () => {
    const response = await fetch(`${baseUrl}/api/notes`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ title: 'No CSRF' }),
    })
    expect(response.status).toBe(403)
    expect((await response.json()) as ErrorResponse).toEqual({ error: 'csrf_missing' })
  })

  it('returns 401 unauthenticated for POST without a session', async () => {
    const response = await fetch(`${baseUrl}/api/notes`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-app-csrf': '1' },
      body: JSON.stringify({ title: 'No session' }),
    })
    expect(response.status).toBe(401)
    expect((await response.json()) as ErrorResponse).toEqual({ error: 'unauthenticated' })
  })

  it('rejects an empty title with 400 invalid_input', async () => {
    const response = await postNote({ title: '' })
    expect(response.status).toBe(400)
    expect(((await response.json()) as ErrorResponse).error).toBe('invalid_input')
  })

  it('creates a note (201) owned by the session user and persists it', async () => {
    const response = await postNote({ title: 'First note', body: 'hello' })
    expect(response.status).toBe(201)
    const body = (await response.json()) as CreateResponse
    expect(body.note.title).toBe('First note')
    expect(body.note.body).toBe('hello')
    expect(body.note.userId).toBe(userId)

    const client = harness.getClient()
    const persisted = await client.query<{ title: string }>(
      'SELECT title FROM notes WHERE user_id = $1',
      [userId],
    )
    expect(persisted.rows.map((row) => row.title)).toContain('First note')
  })

  it('lists only the session user’s notes, newest first', async () => {
    const client = harness.getClient()
    const otherUserId = await insertUser(client, 'other@example.com')
    await client.query(`INSERT INTO notes (user_id, title) VALUES ($1, 'Theirs')`, [otherUserId])
    await client.query(
      `INSERT INTO notes (user_id, title, created_at) VALUES
         ($1, 'Older', now() - interval '2 hours'),
         ($1, 'Newer', now() - interval '1 hour')`,
      [userId],
    )

    const response = await fetch(`${baseUrl}/api/notes`, { headers: { cookie } })
    expect(response.status).toBe(200)
    const body = (await response.json()) as ListResponse
    const titles = body.notes.map((note) => note.title)
    expect(titles).toEqual(['Newer', 'Older'])
    expect(titles).not.toContain('Theirs')
  })

  it('returns 429 rate_limited with Retry-After once the window limit is reached', async () => {
    const client = harness.getClient()
    const values = Array.from(
      { length: NOTE_RATE_LIMIT },
      (_unused, index) => `($1, 'note ${index}')`,
    ).join(', ')
    await client.query(`INSERT INTO notes (user_id, title) VALUES ${values}`, [userId])

    const response = await postNote({ title: 'Over the limit' })
    expect(response.status).toBe(429)
    expect((await response.json()) as ErrorResponse).toEqual({ error: 'rate_limited' })
    expect(response.headers.get('retry-after')).toBeTruthy()
  })
})
