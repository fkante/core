import type { Server } from 'node:http'
import type { AddressInfo } from 'node:net'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { createApp } from '../app.js'

type HealthResponse = {
  status: string
  timestamp: string
  uptime: number
  environment: string
}

type NotFoundResponse = {
  error: string
  message: string
}

describe('backend http app', () => {
  let server: Server
  let baseUrl: string

  beforeAll(async () => {
    const app = createApp()
    await new Promise<void>((resolveListening) => {
      server = app.listen(0, '127.0.0.1', () => resolveListening())
    })
    const address = server.address() as AddressInfo
    baseUrl = `http://127.0.0.1:${address.port}`
  })

  afterAll(async () => {
    await new Promise<void>((resolveClose, rejectClose) => {
      server.close((closeError) => (closeError ? rejectClose(closeError) : resolveClose()))
    })
  })

  it('GET /health returns 200 with { status, timestamp, uptime, environment }', async () => {
    const response = await fetch(`${baseUrl}/health`)
    expect(response.status).toBe(200)

    const body = (await response.json()) as HealthResponse
    expect(body).toEqual({
      status: 'ok',
      timestamp: expect.any(String),
      uptime: expect.any(Number),
      environment: expect.any(String),
    })
    expect(() => new Date(body.timestamp).toISOString()).not.toThrow()
  })

  it('GET /does-not-exist returns 404 with { error, message }', async () => {
    const response = await fetch(`${baseUrl}/does-not-exist`)
    expect(response.status).toBe(404)

    const body = (await response.json()) as NotFoundResponse
    expect(body).toEqual({
      error: 'Not Found',
      message: 'The requested resource does not exist',
    })
  })
})
