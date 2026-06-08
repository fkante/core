import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/')({
  component: AdminHome,
})

function AdminHome() {
  return (
    <>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Admin</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        This page is only reachable by users with the <code>admin</code> role. The bootstrap admin
        (from <code>ADMIN_BOOTSTRAP_EMAIL</code>) becomes a real account on first sign-in.
      </p>
      <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
        Add admin-only pages as children of <code>routes/admin.tsx</code> — they inherit the role
        gate from its <code>beforeLoad</code>.
      </p>
    </>
  )
}
