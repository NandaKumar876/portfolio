import type { Metadata } from 'next'
import { ContactForm }   from '@/components/ContactForm'

export const metadata: Metadata = {
  title: 'Contact — Thamo',
  description: 'Get in touch for project inquiries and collaborations.',
}

export default function ContactPage() {
  return (
    <section className="page">
      <div className="contact-layout">
        {/* Left */}
        <div className="contact-info fade-in">
          <h1 className="contact-heading">
            Let's <em>Work<br />Together</em>
          </h1>
          <p className="contact-sub">
            Have a project in mind or want to discuss an opportunity?
            I'd love to hear from you.
          </p>
          <div className="contact-links">
            <a href="mailto:thamo@example.com" className="contact-link">
              <span className="link-icon">✉</span>
              thamo@example.com
            </a>
            <a href="https://github.com/thamo" className="contact-link" target="_blank" rel="noreferrer">
              <span className="link-icon">⌥</span>
              github.com/thamo
            </a>
            <a href="https://linkedin.com/in/thamo" className="contact-link" target="_blank" rel="noreferrer">
              <span className="link-icon">◎</span>
              linkedin.com/in/thamo
            </a>
          </div>
        </div>

        {/* Right — client component handles form state */}
        <div className="fade-in" style={{ animationDelay: '0.1s' }}>
          <ContactForm />
        </div>
      </div>
    </section>
  )
}
