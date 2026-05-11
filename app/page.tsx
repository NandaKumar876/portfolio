import Link from 'next/link'
import { LiquidGlass }       from '@/components/LiquidGlass'
import { GitHubHeatmap }     from '@/components/GitHubHeatmap'
import { getGitHubCalendar } from '@/lib/github'
import { getPortfolioData }  from '@/lib/portfolio'
import { getProjects }       from '@/lib/projects'

export const dynamic = 'force-dynamic'

/** Year you started writing software seriously. Bump as needed. */
const STARTED_BUILDING = 2022

/** Tech stack count surfaced on the home page. Matches the About page roster. */
const STACK_COUNT = 30

function SectionHead({
  index, eyebrow, title, accent, link,
}: {
  index: string
  eyebrow: string
  title: React.ReactNode
  accent?: string
  link?: { href: string; label: string }
}) {
  return (
    <div className="home-section-head">
      <div className="home-section-head-left">
        <p className="home-section-eyebrow">
          <span className="home-section-num">{index}</span>
          <span className="home-section-dot" aria-hidden="true">·</span>
          {eyebrow}
        </p>
        <h2 className="home-section-title">{title}</h2>
        {accent && <p className="home-section-accent">{accent}</p>}
      </div>
      {link && (
        <Link href={link.href as never} className="home-section-link">
          {link.label} <span aria-hidden="true">→</span>
        </Link>
      )}
    </div>
  )
}

export default async function Home() {
  const [content, calendar, projects] = await Promise.all([
    getPortfolioData(),
    getGitHubCalendar(),
    getProjects(),
  ])

  const { profile } = content
  const yearsBuilding = new Date().getFullYear() - STARTED_BUILDING
  const featured     = projects.slice(0, 3)
  const totalCommits = calendar?.totalContributions ?? 0

  const stats = [
    { value: yearsBuilding, suffix: 'yrs', label: 'Building',     meta: `Since ${STARTED_BUILDING}` },
    { value: projects.length, suffix: '',  label: 'Live Projects', meta: 'Shipped & maintained' },
    { value: totalCommits,    suffix: '',  label: 'Commits',       meta: 'Past 365 days' },
    { value: STACK_COUNT,     suffix: '+', label: 'Technologies',  meta: 'In daily rotation' },
  ]

  return (
    <>
      {/* ─────────────────────────────────────────────
         1. HERO  (centred, ornament-anchored)
         ───────────────────────────────────────────── */}
      <section className="page page--home-hero">
        <div className="home-hero">

          <div className="home-hero-ornament" aria-hidden="true">
            <span className="home-hero-orn-line" />
            <span className="home-hero-orn-mark">✦</span>
            <span className="home-hero-orn-line" />
          </div>

          <h1 className="home-hero-name">
            <span className="home-hero-name-first">Thamothara</span>
            <span className="home-hero-name-last">Natarajan</span>
          </h1>

          <p className="home-hero-alias">
            <span className="home-hero-alias-dash">—</span>
            {' '}known as Thamo, mostly{' '}
            <span className="home-hero-alias-dash">—</span>
          </p>

          <div className="home-hero-meta">
            <span>{profile.role}</span>
            <span className="home-hero-meta-sep" aria-hidden="true">·</span>
            <span>{profile.location}</span>
            <span className="home-hero-meta-sep" aria-hidden="true">·</span>
            <span className="home-hero-meta-status">
              <span className="status-dot" aria-hidden="true" />
              available
            </span>
          </div>

          <p className="home-hero-bio">
            <span className="home-hero-bio-quote" aria-hidden="true">&ldquo;</span>
            {profile.bio}
            <span className="home-hero-bio-quote" aria-hidden="true">&rdquo;</span>
          </p>

          <div className="home-hero-actions">
            <a href="/api/resume" className="btn-glass" target="_blank" rel="noreferrer">
              View Resume
            </a>
            <Link href="/work" className="btn-ghost">Selected Work</Link>
            <Link href="/contact" className="btn-ghost">Get in Touch</Link>
          </div>

          <a href="#selected-work" className="home-hero-scroll" aria-label="Scroll to selected work">
            <span className="home-hero-scroll-arrow" aria-hidden="true">↓</span>
          </a>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
         2. SELECTED WORK
         ───────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section id="selected-work" className="page home-section">
          <SectionHead
            index="01"
            eyebrow="Selected Work"
            title={<>A handful of <em>recent things</em></>}
            link={{ href: '/work', label: 'View all work' }}
          />
          <div className={`home-work-grid home-work-grid--c${Math.min(featured.length, 3)}`}>
            {featured.map(p => (
              <Link key={p.id} href={`/work/${p.slug}` as never} style={{ textDecoration: 'none' }}>
                <LiquidGlass className="home-work-card" interactive as="article">
                  <span className="home-work-index">{p.index} · {p.year}</span>
                  <h3 className="home-work-title">{p.title}</h3>
                  <p className="home-work-desc">
                    {p.description.length > 140
                      ? p.description.slice(0, 138).trim() + '…'
                      : p.description}
                  </p>
                  <div className="home-work-tags">
                    {p.tags.slice(0, 3).map(t => (
                      <span key={t} className="project-tag">{t}</span>
                    ))}
                  </div>
                  <span className="home-work-link">
                    Read on <span aria-hidden="true">→</span>
                  </span>
                </LiquidGlass>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────
         3. STATS
         ───────────────────────────────────────────── */}
      <section className="page home-section">
        <SectionHead
          index="02"
          eyebrow="By the Numbers"
          title={<>A few <em>useful facts</em></>}
          accent="Tallied from live data, not vanity metrics."
        />
        <div className="home-stats">
          {stats.map(stat => (
            <LiquidGlass key={stat.label} className="home-stat-card" interactive>
              <span className="home-stat-value">
                {stat.value.toLocaleString()}
                {stat.suffix && <span className="home-stat-suffix">{stat.suffix}</span>}
              </span>
              <span className="home-stat-label">{stat.label}</span>
              <span className="home-stat-meta">{stat.meta}</span>
            </LiquidGlass>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────
         4. FIELD NOTES — heatmap
         ───────────────────────────────────────────── */}
      {calendar && (
        <section className="page home-section">
          <SectionHead
            index="03"
            eyebrow="Field Notes"
            title={<>A year in <em>commits</em></>}
            accent="Pulled live from GitHub. One small square per day."
          />
          <LiquidGlass className="heatmap-glass" interactive={false}>
            <GitHubHeatmap
              weeks={calendar.weeks}
              totalContributions={calendar.totalContributions}
            />
          </LiquidGlass>
        </section>
      )}

      {/* ─────────────────────────────────────────────
         5. REACH OUT — closing CTA
         ───────────────────────────────────────────── */}
      <section className="page home-section">
        <SectionHead
          index="04"
          eyebrow="Reach Out"
          title={<>Let&apos;s build <em>something fine</em></>}
        />
        <LiquidGlass className="home-cta" interactive>
          <p className="home-cta-mark">— a brief note —</p>
          <p className="home-cta-body">
            If you have a project, a question, or just want to talk shop, I&apos;d love to hear from you.
            I read every message and reply within 24&ndash;48 hours.
          </p>
          <div className="home-cta-actions">
            <Link href="/contact" className="btn-glass">Send a Message</Link>
            <a href={`mailto:${profile.email}`} className="btn-ghost">{profile.email}</a>
          </div>
        </LiquidGlass>
      </section>
    </>
  )
}
