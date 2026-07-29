import nodemailer from 'nodemailer'

export interface EmailOptions {
  from?: string
  to?: string
  replyTo?: string
  subject: string
  text: string
  html: string
}

export interface EmailConfigValidation {
  valid: boolean
  provider: 'resend' | 'smtp' | null
  emailFrom?: string
  emailTo?: string
  error?: string
  details?: Record<string, any>
}

/**
 * Validates the loaded environment variables and logs warnings/errors.
 */
export function validateEmailConfig(): EmailConfigValidation {
  const resendKey = process.env.RESEND_API_KEY
  const emailFrom = process.env.EMAIL_FROM || process.env.FROM_EMAIL || process.env.SMTP_USER || ''
  const emailTo = process.env.ADMIN_EMAIL || process.env.EMAIL_TO || process.env.NOTIFY_EMAIL || ''

  const smtpHost = process.env.SMTP_HOST
  const smtpPortStr = process.env.SMTP_PORT
  const smtpPort = parseInt(smtpPortStr || '587', 10)
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS

  let smtpSecure: boolean
  if (process.env.SMTP_SECURE !== undefined) {
    smtpSecure = process.env.SMTP_SECURE === 'true' || process.env.SMTP_SECURE === '1'
  } else {
    smtpSecure = smtpPort === 465
  }

  const hasResend = !!resendKey
  const hasSMTP = !!(smtpHost && smtpUser && smtpPass)

  console.log('[EmailConfig] Checking environment variables...')
  console.log('[EmailConfig] Config state:', {
    hasResend,
    hasSMTP,
    smtpHost: smtpHost || 'not set',
    smtpPort,
    smtpSecure,
    smtpUser: smtpUser || 'not set',
    smtpPassSet: !!smtpPass,
    emailFrom: emailFrom || 'not set',
    emailTo: emailTo || 'not set',
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'not set',
    EMAIL_TO: process.env.EMAIL_TO || 'not set',
    NOTIFY_EMAIL: process.env.NOTIFY_EMAIL || 'not set',
  })

  if (!hasResend && !hasSMTP) {
    const error = 'Neither Resend (RESEND_API_KEY) nor SMTP (SMTP_HOST, SMTP_USER, SMTP_PASS/SMTP_PASSWORD) is configured.'
    console.error('[EmailConfig] ERROR:', error)
    return { valid: false, provider: null, error }
  }

  if (!emailTo) {
    const error = 'Recipient admin email is not set. Please define ADMIN_EMAIL, EMAIL_TO, or NOTIFY_EMAIL in environment variables.'
    console.error('[EmailConfig] ERROR:', error)
    return { valid: false, provider: hasResend ? 'resend' : 'smtp', error }
  }

  if (hasResend) {
    console.log('[EmailConfig] Resend provider is configured.')
    return {
      valid: true,
      provider: 'resend',
      emailFrom: emailFrom || 'onboarding@resend.dev',
      emailTo,
    }
  }

  console.log('[EmailConfig] SMTP provider is configured.')
  return {
    valid: true,
    provider: 'smtp',
    emailFrom: emailFrom || smtpUser || 'no-reply@portfolio.dev',
    emailTo,
  }
}

/**
 * Sends an email using either Resend or Nodemailer SMTP based on environment configuration.
 */
export async function sendEmail(options: EmailOptions) {
  const config = validateEmailConfig()

  if (!config.valid) {
    const errorMsg = config.error || 'Email service is not configured correctly.'
    console.error('[EmailConfig] Email failed:', errorMsg)
    throw new Error(errorMsg)
  }

  const emailFrom = options.from || config.emailFrom
  const emailTo = options.to || config.emailTo

  if (!emailTo) {
    const errorMsg = 'Recipient admin email is not configured.'
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

  console.log('[EmailConfig] Attempting email delivery with payload:', {
    provider: config.provider,
    from: payload.from,
    to: payload.to,
    replyTo: payload.replyTo,
    subject: payload.subject,
  })

  if (config.provider === 'resend') {
    const resendKey = process.env.RESEND_API_KEY!
    console.log('[EmailConfig] Dispatching request to Resend API...')

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

      const data = (await response.json()) as any
      console.log('[EmailConfig] Resend API Response:', JSON.stringify(data, null, 2))

      if (!response.ok) {
        const errorDetail = data?.message || data?.error || `Resend HTTP Error ${response.status}`
        throw new Error(`Resend Delivery Failed: ${errorDetail}`)
      }

      console.log('[EmailConfig] Resend Email delivered successfully. ID:', data.id)
      return { success: true, provider: 'resend', data }
    } catch (err: any) {
      console.error('[EmailConfig] Resend send error:', err)
      throw err
    }
  } else {
    // SMTP Nodemailer
    const smtpHost = process.env.SMTP_HOST!
    const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10)
    const smtpUser = process.env.SMTP_USER!
    const smtpPass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS!

    let smtpSecure: boolean
    if (process.env.SMTP_SECURE !== undefined) {
      smtpSecure = process.env.SMTP_SECURE === 'true' || process.env.SMTP_SECURE === '1'
    } else {
      smtpSecure = smtpPort === 465
    }

    console.log('[EmailConfig] Initializing Nodemailer SMTP Transporter:', {
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      user: smtpUser,
    })

    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: { user: smtpUser, pass: smtpPass },
        tls: {
          rejectUnauthorized: process.env.NODE_ENV === 'production',
        },
      })

      console.log('[EmailConfig] Verifying SMTP connection...')
      await transporter.verify()
      console.log('[EmailConfig] SMTP Transporter connection verified.')

      const info = await transporter.sendMail({
        from: emailFrom,
        to: emailTo,
        replyTo: options.replyTo,
        subject: options.subject,
        text: options.text,
        html: options.html,
      })

      console.log('[EmailConfig] SMTP Email delivered successfully. Message ID:', info.messageId)
      console.log('[EmailConfig] SMTP Response:', info.response)

      return { success: true, provider: 'smtp', info }
    } catch (err: any) {
      console.error('[EmailConfig] SMTP send error:', err)
      throw new Error(`SMTP Delivery Failed: ${err.message || String(err)}`)
    }
  }
}
