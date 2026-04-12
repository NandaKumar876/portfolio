import { z } from 'zod'
import { hasRedisUrl, getRedisClient } from './redis'

/* ── Schemas ── */
export const ProfileUpdateSchema = z.object({
  heroLabel: z.string().min(1),
  name: z.string().min(1),
  role: z.string().min(1),
  headline: z.string().min(1),
  location: z.string().min(1),
  availability: z.string().min(1),
  bio: z.string().min(20),
  email: z.string().email(),
  githubUsername: z.string().min(1),
  resumeSummary: z.string().min(20),
  linkedinUrl: z.string().url(),
  githubUrl: z.string().url(),
  xUrl: z.string().url(),
  coffeeUrl: z.string().url(),
})

export const ProfileSchema = ProfileUpdateSchema.extend({
  resumeLabel: z.string().min(1),
})

export const ResumeSchema = z.object({
  fileUrl: z.string(),
  fileName: z.string(),
  uploadedAt: z.string(),
  mimeType: z.string().optional(),
})

export const CertificateSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  issuer: z.string().min(1),
  year: z.string().min(1),
  description: z.string().min(1).optional(),
  fileUrl: z.string().optional(),
  fileName: z.string().optional(),
  uploadedAt: z.string(),
})

export const ExperienceItemSchema = z.object({
  id: z.string(),
  year: z.string().min(1),
  title: z.string().min(1),
  org: z.string().min(1),
  desc: z.string().optional(),
})

export const EducationItemSchema = z.object({
  id: z.string(),
  year: z.string().min(1),
  title: z.string().min(1),
  org: z.string().min(1),
  desc: z.string().optional(),
})

export const PortfolioSchema = z.object({
  profile: ProfileSchema,
  resume: ResumeSchema,
  certificates: z.array(CertificateSchema),
  experience: z.array(ExperienceItemSchema),
  education: z.array(EducationItemSchema),
})

export type Profile = z.infer<typeof ProfileSchema>
export type PortfolioData = z.infer<typeof PortfolioSchema>
export type Certificate = z.infer<typeof CertificateSchema>
export type ResumeAsset = z.infer<typeof ResumeSchema>
export type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>
export type ExperienceItem = z.infer<typeof ExperienceItemSchema>
export type EducationItem = z.infer<typeof EducationItemSchema>

export const DEFAULT_PORTFOLIO: PortfolioData = {
  profile: {
    heroLabel: `Available for projects — ${new Date().getFullYear()}`,
    name: 'Thamothara',
    role: 'Full Stack Developer',
    headline: 'Developer',
    location: 'Chennai, Tamil Nadu 🇮🇳',
    availability: 'Open for select projects, consulting, hackathons, and product collaborations.',
    bio: 'Building precise, performant digital products at the intersection of design and engineering. Every pixel intentional, every byte justified.',
    email: 'thamothara2017@gmail.com',
    githubUsername: 'thamothara7',
    resumeSummary: 'Full Stack Developer skilled in React, Next.js, Node.js, Python, and cloud tooling — pairing fast execution with a strong eye for motion and clarity.',
    linkedinUrl: 'https://www.linkedin.com/in/thamotharanatarajan/',
    githubUrl: 'https://github.com/thamothara7',
    xUrl: 'https://x.com/ThamotharaNata1',
    coffeeUrl: 'https://buymeacoffee.com/thamothara7',
    resumeLabel: 'Resume',
  },
  resume: { fileUrl: '', fileName: '', uploadedAt: '', mimeType: '' },
  certificates: [],
  experience: [
    {
      id: 'lazai-ambassador',
      year: 'Oct 2025 – Present',
      title: 'Dev Ambassador',
      org: 'LazAI Network · India',
      desc: 'Representing LazAI in the developer community — building, writing, and promoting decentralised AI tooling.',
    },
  ],
  education: [
    {
      id: 'anna-university',
      year: 'Sep 2024 – Sep 2028',
      title: 'B.E. Computer Science',
      org: 'Anna University Chennai',
      desc: 'Bachelor of Engineering — pursuing foundations in algorithms, distributed systems, and software engineering.',
    },
    {
      id: 'ordnance-clothing',
      year: 'Class 10',
      title: 'Board Examinations',
      org: 'Ordnance Clothing Factory Avadi',
      desc: '',
    },
    {
      id: 'thangamani-matric',
      year: 'Senior Secondary',
      title: 'Higher Secondary',
      org: 'Thangamani Matriculation Higher Secondary School',
      desc: '',
    },
  ],
}

