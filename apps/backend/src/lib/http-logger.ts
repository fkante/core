import type { IncomingMessage, ServerResponse } from 'node:http'

import type { AuthUser } from 'core'
import { type HttpLogger, pinoHttp } from 'pino-http'
import { v7 as uuidv7 } from 'uuid'

import { logger } from './logger.js'

const REQUEST_ID_HEADER = 'x-request-id'

function generateRequestId(req: IncomingMessage, res: ServerResponse): string {
  const inbound = req.headers[REQUEST_ID_HEADER]
  const candidate = Array.isArray(inbound) ? inbound[0] : inbound
  if (typeof candidate === 'string' && candidate.length > 0) {
    res.setHeader('X-Request-Id', candidate)
    return candidate
  }
  const generated = uuidv7()
  res.setHeader('X-Request-Id', generated)
  return generated
}

type RequestWithRoute = IncomingMessage & {
  route?: { path?: string }
  originalUrl?: string
}

type RequestWithUser = IncomingMessage & {
  user?: AuthUser | null
}

function readRoute(req: IncomingMessage): string | undefined {
  const routed = (req as RequestWithRoute).route?.path
  if (typeof routed === 'string' && routed.length > 0) return routed
  const original = (req as RequestWithRoute).originalUrl
  if (typeof original === 'string' && original.length > 0) return original
  return req.url ?? undefined
}

function readUserId(req: IncomingMessage): string | undefined {
  const user = (req as RequestWithUser).user
  return user?.id
}

export const httpLogger: HttpLogger = pinoHttp({
  logger,
  genReqId: generateRequestId,
  customProps: (req, _res) => ({
    request_id: req.id,
    user_id: readUserId(req),
    route: readRoute(req),
  }),
  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return 'error'
    if (res.statusCode >= 400) return 'warn'
    return 'info'
  },
})
