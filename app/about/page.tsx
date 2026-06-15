import type { Metadata } from 'next'
import Image from 'next/image'
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

        <aside className="about-profile-card flex flex-col items-center" aria-label="Profile summary">

          {/* ── Portrait photo card ── */}
          <div className="relative group w-full max-w-[220px] mx-auto mb-8">

            {/* Teal accent border — sits behind, stays fixed on hover */}
            <div className="absolute inset-0 rounded-[20px] border border-teal-400/30 translate-x-1 translate-y-1 z-0" />

            {/* Main photo card — lifts on hover */}
            <div className="relative z-10 rounded-[20px] overflow-hidden border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.25)] group-hover:-translate-y-1 group-hover:shadow-[0_16px_48px_rgba(0,0,0,0.35)] transition-all duration-300 ease-out">
              <Image
                src="/images/profile.jpg"
                alt="Nanda Kumar R — Full Stack Developer"
                width={220}
                height={240}
                priority
                className="object-cover object-top w-full h-[240px]"
              />
            </div>

            {/* Floating status badge — bottom-center, does not move on hover */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#0f1a17] border border-teal-400/30 text-teal-400 shadow-[0_4px_12px_rgba(0,0,0,0.3)] whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              Open to Work
            </div>
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
