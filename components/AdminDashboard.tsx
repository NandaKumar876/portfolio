'use client'

import { useState, useRef, type ChangeEvent, type Dispatch, type FormEvent, type SetStateAction } from 'react'
import { LiquidGlass } from './LiquidGlass'
import type { Certificate, PortfolioData, ProfileUpdateInput, ResumeAsset, ExperienceItem, EducationItem } from '@/lib/portfolio'
import type { AdminProject } from '@/lib/projects'

type AdminDashboardProps = {
  initialContent: PortfolioData
  initialProjects: AdminProject[]
}

function toProfileForm(profile: PortfolioData['profile']): ProfileUpdateInput {
  return {
    heroLabel: profile.heroLabel, name: profile.name, role: profile.role,
    headline: profile.headline, location: profile.location, availability: profile.availability,
    bio: profile.bio, email: profile.email, githubUsername: profile.githubUsername,
    resumeSummary: profile.resumeSummary, linkedinUrl: profile.linkedinUrl,
    githubUrl: profile.githubUrl, xUrl: profile.xUrl, coffeeUrl: profile.coffeeUrl,
  }
}

type TimelineItem = { id: string; year: string; title: string; org: string; desc?: string }
const EMPTY_TIMELINE = { year: '', title: '', org: '', desc: '' }

function formatDate(value: string) {
  if (!value) return 'Just now'
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit',
  }).format(new Date(value))
}

function fieldStateSetter(
  setProfile: Dispatch<SetStateAction<ProfileUpdateInput>>,
  key: keyof ProfileUpdateInput,
) {
  return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile(prev => ({ ...prev, [key]: event.currentTarget.value }))
  }
}

