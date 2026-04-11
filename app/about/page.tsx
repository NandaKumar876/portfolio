import type { Metadata } from 'next'
import Link from 'next/link'
import { LiquidGlass } from '@/components/LiquidGlass'
import { getGitHubStats } from '@/lib/github'
import { getPortfolioData } from '@/lib/portfolio'

export const metadata: Metadata = {
  title: 'About — Thamo',
  description: 'About Thamo, the current role, stack, and public credentials.',
}

export default async function AboutPage() {
  const [content, githubStats] = await Promise.all([
    getPortfolioData(),
    getGitHubStats(),
  ])

  const { profile, certificates, resume } = content

  return (
    <section className="page">
      <p className="sec-label">Background</p>
      <h2 className="sec-heading">About <em>Me</em></h2>

      <div className="about-layout">
        <LiquidGlass className="about-copy" interactive>
          <p className="about-body">
            {profile.bio}
          </p>
          <p className="about-body">
            I’m based in {profile.location} and focus on precise interfaces, resilient APIs, and motion-rich product experiences.
          </p>
          <p className="about-body">
            {profile.availability}
          </p>

          <div className="hero-actions">
            <a href="/api/resume" className="btn-glass" target="_blank" rel="noreferrer">
              View Resume
            </a>
            <Link href="/certificates" className="btn-ghost">
              Certificates
            </Link>
          </div>
        </LiquidGlass>

        <div className="about-side">
          <div className="stat-list">
            <div className="stat-row">
              <span className="stat-label">Role</span>
              <span className="stat-value">{profile.role}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">GitHub streak</span>
              <span className="stat-value">{githubStats ? githubStats.currentStreak : '—'}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Certificates</span>
              <span className="stat-value">{certificates.length}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Resume</span>
              <span className="stat-value">{resume.fileUrl ? 'Live' : 'Pending'}</span>
            </div>
          </div>

          <div className="about-grid">
            <LiquidGlass className="feature-card" interactive>
              <div className="feature-title">Liquid UI craft</div>
              <div className="feature-desc">
                Interfaces with depth, refraction, and a clear hierarchy that still feel fast on mobile.
              </div>
            </LiquidGlass>
            <LiquidGlass className="feature-card" interactive>
              <div className="feature-title">Ambient motion</div>
              <div className="feature-desc">
                Subtle gradients and layered glass keep the page feeling alive without visual clutter.
              </div>
            </LiquidGlass>
            <LiquidGlass className="feature-card" interactive>
              <div className="feature-title">Redis-backed admin</div>
              <div className="feature-desc">
                Edit your public profile, resume, certificates, and inbox without touching code.
              </div>
            </LiquidGlass>
          </div>
        </div>
      </div>
    </section>
  )
}
