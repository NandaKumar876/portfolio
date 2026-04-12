import type { Metadata } from 'next'
import { Nav }           from '@/components/Nav'
import '@/app/globals.css'

export const metadata: Metadata = {
  title: 'Thamo — Developer',
  description: 'Liquid glass portfolio for Thamo, a full stack developer in Chennai.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <script dangerouslySetInnerHTML={{ __html: `
          window.addEventListener('unhandledrejection', function(event) {
            if (event.reason && (
              event.reason.message?.includes('MetaMask') || 
              event.reason.code === 4001 ||
              event.reason.toString().includes('MetaMask')
            )) {
              event.preventDefault();
            }
          });
        `}} />
      </head>
      <body>
        <Nav />
        <main>{children}</main>
        <footer className="footer">
          Thamo &nbsp;·&nbsp; Chennai, India
        </footer>
      </body>
    </html>
  )
}
