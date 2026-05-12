import type { Metadata } from 'next'
import Link from 'next/link'
import { getPortfolioData } from '@/lib/portfolio'

export const metadata: Metadata = {
  title: 'About — Thamo',
  description: 'Thamothara Natarajan — Full Stack Developer based in Chennai. Stack, work, education and tangents.',
}

const STACK: Record<string, string[]> = {
  Languages: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Go'],
  Frontend: ['React', 'Next.js', 'Tailwind CSS', 'Framer Motion', 'HTML5', 'CSS3', 'Vite', 'Vue.js'],
  Backend: ['Node.js', 'Express', 'FastAPI', 'Django', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Firebase'],
  Cloud: ['Docker', 'Kubernetes', 'AWS', 'Google Cloud', 'Vercel', 'Git', 'GitHub'],
  Design: ['Figma', 'Photoshop', 'Final Cut Pro'],
  Algorithms: ['LeetCode 20+ problems', 'Arrays', 'Trees', 'Graphs', 'Dynamic Programming'],
}

const CURRENTLY = [
  { label: 'Learning',  value: 'Advanced React & system design.' },
  { label: 'Building',  value: 'Portfolio v3 and KNK Trip Cart.' },
  { label: 'Exploring', value: 'Web3, AI agents, weekend hackathons.' },
]

const INTERESTS = [
  'Open source contributions',
  'Hackathon sprints',
  'Building useful side projects',
  'Blockchain × AI crossovers',
]

function NumberHead({ index, eyebrow, title, accent }: {
  index: string
  eyebrow: string
  title: React.ReactNode
  accent?: string
}) {
  return (
    <div className="about-section-head">
      <p className="about-section-eyebrow">
        <span className="about-section-num">{index}</span>
        <span className="about-section-dot" aria-hidden="true">·</span>
        {eyebrow}
      </p>
      <h2 className="about-section-title">{title}</h2>
      {accent && <p className="about-section-accent">{accent}</p>}
    </div>
  )
}

export default async function AboutPage() {
  const { profile, experience, education } = await getPortfolioData()
  const cleanLocation = profile.location.replace(/[\u{1F1E6}-\u{1F1FF}]{2}/gu, '').trim()

  return (
    <section className="page about-page">

      {/* ─── HERO ─── */}
      <header className="about-hero">
        <p className="about-hero-eyebrow">
          <span className="about-hero-mark" aria-hidden="true">§</span>
          About the author
        </p>
        <h1 className="about-hero-title">
          A short biography of <em>Thamothara Natarajan</em>
        </h1>
        <p className="about-hero-lede">
          Developer in {cleanLocation}. Building careful software,
          one repository at a time &mdash; mostly for the web, occasionally
          for fun.
        </p>
        <div className="about-hero-meta">
          <span>{profile.role}</span>
          <span className="about-hero-meta-sep" aria-hidden="true">·</span>
          <span>{cleanLocation}</span>
          <span className="about-hero-meta-sep" aria-hidden="true">·</span>
          <span className="about-hero-meta-status">
            <span className="status-dot" aria-hidden="true" />
            open to work
          </span>
        </div>
      </header>

      {/* ─── 01 · THE SHORT VERSION ─── */}
      <article className="about-section">
        <NumberHead
          index="01"
          eyebrow="The short version"
          title={<>If you only read <em>one paragraph</em></>}
        />
        <div className="about-prose">
          <p className="about-prose-paragraph about-prose-paragraph--first">
            <span className="about-prose-dropcap">H</span>i &mdash; I&rsquo;m Thamothara, though
            most people just call me Thamo. {profile.bio}
          </p>
          <p className="about-prose-paragraph">{profile.availability}</p>
          <div className="about-prose-actions">
            <a href="/api/resume" className="btn-glass" target="_blank" rel="noreferrer">
              View Resume
            </a>
            <Link href="/certificates" className="btn-ghost">Certificates</Link>
            <Link href="/contact" className="btn-ghost">Get in touch</Link>
          </div>
        </div>
      </article>

      {/* ─── 02 · CURRENTLY ─── */}
      <article className="about-section">
        <NumberHead
          index="02"
          eyebrow="Currently"
          title={<>What I&rsquo;m up to <em>right now</em></>}
        />
        <dl className="about-currently">
          {CURRENTLY.map(c => (
            <div key={c.label} className="about-currently-row">
              <dt className="about-currently-label">{c.label}</dt>
              <dd className="about-currently-value">{c.value}</dd>
            </div>
          ))}
        </dl>
      </article>

      {/* ─── 03 · THE ARSENAL ─── */}
      <article className="about-section">
        <NumberHead
          index="03"
          eyebrow="The Arsenal"
          title={<>Tools <em>in daily rotation</em></>}
          accent="Not exhaustive &mdash; just what shows up in my projects most often."
        />
        <div className="about-stack">
          {Object.entries(STACK).map(([category, techs]) => (
            <div key={category} className="about-stack-row">
              <p className="about-stack-cat">{category}</p>
              <div className="about-stack-pills">
                {techs.map(t => (
                  <span key={t} className="about-stack-pill">{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </article>

      {/* ─── 04 · THE PATH (experience) ─── */}
      {experience.length > 0 && (
        <article className="about-section">
          <NumberHead
            index="04"
            eyebrow="The Path"
            title={<>Where I&rsquo;ve <em>worked</em></>}
          />
          <ol className="about-timeline">
            {experience.map(e => (
              <li key={e.id} className="about-timeline-item">
                <span className="about-timeline-year">{e.year}</span>
                <div className="about-timeline-body">
                  <h3 className="about-timeline-title">{e.title}</h3>
                  <p className="about-timeline-org">{e.org}</p>
                  {e.desc && <p className="about-timeline-desc">{e.desc}</p>}
                </div>
              </li>
            ))}
          </ol>
        </article>
      )}

      {/* ─── 05 · SCHOOLING ─── */}
      {education.length > 0 && (
        <article className="about-section">
          <NumberHead
            index="05"
            eyebrow="Schooling"
            title={<>Where I <em>studied</em></>}
          />
          <ol className="about-timeline">
            {education.map(e => (
              <li key={e.id} className="about-timeline-item">
                <span className="about-timeline-year">{e.year}</span>
                <div className="about-timeline-body">
                  <h3 className="about-timeline-title">{e.title}</h3>
                  <p className="about-timeline-org">{e.org}</p>
                  {e.desc && <p className="about-timeline-desc">{e.desc}</p>}
                </div>
              </li>
            ))}
          </ol>
        </article>
      )}

      {/* ─── 06 · TANGENTS ─── */}
      <article className="about-section">
        <NumberHead
          index="06"
          eyebrow="Tangents"
          title={<>Beyond the <em>keyboard</em></>}
        />
        <div className="about-tangents">
          <div className="about-tangent">
            <p className="about-tangent-label">Interests</p>
            <ul className="about-interests">
              {INTERESTS.map(item => (
                <li key={item} className="about-interest">{item}</li>
              ))}
            </ul>
          </div>
          <div className="about-tangent">
            <p className="about-tangent-label">Fun fact</p>
            <p className="about-funfact">
              I name my side projects <em>before</em> I start them.
            </p>
          </div>
        </div>
      </article>

      {/* ─── 07 · FIND ME ELSEWHERE ─── */}
      <article className="about-section">
        <NumberHead
          index="07"
          eyebrow="Elsewhere"
          title={<>Find me <em>on the internet</em></>}
        />
        <div className="about-socials">
          <a href={profile.githubUrl} className="about-social" target="_blank" rel="noreferrer">
            <span className="about-social-platform">GitHub</span>
            <span className="about-social-handle">{profile.githubUsername}</span>
            <span className="about-social-arrow" aria-hidden="true">↗</span>
          </a>
          <a href={profile.linkedinUrl} className="about-social" target="_blank" rel="noreferrer">
            <span className="about-social-platform">LinkedIn</span>
            <span className="about-social-handle">{new URL(profile.linkedinUrl).pathname.replace(/^\/+/, '')}</span>
            <span className="about-social-arrow" aria-hidden="true">↗</span>
          </a>
          <a href={profile.xUrl} className="about-social" target="_blank" rel="noreferrer">
            <span className="about-social-platform">X / Twitter</span>
            <span className="about-social-handle">@{new URL(profile.xUrl).pathname.replace(/^\/+/, '')}</span>
            <span className="about-social-arrow" aria-hidden="true">↗</span>
          </a>
          <a href="https://leetcode.com/u/thamothara/" className="about-social" target="_blank" rel="noreferrer">
            <span className="about-social-platform">LeetCode</span>
            <span className="about-social-handle">thamothara</span>
            <span className="about-social-arrow" aria-hidden="true">↗</span>
          </a>
          <a href={`mailto:${profile.email}`} className="about-social">
            <span className="about-social-platform">Email</span>
            <span className="about-social-handle">{profile.email}</span>
            <span className="about-social-arrow" aria-hidden="true">→</span>
          </a>
        </div>
      </article>

      {/* ─── CLOSING ─── */}
      <footer className="about-foot">
        <span className="about-foot-line" aria-hidden="true" />
        <p className="about-foot-text">
          That&rsquo;s about it. <Link href="/contact">Say hello</Link> if you&rsquo;d like to talk shop.
        </p>
      </footer>
    </section>
  )
}
