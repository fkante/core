# Backend

Express 5 API server with TypeScript: cookie-session auth (email/password + Google OAuth), PostgreSQL + Drizzle ORM, structured logging, and a testable `createApp` factory.

## Features

- 🚀 Express 5 with TypeScript (ESM, NodeNext)
- 🔒 Security headers (Helmet), header-presence CSRF, role gate
- 🔑 Cookie-session auth: argon2id passwords + Google ID-token verification
- 🗄️ PostgreSQL + Drizzle ORM (typed schema, generated migrations, idempotent seed)
- ✅ Env + input validation with Zod (`@t3-oss/env-core`)
- 📝 Structured request logging with pino (pino-http)
- 🧪 Vitest with a transactional DB harness
- 🐳 Docker support

## Prerequisites

- Node.js >= 26
- pnpm >= 10.11
- PostgreSQL (via `docker compose -f compose.yml up -d postgres` from the repo root)

## Getting started

```bash
pnpm install
cp .env.example .env            # fill SESSION_SECRET, GOOGLE_CLIENT_ID, …
pnpm db:migrate && pnpm db:seed # or `pnpm bootstrap` from the repo root
pnpm dev                        # http://localhost:3000
```

## Scripts

- `pnpm dev` — watch mode (native `--watch` + tsx)
- `pnpm build` / `pnpm start` — compile with tsc / run `dist/index.js`
- `pnpm test` — Vitest (needs Postgres; runs against the `app_test` DB)
- `pnpm db:generate` / `db:migrate` / `db:seed` — drizzle-kit + seed
- `pnpm lint` / `pnpm format`

## API endpoints

- `GET /health` — health status
- `GET /api/auth/session` · `POST /api/auth/{signup,signin,google,signout}` — auth
- `GET|POST /api/notes` — EXAMPLE protected feature (delete when starting a real app)

## Project structure

```
src/
├── app.ts            # createApp(options) factory (testable; injectable DB)
├── index.ts          # bootstrap: connect → verify schema → listen → graceful shutdown
├── config/           # Zod-validated env → typed config
├── db/               # pg Pool + drizzle, schema/, seed, schema-check
├── lib/              # session, google-verify, logger, http-logger, rate-limit, pii-scrub
├── middleware/       # session, csrf, require-admin, error-handler
├── routes/           # createApiRouter → auth, notes
├── test/             # Vitest harness (transactional DB)
└── types/express.d.ts
```

See the root `STACK_BOILERPLATE.md` for the full architecture and conventions.
