import type { Metadata }  from 'next'
import { WorkClient }     from './WorkClient'
import { PROJECTS }       from '@/data/projects'

export const metadata: Metadata = {
  title: 'Work — Thamo',
  description: 'Selected projects in React, Node, Three.js, AI and Design.',
}

/* Server component — passes static data to client island */
export default function WorkPage() {
  return (
    <section className="page">
      <p className="sec-label">Selected Work</p>
      <h2 className="sec-heading">Projects</h2>
      <WorkClient projects={PROJECTS} />
    </section>
  )
}
