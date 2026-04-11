import type { Metadata } from 'next'
import { ContactForm }   from '@/components/ContactForm'
import { LiquidGlass } from '@/components/LiquidGlass'
import { getPortfolioData } from '@/lib/portfolio'

export const metadata: Metadata = {
  title: 'Contact — Thamo',
  description: 'Get in touch for project inquiries and collaborations.',
}

export default async function ContactPage() {
  const { profile } = await getPortfolioData()
  const linkedinHandle = new URL(profile.linkedinUrl).pathname.replace(/^\/+/, '')

  return (
    <section className="page">
      <div className="contact-layout">
        <LiquidGlass className="contact-info" interactive>
          <h1 className="contact-heading">
            Let&apos;s <em>Work<br />Together</em>
          </h1>
          <p className="contact-sub">
            Have a project in mind or want to discuss an opportunity?
            I'd love to hear from you.
          </p>
          <div className="contact-links">
            <a href={`mailto:${profile.email}`} className="contact-link">
              <span className="link-icon">✉</span>
              {profile.email}
            </a>
            <a href={profile.githubUrl} className="contact-link" target="_blank" rel="noreferrer">
              <span className="link-icon">⌥</span>
              github.com/{profile.githubUsername}
            </a>
            <a href={profile.linkedinUrl} className="contact-link" target="_blank" rel="noreferrer">
              <span className="link-icon">◎</span>
              {linkedinHandle}
            </a>
            <a href={profile.coffeeUrl} className="contact-link" target="_blank" rel="noreferrer">
              <span className="link-icon">☕</span>
              Buy me a coffee
            </a>
          </div>
        </LiquidGlass>

        <div>
          <ContactForm />
        </div>
      </div>
    </section>
  )
}
