import { describe, expect, it } from 'vitest'

import { useTransactionalDb } from '../test/db.js'

describe('transactional db harness', () => {
  const db = useTransactionalDb()

  it('connects to the test database', async () => {
    const result = await db.getClient().query<{ now: Date }>('SELECT NOW() as now')
    const firstRow = result.rows[0]
    expect(firstRow).toBeDefined()
    expect(firstRow?.now).toBeInstanceOf(Date)
  })

  it('first test write is rolled back before the second test runs', async () => {
    await db.getClient().query('CREATE TEMP TABLE IF NOT EXISTS harness_smoke (id int)')
    await db.getClient().query('INSERT INTO harness_smoke (id) VALUES (1)')
    const result = await db
      .getClient()
      .query<{ count: string }>('SELECT COUNT(*)::text as count FROM harness_smoke')
    expect(result.rows[0]?.count).toBe('1')
  })

  it('previous test insert was rolled back (empty count)', async () => {
    await db.getClient().query('CREATE TEMP TABLE IF NOT EXISTS harness_smoke (id int)')
    const result = await db
      .getClient()
      .query<{ count: string }>('SELECT COUNT(*)::text as count FROM harness_smoke')
    expect(result.rows[0]?.count).toBe('0')
  })
})
