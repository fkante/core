import type { AuthUser } from 'core'

declare global {
  namespace Express {
    interface Request {
      user: AuthUser | null
    }
  }
}

export {}
