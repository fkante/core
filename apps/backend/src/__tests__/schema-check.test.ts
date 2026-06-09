import { drizzle } from 'drizzle-orm/node-postgres'
import { describe, expect, it } from 'vitest'

import { assertSchemaPresent, SchemaMissingError } from '../db/schema-check.js'
import { useTransactionalDb } from '../test/db.js'
import { applyMigrations } from '../test/migrate.js'

describe('assertSchemaPresent', () => {
  const harness = useTransactionalDb()

  it('resolves when the schema is present', async () => {
    const client = harness.getClient()
    await applyMigrations(client)
    const database = drizzle({ client })

    await expect(assertSchemaPresent(database)).resolves.toBeUndefined()
  })

  it('throws SchemaMissingError when the users table does not exist', async () => {
    const client = harness.getClient()
    const database = drizzle({ client })

    await expect(assertSchemaPresent(database)).rejects.toBeInstanceOf(SchemaMissingError)
  })
})
