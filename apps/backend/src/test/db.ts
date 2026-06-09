import { Client } from 'pg'
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest'

export type TestDbContext = {
  getClient: () => Client
}

export function useTransactionalDb(): TestDbContext {
  let client: Client | null = null

  beforeAll(async () => {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error('DATABASE_URL must be set for transactional DB tests')
    }
    client = new Client({ connectionString })
    await client.connect()
  })

  afterAll(async () => {
    if (client) {
      await client.end()
      client = null
    }
  })

  beforeEach(async () => {
    if (!client) {
      throw new Error('Test DB client not initialized')
    }
    await client.query('BEGIN')
  })

  afterEach(async () => {
    if (!client) return
    await client.query('ROLLBACK')
  })

  return {
    getClient: () => {
      if (!client) {
        throw new Error(
          'Test DB client not initialized — call useTransactionalDb() at the top of describe()',
        )
      }
      return client
    },
  }
}

export async function truncateAllTables(client: Client): Promise<void> {
  const result = await client.query<{ tablename: string }>(
    "SELECT tablename FROM pg_tables WHERE schemaname = 'public'",
  )
  if (result.rows.length === 0) return
  const tableList = result.rows.map((row) => `"${row.tablename}"`).join(', ')
  await client.query(`TRUNCATE TABLE ${tableList} RESTART IDENTITY CASCADE`)
}
