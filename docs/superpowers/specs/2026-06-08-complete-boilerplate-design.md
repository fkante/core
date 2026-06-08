# Complete the Reusable Full-Stack Boilerplate — Design

**Date:** 2026-06-08
**Status:** Approved (design), in implementation
**Branch:** `feat/complete-boilerplate`

## Problem

This repo (`@monorepo/root`, dir `core`) is meant to be a reusable boilerplate for
spinning up new full-stack apps. Today it is a half-finished scaffold:

- **Backend** — bare Express singleton in `index.ts` (uses `morgan`); no `app.ts`
  factory, no `db/`, no `lib/`, no auth, no schema, no migrations, no tests. Config
  lacks `DATABASE_URL`/`SESSION_SECRET`/`GOOGLE_CLIENT_ID`/`ADMIN_BOOTSTRAP_EMAIL`.
- **Frontend** — raw "Create TanStack App" output: guitars, tanchat, form/table/store
  and tRPC **demo** routes/components; carries AI SDK + markdown + faker deps used only
  by demos. No `apiFetch`, no `AuthProvider`, no SSR auth gating.
- **`packages/core`** — only a placeholder `hello.ts`. No shared types.

The complete, **already-tested** reference implementation lives in
[`fkante/lapince@main`](https://github.com/fkante/lapince) (a cycling-components
catalog, "LaPince"). `STACK_BOILERPLATE.md` (added to this repo) is the app-agnostic
extraction of that stack.

## Goal

Transform this scaffold into the clean, batteries-included boilerplate the doc
describes: cookie-session auth (email/password + Google OAuth), CSRF, role gate,
PostgreSQL + Drizzle DB layer, pino logging, the `createApp` factory + test harness,
and the full frontend auth wiring — **minus the LaPince domain and the current demo
cruft** — plus one generic example feature and the doc itself. "Ready to go" =
`install` + `typecheck` + `lint` + `build` + `test` green, and a working
`bootstrap` + `dev` signup/signin + example-feature round-trip.

## Approach

**Port-and-strip from `lapince@main`, then genericize.** Pull the exact tested files,
delete LaPince domain + current demo cruft, rename LaPince identifiers to neutral
ones, regenerate migrations for just the skeleton tables, add one example feature.
(Rejected: reconstruct-from-doc — lossy, loses the passing test suite; port-infra-
rewrite-auth — needless risk on the most battle-tested code.)

## Decisions (locked)

- **App-agnostic naming.** cookie `app_session`, CSRF header `X-App-CSRF`, DB
  `app` / test DB `app_test`. Centralized so a new app renames in one pass.
- **One example feature: `notes`** — a generic protected resource, clearly marked
  removable, demonstrating the end-to-end add-a-feature pattern.
- **Keep tRPC scaffolded** (doc §10) as a minimal clean scaffold; **drop AI SDK**
  (`@ai-sdk/*`, `ai`, `@modelcontextprotocol/sdk`), markdown/highlight demo deps, faker.
- **`STACK_BOILERPLATE.md` at repo root** (blueprint framing).
- **Verification bar:** static gates + attempt live `bootstrap`/`dev`; report honestly
  if Docker/Postgres is unavailable in this environment.

## Plan

### A. `packages/core`
- Replace `src/hello.ts` with `src/types/{auth,notes,index}.ts` + `src/index.ts` barrel.
- `AuthUser { id, name, email, role: 'user'|'admin' }`; `Note` type for the example.
- Drop cycling `reliability.ts`.

### B. Backend — port (genericized) from lapince
- `app.ts` (`createApp(options)` factory), `index.ts` bootstrap (connect → schema
  guard → listen → graceful shutdown), `config/index.ts` (+ `DATABASE_URL` required,
  `SESSION_SECRET`, `APP_DOMAIN`, `ADMIN_BOOTSTRAP_EMAIL`, `GOOGLE_CLIENT_ID`).
- `db/{index,schema-check,seed}.ts`; `db/schema/{users,notes,index}.ts`.
- `lib/{session,google-verify,logger,http-logger,rate-limit,pii-scrub}.ts`.
- `middleware/{session,csrf,require-admin,error-handler}.ts`.
- `routes/{index,auth,notes}.ts`; `types/express.d.ts`.
- `drizzle.config.ts`, `tsconfig.json`, `tsconfig.test.json`, `vitest.config.ts`,
  `test/` harness (`db,env-setup,global-setup,migrate,test-db-url`).
