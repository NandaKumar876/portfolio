import type { Metadata } from 'next'
import { getPortfolioData } from '@/lib/portfolio'
import { getGitHubCalendar } from '@/lib/github'
import { GitHubHeatmap } from '@/components/GitHubHeatmap'
import { LiquidGlass } from '@/components/LiquidGlass'

export const metadata: Metadata = {
  title: 'Certificates — Nanda',
  description: 'Certifications and credentials of Nanda Kumar R.',
}

export default async function CertificatesPage() {
  const [ { certificates }, calendar ] = await Promise.all([
    getPortfolioData(),
    getGitHubCalendar()
  ])

  return (
    <section className="page certs-page">

      <header className="certs-hero">
        <p className="certs-hero-eyebrow">
          <span className="certs-hero-mark" aria-hidden="true">§</span>
          Credentials
        </p>
        <h1 className="certs-hero-title">Proof of practice</h1>
        <p className="certs-hero-lede">
          Certifications and course completions, most recent first. New uploads
          appear here automatically.
        </p>
      </header>

      {calendar && (
        <section style={{ marginBottom: '48px' }}>
          <LiquidGlass className="heatmap-glass" interactive={false}>
            <GitHubHeatmap
              weeks={calendar.weeks}
              totalContributions={calendar.totalContributions}
            />
          </LiquidGlass>
        </section>
      )}

      {certificates.length > 0 ? (
        <ol className="certs-list">
          {certificates.map((cert, i) => (
            <li key={cert.id} className="certs-row">
              <span className="certs-row-num" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="certs-row-body">
                <div className="certs-row-head">
                  <h2 className="certs-row-title">{cert.title}</h2>
                  <span className="certs-row-year">{cert.year}</span>
                </div>
                <p className="certs-row-issuer">{cert.issuer}</p>
                {cert.description && (
                  <p className="certs-row-desc">{cert.description}</p>
                )}
              </div>
              {cert.fileUrl && (
                <a
                  href={`/api/certificates/${cert.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="certs-row-link"
                  aria-label={`Open ${cert.title}`}
                >
                  Open <span aria-hidden="true">↗</span>
                </a>
              )}
            </li>
          ))}
        </ol>
      ) : (
        <p className="certs-empty">
          No certificates uploaded yet &mdash; they&rsquo;ll appear here once added
          from the admin dashboard.
        </p>
      )}
    </section>
  )
}
