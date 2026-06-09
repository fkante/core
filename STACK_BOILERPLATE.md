# Full-Stack Boilerplate Reference

> An exhaustive, app-agnostic extraction of the stack, architecture, wiring, and
> conventions used in this repository. Use this as the blueprint for spinning up
> new apps at scale on the same foundation: **pnpm + Nx monorepo · TanStack Start
> (React 19) frontend · Express 5 backend · PostgreSQL + Drizzle ORM · cookie-session
> auth with Google OAuth + email/password.**
>
> The domain in this repo is a cycling-components catalog ("LaPince"). This document
> strips the domain specifics and documents the **reusable skeleton**. Where a concrete
> example helps, it's labelled as such — swap it for your own domain.

---

## 1. High-Level Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                         pnpm workspace (monorepo)                      │
│                                                                        │
│  apps/frontend            apps/backend            packages/core        │
│  ─────────────            ────────────            ─────────────        │
│  TanStack Start           Express 5 API           Shared TS types      │
│  React 19.2 + Vite 7      Drizzle ORM             + pure runtime logic │
│  TanStack Router/Query    PostgreSQL (pg Pool)    (ESM, project ref)   │
│  tRPC client (opt)        Argon2 + Google OAuth   "core": workspace:*  │
│  Tailwind 4               Zod-validated env                            │
│                                                                        │
│        nginx (prod) ──► serves SPA, proxies /api ──► Express :3000     │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
                       PostgreSQL (bitnami image)
```

- **Frontend** and **backend** are independent deployables. They share **only** the
  `core` package (types + pure domain logic). No backend code is imported by the
  frontend and vice versa.
- The frontend talks to the backend over HTTP (`fetch` wrapper). In dev it's
  cross-origin (`localhost:5173` → `localhost:3000`) with CORS + credentials; in prod
  nginx serves the SPA and reverse-proxies `/api` to the backend (same-origin).
- **Auth is cookie-based** (signed, httpOnly session cookie holding the user id). The
  backend is the single source of truth; the frontend never stores tokens.
- **Nx** orchestrates and caches `build`/`test`/`lint`/`typecheck` across projects.

---

## 2. Tooling & Runtime Baseline

| Concern            | Choice                                                                        |
| ------------------ | ----------------------------------------------------------------------------- |
| Runtime            | **Node.js >= 26** (pinned via `.nvmrc` → `26`)                                |
| Package manager    | **pnpm >= 10.11** (`packageManager: pnpm@10.11.0`)                            |
| Workspaces         | pnpm workspaces + **catalog** (single version source of truth)                |
| Build orchestration| **Nx 21** (`nx.json`, cached targets)                                         |
| Language           | **TypeScript 6**, strict, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`  |
| Lint               | **ESLint 9** flat config (root `eslint.config.mjs`)                           |
| Format             | **Prettier 3** (no semicolons, single quotes, trailing commas, width 100)     |
| Validation         | **Zod 4** (shared via catalog)                                                |
| Tests              | **Vitest 3**                                                                  |
| Containers         | Docker + Docker Compose (dev + prod compose files)                            |

### `.npmrc`
```ini
auto-install-peers=true
dedupe-peer-dependents=true
engine-strict=true
strict-peer-dependencies=false
resolution-mode=highest
prefer-workspace-packages=true
```

### `.prettierrc.json`
```json
{ "semi": false, "singleQuote": true, "trailingComma": "all", "printWidth": 100, "tabWidth": 2, "useTabs": false }
```

---

## 3. Monorepo Layout

```
.
├── apps/
│   ├── backend/          # Express 5 API server
│   ├── frontend/         # TanStack Start (React 19, Vite 7)
│   └── Dockerfile.dev    # Shared dev image (installs full workspace)
├── packages/
│   └── core/             # Shared types + pure domain logic (ESM, composite)
├── scripts/              # start.sh (dev), deploy.sh (prod) docker helpers
├── compose.yml           # Dev docker compose (hot reload, volume mounts)
├── compose.prod.yml      # Prod docker compose (multi-stage builds, nginx)
├── nx.json               # Nx pipelines + cache config
├── pnpm-workspace.yaml   # Workspace globs + catalog (pinned versions)
├── tsconfig.base.json    # Strict TS base every project extends
├── eslint.config.mjs     # Flat ESLint config (root, covers all projects)
├── .prettierrc.json
├── .nvmrc                # 26
└── package.json          # Root scripts fan out via pnpm --filter / nx run-many
```

### `pnpm-workspace.yaml` (workspaces + catalog)
```yaml
packages:
  - 'apps/*'
  - 'packages/*'

catalog:
  typescript: ^6.0.3
  tsx: ^4.20.1
  '@types/node': ^25.8.0
  react: ^19.2.0
  react-dom: ^19.2.0
  '@types/react': ^19.2.0
  '@types/react-dom': ^19.2.0
  zod: ^4.1.11
  eslint: ^9.28.0
  # …lint/format/test deps pinned here
  vitest: ^3.0.5
```
Apps reference catalog versions with `"zod": "catalog:"` etc., so every package stays
on one version. **To bump a shared dep, edit the catalog once.**

### Root `package.json` scripts (the operational surface)
```jsonc
{
  "scripts": {
    "start:dev": "bash scripts/start.sh",          // docker dev stack
    "start:prod": "bash scripts/deploy.sh",        // docker prod stack
    "stop": "docker compose -f compose.yml down && docker compose -f compose.prod.yml down",
    "bootstrap": "docker compose -f compose.yml up -d --wait postgres && pnpm --filter backend db:migrate && pnpm --filter backend db:seed",
    "db:reset": "…drop schema…&& db:migrate && db:seed",

    "dev": "nx run-many -t dev --parallel=10",     // frontend + backend + core watcher
    "dev:frontend": "pnpm --filter frontend dev",
    "dev:backend": "pnpm --filter backend dev",
    "dev:core": "pnpm --filter core dev",

    "build": "nx run-many -t build",
    "typecheck": "nx run-many -t typecheck",
    "lint": "eslint .",
    "format": "prettier --write .",
    "test": "nx run-many -t test",
    "graph": "nx graph"
  },
  "engines": { "node": ">=26.0.0", "pnpm": ">=10.11.0" }
}
```

