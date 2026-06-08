# Frontend

TanStack Start (React 19.2 + Vite 7) frontend for the boilerplate. SSR with file-based routing, cookie-session auth via the backend, REST through `apiFetch` (with an optional tRPC scaffold), Tailwind 4, and a light/dark theme with view transitions.

## Scripts

```bash
pnpm dev          # vite dev on http://localhost:5173
pnpm build        # vite build (emits .output via the nitro plugin)
pnpm start        # node .output/server/index.mjs (production SSR server)
pnpm test         # vitest (jsdom + Testing Library)
pnpm typecheck    # tsc --noEmit
pnpm lint         # eslint
```

## Environment

Copy `.env.example` → `.env`:

- `VITE_API_BASE_URL` — backend base URL (cross-origin in dev; CORS allows `http://localhost:5173`).
- `VITE_GOOGLE_CLIENT_ID` — optional; enables the Google sign-in button when set (must match the backend `GOOGLE_CLIENT_ID`).

`VITE_*` values are read via `import.meta.env` (typed in `src/env.d.ts`) and baked into the client bundle at build time.

## Structure

```
src/
├── router.tsx                 # createRouter + SSR-query integration + view transitions
├── routes/                    # file-based routes
│   ├── __root.tsx             # html shell, providers (Auth, optional GoogleOAuth), theme
│   ├── index.tsx              # landing page
│   ├── auth.tsx               # sign in / sign up (email + Google)
│   ├── notes.tsx              # EXAMPLE protected feature (SSR-gated)
│   ├── admin.tsx              # role-gated admin layout
│   └── api.trpc.$.tsx         # tRPC fetch handler (optional)
├── server/auth.ts             # getCurrentUserFn — SSR cookie relay for route gating
├── lib/
│   ├── api.ts                 # apiFetch — the backend HTTP client (CSRF, creds, ApiError)
│   └── auth.tsx               # AuthProvider + useAuth (session via apiFetch)
├── integrations/              # tanstack-query (superjson) + trpc scaffolds
├── components/                # Header, ThemeToggle
├── env.d.ts                   # typed import.meta.env
└── styles.css                 # Tailwind 4 entry + view-transition keyframes
```

The `notes` route is an example feature — delete it (and the matching backend slice) when starting a real app. tRPC is scaffolded but optional; the primary data path is REST via `apiFetch`. See the root `STACK_BOILERPLATE.md` for the full architecture.