const PORTFOLIO_KEY = 'portfolio:content:v1'

function mergePortfolio(value: Partial<PortfolioData> | null | undefined): PortfolioData {
  const profile = {
    ...DEFAULT_PORTFOLIO.profile,
    ...(value?.profile ?? {}),
  }

  if (/ambassador/i.test(profile.headline)) {
    profile.headline = 'Developer'
  }

  return {
    profile,
    resume: { ...DEFAULT_PORTFOLIO.resume, ...(value?.resume ?? {}) },
    certificates: value?.certificates ?? DEFAULT_PORTFOLIO.certificates,
    experience: value?.experience ?? DEFAULT_PORTFOLIO.experience,
    education: value?.education ?? DEFAULT_PORTFOLIO.education,
  }
}

export async function getPortfolioData(): Promise<PortfolioData> {
  if (!hasRedisUrl()) return DEFAULT_PORTFOLIO

  try {
    const client = await getRedisClient()
    if (!client) return DEFAULT_PORTFOLIO

    const raw = await client.get(PORTFOLIO_KEY)
    if (!raw) {
      await client.set(PORTFOLIO_KEY, JSON.stringify(DEFAULT_PORTFOLIO))
      return DEFAULT_PORTFOLIO
    }

    const parsed = PortfolioSchema.safeParse(JSON.parse(raw))
    if (!parsed.success) {
      // Merge partial data gracefully
      try {
        const partial = JSON.parse(raw) as Partial<PortfolioData>
        return mergePortfolio(partial)
      } catch {
        await client.set(PORTFOLIO_KEY, JSON.stringify(DEFAULT_PORTFOLIO))
        return DEFAULT_PORTFOLIO
      }
    }

    return mergePortfolio(parsed.data)
  } catch (error) {
    console.error('Failed to read portfolio data', error)
    return DEFAULT_PORTFOLIO
  }
}

export async function savePortfolioData(data: PortfolioData) {
  const client = await getRedisClient()
  if (!client) {
    throw new Error('Redis is not configured. Set REDIS_URL to persist portfolio edits.')
  }
  await client.set(PORTFOLIO_KEY, JSON.stringify(data))
  return data
}

export async function updateProfile(input: ProfileUpdateInput) {
  const profile = ProfileUpdateSchema.parse(input)
  const current = await getPortfolioData()
  return savePortfolioData({
    ...current,
    profile: { ...current.profile, ...profile, resumeLabel: current.profile.resumeLabel },
  })
}

export async function updateResume(resume: ResumeAsset) {
  const current = await getPortfolioData()
  return savePortfolioData({ ...current, resume })
}

export async function addCertificate(certificate: Certificate) {
  const current = await getPortfolioData()
  return savePortfolioData({ ...current, certificates: [certificate, ...current.certificates] })
}

export async function removeCertificate(id: string) {
  const current = await getPortfolioData()
  return savePortfolioData({ ...current, certificates: current.certificates.filter(c => c.id !== id) })
}

export async function updateExperience(experience: ExperienceItem[]) {
  const current = await getPortfolioData()
  return savePortfolioData({ ...current, experience })
}

export async function updateEducation(education: EducationItem[]) {
  const current = await getPortfolioData()
  return savePortfolioData({ ...current, education })
}