### `nx.json` — caching strategy
- `namedInputs.production` excludes test/spec/config files so a test change doesn't
  bust the build cache.
- `targetDefaults` enables `cache: true` for `build`, `test`, `lint`, `typecheck`.
- `build` has `dependsOn: ["^build"]` so `core` builds before its consumers.
- `outputs: ["{projectRoot}/dist"]` tells Nx what to cache.

### `tsconfig.base.json` (every project extends this)
```jsonc
{
  "compilerOptions": {
    "target": "ES2023", "module": "ESNext", "moduleResolution": "bundler",
    "lib": ["ES2023"], "esModuleInterop": true, "resolveJsonModule": true,
    "isolatedModules": true, "verbatimModuleSyntax": true,
    "forceConsistentCasingInFileNames": true, "skipLibCheck": true,
    "strict": true, "noUncheckedIndexedAccess": true, "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true, "noUnusedLocals": true,
    "noUnusedParameters": true, "noImplicitReturns": true
  }
}
```
- Backend & core override to `module: NodeNext` / `moduleResolution: NodeNext` (so
  relative imports need the `.js` extension) and set `outDir`/`rootDir`/`declaration`.
- Frontend sets `jsx: react-jsx`, adds DOM libs, `noEmit: true`, path alias `@/* → ./src/*`.
- Core is `composite: true` (project reference, emits declarations).

---

## 4. The Shared `core` Package

Single source of truth for types **and** pure domain logic shared by both apps.
Referenced as `"core": "workspace:*"` (the bare name `core`, **not** a scoped name).

```
packages/core/
├── package.json          # type: module, exports map → ./dist/index.js + .d.ts
├── tsconfig.json         # composite, NodeNext, emits declarations to dist/
└── src/
    ├── index.ts          # re-exports types barrel + runtime modules
    ├── types/
    │   ├── index.ts      # barrel
    │   ├── auth.ts       # AuthUser, Role-ish unions
    │   └── …             # domain types (catalog, reports, admin, …)
    └── reliability.ts    # EXAMPLE: pure domain logic (no IO), unit-tested from backend
```

### `package.json` (exports map pattern)
```json
{
  "name": "core",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": { ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" } },
  "files": ["dist"],
  "scripts": { "build": "tsc", "dev": "tsc -w", "typecheck": "tsc --noEmit" },
  "nx": { "targets": { "build": { "cache": true, "outputs": ["{projectRoot}/dist"] } } }
}
```

**Rules / conventions:**
- Consumers resolve `core` to `./dist/index.js`. **After editing types you must
  rebuild** (`pnpm --filter core build`) before app typecheck sees the change. Nx
  handles this via `dependsOn: ["^build"]` in CI; in dev run `pnpm dev:core` (tsc -w).
- `verbatimModuleSyntax` + NodeNext ⇒ use `import type` / `export type` for type-only
  imports and include the `.js` extension on relative imports.
- **What lives here:** domain types both apps depend on; pure functions with no DB/IO
  (the canonical example is the reliability rollup math — deterministic, idempotent,
  unit-tested). **What does NOT:** UI-only derived types, fixture data, framework
  display constants.
- `core` has **no test runner**. Unit tests for its runtime modules live in the
  backend and import from `'core'` against the built `dist/` (so build core first).

---

## 5. Backend (`apps/backend`) — Express 5 API

### 5.1 Dependencies
```jsonc
"dependencies": {
  "@t3-oss/env-core": "^0.13.8",   // typed env validation
  "argon2": "^0.44.0",             // password hashing (argon2id)
  "cookie-parser": "^1.4.7",       // signed cookies
  "core": "workspace:*",
  "cors": "^2.8.5",
  "drizzle-orm": "^0.45.2",        // SQL query builder / ORM
  "express": "^5.1.0",
  "google-auth-library": "^10.6.2",// Google ID token verification
  "helmet": "^8.0.0",              // security headers
  "pg": "^8.21.0",                 // postgres driver (Pool)
  "pino": "^10.3.1",               // structured logging
  "pino-http": "^11.0.0",
  "pino-pretty": "^13.1.3",        // dev log formatting
  "uuid": "^14.0.0",               // request id (v7)
  "zod": "catalog:"
},
"devDependencies": { "drizzle-kit": "^0.31.10", "tsx": "…", "vitest": "…", … }
```

### 5.2 Scripts
```jsonc
{
  "dev": "node --watch --env-file-if-exists=.env --import tsx/esm src/index.ts",
  "build": "tsc",
  "start": "node --env-file-if-exists=.env dist/index.js",
  "typecheck": "tsc --noEmit && tsc --noEmit -p tsconfig.test.json",
  "test": "vitest run",
  "db:generate": "drizzle-kit generate",   // schema → SQL migration
  "db:migrate": "drizzle-kit migrate",      // apply migrations
  "db:seed": "tsx --env-file-if-exists=.env src/db/seed.ts"
}
```
Note: dev uses Node's **native `--watch` + `--env-file-if-exists`** with `tsx/esm` as
the TS loader — no nodemon, no ts-node.

