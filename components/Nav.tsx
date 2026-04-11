'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Route } from 'next'

const LINKS: { href: Route; label: string }[] = [
  { href: '/', label: 'Home' },
  { href: '/work', label: 'Work' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export function Nav() {
  const path = usePathname()

  return (
    <nav className="nav">
      {LINKS.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={`nav-link${path === href ? ' nav-link--active' : ''}`}
        >
          {label}
        </Link>
      ))}
    </nav>
  )
}
