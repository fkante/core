import { readdir, readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import type { Client } from 'pg'

const moduleDir = dirname(fileURLToPath(import.meta.url))
const MIGRATIONS_DIR = resolve(moduleDir, '../../drizzle')

/**
 * Replays every committed drizzle migration (in filename order) on the given
 * client, inside whatever transaction the caller has opened. Migration-count-
 * agnostic: new migrations are picked up automatically, so test files never
 * hardcode individual `.sql` paths.
 */
export async function applyMigrations(client: Client): Promise<void> {
  const entries = await readdir(MIGRATIONS_DIR)
  const sqlFiles = entries.filter((file) => file.endsWith('.sql')).sort()
  for (const file of sqlFiles) {
    const sqlText = await readFile(resolve(MIGRATIONS_DIR, file), 'utf-8')
    const statements = sqlText
      .split('--> statement-breakpoint')
      .map((statement) => statement.trim())
      .filter((statement) => statement.length > 0)
    for (const statement of statements) {
      await client.query(statement)
    }
  }
}