### 5.3 Directory structure
```
src/
├── index.ts              # bootstrap: connect DB → verify schema → createApp → listen → graceful shutdown
├── app.ts                # createApp(options) → assembles middleware + routers (testable factory)
├── config/index.ts       # @t3-oss/env-core + Zod env schema → typed `config` object
├── db/
│   ├── index.ts          # pg Pool, drizzle(db), connectToDatabase() probe
│   ├── schema-check.ts    # assertSchemaPresent() boot guard
│   ├── schema/           # one file per table + index.ts barrel
│   ├── seed.ts           # seed() + seedBootstrapAdmin(); CLI-guarded
│   ├── seed-catalog.ts   # domain data seed (idempotent)
│   └── fixtures/         # seed-only fixture data
├── lib/
│   ├── session.ts        # cookie name, secret resolution, set/clear cookie helpers
│   ├── google-verify.ts  # OAuth2Client + verifyGoogleIdToken()
│   ├── logger.ts         # pino instance (silent in test, pretty in dev, json in prod)
│   ├── http-logger.ts    # pino-http: request id, user_id, route on every line
│   ├── rate-limit.ts     # EXAMPLE: rolling-window rate limit via single SQL query
│   └── pii-scrub.ts      # EXAMPLE: redact URLs/emails/phones
├── middleware/
│   ├── session.ts        # reads signed cookie → attaches req.user
│   ├── csrf.ts           # header-presence CSRF guard
│   ├── require-admin.ts  # role gate (401/403)
│   └── error-handler.ts  # ZodError / AppError / 500 handler (last middleware)
├── routes/
│   ├── index.ts          # createApiRouter(db, opts) mounts everything under /api
│   ├── auth.ts           # signup/signin/signout/google/session
│   └── …                 # feature routers (createXRouter(db) factories)
├── types/express.d.ts    # global Express.Request augmentation (req.user)
├── drizzle.config.ts     # drizzle-kit config (schema dir, out dir, db url)
├── drizzle/              # generated SQL migrations + meta/_journal.json
└── tsconfig.json / tsconfig.test.json
```

### 5.4 App construction — the testable factory pattern (CRITICAL)

`app.ts` exports `createApp(options)` rather than constructing a singleton. This is the
core extensibility seam — **all routes and middleware are registered inside
`createApp()` so tests get an identical app with an injected (transactional) DB.**

```ts
// src/app.ts
export interface CreateAppOptions extends CreateApiRouterOptions {
  db?: Database
}

export function createApp(options: CreateAppOptions = {}): Express {
  const { db, ...routerOptions } = options
  const database = db ?? defaultDb
  const app = express()

  app.use(helmet())                                       // security headers
  app.use(cors({ origin: config.cors.origin, credentials: true }))
  app.use(cookieParser(sessionSecret))                    // signed-cookie support
  app.use(httpLogger)                                     // pino-http (request id, etc.)
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(createSessionMiddleware(database))              // attaches req.user

  app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: …, uptime: …, environment: … }))

  app.use('/api', createApiRouter(database, routerOptions))

  app.use((_req, res) => res.status(404).json({ error: 'Not Found', message: '…' }))
  app.use(errorHandler)                                   // MUST be last
  return app
}
```

Dependency injection threads through every layer:
`createApp({ db, verifyIdToken })` → `createApiRouter(db, opts)` → `createAuthRouter(db, opts)`.
Each feature router is a `createXRouter(database = defaultDb)` factory. **Never register
middleware on a top-level singleton in `index.ts`** — tests would miss it.

`index.ts` is the bootstrap only:
```ts
await connectToDatabase()                       // SELECT 1, exit(1) on failure
if (config.nodeEnv !== 'test') await assertSchemaPresent()  // SELECT 1 FROM users
const app = createApp()
const server = app.listen(config.port, config.host, …)
// SIGTERM/SIGINT → server.close() → pool.end() → exit, with 10s forced-shutdown timeout
```

### 5.5 API router composition
```ts
// src/routes/index.ts
export function createApiRouter(database = defaultDb, options = {}): Router {
  const router = Router()
  router.use(csrfMiddleware)                          // BEFORE any handler — covers all /api
  router.use('/auth', createAuthRouter(database, options))
  router.use('/components', createComponentsRouter(database))   // ← example feature
  router.use('/reports', createReportsRouter(database))         // ← example feature
  router.use('/admin/reports', createAdminReportsRouter(database))
  return router
}
```
**To add a feature:** create `src/routes/<feature>.ts` exporting `createXRouter(db)`,
mount it here. CSRF + session middleware apply automatically.

### 5.6 Configuration — typed, validated env (`config/index.ts`)

Env is validated **at module import** via `@t3-oss/env-core` + Zod; a missing/invalid
required var crashes on boot and on test startup.

```ts
export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().int().positive().default(3000),
    HOST: z.string().default('0.0.0.0'),
    DATABASE_URL: z.url(),
    SESSION_SECRET: z.string().min(32).optional(),   // "required in prod" enforced in session.ts
    APP_DOMAIN: z.string().default('localhost'),
    ADMIN_BOOTSTRAP_EMAIL: z.email(),
    GOOGLE_CLIENT_ID: z.string().min(1),
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    CORS_ORIGIN: z.string().default('http://localhost:5173'),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
})

export const config = {
  nodeEnv: env.NODE_ENV, port: env.PORT, host: env.HOST,
  database: { url: env.DATABASE_URL },
  session: { secret: env.SESSION_SECRET },
  app: { domain: env.APP_DOMAIN },
  admin: { bootstrapEmail: env.ADMIN_BOOTSTRAP_EMAIL },
  google: { clientId: env.GOOGLE_CLIENT_ID },
  logging: { level: env.LOG_LEVEL },
  cors: { origin: env.CORS_ORIGIN },
} as const
```
**To add an env var:** extend the `server` schema, then surface it under a namespace on
`config`. Consume `config.*`, never raw `process.env`.

### 5.7 Logging
- `lib/logger.ts`: a single pino instance. `silent` in test (clean test output),
  `pino-pretty` transport in dev, JSON to stdout in prod. Level from `LOG_LEVEL`.
- `lib/http-logger.ts`: `pino-http` middleware. Honors inbound `X-Request-Id` or
  generates a **UUID v7**; echoes it on the response. Every request log line carries
  `request_id`, `user_id`, and `route` via `customProps`. Log level by status:
  `>=500 → error`, `>=400 → warn`, else `info`.
- Convention: use `req.log.<level>({ err }, 'message')` inside handlers; `logger` for
  boot/shutdown/background. `console.*` is **ESLint-banned** in `src/**` (`no-console: error`).

---

## 6. Database Layer — PostgreSQL + Drizzle ORM

