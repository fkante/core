import { type Logger, type LoggerOptions, pino } from 'pino'

import { config } from '../config/index.js'

const isTest = config.nodeEnv === 'test'
const isDevelopment = config.nodeEnv === 'development'

const baseOptions: LoggerOptions = {
  level: isTest ? 'silent' : config.logging.level,
}

const devTransport: LoggerOptions['transport'] = {
  target: 'pino-pretty',
  options: {
    colorize: true,
    translateTime: 'SYS:standard',
    ignore: 'pid,hostname',
  },
}

export const logger: Logger = pino(
  isDevelopment ? { ...baseOptions, transport: devTransport } : baseOptions,
)
