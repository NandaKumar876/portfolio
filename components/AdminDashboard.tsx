'use client'

import { useState, type ChangeEvent, type Dispatch, type FormEvent, type SetStateAction } from 'react'
import Link from 'next/link'
import { LiquidGlass } from './LiquidGlass'
import type { ContactSubmission } from '@/lib/contacts'
import type { Certificate, PortfolioData, ProfileUpdateInput, ResumeAsset } from '@/lib/portfolio'

type AdminDashboardProps = {
  initialContent: PortfolioData
  inbox: ContactSubmission[]
}

function toProfileForm(profile: PortfolioData['profile']): ProfileUpdateInput {
  return {
    heroLabel: profile.heroLabel,
    name: profile.name,
    role: profile.role,
    headline: profile.headline,
    location: profile.location,
    availability: profile.availability,
    bio: profile.bio,
    email: profile.email,
    githubUsername: profile.githubUsername,
    resumeSummary: profile.resumeSummary,
    linkedinUrl: profile.linkedinUrl,
    githubUrl: profile.githubUrl,
    xUrl: profile.xUrl,
    coffeeUrl: profile.coffeeUrl,
  }
}

function formatDate(value: string) {
  if (!value) return 'Just now'
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function fieldStateSetter(
  setProfile: Dispatch<SetStateAction<ProfileUpdateInput>>,
  key: keyof ProfileUpdateInput,
) {
  return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.currentTarget.value
    setProfile(prev => ({ ...prev, [key]: value }))
  }
}

