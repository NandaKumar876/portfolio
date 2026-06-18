import nodemailer from 'nodemailer'

interface EmailOptions {
  from?: string
  to?: string
  replyTo?: string
  subject: string
  text: string
  html: string
}

/**
 * Validates the loaded environment variables and logs warnings/errors.
 */
export function validateEmailConfig() {
  const resendKey = process.env.RESEND_API_KEY
  const emailFrom = process.env.EMAIL_FROM
  const emailTo = process.env.EMAIL_TO || process.env.NOTIFY_EMAIL

  const smtpHost = process.env.SMTP_HOST
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS

  console.log('[EmailConfig] Checking email configuration...')

  const hasResend = !!resendKey
  const hasSMTP = !!(smtpHost && smtpUser && smtpPass)

  if (!hasResend && !hasSMTP) {
    console.error('[EmailConfig] ERROR: Neither Resend nor SMTP configuration environment variables are set!')
    console.error('[EmailConfig] Missing variables: Need either (RESEND_API_KEY) OR (SMTP_HOST, SMTP_USER, SMTP_PASSWORD/SMTP_PASS).')
    return { valid: false, provider: null }
  }

  if (hasResend) {
    if (!emailFrom) {
      console.warn('[EmailConfig] WARNING: RESEND_API_KEY is configured but EMAIL_FROM is missing. Using default fallback.')
    }
    if (!emailTo) {
      console.warn('[EmailConfig] WARNING: RESEND_API_KEY is configured but EMAIL_TO (or NOTIFY_EMAIL) is missing.')
    }
    console.log('[EmailConfig] Resend provider is configured.')
    return { valid: true, provider: 'resend' }
  }

  if (hasSMTP) {
    console.log('[EmailConfig] SMTP provider is configured.')
    return { valid: true, provider: 'smtp' }
  }

  return { valid: false, provider: null }
}

/**
 * Sends an email using either Resend or Nodemailer SMTP based on environment configuration.
 */
export async function sendEmail(options: EmailOptions) {
  const { valid, provider } = validateEmailConfig()

  if (!valid) {
    const errorMsg = 'Email service is not configured correctly. Check environment variables.'
    console.error('[EmailConfig] Email failed:', errorMsg)
    throw new Error(errorMsg)
  }

  const emailFrom = options.from || process.env.EMAIL_FROM || process.env.SMTP_USER || 'no-reply@portfolio.dev'
  const emailTo = options.to || process.env.EMAIL_TO || process.env.NOTIFY_EMAIL

  if (!emailTo) {
    const errorMsg = 'Recipient email (EMAIL_TO or NOTIFY_EMAIL) is not configured.'
    console.error('[EmailConfig] Email failed:', errorMsg)
    throw new Error(errorMsg)
  }

  const payload = {
    from: emailFrom,
    to: emailTo,
    replyTo: options.replyTo,
    subject: options.subject,
    text: options.text,
    html: options.html,
  }

  console.log('Email payload:', JSON.stringify(payload, null, 2))

  if (provider === 'resend') {
    const resendKey = process.env.RESEND_API_KEY!
    console.log('[EmailConfig] Attempting delivery via Resend API...')
    
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: emailFrom,
          to: emailTo,
          reply_to: options.replyTo,
          subject: options.subject,
          text: options.text,
          html: options.html,
        }),
      })

      const data = await response.json() as any
      console.log('[EmailConfig] Resend Response:', JSON.stringify(data, null, 2))

      if (!response.ok) {
        throw new Error(data?.message || `HTTP error ${response.status}`)
      }

      console.log('Email sent successfully')
      return { success: true, provider: 'resend', data }
    } catch (err: any) {
      console.error('Email failed:', err)
      throw err
    }
  } else {
    // SMTP Nodemailer
    const smtpHost = process.env.SMTP_HOST!
    const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10)
    const smtpUser = process.env.SMTP_USER!
    const smtpPass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS!

    console.log('[EmailConfig] Attempting delivery via Nodemailer SMTP...')
    
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
      })

      // Test the SMTP connection
      console.log('[EmailConfig] Verifying SMTP connection...')
      await transporter.verify()
      console.log('[EmailConfig] SMTP transport verification result: SUCCESS')

      const info = await transporter.sendMail({
        from: emailFrom,
        to: emailTo,
        replyTo: options.replyTo,
        subject: options.subject,
        text: options.text,
        html: options.html,
      })

      console.log('[EmailConfig] Nodemailer Response:', JSON.stringify(info, null, 2))
      console.log('Email sent successfully')
      return { success: true, provider: 'smtp', info }
    } catch (err: any) {
      console.error('Email failed:', err)
      throw err
    }
  }
}
