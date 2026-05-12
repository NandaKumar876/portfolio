'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { ActivityEvent, ActivityKind } from '@/lib/github'

interface Props {
  initial: ActivityEvent[]
  /** Polling interval in ms. Defaults to 90s. */
  intervalMs?: number
}

const FILTERS: { id: ActivityKind | 'all'; label: string }[] = [
  { id: 'all',     label: 'All' },
  { id: 'push',    label: 'Pushes' },
  { id: 'pr',      label: 'Pull Requests' },
  { id: 'release', label: 'Releases' },
  { id: 'create',  label: 'Created' },
]

const KIND_GLYPH: Record<ActivityKind, string> = {
  push:    '↟',
  pr:      '⤳',
  issue:   '◍',
  release: '◆',
  star:    '★',
  fork:    '⑂',
  create:  '+',
  other:   '·',
}

/** A locale-stable absolute label like "10 May 2026, 17:34 UTC". Computed
    purely from the ISO string so server and client always agree. */
function isoLabel(iso: string): string {
  // Pull out yyyy-mm-dd and hh:mm from the ISO string itself — no Intl, no
  // timezone. Guaranteed identical on every runtime.
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/)
  if (!m) return iso
  const [, y, mo, d, h, mi] = m
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${parseInt(d, 10)} ${MONTHS[parseInt(mo, 10) - 1]} ${y}, ${h}:${mi} UTC`
}

/** Relative-from-now ("2m ago"). Only safe to call after mount because it
    reads Date.now(). */
function relative(iso: string): string {
  const then = new Date(iso).getTime()
  const diff = Math.floor((Date.now() - then) / 1000)
  if (diff < 60)        return 'just now'
  if (diff < 3600)      return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400)     return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604_800)   return `${Math.floor(diff / 86400)}d ago`
  if (diff < 2_592_000) return `${Math.floor(diff / 604_800)}w ago`
  return isoLabel(iso).slice(0, isoLabel(iso).indexOf(','))
}

export function RecentActivity({ initial, intervalMs = 90_000 }: Props) {
  const [events, setEvents]     = useState<ActivityEvent[]>(initial)
  const [filter,  setFilter]    = useState<ActivityKind | 'all'>('all')
  const [openId,  setOpenId]    = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  /* `lastUpdate` and `mounted` start in deterministic states so the server-
     rendered HTML matches the first client render exactly. After mount, the
     effect bumps `mounted` true and replaces server-rendered absolute
     timestamps with relative ones. */
  const [lastUpdate, setLastUpdate] = useState<number | null>(null)
  const [mounted, setMounted]   = useState(false)
  /* Force a re-render every ~30s so relative timestamps stay fresh. */
  const [, setTick]             = useState(0)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    setMounted(true)
    setLastUpdate(Date.now())
    return () => { mountedRef.current = false }
  }, [])

  /* Polling loop */
  useEffect(() => {
    async function refresh() {
      setRefreshing(true)
      try {
        const res = await fetch('/api/github/activity', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json() as { events: ActivityEvent[] }
        if (!mountedRef.current) return
        setEvents(data.events ?? [])
        setLastUpdate(Date.now())
      } catch {
        /* ignore */
      } finally {
        if (mountedRef.current) setRefreshing(false)
      }
    }
    const id = setInterval(refresh, intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])

  /* Tick clock so "2m ago" stays accurate */
  useEffect(() => {
    if (!mounted) return
    const id = setInterval(() => setTick(t => t + 1), 30_000)
    return () => clearInterval(id)
  }, [mounted])

  const filtered = useMemo(() => {
    if (filter === 'all') return events
    return events.filter(e => e.kind === filter)
  }, [events, filter])

  /* "Updated N ago" — only meaningful after we've mounted */
  const sinceUpdate = mounted && lastUpdate
    ? relative(new Date(lastUpdate).toISOString())
    : 'just now'

  function toggle(id: string) {
    setOpenId(cur => (cur === id ? null : id))
  }

  return (
    <div className="activity">

      <div className="activity-controls">
        <div className="activity-filters" role="tablist" aria-label="Filter activity by event type">
          {FILTERS.map(f => {
            const count = f.id === 'all'
              ? events.length
              : events.filter(e => e.kind === f.id).length
            const isActive = filter === f.id
            return (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setFilter(f.id)}
                className={`activity-filter ${isActive ? 'is-active' : ''} ${count === 0 ? 'is-empty' : ''}`}
              >
                <span className="activity-filter-label">{f.label}</span>
                <span className="activity-filter-count">{count}</span>
              </button>
            )
          })}
        </div>

        <div className="activity-status" aria-live="polite">
          <span className={`activity-status-dot ${refreshing ? 'is-pulsing' : ''}`} aria-hidden="true" />
          <span className="activity-status-text">
            {refreshing ? 'Refreshing…' : `Updated ${sinceUpdate}`}
          </span>
        </div>
      </div>

      <ol className="activity-list">
        {filtered.length === 0 && (
          <li className="activity-empty">
            <p>No <em>{FILTERS.find(f => f.id === filter)?.label.toLowerCase()}</em> events yet.</p>
          </li>
        )}

        {filtered.map(ev => {
          const isOpen   = openId === ev.id
          const isPush   = ev.kind === 'push' && (ev.commits?.length ?? 0) > 0

          return (
            <li
              key={ev.id}
              className={`activity-row ${isOpen ? 'is-open' : ''} activity-row--${ev.kind}`}
            >
              <button
                type="button"
                className="activity-row-head"
                onClick={() => (isPush ? toggle(ev.id) : window.open(ev.url, '_blank', 'noreferrer'))}
                aria-expanded={isPush ? isOpen : undefined}
              >
                <span className="activity-kind" aria-hidden="true">{KIND_GLYPH[ev.kind]}</span>
                <span className="activity-action">
                  <span className="activity-action-verb">{ev.action}</span>
                  {ev.detail && (
                    <>
                      <span className="activity-action-dim"> {isPush ? '' : ev.detail.startsWith('to ') ? '' : ''} </span>
                      <span className="activity-action-detail">{ev.detail.replace(/^to /, '')}</span>
                    </>
                  )}
                </span>
                <span className="activity-repo">{ev.repo}</span>
                <span className="activity-when" title={isoLabel(ev.createdAt)} suppressHydrationWarning>
                  {mounted ? relative(ev.createdAt) : isoLabel(ev.createdAt).split(',')[0]}
                </span>
                {isPush && (
                  <span className={`activity-chevron ${isOpen ? 'is-open' : ''}`} aria-hidden="true">›</span>
                )}
              </button>

              {isPush && isOpen && (
                <ul className="activity-commits">
                  {ev.commits!.slice(0, 6).map(c => (
                    <li key={c.sha} className="activity-commit">
                      <a href={c.url} target="_blank" rel="noreferrer" className="activity-commit-link">
                        <span className="activity-commit-sha">{c.sha.slice(0, 7)}</span>
                        <span className="activity-commit-msg">{c.message.split('\n')[0]}</span>
                      </a>
                    </li>
                  ))}
                  {(ev.commits?.length ?? 0) > 6 && (
                    <li className="activity-commit activity-commit--more">
                      <a href={ev.url} target="_blank" rel="noreferrer">
                        and {ev.commits!.length - 6} more &rarr;
                      </a>
                    </li>
                  )}
                </ul>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
