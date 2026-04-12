import type { Metadata } from 'next'
import { WorkClient }    from './WorkClient'
import { getProjects }   from '@/lib/projects'

export const metadata: Metadata = {
  title: 'Work — Thamo',
  description: 'Selected projects by Thamothara Natarajan — React, Node, AI and Design.',
}

export default async function WorkPage() {
  const projects = await getProjects()
  return (
    <section className="page">
      <p className="sec-label">Selected Work</p>
      <h2 className="sec-heading">Projects</h2>
      <WorkClient projects={projects} />
    </section>
  )
}
