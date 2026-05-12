import Link from 'next/link'
import { LiquidGlass }       from '@/components/LiquidGlass'
import { GitHubHeatmap }     from '@/components/GitHubHeatmap'
import { ChapterRail }       from '@/components/ChapterRail'
import { CountUp }           from '@/components/CountUp'
import { LocalClock }        from '@/components/LocalClock'
import { RepoStars }         from '@/components/RepoStars'
import { RecentActivity }    from '@/components/RecentActivity'
import { getGitHubCalendar, getRecentActivity } from '@/lib/github'
import { getPortfolioData }  from '@/lib/portfolio'
import { getProjects }       from '@/lib/projects'

export const dynamic = 'force-dynamic'

const STARTED_BUILDING = 2022
const STACK_COUNT      = 30

function roman(num: number): string {
  const map: [number, string][] = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ]
  let result = ''
  let n = num
  for (const [v, s] of map) { while (n >= v) { result += s; n -= v } }
  return result
}

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
  const [content, calendar, projects, activity] = await Promise.all([
    getPortfolioData(),
    getGitHubCalendar(),
    getProjects(),
    getRecentActivity(12),
  ])

  const { profile, resume, certificates } = content
  /* Cache-buster for the resume link so browsers fetch the freshly
     uploaded PDF instead of serving a stale cached version. */
  const resumeHref     = `/api/resume?v=${encodeURIComponent(resume?.uploadedAt || Date.now())}`
  const yearsBuilding  = new Date().getFullYear() - STARTED_BUILDING
  const featured       = projects.slice(0, 3)
  const heroFeature    = projects[0]
  const totalCommits   = calendar?.totalContributions ?? 0
  const cleanLocation  = profile.location.replace(/[\u{1F1E6}-\u{1F1FF}]{2}/gu, '').trim()
  const editionYear    = roman(new Date().getFullYear())

  const stats = [
    { value: yearsBuilding,   suffix: 'yrs', label: 'Building',     meta: `Since ${STARTED_BUILDING}` },
    { value: projects.length, suffix: '',    label: 'Live Projects', meta: 'Shipped & maintained' },
    { value: totalCommits,    suffix: '',    label: 'Commits',       meta: 'Past 365 days' },
    { value: STACK_COUNT,     suffix: '+',   label: 'Technologies',  meta: 'In daily rotation' },
  ]

  const chapters = [
    { id: 'hero',          label: 'Top',           render: true },
    { id: 'now',           label: 'Currently',     render: true },
    { id: 'selected-work', label: 'Selected Work', render: featured.length > 0 },
    { id: 'tally',         label: 'The Tally',     render: true },
    { id: 'field-notes',   label: 'Field Notes',   render: !!calendar },
    { id: 'live-feed',     label: 'Live Feed',     render: activity.length > 0 },
    { id: 'credentials',   label: 'Credentials',   render: certificates.length > 0 },
    { id: 'reach-out',     label: 'Reach Out',     render: true },
  ]
    .filter(c => c.render)
    .map((c, i) => ({ id: c.id, label: c.label, num: String(i).padStart(2, '0') }))

  return (
    <>
      <ChapterRail chapters={chapters} />

      {/* ═════════════════════════════════════════════════
         HERO — editorial cover
         ═════════════════════════════════════════════════ */}
      <section id="hero" className="page page--home-hero hero-cover">

        {/* ── dateline ── */}
        <header className="hero-cover-dateline">
          <span className="hero-cover-dateline-issue">N&ordm; 03 &middot; {editionYear}</span>
          <span className="hero-cover-dateline-rule" aria-hidden="true" />
          <span className="hero-cover-dateline-imprint">A portfolio in liquid glass</span>
          <span className="hero-cover-dateline-rule" aria-hidden="true" />
          <LocalClock timezone="Asia/Kolkata" label={cleanLocation || 'Chennai'} />
        </header>

        {/* ── main grid ── */}
        <div className="hero-cover-grid">

          {/* LEFT: identity + bio + CTAs */}
          <div className="hero-cover-main">
            <h1 className="hero-cover-name">
              <span className="hero-cover-name-first">Thamothara</span>
              <span className="hero-cover-name-last">Natarajan</span>
            </h1>

            <p className="hero-cover-role">
              <span>{profile.role}</span>
              <span className="hero-cover-role-sep" aria-hidden="true">/</span>
              <span>{cleanLocation}</span>
              <span className="hero-cover-role-sep" aria-hidden="true">/</span>
              <span className="hero-cover-role-status">
                <span className="status-dot" aria-hidden="true" />
                open to work
              </span>
            </p>

            <blockquote className="hero-cover-bio">
              <span className="hero-cover-bio-mark" aria-hidden="true">&ldquo;</span>
              I build careful software for the web &mdash; loads fast, ages well, and
              doesn&rsquo;t pick fights with the people using it.
              <span className="hero-cover-bio-mark" aria-hidden="true">&rdquo;</span>
              <footer className="hero-cover-bio-sign">— {profile.bio}</footer>
            </blockquote>

            <div className="hero-cover-actions">
              <Link href="/work" className="btn-glass">See my work →</Link>
              <a href={resumeHref} className="btn-ghost" target="_blank" rel="noreferrer">
                Resume (PDF)
              </a>
              <Link href="/contact" className="btn-ghost">Say hello</Link>
            </div>
          </div>

          {/* RIGHT: featured work tile */}
          {heroFeature && (
            <aside className="hero-cover-feature">
              <p className="hero-cover-feature-label">
                <span className="hero-cover-feature-mark">§</span>
                Featured work
              </p>
              <Link href={`/work/${heroFeature.slug}` as never} className="hero-cover-feature-link">
                <LiquidGlass className="hero-cover-feature-card" interactive={false}>
                  <span className="hero-cover-feature-index">
                    {heroFeature.index} &middot; {heroFeature.year}
                    {heroFeature.repoUrl && (
                      <> &middot; <RepoStars repoUrl={heroFeature.repoUrl} /></>
                    )}
                  </span>
                  <h3 className="hero-cover-feature-title">{heroFeature.title}</h3>
                  <p className="hero-cover-feature-desc">
                    {heroFeature.description.length > 140
                      ? heroFeature.description.slice(0, 138).trim() + '…'
                      : heroFeature.description}
                  </p>
                  <div className="hero-cover-feature-tags">
                    {heroFeature.tags.slice(0, 3).map(t => (
                      <span key={t} className="hero-cover-feature-tag">{t}</span>
                    ))}
                  </div>
                  <span className="hero-cover-feature-cta">
                    Read the case study <span aria-hidden="true">→</span>
                  </span>
                </LiquidGlass>
              </Link>
            </aside>
          )}
        </div>

        {/* ── stats strip ── */}
        <div className="hero-cover-stats">
          {stats.map((s, i) => (
            <div key={s.label} className="hero-cover-stat">
              <span className="hero-cover-stat-value">
                <CountUp to={s.value} />
                {s.suffix && <span className="hero-cover-stat-suffix">{s.suffix}</span>}
              </span>
              <span className="hero-cover-stat-label">{s.label}</span>
              <span className="hero-cover-stat-meta">{s.meta}</span>
              {i < stats.length - 1 && (
                <span className="hero-cover-stat-divider" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ═════════════════════════════════════════════════
         01 · CURRENTLY
         ═════════════════════════════════════════════════ */}
      <section id="now" className="page home-section">
        <SectionHead
          index="01"
          eyebrow="Currently"
          title={<>What I&rsquo;m up to <em>this week</em></>}
          accent="A small honest snapshot &mdash; not a status page."
        />
        <div className="home-now-grid">
          <LiquidGlass className="home-now-card" interactive={false}>
            <span className="home-now-card-tag">Building</span>
            <p className="home-now-card-body">
              Polishing this very portfolio &mdash; a Next&nbsp;16 + Redis admin
              console behind a tasteful liquid-glass front.
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

      {/* ═════════════════════════════════════════════════
         02 · SELECTED WORK
         ═════════════════════════════════════════════════ */}
      {featured.length > 0 && (
        <section id="selected-work" className="page home-section">
          <SectionHead
            index="02"
            eyebrow="Selected Work"
            title={<>Things I&rsquo;ve <em>made lately</em></>}
            accent="A small set, hand-picked. The full archive lives one click away."
            link={{ href: '/work', label: 'View all work' }}
          />
          <div className={`home-work-grid home-work-grid--c${Math.min(featured.length, 3)}`}>
            {featured.map(p => (
              <Link key={p.id} href={`/work/${p.slug}` as never} style={{ textDecoration: 'none' }}>
                <LiquidGlass className="home-work-card" interactive={false} as="article">
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

      {/* ═════════════════════════════════════════════════
         03 · THE TALLY
         ═════════════════════════════════════════════════ */}
      <section id="tally" className="page home-section">
        <SectionHead
          index="03"
          eyebrow="The Tally"
          title={<>A few <em>useful facts</em></>}
          accent="Live numbers. They count up as you scroll into view."
        />
        <div className="home-stats">
          {stats.map(stat => (
            <LiquidGlass key={stat.label} className="home-stat-card" interactive={false}>
              <span className="home-stat-value">
                <CountUp to={stat.value} />
                {stat.suffix && <span className="home-stat-suffix">{stat.suffix}</span>}
              </span>
              <span className="home-stat-label">{stat.label}</span>
              <span className="home-stat-meta">{stat.meta}</span>
            </LiquidGlass>
          ))}
        </div>
      </section>

      {/* ═════════════════════════════════════════════════
         04 · FIELD NOTES
         ═════════════════════════════════════════════════ */}
      {calendar && (
        <section id="field-notes" className="page home-section">
          <SectionHead
            index="04"
            eyebrow="Field Notes"
            title={<>A year, <em>day by day</em></>}
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

      {/* ═════════════════════════════════════════════════
         05 · LIVE FEED — recent GitHub activity
         ═════════════════════════════════════════════════ */}
      {activity.length > 0 && (
        <section id="live-feed" className="page home-section">
          <SectionHead
            index="05"
            eyebrow="Live from the keyboard"
            title={<>What I&rsquo;ve been <em>shipping</em></>}
            accent="Pulled live from GitHub &mdash; auto-refreshes every 90 seconds."
          />
          <LiquidGlass className="activity-glass" interactive={false}>
            <RecentActivity initial={activity} />
          </LiquidGlass>
        </section>
      )}

      {/* ═════════════════════════════════════════════════
         06 · CREDENTIALS — featured certificates
         ═════════════════════════════════════════════════ */}
      {certificates.length > 0 && (
        <section id="credentials" className="page home-section">
          <SectionHead
            index="06"
            eyebrow="Credentials"
            title={<>Proof of <em>practice</em></>}
            accent="A selection of certifications and credentials. The full collection is one click away."
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

      {/* ═════════════════════════════════════════════════
         07 · REACH OUT
         ═════════════════════════════════════════════════ */}
      <section id="reach-out" className="page home-section">
        <SectionHead
          index="07"
          eyebrow="Reach Out"
          title={<>If you&rsquo;ve read this far &mdash; <em>let&rsquo;s talk</em></>}
        />
        <LiquidGlass className="home-cta" interactive={false}>
          <p className="home-cta-mark">— P.S. —</p>
          <p className="home-cta-body">
            If you have a project that needs careful hands, a question I might
            help with, or just want to talk shop &mdash; my inbox is open and
            I write back. Usually within a day or two.
          </p>
          <div className="home-cta-actions">
            <Link href="/contact" className="btn-glass">Send a Message</Link>
            <a href={`mailto:${profile.email}`} className="btn-ghost">{profile.email}</a>
          </div>
          <p className="home-cta-signoff">— Thamo</p>
        </LiquidGlass>
      </section>
    </>
  )
}
