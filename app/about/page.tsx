import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About — Thamo',
  description: 'Background, timeline, and approach.',
}

const TIMELINE = [
  { year:'2024', title:'Senior Frontend Developer', org:'TechCorp Inc.',    desc:'Led core product redesign. Improved performance by 60%, mentored four engineers.' },
  { year:'2023', title:'Full Stack Developer',       org:'Startup XYZ',     desc:'Built scalable APIs and React apps serving 50,000+ daily users.' },
  { year:'2022', title:'Frontend Developer',         org:'Creative Agency', desc:'Delivered precise interfaces for 20+ clients across fintech and e-commerce.' },
  { year:'2021', title:'B.Sc. Computer Science',     org:'State University', desc:'Graduated with honours — thesis on HCI and adaptive interface design.' },
]

const STATS = [
  { label:'Projects delivered',     value:'30+' },
  { label:'Years of practice',      value:'4'   },
  { label:'Open source PRs',        value:'80+' },
  { label:'Happy clients',          value:'24'  },
]

export default function AboutPage() {
  return (
    <section className="page">
      <p className="sec-label">Background</p>
      <h2 className="sec-heading">About <em>Me</em></h2>

      <div className="about-cols">
        {/* Left */}
        <div className="about-left">
          <p className="about-body">
            I'm a full-stack developer with a lean toward front-end craft.
            I care about the details most people won't notice — until they're missing.
          </p>
          <p className="about-body">
            Currently deep in the React / Next.js ecosystem, building products
            that scale, and contributing to open source where I can.
          </p>
          <p className="about-body">
            Based in Chennai, India. Available for remote work globally.
          </p>

          <div className="stat-list">
            {STATS.map(s => (
              <div key={s.label} className="stat-row">
                <span className="stat-label">{s.label}</span>
                <span className="stat-value">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="timeline">
          {TIMELINE.map(item => (
            <div key={item.year} className="timeline-item">
              <div className="timeline-dot" />
              <p  className="timeline-year">{item.year}</p>
              <h3 className="timeline-title">{item.title}</h3>
              <p  className="timeline-org">{item.org}</p>
              <p  className="timeline-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
