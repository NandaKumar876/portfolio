import Link from 'next/link'
import { Typewriter }        from '@/components/Typewriter'
import { LiquidGlass }       from '@/components/LiquidGlass'
import { GitHubHeatmap }     from '@/components/GitHubHeatmap'
import { getGitHubCalendar } from '@/lib/github'
import { getPortfolioData }  from '@/lib/portfolio'

const SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js',
  'Express.js', 'MongoDB', 'PostgreSQL', 'Docker', 'AWS',
]

export default async function Home() {
  const [content, calendar] = await Promise.all([
    getPortfolioData(),
    getGitHubCalendar(),
  ])

  const { profile } = content

  return (
    <>
      {/* ── Hero ── */}
      <section className="page page--hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="status-dot" />
            <span className="eyebrow-text">{profile.heroLabel}</span>
          </div>

          <h1 className="hero-name">
            {profile.name}
            <em>{profile.headline}</em>
          </h1>

          <Typewriter />

          <p className="hero-bio">{profile.bio}</p>

          <div className="hero-actions">
            <a href="/api/resume" className="btn-glass" target="_blank" rel="noreferrer">
              View Resume
            </a>
            
            <Link href="/contact" className="btn-ghost">
              Get in Touch
            </Link>
          </div>

          <p className="hero-meta">{profile.location}</p>

          <div className="skills-row">
            {SKILLS.map(s => (
              <span key={s} className="skill-pill">{s}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── GitHub Contribution Heatmap ── */}
      {calendar && (
        <section className="page" style={{ paddingTop: 0, paddingBottom: 80 }}>
          <LiquidGlass className="heatmap-glass" interactive={false}>
            <GitHubHeatmap
              weeks={calendar.weeks}
              totalContributions={calendar.totalContributions}
            />
          </LiquidGlass>
        </section>
      )}
    </>
  )
}