### 6.1 Client (`db/index.ts`)
```ts
export const pool = new Pool({ connectionString: config.database.url })
export const db = drizzle({ client: pool })
export type Database = NodePgDatabase            // broad type — Pool- or Client-backed both fit
export async function connectToDatabase(): Promise<void> {
  const client = await pool.connect()
  try { await client.query('SELECT 1') } finally { client.release() }
}
```
The broad `NodePgDatabase` type matters: production uses the Pool-backed default; tests
pass `drizzle({ client })` wrapping a transactional Client — both satisfy `Database`.

### 6.2 Schema definition (`db/schema/*.ts`, one file per table)

Patterns observed across tables:
- **UUID PKs** for entities: `uuid('id').primaryKey().defaultRandom()`.
- **Slug/text PKs** where a human-readable, URL-friendly id is wanted (e.g. the main
  `components` table uses a `text` slug PK so URLs are clean and relations resolve directly).
- **bigserial PKs** for high-volume / append-only tables (reports, events, child rows):
  `bigserial('id', { mode: 'number' })`. When **referencing** a bigserial PK, the FK
  column uses `bigint('col', { mode: 'number' })` (not bigserial — that would attach a sequence).
- **Timestamps**: `timestamp('created_at', { withTimezone: true }).notNull().defaultNow()`
  and `updated_at` with `.defaultNow().$onUpdate(() => new Date())`. ⚠️ `$onUpdate` fires
  only on updates **through the Drizzle API** — raw SQL must set `updated_at` manually.
- **Enums as CHECK constraints** rather than pg enums, e.g.:
  ```ts
  (table) => [check('users_role_check', sql`${table.role} IN ('user', 'admin')`)]
  ```
- **JSONB typed columns**: `jsonb('key_stats').$type<KeyStat[]>().notNull().default([])`
  — the `$type<…>()` ties the column to a `core` type.
- **Text arrays**: `text('thumbs').array().notNull().default(sql`'{}'::text[]`)`.
- **Indexes** including GIN full-text search:
  ```ts
  index('x_search_idx').using('gin', sql`to_tsvector('english', ${t.name} || ' ' || ${t.family})`)
  ```
- **FK cascade**: `.references(() => parent.id, { onDelete: 'cascade' })`.
- Each file exports inferred types: `export type X = typeof xTable.$inferSelect` and
  `$inferInsert`. A `schema/index.ts` barrel re-exports all tables.

**Example — users table (the auth backbone):**
```ts
const citext = customType<{ data: string; driverData: string }>({ dataType: () => 'citext' })

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: citext('email').notNull().unique(),       // citext = case-insensitive
  name: text('name').notNull(),
  passwordHash: text('password_hash'),              // NULL ⇒ Google-only account
  googleSub: text('google_sub').unique(),           // NULL ⇒ never used Google
  role: text('role').notNull().default('user'),
  createdAt: timestamp(…).notNull().defaultNow(),
  updatedAt: timestamp(…).notNull().defaultNow().$onUpdate(() => new Date()),
}, (t) => [check('users_role_check', sql`${t.role} IN ('user', 'admin')`)])
```

### 6.3 Migrations (`drizzle-kit`)
- `drizzle.config.ts` points at `./src/db/schema` (dir) → outputs `./drizzle`.
  Loads `.env` via `process.loadEnvFile('.env')` if `DATABASE_URL` not already set.
- Workflow: edit schema → `pnpm --filter backend db:generate` (writes
  `drizzle/NNNN_name.sql` + `meta/` snapshot + `_journal.json`) → `db:migrate` to apply.
