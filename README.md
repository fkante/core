# Monorepo

A modern TypeScript monorepo: TanStack Start full-stack frontend, a dedicated Node/Express backend, and a shared `core` package. Managed with **pnpm workspaces + catalog** and **Nx** for task orchestration and caching.

## Structure

```
core/
├── apps/
│   ├── backend/      # Express 5 API server (heavy tasks, crons)
│   └── frontend/     # TanStack Start (React 19.2, Vite 7, tRPC)
├── packages/
│   └── core/         # Shared utilities and types (ESM, composite)
├── scripts/          # Docker dev/deploy helpers
├── compose.yml       # Dev docker compose
├── compose.prod.yml  # Prod docker compose
├── nx.json           # Nx pipelines + cache
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

## Prerequisites

- **Node.js >= 26** (managed via `.nvmrc`)
- **pnpm >= 10.11**
- Docker & Docker Compose (only needed for the containerized workflows)

```bash
nvm use            # picks up .nvmrc → Node 26
pnpm install
```

## Running locally

The root `package.json` exposes scripts that fan out across the workspace.

```bash
# Run everything in parallel (frontend + backend + core watcher)
pnpm dev

# Or run one at a time
pnpm dev:frontend          # vite dev on :5173
pnpm dev:backend           # node --watch with native --env-file-if-exists
pnpm dev:core              # tsc -w (watch + emit declarations)

# Production builds + start
pnpm build                 # nx run-many -t build (cached)
pnpm build:frontend
pnpm build:backend
pnpm start:frontend        # node .output/server/index.mjs
pnpm start:backend         # node --env-file-if-exists=.env dist/index.js
```

Backend env validation lives in `apps/backend/src/config/index.ts` (Zod 4 via `@t3-oss/env-core`). Copy `apps/backend/.env.example` → `apps/backend/.env` before running.

## Quality gates

```bash
pnpm typecheck             # nx run-many -t typecheck
pnpm lint                  # eslint . (flat config at root)
pnpm lint:fix
pnpm format                # prettier --write .
pnpm format:check
pnpm test                  # nx run-many -t test
pnpm graph                 # nx graph (visualize project dependencies)
```

Nx caches `build`, `test`, `lint`, and `typecheck`. A repeat invocation with no changes returns from cache (verify with `pnpm build` run twice).

## Running with Docker

```bash
pnpm start:dev             # development compose with hot-reload
pnpm start:prod            # production compose with optimized builds
pnpm stop                  # tear both stacks down
pnpm logs                  # follow logs
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment details.

## Services

| Service  | Port | Description                                               |
| -------- | ---- | --------------------------------------------------------- |
| frontend | 5173 | TanStack Start dev server (prod served on 8080 via nginx) |
| backend  | 3000 | Express 5 API. Health: `GET /health`                      |
| postgres | 5432 | `postgres / postgres / postgres` (db/user/password)       |

## Tech stack

- **Runtime:** Node.js 26
- **Package manager:** pnpm 10.11 with **catalog** for version dedup (`pnpm-workspace.yaml`)
- **Build orchestration:** Nx 21 (`nx.json`)
- **Language:** TypeScript 6 (strict + `noUncheckedIndexedAccess` + `verbatimModuleSyntax`)
- **Backend:** Express 5, Zod 4, native `--env-file-if-exists`, `@t3-oss/env-core`
- **Frontend:** React 19.2, Vite 7, TanStack Start/Router/Query/Form/Table, tRPC 11, Tailwind 4, AI SDK 5
- **Shared:** `packages/core` published as ESM with `exports` map and project references
- **Lint/format:** ESLint 9 flat config (React Compiler + react-hooks + simple-import-sort), Prettier 3
