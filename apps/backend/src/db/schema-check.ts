import { sql } from 'drizzle-orm'
import { DatabaseError } from 'pg'

import { type Database, db as defaultDb } from './index.js'

const UNDEFINED_TABLE_CODE = '42P01'
const MISSING_RELATION_PATTERN = /relation "(\w+)" does not exist/

/**
 * Raised by {@link assertSchemaPresent} when the expected tables are absent.
 * Lets the boot path distinguish a missing schema (operator must migrate/seed)
 * from connection-refused or auth failures, which propagate unchanged.
 */
export class SchemaMissingError extends Error {
  readonly relation: string

  constructor(relation: string) {
    super(`Database relation "${relation}" does not exist`)
    this.name = 'SchemaMissingError'
    this.relation = relation
  }
}

function matchMissingRelation(error: Error): string | null {
  const messageMatch = error.message.match(MISSING_RELATION_PATTERN)
  if (messageMatch?.[1]) {
    return messageMatch[1]
  }
  if (error instanceof DatabaseError && error.code === UNDEFINED_TABLE_CODE) {
    return 'users'
  }
  if (error.cause instanceof Error) {
    return matchMissingRelation(error.cause)
  }
  return null
}

/**
 * Probes for the `users` table to confirm migrations have run. Resolves when the
 * schema is present, throws {@link SchemaMissingError} on an undefined-table
 * error, and re-throws every other error (connection refused, auth, etc.).
 */
export async function assertSchemaPresent(database: Database = defaultDb): Promise<void> {
  try {
    await database.execute(sql`SELECT 1 FROM users LIMIT 1`)
  } catch (error) {
    if (error instanceof Error) {
      const relation = matchMissingRelation(error)
      if (relation) {
        throw new SchemaMissingError(relation)
      }
    }
    throw error
  }
}
