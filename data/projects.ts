export interface Feature { title: string; description: string }

export interface Project {
  id:          string
  slug:        string
  index:       string
  title:       string
  description: string
  tags:        string[]
  year:        string
  features:    Feature[]
  liveUrl?:    string
  repoUrl?:    string
}

export const PROJECTS: Project[] = [
  {
    id: 'thamo-portfolio',
    slug: 'thamo-portfolio',
    index: '01',
    title: 'Portfolio',
    year: '2025',
    description: 'This very site — a liquid-glass portfolio built with Next.js 15, Redis-backed admin, and Apple-inspired physics for every surface.',
    tags: ['React', 'Node'],
    repoUrl: 'https://github.com/thamothara7/Portfolio',
    features: [
      { title: 'Liquid Glass UI', description: 'Apple-inspired glass surfaces with caustic shimmer, directional borders, and mouse-reactive radial gradients.' },
      { title: 'Redis-Backed Admin', description: 'Edit profile, upload resume, manage certificates, and read inbox messages without touching code.' },
      { title: 'GitHub Streak', description: 'Live contribution streak pulled from the GitHub GraphQL API and surfaced on the hero and about pages.' },
      { title: 'Contact to Redis', description: 'Contact form submissions stored in Redis lists with a 50-message rolling window.' },
    ],
  },
]
