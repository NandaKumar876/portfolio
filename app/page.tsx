import Link from 'next/link'
import { LiquidGlass }       from '@/components/LiquidGlass'
import { GitHubHeatmap }     from '@/components/GitHubHeatmap'
import { RepoStars }         from '@/components/RepoStars'
import { RecentActivity }    from '@/components/RecentActivity'
import { getGitHubCalendar, getRecentActivity } from '@/lib/github'
import { getPortfolioData }  from '@/lib/portfolio'
import { getProjects }       from '@/lib/projects'

export const dynamic = 'force-dynamic'

const STARTED_BUILDING = 2022

function SectionHead({
  index, eyebrow, title, link,
}: {
  index: string
  eyebrow: string
  title: React.ReactNode
  link?: { href: string; label: string }
}) {
  return (
    <div className="sec-head">
      <p className="sec-head-eyebrow">
        <span className="sec-head-num">{index}</span>
        {eyebrow}
      </p>
      <div className="sec-head-row">
        <h2 className="sec-head-title">{title}</h2>
        {link && (
          <Link href={link.href as never} className="sec-head-link">
            {link.label} <span aria-hidden="true">→</span>
          </Link>
        )}
      </div>
    </div>
  )
}

export default async function Home() {
  const [content, calendar, projects, activity] = await Promise.all([
    getPortfolioData(),
    getGitHubCalendar(),
    getProjects(),
    getRecentActivity(12),
  ])

  const { profile, resume, certificates } = content
  const resumeHref    = `/api/resume?v=${encodeURIComponent(resume?.uploadedAt || Date.now())}`
  const yearsBuilding = new Date().getFullYear() - STARTED_BUILDING
  const featured      = projects.slice(0, 3)
  const cleanLocation = profile.location.replace(/[\u{1F1E6}-\u{1F1FF}]{2}/gu, '').trim()

  /* Contiguous section numbering — only sections that render get a number. */
  const order = [
    'now',
    featured.length > 0     ? 'selected-work' : null,
    calendar                ? 'field-notes'   : null,
    activity.length > 0     ? 'live-feed'      : null,
    certificates.length > 0 ? 'credentials'    : null,
    'reach-out',
  ].filter(Boolean) as string[]
  const idx = (id: string) => String(order.indexOf(id) + 1).padStart(2, '0')

  return (
    <>
      {/* ═════════════ HERO — two-column: identity card | annotated intro ═════════════ */}
      <section className="home-hero">
        <div className="home-hero-grid">

          {/* LEFT — identity (no avatar; a typographic monogram instead) */}
          <aside className="hero-id">
            <span className="hero-id-monogram" aria-hidden="true">TN</span>
            <h1 className="hero-id-name">Thamothara<br />Natarajan</h1>
            <p className="hero-id-loc">
              <svg className="hero-id-pin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11Z" strokeLinejoin="round" />
                <circle cx="12" cy="10" r="2.4" />
              </svg>
              {cleanLocation}
            </p>
            <div className="hero-id-socials">
              <a href={profile.githubUrl}   target="_blank" rel="noreferrer" className="hero-id-social">GitHub</a>
              <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="hero-id-social">LinkedIn</a>
              <a href={profile.xUrl}        target="_blank" rel="noreferrer" className="hero-id-social">X</a>
            </div>
            <a href={resumeHref} target="_blank" rel="noreferrer" className="hero-id-resume">
              View Résumé
            </a>
          </aside>

          {/* divider */}
          <span className="hero-divider" aria-hidden="true" />

          {/* RIGHT — annotated intro prose, key terms highlighted */}
          <div className="hero-copy">
            <p>
              I&rsquo;m a <mark className="hl">Full Stack Developer</mark> based in{' '}
              <mark className="hl">{cleanLocation}</mark>, building careful software for
              the web &mdash; the kind that <mark className="hl">loads fast</mark>,{' '}
              <mark className="hl">ages well</mark>, and doesn&rsquo;t pick fights with
              the people using it.
            </p>
            <p>
              I&rsquo;ve spent <mark className="hl">{yearsBuilding}+ years </mark> shipping
              across the stack &mdash; from <mark className="hl">designing APIs</mark> and{' '}
              <mark className="hl">modelling databases</mark> to{' '}
              <mark className="hl">polished, accessible front ends</mark>. I work most with{' '}
              <mark className="hl">TypeScript</mark>, <mark className="hl">React</mark>,{' '}
              <mark className="hl">Next.js</mark>, <mark className="hl">Node</mark>, and{' '}
              <mark className="hl">Python</mark>, with <mark className="hl">Docker</mark>{' '}
              and <mark className="hl">AWS</mark> on the deployment side.
            </p>
            <p>
              I&rsquo;m a <mark className="hl">fast learner</mark>,{' '}
              <mark className="hl">detail-obsessed</mark>, and a{' '}
              <mark className="hl">strong problem solver</mark> who cares as much about the
              shape of a function as the curve of a serif.
            </p>
            <p>
              Got something to build?{' '}
              <a href={`mailto:${profile.email}`} className="hero-copy-mail">Drop me an email</a>{' '}
              &mdash; or reach out on social.
            </p>
            <span className="hero-available">
              <span className="hero-available-dot" aria-hidden="true" />
              Available for work
            </span>
          </div>
        </div>
      </section>

      {/* ═════════════ CURRENTLY ═════════════ */}
      <section id="now" className="home-section">
        <SectionHead
          index={idx('now')}
          eyebrow="Currently"
          title={<>What I&rsquo;m up to <em>this week</em></>}
        />
        <div className="home-now-grid">
          <LiquidGlass className="home-now-card" interactive={false}>
            <span className="home-now-card-tag">Building</span>
            <p className="home-now-card-body">
              Polishing this portfolio &mdash; a Next&nbsp;16 + Redis admin
              console behind a careful front end.
            </p>
          </LiquidGlass>
          <LiquidGlass className="home-now-card" interactive={false}>
            <span className="home-now-card-tag">Learning</span>
            <p className="home-now-card-body">
              Going deeper on edge runtimes, async caching, and the
              fine print of CSS&nbsp;color-mix.
            </p>
          </LiquidGlass>
          <LiquidGlass className="home-now-card" interactive={false}>
            <span className="home-now-card-tag">Reading</span>
            <p className="home-now-card-body">
              <em>A Philosophy of Software Design</em> by John Ousterhout
              &mdash; for the third time.
            </p>
          </LiquidGlass>
          <LiquidGlass className="home-now-card" interactive={false}>
            <span className="home-now-card-tag">Open to</span>
            <p className="home-now-card-body">
              Full-time roles, contract work, and small careful collaborations.
              Based in {cleanLocation}.
            </p>
          </LiquidGlass>
        </div>
      </section>

      {/* ═════════════ SELECTED WORK ═════════════ */}
      {featured.length > 0 && (
        <section id="selected-work" className="home-section">
          <SectionHead
            index={idx('selected-work')}
            eyebrow="Selected Work"
            title={<>Things I&rsquo;ve <em>made lately</em></>}
            link={{ href: '/work', label: 'View all work' }}
          />
          <div className="home-work-list">
            {featured.map(p => (
              <Link key={p.id} href={`/work/${p.slug}` as never} className="home-work-row">
                <span className="home-work-row-index">{p.index}</span>
                <div className="home-work-row-body">
                  <div className="home-work-row-head">
                    <h3 className="home-work-row-title">{p.title}</h3>
                    <span className="home-work-row-meta">
                      {p.year}
                      {p.repoUrl && <> &middot; <RepoStars repoUrl={p.repoUrl} /></>}
                    </span>
                  </div>
                  <p className="home-work-row-desc">
                    {p.description.length > 150
                      ? p.description.slice(0, 148).trim() + '…'
                      : p.description}
                  </p>
                  <div className="home-work-row-tags">
                    {p.tags.slice(0, 4).map(t => (
                      <span key={t} className="project-tag">{t}</span>
                    ))}
                  </div>
                </div>
                <span className="home-work-row-arrow" aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ═════════════ FIELD NOTES ═════════════ */}
      {calendar && (
        <section id="field-notes" className="home-section">
          <SectionHead
            index={idx('field-notes')}
            eyebrow="Field Notes"
            title={<>A year, <em>day by day</em></>}
          />
          <LiquidGlass className="heatmap-glass" interactive={false}>
            <GitHubHeatmap
              weeks={calendar.weeks}
              totalContributions={calendar.totalContributions}
            />
          </LiquidGlass>
        </section>
      )}

      {/* ═════════════ LIVE FEED ═════════════ */}
      {activity.length > 0 && (
        <section id="live-feed" className="home-section">
          <SectionHead
            index={idx('live-feed')}
            eyebrow="Live from the keyboard"
            title={<>What I&rsquo;ve been <em>shipping</em></>}
          />
          <LiquidGlass className="activity-glass" interactive={false}>
            <RecentActivity initial={activity} />
          </LiquidGlass>
        </section>
      )}

      {/* ═════════════ CREDENTIALS ═════════════ */}
      {certificates.length > 0 && (
        <section id="credentials" className="home-section">
          <SectionHead
            index={idx('credentials')}
            eyebrow="Credentials"
            title={<>Proof of <em>practice</em></>}
            link={{ href: '/certificates', label: 'View all certificates' }}
          />
          <ol className="home-certs">
            {certificates.slice(0, 4).map(c => (
              <li key={c.id} className="home-cert">
                <span className="home-cert-year">{c.year}</span>
                <div className="home-cert-body">
                  <h3 className="home-cert-title">{c.title}</h3>
                  <p className="home-cert-issuer">{c.issuer}</p>
                  {c.description && <p className="home-cert-desc">{c.description}</p>}
                </div>
                {c.fileUrl && (
                  <a
                    href={c.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="home-cert-link"
                    aria-label={`View ${c.title} certificate`}
                  >
                    View <span aria-hidden="true">↗</span>
                  </a>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* ═════════════ REACH OUT ═════════════ */}
      <section id="reach-out" className="home-section">
        <SectionHead
          index={idx('reach-out')}
          eyebrow="Reach Out"
          title={<>If you&rsquo;ve read this far &mdash; <em>let&rsquo;s talk</em></>}
        />
        <LiquidGlass className="home-cta" interactive={false}>
          <p className="home-cta-body">
            A project that needs careful hands, a question I might help with, or
            just a hello &mdash; my inbox is open and I write back, usually
            within a day or two.
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