- **Postgres extensions are NOT managed by drizzle-kit.** After generating, manually
  prepend `CREATE EXTENSION IF NOT EXISTS "citext";--> statement-breakpoint` to the SQL
  (it's transactional + re-runnable). Use a `customType` for the column.
- Cross-table type changes (e.g. changing a PK type that other tables FK to) require
  hand-authored SQL: drop FKs → `ALTER … SET DATA TYPE` everywhere → re-add FKs.

### 6.4 Seeding (`db/seed.ts`)
- Every seed helper accepts an optional Drizzle instance defaulting to the pool-backed
  `db`, so tests can pass a transactional one: `seed(database = defaultDb)`.
- Idempotent: `INSERT … ON CONFLICT … DO NOTHING RETURNING id`; check `rowCount`/length
  to know whether you inserted. Child rows only inserted when the parent was newly created.
- CLI guard so the file is importable in tests without running:
  ```ts
  const isCli = import.meta.url === `file://${process.argv[1]}`
  if (isCli) { try { await seed(); await pool.end(); process.exit(0) } catch (e) { … process.exit(1) } }
  ```
- A **bootstrap admin** is seeded from `ADMIN_BOOTSTRAP_EMAIL` with
  `password_hash = NULL, role = 'admin'` — it becomes a real account on first
  email/Google sign-in (see auth decision trees below).

### 6.5 Boot-time schema guard (`db/schema-check.ts`)
`assertSchemaPresent()` runs `SELECT 1 FROM users`; throws `SchemaMissingError` on an
undefined-table error so `index.ts` can print "run db:migrate && db:seed" and `exit(1)`.
Because Drizzle wraps driver errors (`message: "Failed query: …"`), the real pg error
(`.code` like `42P01`) is on `error.cause` — walk the cause chain when classifying.

---

## 7. Authentication & Authorization

A complete, framework-light auth system: **signed httpOnly session cookie holding the
user's UUID**, three sign-in methods (email/password, Google OAuth, existing session),
header-presence CSRF, and a role gate. No JWT, no token storage on the client.

### 7.1 Session cookie (`lib/session.ts`)
- Cookie name `lapince_session`; value is the user's UUID, **signed** via `cookie-parser`
  (`cookie-signature` format `s:<value>.<hmac>`).
- Attributes: `httpOnly`, `sameSite=lax`, `path=/`, `signed`, 30-day `maxAge`; `secure`
  **and** `domain=.${APP_DOMAIN}` only in production.
- Secret resolution: in prod `SESSION_SECRET` is **required, ≥32 chars** (throws on boot
  if missing); in dev/test a random secret is generated per process (cookies invalidate
  on restart) and a warning is logged. The Zod schema marks it `.optional()`; the
  "required in prod" gate lives in `resolveSessionSecret()`, not Zod.
- Exports `SESSION_COOKIE_NAME`, `sessionSecret`, `setSessionCookie(res, user)`,
  `clearSessionCookie(res)`. All auth flows call these — never hand-roll `res.cookie`.

### 7.2 Session middleware (`middleware/session.ts`)
- `createSessionMiddleware(db)` reads `req.signedCookies[SESSION_COOKIE_NAME]`, looks up
  the user (`id, name, email, role`), attaches `req.user: AuthUser | null`. Mounted in
  `createApp()` before `/api` so every handler sees `req.user`.
- A tampered signature makes cookie-parser set the value to `false` → treated as no session.
- `req.user` is typed via global declaration merging:
  ```ts
  // src/types/express.d.ts
  declare global { namespace Express { interface Request { user: AuthUser | null } } }
  ```

### 7.3 CSRF (`middleware/csrf.ts`)
Header-presence defense (not per-session tokens). Any non-`GET/HEAD/OPTIONS` request
**must** carry `X-Lapince-CSRF: 1` or it gets `403 { error: 'csrf_missing' }`. Rationale:
browsers can't set custom headers cross-origin without a CORS preflight handshake, so the
header's presence proves a same-origin / cooperating caller. Mounted first on `/api`.

### 7.4 Auth routes (`routes/auth.ts`)

`createAuthRouter(db, { verifyIdToken })` — the Google verifier is injectable for tests.

| Route                   | Behavior |
| ----------------------- | -------- |
| `GET  /api/auth/session`| returns `{ user: req.user ?? null }` |
| `POST /api/auth/signup` | Zod-validated; argon2id hash; decision tree (below); `201 { user }` + cookie |
| `POST /api/auth/signin` | argon2 verify; `200 { user }` + cookie; opaque errors |
| `POST /api/auth/google` | verify Google ID token; link/insert; `200 { user }` + cookie |
| `POST /api/auth/signout`| `clearSessionCookie`; `204` no body |

**Password policy** (`passwordSchema`, Zod `.refine` chain, stable error codes):
`>=8` chars (`password_too_short`), an uppercase (`password_missing_uppercase`), a digit
(`password_missing_digit`), a symbol (`password_missing_symbol`). Validation uses
`safeParse` → `400 { error: 'invalid_input', issues }`; the frontend maps `issues[].message`
codes to localized copy.

**Hashing:** argon2id only — `argon2.hash(plain, { type: argon2.argon2id })` /
`argon2.verify(hash, plain)`. Responses never contain `password_hash`.

**Signup decision tree** (by email lookup):
1. Row exists with `password_hash` set → `409 { error: 'email_taken' }`.
2. Row exists with `password_hash IS NULL` (bootstrap-admin stub or Google-only user) →
   UPDATE hash + name, **keep** existing `id` and `role` (this is how the bootstrap admin
   becomes usable).
3. No row → INSERT `role='user'`. Unique-violation at insert is also caught → 409.

**Signin** returns `google_only_account` when `password_hash IS NULL`, and
`invalid_credentials` for both unknown email and wrong password (don't leak existence).

**Google** (`lib/google-verify.ts`): one `OAuth2Client(clientId)` at module load;
`verifyGoogleIdToken(idToken)` awaits `verifyIdToken({ idToken, audience: clientId })`,
returns `{ sub, email, name }`. The route's decision tree by email:
1. Row with matching `google_sub` → return it.
2. Row with different/NULL `google_sub` → UPDATE `google_sub`, keep id/role (auto-link).
3. No row → INSERT `password_hash=NULL, google_sub=sub, role='user'`; race-safe via
   unique-violation fallback to select-by-email.
Invalid token → `401 { error: 'invalid_google_token' }`. The audience MUST equal the
backend `GOOGLE_CLIENT_ID`, which must also be the frontend's `VITE_GOOGLE_CLIENT_ID`.

### 7.5 Role gate (`middleware/require-admin.ts`)
```ts
export function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'unauthenticated' })
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'forbidden' })
  next()
}
```
Mount once at the top of an admin router (`router.use(requireAdmin)`) to gate every route
on it. This is the only server-side admin gate; reuse it for any admin endpoint.

### 7.6 Shared `AuthUser` type (`packages/core/src/types/auth.ts`)
```ts
export interface AuthUser { id: string; name: string; email: string; role: 'user' | 'admin' }
```

---

## 8. Error Handling & API Conventions

### 8.1 Error handler (`middleware/error-handler.ts`, last middleware)
- `ZodError` → `400 { error: 'Validation Error', message, details: issues }`.
- `AppError` (custom class with `statusCode`) → that status `{ error: message }` (+ stack in dev).
- Anything else → log `{ err }` and `500 { error: 'Internal Server Error', message }`
  (message + stack only exposed in development).

### 8.2 Response conventions (used across feature routes)
- Validation failures: prefer `safeParse` in the handler → `400 { error: 'invalid_input', issues }`
  (don't throw to the error handler for expected validation).
- Error bodies are always `{ error: '<stable_code>' }`, optionally `+ issues`. Stable
  codes (`email_taken`, `rate_limited`, `not_found`, `forbidden`, …) are the contract the
  frontend maps to copy.
- Auth/permission codes: `unauthenticated` (401), `forbidden` (403), `csrf_missing` (403).
- Rate limiting (example, `lib/rate-limit.ts`): rolling-window count + retry-after in a
  **single SQL query** (`count(*)::int` + `ceil(extract(epoch from (min(created_at) + interval '24 hours' - now())))::int`),
  returning `429 { error: 'rate_limited' }` with a `Retry-After` header.
- snake_case request/response field names map field-by-field to camelCase columns at the
  insert/select boundary.
- IDs that are bigserial come back from Drizzle as `number` — serialize to `String(id)`
  on the wire when the API contract is a string.

---

## 9. Frontend (`apps/frontend`) — TanStack Start + React 19

### 9.1 Dependencies (grouped)
```jsonc
// Framework
"@tanstack/react-start": "^1.132.0",          // full-stack React framework (SSR + RPC)
"@tanstack/react-router": "^1.132.0",          // file-based routing
"@tanstack/react-router-ssr-query": "^1.131.7",
"@tanstack/react-query": "^5.66.5",            // server-state cache
"@tanstack/react-form": "^1.0.0",
"@tanstack/react-table": "^8.21.2",
"@tanstack/react-store": "^0.7.0",             // external store (useSyncExternalStore)
"react": "catalog:", "react-dom": "catalog:",  // 19.2
// Data / RPC
"@trpc/client" + "@trpc/server" + "@trpc/tanstack-react-query": "^11.4.3",  // optional tRPC
"superjson": "^2.2.2",                         // query (de)serialization
"zod": "catalog:",
// Auth
"@react-oauth/google": "^0.13.5",
// Styling
"tailwindcss": "^4.0.6", "@tailwindcss/vite": "^4.0.6",
"lucide-react", "highlight.js", "react-markdown", "rehype-*", "remark-gfm",
// AI (optional, present in this repo)
"@ai-sdk/anthropic", "@ai-sdk/react", "ai": "^5.0.8", "@modelcontextprotocol/sdk",
// build
"vite": "^7.1.7", "@vitejs/plugin-react", "vite-tsconfig-paths"
```

### 9.2 Scripts
```jsonc
{ "dev": "vite dev --host --port 5173", "build": "vite build",
  "start": "node .output/server/index.mjs", "serve": "vite preview",
  "test": "vitest run --passWithNoTests", "typecheck": "tsc --noEmit", "lint": "eslint ." }
