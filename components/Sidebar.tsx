'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { Route } from 'next'
import { ThemeToggle } from './ThemeToggle'

interface SidebarProfile {
  role: string
  location: string
  githubUrl: string
  linkedinUrl: string
  xUrl: string
  githubUsername: string
}

const LINKS: { href: Route; label: string; index: string }[] = [
  { href: '/',         label: 'Home',     index: '01' },
  { href: '/work',     label: 'Work',     index: '02' },
  { href: '/about',    label: 'About',    index: '03' },
  { href: '/services', label: 'Services', index: '04' },
  { href: '/contact',  label: 'Contact',  index: '05' },
]

export function Sidebar({ profile }: { profile: SidebarProfile }) {
  const path = usePathname()
  const [isMac, setIsMac] = useState(false)

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      setIsMac(/Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent || ''))
    }
  }, [])

  function openPalette() {
    window.dispatchEvent(new CustomEvent('cmdk:open'))
  }

  const cleanLocation = profile.location.replace(/[\u{1F1E6}-\u{1F1FF}]{2}/gu, '').trim()
  const linkedinHandle = safePath(profile.linkedinUrl)
  const xHandle = safePath(profile.xUrl)

  return (
    <aside className="sidebar" aria-label="Site identity and navigation">
      <div className="sidebar-inner">

        {/* ── Identity ── */}
        <div className="sidebar-identity">
          <Link href="/" className="sidebar-name" aria-label="Thamothara Natarajan — home">
            <span className="sidebar-name-first">Thamothara</span>
            <span className="sidebar-name-last">Natarajan</span>
          </Link>
          <p className="sidebar-role">{profile.role}</p>
          <p className="sidebar-meta">
            <span>{cleanLocation}</span>
          </p>
          <p className="sidebar-status">
            <span className="status-dot" aria-hidden="true" />
            open to work
          </p>
        </div>

        {/* ── Vertical nav ── */}
        <nav className="sidebar-nav" aria-label="Primary">
          {LINKS.map(({ href, label, index }) => {
            const active = path === href
            return (
              <Link
                key={href}
                href={href}
                className={`sidebar-link${active ? ' sidebar-link--active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                <span className="sidebar-link-index">{index}</span>
                <span className="sidebar-link-label">{label}</span>
              </Link>
            )
          })}
        </nav>

        {/* ── Socials ── */}
        <div className="sidebar-socials">
          <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="sidebar-social">
            <span className="sidebar-social-key">GH</span>
            <span className="sidebar-social-val">{profile.githubUsername}</span>
          </a>
          <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="sidebar-social">
            <span className="sidebar-social-key">IN</span>
            <span className="sidebar-social-val">{linkedinHandle}</span>
          </a>
          <a href={profile.xUrl} target="_blank" rel="noreferrer" className="sidebar-social">
            <span className="sidebar-social-key">X</span>
            <span className="sidebar-social-val">@{xHandle}</span>
          </a>
        </div>

        {/* ── Footer: theme + command palette ── */}
        <div className="sidebar-foot">
          <ThemeToggle />
          <button
            type="button"
            className="sidebar-cmdk"
            onClick={openPalette}
            aria-label="Open command palette"
            title="Search (⌘K)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" />
            </svg>
            <span className="sidebar-cmdk-kbd">{isMac ? '⌘' : 'Ctrl'} K</span>
          </button>
        </div>
      </div>
    </aside>
  )
}

/** Last non-empty path segment of a URL, or '' if it can't be parsed. */
function safePath(url: string): string {
  try {
    const parts = new URL(url).pathname.replace(/^\/+|\/+$/g, '').split('/')
    return parts[parts.length - 1] ?? ''
  } catch {
    return ''
  }
}
