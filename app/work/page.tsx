import type { Metadata } from 'next'
import { WorkClient }    from './WorkClient'
import { getProjects }   from '@/lib/projects'

export const metadata: Metadata = {
  title: 'Work',
  description: 'An index of selected projects by Nanda Kumar R.',
}

export default async function WorkPage() {
  const projects = await getProjects()
  return <WorkClient projects={projects} />
}