```

### 9.3 Directory structure
```
src/
├── router.tsx                     # createRouter + SSR-query integration + Wrap provider
├── routeTree.gen.ts               # GENERATED by @tanstack/router-plugin (do not edit; ESLint-ignored)
├── routes/                        # file-based routes (TanStack Router)
│   ├── __root.tsx                 # html shell, head, global providers
│   ├── _public.tsx                # pathless layout for public pages
│   ├── _public.index.tsx          # "/"
│   ├── _public.<x>.$id.tsx        # dynamic segment, loader-based data
│   ├── admin.tsx                  # admin layout (gated in beforeLoad)
│   ├── admin.<x>.tsx              # admin pages
│   └── auth.tsx                   # sign-in/up forms
├── server/                        # createServerFn() server-only functions (RPC)
│   └── auth.ts                    # getCurrentUserFn — SSR cookie relay to backend
├── lib/
│   ├── api.ts                     # apiFetch() — THE fetch wrapper (CSRF, creds, ApiError)
│   ├── auth.tsx                   # AuthProvider + useAuth() (session via apiFetch)
│   ├── preferences.tsx            # theme/preferences provider + inline script
│   └── compare.ts                 # EXAMPLE external store (useSyncExternalStore)
├── integrations/tanstack-query/
│   ├── root-provider.tsx          # QueryClient factory + Provider (superjson (de)serialize)
│   └── devtools.tsx
├── components/                    # presentational + feature components
├── data/                          # types + (legacy) fixture data
├── env.ts / env.d.ts              # typed VITE_ env vars
├── styles.css                     # Tailwind 4 entry + design tokens
└── vite.config.ts
```

### 9.4 Vite config (`vite.config.ts`)
```ts
export default defineConfig({
  plugins: [
    viteTsConfigPaths({ projects: ['./tsconfig.json'] }),  // path aliases (@/*)
    tailwindcss(),                                          // Tailwind 4 vite plugin
    tanstackStart(),                                        // SSR + server fns + nitro
    viteReact(),                                            // includes React Compiler
  ],
})
```
⚠️ `tanstackStart()`'s nitro layer intercepts `/api` in dev, so a Vite `server.proxy`
block silently won't work — cross-origin dev calls go through `VITE_API_BASE_URL` instead.

### 9.5 Root + providers (`routes/__root.tsx`)
- `createRootRouteWithContext<{ queryClient }>()` defines the html `<head>` (meta, fonts,
  stylesheet) and `shellComponent`.
- Provider nesting (outermost → innermost): `PreferencesProvider` → `AuthProvider` →
  `GoogleOAuthProvider clientId={VITE_GOOGLE_CLIENT_ID}` → route children. TanStack
  devtools are mounted in the body.
- `router.tsx` wires `setupRouterSsrQueryIntegration` and wraps the tree in the
  Query `Provider`; `defaultPreload: 'intent'`; view-transition types per nav direction.

### 9.6 The fetch wrapper (`lib/api.ts`) — the backend contract on the client
`apiFetch<T>(input, init?)`:
- Always `credentials: 'include'` (sends the session cookie).
- Sets `X-Lapince-CSRF: 1` on non-GET/HEAD requests (matches backend CSRF guard).
- Serializes plain object/array bodies to JSON with `Content-Type: application/json`.
- Prefixes `/`-relative URLs with `VITE_API_BASE_URL` when set (cross-origin dev); absolute
  URLs pass through.
- On non-2xx throws `ApiError { status, code, issues }` (`code` = the response `error`
  field; `issues` = Zod issues). `204` / empty / non-JSON → `undefined`.
- **Rule: never call `fetch` directly in components/routes — always `apiFetch`.**

### 9.7 Auth on the client
- `lib/auth.tsx`: `AuthProvider` calls `apiFetch<{ user }>('/api/auth/session')` once on
  mount (with an `ignore`-flag cleanup to avoid race), exposes `{ user, status, signIn,
  signOut }`. `status` is `'loading' | 'ready'`. **No localStorage — the server cookie is
  the only source of truth.** Mirrors `user.role` to `<html data-signed-in="…">` so CSS can key off it.
- `signIn(user)` is a state-only helper for callers that already received an `AuthUser`
  (signup/signin/google); `signOut()` POSTs `/api/auth/signout` then clears state.
- `server/auth.ts`: `getCurrentUserFn` is a `createServerFn({ method: 'GET' })` that reads
  the inbound cookie via `getRequestHeader('cookie')` and relays it to the backend
  `GET /api/auth/session` — used for **SSR route gating** (the backend stays authoritative).

### 9.8 Route data loading & gating patterns
- **Loader routes** (`Route` with a `loader` + `Route.useLoaderData()`): SSR-friendly,
  used when the route needs server-rendered data + real 404s. 404 surface: in the loader
  `catch` an `ApiError 404` → `throw notFound()`; provide `notFoundComponent`.
- **`useQuery` routes**: list/filter pages that fetch on hydration; query keys encode
  filters; debounce expensive inputs and put the debounced value (not raw) in the key.
- **Protected layouts gate in `beforeLoad`, not the component:**
  ```ts
  beforeLoad: async ({ location }) => {
    const user = await getCurrentUserFn()
    if (user?.role !== 'admin') throw redirect({ to: '/auth', search: { redirect: location.href } })
    return { user }
  }
  ```
  No React hooks inside `beforeLoad` (runs on server SSR + client nav). `redirect()` throws
  and yields a 307 on the SSR pass so no protected HTML leaks.
- **Public mutating routes** (e.g. a submit form) stay reachable signed-out and guard auth
  at submit time, navigating to `/auth?redirect=…` if `useAuth().user` is null.
- `?redirect=` is parsed with the route's `validateSearch` (Zod) and read via
  `Route.useSearch()` — never `window.location.search`. A same-origin guard (`URL.origin`)
  prevents off-site redirects.

### 9.9 React conventions (enforced by ESLint + project rules)
- **React Compiler** is on (`eslint-plugin-react-compiler: 'error'`) — don't fight it with
  manual memoization where the compiler handles it.
- Effects are for synchronizing with external systems only. Derive state during render;
  use `useMemo` for expensive compute; put user-triggered logic in event handlers; reset
  state via `key`; subscribe to external stores via `useSyncExternalStore` (see
  `lib/compare.ts` for the persisted-store + `getServerSnapshot` pattern). Data fetching in
  effects needs an `ignore`-flag cleanup.

### 9.10 Frontend env (`env.d.ts` / `env.ts`)
- `VITE_API_BASE_URL` — backend base URL (cross-origin in dev; empty for same-origin prod).
- `VITE_GOOGLE_CLIENT_ID` — must match backend `GOOGLE_CLIENT_ID`.
- Add new `VITE_*` vars to the `ImportMetaEnv` interface in `env.d.ts` so they typecheck.

---

## 10. tRPC (optional, scaffolded)

The frontend ships `@trpc/client`, `@trpc/server`, and `@trpc/tanstack-react-query` (v11)
plus `superjson`. This is the seam for typed RPC if you outgrow the REST `apiFetch`
contract — the Query client is already configured with superjson (de)serialization in
`integrations/tanstack-query/root-provider.tsx`. (In this repo the live data path is REST
via `apiFetch`; tRPC is available but not the primary wiring.)

---

## 11. Containerization & Deployment

### 11.1 Services / ports
| Service  | Dev port | Prod port | Notes |
| -------- | -------- | --------- | ----- |
| frontend | 5173 (Vite) | 8080 → :80 (nginx) | nginx serves SPA + proxies `/api` → backend |
| backend  | 3000     | 3000      | Express; health `GET /health` |
| postgres | 5433 → 5432 | 5432   | `bitnami/postgresql:latest`, user/pass/db = postgres |

### 11.2 Compose files
- `compose.yml` (dev): shared `apps/Dockerfile.dev` image, `command` overrides
  (`pnpm run -C apps/<x> dev`), source mounted as volumes for hot reload, anonymous
  volumes shadow `node_modules`, `LOG_LEVEL=debug`, healthchecks via `nc`. YAML anchors
  (`x-defaults`, `&healthcheck`, `&logging`) keep services DRY.
- `compose.prod.yml`: per-app multi-stage Dockerfiles, no source mounts, `NODE_ENV=production`,
  `LOG_LEVEL=info`, `depends_on … condition: service_healthy`, healthchecks via `wget` on
  `/health` and `/`.

### 11.3 Dockerfiles
- **`apps/Dockerfile.dev`** (dev, shared): `node:26-alpine`, enable pnpm via corepack,
  copy all workspace `package.json`s, `pnpm install --frozen-lockfile`, expose 3000/5173.
  Command supplied by compose.
- **`apps/backend/Dockerfile`** (prod, multi-stage): builder installs full deps, builds
  `core` then backend (`tsc`); production stage does `pnpm install --prod`, copies
  `dist/` of backend + core, `NODE_ENV=production`, `CMD node apps/backend/dist/index.js`.
- **`apps/frontend/Dockerfile`** (prod, multi-stage): builder builds core + frontend
  (`vite build`); final stage is `nginx:1.27-alpine` serving `dist/` with an inline
  SPA-routing config (`try_files … /index.html`) and a `/api` reverse proxy to
  `http://backend:3000`.

