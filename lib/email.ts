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
  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER || process.env.EMAIL_USER || ''
  const smtpPass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASS || ''
  const smtpHost = process.env.SMTP_HOST || (smtpUser ? 'smtp.gmail.com' : '')

  const emailFrom = process.env.EMAIL_FROM || process.env.FROM_EMAIL || smtpUser || ''
  const emailTo = process.env.ADMIN_EMAIL || process.env.EMAIL_TO || process.env.NOTIFY_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || smtpUser || ''

  const smtpPortStr = process.env.SMTP_PORT
  const smtpPort = parseInt(smtpPortStr || '587', 10)

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
    const error = 'Neither Resend (RESEND_API_KEY) nor SMTP credentials (SMTP_HOST, SMTP_USER, SMTP_PASS/SMTP_PASSWORD) are set in Vercel Environment Variables.'
    console.error('[EmailConfig] ERROR:', error)
    return {
      valid: false,
      provider: null,
      error,
      details: {
        missingVars: [
          'ADMIN_EMAIL or NOTIFY_EMAIL',
          'SMTP_HOST (or smtp.gmail.com)',
          'SMTP_USER (or GMAIL_USER)',
          'SMTP_PASS (or GMAIL_APP_PASSWORD)',
        ],
      },
    }
  }

  if (!emailTo) {
    const error = 'Recipient admin email is not set. Please define ADMIN_EMAIL, EMAIL_TO, or NOTIFY_EMAIL in Vercel environment variables.'
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
    const rawUser = process.env.SMTP_USER || process.env.GMAIL_USER || process.env.EMAIL_USER || ''
    const rawPass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASS || ''
    
    // Automatically sanitize credentials (remove spaces from Google 16-char App Passwords and surrounding quotes)
    const smtpUser = rawUser.trim().replace(/^["']|["']$/g, '')
    const smtpPass = rawPass.trim().replace(/\s+/g, '').replace(/^["']|["']$/g, '')
    const smtpHost = (process.env.SMTP_HOST || 'smtp.gmail.com').trim().replace(/^["']|["']$/g, '')

    const userPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : null
    
    // Default ports to try: Port 465 (SSL) is preferred on Vercel/serverless because port 587/25 can be blocked by serverless firewalls.
    const portConfigs = userPort 
      ? [{ port: userPort, secure: process.env.SMTP_SECURE !== undefined ? (process.env.SMTP_SECURE === 'true' || process.env.SMTP_SECURE === '1') : userPort === 465 }]
      : [
          { port: 465, secure: true },
          { port: 587, secure: false },
        ]

    let lastError: any = null

    for (const configAttempt of portConfigs) {
      console.log(`[EmailConfig] Trying SMTP connection on host: ${smtpHost}, port: ${configAttempt.port}, secure: ${configAttempt.secure}...`)

      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: configAttempt.port,
          secure: configAttempt.secure,
          auth: { user: smtpUser, pass: smtpPass },
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 15000,
          tls: {
            rejectUnauthorized: false,
          },
        })

        console.log('[EmailConfig] Verifying SMTP connection...')
        await transporter.verify()
        console.log('[EmailConfig] SMTP Transporter connection verified successfully!')

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
      } catch (attemptErr: any) {
        console.warn(`[EmailConfig] SMTP attempt failed on port ${configAttempt.port}:`, attemptErr?.message || attemptErr)
        lastError = attemptErr
      }
    }

    console.error('[EmailConfig] All SMTP delivery attempts failed:', lastError)
    throw new Error(`SMTP Delivery Failed: ${lastError?.message || String(lastError)}`)
  }
}
