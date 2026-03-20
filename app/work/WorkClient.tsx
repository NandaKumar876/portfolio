'use client'

import { useState }    from 'react'
import Link            from 'next/link'
import { LiquidGlass } from '@/components/LiquidGlass'
import type { Project } from '@/data/projects'

const TAGS = ['All', 'React', 'Node', 'Three.js', 'AI', 'Design']

export function WorkClient({ projects }: { projects: Project[] }) {
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
        {list.map((p, i) => (
          <Link key={p.id} href={`/work/${p.slug}`} style={{ textDecoration: 'none' }}>
            <LiquidGlass
              className="project-card fade-in"
              style={{ animationDelay: `${i * 0.06}s` } as React.CSSProperties}
              interactive
            >
              <div className="project-index">{p.index}</div>
              <h3 className="project-title">{p.title}</h3>
              <p className="project-desc">{p.description}</p>
              <div className="project-tags">
                {p.tags.map(t => <span key={t} className="project-tag">{t}</span>)}
              </div>
              <span className="project-link">View project ↗</span>
            </LiquidGlass>
          </Link>
        ))}
      </div>
    </>
  )
}
