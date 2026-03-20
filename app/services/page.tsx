import type { Metadata } from 'next'
import { SERVICES }      from '@/data/services'
import { LiquidGlass }   from '@/components/LiquidGlass'

export const metadata: Metadata = {
  title: 'Services — Thamo',
  description: 'Design engineering, full-stack development, and technical consulting.',
}

export default function ServicesPage() {
  return (
    <section className="page">
      <p className="sec-label">What I Do</p>
      <h2 className="sec-heading">
        Services &amp; <em>Expertise</em>
      </h2>

      <div className="services-grid">
        {SERVICES.map((svc, i) => (
          <LiquidGlass
            key={svc.id}
            className="service-card fade-in"
            style={{ animationDelay: `${i * 0.09}s` } as React.CSSProperties}
            interactive
          >
            <span className="service-glyph">{svc.glyph}</span>
            <h3 className="service-name">{svc.name}</h3>
            <p className="service-desc">{svc.description}</p>
            <ul className="service-list">
              {svc.items.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </LiquidGlass>
        ))}
      </div>
    </section>
  )
}
