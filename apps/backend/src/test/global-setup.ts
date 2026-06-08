import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

import { Client } from 'pg'

import { resolveTestDatabaseUrl } from './test-db-url.js'

/**
 * Ensures the dedicated test database exists before the suite runs.
 *
 * Connects to the `postgres` maintenance database and creates the test
 * database if it is absent. The test database stays empty — each test builds
 * the schema inside a transaction that is rolled back — so no migrations are
 * applied here.
 */
export default async function globalSetup(): Promise<void> {
  const envPath = resolve(process.cwd(), '.env')
  if (existsSync(envPath)) {
    process.loadEnvFile(envPath)
  }

  const testUrl = new URL(resolveTestDatabaseUrl())
  const databaseName = testUrl.pathname.slice(1)

  const adminUrl = new URL(testUrl.toString())
  adminUrl.pathname = '/postgres'

  const client = new Client({ connectionString: adminUrl.toString() })
  await client.connect()
  try {
    const existing = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [
      databaseName,
    ])
    if (existing.rowCount === 0) {
      await client.query(`CREATE DATABASE "${databaseName}"`)
    }
  } finally {
    await client.end()
  }
}
