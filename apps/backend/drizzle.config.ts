import 'node:process'

import { defineConfig } from 'drizzle-kit'

if (!process.env.DATABASE_URL) {
  process.loadEnvFile('.env')
}

const url = process.env.DATABASE_URL

if (!url) {
  throw new Error('DATABASE_URL must be set for drizzle-kit')
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema',
  out: './drizzle',
  dbCredentials: {
    url,
  },
  strict: true,
  verbose: true,
})
