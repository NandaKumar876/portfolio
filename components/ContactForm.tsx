'use client'

import { useState, useEffect } from 'react'
import { LiquidGlass } from './LiquidGlass'
import {
  INQUIRY_TYPES,
  TIMELINE_OPTIONS,
} from '@/lib/contact-types'
import type { ActionResult } from '@/lib/contact-types'

interface ToastMessage {
  type: 'success' | 'error' | 'warning'
  text: string
}

export function ContactForm() {
  const [state, setState] = useState<ActionResult | null>(null)
  const [pending, setPending] = useState(false)
  const [toast, setToast] = useState<ToastMessage | null>(null)

  // Auto-dismiss toast after 5 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  function err(key: string) {
    if (!state || state.ok || !state.errors) return null
    return state.errors[key] ? (
      <span className="field-error">{state.errors[key]}</span>
    ) : null
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setState(null)
    console.log('Form submitted')

    const formData = new FormData(e.currentTarget)
    const payload = {
      name: formData.get('name'),
      email: formData.get('email'),
      company: formData.get('company'),
      inquiryType: formData.get('inquiryType'),
      timeline: formData.get('timeline'),
      subject: formData.get('subject'),
      message: formData.get('message'),
    }

    console.log('Email payload:', JSON.stringify(payload, null, 2))

    try {
      console.log('API called')
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      console.log('[ContactForm] API response received:', data)

      if (res.ok) {
        if (data.warning) {
          // Message saved but email sending failed
          setState({ ok: true })
          setToast({
            type: 'warning',
            text: 'Message stored in DB, but email notification failed.',
          })
          console.warn('[ContactForm] Message saved but email notification failed.')
        } else {
          // Success
          setState({ ok: true })
          setToast({
            type: 'success',
            text: 'Your message has been sent successfully!',
          })
          console.log('Email sent successfully')
        }
      } else {
        // Validation or server error
        setState(data)
        setToast({
          type: 'error',
          text: data.errors?._global || 'Please correct the errors and try again.',
        })
        console.error('Email failed:', data.errors)
      }
    } catch (err: any) {
      console.error('Email failed:', err)
      setState({
        ok: false,
        errors: {
          _global: 'A network error occurred. Please check your connection and try again.',
        },
      })
      setToast({
        type: 'error',
        text: 'Network error. Failed to reach the server.',
      })
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      {/* ─── Floating Toast Notification ─── */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 20px',
            borderRadius: '12px',
            background: 'rgba(23, 23, 23, 0.85)',
            backdropFilter: 'blur(16px)',
            border: `1px solid ${
              toast.type === 'success'
                ? 'rgba(74, 222, 128, 0.25)'
                : toast.type === 'warning'
                ? 'rgba(251, 191, 36, 0.25)'
                : 'rgba(248, 113, 113, 0.25)'
            }`,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)',
            color: '#f5f5f5',
            fontFamily: 'var(--font-sans, sans-serif)',
            fontSize: '14px',
            animation: 'toast-slide-in 0.3s ease-out',
            maxWidth: '380px',
          }}
        >
          {/* Icon */}
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background:
                toast.type === 'success'
                  ? 'rgba(34, 197, 94, 0.2)'
                  : toast.type === 'warning'
                  ? 'rgba(234, 179, 8, 0.2)'
                  : 'rgba(239, 68, 68, 0.2)',
              color:
                toast.type === 'success'
                  ? '#4ade80'
                  : toast.type === 'warning'
                  ? '#fbbf24'
                  : '#f87171',
              fontWeight: 'bold',
              fontSize: '12px',
            }}
          >
            {toast.type === 'success' ? '✓' : toast.type === 'warning' ? '!' : '✗'}
          </span>
          <div style={{ flex: 1 }}>{toast.text}</div>
          <button
            onClick={() => setToast(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#a3a3a3',
              cursor: 'pointer',
              fontSize: '16px',
              padding: '0 4px',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* CSS animation inline for portability */}
      <style jsx global>{`
        @keyframes toast-slide-in {
          from {
            transform: translateY(24px) scale(0.95);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
      `}</style>

      <LiquidGlass className="contact-form">
        {state?.ok ? (
          <div className="form-success">
            <span className="success-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
                <path d="M5 12.5l4 4L19 7" />
              </svg>
            </span>
            <h3 className="success-title">Message Received</h3>
            <p className="success-body">
              Thank you for sending the brief. I&apos;ll review it and reply within 24-48 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="contact-brief-intro">
              <p className="contact-brief-title">Project brief</p>
              <p className="contact-brief-copy">
                A few structured details help me reply with a clearer next step instead of a generic email.
              </p>
            </div>

            <div className="form-row-2">
              <div className="form-field">
                <label className="field-label" htmlFor="contact-name">Name</label>
                <input id="contact-name" className="field-input" name="name" placeholder="Your name" required />
                {err('name')}
              </div>
              <div className="form-field">
                <label className="field-label" htmlFor="contact-email">Email</label>
                <input id="contact-email" className="field-input" name="email" placeholder="you@email.com" type="email" required />
                {err('email')}
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-field">
                <label className="field-label" htmlFor="contact-company">Company</label>
                <input id="contact-company" className="field-input" name="company" placeholder="Company or team name" />
                {err('company')}
              </div>
              <div className="form-field">
                <label className="field-label" htmlFor="contact-inquiry-type">Inquiry type</label>
                <select id="contact-inquiry-type" className="field-input" name="inquiryType" defaultValue="" required>
                  <option value="" disabled>Select the kind of work</option>
                  {INQUIRY_TYPES.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
                {err('inquiryType')}
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-field">
                <label className="field-label" htmlFor="contact-timeline">Timeline</label>
                <select id="contact-timeline" className="field-input" name="timeline" defaultValue="" required>
                  <option value="" disabled>Select a timeline</option>
                  {TIMELINE_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
                {err('timeline')}
              </div>
              <div className="form-field">
                <label className="field-label" htmlFor="contact-subject">Subject</label>
                <input id="contact-subject" className="field-input" name="subject" placeholder="Build for a launch, consulting request, redesign…" required />
                {err('subject')}
              </div>
            </div>

            <div className="form-field">
              <label className="field-label" htmlFor="contact-message">Message</label>
              <textarea
                id="contact-message"
                className="field-input field-textarea"
                name="message"
                placeholder="What are you building, what problem needs solving, and what constraints should I know about?"
                required
              />
              {err('message')}
            </div>

            {state && !state.ok && (
              <p className="form-error-global">
                {state.errors?._global || (!Object.keys(state.errors ?? {}).length && "Something went wrong. Please try again.")}
              </p>
            )}

            <button type="submit" className="btn-submit" disabled={pending}>
              {pending ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        )}
      </LiquidGlass>
    </>
  )
}
