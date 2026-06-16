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
    id: 'nanda-portfolio',
    slug: 'nanda-portfolio',
    index: '01',
    title: 'Portfolio',
    year: '2025',
    description: 'This very site — a liquid-glass portfolio built with Next.js 16, Redis-backed admin, and Apple-inspired physics for every surface.',
    tags: ['React', 'Node'],
    repoUrl: 'https://github.com/NandaKumar876/Portfolio',
    features: [
      { title: 'Liquid Glass UI', description: 'Apple-inspired glass surfaces with caustic shimmer, directional borders, and mouse-reactive radial gradients.' },
      { title: 'Redis-Backed Admin', description: 'Edit profile, upload resume, manage certificates, and read inbox messages without touching code.' },
      { title: 'GitHub Streak', description: 'Live contribution streak pulled from the GitHub GraphQL API and surfaced on the hero and about pages.' },
      { title: 'Contact to Redis', description: 'Contact form submissions stored in Redis lists with a 50-message rolling window.' },
    ],
  },
  {
    id: 'speedxsafety',
    slug: 'speedxsafety',
    index: '02',
    title: 'SpeedxSafety',
    year: '2026',
    description: 'A robust mobile application designed to ensure the safety of teen drivers, featuring role-based dashboards and real-time monitoring.',
    tags: ['React Native', 'Expo', 'Backend'],
    repoUrl: 'https://github.com/NandaKumar876/speedxsafety',
    features: [
      { title: 'Role-Based Dashboards', description: 'Dedicated interfaces for Parents and Teens to provide appropriate controls and visibility.' },
      { title: 'Real-Time Monitoring', description: 'Real-time telemetry tracking and trip data processing to ensure driving safety.' },
      { title: 'Liquid Glass Aesthetic', description: 'Features a dynamic, premium UI with a liquid glass aesthetic.' },
    ],
  },
]
