import type { Metadata } from 'next'
import Link from 'next/link'
import { LiquidGlass } from '@/components/LiquidGlass'
import { getPortfolioData } from '@/lib/portfolio'

export const metadata: Metadata = {
  title: 'About — Thamo',
  description: 'Thamothara Natarajan — Full Stack Developer from Chennai. Stack, experience, education, and interests.',
}

const STACK = {
  Languages: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Go'],
  Frontend: ['React', 'Next.js', 'Tailwind CSS', 'Framer Motion', 'HTML5', 'CSS3', 'Vite', 'Vue.js'],
  Backend: ['Node.js', 'Express.js', 'FastAPI', 'Django', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Firebase'],
  'DevOps & Cloud': ['Docker', 'Kubernetes', 'AWS', 'Google Cloud', 'Vercel', 'Git', 'GitHub'],
  Design: ['Figma', 'Photoshop', 'Final Cut Pro'],
  DSA: ['LeetCode — 20+ problems', 'Arrays', 'Trees', 'Graphs', 'Dynamic Programming'],
}

const CURRENTLY = [
  { label: 'Learning', value: 'Advanced React + System Design' },
  { label: 'Building', value: 'Portfolio v3 · KNK Trip Cart' },
  { label: 'Exploring', value: 'Web3 · AI Agents · Hackathons' },
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
            <Link href="/certificates" className="btn-glass">View Certificates</Link>
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

          {/* Social Links */}
          <LiquidGlass className="social-card" style={{ marginTop: 20 }} interactive>
            <p className="sec-label" style={{ marginBottom: 16 }}>Connect</p>
            <div className="social-links-grid">
              <a href={profile.githubUrl} className="social-link" target="_blank" rel="noreferrer">
                <span className="social-icon-wrapper">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                </span>
                <div className="social-text">
                  <span className="social-platform">GitHub</span>
                  <span className="social-handle">{profile.githubUsername}</span>
                </div>
              </a>
              <a href={profile.linkedinUrl} className="social-link" target="_blank" rel="noreferrer">
                <span className="social-icon-wrapper">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </span>
                <div className="social-text">
                  <span className="social-platform">LinkedIn</span>
                  <span className="social-handle">{new URL(profile.linkedinUrl).pathname.replace(/^\/+/, '')}</span>
                </div>
              </a>
              <a href={profile.xUrl} className="social-link" target="_blank" rel="noreferrer">
                <span className="social-icon-wrapper">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </span>
                <div className="social-text">
                  <span className="social-platform">X / Twitter</span>
                  <span className="social-handle">@{new URL(profile.xUrl).pathname.replace(/^\/+/, '')}</span>
                </div>
              </a>
              <a href="https://leetcode.com/u/thamothara/" className="social-link" target="_blank" rel="noreferrer" id="social">
                <span className="social-icon-wrapper">
                  <img src="/leetcode-brands-solid-full.svg" alt="LeetCode" />
                </span>
                <div className="social-text">
                  <span className="social-platform">LeetCode</span>
                  <span className="social-handle">thamothara</span>
                </div>
              </a>
            </div>
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
