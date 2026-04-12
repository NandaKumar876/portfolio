import path from 'path'
import fs from 'fs/promises'
import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/admin-auth'
import { updateResume } from '@/lib/portfolio'

function safeFilename(name: string) {
  return name
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9._-]/g, '')
    .replace(/-+/g, '-')
    .toLowerCase()
}

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('resume')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Resume file is required' }, { status: 400 })
  }

  if (!file.type.includes('pdf')) {
    return NextResponse.json({ error: 'Please upload a PDF resume' }, { status: 400 })
  }

  if (file.size > 15 * 1024 * 1024) {
    return NextResponse.json({ error: 'Resume file is too large' }, { status: 400 })
  }

  const fileName = `${Date.now()}-${safeFilename(file.name || 'resume.pdf')}`
  const targetDir = path.join(process.cwd(), 'public', 'uploads', 'resume')
  const targetPath = path.join(targetDir, fileName)

  await fs.mkdir(targetDir, { recursive: true })
  const buffer = Buffer.from(await file.arrayBuffer())
  await fs.writeFile(targetPath, buffer)

  const resume = await updateResume({
    fileUrl: `/uploads/resume/${fileName}`,
    fileName: file.name || fileName,
    uploadedAt: new Date().toISOString(),
    mimeType: file.type || 'application/pdf',
  })

  return NextResponse.json({ ok: true, resume: resume.resume })
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const updated = await updateResume({ fileUrl: '', fileName: '', uploadedAt: '', mimeType: '' })
  return NextResponse.json({ ok: true, resume: updated.resume })
}
