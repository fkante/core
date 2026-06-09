import { createApp } from './app.js'
import { config } from './config/index.js'
import { connectToDatabase, pool } from './db/index.js'
import { assertSchemaPresent, SchemaMissingError } from './db/schema-check.js'
import { logger } from './lib/logger.js'

try {
  await connectToDatabase()
  logger.info('Database connection established')
} catch (error) {
  logger.error({ err: error }, 'Failed to connect to database on boot')
  process.exit(1)
}

if (config.nodeEnv !== 'test') {
  try {
    await assertSchemaPresent()
    logger.info('Database schema verified')
  } catch (error) {
    if (error instanceof SchemaMissingError) {
      logger.error(
        'Database schema not found. Run: pnpm --filter backend db:migrate && pnpm --filter backend db:seed',
      )
      process.exit(1)
    }
    logger.error({ err: error }, 'Failed to verify database schema on boot')
    process.exit(1)
  }
}

const app = createApp()

const server = app.listen(config.port, config.host, () => {
  logger.info(
    {
      url: `http://${config.host}:${config.port}`,
      environment: config.nodeEnv,
      startedAt: new Date().toISOString(),
    },
    'Server started',
  )
})

const gracefulShutdown = (signal: string) => {
  logger.info({ signal }, 'Received shutdown signal, closing server')

  server.close(async () => {
    logger.info('HTTP server closed')
    try {
      await pool.end()
    } catch (error) {
      logger.error({ err: error }, 'Error while closing database pool')
    }
    process.exit(0)
  })

  setTimeout(() => {
    logger.error('Forced shutdown after timeout')
    process.exit(1)
  }, 10_000)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))
