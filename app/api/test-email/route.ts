import { NextResponse } from 'next/server'
import { sendEmail, validateEmailConfig } from '@/lib/email'

export async function GET() {
  console.log('[TestEmailAPI] Test endpoint called.')

  const config = validateEmailConfig()

  if (!config.valid) {
    return NextResponse.json(
      {
        success: false,
        message: 'Email service configuration invalid or incomplete.',
        config,
      },
      { status: 400 }
    )
  }

  try {
    const timestamp = new Date().toISOString()
    const result = await sendEmail({
      subject: `[Portfolio Test] Debug Email - ${timestamp}`,
      text: `This is a test email sent from the portfolio website contact form debug endpoint to verify email delivery.\nSent at: ${timestamp}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #3b82f6; border-radius: 8px;">
          <h3 style="color: #2563eb; margin-top: 0;">Portfolio Test Email</h3>
          <p>This is a test email sent to verify that contact form email notifications are working correctly.</p>
          <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Configured Provider:</strong> ${config.provider || 'None'}</p>
          <p><strong>Recipient:</strong> ${config.emailTo}</p>
          <p><strong>Sender:</strong> ${config.emailFrom}</p>
        </div>
      `,
    })

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully to ' + config.emailTo,
      provider: result.provider,
      recipient: config.emailTo,
      sender: config.emailFrom,
      info: result.data || result.info,
    })
  } catch (err: any) {
    console.error('[TestEmailAPI] Test email failed:', err)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to send test email.',
        error: err.message || String(err),
        stack: err.stack,
        config,
      },
      { status: 500 }
    )
  }
}
