import fs from 'fs/promises'
import path from 'path'
import { NextResponse } from 'next/server'
import { getPortfolioData } from '@/lib/portfolio'

function escapePdfText(text: string) {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\r?\n/g, ' ')
}

function wrapText(text: string, limit = 54) {
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let line = ''

  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (next.length > limit) {
      if (line) lines.push(line)
      line = word
    } else {
      line = next
    }
  }

  if (line) lines.push(line)
  return lines
}

function buildFallbackPdf(lines: string[]) {
  const contentParts = ['BT', '/F1 22 Tf', '72 760 Td']

  lines.forEach((line, index) => {
    const fontSize = index === 0 ? 22 : index === 1 ? 16 : 11
    const leading = index === 0 ? 28 : index === 1 ? 24 : 16
    if (index > 0) contentParts.push(`0 -${leading} Td`)
    contentParts.push(`/F1 ${fontSize} Tf`)
    contentParts.push(`(${escapePdfText(line)}) Tj`)
  })

  contentParts.push('ET')
  const content = contentParts.join('\n')

  const segments = [
    '%PDF-1.4\n',
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n',
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
    `5 0 obj\n<< /Length ${Buffer.byteLength(content, 'binary')} >>\nstream\n${content}\nendstream\nendobj\n`,
  ]

  let pdf = ''
  let cursor = 0
  const offsets = [0]

  segments.forEach((segment, index) => {
    if (index > 0) offsets.push(cursor)
    pdf += segment
    cursor += Buffer.byteLength(segment, 'binary')
  })

  const xrefStart = cursor
  let xref = `xref\n0 ${segments.length}\n0000000000 65535 f \n`

  for (let i = 1; i < offsets.length; i += 1) {
    xref += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`
  }

  const trailer = `trailer\n<< /Size ${segments.length} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`
  return Buffer.from(pdf + xref + trailer, 'binary')
}

export async function GET() {
  const { profile, resume } = await getPortfolioData()

  if (resume.fileUrl.startsWith('data:application/pdf;base64,')) {
    try {
      const base64Data = resume.fileUrl.split(',')[1]
      const file = Buffer.from(base64Data, 'base64')
      return new NextResponse(file, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${resume.fileName || 'resume.pdf'}"`,
        },
      })
    } catch (err) {
      console.error('[API/Resume] Error decoding Base64 from Redis:', err)
      // Fall through to fallback
    }
  }

  if (resume.fileUrl.startsWith('/uploads/resume/')) {
    try {
      const filePath = path.join(process.cwd(), 'public', resume.fileUrl)
      const file = await fs.readFile(filePath)
      return new NextResponse(file, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${resume.fileName || 'resume.pdf'}"`,
        },
      })
    } catch {
      // Fall through to generated PDF
    }
  }

  const lines = [
    profile.name,
    profile.headline,
    profile.role,
    profile.location,
    profile.email,
    '',
    ...wrapText(profile.bio, 62),
    '',
    ...wrapText(profile.resumeSummary, 62),
  ]

  const pdf = buildFallbackPdf(lines)
  return new NextResponse(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="Thamo-Resume.pdf"',
    },
  })
}
