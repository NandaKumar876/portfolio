import path from 'path'
import fs from 'fs/promises'
import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/admin-auth'
import { addCertificate, getPortfolioData, removeCertificate } from '@/lib/portfolio'

function safeFilename(name: string) {
  return name
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9._-]/g, '')
    .replace(/-+/g, '-')
    .toLowerCase()
}

async function storeUpload(file: File, folder: string) {
  const fileName = `${Date.now()}-${safeFilename(file.name || 'certificate')}`
  const targetDir = path.join(process.cwd(), 'public', 'uploads', folder)
  const targetPath = path.join(targetDir, fileName)

  await fs.mkdir(targetDir, { recursive: true })
  const buffer = Buffer.from(await file.arrayBuffer())
  await fs.writeFile(targetPath, buffer)

  return {
    fileName: file.name || fileName,
    fileUrl: `/uploads/${folder}/${fileName}`,
    targetPath,
  }
}

export async function GET(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const content = await getPortfolioData()
  return NextResponse.json({ certificates: content.certificates })
}

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const title = String(formData.get('title') ?? '').trim()
  const issuer = String(formData.get('issuer') ?? '').trim()
  const year = String(formData.get('year') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const file = formData.get('file')

  if (!title || !issuer || !year) {
    return NextResponse.json({ error: 'Title, issuer, and year are required' }, { status: 400 })
  }

  let fileUrl: string | undefined
  let fileName: string | undefined

  if (file instanceof File && file.size > 0) {
    if (file.size > 12 * 1024 * 1024) {
      return NextResponse.json({ error: 'Certificate file is too large' }, { status: 400 })
    }

    const stored = await storeUpload(file, 'certificates')
    fileUrl = stored.fileUrl
    fileName = stored.fileName
  }

  const certificate = await addCertificate({
    id: randomUUID(),
    title,
    issuer,
    year,
    description: description || undefined,
    fileUrl,
    fileName,
    uploadedAt: new Date().toISOString(),
  })

  return NextResponse.json({ ok: true, certificate: certificate.certificates[0] })
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const id = request.nextUrl.searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'Certificate id is required' }, { status: 400 })
  }

  const content = await getPortfolioData()
  const target = content.certificates.find(cert => cert.id === id)
  if (target?.fileUrl) {
    const filePath = path.join(process.cwd(), 'public', target.fileUrl)
    await fs.unlink(filePath).catch(() => undefined)
  }

  await removeCertificate(id)
  return NextResponse.json({ ok: true })
}

