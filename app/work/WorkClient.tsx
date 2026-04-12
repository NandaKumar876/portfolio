'use client'

import { useState }    from 'react'
import Link            from 'next/link'
import { LiquidGlass } from '@/components/LiquidGlass'
import type { AdminProject } from '@/lib/projects'

const TAGS = ['All', 'React', 'Node', 'AI', 'Design']

export function WorkClient({ projects }: { projects: AdminProject[] }) {
  const [tag, setTag] = useState('All')
  const list = tag === 'All' ? projects : projects.filter(p => p.tags.includes(tag))

  return (
    <>
      {/* Filter bar */}
      <div className="filter-bar">
        {TAGS.map(t => (
          <button
            key={t}
            onClick={() => setTag(t)}
            className={`filter-btn${tag === t ? ' filter-btn--active' : ''}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="projects-grid">
        {list.length === 0 && (
          <p className="admin-empty" style={{ gridColumn: '1/-1', padding: '40px 0' }}>
            No projects in this category yet.
          </p>
        )}
        {list.map((p, i) => (
          <Link key={p.id} href={`/work/${p.slug}`} style={{ textDecoration: 'none' }}>
            <LiquidGlass
              className="project-card fade-in"
              style={{ animationDelay: `${i * 0.06}s` } as React.CSSProperties}
              interactive
            >
              <div className="project-index">{p.index}&nbsp;·&nbsp;{p.year}</div>
              <h3 className="project-title">{p.title}</h3>
              <p className="project-desc">{p.description}</p>
              <div className="project-tags">
                {p.tags.map(t => <span key={t} className="project-tag">{t}</span>)}
              </div>
              {(p.repoUrl || p.liveUrl) && (
                <div className="project-pills">
                  {p.repoUrl && (
                    <span
                      className="project-pill"
                      onClick={e => { e.preventDefault(); window.open(p.repoUrl, '_blank') }}
                    >
                      ⌥ GitHub
                    </span>
                  )}
                  {p.liveUrl && (
                    <span
                      className="project-pill project-pill--live"
                      onClick={e => { e.preventDefault(); window.open(p.liveUrl, '_blank') }}
                    >
                      ↗ Live
                    </span>
                  )}
                </div>
              )}
              <span className="project-link">View details ↗</span>
            </LiquidGlass>
          </Link>
        ))}
      </div>
    </>
  )
}
