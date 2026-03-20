import { notFound }    from 'next/navigation'
import type { Metadata } from 'next'
import { PROJECTS }     from '@/data/projects'
import { LiquidGlass }  from '@/components/LiquidGlass'

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return PROJECTS.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const p = PROJECTS.find(p => p.slug === slug)
  return { title: p ? `${p.title} — Thamo` : 'Not Found' }
}

export default async function ProjectDetail({ params }: Props) {
  const { slug } = await params
  const p = PROJECTS.find(p => p.slug === slug)
  if (!p) notFound()

  return (
    <section className="page">
      {/* Header */}
      <div className="project-detail-header">
        <p className="sec-label">{p.index} &nbsp;·&nbsp; {p.year}</p>
        <h1 className="hero-name">{p.title}</h1>
        <p className="hero-bio" style={{ maxWidth: 560 }}>{p.description}</p>
        <div className="project-tags" style={{ marginTop: 28 }}>
          {p.tags.map(t => <span key={t} className="project-tag">{t}</span>)}
        </div>
      </div>

      {/* Feature cards */}
      <div className="feature-grid">
        {p.features.map((f, i) => (
          <LiquidGlass
            key={f.title}
            className="feature-card fade-in"
            style={{ animationDelay: `${i * 0.08}s` } as React.CSSProperties}
            interactive
          >
            <div className="feature-title">{f.title}</div>
            <div className="feature-desc">{f.description}</div>
          </LiquidGlass>
        ))}
      </div>
    </section>
  )
}
