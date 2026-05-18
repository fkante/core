import { useEffect, useRef, useState } from 'react'

interface ViewTransition {
  ready: Promise<void>
  finished: Promise<void>
}

function applyTheme(isDark: boolean) {
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(isDark ? 'dark' : 'light')
  root.setAttribute('data-theme', isDark ? 'dark' : 'light')
  root.style.colorScheme = isDark ? 'dark' : 'light'
  localStorage.setItem('theme', isDark ? 'dark' : 'light')
}

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(
    () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark'),
  )
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    return () => observer.disconnect()
  }, [])

  function toggleTheme() {
    const button = buttonRef.current
    if (!button) return

    const newDark = !isDark
    const rect = button.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const maxRadius = Math.hypot(
      Math.max(centerX, window.innerWidth - centerX),
      Math.max(centerY, window.innerHeight - centerY),
    )

    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => ViewTransition
    }

    if (!doc.startViewTransition) {
      applyTheme(newDark)
      setIsDark(newDark)
      return
    }

    const transition = doc.startViewTransition(() => {
      applyTheme(newDark)
      setIsDark(newDark)
    })

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${centerX}px ${centerY}px)`,
            `circle(${maxRadius}px at ${centerX}px ${centerY}px)`,
          ],
        },
        {
          duration: 800,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          pseudoElement: '::view-transition-new(root)',
        },
      )
    })
  }

  const surface = isDark
    ? 'bg-zinc-900/90 ring-1 ring-white/10'
    : 'bg-white/90 ring-1 ring-black/10'
  const icon = isDark
    ? 'text-zinc-200 group-hover:text-amber-300'
    : 'text-zinc-700 group-hover:text-indigo-500'

  return (
    <button
      ref={buttonRef}
      onClick={toggleTheme}
      className={`group fixed top-4 right-4 z-50 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full shadow-lg backdrop-blur transition-colors ${surface}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        className={`relative transition-colors duration-300 ${icon}`}
      >
        <mask id="theme-toggle-mask">
          <rect width="100%" height="100%" fill="white" />
          <circle
            cx="16"
            cy="6"
            r="6.5"
            fill="black"
            className="theme-toggle-mask-circle"
            style={{
              transform: isDark ? 'translate(0, 0)' : 'translate(5px, -5px)',
            }}
          />
        </mask>

        <circle cx="12" cy="12" r="5" fill="currentColor" mask="url(#theme-toggle-mask)" />

        <g
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="theme-toggle-rays"
          style={{
            transformOrigin: '12px 12px',
            transform: isDark ? 'rotate(50deg) scale(0)' : 'rotate(0deg) scale(1)',
            opacity: isDark ? 0 : 1,
          }}
        >
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </g>
      </svg>
    </button>
  )
}
