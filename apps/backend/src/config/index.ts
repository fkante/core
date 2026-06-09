import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().int().positive().default(3000),
    HOST: z.string().default('0.0.0.0'),
    DATABASE_URL: z.url(),
    SESSION_SECRET: z.string().min(32).optional(),
    APP_DOMAIN: z.string().default('localhost'),
    ADMIN_BOOTSTRAP_EMAIL: z.email(),
    GOOGLE_CLIENT_ID: z.string().default(''),
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    CORS_ORIGIN: z.string().default('http://localhost:5173'),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
})

export const config = {
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  host: env.HOST,
  database: {
    url: env.DATABASE_URL,
  },
  session: {
    secret: env.SESSION_SECRET,
  },
  app: {
    domain: env.APP_DOMAIN,
  },
  admin: {
    bootstrapEmail: env.ADMIN_BOOTSTRAP_EMAIL,
  },
  google: {
    clientId: env.GOOGLE_CLIENT_ID,
  },
  logging: {
    level: env.LOG_LEVEL,
  },
  cors: {
    origin: env.CORS_ORIGIN,
  },
} as const
