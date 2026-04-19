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
              <span className="link-icon">
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M0 3v18h24v-18h-24zm6.623 7.929l-4.623 5.712v-9.458l4.623 3.746zm-4.141-5.929h19.035l-9.517 7.713-9.518-7.713zm5.694 7.188l3.824 3.099 3.83-3.104 5.612 8.188h-18.782l5.516-8.183zm9.861-1.259l4.586-3.715v9.423l-4.586-5.708z"/></svg>
              </span>
              {profile.email}
            </a>
            <a href={profile.githubUrl} className="contact-link" target="_blank" rel="noreferrer">
              <span className="link-icon">
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </span>
              github.com/{profile.githubUsername}
            </a>
            <a href={profile.linkedinUrl} className="contact-link" target="_blank" rel="noreferrer">
              <span className="link-icon">
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </span>
              {linkedinHandle}
            </a>
            <a href={profile.coffeeUrl} className="contact-link" target="_blank" rel="noreferrer">
              <span className="link-icon">
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M2.5 19H20c.3 0 .5.2.5.5s-.2.5-.5.5H2.5c-.3 0-.5-.2-.5-.5s.2-.5.5-.5zM3.8 2c-.4 0-.8.3-.8.7v10.1c0 2.2 1.8 4.1 4.1 4.1h7.8c2.2 0 4.1-1.8 4.1-4.1V6.2h1.6c1.2 0 2.1-.9 2.1-2.1s-.9-2.1-2.1-2.1H3.8zm15 3.1h-1.6V3.1h1.6c.6 0 1 .4 1 1s-.4 1-1 1zm-2.6 7.7c0 1.7-1.4 3.1-3.1 3.1H7.1c-1.7 0-3.1-1.4-3.1-3.1V3.1h13.2v9.7z"/></svg>
              </span>
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
