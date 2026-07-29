import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { saveContactSubmission } from '@/lib/contacts'
import { ContactSchema } from '@/lib/contact-types'
import { sendEmail } from '@/lib/email'

export async function POST(request: Request) {
  const timestamp = new Date().toISOString()
  console.log(`[API contact] Incoming request at ${timestamp}`)

  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ipAddress = forwardedFor?.split(',')[0].trim() || realIp || '127.0.0.1'

  try {
    const rawData = await request.json()
    console.log('[API contact] Received request payload:', JSON.stringify(rawData, null, 2))

    const result = ContactSchema.safeParse(rawData)
    if (!result.success) {
      const errors: Record<string, string> = {}
      result.error.issues.forEach(i => {
        errors[i.path[0] as string] = i.message
      })
      console.warn('[API contact] Validation failed:', errors)
      return NextResponse.json({ ok: false, errors }, { status: 400 })
    }

    const data = result.data
    const submissionId = randomUUID()
    const submission = {
      ...data,
      id: submissionId,
      createdAt: timestamp,
    }

    // 1. Save submission to database / content store
    console.log('[API contact] Saving submission to storage with ID:', submissionId)
    try {
      await saveContactSubmission(submission)
      console.log('[API contact] Database record saved successfully. ID:', submissionId)
    } catch (dbErr: any) {
      console.error('[API contact] Database save failed:', dbErr)
      return NextResponse.json(
        {
          ok: false,
          errors: { _global: 'Failed to save contact message. Please try again.' },
        },
        { status: 500 }
      )
    }

    // 2. Prepare email subject and body template according to specifications
    const formattedSubject = `New Contact Form Submission from ${data.name}`
    const submittedAtFormatted = new Date().toLocaleString('en-US', {
      timeZoneName: 'short',
    })

    const textBody = [
      `New Contact Form Submission from ${data.name}`,
      `==========================================`,
      `Name: ${data.name}`,
      `Email: ${data.email}`,
      `Phone: ${data.phone || 'Not provided'}`,
      `Company: ${data.company || 'Not provided'}`,
      `Inquiry Type: ${data.inquiryType}`,
      `Timeline: ${data.timeline}`,
      `Subject: ${data.subject}`,
      ``,
      `Message:`,
      `${data.message}`,
      ``,
      `------------------------------------------`,
      `Submitted at: ${submittedAtFormatted} (${timestamp})`,
      `IP Address: ${ipAddress}`,
    ].join('\n')

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #2563eb; margin-top: 0;">New Contact Form Submission</h2>
        <p>You have received a new contact inquiry from your portfolio website.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; width: 130px;">Name:</td>
            <td style="padding: 8px 0;">${data.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Email:</td>
            <td style="padding: 8px 0;"><a href="mailto:${data.email}">${data.email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Phone:</td>
            <td style="padding: 8px 0;">${data.phone || 'Not provided'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Company:</td>
            <td style="padding: 8px 0;">${data.company || 'Not provided'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Inquiry type:</td>
            <td style="padding: 8px 0;">${data.inquiryType}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Timeline:</td>
            <td style="padding: 8px 0;">${data.timeline}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Subject:</td>
            <td style="padding: 8px 0;">${data.subject}</td>
          </tr>
        </table>
        
        <div style="background-color: #f8fafc; padding: 16px; border-radius: 6px; border-left: 4px solid #2563eb; margin-bottom: 20px;">
          <h4 style="margin-top: 0; margin-bottom: 8px; color: #1e293b;">Message:</h4>
          <p style="white-space: pre-wrap; margin: 0; color: #334155;">${data.message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        
        <p style="font-size: 12px; color: #64748b; margin-bottom: 4px;">
          <strong>Submitted at:</strong> ${submittedAtFormatted} (${timestamp})
        </p>
        <p style="font-size: 12px; color: #64748b; margin-top: 0;">
          <strong>IP Address:</strong> ${ipAddress}
        </p>
      </div>
    `

    // 3. Attempt email delivery
    try {
      console.log(`[API contact] Initiating email send to admin for submission ID: ${submissionId}`)
      const emailResult = await sendEmail({
        replyTo: data.email,
        subject: formattedSubject,
        text: textBody,
        html: htmlBody,
      })

      console.log(`[API contact] Email notification delivered successfully for ID ${submissionId}:`, emailResult)
      return NextResponse.json({ ok: true, id: submissionId })
    } catch (emailErr: any) {
      console.error(`[API contact] Email delivery FAILED for submission ID ${submissionId}:`)
      console.error(emailErr?.stack || emailErr)

      return NextResponse.json({
        ok: true,
        id: submissionId,
        warning: 'Message saved successfully, but admin notification could not be sent.',
        emailError: emailErr?.message || String(emailErr),
      })
    }
  } catch (err: any) {
    console.error('[API contact] Unexpected controller error:', err?.stack || err)
    return NextResponse.json(
      {
        ok: false,
        errors: { _global: 'An unexpected server error occurred.' },
      },
      { status: 500 }
    )
  }
}
