import { randomBytes } from 'node:crypto'

import type { AuthUser } from 'core'
import type { CookieOptions, Response } from 'express'

import { config } from '../config/index.js'
import { logger } from './logger.js'

export const SESSION_COOKIE_NAME = 'app_session'
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

function resolveSessionSecret(): string {
  const fromEnv = config.session.secret
  if (fromEnv && fromEnv.length >= 32) return fromEnv
  if (config.nodeEnv === 'production') {
    throw new Error('SESSION_SECRET is required in production and must be at least 32 characters')
  }
  const generated = randomBytes(48).toString('hex')
  logger.warn(
    'SESSION_SECRET is not set; generated a random secret for this dev process. Cookies will be invalidated on every restart.',
  )
  return generated
}

export const sessionSecret: string = resolveSessionSecret()

function buildCookieOptions(): CookieOptions {
  const isProduction = config.nodeEnv === 'production'
  const options: CookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    signed: true,
    maxAge: THIRTY_DAYS_MS,
  }
  if (isProduction) {
    options.domain = `.${config.app.domain}`
  }
  return options
}

export function setSessionCookie(res: Response, user: AuthUser): void {
  res.cookie(SESSION_COOKIE_NAME, user.id, buildCookieOptions())
}

export function clearSessionCookie(res: Response): void {
  const { maxAge: _maxAge, ...options } = buildCookieOptions()
  res.clearCookie(SESSION_COOKIE_NAME, options)
}
