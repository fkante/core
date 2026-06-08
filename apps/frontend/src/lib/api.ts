type JsonPrimitive = string | number | boolean | null

export interface JsonObject {
  [key: string]: JsonValue
}

export type JsonArray = JsonValue[]

export type JsonValue = JsonPrimitive | JsonObject | JsonArray

export interface ApiErrorIssue {
  message: string
  path?: Array<string | number>
}

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly issues?: ApiErrorIssue[]

  constructor(status: number, code: string, issues?: ApiErrorIssue[]) {
    super(code)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.issues = issues
  }
}

export interface ApiFetchInit extends Omit<RequestInit, 'body'> {
  body?: BodyInit | JsonObject | JsonArray | null
}

const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? ''

function resolveUrl(input: RequestInfo | URL): RequestInfo | URL {
  if (typeof input !== 'string') return input
  if (!API_BASE_URL) return input
  if (/^https?:\/\//i.test(input)) return input
  return `${API_BASE_URL}${input}`
}

function isPlainJsonBody(body: ApiFetchInit['body']): body is JsonObject | JsonArray {
  if (body === null || body === undefined) return false
  if (typeof body !== 'object') return false
  if (body instanceof FormData) return false
  if (body instanceof Blob) return false
  if (body instanceof ArrayBuffer) return false
  if (body instanceof URLSearchParams) return false
  if (typeof ReadableStream !== 'undefined' && body instanceof ReadableStream) return false
  if (Array.isArray(body)) return true
  return Object.getPrototypeOf(body) === Object.prototype
}

function methodOf(init: ApiFetchInit | undefined): string {
  return (init?.method ?? 'GET').toUpperCase()
}

function readErrorPayload(
  value: JsonValue | null,
): { code: string; issues?: ApiErrorIssue[] } | null {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return null
  const errorField = value.error
  if (typeof errorField !== 'string') return null
  const issuesField = value.issues
  let issues: ApiErrorIssue[] | undefined
  if (Array.isArray(issuesField)) {
    issues = []
    for (const item of issuesField) {
      if (
        item &&
        typeof item === 'object' &&
        !Array.isArray(item) &&
        typeof item.message === 'string'
      ) {
        const path = Array.isArray(item.path)
          ? item.path.filter(
              (segment): segment is string | number =>
                typeof segment === 'string' || typeof segment === 'number',
            )
          : undefined
        issues.push({ message: item.message, path })
      }
    }
  }
  return { code: errorField, issues }
}

/**
 * The single HTTP client for talking to the backend. Always sends credentials
 * (the session cookie), attaches the CSRF header on state-changing requests,
 * JSON-serializes plain object/array bodies, prefixes `/`-relative URLs with
 * VITE_API_BASE_URL, and throws a typed {@link ApiError} on non-2xx. Never call
 * `fetch` directly from components/routes — always use `apiFetch`.
 */
export async function apiFetch<TResponse = void>(
  input: RequestInfo | URL,
  init?: ApiFetchInit,
): Promise<TResponse> {
  const method = methodOf(init)
  const headers = new Headers(init?.headers)
  let serializedBody: BodyInit | null | undefined

  if (init?.body !== undefined && init.body !== null) {
    if (isPlainJsonBody(init.body)) {
      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json')
      }
      serializedBody = JSON.stringify(init.body)
    } else {
      serializedBody = init.body
    }
  }

  if (method !== 'GET' && method !== 'HEAD' && !headers.has('X-App-CSRF')) {
    headers.set('X-App-CSRF', '1')
  }

  const requestInit: RequestInit = {
    method,
    headers,
    credentials: 'include',
    cache: init?.cache,
    integrity: init?.integrity,
    keepalive: init?.keepalive,
    mode: init?.mode,
    redirect: init?.redirect,
    referrer: init?.referrer,
    referrerPolicy: init?.referrerPolicy,
    signal: init?.signal,
    window: init?.window,
    body: serializedBody,
  }

  const response = await fetch(resolveUrl(input), requestInit)

  if (!response.ok) {
    let payload: { code: string; issues?: ApiErrorIssue[] } | null = null
    try {
      const parsed = (await response.json()) as JsonValue | null
      payload = readErrorPayload(parsed)
    } catch {
      payload = null
    }
    throw new ApiError(response.status, payload?.code ?? `http_${response.status}`, payload?.issues)
  }

  if (response.status === 204 || response.headers.get('Content-Length') === '0') {
    return undefined as TResponse
  }

  const contentType = response.headers.get('Content-Type') ?? ''
  if (!contentType.includes('application/json')) {
    return undefined as TResponse
  }

  return (await response.json()) as TResponse
}
