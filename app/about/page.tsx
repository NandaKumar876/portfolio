import type { Metadata } from 'next'
import Link from 'next/link'
import { LiquidGlass } from '@/components/LiquidGlass'
import { getPortfolioData } from '@/lib/portfolio'

export const metadata: Metadata = {
  title: 'About — Thamo',
  description: 'Thamothara Natarajan — Full Stack Developer from Chennai. Stack, experience, education, and interests.',
}

const STACK = {
  Languages:  ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Go'],
  Frontend:   ['React', 'Next.js', 'Tailwind CSS', 'Framer Motion', 'HTML5', 'CSS3', 'Vite', 'Vue.js'],
  Backend:    ['Node.js', 'Express.js', 'FastAPI', 'Django', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Firebase'],
  'DevOps & Cloud': ['Docker', 'Kubernetes', 'AWS', 'Google Cloud', 'Vercel', 'Git', 'GitHub'],
  Design:     ['Figma', 'Photoshop', 'Final Cut Pro'],
  DSA:        ['LeetCode — 20+ problems', 'Arrays', 'Trees', 'Graphs', 'Dynamic Programming'],
}

const CURRENTLY = [
  { label: 'Learning',   value: 'Advanced React + System Design' },
  { label: 'Building',   value: 'Portfolio v3 · KNK Trip Cart' },
  { label: 'Exploring',  value: 'Web3 · AI Agents · Hackathons' },
]

const INTERESTS = [
  'Open Source Contributions',
  'Hackathon sprints',
  'Building useful side projects',
  'Blockchain × AI crossovers',
]

export default async function AboutPage() {
  const { profile, experience, education } = await getPortfolioData()

  return (
    <section className="page">

      {/* ── Hero intro ── */}
      <div className="about-intro">
        <p className="sec-label">Background</p>
        <h1 className="sec-heading">About <em>Me</em></h1>
        <p className="about-tagline">
          Hey, I&apos;m <strong style={{ color: '#fff', fontWeight: 400 }}>Thamothara Natarajan</strong> — alias <em>Thamo</em>.
          A Full Stack Developer from <strong style={{ color: '#fff', fontWeight: 400 }}>Chennai, Tamil Nadu 🇮🇳</strong>,
          obsessed with building things that are precise, fast, and a little bit beautiful.
        </p>
      </div>

      {/* ── Main columns ── */}
      <div className="about-cols-new">

        {/* LEFT */}
        <div className="about-left">
          <p className="about-body">{profile.bio}</p>
          <p className="about-body">{profile.availability}</p>

          <div className="hero-actions" style={{ marginTop: 24, marginBottom: 44 }}>
            <a href="/api/resume" className="btn-glass" target="_blank" rel="noreferrer">View Resume</a>
            <Link href="/contact" className="btn-ghost">Get in Touch</Link>
          </div>

          {/* Currently */}
          <LiquidGlass className="about-status-card">
            <p className="sec-label" style={{ marginBottom: 14 }}>Currently</p>
            {CURRENTLY.map(c => (
              <div key={c.label} className="about-status-row">
                <span className="about-status-label">{c.label}</span>
                <span className="about-status-value">{c.value}</span>
              </div>
            ))}
          </LiquidGlass>

          {/* Interests */}
          <div style={{ marginTop: 20 }}>
            <p className="sec-label" style={{ marginBottom: 12 }}>Interests</p>
            <div className="interests-list">
              {INTERESTS.map(item => (
                <span key={item} className="interest-pill">{item}</span>
              ))}
            </div>
          </div>

          {/* Fun fact */}
          <LiquidGlass className="about-funfact-card" style={{ marginTop: 20 }}>
            <span className="about-funfact-icon">Fun fact</span>
            <p className="about-funfact-text">I name my side projects before I start them.</p>
          </LiquidGlass>
        </div>

        {/* RIGHT */}
        <div className="about-right">

          {/* Tech Arsenal */}
          <p className="sec-label" style={{ marginBottom: 16 }}>Tech Arsenal</p>
          {Object.entries(STACK).map(([category, techs]) => (
            <div key={category} className="stack-category">
              <span className="stack-category-name">{category}</span>
              <div className="stack-pills">
                {techs.map(t => (
                  <span key={t} className="stack-pill">{t}</span>
                ))}
              </div>
            </div>
          ))}

          {/* Experience (from Redis) */}
          <p className="sec-label" style={{ marginTop: 40, marginBottom: 16 }}>Experience</p>
          <div className="timeline">
            {experience.map(e => (
              <div key={e.id} className="timeline-item">
                <span className="timeline-dot" />
                <p className="timeline-year">{e.year}</p>
                <h3 className="timeline-title">{e.title}</h3>
                <p className="timeline-org">{e.org}</p>
                {e.desc && <p className="timeline-desc">{e.desc}</p>}
              </div>
            ))}
          </div>

          {/* Education (from Redis) */}
          <p className="sec-label" style={{ marginTop: 32, marginBottom: 16 }}>Education</p>
          <div className="timeline">
            {education.map(e => (
              <div key={e.id} className="timeline-item">
                <span className="timeline-dot" />
                <p className="timeline-year">{e.year}</p>
                <h3 className="timeline-title">{e.title}</h3>
                <p className="timeline-org">{e.org}</p>
                {e.desc && <p className="timeline-desc">{e.desc}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
