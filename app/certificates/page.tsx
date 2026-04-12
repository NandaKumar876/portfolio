import type { Metadata } from 'next'
import Link from 'next/link'
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
      <p className="sec-label">Certificates</p>
      <h1 className="sec-heading">Proof of <em>Practice</em></h1>

      <div className="page-note">
        Upload new certificates from the admin panel and they will appear here automatically.
      </div>

      <div className="certificate-grid">
        {certificates.length ? certificates.map(cert => (
          <LiquidGlass key={cert.id} className="certificate-card" interactive>
            <p className="admin-card-badge">{cert.year}</p>
            <h2 className="admin-card-title">{cert.title}</h2>
            <p className="resume-role">{cert.issuer}</p>
            {cert.description && <p className="about-body">{cert.description}</p>}
            {cert.fileUrl ? (
              <a href={cert.fileUrl} target="_blank" rel="noreferrer" className="project-link">
                Open certificate ↗
              </a>
            ) : (
              <span className="admin-empty">Uploaded without a file preview.</span>
            )}
          </LiquidGlass>
        )) : (
          <LiquidGlass className="certificate-empty" interactive>
            <p className="admin-empty admin-empty--large">
              No certificates uploaded yet. Add your first certificate from the admin page.
            </p>
            <Link href="/dashboard-thamo7" className="btn-glass">
              Go to Admin
            </Link>
          </LiquidGlass>
        )}
      </div>
    </section>
  )
}
