import { OAuth2Client } from 'google-auth-library'

import { config } from '../config/index.js'

export interface GoogleTokenPayload {
  sub: string
  email: string
  name: string
}

export type VerifyGoogleIdToken = (idToken: string) => Promise<GoogleTokenPayload>

const client = new OAuth2Client(config.google.clientId)

export const verifyGoogleIdToken: VerifyGoogleIdToken = async (idToken) => {
  if (!config.google.clientId) {
    throw new Error('google_not_configured')
  }
  const ticket = await client.verifyIdToken({
    idToken,
    audience: config.google.clientId,
  })
  const payload = ticket.getPayload()
  if (!payload || !payload.sub || !payload.email) {
    throw new Error('invalid_google_token')
  }
  if (payload.email_verified === false) {
    throw new Error('email_not_verified')
  }
  const fallbackName = payload.email.split('@')[0] ?? 'User'
  return {
    sub: payload.sub,
    email: payload.email,
    name: payload.name ?? fallbackName,
  }
}
