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
    id: 'smart-reasoning-system-ai',
    slug: 'smart-reasoning-system-ai',
    index: '01',
    title: 'ReasonAI — Smart Reasoning System',
    year: '2026',
    description: 'An AI-powered problem-solving engine that deconstructs complex queries into transparent, step-by-step logic chains using structured output, schema validation, and interactive logging.',
    tags: ['Next.js', 'Claude API', 'Supabase', 'TypeScript'],
    repoUrl: 'https://github.com/NandaKumar876/Smart-Reasoning-System-AI',
    features: [
      { title: 'Structured Reasoning', description: 'Decomposes complex problems into transparent logic chains (decompose → analyze → reason → conclude).' },
      { title: 'Claude & Zod Validation', description: 'Integrates Anthropic Claude models with strict Zod schemas to ensure deterministic, parsed outputs.' },
      { title: 'Supabase Data Lake', description: 'Persists user sessions, event history, and execution metrics securely in PostgreSQL with Row-Level Security (RLS).' },
      { title: 'Admin Command Center', description: 'A built-in dashboard featuring system metrics, real-time logging, and dynamic runtime model configuration.' },
    ],
  },
  {
    id: 'air-draw',
    slug: 'air-draw',
    index: '02',
    title: 'Neon Air Draw — AI Spatial Interface',
    year: '2026',
    description: 'A high-performance WebGL and MediaPipe hand tracking application enabling dual-hand gesture-controlled air drawing and spatial manipulation.',
    tags: ['React', 'MediaPipe', 'WebGL', 'Framer Motion'],
    repoUrl: 'https://github.com/NandaKumar876/Air-draw',
    features: [
      { title: 'Dual-Hand Interactions', description: 'Draw and erase with your dominant hand while translating, scaling, and rotating canvases with your non-dominant hand.' },
      { title: 'WebGL Canvas Render', description: 'A custom, high-performance rendering pipeline engineered for 60FPS fluid drawing without performance degradation.' },
      { title: 'Non-Destructive Math', description: 'Retains raw coordinate data and applies spatial transforms at render-time using matrix math and smooth inertia.' },
      { title: 'Glassmorphic HUD', description: 'A sleek, premium Apple-style interface with real-time feedback guides, tooltips, and interactive manuals.' },
    ],
  },
  {
    id: 'speedxsafety',
    slug: 'speedxsafety',
    index: '03',
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
  {
    id: 'nanda-portfolio',
    slug: 'nanda-portfolio',
    index: '04',
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
]