### 11.4 Operational flow
```bash
nvm use && pnpm install                 # Node 26 + deps
cp apps/backend/.env.example apps/backend/.env    # fill secrets
pnpm bootstrap                          # start postgres + db:migrate + db:seed
pnpm dev                                # frontend + backend + core watcher (Nx parallel)
# or containerized:
pnpm start:dev      # dev compose (hot reload)
pnpm start:prod     # prod compose (optimized, nginx)
pnpm stop ; pnpm logs
```
The shipped `scripts/start.sh` / `deploy.sh` pull images, bring up postgres `--wait`, then
build/start backend + frontend. The migrate/seed lines are commented in those scripts
(run via `pnpm bootstrap` instead).

---

## 12. Testing Strategy (Vitest)

- Backend `vitest.config.ts` runs **serially in a single fork**; tests in
  `src/__tests__/*.test.ts`, helpers in `src/test/`.
- **HTTP tests:** `createApp()` + ephemeral listener on `127.0.0.1:0`, then native `fetch`.
  POST/PUT/PATCH/DELETE under `/api` must send `X-Lapince-CSRF: 1`.
- **DB tests — two patterns:**
  1. **BEGIN/ROLLBACK harness** (`useTransactionalDb()`): each test runs in a transaction
     rolled back after; the app gets `drizzle({ client })` wrapping that client so the
     session middleware sees in-flight inserts. Schema built by replaying `drizzle/*.sql`
     inside the transaction (`applyMigrations(client)` — migration-count-agnostic).
  2. **Dedicated-client pattern** for routes that call `database.transaction()` (a real
     `BEGIN/COMMIT` on a Client commits the harness's outer txn, so rollback no-ops):
     `DROP SCHEMA public CASCADE; CREATE SCHEMA public` + migrate in `beforeAll`, truncate
     + reseed in `beforeEach`, drop schema in `afterAll`.
- Tests run against a **separate `lapince_test` database** (dev DB name + `_test`), created
  once in `globalSetup`; `env-setup.ts` forces `NODE_ENV=test` and overrides `DATABASE_URL`.
  So you can keep the dev DB seeded and run tests simultaneously.
- **Prereqs:** postgres on `localhost:5433` + `apps/backend/.env` present.
- `core`'s pure functions are unit-tested from the backend, importing `'core'` against
  built `dist/` (build core first).
- Frontend `test` is `vitest run --passWithNoTests` (jsdom + Testing Library available).

---

## 13. Lint / Format / Quality Gates

- **Root flat ESLint** (`eslint.config.mjs`) covers all projects:
  - base: `@eslint/js` recommended + `typescript-eslint` recommended.
  - all files: `simple-import-sort` (imports/exports) `error`; `no-unused-vars` with
    `^_` ignore patterns.
  - frontend only: React recommended + `react-hooks` recommended +
    `react-compiler/react-compiler: 'error'`; `react-in-jsx-scope`/`prop-types` off.
  - backend `src/**` only: `no-console: 'error'`.
  - `prettier` config last to disable conflicting stylistic rules.
  - ignores `dist`, `routeTree.gen.ts`, `public`, etc.
- **Project coding rules** (from `CLAUDE.md`, worth carrying to new apps): no `any`/`unknown`;
  no single-char variable names; no inline comments (use JSDoc/docstrings); no nested
  ternaries beyond one level; guard clauses over nested conditionals; all imports at top of
  file (no inline/dynamic imports except genuine lazy-loading); surgical changes.
- Gates: `pnpm typecheck` · `pnpm lint` · `pnpm format:check` · `pnpm test` (all via Nx,
  cached).

---

## 14. Checklist — Scaffolding a New App on This Stack

1. **Workspace:** copy root configs — `pnpm-workspace.yaml` (with catalog), `nx.json`,
   `tsconfig.base.json`, `eslint.config.mjs`, `.prettierrc.json`, `.npmrc`, `.nvmrc`, root
   `package.json` scripts.
2. **`packages/core`:** create with the exports-map `package.json` + composite tsconfig;
   put `AuthUser` and your domain types/pure logic here. Build it.
3. **Backend:** copy `app.ts` (createApp factory), `config/`, `db/` (index + schema-check +
   schema dir + seed), `lib/` (session, google-verify, logger, http-logger), `middleware/`
   (session, csrf, require-admin, error-handler), `routes/` (index + auth), `types/express.d.ts`,
   `drizzle.config.ts`. Define your tables in `db/schema/`, generate + migrate.
4. **Auth:** keep the users table shape (uuid id, citext email unique, nullable
   password_hash + google_sub, role + CHECK), the cookie/session helpers, and the
   signup/signin/google decision trees verbatim. Set `SESSION_SECRET`, `GOOGLE_CLIENT_ID`,
   `ADMIN_BOOTSTRAP_EMAIL`.
5. **Frontend:** scaffold via TanStack Start; copy `lib/api.ts` (apiFetch), `lib/auth.tsx`,
   `server/auth.ts`, `integrations/tanstack-query/`, `router.tsx`, `__root.tsx` provider
   nesting, `vite.config.ts` plugin set, `env.d.ts`. Set `VITE_API_BASE_URL` +
   `VITE_GOOGLE_CLIENT_ID`.
6. **Containers:** copy the three Dockerfiles + both compose files; rename the compose
   `name:` and the session cookie `domain`/CSRF header if you want app-specific naming.
7. **Wire env:** backend `.env` from `.env.example` (DATABASE_URL, SESSION_SECRET ≥32,
   ADMIN_BOOTSTRAP_EMAIL, GOOGLE_CLIENT_ID, CORS_ORIGIN); frontend `.env` (VITE_*).
8. **Verify:** `pnpm bootstrap && pnpm dev`; hit `GET /health`, sign up, confirm the
   session cookie round-trips and `useAuth()` reports the user.

---

## 15. Appendix — Reference Env Files

**`apps/backend/.env.example`**
```ini
NODE_ENV=development
PORT=3000
HOST=0.0.0.0
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/lapince
SESSION_SECRET=changeme-generate-with-crypto-randomBytes-64
APP_DOMAIN=localhost
ADMIN_BOOTSTRAP_EMAIL=admin@example.com
GOOGLE_CLIENT_ID=
CORS_ORIGIN=http://localhost:5173
```

**`apps/frontend/.env.example`**
```ini
VITE_GOOGLE_CLIENT_ID=
# Backend base URL. Cross-origin in dev (CORS allows http://localhost:5173).
# Override at build time to point at the prod backend (e.g. https://api.example.com).
VITE_API_BASE_URL=http://localhost:3000
```

---

### Tech-stack one-liner
**Node 26 · pnpm 10.11 (workspaces + catalog) · Nx 21 · TypeScript 6 (strict) ·
Backend: Express 5 + Drizzle ORM + PostgreSQL + Zod + argon2 + Google OAuth + pino ·
Frontend: React 19.2 + Vite 7 + TanStack Start/Router/Query/Form/Table + Tailwind 4
(+ tRPC 11 scaffolded) · Auth: signed httpOnly cookie session, header-presence CSRF,
role gate · Docker Compose (dev hot-reload + prod nginx multi-stage).**
</content>
</invoke>
