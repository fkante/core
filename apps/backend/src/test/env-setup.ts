import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

import { resolveTestDatabaseUrl } from './test-db-url.js'

const envPath = resolve(process.cwd(), '.env')

if (existsSync(envPath)) {
  process.loadEnvFile(envPath)
}

process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = resolveTestDatabaseUrl()
