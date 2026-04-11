import type { Metadata } from 'next'
import { AdminDashboard } from '@/components/AdminDashboard'
import { getPortfolioData } from '@/lib/portfolio'
import { getRecentContacts } from '@/lib/contacts'

export const metadata: Metadata = {
  title: 'Admin — Thamo',
  description: 'Portfolio admin console for profile, resume, certificates, and inbox management.',
}

export default async function AdminPage() {
  const [content, inbox] = await Promise.all([
    getPortfolioData(),
    getRecentContacts(8),
  ])

  return (
    <section className="page admin-page">
      <AdminDashboard initialContent={content} inbox={inbox} />
    </section>
  )
}