/* ── Timeline card (reusable for Experience + Education) ── */
function TimelineAdmin({
  label, endpoint, items, setItems,
}: {
  label: string
  endpoint: string
  items: TimelineItem[]
  setItems: (items: TimelineItem[]) => void
}) {
  const [form, setForm] = useState(EMPTY_TIMELINE)
  const [editing, setEditing] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  function startEdit(item: TimelineItem) {
    setEditing(item.id)
    setForm({ year: item.year, title: item.title, org: item.org, desc: item.desc ?? '' })
  }

  function reset() {
    setEditing(null)
    setForm(EMPTY_TIMELINE)
  }

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus(editing ? 'Updating...' : 'Adding...')
    const url = editing ? `${endpoint}?id=${editing}` : endpoint
    const res = await fetch(url, {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) { setStatus(data?.error || 'Error'); return }
    const key = label === 'Experience' ? 'experience' : 'education'
    setItems(data[key])
    setStatus(editing ? 'Updated.' : 'Added.')
    reset()
  }

  async function handleDelete(id: string) {
    setStatus('Deleting...')
    const res = await fetch(`${endpoint}?id=${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) { setStatus(data?.error || 'Error'); return }
    const key = label === 'Experience' ? 'experience' : 'education'
    setItems(data[key])
    setStatus('Deleted.')
  }

  return (
    <LiquidGlass className="admin-card" interactive>
      <div className="card-topline">
        <div>
          <p className="sec-label">{label}</p>
          <h2 className="admin-card-title">{editing ? `Editing entry` : `Add ${label}`}</h2>
        </div>
        <span className="admin-card-badge">{items.length} entries</span>
      </div>

      <form className="admin-form" onSubmit={handleSave}>
        <div className="form-grid">
          <label className="field-label">Year / Period *
            <input className="field-input" required placeholder="2025 – Present" value={form.year}
              onChange={e => setForm(p => ({ ...p, year: e.target.value }))} />
          </label>
          <label className="field-label">Title *
            <input className="field-input" required placeholder="Role or degree" value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          </label>
          <label className="field-label" style={{ gridColumn: '1/-1' }}>Organisation *
            <input className="field-input" required placeholder="Company or institution" value={form.org}
              onChange={e => setForm(p => ({ ...p, org: e.target.value }))} />
          </label>
        </div>
        <label className="field-label">Description
          <textarea className="field-input field-textarea" value={form.desc}
            onChange={e => setForm(p => ({ ...p, desc: e.target.value }))} />
        </label>
        {status && <p className="admin-status">{status}</p>}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="submit" className="btn-submit" style={{ flex: 1 }}>
            {editing ? `Update ${label}` : `Add ${label}`}
          </button>
          {editing && <button type="button" className="btn-ghost" onClick={reset}>Cancel</button>}
        </div>
      </form>

      <div className="admin-list">
        {items.length === 0 && <p className="admin-empty">No entries yet.</p>}
        {items.map(item => (
          <article key={item.id} className="admin-list-item">
            <div>
              <span className="admin-preview-label">{item.year}</span>
              <h3>{item.title}</h3>
              <p>{item.org}</p>
              {item.desc && <p className="admin-list-desc">{item.desc}</p>}
            </div>
            <div style={{ display: 'flex', gap: 8, flexDirection: 'column', flexShrink: 0 }}>
              <button type="button" className="filter-btn" onClick={() => startEdit(item)}>Edit</button>
              <button type="button" className="filter-btn" onClick={() => handleDelete(item.id)}>Delete</button>
            </div>
          </article>
        ))}
      </div>
    </LiquidGlass>
  )
}

/* ══════════════════════════════════════════════
   MAIN ADMIN DASHBOARD
   ══════════════════════════════════════════════ */
export function AdminDashboard({ initialContent, initialProjects }: AdminDashboardProps) {
  const [profile, setProfile] = useState<ProfileUpdateInput>(() => toProfileForm(initialContent.profile))
  const [resume, setResume] = useState<ResumeAsset>(initialContent.resume)
  const [certificates, setCertificates] = useState<Certificate[]>(initialContent.certificates)
  const [experience, setExperience] = useState<ExperienceItem[]>(initialContent.experience)
  const [education, setEducation] = useState<EducationItem[]>(initialContent.education)
  const [profileStatus, setProfileStatus] = useState<string | null>(null)
  const [resumeStatus, setResumeStatus] = useState<string | null>(null)
  const [certificateStatus, setCertificateStatus] = useState<string | null>(null)
  const [projects, setProjects] = useState<AdminProject[]>(initialProjects)
  const [projectStatus, setProjectStatus] = useState<string | null>(null)
  const [editingProject, setEditingProject] = useState<AdminProject | null>(null)
  const [projectForm, setProjectForm] = useState({
    title: '', slug: '', description: '', year: String(new Date().getFullYear()),
    tags: '', repoUrl: '', liveUrl: '',
    feature1Title: '', feature1Desc: '',
    feature2Title: '', feature2Desc: '',
    feature3Title: '', feature3Desc: '',
    feature4Title: '', feature4Desc: '',
  })
  const projectFormRef = useRef<HTMLFormElement>(null)

  /* ── Profile ── */
  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setProfileStatus('Saving profile...')
    const response = await fetch('/api/admin/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    })
    const data = await response.json()
    if (!response.ok) { setProfileStatus(data?.error || 'Unable to save.'); return }
    setProfileStatus('Profile saved.')
  }

  /* ── Resume ── */
  async function uploadResume(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formEl = event.currentTarget
    setResumeStatus('Uploading resume...')
    const body = new FormData(formEl)
    const response = await fetch('/api/admin/resume', { method: 'POST', body })
    const data = await response.json()
    if (!response.ok) { setResumeStatus(data?.error || 'Upload failed.'); return }
    setResume(data.resume)
    setResumeStatus('Resume uploaded.')
    formEl.reset()
  }

  async function removeResume() {
    setResumeStatus('Removing resume...')
    const response = await fetch('/api/admin/resume', { method: 'DELETE' })
    const data = await response.json()
    if (!response.ok) { setResumeStatus(data?.error || 'Failed to remove.'); return }
    setResume(data.resume)
    setResumeStatus('Resume removed.')
  }

  /* ── Certificates ── */
  async function uploadCertificate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formEl = event.currentTarget
    setCertificateStatus('Uploading certificate...')
    const body = new FormData(formEl)
    const response = await fetch('/api/admin/certificates', { method: 'POST', body })
    const data = await response.json()
    if (!response.ok) { setCertificateStatus(data?.error || 'Upload failed.'); return }
    setCertificates(prev => [data.certificate, ...prev])
    setCertificateStatus('Certificate added.')
    formEl.reset()
  }

  async function deleteCertificate(id: string) {
    setCertificateStatus('Removing certificate...')
    const response = await fetch(`/api/admin/certificates?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
    const data = await response.json()
    if (!response.ok) { setCertificateStatus(data?.error || 'Unable to delete.'); return }
    setCertificates(prev => prev.filter(item => item.id !== id))
    setCertificateStatus('Certificate removed.')
  }

  /* ── Projects ── */
  function startEditProject(p: AdminProject) {
    setEditingProject(p)
    setProjectForm({
      title: p.title, slug: p.slug, description: p.description, year: p.year,
      tags: p.tags.join(', '), repoUrl: p.repoUrl ?? '', liveUrl: p.liveUrl ?? '',
      feature1Title: p.features[0]?.title ?? '', feature1Desc: p.features[0]?.description ?? '',
      feature2Title: p.features[1]?.title ?? '', feature2Desc: p.features[1]?.description ?? '',
      feature3Title: p.features[2]?.title ?? '', feature3Desc: p.features[2]?.description ?? '',
      feature4Title: p.features[3]?.title ?? '', feature4Desc: p.features[3]?.description ?? '',
    })
  }

  function clearProjectForm() {
    setEditingProject(null)
    setProjectForm({
      title: '', slug: '', description: '', year: String(new Date().getFullYear()),
      tags: '', repoUrl: '', liveUrl: '',
      feature1Title: '', feature1Desc: '',
      feature2Title: '', feature2Desc: '',
      feature3Title: '', feature3Desc: '',
      feature4Title: '', feature4Desc: '',
    })
    projectFormRef.current?.reset()
  }

  async function saveProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setProjectStatus(editingProject ? 'Updating project...' : 'Creating project...')
    const features = [
      projectForm.feature1Title && { title: projectForm.feature1Title, description: projectForm.feature1Desc },
      projectForm.feature2Title && { title: projectForm.feature2Title, description: projectForm.feature2Desc },
      projectForm.feature3Title && { title: projectForm.feature3Title, description: projectForm.feature3Desc },
      projectForm.feature4Title && { title: projectForm.feature4Title, description: projectForm.feature4Desc },
    ].filter(Boolean)
    const body = {
      title: projectForm.title,
      slug: projectForm.slug || projectForm.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      description: projectForm.description, year: projectForm.year,
      tags: projectForm.tags.split(',').map(t => t.trim()).filter(Boolean),
      repoUrl: projectForm.repoUrl || undefined,
      liveUrl: projectForm.liveUrl || undefined,
      features,
    }
    const url = editingProject ? `/api/admin/projects?id=${encodeURIComponent(editingProject.id)}` : '/api/admin/projects'
    const response = await fetch(url, {
      method: editingProject ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await response.json()
    if (!response.ok) { setProjectStatus(data?.error || 'Unable to save project.'); return }
    if (editingProject) {
      setProjects(prev => prev.map(p => p.id === editingProject.id ? data.project : p))
      setProjectStatus('Project updated.')
    } else {
      setProjects(prev => [data.project, ...prev])
      setProjectStatus('Project created.')
    }
    clearProjectForm()
  }

  async function deleteProjectById(id: string) {
    setProjectStatus('Deleting...')
    const response = await fetch(`/api/admin/projects?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
    const data = await response.json()
    if (!response.ok) { setProjectStatus(data?.error || 'Unable to delete.'); return }
    setProjects(prev => prev.filter(p => p.id !== id))
    setProjectStatus('Project deleted.')
  }

  return (
    <div className="admin-shell">
      <div className="admin-hero">
        <div>
          <p className="sec-label">Admin Console</p>
          <h1 className="contact-heading">Edit your <em>portfolio</em></h1>
          <p className="contact-sub">All changes are persisted to Redis immediately.</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="admin-stats">
        <LiquidGlass className="admin-stat" interactive>
          <span className="admin-stat-label">Profile</span>
          <strong className="admin-stat-value">Live</strong>
          <span className="admin-stat-meta">Pulled from Redis on every visit</span>
        </LiquidGlass>
        <LiquidGlass className="admin-stat" interactive>
          <span className="admin-stat-label">Resume</span>
          <strong className="admin-stat-value">{resume.fileUrl ? 'Live' : 'Pending'}</strong>
          <span className="admin-stat-meta">{resume.fileName || 'Upload your latest PDF'}</span>
        </LiquidGlass>
        <LiquidGlass className="admin-stat" interactive>
          <span className="admin-stat-label">Projects</span>
          <strong className="admin-stat-value">{projects.length}</strong>
          <span className="admin-stat-meta">Shown on the public work page</span>
        </LiquidGlass>
        <LiquidGlass className="admin-stat" interactive>
          <span className="admin-stat-label">Certificates</span>
          <strong className="admin-stat-value">{certificates.length}</strong>
          <span className="admin-stat-meta">Uploaded and visible publicly</span>
        </LiquidGlass>
        <LiquidGlass className="admin-stat" interactive>
          <span className="admin-stat-label">Experience</span>
          <strong className="admin-stat-value">{experience.length}</strong>
          <span className="admin-stat-meta">Shown on the About page</span>
        </LiquidGlass>
      </div>

      <div className="admin-grid">

        {/* ── Projects ── */}
        <LiquidGlass className="admin-card admin-card--wide" interactive>
          <div className="card-topline">
            <div>
              <p className="sec-label">Projects</p>
              <h2 className="admin-card-title">{editingProject ? `Editing: ${editingProject.title}` : 'Add a project'}</h2>
            </div>
            <span className="admin-card-badge">{projects.length} live</span>
          </div>

          <form ref={projectFormRef} className="admin-form" onSubmit={saveProject}>
            <div className="form-grid">
              <label className="field-label">Title *
                <input className="field-input" required value={projectForm.title}
                  onChange={e => setProjectForm(p => ({ ...p, title: e.target.value }))} />
              </label>
              <label className="field-label">Slug (auto-generated)
                <input className="field-input" placeholder="my-project" value={projectForm.slug}
                  onChange={e => setProjectForm(p => ({ ...p, slug: e.target.value }))} />
              </label>
              <label className="field-label">Year *
                <input className="field-input" required value={projectForm.year}
                  onChange={e => setProjectForm(p => ({ ...p, year: e.target.value }))} />
              </label>
              <label className="field-label">Tags (comma separated)
                <input className="field-input" placeholder="React, Node, AI" value={projectForm.tags}
                  onChange={e => setProjectForm(p => ({ ...p, tags: e.target.value }))} />
              </label>
              <label className="field-label">GitHub URL
                <input className="field-input" type="url" value={projectForm.repoUrl}
                  onChange={e => setProjectForm(p => ({ ...p, repoUrl: e.target.value }))} />
              </label>
              <label className="field-label">Live URL
                <input className="field-input" type="url" value={projectForm.liveUrl}
                  onChange={e => setProjectForm(p => ({ ...p, liveUrl: e.target.value }))} />
              </label>
            </div>
            <label className="field-label">Description *
              <textarea required className="field-input field-textarea" value={projectForm.description}
                onChange={e => setProjectForm(p => ({ ...p, description: e.target.value }))} />
            </label>
            <p className="sec-label" style={{ marginTop: 4 }}>Features (up to 4)</p>
            <div className="form-grid">
              {([1,2,3,4] as const).map(n => (
                <div key={n} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input className="field-input" placeholder={`Feature ${n} title`}
                    value={projectForm[`feature${n}Title` as keyof typeof projectForm]}
                    onChange={e => setProjectForm(p => ({ ...p, [`feature${n}Title`]: e.target.value }))} />
                  <input className="field-input" placeholder="Description"
                    value={projectForm[`feature${n}Desc` as keyof typeof projectForm]}
                    onChange={e => setProjectForm(p => ({ ...p, [`feature${n}Desc`]: e.target.value }))} />
                </div>
              ))}
            </div>
            {projectStatus && <p className="admin-status">{projectStatus}</p>}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button type="submit" className="btn-submit" style={{ flex: 1 }}>
                {editingProject ? 'Update Project' : 'Create Project'}
              </button>
              {editingProject && (
                <button type="button" className="btn-ghost" style={{ minWidth: 110 }} onClick={clearProjectForm}>Cancel</button>
              )}
            </div>
          </form>

          <div className="admin-list">
            {projects.length === 0 && <p className="admin-empty">No projects yet.</p>}
            {projects.map(p => (
              <article key={p.id} className="admin-list-item">
                <div>
                  <span className="admin-preview-label">{p.index} · {p.year}</span>
                  <h3>{p.title}</h3>
                  <p>{p.description.slice(0, 90)}{p.description.length > 90 ? '…' : ''}</p>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                    {p.tags.map(t => <span key={t} className="project-tag">{t}</span>)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexDirection: 'column', flexShrink: 0 }}>
                  <button type="button" className="filter-btn" onClick={() => startEditProject(p)}>Edit</button>
                  <button type="button" className="filter-btn" onClick={() => deleteProjectById(p.id)}>Delete</button>
                </div>
              </article>
            ))}
          </div>
        </LiquidGlass>

        {/* ── Profile ── */}
        <LiquidGlass className="admin-card" interactive>
          <div className="card-topline">
            <div>
              <p className="sec-label">Public Profile</p>
              <h2 className="admin-card-title">Identity &amp; links</h2>
            </div>
            <span className="admin-card-badge">Redis</span>
          </div>

          <form className="admin-form" onSubmit={saveProfile}>
            <div className="form-grid">
              <label className="field-label">Hero label
                <input className="field-input" name="heroLabel" value={profile.heroLabel} onChange={fieldStateSetter(setProfile, 'heroLabel')} />
              </label>
              <label className="field-label">Name
                <input className="field-input" name="name" value={profile.name} onChange={fieldStateSetter(setProfile, 'name')} />
              </label>
              <label className="field-label">Role
                <input className="field-input" name="role" value={profile.role} onChange={fieldStateSetter(setProfile, 'role')} />
              </label>
              <label className="field-label">Headline
                <input className="field-input" name="headline" value={profile.headline} onChange={fieldStateSetter(setProfile, 'headline')} />
              </label>
              <label className="field-label">Location
                <input className="field-input" name="location" value={profile.location} onChange={fieldStateSetter(setProfile, 'location')} />
              </label>
              <label className="field-label">Availability
                <input className="field-input" name="availability" value={profile.availability} onChange={fieldStateSetter(setProfile, 'availability')} />
              </label>
              <label className="field-label">Email
                <input className="field-input" name="email" type="email" value={profile.email} onChange={fieldStateSetter(setProfile, 'email')} />
              </label>
              <label className="field-label">GitHub username
                <input className="field-input" name="githubUsername" value={profile.githubUsername} onChange={fieldStateSetter(setProfile, 'githubUsername')} />
              </label>
            </div>
            <label className="field-label">Bio
              <textarea className="field-input field-textarea" name="bio" value={profile.bio} onChange={fieldStateSetter(setProfile, 'bio')} />
            </label>
            <label className="field-label">Resume summary
              <textarea className="field-input field-textarea" name="resumeSummary" value={profile.resumeSummary} onChange={fieldStateSetter(setProfile, 'resumeSummary')} />
            </label>
            <div className="form-grid">
              <label className="field-label">LinkedIn
                <input className="field-input" name="linkedinUrl" value={profile.linkedinUrl} onChange={fieldStateSetter(setProfile, 'linkedinUrl')} />
              </label>
              <label className="field-label">GitHub
                <input className="field-input" name="githubUrl" value={profile.githubUrl} onChange={fieldStateSetter(setProfile, 'githubUrl')} />
              </label>
              <label className="field-label">X / Twitter
                <input className="field-input" name="xUrl" value={profile.xUrl} onChange={fieldStateSetter(setProfile, 'xUrl')} />
              </label>
              <label className="field-label">Buy me a coffee
                <input className="field-input" name="coffeeUrl" value={profile.coffeeUrl} onChange={fieldStateSetter(setProfile, 'coffeeUrl')} />
              </label>
            </div>
            {profileStatus && <p className="admin-status">{profileStatus}</p>}
            <button type="submit" className="btn-submit">Save Profile</button>
          </form>
        </LiquidGlass>

        {/* ── Resume ── */}
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
            <label className="field-label">Resume PDF
              <input className="field-input" name="resume" type="file" accept="application/pdf" />
            </label>
            {resumeStatus && <p className="admin-status">{resumeStatus}</p>}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button type="submit" className="btn-submit" style={{ flex: 1 }}>Upload Resume</button>
              {resume.fileUrl && (
                <button type="button" className="btn-ghost" style={{ color: 'rgba(255,100,100,0.8)' }}
                  onClick={removeResume}>
                  Remove Resume
                </button>
              )}
            </div>
          </form>
        </LiquidGlass>

        {/* ── Certificates ── */}
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
              <label className="field-label">Title
                <input className="field-input" name="title" placeholder="Certificate title" />
              </label>
              <label className="field-label">Issuer
                <input className="field-input" name="issuer" placeholder="Issuing platform" />
              </label>
              <label className="field-label">Year
                <input className="field-input" name="year" placeholder="2026" />
              </label>
              <label className="field-label">File
                <input className="field-input" name="file" type="file" accept="application/pdf,image/*" />
              </label>
            </div>
            <label className="field-label">Description
              <textarea className="field-input field-textarea" name="description" placeholder="Short note about this certificate." />
            </label>
            {certificateStatus && <p className="admin-status">{certificateStatus}</p>}
            <button type="submit" className="btn-submit">Add Certificate</button>
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
                    <a href={cert.fileUrl} target="_blank" rel="noreferrer" className="project-link">View file ↗</a>
                  )}
                </div>
                <button type="button" className="filter-btn" onClick={() => deleteCertificate(cert.id)}>Delete</button>
              </article>
            )) : (
              <p className="admin-empty">No certificates uploaded yet.</p>
            )}
          </div>
        </LiquidGlass>

        {/* ── Experience ── */}
        <TimelineAdmin
          label="Experience"
          endpoint="/api/admin/experience"
          items={experience}
          setItems={items => setExperience(items as ExperienceItem[])}
        />

        {/* ── Education ── */}
        <TimelineAdmin
          label="Education"
          endpoint="/api/admin/education"
          items={education}
          setItems={items => setEducation(items as EducationItem[])}
        />

      </div>
    </div>
  )
}
