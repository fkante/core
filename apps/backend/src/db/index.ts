import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import { config } from '../config/index.js'

export const pool = new Pool({
  connectionString: config.database.url,
})

export const db = drizzle({ client: pool })

export type Database = NodePgDatabase

export async function connectToDatabase(): Promise<void> {
  const client = await pool.connect()
  try {
    await client.query('SELECT 1')
  } finally {
    client.release()
  }
}
