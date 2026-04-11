import Link from 'next/link'
import { Typewriter } from '@/components/Typewriter'
import { getGitHubStats } from '@/lib/github'
import { getPortfolioData } from '@/lib/portfolio'

const SKILLS = [
  'React',
  'TypeScript',
  'Next.js',
  'Node.js',
  'Redis',
  'Motion',
]

export default async function Home() {
  const [content, githubStats] = await Promise.all([
    getPortfolioData(),
    getGitHubStats(),
  ])

  const { profile } = content
  const streak = githubStats ? `${githubStats.currentStreak} day streak` : 'Streak unavailable'

  return (
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

        <p className="hero-meta">
          {streak} · {profile.location}
        </p>

        <div className="skills-row">
          {SKILLS.map(s => (
            <span key={s} className="skill-pill">{s}</span>
          ))}
        </div>
      </div>
    </section>
  )
}
