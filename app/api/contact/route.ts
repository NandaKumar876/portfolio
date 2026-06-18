import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { saveContactSubmission } from '@/lib/contacts'
import { ContactSchema } from '@/lib/contact-types'
import { sendEmail } from '@/lib/email'

export async function POST(request: Request) {
  console.log('API called')
  
  try {
    const rawData = await request.json()
    console.log('[API contact] Received data:', JSON.stringify(rawData, null, 2))

    const result = ContactSchema.safeParse(rawData)
    if (!result.success) {
      const errors: Record<string, string> = {}
      result.error.issues.forEach(i => {
        errors[i.path[0] as string] = i.message
      })
      console.warn('[API contact] Validation failed:', errors)
      return NextResponse.json({ ok: false, errors }, { status: 400 })
    }

    const submission = {
      ...result.data,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    }

    // Save submission first (guarantees inquiries are saved to fallback storage / Redis)
    console.log('[API contact] Saving submission to content store/fallback...')
    await saveContactSubmission(submission)
    console.log('[API contact] Submission stored successfully.')

    // Attempt to deliver the email
    try {
      console.log('[API contact] Sending email notification...')
      await sendEmail({
        replyTo: result.data.email,
        subject: `[Portfolio] ${result.data.subject}`,
        text: [
          `From: ${result.data.name} <${result.data.email}>`,
          result.data.company ? `Company: ${result.data.company}` : null,
          `Inquiry type: ${result.data.inquiryType}`,
          `Timeline: ${result.data.timeline}`,
          `Subject: ${result.data.subject}`,
          '',
          result.data.message,
        ].filter(Boolean).join('\n'),
        html: `
          <p><strong>From:</strong> ${result.data.name} &lt;${result.data.email}&gt;</p>
          ${result.data.company ? `<p><strong>Company:</strong> ${result.data.company}</p>` : ''}
          <p><strong>Inquiry type:</strong> ${result.data.inquiryType}</p>
          <p><strong>Timeline:</strong> ${result.data.timeline}</p>
          <p><strong>Subject:</strong> ${result.data.subject}</p>
          <hr />
          <p style="white-space:pre-wrap">${result.data.message.replace(/</g, '&lt;')}</p>
        `,
      })
    } catch (emailErr) {
      // Log the failure, but return ok: true because the user message was saved to backup storage (no silent loss)
      console.error('[API contact] Email notification failed but data is saved:', emailErr)
      return NextResponse.json({ 
        ok: true, 
        warning: 'Message saved but email notification failed.' 
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('[API contact] Unexpected handler error:', err)
    return NextResponse.json({ 
      ok: false, 
      errors: { _global: 'An unexpected server error occurred.' } 
    }, { status: 500 })
  }
}
