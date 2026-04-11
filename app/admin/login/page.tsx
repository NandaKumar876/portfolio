import type { Metadata } from 'next'
import { LiquidGlass } from '@/components/LiquidGlass'

export const metadata: Metadata = {
  title: 'Admin Login — Thamo',
  description: 'Sign in to manage portfolio content.',
}

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string
    next?: string
  }>
}

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const nextPath = typeof params?.next === 'string' ? params.next : '/admin'
  const error = params?.error

  return (
    <section className="page admin-login-page">
      <LiquidGlass className="admin-login-card" interactive>
        <p className="sec-label">Admin Access</p>
        <h1 className="contact-heading">
          Sign in to <em>edit</em>
        </h1>
        <p className="contact-sub">
          Use the admin credentials from your environment variables to unlock the dashboard.
        </p>

        {error && <p className="admin-status admin-status--error">Invalid username or password.</p>}

        <form className="admin-form" action={`/api/admin/login?next=${encodeURIComponent(nextPath)}`} method="post">
          <label className="field-label">
            Username
            <input className="field-input" name="username" defaultValue="admin" autoComplete="username" />
          </label>

          <label className="field-label">
            Password
            <input className="field-input" name="password" type="password" autoComplete="current-password" />
          </label>

          <button type="submit" className="btn-submit">
            Enter Dashboard
          </button>
        </form>
      </LiquidGlass>
    </section>
  )
}
