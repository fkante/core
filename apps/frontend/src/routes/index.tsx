import { createFileRoute, Link } from '@tanstack/react-router'
import { Database, KeyRound, Layers, ShieldCheck, StickyNote, TestTube } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: Landing,
})

const features = [
  {
    icon: KeyRound,
    title: 'Cookie-session auth',
    description:
      'Email/password + Google OAuth, signed httpOnly session cookie, header-presence CSRF, and a role gate — the backend is the source of truth.',
  },
  {
    icon: Database,
    title: 'PostgreSQL + Drizzle',
    description:
      'Typed schema, generated migrations, an idempotent seed with a bootstrap admin, and a boot-time schema guard.',
  },
  {
    icon: Layers,
    title: 'pnpm + Nx monorepo',
    description:
      'TanStack Start frontend, Express 5 backend, and a shared `core` package — cached build/test/lint/typecheck across projects.',
  },
  {
    icon: ShieldCheck,
    title: 'Testable app factory',
    description:
      'The backend `createApp(options)` factory injects a transactional DB so tests run against the exact app, rolled back per test.',
  },
  {
    icon: TestTube,
    title: 'Batteries included',
    description:
      'apiFetch wrapper, SSR auth gating, React Query + superjson, view transitions, light/dark theme, and Vitest wired end to end.',
  },
  {
    icon: StickyNote,
    title: 'Example feature',
    description:
      'A removable `notes` slice shows the full add-a-feature pattern: schema → router → SSR-gated page. Delete it to start clean.',
  },
]

function Landing() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <section className="text-center">
        <h1 className="text-balance text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl dark:text-white">
          Full-Stack Boilerplate
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
          A reusable foundation for new apps: TanStack Start · Express 5 · PostgreSQL + Drizzle ·
          cookie-session auth. Clone it, rename, and ship.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            to="/auth"
            className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Sign in
          </Link>
          <Link
            to="/notes"
            className="rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            See the example feature
          </Link>
        </div>
      </section>

      <section className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-xl border border-zinc-200 bg-white p-5 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
          >
            <feature.icon className="h-7 w-7 text-zinc-900 dark:text-white" />
            <h3 className="mt-3 font-semibold text-zinc-900 dark:text-white">{feature.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {feature.description}
            </p>
          </div>
        ))}
      </section>

      <p className="mt-12 text-center text-sm text-zinc-500 dark:text-zinc-500">
        Read{' '}
        <code className="rounded bg-zinc-100 px-1.5 py-0.5 dark:bg-zinc-800">
          STACK_BOILERPLATE.md
        </code>{' '}
        for the full architecture and the new-app checklist.
      </p>
    </main>
  )
}
