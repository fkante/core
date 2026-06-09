import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { getCurrentUserFn } from '../server/auth'

/**
 * Admin layout route. `beforeLoad` runs the SSR session relay and redirects any
 * non-admin to `/auth`, so child admin pages render only for admins. Reuse this
 * gate for any admin-only section.
 */
export const Route = createFileRoute('/admin')({
  component: AdminLayout,
  beforeLoad: async ({ location }) => {
    const user = await getCurrentUserFn()
    if (!user) {
      throw redirect({ to: '/auth', search: { redirect: location.href } })
    }
    if (user.role !== 'admin') {
      throw redirect({ to: '/' })
    }
    return { user }
  },
})

function AdminLayout() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Outlet />
    </main>
  )
}