export function AdminDashboard({ initialContent, inbox }: AdminDashboardProps) {
  const [profile, setProfile] = useState<ProfileUpdateInput>(() => toProfileForm(initialContent.profile))
  const [resume, setResume] = useState<ResumeAsset>(initialContent.resume)
  const [certificates, setCertificates] = useState<Certificate[]>(initialContent.certificates)
  const [profileStatus, setProfileStatus] = useState<string | null>(null)
  const [resumeStatus, setResumeStatus] = useState<string | null>(null)
  const [certificateStatus, setCertificateStatus] = useState<string | null>(null)

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setProfileStatus('Saving profile...')

    const response = await fetch('/api/admin/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    })

    const data = await response.json()
    if (!response.ok) {
      const issues = data?.issues ? Object.values(data.issues).flat().filter(Boolean).join(' · ') : data?.error
      setProfileStatus(issues || 'Unable to save profile.')
      return
    }

    setProfileStatus('Profile saved to Redis.')
  }

  async function uploadResume(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setResumeStatus('Uploading resume...')

    const formData = new FormData(event.currentTarget)
    const response = await fetch('/api/admin/resume', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()
    if (!response.ok) {
      setResumeStatus(data?.error || 'Unable to upload resume.')
      return
    }

    setResume(data.resume)
    setResumeStatus('Resume uploaded successfully.')
    event.currentTarget.reset()
  }

  async function uploadCertificate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setCertificateStatus('Uploading certificate...')

    const formData = new FormData(event.currentTarget)
    const response = await fetch('/api/admin/certificates', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()
    if (!response.ok) {
      setCertificateStatus(data?.error || 'Unable to upload certificate.')
      return
    }

    setCertificates(prev => [data.certificate, ...prev])
    setCertificateStatus('Certificate added to your portfolio.')
    event.currentTarget.reset()
  }

  async function deleteCertificate(id: string) {
    setCertificateStatus('Removing certificate...')

    const response = await fetch(`/api/admin/certificates?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })

    const data = await response.json()
    if (!response.ok) {
      setCertificateStatus(data?.error || 'Unable to delete certificate.')
      return
    }

    setCertificates(prev => prev.filter(item => item.id !== id))
    setCertificateStatus('Certificate removed.')
  }

  return (
    <div className="admin-shell">
      <div className="admin-hero">
        <div>
          <p className="sec-label">Admin Console</p>
          <h1 className="contact-heading">
            Edit your <em>portfolio</em>
          </h1>
          <p className="contact-sub">
            Update your public information in Redis, upload your resume, and manage certificates from one place.
          </p>
        </div>

        <div className="admin-actions">
          <Link href="/" className="btn-ghost">
            View Site
          </Link>
          <form action="/api/admin/logout" method="post">
            <button type="submit" className="btn-glass admin-logout">
              Log Out
            </button>
          </form>
        </div>
      </div>

      <div className="admin-stats">
        <LiquidGlass className="admin-stat" interactive>
          <span className="admin-stat-label">Profile</span>
          <strong className="admin-stat-value">{profile.name}</strong>
          <span className="admin-stat-meta">{profile.headline}</span>
        </LiquidGlass>
        <LiquidGlass className="admin-stat" interactive>
          <span className="admin-stat-label">Resume</span>
          <strong className="admin-stat-value">{resume.fileUrl ? 'Live' : 'Pending'}</strong>
          <span className="admin-stat-meta">{resume.fileName || 'Upload your latest PDF'}</span>
        </LiquidGlass>
        <LiquidGlass className="admin-stat" interactive>
          <span className="admin-stat-label">Certificates</span>
          <strong className="admin-stat-value">{certificates.length}</strong>
          <span className="admin-stat-meta">Uploaded and visible on the public page</span>
        </LiquidGlass>
        <LiquidGlass className="admin-stat" interactive>
          <span className="admin-stat-label">Inbox</span>
          <strong className="admin-stat-value">{inbox.length}</strong>
          <span className="admin-stat-meta">Latest contact messages stored in Redis</span>
        </LiquidGlass>
      </div>

      <div className="admin-grid">
        <LiquidGlass className="admin-card" interactive>
          <div className="card-topline">
            <div>
              <p className="sec-label">Public Profile</p>
              <h2 className="admin-card-title">Identity & links</h2>
            </div>
            <span className="admin-card-badge">Redis</span>
          </div>

          <form className="admin-form" onSubmit={saveProfile}>
            <div className="form-grid">
              <label className="field-label">
                Hero label
                <input className="field-input" name="heroLabel" value={profile.heroLabel} onChange={fieldStateSetter(setProfile, 'heroLabel')} />
              </label>
              <label className="field-label">
                Name
                <input className="field-input" name="name" value={profile.name} onChange={fieldStateSetter(setProfile, 'name')} />
              </label>
              <label className="field-label">
                Role
                <input className="field-input" name="role" value={profile.role} onChange={fieldStateSetter(setProfile, 'role')} />
              </label>
              <label className="field-label">
                Headline
                <input className="field-input" name="headline" value={profile.headline} onChange={fieldStateSetter(setProfile, 'headline')} />
              </label>
              <label className="field-label">
                Location
                <input className="field-input" name="location" value={profile.location} onChange={fieldStateSetter(setProfile, 'location')} />
              </label>
              <label className="field-label">
                Availability
                <input className="field-input" name="availability" value={profile.availability} onChange={fieldStateSetter(setProfile, 'availability')} />
              </label>
              <label className="field-label">
                Email
                <input className="field-input" name="email" type="email" value={profile.email} onChange={fieldStateSetter(setProfile, 'email')} />
              </label>
              <label className="field-label">
                GitHub username
                <input className="field-input" name="githubUsername" value={profile.githubUsername} onChange={fieldStateSetter(setProfile, 'githubUsername')} />
              </label>
            </div>

            <label className="field-label">
              Bio
              <textarea className="field-input field-textarea" name="bio" value={profile.bio} onChange={fieldStateSetter(setProfile, 'bio')} />
            </label>

            <label className="field-label">
              Resume summary
              <textarea className="field-input field-textarea" name="resumeSummary" value={profile.resumeSummary} onChange={fieldStateSetter(setProfile, 'resumeSummary')} />
            </label>

            <div className="form-grid">
              <label className="field-label">
                LinkedIn
                <input className="field-input" name="linkedinUrl" value={profile.linkedinUrl} onChange={fieldStateSetter(setProfile, 'linkedinUrl')} />
              </label>
              <label className="field-label">
                GitHub
                <input className="field-input" name="githubUrl" value={profile.githubUrl} onChange={fieldStateSetter(setProfile, 'githubUrl')} />
              </label>
              <label className="field-label">
                X
                <input className="field-input" name="xUrl" value={profile.xUrl} onChange={fieldStateSetter(setProfile, 'xUrl')} />
              </label>
              <label className="field-label">
                Buy me a coffee
                <input className="field-input" name="coffeeUrl" value={profile.coffeeUrl} onChange={fieldStateSetter(setProfile, 'coffeeUrl')} />
              </label>
            </div>

            {profileStatus && <p className="admin-status">{profileStatus}</p>}

            <button type="submit" className="btn-submit">
              Save Profile
            </button>
          </form>
        </LiquidGlass>

        <LiquidGlass className="admin-card" interactive>
          <div className="card-topline">
            <div>
              <p className="sec-label">Resume</p>
              <h2 className="admin-card-title">Upload your PDF</h2>
            </div>
            <span className="admin-card-badge">Public</span>
          </div>

          <p className="admin-copy">
            The public resume page will embed the latest PDF automatically.
          </p>

          <div className="admin-preview">
            <span className="admin-preview-label">Current file</span>
            <strong>{resume.fileName || 'No resume uploaded yet'}</strong>
            <span>{resume.uploadedAt ? formatDate(resume.uploadedAt) : 'Waiting for upload'}</span>
            {resume.fileUrl && (
              <a href={resume.fileUrl} target="_blank" rel="noreferrer" className="project-link">
                Open resume ↗
              </a>
            )}
          </div>

          <form className="admin-form" onSubmit={uploadResume}>
            <label className="field-label">
              Resume PDF
              <input className="field-input" name="resume" type="file" accept="application/pdf" />
            </label>

            {resumeStatus && <p className="admin-status">{resumeStatus}</p>}

            <button type="submit" className="btn-submit">
              Upload Resume
            </button>
          </form>
        </LiquidGlass>

        <LiquidGlass className="admin-card" interactive>
          <div className="card-topline">
            <div>
              <p className="sec-label">Certificates</p>
              <h2 className="admin-card-title">Upload proof of skill</h2>
            </div>
            <span className="admin-card-badge">{certificates.length} live</span>
          </div>

          <form className="admin-form" onSubmit={uploadCertificate}>
            <div className="form-grid">
              <label className="field-label">
                Title
                <input className="field-input" name="title" placeholder="Certificate title" />
              </label>
              <label className="field-label">
                Issuer
                <input className="field-input" name="issuer" placeholder="Issuing platform" />
              </label>
              <label className="field-label">
                Year
                <input className="field-input" name="year" placeholder="2026" />
              </label>
              <label className="field-label">
                File
                <input className="field-input" name="file" type="file" accept="application/pdf,image/*" />
              </label>
            </div>

            <label className="field-label">
              Description
              <textarea className="field-input field-textarea" name="description" placeholder="Short note about what this certificate covers." />
            </label>

            {certificateStatus && <p className="admin-status">{certificateStatus}</p>}

            <button type="submit" className="btn-submit">
              Add Certificate
            </button>
          </form>

          <div className="admin-list">
            {certificates.length ? certificates.map(cert => (
              <article key={cert.id} className="admin-list-item">
                <div>
                  <span className="admin-preview-label">{cert.year}</span>
                  <h3>{cert.title}</h3>
                  <p>{cert.issuer}</p>
                  {cert.description && <p className="admin-list-desc">{cert.description}</p>}
                  {cert.fileUrl && (
                    <a href={cert.fileUrl} target="_blank" rel="noreferrer" className="project-link">
                      View file ↗
                    </a>
                  )}
                </div>
                <button type="button" className="filter-btn" onClick={() => deleteCertificate(cert.id)}>
                  Delete
                </button>
              </article>
            )) : (
              <p className="admin-empty">No certificates uploaded yet.</p>
            )}
          </div>
        </LiquidGlass>

        <LiquidGlass className="admin-card" interactive>
          <div className="card-topline">
            <div>
              <p className="sec-label">Inbox</p>
              <h2 className="admin-card-title">Recent messages</h2>
            </div>
            <span className="admin-card-badge">{inbox.length}</span>
          </div>

          <div className="admin-list">
            {inbox.length ? inbox.map(item => (
              <article key={item.id} className="admin-message">
                <div className="admin-message-head">
                  <strong>{item.name}</strong>
                  <span>{formatDate(item.createdAt)}</span>
                </div>
                <p className="admin-message-subject">{item.subject}</p>
                <p className="admin-message-body">{item.message}</p>
                <a href={`mailto:${item.email}`} className="project-link">
                  Reply by email ↗
                </a>
              </article>
            )) : (
              <p className="admin-empty">No contact submissions yet.</p>
            )}
          </div>
        </LiquidGlass>
      </div>
    </div>
  )
}