- Tests: port generic (`app, auth-flows, auth-google, auth-session, db-harness,
  schema-check, seed, users-schema, pii-scrub`) + new `notes.test.ts`.
- **Strip:** schema `{brands,categories,components,component_*,reliability_reports,
  report_moderation_events,scrape_*}`, `seed-catalog.ts`, `fixtures/`,
  `routes/{components,reports,admin-reports}.ts`, their tests.
- **Deps:** add `argon2, cookie-parser, drizzle-orm, google-auth-library, pg, pino,
  pino-http, pino-pretty, uuid, drizzle-kit` (+ `@types/*`); remove `morgan`.
- **Scripts:** add `test, test:watch, db:generate, db:migrate, db:seed`; typecheck
  also runs `tsconfig.test.json`.

### C. Migrations
- Regenerate `0000_init.sql` from `users` + `notes` via `drizzle-kit generate`;
  manually prepend `CREATE EXTENSION IF NOT EXISTS "citext"` (doc §6.3).

### D. Frontend
- **Delete:** `routes/demo/`, `routes/example.guitars/`, `components/demo.*`,
  `components/example-*`, `data/demo*`, `data/example-guitars`, `hooks/demo.*`,
  `lib/demo-store*`, demo guitar images.
- **Port (genericized):** `lib/{api,auth,preferences}.tsx`, `server/auth.ts`,
  `integrations/tanstack-query/*`, `router.tsx` (keeps view-transitions),
  `routes/__root.tsx` (Preferences→Auth→GoogleOAuth), `routes/{_public,_public.index,
  auth,admin,admin.index}.tsx`, example `routes` for notes, `env.{ts,d.ts}`, `styles.css`.
- **Reconcile theme:** adapt existing `ThemeToggle.tsx` to lapince's SSR-safe
  `preferences.tsx` (no-flash) — preserve commits #7–8 (light/dark + view transitions).
- **tRPC:** minimal clean scaffold (`integrations/trpc` + `api.trpc.$` catch-all,
  trivial `hello` procedure).
- **Deps:** add `@react-oauth/google`; remove `@ai-sdk/*`, `ai`,
  `@modelcontextprotocol/sdk`, `highlight.js`, `react-markdown`, `rehype-*`,
  `remark-gfm`, `@faker-js/faker`.
- Add `apps/frontend/.env.example` (`VITE_GOOGLE_CLIENT_ID`, `VITE_API_BASE_URL`).

### E. Root / infra
- Root `package.json`: add `bootstrap` + `db:reset` (DB `app`).
- `eslint.config.mjs`: add backend `src/**` → `no-console: 'error'`; drop the unused
  `demo.*` override block.
- Backend `.env.example`: add `SESSION_SECRET`, `APP_DOMAIN`, `ADMIN_BOOTSTRAP_EMAIL`,
  `GOOGLE_CLIENT_ID`; DB name `app`.
- Genericize `compose.yml`, `compose.prod.yml`, `scripts/{start,deploy}.sh` (service
  names, DB name, cookie domain).
- Place `STACK_BOILERPLATE.md` at repo root.
- Update `README.md` to describe the boilerplate + quickstart.

### F. Verify
`pnpm install` → `pnpm --filter core build` → `pnpm typecheck` → `pnpm lint` →
`pnpm build` → `pnpm test` → attempt `pnpm bootstrap && pnpm dev`, exercise
signup/signin + notes. Adversarial audit (parallel) for residual domain refs, broken
imports, doc §14 coverage, dep consistency. Report blocked steps honestly.

## Out of scope

LaPince domain (catalog/reports/sources/reliability), AI features, production secrets,
CI pipeline changes.

## Success criteria

1. All static gates green; backend test suite passes against `app_test`.
2. `STACK_BOILERPLATE.md` §14 checklist is fully satisfied by the repo contents.
3. No `lapince`/domain identifiers remain except inside `STACK_BOILERPLATE.md`.
4. Fresh clone → `bootstrap` + `dev` → signup/signin + create-a-note works.
