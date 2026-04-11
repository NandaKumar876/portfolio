'use client'

type GlobalErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body style={{
        margin: 0,
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: 'linear-gradient(180deg, #060608 0%, #0a0b10 48%, #050507 100%)',
        color: 'rgba(255,255,255,0.9)',
        fontFamily: 'sans-serif',
        padding: '24px',
      }}>
        <main style={{ maxWidth: 560, width: '100%', textAlign: 'center' }}>
          <p style={{ letterSpacing: '0.16em', textTransform: 'uppercase', fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
            Application error
          </p>
          <h1 style={{ fontSize: 'clamp(40px, 7vw, 64px)', lineHeight: 1, margin: '12px 0 18px' }}>
            Something broke
          </h1>
          <p style={{ lineHeight: 1.8, color: 'rgba(255,255,255,0.6)', marginBottom: 24 }}>
            {error.message || 'An unexpected error occurred.'}
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              border: 0,
              borderRadius: 999,
              padding: '12px 24px',
              background: 'rgba(255,255,255,0.14)',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  )
}
