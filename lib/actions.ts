'use server'

import { z } from 'zod'
import fs   from 'fs/promises'
import path from 'path'

/* ── Schema ── */
export const ContactSchema = z.object({
  name:    z.string().min(1,  'Name is required'),
  email:   z.string().email( 'Valid email required'),
  subject: z.string().min(1,  'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})
export type ContactData = z.infer<typeof ContactSchema>

export type ActionResult =
  | { ok: true }
  | { ok: false; errors: Record<string, string> }

/* ── Server Action ── */
export async function submitContact(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    name:    formData.get('name'),
    email:   formData.get('email'),
    subject: formData.get('subject'),
    message: formData.get('message'),
  }

  const result = ContactSchema.safeParse(raw)
  if (!result.success) {
    const errors: Record<string, string> = {}
    result.error.issues.forEach(i => { errors[i.path[0] as string] = i.message })
    return { ok: false, errors }
  }

  /* Persist to /data/contacts.json */
  const dir      = path.join(process.cwd(), 'data')
  const filePath = path.join(dir, 'contacts.json')
  await fs.mkdir(dir, { recursive: true })

  let contacts: (ContactData & { id: number; createdAt: string })[] = []
  try {
    contacts = JSON.parse(await fs.readFile(filePath, 'utf-8'))
  } catch { /* first entry */ }

  contacts.push({ ...result.data, id: Date.now(), createdAt: new Date().toISOString() })
  await fs.writeFile(filePath, JSON.stringify(contacts, null, 2), 'utf-8')

  /* Optional: email notification — uncomment + add .env values
  const nodemailer = (await import('nodemailer')).default
  const t = nodemailer.createTransport({
    host: process.env.SMTP_HOST, port: 587,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })
  await t.sendMail({
    from: `"Portfolio" <${process.env.SMTP_USER}>`,
    to:   process.env.NOTIFY_EMAIL,
    subject: `[Portfolio] ${result.data.subject}`,
    text: `From: ${result.data.name} <${result.data.email}>\n\n${result.data.message}`,
  })
  */

  return { ok: true }
}
