import type { Metadata } from 'next'
import { LiquidGlass } from '@/components/LiquidGlass'
import { getPortfolioData } from '@/lib/portfolio'

export const metadata: Metadata = {
  title: 'Certificates — Thamo',
  description: 'Browse uploaded certificates and credentials.',
}

export default async function CertificatesPage() {
  const { certificates } = await getPortfolioData()

  return (
    <section className="page">
      <p className="sec-label">Credentials</p>
      <h1 className="sec-heading">Proof of <em>practice</em></h1>

      <p className="page-note">
        A growing collection of certifications, course completions, and credentials.
        New uploads appear here automatically.
      </p>

      <div className="certificate-grid">
        {certificates.length ? certificates.map(cert => (
          <LiquidGlass key={cert.id} className="certificate-card" interactive>
            <span className="admin-card-badge">{cert.year}</span>
            <h2 className="admin-card-title">{cert.title}</h2>
            <p className="resume-role">{cert.issuer}</p>
            {cert.description && <p className="about-body" style={{ marginBottom: 0 }}>{cert.description}</p>}
            {cert.fileUrl ? (
              <a href={`/api/certificates/${cert.id}`} target="_blank" rel="noreferrer" className="project-link" style={{ marginTop: 'auto' }}>
                Open certificate →
              </a>
            ) : (
              <span className="admin-empty" style={{ marginTop: 'auto' }}>No file preview attached.</span>
            )}
          </LiquidGlass>
        )) : (
          <LiquidGlass className="certificate-empty" interactive>
            <p className="admin-empty admin-empty--large">
              No certificates uploaded yet. Add your first certificate from the admin dashboard.
            </p>
          </LiquidGlass>
        )}
      </div>
    </section>
  )
}
