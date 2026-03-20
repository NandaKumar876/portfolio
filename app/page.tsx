import Link         from 'next/link'
import { Typewriter } from '@/components/Typewriter'
import { LiquidGlass } from '@/components/LiquidGlass'

const SKILLS = [
  'React','TypeScript','Next.js','Node.js',
  'TanStack','Tailwind','PostgreSQL','Three.js','Figma',
]

export default function Home() {
  return (
    <section className="page page--hero">
      {/* Eyebrow */}
      <div className="eyebrow">
        <span className="status-dot" />
        <span className="eyebrow-text">Available for projects — 2025</span>
      </div>

      {/* Name */}
      <h1 className="hero-name">
        Thamo
        <em>Developer.</em>
      </h1>

      {/* Animated role */}
      <Typewriter />

      {/* Bio */}
      <p className="hero-bio">
        Building precise, performant digital products at the intersection of
        design and engineering. Every pixel intentional, every byte justified.
      </p>

      {/* CTAs */}
      <div className="hero-actions">
        <LiquidGlass as="a" href="/work" className="btn-glass">
          View Work
        </LiquidGlass>
        <Link href="/contact" className="btn-ghost">
          Get in Touch
        </Link>
      </div>

      {/* Skills */}
      <div className="skills-row">
        {SKILLS.map(s => (
          <span key={s} className="skill-pill">{s}</span>
        ))}
      </div>
    </section>
  )
}
