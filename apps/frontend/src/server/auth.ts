import { createServerFn } from '@tanstack/react-start'
import { getRequestHeader } from '@tanstack/react-start/server'
import type { AuthUser } from 'core'

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL ?? ''

interface SessionResponse {
  user: AuthUser | null
}

/**
 * Server function used to gate routes during SSR. Reads the inbound session
 * cookie and relays it to the backend `GET /api/auth/session`, so the backend
 * stays the single source of truth for who is signed in. Call it from a route's
 * `beforeLoad` to redirect unauthenticated users before any protected HTML is
 * rendered.
 */
export const getCurrentUserFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<AuthUser | null> => {
    const cookieHeader = getRequestHeader('cookie')
    if (!cookieHeader) return null

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/session`, {
        headers: { cookie: cookieHeader },
      })
      if (!response.ok) return null
      const body = (await response.json()) as SessionResponse
      return body.user
    } catch {
      return null
    }
  },
)
