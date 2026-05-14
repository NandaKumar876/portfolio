import Link from 'next/link'
import { LiquidGlass }       from '@/components/LiquidGlass'
import { GitHubHeatmap }     from '@/components/GitHubHeatmap'
import { CountUp }           from '@/components/CountUp'
import { RepoStars }         from '@/components/RepoStars'
import { RecentActivity }    from '@/components/RecentActivity'
import { getGitHubCalendar, getRecentActivity } from '@/lib/github'
import { getPortfolioData }  from '@/lib/portfolio'
import { getProjects }       from '@/lib/projects'

export const dynamic = 'force-dynamic'

const STARTED_BUILDING = 2022
const STACK_COUNT      = 30

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
  const resumeHref     = `/api/resume?v=${encodeURIComponent(resume?.uploadedAt || Date.now())}`
  const yearsBuilding  = new Date().getFullYear() - STARTED_BUILDING
  const featured       = projects.slice(0, 3)
  const totalCommits   = calendar?.totalContributions ?? 0
  const cleanLocation  = profile.location.replace(/[\u{1F1E6}-\u{1F1FF}]{2}/gu, '').trim()

  const stats = [
    { value: yearsBuilding,   suffix: 'yrs', label: 'Building' },
    { value: projects.length, suffix: '',    label: 'Projects' },
    { value: totalCommits,    suffix: '',    label: 'Commits / yr' },
    { value: STACK_COUNT,     suffix: '+',   label: 'Technologies' },
  ]

  /* Contiguous section numbering — only the sections that actually render
     get a number, so there's never a gap (…04, 06…). */
  const order = [
    'now',
    featured.length > 0   ? 'selected-work' : null,
    calendar              ? 'field-notes'   : null,
    activity.length > 0   ? 'live-feed'     : null,
    certificates.length > 0 ? 'credentials' : null,
    'reach-out',
  ].filter(Boolean) as string[]
  const idx = (id: string) => String(order.indexOf(id) + 1).padStart(2, '0')

  return (
    <>
      {/* ═════════════ INTRO ═════════════ */}
      <section className="home-intro">
        <p className="home-intro-statement">
          I build careful software for the web &mdash; loads fast, ages well,
          and doesn&rsquo;t pick fights with the people using it.
        </p>
        <p className="home-intro-bio">{profile.bio}</p>

        <div className="home-intro-actions">
          <Link href="/work" className="btn-glass">See my work →</Link>
          <a href={resumeHref} className="btn-ghost" target="_blank" rel="noreferrer">
            Resume (PDF)
          </a>
          <Link href="/contact" className="btn-ghost">Say hello</Link>
        </div>

        <dl className="home-intro-stats">
          {stats.map(s => (
            <div key={s.label} className="home-intro-stat">
              <dt className="home-intro-stat-value">
                <CountUp to={s.value} />
                {s.suffix && <span className="home-intro-stat-suffix">{s.suffix}</span>}
              </dt>
              <dd className="home-intro-stat-label">{s.label}</dd>
            </div>
          ))}
        </dl>
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
