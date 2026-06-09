import type { AuthUser } from 'core'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { apiFetch } from './api'

export type Role = AuthUser['role']

export type { AuthUser }

export type AuthStatus = 'loading' | 'ready'

interface SessionResponse {
  user: AuthUser | null
}

interface AuthState {
  user: AuthUser | null
  status: AuthStatus
  signIn: (user: AuthUser) => void
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')

  useEffect(() => {
    let cancelled = false
    apiFetch<SessionResponse>('/api/auth/session')
      .then((body) => {
        if (cancelled) return
        setUser(body.user)
        setStatus('ready')
      })
      .catch(() => {
        if (cancelled) return
        setUser(null)
        setStatus('ready')
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (user) {
      root.setAttribute('data-signed-in', user.role)
    } else {
      root.removeAttribute('data-signed-in')
    }
  }, [user])

  const signIn = useCallback((next: AuthUser) => setUser(next), [])

  const signOut = useCallback(async () => {
    try {
      await apiFetch('/api/auth/signout', { method: 'POST' })
    } finally {
      setUser(null)
    }
  }, [])

  const value = useMemo<AuthState>(
    () => ({ user, status, signIn, signOut }),
    [user, status, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
