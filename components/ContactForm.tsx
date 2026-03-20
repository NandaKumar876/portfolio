'use client'

import { useActionState, useRef } from 'react'
import { LiquidGlass }     from './LiquidGlass'
import { submitContact }   from '@/lib/actions'
import type { ActionResult } from '@/lib/actions'

const init: ActionResult | null = null

export function ContactForm() {
  const [state, action, pending] = useActionState(submitContact, init)
  const formRef = useRef<HTMLFormElement>(null)

  function err(key: string) {
    if (!state || state.ok || !state.errors) return null
    return state.errors[key] ? (
      <span className="field-error">{state.errors[key]}</span>
    ) : null
  }

  return (
    <LiquidGlass className="contact-form">
      {state?.ok ? (
        <div className="form-success">
          <span className="success-icon">✓</span>
          <h3 className="success-title">Message Received</h3>
          <p className="success-body">
            Thank you for reaching out. I'll be in touch within 24–48 hours.
          </p>
        </div>
      ) : (
        <form ref={formRef} action={action} noValidate>
          <div className="form-row-2">
            <div className="form-field">
              <label className="field-label">Name</label>
              <input  className="field-input" name="name"    placeholder="Your name"       required />
              {err('name')}
            </div>
            <div className="form-field">
              <label className="field-label">Email</label>
              <input  className="field-input" name="email"   placeholder="you@email.com" type="email" required />
              {err('email')}
            </div>
          </div>

          <div className="form-field">
            <label className="field-label">Subject</label>
            <input  className="field-input" name="subject" placeholder="Project inquiry, consultation…" required />
            {err('subject')}
          </div>

          <div className="form-field">
            <label className="field-label">Message</label>
            <textarea className="field-input field-textarea" name="message" placeholder="Tell me about your project…" required />
            {err('message')}
          </div>

          {state && !state.ok && !Object.keys(state.errors ?? {}).length && (
            <p className="form-error-global">Something went wrong. Please try again.</p>
          )}

          <button type="submit" className="btn-submit" disabled={pending}>
            {pending ? 'Sending…' : 'Send Message'}
          </button>
        </form>
      )}
    </LiquidGlass>
  )
}
