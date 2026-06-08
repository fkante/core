import type { NextFunction, Request, Response } from 'express'

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])
const CSRF_HEADER = 'x-app-csrf'

export function csrfMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (SAFE_METHODS.has(req.method)) {
    next()
    return
  }
  if (req.headers[CSRF_HEADER] !== '1') {
    res.status(403).json({ error: 'csrf_missing' })
    return
  }
  next()
}
