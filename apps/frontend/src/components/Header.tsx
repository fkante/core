import { Link, useNavigate } from '@tanstack/react-router'
import { Home, LogIn, LogOut, Shield, StickyNote } from 'lucide-react'

import { useAuth } from '../lib/auth'

const linkClass =
  'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white'
const activeClass = 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white'

export default function Header() {
  const { user, status, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate({ to: '/' })
  }

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-2">
        <div className="flex items-center gap-1">
          <Link
            to="/"
            className={linkClass}
            activeProps={{ className: `${linkClass} ${activeClass}` }}
          >
            <Home size={16} />
            <span>Home</span>
          </Link>
          <Link
            to="/notes"
            className={linkClass}
            activeProps={{ className: `${linkClass} ${activeClass}` }}
          >
            <StickyNote size={16} />
            <span>Notes</span>
          </Link>
          {user?.role === 'admin' ? (
            <Link
              to="/admin"
              className={linkClass}
              activeProps={{ className: `${linkClass} ${activeClass}` }}
            >
              <Shield size={16} />
              <span>Admin</span>
            </Link>
          ) : null}
        </div>

        <div className="flex items-center gap-2 pr-12">
          {status === 'loading' ? null : user ? (
            <>
              <span className="hidden text-sm text-zinc-500 sm:inline dark:text-zinc-400">
                {user.name}
              </span>
              <button onClick={handleSignOut} className={linkClass}>
                <LogOut size={16} />
                <span>Sign out</span>
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className={linkClass}
              activeProps={{ className: `${linkClass} ${activeClass}` }}
            >
              <LogIn size={16} />
              <span>Sign in</span>
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}
