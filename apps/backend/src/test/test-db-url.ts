/**
 * Resolves the database URL used by the test suite.
 *
 * Tests build the schema inside per-test BEGIN/ROLLBACK transactions, which
 * requires the committed public schema to be empty. The seeded dev database
 * (`app`) has committed tables, so tests must run against a separate,
 * always-empty database. Defaults to the dev database name suffixed with
 * `_test`; override with TEST_DATABASE_URL.
 */
export function resolveTestDatabaseUrl(): string {
  const explicit = process.env.TEST_DATABASE_URL
  if (explicit) return explicit

  const base = process.env.DATABASE_URL
  if (!base) {
    throw new Error('DATABASE_URL must be set to derive the test database URL')
  }

  const url = new URL(base)
  const path = url.pathname.replace(/\/$/, '')
  if (path.endsWith('_test')) return base
  url.pathname = `${path}_test`
  return url.toString()
}
