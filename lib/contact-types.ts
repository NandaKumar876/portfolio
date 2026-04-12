import { z } from 'zod'

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
