import { GoogleLogin } from '@react-oauth/google'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import type { AuthUser } from 'core'
import { useState } from 'react'
import { z } from 'zod'

import { ApiError, apiFetch } from '../lib/api'
import { useAuth } from '../lib/auth'

const SearchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/auth')({
  component: AuthScreen,
  validateSearch: SearchSchema,
})

interface AuthResponse {
  user: AuthUser
}

type Mode = 'signin' | 'signup'

const GOOGLE_ENABLED = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID)

const SIGNIN_ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: 'Wrong email or password.',
  google_only_account: 'This email signs in with Google. Use the Google button above.',
  invalid_input: 'Please enter a valid email and password.',
}

const SIGNUP_ERROR_MESSAGES: Record<string, string> = {
  email_taken: 'An account with that email already exists.',
  password_too_short: 'Password must be at least 8 characters.',
  password_missing_uppercase: 'Password must include at least one uppercase letter.',
  password_missing_digit: 'Password must include at least one digit.',
  password_missing_symbol: 'Password must include at least one symbol.',
  invalid_input: 'Please check the form and try again.',
}

const GOOGLE_ERROR_MESSAGES: Record<string, string> = {
  invalid_google_token: 'Google could not verify your sign-in. Please try again.',
}

function resolveRedirect(target: string | undefined): string {
  if (!target) return '/'
  if (typeof window === 'undefined') {
    return target.startsWith('/') && !target.startsWith('//') ? target : '/'
  }
  try {
    const url = new URL(target, window.location.origin)
    if (url.origin === window.location.origin) {
      return url.pathname + url.search + url.hash
    }
  } catch {
    return '/'
  }
  return '/'
}

function describeSignupError(error: ApiError): string {
  if (error.code === 'invalid_input' && error.issues && error.issues.length > 0) {
    const firstMessage = error.issues[0]?.message
    if (firstMessage && SIGNUP_ERROR_MESSAGES[firstMessage]) {
      return SIGNUP_ERROR_MESSAGES[firstMessage]
    }
  }
  return SIGNUP_ERROR_MESSAGES[error.code] ?? 'Could not create your account. Please try again.'
}

function describeSigninError(error: ApiError): string {
  return SIGNIN_ERROR_MESSAGES[error.code] ?? 'Sign-in failed. Please try again.'
}

function describeGoogleError(error: ApiError): string {
  return GOOGLE_ERROR_MESSAGES[error.code] ?? 'Sign-in with Google failed. Please try again.'
}

function AuthScreen() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const { redirect: redirectParam } = Route.useSearch()

  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const completeAuth = (user: AuthUser) => {
    signIn(user)
    navigate({ to: resolveRedirect(redirectParam) })
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (mode === 'signin') {
        const body = await apiFetch<AuthResponse>('/api/auth/signin', {
          method: 'POST',
          body: { email, password },
        })
        completeAuth(body.user)
      } else {
        const body = await apiFetch<AuthResponse>('/api/auth/signup', {
          method: 'POST',
          body: { email, password, name },
        })
        completeAuth(body.user)
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(mode === 'signin' ? describeSigninError(err) : describeSignupError(err))
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    const idToken = credentialResponse.credential
    if (!idToken) {
      setError('Google sign-in did not return a credential.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const body = await apiFetch<AuthResponse>('/api/auth/google', {
        method: 'POST',
        body: { idToken },
      })
      completeAuth(body.user)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(describeGoogleError(err))
      } else {
        setError('Sign-in with Google failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto flex max-w-sm flex-col px-6 py-16">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
        {mode === 'signin' ? 'Sign in' : 'Create account'}
      </h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        {mode === 'signin'
          ? 'Welcome back. Sign in to continue.'
          : 'Set up a new account to get started.'}
      </p>

      {GOOGLE_ENABLED ? (
        <div className="mt-6 flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Sign-in with Google failed.')}
          />
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
        {mode === 'signup' ? (
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">Name</span>
            <input
              type="text"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
          </label>
        ) : null}

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
          />
        </label>

        {error ? (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          setMode(mode === 'signin' ? 'signup' : 'signin')
          setError('')
        }}
        className="mt-4 text-sm text-zinc-500 underline-offset-2 hover:underline dark:text-zinc-400"
      >
        {mode === 'signin' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
      </button>
    </main>
  )
}
