import type { Metadata } from 'next'
import Link from 'next/link'
import { getPortfolioData } from '@/lib/portfolio'

export const metadata: Metadata = {
  title: 'About',
  description: 'Nanda Kumar R — Full Stack Developer based in Chennai. Stack, work, education and tangents.',
}

const STARTED_BUILDING = 2022

const STACK_GROUPS = [
  {
    label: 'Languages',
    items: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Go'],
  },
  {
    label: 'Frontend',
    items: ['React', 'Next.js', 'Tailwind CSS', 'HTML5', 'CSS3', 'Vite', 'Vue.js'],
  },
  {
    label: 'Backend',
    items: ['Node.js', 'Express', 'FastAPI', 'Django', 'PostgreSQL', 'MongoDB', 'Redis'],
  },
  {
    label: 'Cloud',
    items: ['Docker', 'Kubernetes', 'AWS', 'Google Cloud', 'Vercel', 'GitHub Actions'],
  },
  {
    label: 'Design',
    items: ['Figma', 'Photoshop', 'Final Cut Pro', 'Interface polish'],
  },
] as const

const CURRENTLY = [
  { label: 'Learning', value: 'Advanced React, systems design, and production-grade API patterns.' },
  { label: 'Building', value: 'Portfolio v3, KNK Trip Cart, and experiments around useful AI tooling.' },
  { label: 'Exploring', value: 'Web3, AI agents, hackathon sprints, and sharper product storytelling.' },
] as const

const PRINCIPLES = [
  { label: 'Fast first', text: 'Interfaces should feel immediate before they look impressive.' },
  { label: 'Readable systems', text: 'I prefer boring architecture, clear names, and code future me can debug.' },
  { label: 'Polish matters', text: 'Tiny layout decisions, copy, focus states, and loading paths all count.' },
] as const

const INTERESTS = [
  'Open source contributions',
  'Hackathon sprints',
  'Useful side projects',
  'Blockchain × AI crossovers',
] as const

function profilePath(url: string) {
  return new URL(url).pathname.replace(/^\/+|\/+$/g, '')
}

export default async function AboutPage() {
  const { profile, experience, education } = await getPortfolioData()
  const cleanLocation = profile.location.replace(/[\u{1F1E6}-\u{1F1FF}]{2}/gu, '').trim()
  const yearsBuilding = new Date().getFullYear() - STARTED_BUILDING
  const linkedinHandle = profilePath(profile.linkedinUrl)
  const xHandle = profilePath(profile.xUrl)

  return (
    <section className="page about-page">
      <header className="about-cover">
        <div className="about-cover-copy">
          <p className="about-kicker">
            <span aria-hidden="true">§</span>
            About / Developer profile
          </p>
          <h1 className="about-cover-title">
            Software with a <em>clear pulse</em>
          </h1>
          <p className="about-cover-lede">
            I&rsquo;m Nanda Kumar R, a full stack developer in {cleanLocation}.
            I build web products that are quick to use, simple to reason about,
            and polished enough that people trust them before reading the docs.
          </p>
          <div className="about-cover-actions">
            <Link href="/work" className="btn-glass">See the work</Link>
            <Link href="/contact" className="btn-ghost">Start a conversation</Link>
          </div>
        </div>

        <aside className="about-profile-card" aria-label="Profile summary">
          <div className="about-profile-top">
            <span className="about-profile-code">NK</span>
            <span className="about-profile-status">
              <span className="status-dot" aria-hidden="true" />
              open to work
            </span>
          </div>
          <p className="about-profile-name">Nanda</p>
          <dl className="about-profile-facts">
            <div>
              <dt>Role</dt>
              <dd>{profile.role}</dd>
            </div>
            <div>
              <dt>Base</dt>
              <dd>{cleanLocation}</dd>
            </div>
            <div>
              <dt>Focus</dt>
              <dd>Full stack web, APIs, product polish</dd>
            </div>
          </dl>
        </aside>
      </header>

      <section className="about-signal-grid" aria-label="Profile signals">
        <div className="about-signal">
          <span className="about-signal-value">{yearsBuilding}+</span>
          <span className="about-signal-label">years building</span>
        </div>
        <div className="about-signal">
          <span className="about-signal-value">{experience.length.toString().padStart(2, '0')}</span>
          <span className="about-signal-label">experience entries</span>
        </div>
        <div className="about-signal">
          <span className="about-signal-value">{STACK_GROUPS.length.toString().padStart(2, '0')}</span>
          <span className="about-signal-label">skill lanes</span>
        </div>
      </section>

      <section className="about-story-grid">
        <article className="about-story-card">
          <p className="about-section-tag">01 / Working style</p>
          <h2 className="about-story-title">Careful software, shipped without theatre.</h2>
          <div className="about-story-prose">
            <p>{profile.bio}</p>
            <p>{profile.availability}</p>
          </div>
        </article>

        <aside className="about-now-card">
          <p className="about-section-tag">Now</p>
          <dl>
            {CURRENTLY.map(item => (
              <div key={item.label}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </section>

      <section className="about-principles" aria-label="Working principles">
        {PRINCIPLES.map((principle, index) => (
          <article key={principle.label} className="about-principle">
            <span>{String(index + 1).padStart(2, '0')}</span>
            <h3>{principle.label}</h3>
            <p>{principle.text}</p>
          </article>
        ))}
      </section>

      <section className="about-stack-section">
        <div className="about-block-head">
          <p className="about-section-tag">02 / Stack</p>
          <h2>Tools in daily rotation.</h2>
          <p>Not exhaustive. This is the practical stack that shows up across my projects most often.</p>
        </div>
        <div className="about-stack-board">
          {STACK_GROUPS.map(group => (
            <article key={group.label} className="about-stack-card">
              <h3>{group.label}</h3>
              <div>
                {group.items.map(item => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="about-path-grid">
        {experience.length > 0 && (
          <article className="about-path-card">
            <div className="about-block-head">
              <p className="about-section-tag">03 / Path</p>
              <h2>Experience</h2>
            </div>
            <ol className="about-path-list">
              {experience.map(item => (
                <li key={item.id}>
                  <span>{item.year}</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.org}</p>
                    {item.desc && <p>{item.desc}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </article>
        )}

        {education.length > 0 && (
          <article className="about-path-card">
            <div className="about-block-head">
              <p className="about-section-tag">04 / Education</p>
              <h2>Schooling</h2>
            </div>
            <ol className="about-path-list">
              {education.map(item => (
                <li key={item.id}>
                  <span>{item.year}</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.org}</p>
                    {item.desc && <p>{item.desc}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </article>
        )}
      </section>

      <section className="about-closing-grid">
        <article className="about-interest-card">
          <p className="about-section-tag">05 / Off keyboard</p>
          <h2>Side quests</h2>
          <ul>
            {INTERESTS.map(interest => <li key={interest}>{interest}</li>)}
          </ul>
        </article>

        <article className="about-links-card">
          <p className="about-section-tag">Elsewhere</p>
          <a href={profile.githubUrl} target="_blank" rel="noreferrer">
            <span>GitHub</span>
            <strong>{profile.githubUsername}</strong>
          </a>
          <a href={profile.linkedinUrl} target="_blank" rel="noreferrer">
            <span>LinkedIn</span>
            <strong>{linkedinHandle}</strong>
          </a>
          <a href={profile.xUrl} target="_blank" rel="noreferrer">
            <span>X</span>
            <strong>@{xHandle}</strong>
          </a>
          <a href={`mailto:${profile.email}`}>
            <span>Email</span>
            <strong>{profile.email}</strong>
          </a>
        </article>
      </section>
    </section>
  )
}
