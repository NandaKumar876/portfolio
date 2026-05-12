import type { Metadata } from 'next'
import { WorkClient }    from './WorkClient'
import { getProjects }   from '@/lib/projects'

export const metadata: Metadata = {
  title: 'Work — Thamo',
  description: 'An index of selected projects by Thamothara Natarajan.',
}

export default async function WorkPage() {
  const projects = await getProjects()
  return <WorkClient projects={projects} />
}
