import { NextResponse } from 'next/server'
import { sendEmail, validateEmailConfig } from '@/lib/email'

export async function GET() {
  console.log('[TestEmailAPI] Test endpoint called.')
  
  const config = validateEmailConfig()
  
  try {
    const result = await sendEmail({
      subject: `[Portfolio Test] Test Email Delivery - ${new Date().toISOString()}`,
      text: 'This is a test email sent from the portfolio website contact form debug endpoint to verify email delivery is working correctly.',
      html: `
        <h3>Portfolio Test Email</h3>
        <p>This is a test email sent to verify that the contact form email delivery integration is working correctly.</p>
        <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Configured Provider:</strong> ${config.provider || 'None'}</p>
      `,
    })

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully!',
      provider: result.provider,
      info: result.data || result.info,
    })
  } catch (err: any) {
    console.error('[TestEmailAPI] Test email failed:', err)
    return NextResponse.json({
      success: false,
      message: 'Failed to send test email.',
      error: err.message || String(err),
      stack: err.stack,
      config,
    }, { status: 500 })
  }
}
