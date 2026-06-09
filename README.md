# Full-Stack Boilerplate

A reusable foundation for new apps: **pnpm + Nx monorepo · TanStack Start (React 19.2) frontend · Express 5 backend · PostgreSQL + Drizzle ORM · cookie-session auth (email/password + Google OAuth)**. Clone it, rename, and ship.

For the exhaustive architecture reference and the new-app checklist, see **[STACK_BOILERPLATE.md](./STACK_BOILERPLATE.md)**.

## Structure

```
core/
├── apps/
│   ├── backend/      # Express 5 API: auth, Drizzle DB, pino, createApp factory + tests
│   └── frontend/     # TanStack Start (React 19.2, Vite 7): apiFetch, auth, SSR gating
├── packages/
│   └── core/         # Shared types (AuthUser, …) — ESM, composite project ref
├── scripts/          # Docker dev/deploy helpers
├── compose.yml       # Dev docker compose (hot reload)
├── compose.prod.yml  # Prod docker compose (nginx + multi-stage builds)
├── nx.json           # Nx pipelines + cache
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

## Prerequisites

- **Node.js >= 26** (managed via `.nvmrc`)
- **pnpm >= 10.11**
- Docker & Docker Compose (for Postgres + the containerized workflows)

## First run

```bash
nvm use                                          # Node 26
pnpm install
cp apps/backend/.env.example apps/backend/.env   # fill SESSION_SECRET, GOOGLE_CLIENT_ID, …
cp apps/frontend/.env.example apps/frontend/.env # VITE_GOOGLE_CLIENT_ID, VITE_API_BASE_URL
pnpm --filter core build                         # build shared types first
pnpm bootstrap                                   # start Postgres + db:migrate + db:seed
pnpm dev                                         # frontend + backend + core watcher
```

Then open http://localhost:5173, create an account, and visit `/notes` (the example feature). The bootstrap admin (`ADMIN_BOOTSTRAP_EMAIL`) becomes a real admin account on first sign-in and can reach `/admin`.

## Running locally

```bash
pnpm dev                   # everything in parallel (Nx)
pnpm dev:frontend          # vite dev on :5173
pnpm dev:backend           # node --watch with native --env-file-if-exists
pnpm dev:core              # tsc -w (watch + emit declarations)
```

## Database

```bash
pnpm --filter backend db:generate   # schema change → SQL migration
pnpm --filter backend db:migrate    # apply migrations
pnpm --filter backend db:seed       # bootstrap admin + example notes (idempotent)
pnpm bootstrap                       # up Postgres + migrate + seed
pnpm db:reset                        # drop schema + migrate + seed
```

Schema lives in `apps/backend/src/db/schema/` (one file per table). After editing types in `packages/core`, rebuild it (`pnpm --filter core build`) so consumers see the change.

## Quality gates

```bash
pnpm typecheck             # nx run-many -t typecheck (cached)
pnpm lint                  # eslint . (flat config at root)
pnpm format:check
pnpm test                  # nx run-many -t test (backend Vitest against the app_test DB)
pnpm graph                 # visualize project dependencies
```

Backend tests need Postgres running (`pnpm bootstrap` or `docker compose -f compose.yml up -d postgres`) and `apps/backend/.env` present; they run against a separate `app_test` database so the dev DB stays seeded.

## Running with Docker

```bash
pnpm start:dev             # dev compose with hot-reload
pnpm start:prod            # prod compose with optimized builds
pnpm stop                  # tear both stacks down
pnpm logs                  # follow logs
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment details.

## Services

| Service  | Port | Description                                               |
| -------- | ---- | --------------------------------------------------------- |
| frontend | 5173 | TanStack Start dev server (prod served on 8080 via nginx) |
| backend  | 3000 | Express 5 API. Health: `GET /health`                      |
| postgres | 5433 | `postgres / postgres` user/password, db `app` (5433→5432) |

## Making it your own

The boilerplate is app-agnostic. To rebrand, replace the neutral names:

- Session cookie `app_session` → `apps/backend/src/lib/session.ts`
- CSRF header `X-App-CSRF` → `apps/backend/src/middleware/csrf.ts` + `apps/frontend/src/lib/api.ts`
- Database `app` → `compose.yml`, `compose.prod.yml`, `.env`, `db:reset` script

Then delete the example `notes` feature (schema, router, seed, routes, tests on both sides) and build your own following the same pattern.

## Tech stack

- **Runtime:** Node.js 26 · **pnpm 10.11** (workspaces + catalog) · **Nx 21** · **TypeScript 6** (strict)
- **Backend:** Express 5 · Drizzle ORM · PostgreSQL (`pg` Pool) · Zod 4 · argon2 · Google OAuth · pino · Vitest
- **Frontend:** React 19.2 · Vite 7 · TanStack Start/Router/Query/Form/Table/Store · Tailwind 4 · tRPC 11 (scaffolded)
- **Auth:** signed httpOnly cookie session · header-presence CSRF · role gate — no client token storage
- **Shared:** `packages/core` published as ESM with `exports` map + project references
- **Lint/format:** ESLint 9 flat config (React Compiler + react-hooks + simple-import-sort), Prettier 3
